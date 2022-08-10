import type { RequestEvent } from '@sveltejs/kit';
import MongoDB from '$lib/database';

export async function POST(event: RequestEvent) {
	const taskListID: string = event.params.taskListID;
	const taskID: string = event.params.taskID;

	const session: string = event.request.headers.get('Authorization') as string;
	if (session == null) {
		return {
			status: 400,
			body: {
				message: 'make sure authorization header  is present'
			}
		};
	}
	const db = MongoDB;
	const user = await db.users.findOne({ sessions: session });
	if (user === null) {
		return {
			status: 400,
			body: {
				message: 'can not find user'
			}
		};
	}
	const userID = user.id;
	const tasks = await db.tasks.find({ userID, taskListID }).sort({ position: 1 }).toArray();

	if (tasks === null) {
		return {
			status: 400,
			body: {
				message: 'wrong tasklistID'
			}
		};
	}

	console.log(tasks);

	return {
		status: 200
	};
}
