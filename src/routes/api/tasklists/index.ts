import MongoDB from '$lib/database';
import type { UserDoc } from '$lib/util/types';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
	const session = (await event.request.headers.get('Authorization')) as string;
	if (session === undefined) {
		return {
			status: 400,
			body: {
				message: 'Authorization header is not provided'
			}
		};
	}
	const db = new MongoDB();
	const userData: UserDoc = (await db.users.findOne({ sessions: session })) as UserDoc;
	if (userData === null) {
		return {
			status: 400,
			body: {
				message: 'Invalid session'
			}
		};
	}

	const userID = userData.id;
	const tasklists = await db.tasklists.find({ userID }).toArray();

	return {
		status: 200,
		body: tasklists
	};
}
