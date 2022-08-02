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
- Two parts
    - tasks
    - tasklists

### TaskList Object

```jsx
{

  "kind": string,      // Type of the resource. This is always "tasks#taskList".
  "id": string,        // Task list identifier.
  "etag": string,      // ETag of the resource.  https://github.com/jshttp/etag  etag will change when content canges
  "title": string,     // Title of the task list.
  "updated": string,   // Last modification time of the task list (as a RFC 3339 timestamp).
  "selfLink": string   // URL pointing to this task list. Used to retrieve, update, or delete this task list.
}
```

### T**askLists.list**

**`GET /api/tasklists/`** 

Query parametera

```jsx
{
 maxResults: integer, // Maximum number of task lists returned on one page. Optional. The default is 20 (max allowed: 100)
pageToken: string //Token specifying the result page to return. Optional.
}
```

Request Body:  **Empty**

Response body: 

```jsx
{
  "resource": TaskLists //Object
}
```

TaskLists Object

```jsx
{
  "kind": string, //Type of the resource. This is always "tasks#taskLists".
  "etag": string, 
  "nextPageToken": string, //Token that can be used to request the next page of this result.
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
  "kind": string,    // Type of the resource. This is always "tasks#task".
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