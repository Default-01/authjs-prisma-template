import { CredentialsSignin } from 'next-auth';
//https://authjs.dev/reference/core/providers/credentials#authorize
class InvalidCredentials extends CredentialsSignin {
	code = 'Invalid Credentials';
}

export { InvalidCredentials };
