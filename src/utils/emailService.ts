import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
    const url = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
  
    try {
      await resend.emails.send({
        from: 'email-address',
        to: email,
        subject: 'Email Verification',
        html: `<p>Please verify your email by clicking the link below:</p>
               <a href="${url}">Verify your email</a>`,
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  };
  
  export const sendResetEmail = async (email: string, token: string) => {
    const url = `${process.env.FRONTEND_APP_URL}/resetPassword?token=${token}`;
    try {
      await resend.emails.send({
        from: 'email-address',
        to: email,
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset. Click the link below to reset your password:</p>
               <a href="${url}">Reset Password</a>`,
      });
    } catch (error) {
      console.error('Error sending reset email:', error);
      throw new Error('Failed to send reset email');
    }
  };
