export interface OtpAuthRequest {
	otp: number;
}
export interface UserDoc {
	email: string;
	passwordHash: string;
	createdAt: Date;
	id: string;
	sessions: string[];
}
export interface DecodedJWT {
	email: string;
	passwordHash: string;
}
export interface OTPData {
	email: string;
	passwordHash: string;
	otpToken: string;
	otp: number;
}
export interface OTPDoc {
	email: string;
	passwordHash: string;
	createdAt: Date;
	otp: number;
	otpToken: string;
}

export interface SignupRequest {
	email: string;
	password: string;
}

export interface TaskListDoc {
	// kind: string; //Type of the resource. This is always "tasks#taskList".
	userID: string;
	id: string;
	etag: string;
	title: string;
	updatedAt: Date;
	selfLink?: string;
}

export interface TaskLists {
	// kind: string; //Type of the resource. This is always "tasks#taskLists".
	etag: string;
	nextPageToken?: number; //Token that can be used to request the next page of this result.
	items: TaskListDoc[]; // Collection of TaskList Object.
}

export interface TaskDoc {
	userID: string;
	// kind: string; // Type of the resource. This is always "tasks#task".
	id: string; // Task identifier.
	etag: string; // ETag of the resource.
	title: string; // Title of the task.
	updated: string; // Last modification time of the task (as a RFC 3339 timestamp).
	selfLink?: string; // URL pointing to this task. Used to retrieve, update, or delete this task.
	parent: string; // Parent task identifier. This field is omitted if it is a top-level task. This field is read-only. Use the "move" method to move the task under a different parent or to the top level.
	position: number; // String indicating the position of the task among its sibling tasks under the same parent task or at the top level. If this string is greater than another task's corresponding position string according to lexicographical ordering, the task is positioned after the other task under the same parent task (or at the top level). This field is read-only. Use the "move" method to move the task to another position.
	notes: string; // Notes describing the task. Optional.
	status: string; // Status of the task. This is either "needsAction" or "completed".
	due: string; // Due date of the task (as a RFC 3339 timestamp). Optional. The due date only records date information; the time portion of the timestamp is discarded when setting the due date. It isn't possible to read or write the time that a task is due via the API.
	completed: string; // Completion date of the task (as a RFC 3339 timestamp). This field is omitted if the task has not been completed.
	deleted: boolean; // Flag indicating whether the task has been deleted. The default is False.
	hidden: boolean; // Flag indicating whether the task is hidden. This is the case if the task had been marked completed when the task list was last cleared. The default is False. This field is read-only.
	links: [
		// Collection of links. This collection is read-only.
		{
			type: string; // Type of the link, e.g. "email".
			description: string; // The description. In HTML speak: Everything between <a> and </a>.
			link: string; // The URL.
		}
	];
}

export interface Tasks {
	// kind: string; // Type of the resource. This is always "tasks#tasks".
	etag: string; // ETag of the resource.
	nextPageToken: number; // Token used to access the next page of this result.
	items: TaskDoc[]; // object | Collection of tasks.
}
