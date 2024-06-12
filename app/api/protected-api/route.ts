import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export const GET = auth((req) => {
	if (req.auth)
		return NextResponse.json({
			message: 'Authenticated User',
		});
	return NextResponse.json(
		{
			message: 'Not Authenticated',
		},
		{
			status: 401,
		}
	);
});
