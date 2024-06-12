'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { register } from '@/actions/auth';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RegisterSchema } from '@/schemas/auth';
import AuthCard from './auth-card';
import AuthFormMessage from './auth-form-message';

export default function RegisterForm() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string>('');
	const [success, setSuccess] = useState<string>('');
	const form = useForm<z.infer<typeof RegisterSchema>>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	});

	const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
		startTransition(async () => {
			try {
				const { success, error } = await register(values);
				if (error) setError(error);
				setSuccess(success || '');
				form.reset();
			} catch (error) {
				setSuccess('');
				setError('Something went wrong.');
				form.reset();
			}
		});
	};

	return (
		<AuthCard
			title='Register'
			description='Welcome'>
			<div className='space-y-4'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className='space-y-4'>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												autoComplete='off'
												type='name'
												placeholder='John Doe'
												required
												{...field}
												disabled={isPending}
											/>
										</FormControl>
										<FormDescription className='hidden'>Your name.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>E-mail</FormLabel>
										<FormControl>
											<Input
												type='email'
												placeholder='your@mail.com'
												required
												{...field}
												disabled={isPending}
											/>
										</FormControl>
										<FormDescription className='hidden'>Your email.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type='password'
												placeholder='******'
												required
												{...field}
												disabled={isPending}
											/>
										</FormControl>
										<FormDescription className='hidden'>Your Password</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							{error && (
								<AuthFormMessage
									type='error'
									message={error}
									title='Error'
								/>
							)}
							{success && (
								<AuthFormMessage
									type='success'
									message={success}
									title='Success'
								/>
							)}
							<Button
								variant={'default'}
								className='w-full'
								disabled={isPending}>
								<LoaderIcon className={!isPending ? 'hidden' : 'animate-spin mr-2'} />
								<span>Register</span>
							</Button>
						</div>
					</form>
				</Form>

				<div className='mt-4 text-center text-sm'>
					Already have an account?{' '}
					<Link
						href='/auth/login'
						className='underline'>
						Login Here
					</Link>
				</div>
			</div>
		</AuthCard>
	);
}
