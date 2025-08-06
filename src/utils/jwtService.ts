import jwt from 'jsonwebtoken';

// Define token expiration constants
export const ACCESS_TOKEN_EXPIRES_IN = '1d'; // 1 day
export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 24 * 60 * 60; // 1 day in seconds
export const REFRESH_TOKEN_EXPIRES_IN = '30d'; // 30 days
export const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

// Legacy function to generate JWTs
export const generateToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Generate access token with 1-day expiration (changed from 15 minutes)
export const generateAccessToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

// Verify access token
export const verifyToken = (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate refresh token with 30-day expiration
export const generateRefreshToken = (userId: string) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

// Verify refresh token
export const verifyRefreshToken = (token: string) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
