import type { RequestEvent } from '@sveltejs/kit';
import MongoDB from '$lib/database';
import { stringToBool } from '$lib/util/functions';
import type { TaskDoc, Tasks } from '$lib/util/types';
import etag from 'etag';
import { v4 as uuidv4 } from 'uuid';
export async function GET(event: RequestEvent) {
	const queryParams = {
		// completedMax: event.url.searchParams.get('completedMax')
		// 	? event.url.searchParams.get('completedMax')
		// 	: null,
		// completedMin: event.url.searchParams.get('completedMin')
		// 	? event.url.searchParams.get('completedMin')
		// 	: null,
		// dueMax: event.url.searchParams.get('dueMax') ? event.url.searchParams.get('dueMax') : null,
		// dueMin: event.url.searchParams.get('dueMin') ? event.url.searchParams.get('dueMin') : null,
		maxResults: event.url.searchParams.get('maxResults')
			? Number(event.url.searchParams.get('maxResults'))
			: 0, // zero will return everything
		nextPageToken: event.url.searchParams.get('nextPageToken')
			? Number(event.url.searchParams.get('nextPageToken'))
			: 0,
		showCompleted: stringToBool(event.url.searchParams.get('showCompleted'), false),
		showDeleted: stringToBool(event.url.searchParams.get('showDeleted'), false),
		showHidden: stringToBool(event.url.searchParams.get('showHidden'), false)
		// updatedMin: event.url.searchParams.get('updatedMin')
		// 	? event.url.searchParams.get('updatedMin')
		// 	: null
	};
	const taskListID: string = event.params.taskListID;

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
	const taskDocs = await db.tasks
		.find({
			taskListID,
			userID,
			// creates the union of hidden and not hidden
			hidden: { $in: [false, queryParams.showHidden] },
			deleted: { $in: [false, queryParams.showDeleted] },
			isCompleted: { $in: [false, queryParams.showCompleted] }
		})
		.limit(queryParams.maxResults)
		.skip(queryParams.maxResults * queryParams.nextPageToken)
		.toArray();
	for (const task of taskDocs) {
		task['selfLink'] = `${event.url.origin}/tasks/${task.id}`;
	}
	const tasks: Tasks = {
		items: taskDocs,
		nextPageToken: taskDocs.length === queryParams.maxResults ? queryParams.nextPageToken + 1 : 0,
		etag: etag(JSON.stringify(taskDocs))
	};
	return {
		status: 200,
		headers: {
				'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: tasks
	};
}

export async function POST(event: RequestEvent) {
	const taskListID: string = event.params.taskListID;

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
	const body = await event.request.json();
	if (body.title == undefined || body.position == undefined) {
		return {
			status: 400,
			headers: {
					'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
			},

			body: { message: 'body must have title, position property' }
		};
	}

	// avalible body arguments
	// title,notes,due ,position,parent,updatedOn,links,parent
	const newTask: TaskDoc = {
		id: uuidv4(),
		taskListID,
		userID,
		title: body.title,
		notes: body.notes ? body.notes : '',
		due: body.due ? body.due : null,
		hidden: false,
		deleted: false,
		isCompleted: false,
		updatedOn: body.date ? body.date : new Date(),
		position: body.position,
		links: body.links ? body.links : [],
		parent: body.parent ? body.parent : null,
		etag: etag(JSON.stringify(body))
	};
	await db.tasks.insertOne(newTask);
	return {
		status: 200,
		headers: {
				'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: {
			message: 'task created',
			task: newTask
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
