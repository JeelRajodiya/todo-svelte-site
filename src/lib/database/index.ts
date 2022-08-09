import { MongoClient, Db, Collection } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';
import type { OTPDoc, UserDoc, TaskDoc, TaskListDoc } from '$lib/util/types';
// methods
//  query from collection

class MongoDB {
	private client: MongoClient;
	private DB: Db;
	public users: Collection<UserDoc>;
	public tasks: Collection<TaskDoc>;
	public otps: Collection<OTPDoc>;
	public tasklists: Collection<TaskListDoc>;

	constructor() {
		this.client = new MongoClient(MONGODB_URI);
		this.DB = this.client.db('svelte-todo');
		this.users = this.DB.collection('users');
		this.tasks = this.DB.collection('tasks');
		this.tasklists = this.DB.collection('tasklists');
		this.otps = this.DB.collection('otps');
	}
}
const mongoDB = new MongoDB();
export default mongoDB;
