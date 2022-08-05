import { MongoClient,Db } from "mongodb";
import {  MONGODB_URI } from "$env/static/private";
// methods 
//  query from collection

export default class DB {
    private client: MongoClient;
    private DB : Db
    constructor (){
        this.client = new MongoClient(MONGODB_URI);
        this.DB = this.client.db("svelte-todo");
    }

     getData(collection: string, query: any) {
        return this.DB.collection(collection).find(query).toArray();
        
    }
    insertData(collection: string, data: any) {
        return this.DB.collection(collection).insertOne(data);
    }

}
