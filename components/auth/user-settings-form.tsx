'use client';

import { changeSettings } from '@/actions/auth/settings';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserSettingsSchema } from '@/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderIcon, ShieldAlert } from 'lucide-react';
import type { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import AuthFormMessage from './auth-form-message';

interface Props {
	user?: User;
}
export default function UserSettingsForm({ user }: Props) {
	const { update } = useSession();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string>('');
	const [success, setSuccess] = useState<string>('');
	const form = useForm<z.infer<typeof UserSettingsSchema>>({
		resolver: zodResolver(UserSettingsSchema),
		defaultValues: {
			name: user?.name || undefined,
			email: user?.email || undefined,
			password: undefined,
			newPassword: undefined,
			//@ts-ignore
			isTwoFactorAuthEnabled: !!user?.isTwoFactorEnabled,
		},
	});

	const onSubmit = async (values: z.infer<typeof UserSettingsSchema>) => {
		startTransition(async () => {
			try {
				const resp = await changeSettings(values);
				const { success, error } = resp;
				if (!resp) {
					setError('Invalid server response');
					setSuccess('');
					form.reset();
					return;
				}

				if (error) {
					setError(error);
					setSuccess('');
					return;
				}
				if (success) {
					setSuccess(success);
					setError('');
					update();
					return;
				}
			} catch (error) {
				setSuccess('');
				setError('Something went wrong.');
				form.reset();
			}
		});
	};

	return (
		<Card x-chunk='dashboard-04-chunk-1'>
			<CardHeader>
				<CardTitle>User data</CardTitle>
				<CardDescription>Your information</CardDescription>
			</CardHeader>
			<CardContent>
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
													{...field}
													disabled={isPending}
												/>
											</FormControl>
											<FormDescription className='hidden'>Your Name</FormDescription>
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
													{...field}
													disabled
												/>
											</FormControl>
											<FormDescription className='hidden'>Your Email</FormDescription>
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
													{...field}
													disabled={isPending}
												/>
											</FormControl>
											<FormDescription className='hidden'>Your Password</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='newPassword'
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<Input
													type='password'
													placeholder='******'
													{...field}
													disabled={isPending}
												/>
											</FormControl>
											<FormDescription className='hidden'>New Password</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='isTwoFactorAuthEnabled'
									render={({ field }) => (
										<FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 m-2 space-x-2'>
											<ShieldAlert className='text-yellow-400' />
											<FormLabel className='flex-1 space-y-1'>
												<p className='text-sm font-medium leading-none'>2-Factor Authentication</p>
												<p className='text-sm text-muted-foreground'>Make your account more secure</p>
											</FormLabel>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
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
								<Separator />
								<div className='w-full flex justify-end items-center'>
									<Button
										variant={'default'}
										disabled={isPending}>
										<LoaderIcon className={!isPending ? 'hidden' : 'animate-spin mr-2'} />
										<span>Save</span>
									</Button>
								</div>
							</div>
						</form>
					</Form>

					<div className='mt-4 text-center text-sm'>
						<Link
							href='/'
							className='underline'>
							Home page
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
