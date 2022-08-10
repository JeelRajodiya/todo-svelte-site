import type { RequestEvent } from '@sveltejs/kit';
import MongoDB from '$lib/database';
import { stringToBool } from '$lib/util/functions';

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
	let tasks = await db.tasks.find({ userID, taskListID }).sort({ position: 1 }).toArray();

	if (tasks === null) {
		return {
			status: 400,
			body: {
				message: 'wrong tasklistID'
			}
		};
	}
	const body = await event.request.json();
	const isChild = stringToBool(body.isChild, false);
	const newPosition = body.newPosition;
	// getting the currentPosition of the task before it gets deleted
	const taskPosition = tasks.filter((i) => i.id == taskID)[0].position;
	if (newPosition == undefined) {
		return {
			status: 400,
			body: { message: 'provide newPosition arguments in body' }
		};
	}

	// removing the current task from list
	tasks = tasks.filter((i) => i.id != taskID);
	// moving a task
	// task after and at the newPosition and before the currentPosition will have increment of 1
	// rest remains same

	let p; // position
	for (let i = 0; i < tasks.length; i++) {
		p = tasks[i].position;

		if (p >= newPosition && p <= taskPosition) {
			tasks[i].position = p + 1;
		}
	}
	const updateResult = await db.tasks.updateMany({ userID, taskListID }, tasks);
	return {
		status: 200,
		body: {
			message: `updated ${updateResult.modifiedCount} tasks`
		}
	};
}
