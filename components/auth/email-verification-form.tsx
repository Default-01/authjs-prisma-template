'use client';
import { verifyToken } from '@/actions/auth';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import AuthCard from './auth-card';
import AuthFormMessage from './auth-form-message';

const EmailVerificationForm = () => {
	const [error, setError] = useState<string | undefined>(undefined);
	const [success, setSuccess] = useState<string | undefined>(undefined);
	const searchParam = useSearchParams();
	const token = searchParam.get('token');

	const automaticSubmission = useCallback(() => {
		if (error || success) return;

		if (!token) {
			setError('Invalid token');
			return;
		}

		verifyToken(token)
			.then((data) => {
				setSuccess(data.success);
				setError(data.error);
			})
			.catch(() => {
				setError('Something went wrong');
			});
	}, [token, success, error]);

	useEffect(() => {
		automaticSubmission();
	}, [automaticSubmission]);
	return (
		<div className='flex flex-1 justify-center items-center'>
			<AuthCard title='Check your email'>
				{success && (
					<AuthFormMessage
						title='Success'
						type='success'
						message={success}
					/>
				)}
				{error && (
					<AuthFormMessage
						title='We found a problem'
						type='error'
						message={error}
					/>
				)}
			</AuthCard>
		</div>
	);
};

export default EmailVerificationForm;
