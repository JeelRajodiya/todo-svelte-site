import MongoDB from '$lib/database';
import type { TaskLists as TaskListsResponse, UserDoc } from '$lib/util/types';
import type { RequestEvent } from '@sveltejs/kit';
import etag from 'etag';

export async function GET(event: RequestEvent) {
	const session = (await event.request.headers.get('Authorization')) as string;
	const body = await event.request.json();
	if (session === undefined) {
		return {
			status: 400,
			body: {
				message: 'Authorization header is not provided'
			}
		};
	}
	const db = new MongoDB();
	const userData: UserDoc = (await db.users.findOne({ sessions: session })) as UserDoc;
	if (userData === null) {
		return {
			status: 400,
			body: {
				message: 'Invalid session'
			}
		};
	}

	const userID = userData.id;
	const { maxResults, nextPageToken } = body;
	let tasklists;

	// { maxResults:number ,
	//     nextPageToken: number}
	if (nextPageToken === undefined || nextPageToken === undefined) {
		tasklists = await db.tasklists.find({ userID }).toArray();
	} else {
		tasklists = await db.tasklists
			.find({ userID })
			.skip(nextPageToken * maxResults)
			.toArray();
	}
	const tasklistsResponse: TaskListsResponse = {
		kind: 'tasklists#tasklists',
		items: tasklists,
		etag: etag(JSON.stringify(tasklists)),
		nextPageToken: tasklists.length === maxResults ? nextPageToken + 1 : undefined
	};

	return {
		status: 200,
		body: tasklistsResponse
	};
}
