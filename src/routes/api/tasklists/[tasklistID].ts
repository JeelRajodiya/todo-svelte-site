import MongoDB from '$lib/database';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
	const tasklistID: string = event.params.tasklistID;

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
	const tasklist = await db.tasklists.findOne({ id: tasklistID, userID });
	if (tasklist === null) {
		return {
			status: 400,
			body: {
				message: 'wrong tasklistID'
			}
		};
	}

	return {
		status: 200,

		body: tasklist
	};
}

export async function DELETE(event: RequestEvent) {
	const tasklistID: string = event.params.tasklistID;

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
				message: 'Invalid session ID'
			}
		};
	}
	const userID = user.id;
	const deleteResult = await db.tasklists.deleteOne({ userID, id: tasklistID });
	if (deleteResult.deletedCount === 0) {
		return {
			status: 400,
			body: {
				message: 'wrong tasklistID'
			}
		};
	}
	return {
		status: 200
	};
}

export async function PUT(event: RequestEvent) {
	const tasklistID: string = event.params.tasklistID;

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
				message: 'Invalid session ID'
			}
		};
	}
	const userID = user.id;
}
