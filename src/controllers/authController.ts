import bcrypt from 'bcrypt';
import { addHours, isAfter } from 'date-fns';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Resend } from 'resend';
import { prisma } from '../prismaClient';
import AppError from '../utils/AppError';
import { sendResetEmail as sendResetEmailUtil, sendVerificationEmail } from '../utils/emailService';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  generateToken, 
  verifyRefreshToken, 
  verifyToken,
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS 
} from '../utils/jwtService';
import { sendOtp } from '../utils/otpService';
import { loginUserSchema, registerUserSchema, AddmoredetailsSchema } from '../validations/authValidator';

const resend = new Resend(process.env.RESEND_API_KEY);

// Cookie options for secure HTTP-only cookies
const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  domain: process.env.NODE_ENV === 'production' 
    ? 'prod.nxchamp.com'
    : 'localhost',
  path: '/',
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
};


//generate otp
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);
    const { name, phoneNumber, password, confirmPassword } = validatedData;


    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Passwords do not match"
      });
    }

    // Check if the phone number already exists
    const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existingUser) {
      return next(new AppError('Phone number already exists', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        password: hashedPassword,
        phoneNumberVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Generate and send OTP
    const otp = generateOTP();
    await sendOtp(phoneNumber, otp);

    // Save OTP to database (expires in 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await prisma.otp.create({ data: { phoneNumber, otp, expiresAt } });

    return res.status(201).json({ 
      message: 'User registered successfully. Please verify your phone number.', 
      user: { id: user.id, name: user.name, phoneNumber: user.phoneNumber, otp }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      return next(new AppError(error.message, 400));
    }
    return next(new AppError('An error occurred during registration', 500));
  }
};

export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return next(new AppError('Email is already verified', 400));
    }

    // Generate a verification token
    const verificationToken = generateToken(user.id);

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return next(new AppError('An error occurred while sending verification email', 500));
  }
};

//verify the email via token 
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect(`${process.env.FRONTEND_APP_URL}/Unverified-email?success=false`);
  }

  try {
    // Verify the token and assert the type
    const decoded = verifyToken(token as string);
    if (!decoded || typeof decoded === 'string') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Update user to set email as verified
    await prisma.user.update({
      where: { id: decoded.id }, 
      data: { emailVerified: true },
    });

    // Redirect to frontend with success message
    return res.redirect(`${process.env.FRONTEND_APP_URL}/verified-email?success=true`);
  } catch (error) {
    console.error('Error during email verification:', error);
    return res.redirect(`${process.env.FRONTEND_APP_URL}/Unverified-email?success=false`);
  }
};

//loged in
export const login = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = loginUserSchema.parse(req.body);

    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'User not found with this phone number' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }

    // Check if phone number is verified
    if (!user.phoneNumberVerified) {
      return res.status(401).json({
        status: "error",
        message: "Phone number is not verified"
      });
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    // Calculate token expiration times
    const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000);
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000);

    // Save refresh token in the database
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      }
    });

    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);  
    

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          email: user.email
        },
        accessToken,
        refreshToken,
        accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
        refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
        refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Login failed' });
  }
};

// Refresh token endpoint
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || typeof decoded === 'string') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Check if the refresh token exists in the database
    const session = await prisma.session.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.id,
      },
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(decoded.id);
    
    // Calculate token expiration time
    const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000);

    // Set new access token in HTTP-only cookie
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    return res.status(200).json({ 
      message: 'Access token refreshed successfully',
      accessToken,
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      accessTokenExpiresAt: accessTokenExpiresAt.toISOString()
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Logout endpoint
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Delete the session from the database
      await prisma.session.deleteMany({
        where: {
          token: refreshToken,
        },
      });
    }

    // Clear cookies properly
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' 
        ? process.env.COOKIE_DOMAIN 
        : 'localhost',
      path: '/',
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' 
        ? process.env.COOKIE_DOMAIN 
        : 'localhost',
      path: '/',
    });

    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' 
        ? process.env.COOKIE_DOMAIN 
        : 'localhost',
      path: '/',
    })

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Logout failed" });
  }
};


//after user logedIn add more details
export const updateUserDetails = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.id;
    
    // Validate request body
    const validatedData = AddmoredetailsSchema.parse(req.body);

    const { email, dob, gender, city, primaryPosition, preferredFoot, message, image,  } = validatedData;

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: "Email is already registered with another account" });
    }

    // Update user details
    const data = await prisma.user.update({
      where: { id: userId },
      data: { 
        email,
        emailVerified: false,
        dob: new Date(dob), 
        gender, 
        city,
        primaryPosition,
        preferredFoot,
        message,
        image
      },
    });

    // Generate verification token
    const verificationToken = generateToken(userId);

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ message: "User details updated. Verification email sent", data: data });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating user details:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    res.status(500).json({ message: "Error updating user details" });
  }
};

