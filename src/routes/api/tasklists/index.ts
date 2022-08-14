import MongoDB from '$lib/database';
import type { TaskListDoc, UserDoc } from '$lib/util/types';
import type { RequestEvent } from '@sveltejs/kit';
import etag from 'etag';
import { v4 as uuidv4 } from 'uuid';

export async function GET(event: RequestEvent) {
	const maxResults = Number(event.url.searchParams.get('maxResults'));
	const nextPageToken = Number(event.url.searchParams.get('nextPageToken'));

	const session = (await event.request.headers.get('Authorization')) as string;

	if (session === undefined) {
		return {
			status: 400,
			body: {
				message: 'Authorization header is not provided'
			}
		};
	}
	const db = MongoDB;
	const userData: UserDoc = (await db.users.findOne({ sessions: { $eq: session } })) as UserDoc;
	if (userData === null) {
		return {
			status: 400,
			body: {
				message: 'Invalid session'
			}
		};
	}

	const userID = userData.id;

	let tasklists: TaskListDoc[];

	// { maxResults:number ,
	//     nextPageToken: number}
	if (nextPageToken === 0 && maxResults === 0) {
		tasklists = await db.tasklists.find({ userID }).toArray();
	} else {
		tasklists = await db.tasklists
			.find({ userID })
			.limit(maxResults)
			.skip(nextPageToken * maxResults)
			.toArray();
	}
	let taskID;

	for (let i = 0; i < tasklists.length; i++) {
		taskID = tasklists[i].id;
		tasklists[i]['selfLink'] = event.url.origin + '/api/tasklists/' + taskID;
	}

	const tasklistsResponse = {
		items: tasklists,
		etag: etag(JSON.stringify(tasklists)),
		nextPageToken: nextPageToken + 1
	};

	return {
		status: 200,
		body: tasklistsResponse
	};
}

export async function POST(event: RequestEvent) {
	const session: string = event.request.headers.get('Authorization') as string;
	const body = await event.request.json();
	if (body.title == null) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'title is required in body'
			}
		};
	}
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
	const taskListsWithSameTitle = await db.tasklists.count({ userID, title: body.title });
	if (taskListsWithSameTitle > 0) {
		return {
			status: 403,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: `A list with title ${body.title} already exists!`
			}
		};
	}
	const date = new Date();

	const taskListID = uuidv4();
	const taskList: TaskListDoc = {
		id: taskListID,
		userID,
		title: body.title,
		updatedAt: body.time ? body.time : date,
		etag: etag(body.title + date),
		selfLink: event.url.host + '/api/tasklists/' + taskListID
	};
	const insertResult = db.tasklists.insertOne(taskList);
	console.log(insertResult);
	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: taskList
	};
}
