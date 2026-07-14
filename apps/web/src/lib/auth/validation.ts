import { z } from 'zod';

const email = z.string().trim().email('Enter a valid email address.');
const password = z.string().min(8, 'Use at least 8 characters.');

export const loginSchema = z.object({ email, password });
export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(80, 'Use 80 characters or fewer.'),
  email,
  password,
});
export const passwordResetSchema = z.object({ email });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegistrationValues = z.infer<typeof registrationSchema>;
export type PasswordResetValues = z.infer<typeof passwordResetSchema>;