//send otp to phone number
export const sendOtpToPhone = async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    await sendOtp(phoneNumber, otp); // Send OTP using fast2sms

    // Save OTP to the database with an expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    await prisma.otp.create({
      data: {
        phoneNumber,
        otp,
        expiresAt,
      },
    });

    console.log(`OTP ${otp} sent to phone number ${phoneNumber}`);
    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;

  try {
    // Find the OTP record
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phoneNumber,
        otp,
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if the OTP has expired
    if (isAfter(new Date(), otpRecord.expiresAt)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's phone number verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneNumberVerified: true },
    });

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    // Calculate token expiration times
    const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000);
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000);

    // Store refresh token in the database
    await prisma.session.create({
      data: {
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Delete the OTP record
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return res.status(200).json({ 
      message: 'Phone number verified and logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber
      },
      accessToken,
      refreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
      refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString()
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
};



export const sendResetEmailController = async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        status: "error",
        message: "phoneNumber is required"
      });
    }
    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate OTP for password reset
    const otp = generateOTP();

    // // Generate a reset token and set expiration time
    // const resetToken = generateToken(user.id);
    const expiresAt = addHours(new Date(), 1); // Token expires in 1 hour

    await prisma.otp.create({ 
      data: { 
        phoneNumber, 
        otp, 
        expiresAt,
        type: 'PASSWORD_RESET'
      } 
    });

    // Send OTP via SMS
    await sendOtp(phoneNumber, otp);

    return res.status(200).json({ 
      message: 'Password reset OTP sent to your phone number',
      phoneNumber
    });

  } catch (error) {
    console.error('Error sending reset email:', error);
    return next(new AppError('An error occurred while sending reset email', 500));
  }
};



export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    // Find user by reset token
    const { phoneNumber, otp, newPassword, confirmPassword } = req.body;

    if (!phoneNumber || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Phone number, OTP, new password, and confirm password are required"
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Passwords do not match"
      });
    }

    const otpRecord = await prisma.otp.findFirst({
      where: {
        phoneNumber,
        otp,
        type: 'PASSWORD_RESET'
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if the OTP has expired
    if (isAfter(new Date(), otpRecord.expiresAt)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    // Delete the OTP record
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });
    
    
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return next(new AppError('An error occurred while resetting the password', 500));
  }
};


// Get all users with player stats
export const getUsersWithPlayerStats = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
      if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Find all users who have player stats
      const usersWithStats = await prisma.user.findMany({
          where: {
              playerStats: {
                  some: {} 
              },
              phoneNumberVerified: true
          },
          select: {
              id: true,
              name: true,
              image: true,
              phoneNumber: true,
              primaryPosition: true,
              preferredFoot: true,
              city: true,
              playerStats: {
                  select: {
                      id: true,
                      position: true,
                      isStarting: true,
                      minutesPlayed: true,
                      goals: true,
                      assists: true,
                      penaltysGoals: true,
                      yellowCards: true,
                      redCards: true,
                      player : {
                        select: {
                         matchesPlayed: true,
                        }

                      },
                      lineup: {
                          select: {
                              team: {
                                  select: {
                                      id: true,
                                      name: true,
                                      logo: true
                                  }
                              },
                              fixture: {
                                  select: {
                                      id: true,
                                      date: true
                                  }
                              }
                          }
                      }
                  }
              }
          }
      });

      return res.status(200).json(usersWithStats);
  } catch (error) {
      console.error("Error fetching users with player stats:", error);
      return next(new AppError('Error fetching users with player stats', 500));
  }
};

// Get all users
export const getAllUsers = async ( req: Request, res: Response, next: NextFunction) => {
  try {
    
    // Fetch all users with limited information for security
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        city: true,
        primaryPosition: true,
        preferredFoot: true,
        playerStats: {
          select: {
            id: true,
            position: true,
            isStarting: true,
            minutesPlayed: true,
            goals: true,
            assists: true,
            yellowCards: true,
            redCards: true,
            lineup: {
              select: {
                team: {
                  select: {
                    id: true,
                    name: true,
                    logo: true
                  }
                },
                fixture: {
                  select: {
                    id: true,
                    date: true
                  }
                }
              } 
            } 
          }
        }
      }
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return next(new AppError('Failed to fetch users', 500));
  }
};




