import type { RequestEvent } from '@sveltejs/kit';
import MongoDB from '$lib/database';
import etag from 'etag';
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

export async function PUT(event: RequestEvent) {
	const taskListID: string = event.params.taskListID;
	const taskID: string = event.params.taskID;
	const body = await event.request.json();
	if (body.updatedOn == undefined) {
		body.updatedOn = new Date();
	}
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

	db.tasks.updateOne({ userID, taskListID, id: taskID }, { $set: body });
	let taskDoc = await db.tasks.findOne({ userID, taskListID, id: taskID });
	if (taskDoc === null) {
		return {
			status: 400,
			body: { message: 'something went wrong ' }
		};
	}
	db.tasks.updateOne(
		{ userID, taskListID, id: taskID },
		{
			$set: {
				etag: etag(
					String(taskDoc.isCompleted) +
						taskDoc?.links +
						taskDoc?.due +
						taskDoc?.notes +
						taskDoc?.parent +
						taskDoc.position +
						taskDoc.updatedOn
				)
			}
		}
	);
	taskDoc = await db.tasks.findOne({ userID, taskListID, id: taskID });

	return {
		status: 200,
		body: {
			message: taskDoc
		}
	};
}

export async function PATCH(event: RequestEvent) {
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

	let taskDoc = await db.tasks.findOne({ userID, taskListID, id: taskID });
	if (taskDoc === null) {
		return {
			status: 400,
			body: { message: 'something went wrong ' }
		};
	}
	db.tasks.updateOne(
		{ userID, taskListID, id: taskID },
		{
			$set: {
				etag: etag(
					String(taskDoc.isCompleted) +
						taskDoc?.links +
						taskDoc?.due +
						taskDoc?.notes +
						taskDoc?.parent +
						taskDoc.position +
						taskDoc.updatedOn
				)
			}
		}
	);
	taskDoc = await db.tasks.findOne({ userID, taskListID, id: taskID });

	return {
		status: 200,
		body: {
			message: taskDoc
		}
	};
}
