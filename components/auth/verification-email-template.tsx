interface VerificationEmailTemplateProps {
	name: string;
	token: string;
}

export const VerificationEmailTemplate: React.FC<Readonly<VerificationEmailTemplateProps>> = ({ name, token }) => {
	const verificationUrl = `${process.env.NEXT_PUBLIC_URL}${process.env.RESEND_VERIFICATION_URL}?token=${token}`;
	return (
		<div>
			<h1>Welcome ${name},</h1>
			<h2>
				To verify your account, please click{' '}
				<a
					href={verificationUrl}
					target='_blank'
					rel='noreferrer'>
					Here
				</a>
			</h2>
		</div>
	);
};
