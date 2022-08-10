import type { RequestEvent } from '@sveltejs/kit';
import MongoDB from '$lib/database';
import { stringToBool } from '$lib/util/functions';
import type { Tasks } from '$lib/util/types';
import etag from 'etag';
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
	const taskListID: string = event.params.tasklistID;

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
		body: tasks
	};
}
