import type { RequestEvent } from '@sveltejs/kit';
import md5 from 'md5';
import MongoDB from '$lib/database';
import type { UserDoc } from '$lib/util/types';
import { genSession } from '$lib/util/functions';

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
	const db = new MongoDB();
	const userData: UserDoc = (await db.users.findOne({ email })) as UserDoc;

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
	const session = genSession(email, passwordHash);
	db.users.updateOne(
		{ email: email, passwordHash: passwordHash },
		{ $push: { sessions: session } }
	);
	return {
		status: 200,
		headers: {
			authorization: session
		},
		body: {
			message: 'Login successful'
		}
	};
}

export async function DELETE(event: RequestEvent) {
	// logout
	const session: string = event.request.headers.get('Authorization') as string;
	if (session === undefined) {
		return {
			status: 400,
			body: {
				message: 'Authorization header is not provided'
			}
		};
	}
	const db = new MongoDB();
	db.users.updateOne({ sessions: session }, { $pull: { sessions: session } });
	return {
		status: 200,
		body: {
			message: 'Logout successful'
		}
	};
}
