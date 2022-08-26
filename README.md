# to-do app

- web site
- android app
- desktop app
- API

# Web Site

- download link for both android and windows ( 32bit and 64bit)
- top there will be a download button clicking on it will scroll to bottom where the download links are located
- after download button screen shots will be placed
- the website also contains /API


# API

- api will replicate the google task’s api structure
- Three parts
    - tasks
    - tasklists
    - auth

## TESTING

### TaskList Object

```jsx
{
	"userID":string,
 // "kind": string,      // Type of the resource. This is always "tasks#taskList".
  "id": string,        // Task list identifier.
  "etag": string,      // ETag of the resource.  https://github.com/jshttp/etag  etag will change when content canges
  "title": string,     // Title of the task list.
  "updatedAt": string,   // Last modification time of the task list (as a RFC 3339 timestamp).
//  "selfLink": string   // URL pointing to this task list. Used to retrieve, update, or delete this task list.
}
```

### T**askLists.list**

**`GET /api/tasklists/`** 

Query parametera

Request Body:  

```jsx
{
 maxResults: integer, // Maximum number of task lists returned on one page. Optional. The default is 20 (max allowed: 100)
pageToken: number //Token specifying the result page to return. Optional.
}
```

Response body: 

```jsx
{
  "resource": TaskLists //Object
}
```

TaskLists Object

```jsx
{
//  "kind": string, //Type of the resource. This is always "tasks#taskLists".
  "etag": string, 
  "nextPageToken": number, //Token that can be used to request the next page of this result.
  "items": []TaskList // Collection of TaskList Object.
}
```

### TaskLists.get

`GET /api/tasklists/[tasklistID]`

Path Parameters

```jsx
{
"tasklistID":string //Task list identifier. Task ID
}
```

Request Body:  **Empty**

Response body: 

```jsx
{
"resource": TaskList //object
}
```

### TaskLists.delete

`DELETE /api/tasklists/[tasklistID]`

Path Parameters

```jsx
{
"tasklistID":string //Task list identifier. Task ID
}
```

Request Body:  **Empty**

Response body:  Successful Response will be  **Empty**

### TaskLists.insert

`POST /api/tasklists/`

Request Body

```jsx
{
"resource": TaskList // TaskList Object but with only title field other are not necessaru
}
```

Response body

```jsx
{
"resource": TaskList // Object
}
```

### TaskLists.update

`PUT /api/tasklists/[tasklistID]`

Path Parameters

```jsx
{
"tasklistID":string //Task list identifier. Task ID
}
```

Request Body

```jsx
{
"resource": TaskList // TaskList Object but with only title field other are not necessaru
}
```

Response body

```jsx
{
"resource": TaskList // Object
}
```

### TaskLists.patch

`PATCH /api/tasklists/[tasklistID]`

Updates the authenticated user's specified task list. This method supports patch semantics.

Path Parameters

```jsx
{
"tasklistID":string //Task list identifier. Task ID
}
```

Request Body

```jsx
{
"resource": TaskList // TaskList Object but with only title field other are not necessaru
}
```

Response body

```jsx
{
"resource": TaskList // Object
}
```

## Task Object

```jsx
{
	"userID":string,
  "kind": string,    // Type of the resource. This is always "tasks#task".
  "id": string,      // Task identifier.
  "etag": string,    // ETag of the resource.
  "title": string,   // Title of the task.
  "updated": string, // Last modification time of the task (as a RFC 3339 timestamp).
	taskListID:string; // parent Task list identifier.
  "parent": string,   // Parent task identifier. This field is omitted if it is a top-level task. This field is read-only. Use the "move" method to move the task under a different parent or to the top level.
  "position": string, // String indicating the position of the task among its sibling tasks under the same parent task or at the top level. If this string is greater than another task's corresponding position string according to lexicographical ordering, the task is positioned after the other task under the same parent task (or at the top level). This field is read-only. Use the "move" method to move the task to another position.
  "notes": string,    // Notes describing the task. Optional.
  "status": string,   // Status of the task. This is either "needsAction" or "completed".
  "due": string,      // Due date of the task (as a RFC 3339 timestamp). Optional. The due date only records date information; the time portion of the timestamp is discarded when setting the due date. It isn't possible to read or write the time that a task is due via the API.
  "completed": string, // Completion date of the task (as a RFC 3339 timestamp). This field is omitted if the task has not been completed.
  "deleted": boolean,  // Flag indicating whether the task has been deleted. The default is False.
  "hidden": boolean,   // Flag indicating whether the task is hidden. This is the case if the task had been marked completed when the task list was last cleared. The default is False. This field is read-only.
  "links": [           // Collection of links. This collection is read-only.
    {
      "type": string,  // Type of the link, e.g. "email".
      "description": string,  // The description. In HTML speak: Everything between <a> and </a>.
      "link": string   // The URL.
    }
  ]
}
```

