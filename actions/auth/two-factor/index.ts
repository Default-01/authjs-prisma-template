'use server';

import { prisma } from '@/lib/db';
import mail from '@/lib/mail';
import { findUserbyEmail } from '@/services';
import { findTwoFactorAuthTokeByToken } from '@/services/auth';
import type { User } from '@prisma/client';

/**
 * This method sends an e-mail to the user with the 6 digits code to login
 * when Two Factor Authentication is enabled
 * @param {User} user
 * @param {string} token
 * @returns
 */
/**
 * This method sends an e-mail to the user with the 6 digits code to login
 * when Two Factor Authentication is enabled
 * @param {User} user - The user to send the verification email to.
 * @param {string} token - The verification token.
 * @returns {Promise<{ error?: string, success?: string }>} An object indicating the result of the operation.
 */
export const sendTwoFactorAuthEmail = async (user: User, token: string) => {
	const { RESEND_EMAIL_FROM, OTP_SUBJECT } = process.env;

	if (!RESEND_EMAIL_FROM || !OTP_SUBJECT) {
		return {
			error: 'Insufficient environment configuration for sending email.',
		};
	}

	const { email } = user;
	try {
		const { error } = await mail.emails.send({
			from: RESEND_EMAIL_FROM,
			to: email,
			subject: OTP_SUBJECT,
			html: `<p>Your code OTP: ${token}</p>`,
		});

		if (error)
			return {
				error,
			};
		return {
			success: 'Email successfully sent',
		};
	} catch (error) {
		return { error };
	}
};

/**
 * This method updates the user's record with the date and time the
 * Two Factor Authentication was verified
 * @param token
 * @returns
 */
export const verifyTwoFactorToken = async (token: string) => {
	const existingToken = await findTwoFactorAuthTokeByToken(token);
	if (!existingToken) {
		return {
			error: 'Verification code not found',
		};
	}

	const isTokenExpired = new Date(existingToken.expires) < new Date();
	if (isTokenExpired) {
		return {
			error: 'Expired verification code',
		};
	}

	const user = await findUserbyEmail(existingToken.email);
	if (!user) {
		return {
			error: 'User not found',
		};
	}

	try {
		await prisma.user.update({
			where: { id: user.id },
			data: {
				twoFactorAuthVerified: new Date(),
			},
		});

		await prisma.twoFactorToken.delete({
			where: {
				id: existingToken.id,
			},
		});

		return {
			success: 'Two-factor authentication verified',
		};
	} catch (err) {
		return { error: 'Error verifying 2-factor authentication code' };
	}
};
