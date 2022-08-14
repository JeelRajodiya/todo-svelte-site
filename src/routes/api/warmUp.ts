// just to warm up the server and database
import MongoDB from '$lib/database';
import type { RequestEvent } from '@sveltejs/kit';
export async function GET(event: RequestEvent) {
	const session: string = event.request.headers.get('Authorization') as string;
	if (session == null) {
		return {
			status: 400,
			headers: {
				'access-control-allow-origin': '*'
			},

			body: {
				message: 'make sure authorization header  is present'
			}
		};
	}
	const db = MongoDB;
	const user = await db.users.findOne({ sessions: session });
	if (user === null) {
		return {
			status: 403,
			headers: {
				'access-control-allow-origin': '*'
			},

			body: {
				message: 'can not find user. must be logged out'
			}
		};
	}
	return {
		status: 200,
		headers: {
			'access-control-allow-origin': '*'
		}
	};
}
