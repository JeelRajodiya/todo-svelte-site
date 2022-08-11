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
	let newPosition = body.newPosition;
	// getting the currentPosition of the task before it gets deleted
	const taskPosition = tasks.filter((i) => i.id == taskID)[0].position;
	if (newPosition == undefined) {
		return {
			status: 400,
			body: { message: 'provide newPosition arguments in body' }
		};
	}
	newPosition = Number(newPosition);

	// removing the current task from list
	tasks = tasks.filter((i) => i.id != taskID);
	// moving a task
	// task after and at the newPosition and before the currentPosition will have increment of 1
	// rest remains same

	let p; // position
	let modifiedCount = 0;

	if (Math.abs(newPosition - taskPosition) == 1) {
		// if the tasks are in sub sequent order we will swap the positions
		modifiedCount += (
			await db.tasks.updateOne(
				{ userID, taskListID, position: newPosition },
				{ $set: { position: taskPosition } }
			)
		).modifiedCount;
		modifiedCount += (
			await db.tasks.updateOne(
				{ userID, taskListID, position: taskPosition },
				{ $set: { position: newPosition } }
			)
		).modifiedCount;
	}

	for (let i = 0; i < tasks.length; i++) {
		p = tasks[i].position;
		console.log(p, newPosition, taskPosition);
		// P >= 5 && P < 1
		if (p >= newPosition && p < taskPosition) {
			modifiedCount += (
				await db.tasks.updateOne(
					{ userID, taskListID, id: tasks[i].id },
					{ $set: { position: p + 1 } }
				)
			).modifiedCount;
		} else if (p <= newPosition && p > taskPosition) {
			modifiedCount += (
				await db.tasks.updateOne(
					{ userID, taskListID, id: tasks[i].id },
					{ $set: { position: p - 1 } }
				)
			).modifiedCount;
		}
	}
	modifiedCount += (
		await db.tasks.updateOne(
			{ userID, taskListID, id: taskID },
			{ $set: { position: newPosition } }
		)
	).modifiedCount;
	return {
		status: 200,
		body: {
			message: `updated ${modifiedCount} tasks`
		}
	};
}
