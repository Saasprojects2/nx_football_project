import { Request, Response, NextFunction } from 'express';
import { verifyToken, generateAccessToken } from '../utils/jwtService';
import { prisma } from '../prismaClient';
import { JwtPayload } from 'jsonwebtoken';

export const authenticate = async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const accessToken = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
    if (Array.isArray(accessToken)) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    if (!accessToken) {
      return res.status(401).json({ message: "No access token" });
    }

    // Verify access token
    const decoded = verifyToken(accessToken) as { id: string };

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        name: true,
        phoneNumberVerified: true
      }
    });

    if (!user || !user.phoneNumberVerified) {
      return res.status(401).json({ message: "Invalid user or unverified phone number" });
    }

    // Set user data on request
    req.user = user;
    return next();
  } catch (error) {
    // If access token is invalid, attempt to refresh
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
      }

      // Your existing refresh token logic here
      const decoded = verifyToken(refreshToken) as { id: string };
      const newAccessToken = generateAccessToken(decoded.id);
      
      if (newAccessToken) {
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Instead of recursively calling authenticate, set the user and continue
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { 
            id: true, 
            name: true,
            phoneNumberVerified: true
          }
        });
        
        if (!user || !user.phoneNumberVerified) {
          return res.status(401).json({ message: "Invalid user or unverified phone number" });
        }
        
        req.user = user;
        return next();
      }
    } catch {
      return res.status(401).json({ message: "Authentication failed" });
    }
  }
};