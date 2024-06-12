'use server';

import { signIn } from '@/auth';
import { CredentialsSchema, MagicLinkSignInSchema } from '@/schemas/auth';
import { findUserbyEmail } from '@/services';
import { createTwoFactorAuthToken, createVerificationToken, deleteTwoFactorAuthTokenById, findTwoFactorAuthTokenByEmail } from '@/services/auth';
import { AuthError, CredentialsSignin } from 'next-auth';
import type { z } from 'zod';
import { sendAccountVerificationEmail } from '../email-verification';
import { sendTwoFactorAuthEmail } from '../two-factor';

/**
 * This method is responsible for executing the login flow.
 * @param {z.infer<typeof CredentialsSchema>} credentials - The user credentials.
 * @returns {Promise<{ error?: string, success?: string, data?: { twoFactorAuthEnabled: boolean } }>}
 * An object containing error, success, or data about two-factor authentication status,
 * or throws an error if an unexpected error occurs.
 */
export const login = async (credentials: z.infer<typeof CredentialsSchema>) => {
	const validCredentials = await CredentialsSchema.safeParse(credentials);
	if (!validCredentials.success) {
		return {
			error: 'invalid data',
		};
	}

	try {
		const { email, password, code } = validCredentials.data;
		const user = await findUserbyEmail(email);
		if (!user) {
			return {
				error: 'User not found',
			};
		}
		//Verificação de E-mail
		if (!user.emailVerified) {
			const verificationToken = await createVerificationToken(user.email);
			await sendAccountVerificationEmail(user, verificationToken.token);
			return {
				success: 'Email verification sent successfully',
			};
		}

		//Two Factor Authentication
		if (user.isTwoFactorAuthEnabled) {
			if (code) {
				const twoFactorAuthToken = await findTwoFactorAuthTokenByEmail(email);

				if (!twoFactorAuthToken || twoFactorAuthToken.token !== code) {
					return {
						error: 'Invalid code',
						data: {
							twoFactorAuthEnabled: true,
						},
					};
				}

				const hasExpired = new Date(twoFactorAuthToken.expires) < new Date();

				if (hasExpired) {
					return {
						error: 'Expired Code',
						data: {
							twoFactorAuthEnabled: true,
						},
					};
				}

				await deleteTwoFactorAuthTokenById(twoFactorAuthToken.id);
			} else {
				//generate code
				const twoFactorAuthToken = await createTwoFactorAuthToken(email);
				await sendTwoFactorAuthEmail(user, twoFactorAuthToken.token);
				return {
					data: {
						twoFactorAuthEnabled: true,
					},
				};
			}
		}

		const resp = await signIn('credentials', {
			email,
			password,
			redirectTo: process.env.AUTH_LOGIN_REDIRECT,
		});
	} catch (err) {
		if (err instanceof AuthError) {
			if (err instanceof CredentialsSignin) {
				return {
					error: 'Invalid credentials',
				};
			}
		}

		throw err; // Rethrow all other errors
	}
};