### Tasks.list

`GET /api/taskslists/[tasklistID]/tasks`

Path parameters

```jsx
{
"tasklist":string //  Task list identifier.
}
```

Query parameters

```jsx
{
"completedMax":string, // Upper bound for a task's completion date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by completion date
"completedMin":string, // Lower bound for a task's completion date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by completion date.
"dueMax" : string, // Upper bound for a task's due date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by due date.
"dueMin" : string, // Lower bound for a task's due date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by due date.
"maxResults" : integer, // Maximum number of task lists returned on one page. Optional. The default is 20 (max allowed: 100).
"pageToken" : number, // Token specifying the result page to return. Optional.
"showCompleted" : boolean, //  Flag indicating whether completed tasks are returned in the result. Optional. The default is True. Note that showHidden must also be True to show tasks completed in first party clients, such as the web UI and Google's mobile apps.
"showDeleted" : boolean,  // Flag indicating whether deleted tasks are returned in the result. Optional. The default is False.
"showHidden" : boolean,  //  Flag indicating whether hidden tasks are returned in the result. Optional. The default is False.
"updatedMin" : string   //  Lower bound for a task's last modification time (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by last modification time.

}

```

Request Body:  **Empty**

Response Body: 

```jsx
{
  "resource": Tasks // object

  
}
```

### **Tasks Object**

```jsx
{

  "etag": string,  // ETag of the resource.
  "nextPageToken": number,  // Token used to access the next page of this result.
  "items": []Task // object | Collection of tasks.
   
  
}
```

### Tasks.get

`GET /api/tasklists/[tasklistID]/tasks/[taskID]`

Path Parameters

```jsx
{
"tasklistID":string, // Task list identifier.
"taskID":string     // Task identifier.
}
```

Request Body:  **Empty**

Response Body:

```jsx
{
"resource":Task // object
}

```

### Tasks.insert

`POST /api/tasklists/[tasklistID]/tasks`

Path Parameters

```jsx
{
"tasklistID":string, // Task list identifier.
}
```

Query Parameters

```jsx
{
"parent":string, // Parent task identifier. If the task is created at the top level, this parameter is omitted. Optional.
"previous": string // Previous sibling task identifier. If the task is created at the first position among its siblings, this parameter is omitted. Optional.
```

Request Body contains a instance of Task

```jsx
{
"resource":Task // object
}
```

Response Body

```jsx
{
"resource":Task // object
}
```

### Tasks.delete

`DELETE /api/tasklists/[tasklistID]/tasks/[taskID]`

Path Parameters

```jsx
{
"tasklistID":string, // Task list identifier.
"taskID" : string // Task identifier.
}
```

Query Parameters

```jsx
{
"parent":string, // Parent task identifier. If the task is created at the top level, this parameter is omitted. Optional.
"previous": string // Previous sibling task identifier. If the task is created at the first position among its siblings, this parameter is omitted. Optional.
```

Request Body:  **Empty**

Response body:  Successful Response will be  **Empty**

### Tasks.clear

`POST /api/tasklists/[tasklistID]/clear`

deletes all the completed tasks from a Task List

Path Parameters

```jsx
{
"tasklistID":string, // Task list identifier.

}
```

Request Body:  **Empty**

Response body:  Successful Response will be  **Empty**

### Tasks.move

`POST /api/tasklists/[tasklistID]/tasks/[taskID]/move`

Moves the specified task to another position in the task list. This can include putting it as a child task under a new parent and/or move it to a different position among its sibling tasks.

Path Parameters

```jsx
{
"tasklistID":string, // Task list identifier.
"taskID" : string // Task identifier.
}
```

Query Parameters

```jsx
{
"parent":string, // Parent task identifier. If the task is created at the top level, this parameter is omitted. Optional.
"previous": string // Previous sibling task identifier. If the task is created at the first position among its siblings, this parameter is omitted. Optional.
```

Request Body :**Empty**

Response Body

```jsx
{
"resource":Task // object
}
```

### Tasks.update

`PUT /api/tasklists/[tasklistID]/tasks/[taskID]`

Moves the specified task to another position in the task list. This can include putting it as a child task under a new parent and/or move it to a different position among its sibling tasks.

Path Parameters

```jsx
{
"tasklistID":string, // Task list identifier.
"taskID" : string // Task identifier.
}
```

Request Body :

```jsx
{
"resource":Task // object
}
```

Response Body

```jsx
{
"resource":Task // object
}
```

### Tasks.patch

