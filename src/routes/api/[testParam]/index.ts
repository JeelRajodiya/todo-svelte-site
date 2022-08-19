export function POST(event) {
	const testParam = event.params.testParam;
	return {
		status: 200,
		body: {
			message: `got ${testParam} as parameter `
		}
	};
}
