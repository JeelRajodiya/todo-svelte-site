import type { RequestEvent } from '@sveltejs/kit';
import md5 from 'md5';
import DB from '$lib/database';
import type { UserDoc } from '$lib/functions';

export async function POST(event: RequestEvent) {
	const req = await event.request.json();
	const { email, password } = req;
	if (email === undefined || password === undefined) {
		return {
			status: 400,
			body: {
				message: 'email and password are not provided in body as json'
			}
		};
	}
	const passwordHash = md5(password);
	const db = new DB();
	const userData: UserDoc | null = await db.getExactData('users', 'email', email);

	if (userData == null) {
		return {
			status: 404,
			body: {
				message: 'Email not found'
			}
		};
	} else if (userData.passwordHash !== passwordHash) {
		return {
			status: 403,
			body: {
				message: 'Password is incorrect'
			}
		};
	}
}
