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
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			body: {
				message: 'email and password are not provided in body as json'
			}
		};
	}
	const passwordHash = md5(password);
	const db = MongoDB;
	const userData: UserDoc = (await db.users.findOne({ email })) as UserDoc;

	if (userData == null) {
		return {
			status: 404,

			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			body: {
				message: 'Email not found'
			}
		};
	} else if (userData.passwordHash !== passwordHash) {
		return {
			status: 403,
			headers: {
				'Access-Control-Allow-Origin': '*'
			},

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
			'Access-Control-Allow-Origin': '*'
		},
		body: {
			authorization: session,
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

			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			body: {
				message: 'Authorization header is not provided'
			}
		};
	}
	const db = MongoDB;
	db.users.updateOne({ sessions: session }, { $pull: { sessions: session } });
	return {
		status: 200,

		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: {
			message: 'Logout successful'
		}
	};
}
