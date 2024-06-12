'use server';

import { prisma } from '@/lib/db';
import { RegisterSchema } from '@/schemas/auth';
import { createVerificationToken } from '@/services/auth';
import { UserRole } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import bcryptjs from 'bcryptjs';
import type { z } from 'zod';
import { sendAccountVerificationEmail } from '../email-verification';

/**
 * This method creates the user for Credentials provider
 * @param {z.infer<typeof RegisterSchema>} user - The new user data.
 * @returns {Promise<{error?: string, success?: string}>} The result of the password change request.
 */
export const register = async (user: z.infer<typeof RegisterSchema>) => {
	const valid = await RegisterSchema.safeParse(user);

	if (!valid.success) {
		return {
			error: 'invalid data',
		};
	}

	try {
		const { name, email, password } = user;
		const hashedPassword = await bcryptjs.hash(password, 10);
		const createdUser = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: UserRole.DEFAULT,
			},
		});
		//Account verification flow with e-mail
		const verificationToken = await createVerificationToken(email);
		await sendAccountVerificationEmail(createdUser, verificationToken.token);
		return {
			success: 'Verification email sent',
		};
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return {
					error: 'An account related to this email already exists.',
				};
			}
		}
		// return { error };

		throw error;
	}
};