`PATCH /api/tasklists/[tasklistID]/tasks/[taskID]`

Path Parameters

```jsx
{
"tasklistID":string, // Task list identifier.
"taskID" : string // Task identifier.
}
```

Request Body :

```jsx
{
"resource":Task // object
}
```

Response Body

```jsx
{
"resource":Task // object
}
```

## Auth

decided to use email authentication with [https://app-smtp.sendinblue.com/real-time](https://app-smtp.sendinblue.com/real-time) as smtp server and nodemailer npm package to send email

### Auth.singup

`POST /api/auth/signup`

Request Body

```jsx
{
"email":string,
"password":string
}
```

Response Header

```jsx
{
"Authorization":string // jwt
}
```

Resopnse Body: **Empty**

### Auth.ValidateOTP

`PUT /api/auth/signup`

Request_hader

```jsx
{
"Authorization":string // otp jwt
}
```

Request Body

```jsx
{
"OTP":string 
}
```

Response Header

```jsx
{
"Authorization":string // session jwt 
}
```

Resopnse Body: **Empty**

### Auth.login

`POST /api/auth/login`

Request Header: **Empty**

Request Body: 

```jsx
{
"email":string,
"password":string
}
```

Response Header

```jsx
{
"Authorization":string //session jwt
}
```

Resopnse Body: **Empty**

### Auth.delete

`DELETE /api/auth/login`

Request Header

```jsx
{
"Authorization":string //session jwt
}
```

Request Body: 

```jsx
{

"password":string
}
```

Resopnse Body: **Empty**

### Auth.logout

`DELETE /api/auth/login`

Request Header

```jsx
{
"Authorization":string //session jwt
}
```

Request Body: **Empty**

Resopnse Body: **Empty**

## Database

collections 

- users
- tasklists
- tasks
- otps

### Users

```jsx
{
"email":string,
"passwordHash":string,
"createdAt":Date, // Object
"id":string,
"sessions":string[] // will be jwt tokens of 1 months
}

```

### Tasklists

```jsx
{
	"userId":string ,   // 
//  "kind": string,      // This is always "tasks#taskList". This will not be implemented on database insted it will be generated
  "id": string,        // Task list identifier.
  "etag": string,      // ETag of the resource.  https://github.com/jshttp/etag  etag will change when content canges
  "title": string,     // Title of the task list.
  "updated": string,   // Last modification time of the task list (as a RFC 3339 timestamp).
  "selfLink": string   // URL pointing to this task list. Used to retrieve, update, or delete this task list.
}
```

### Tasks

```jsx
{
	
  // "kind": string,    //  This is always "tasks#task". This will not be implemented on database insted it will be generated
  "tasklistId":string, // id of the parent tasklist
  "id": string,      // Task identifier.
  "etag": string,    // ETag of the resource.
  "title": string,   // Title of the task.
  "updated": string, // Last modification time of the task (as a RFC 3339 timestamp).
  "selfLink": string, // URL pointing to this task. Used to retrieve, update, or delete this task.
  "parent": string,   // Parent task identifier. This field is omitted if it is a top-level task. This field is read-only. Use the "move" method to move the task under a different parent or to the top level.
  "position": string, // String indicating the position of the task among its sibling tasks under the same parent task or at the top level. If this string is greater than another task's corresponding position string according to lexicographical ordering, the task is positioned after the other task under the same parent task (or at the top level). This field is read-only. Use the "move" method to move the task to another position.
  "notes": string,    // Notes describing the task. Optional.
  "status": string,   // Status of the task. This is either "needsAction" or "completed".
  "due": string,      // Due date of the task (as a RFC 3339 timestamp). Optional. The due date only records date information; the time portion of the timestamp is discarded when setting the due date. It isn't possible to read or write the time that a task is due via the API.
  "completed": string, // Completion date of the task (as a RFC 3339 timestamp). This field is omitted if the task has not been completed.
  "deleted": boolean,  // Flag indicating whether the task has been deleted. The default is False.
  "hidden": boolean,   // Flag indicating whether the task is hidden. This is the case if the task had been marked completed when the task list was last cleared. The default is False. This field is read-only.
  "links": [           // Collection of links. This collection is read-only.
    {
      "type": string,  // Type of the link, e.g. "email".
      "description": string,  // The description. In HTML speak: Everything between <a> and </a>.
      "link": string   // The URL.
    }
  ]
}
```

### Otps

```jsx
{
"otpToken":string,
"otp":number,
"email":string,  // main key
"passwordHash":string,
"createdAt":Date //Object. time for later clean up

}
```

## API Structure

api —>auth

     —>signup

     —>login

      —>tasklists/[tasklists]

       —>tasks/[tasks]