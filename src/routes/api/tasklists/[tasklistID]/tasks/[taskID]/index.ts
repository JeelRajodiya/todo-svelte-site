import type { RequestEvent } from '@sveltejs/kit';
import MongoDB from '$lib/database';

export async function DELETE(event: RequestEvent) {
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
	const tasklist = await db.tasks.deleteOne({ userID, taskListID, id: taskID });
	if (tasklist.deletedCount === 0) {
		return {
			status: 500,
			body: { message: 'nothing deleted. something is wrong' }
		};
	}
	return {
		status: 200
	};
}
