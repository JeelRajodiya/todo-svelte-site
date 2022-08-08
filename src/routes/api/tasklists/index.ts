import MongoDB from '$lib/database';
import type { TaskLists as TaskListsResponse, UserDoc } from '$lib/util/types';
import type { RequestEvent } from '@sveltejs/kit';
import etag from 'etag';

export async function GET(event: RequestEvent) {
	const maxResults = Number(event.url.searchParams.get('maxResults'));
	const nextPageToken = Number(event.url.searchParams.get('nextPageToken'));
	console.log(maxResults, nextPageToken);

	const session = (await event.request.headers.get('Authorization')) as string;

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

	let tasklists;

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
		console.log('HO');
	}
	const tasklistsResponse: TaskListsResponse = {
		kind: 'tasklists#tasklists',
		items: tasklists,
		etag: etag(JSON.stringify(tasklists)),
		nextPageToken: nextPageToken + 1
	};

	return {
		status: 200,
		body: tasklistsResponse
	};
}
