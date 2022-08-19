import type { RequestEvent } from '@sveltejs/kit';

export function POST(event: RequestEvent) {
	return {
		status: 200,
		body: {
			message: event.params.taskListID
		}
	};
}
