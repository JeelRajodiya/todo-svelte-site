import type { RequestEvent } from '@sveltejs/kit';
import MongoDB from '$lib/database';
// child support is abandon  but will be implemented in future

export async function POST(event: RequestEvent) {
	const taskListID: string = event.params.listID;
	const taskID: string = event.params.taskID;

	const session: string = event.request.headers.get('Authorization') as string;
	if (session == null) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
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
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'can not find user'
			}
		};
	}
	const userID = user.id;

	const body = await event.request.json();
	// if it is a child then parent ID must be provided

	// const isChild = body.isChild ? true : false;
	if (body.isChild === true && body.parentID == undefined) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'parentID is not provided'
			}
		};
	}

	let tasks;
	// parent Selector represent parent ID if the isChild is true
	// so it can be used in mongodb selection query otherwise it is emitted

	// let parentSelector = {};
	// if (isChild === true) {
	// const parentID = body.parentID;
	// 	if ((await db.tasks.count({ userID, taskListID, id: parentID })) === 0) {
	// 		return {
	// 			status: 200,
	// 			body: {
	// 				message: 'No such parent exist. Wrong parent ID.'
	// 			}
	// 		};
	// 	}
	// 	parentSelector = { parent: parentID };
	// 	tasks = await db.tasks
	// 		.find({ userID, taskListID, ...parentSelector })
	// 		.sort({ position: 1 })
	// 		.toArray();

	// 	if (tasks.length === 0) {
	// 		// there no children
	// 		db.tasks.updateOne(
	// 			{ userID, taskListID, id: taskID },
	// 			{ $set: { parent: parentID, position: 1 } }
	// 		);

	// 	}
	// } else {
	tasks = await db.tasks.find({ userID, taskListID }).sort({ position: 1 }).toArray();
	// }

	const taskDoc = tasks.filter((i) => i.id == taskID)[0];
	// console.log(tasks);
	let taskPosition: number;
	// if the task is a child and doesn't want to be anymore
	// if (isChild === false && taskDoc.parent != null) {
	// taskPosition = tasks.length;
	// db.tasks.updateOne({ userID, taskListID, id: taskID }, { $set: { parent: null } });
	// } else if (isChild === true && taskDoc == undefined) {
	// is not a child and wants to be one
	taskPosition = tasks.length;
	// } else {
	taskPosition = taskDoc.position;
	// }
	let newPosition = body.newPosition;
	// getting the currentPosition of the task before it gets deleted
	if (newPosition == undefined) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: { message: 'provide newPosition arguments in body' }
		};
	}
	newPosition = Number(newPosition);

	// removing the current task from list
	tasks = tasks.filter((i) => i.id != taskID);
	// moving a task
	// task after and at the newPosition and before the currentPosition will have increment of 1
	// task before and at the newPosition and after the currentPosition will have decrement of 1
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
		// console.log(p, newPosition, taskPosition);
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
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: {
			message: `updated ${modifiedCount} tasks`
		}
	};
}
export function OPTIONS(event: RequestEvent) {
	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	};
}
