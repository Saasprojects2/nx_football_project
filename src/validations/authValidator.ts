import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from 'zod';


//register user schema
export const registerUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits long')
      .refine(value => isValidPhoneNumber("+91" + value), {
        message: 'Invalid phone number format'
      }),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long'),
}).refine((data) => data.password === data.confirmPassword,{
  message: "Password do not match",
  path: ["confirmPassword"]
});

//login user schema 
export const loginUserSchema = z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits long')
      .max(15, 'Phone number must be at most 15 digits long')
      .refine(value => isValidPhoneNumber("+91" + value), {
        message: 'Invalid phone number format'
      }),
      password: z.string().min(6, 'Password must be at least 6 characters'),
});

//add more details schema
export const AddmoredetailsSchema = z.object({
    email: z.string().email('Invalid email format'),
    dob: z.string().refine(value => !isNaN(Date.parse(value)), {
        message: 'Invalid date format (Use YYYY-MM-DD)'
      }),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    city: z.string().optional(),
    primaryPosition: z.enum(['STRIKER', 'MIDFIELDER', 'DEFENDER', 'GOALKEEPER']).optional(),
    preferredFoot: z.enum(['RIGHT', 'LEFT', 'BOTH']).optional(),
    message: z.string().optional(),
    image: z.string().optional(),
  });

//otp schema
export const otpSchema = z.object({
    phoneNumber: z
    .string()
    .refine((val) => isValidPhoneNumber("+91" + val) || isValidPhoneNumber(val), {
        message: "Invalid phone number"
    }),
  otp: z.string().length(6, 'OTP must be 6 digits long'),
});

