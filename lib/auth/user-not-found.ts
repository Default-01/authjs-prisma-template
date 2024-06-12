import { CredentialsSignin } from 'next-auth';
//https://authjs.dev/reference/core/providers/credentials#authorize
class UserNotFound extends CredentialsSignin {
	code = 'User not found';
}

export { UserNotFound };
