// just to warm up the server and database
import MongoDB from '$lib/database';
export async function GET() {
	return {
		status: 200
	};
}
