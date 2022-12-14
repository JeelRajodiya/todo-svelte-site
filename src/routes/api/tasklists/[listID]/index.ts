import MongoDB from '$lib/database';
import type { RequestEvent } from '@sveltejs/kit';
import etag from 'etag';

export async function GET(event: RequestEvent) {
	const tasklistID: string = event.params.listID;

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
	const tasklist = await db.tasklists.findOne({ id: tasklistID, userID });
	if (tasklist === null) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'wrong tasklistID'
			}
		};
	}

	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: tasklist
	};
}

export async function DELETE(event: RequestEvent) {
	const taskListID: string = event.params.listID;

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
				message: 'Invalid session ID'
			}
		};
	}
	const userID = user.id;
	const deleteResult = await db.tasklists.deleteOne({ userID, id: taskListID });
	await db.tasks.deleteMany({ userID, taskListID });
	if (deleteResult.deletedCount === 0) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'wrong tasklistID'
			}
		};
	}
	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	};
}

export async function PUT(event: RequestEvent) {
	const tasklistID: string = event.params.listID;

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
				message: 'Invalid session ID'
			}
		};
	}
	const userID = user.id;
	const taskListDoc = await db.tasklists.findOne({ userID, id: tasklistID });
	if (taskListDoc === null) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'wrong tasklistID'
			}
		};
	}
	const body = await event.request.json();
	const newTitle = body.title ? body.title : taskListDoc.title;
	const newDate = body.date ? body.date : new Date();
	const newTaskListDoc = {
		...taskListDoc,
		title: newTitle,
		updatedAt: newDate,
		etag: etag(newTitle + newDate)
	};
	const taskListsWithSameTitle = await db.tasklists.count({
		userID,
		title: newTitle,
		id: { $ne: tasklistID }
	});
	if (taskListsWithSameTitle > 0) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'tasklist with same title already exists'
			}
		};
	}

	const updateResult = await db.tasklists.updateOne(
		{ userID, id: tasklistID },
		{ $set: newTaskListDoc }
	);
	if (updateResult.modifiedCount === 0) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'nothing updated. something is wrong'
			}
		};
	}
	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: newTaskListDoc
	};
}

export async function PATCH(event: RequestEvent) {
	const taskListID: string = event.params.listID;

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
				message: 'Invalid session ID'
			}
		};
	}
	const userID = user.id;
	const taskListDoc = await db.tasklists.findOne({ userID, id: taskListID });
	if (taskListDoc === null) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'wrong tasklistID'
			}
		};
	}
	const body = await event.request.json();
	const newDate = body.date ? body.date : new Date();
	const newTaskListDoc = {
		...taskListDoc,
		updatedAt: newDate,
		etag: etag(taskListDoc.title + newDate)
	};

	const updateResult = await db.tasklists.updateOne(
		{ userID, id: taskListID },
		{ $set: newTaskListDoc }
	);
	if (updateResult.modifiedCount === 0) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'nothing updated. something is wrong'
			}
		};
	}
	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: newTaskListDoc
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
