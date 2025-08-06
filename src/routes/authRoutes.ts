import { Request, Response, RequestHandler, Router } from 'express';


import {
    login,
    logout,
    refreshAccessToken,
    register,
    resendVerificationEmail,
    resetPassword,
    sendOtpToPhone,
    sendResetEmailController,
    updateUserDetails,
    verifyEmail,
    verifyOtp,
    getUsersWithPlayerStats,
    getAllUsers
  } from '../controllers/authController';

  import { getProfile, updateProfile } from '../controllers/auth_private';

import { authenticate } from "../middlewares/authMiddleware";
import { limiter } from "../middlewares/rateLimiter";
import { PhoneNumber } from 'libphonenumber-js';


const router = Router();


// User registration
router.post('/register', limiter, (register) as RequestHandler);

// Update these routes
router.post('/request-reset', sendResetEmailController as RequestHandler);
router.post('/reset-password', resetPassword as RequestHandler);


// Email verification
router.get('/verify-email', verifyEmail as RequestHandler);

// Resend email verification
router.post('/resend-email', limiter, (resendVerificationEmail) as RequestHandler);

// User login
router.post('/login', limiter, (login as unknown) as RequestHandler);

//add more details authenicate user
router.put("/addDetails", authenticate  as RequestHandler, updateUserDetails as RequestHandler);

// Refresh access token
router.post('/refresh-token', (refreshAccessToken as unknown) as RequestHandler);

// Logout
router.post('/logout', (logout as unknown) as RequestHandler);

// Send OTP to phone number
router.post('/send-otp', limiter, (sendOtpToPhone as unknown) as RequestHandler);

// Verify OTP
router.post('/verify-otp', (verifyOtp as unknown) as RequestHandler);

router.get('/getprofile', authenticate as RequestHandler, getProfile as any);

router.put('/updateUserdetails', authenticate as RequestHandler, updateProfile as any);


// // Logout
// router.get("/logout-session", (req, res) => {
//   req.logout((err) => {
//     if (err) return res.status(500).json({ message: "Logout failed" });
//     const redirectUrl = process.env.FRONTEND_APP_URL || 'https://www.nxchamp.com/';
//     res.redirect(redirectUrl);
//   });
// });

// Get current user
// router.get('/current_user', (authenticate as unknown) as RequestHandler, ((req: Request, res: Response) => {
//   if (req.user) {
//     return res.status(200).json({ 
//       id: (req.user as any).id, 
//       PhoneNumber: (req.user as any).PhoneNumber,
//       name: (req.user as any).name,
//       phoneNumberVerified: (req.user as any).phoneNumberVerified
//     });
//   }
//   return res.status(401).json({ message: "Not authenticated" });
// }) as unknown as RequestHandler);

// Request password reset  
router.post('/request-reset', sendResetEmailController as unknown as RequestHandler);

// Reset password
router.post('/reset-password', resetPassword as unknown as RequestHandler);

router.get('/users/player-stats', authenticate as RequestHandler, getUsersWithPlayerStats as RequestHandler);

router.get('/users/all', getAllUsers as RequestHandler);

export default router;
