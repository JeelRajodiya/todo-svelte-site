import type { RequestEvent } from '@sveltejs/kit';
import MongoDB from '$lib/database';
import etag from 'etag';

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
	const deletedCount = await db.tasks.deleteMany({ taskListID, userID, isCompleted: true });
	return {
		status: 200,
		headers: {
				'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: {
			message: 'deleted ' + deletedCount.deletedCount + ' completed tasks'
		}
	};
}
