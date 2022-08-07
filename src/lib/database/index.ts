import { MongoClient, Db, Collection } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';
import type { OTPDoc, UserDoc } from '$lib/functions';
// methods
//  query from collection

export default class MongoDB {
	private client: MongoClient;
	private DB: Db;
	public users: Collection<UserDoc>;
	// public tasks: Collection<TaskDoc>;
	public otps: Collection<OTPDoc>;
	// public tasklists: Collection<TaskListDoc>;

	constructor() {
		this.client = new MongoClient(MONGODB_URI);
		this.DB = this.client.db('svelte-todo');
		this.users = this.DB.collection('users');
		// this.tasks = this.DB.collection('tasks');
		// this.tasklists = this.DB.collection('tasklists');
		this.otps = this.DB.collection('otps');
	}
	static getCollection(collection: string) {
		return this.DB.collection(collection);
	}

	getData(collection: string, query: any) {
		return this.DB.collection(collection).find(query).toArray();
	}
	insertData(collection: string, data: any) {
		return this.DB.collection(collection).insertOne(data);
	}

	getExactData(collection: string, field: string, value: any) {
		return this.DB.collection(collection).findOne({ [field]: value });
	}

	deleteDoc(collection: string, query: any) {
		return this.DB.collection(collection).deleteOne(query);
	}
}
