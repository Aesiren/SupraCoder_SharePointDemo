# API Documentation

### Overview

The MySSC app and other associated pages use Sharepoint Lists to store and coordinate data. The online documentation for the SP REST API has some contradictions or missing information, so this document is meant to describe how it is used within this app, as well as a general how-to with tips and tricks. Microsoft's documentation for the API can be found [here,](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service?tabs=csom) or more specifically their documentation for working with list items can be found [here.](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest)

### Open Data Protocal

Sharepoint uses Open Data Protocal or OData to make more specific queries. You can read more about OData at [Odata.org](https://www.odata.org/) or on [learn.Microsoft](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service?tabs=csom#odata-resources), but this document will outline exactly what is used.

When you see $select, $filter, or other parameters in the request URL, just know that those are from OData.

## Request Structure

Whenever a typescript fetch request is shown, the created HTTP request will be shown below it.

### Headers

There is a set of 2 headers often called the baseHeaders.

The first is Accept, which is required to tell Sharepoint what format to return data.
The second is Content-Type, which is only required when sending a body to let Sharepoint know what format the incoming data is in. It is always included for simplicity.

```ts
const baseHeaders = {
	Accept: 'application/json;odata=verbose',
	'Content-Type': 'application/json;odata=verbose',
};
```

You will often see a format similar to below in the API.ts files.

```ts
fetch("{EndpointURL}/_api/web/lists/GetByTitle('{ListName}')/items", {
	method: 'GET',
	headers: this.#baseHeaders,
});
```

```http
GET {EndpointURL}/_api/web/lists/GetByTitle('{ListName}')/items
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"
```

### Authorization

When making a request from outside of Sharepoint (for example, when running the app locally in development mode) an Authorization header is required. This header must be formatted like

```ts
{
	Authorization: 'Bearer ' + accessToken;
}
```

and the token is received from it's own endpoint in a separate request. See the AuthAPI.ts file for how this token is received. The AuthAPI class adds that header to the baseHeaders if needed, and all other API classes use the AuthAPI's baseHeaders to minimize code and requests that are otherwise unneeded in production builds. For the rest of this documentation, it will not be shown, but know that it is included when the app is run locally.

### Query Parameters

To make a more specific request, OData parameters are used and tacked on to the url.

- \$select - Choose which fields are returned. Field names must be an exact match to the internal Sharepoint name.
- \$filter - Limit the returned items to those that satisfy a condition. Format is "FieldName xx Value" where xx is a 2 letter conditional. See [here](https://docs.oasis-open.org/odata/odata/v4.01/cs01/part2-url-conventions/odata-v4.01-cs01-part2-url-conventions.html#sec_SystemQueryOptionfilter) for all options.
- \$orderby - Tell Sharepoint to order the return, formatted like "FieldName desc."
- \$top - Tell Sharepoint how many items to return. Default is 100 items.
- \$expand - Some data associated with items is not returned by default, so you must specify that you want it. Only used to get list item attachments, namely to get attached profile picture URLs for MySSC users.

Query parameters are added using the built-in URL class, which is already used to construct the request url anyways. Here is an example from the RecentActivityAPI class. userID is "123xyz" for this example.

```ts
this.#listUrl = "https://sscorder66.sharepoint.com/sites/dev/_api/web/lists/GetByTitle('RecentActivity')"
this.#baseHeaders = {
	Accept: "application/json;odata=verbose",
	"Content-Type": "application/json;odata=verbose",
}


async getByUserId(userId: string): Promise<activityData[]> {
	const url = new URL("items", this.#listUrl);
	const filter = {
		$filter: `User_Id eq '${userId}'`,
		$select: "Title,User_Id,Update,ID",
	};
	url.search = new URLSearchParams(filter).toString();

	const response = await fetch(url, {
		method: "GET",
		headers: this.#baseHeaders,
	});

	const data = await response.json();

	return data.d.results as activityData[];
}
```

```http
GET https://sscorder66.sharepoint.com/sites/dev/_api/web/lists/GetByTitle('RecentActivity')/items?$select=Title,User_Id,Update,ID&$filter=User_Id eq '123xyz'
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"

```

## Get All

The most basic request. Simply add "items" to the request url, attach headers, and fire. Almost always, $select is used to limit the data to only what we care about (and exlude the many default fields that Sharepoint would otherwise include).

For all GET requests (except for one way to get a single entry outlined later), Sharepoint will return a JSON object of the format

```JSON
{
    "d": {
        "results": [...dataObjects
        ]
    }
}
```

Example:

```ts
// From InterestsAPI.ts
async getAll(): Promise<interestData[]> {
	const url = new URL("items", this.#listUrl);
	const filter = {
		$select: "Title,Category_Name,Subcategory_Of,icon,cardTitle,ID",
	};
	url.search = new URLSearchParams(filter).toString();

	const response = await fetch(url, {
		method: "GET",
		headers: this.#baseHeaders,
	});

	const data = await response.json();

	return data.d.results as interestData[];
}
```

```http
GET https://sscorder66.sharepoint.com/sites/dev/_api/web/lists/GetByTitle('Interests')/items?$select=Title,Category_Name,Subcategory_Of,icon,cardTitle,ID
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"
```

## Get One

There are two ways to get a single item.
The first is to add the list item ID to the url like so:

```http
GET https://{site_url}/_api/web/lists/GetByTitle('exampleList')/items({item_id})
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"
```

or with a filled-out example:

```http
GET https://sscorder66.sharepoint.com/sites/dev/_api/web/lists/GetByTitle('Interests')/items(1)
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"
```

Only when usings items(x), Sharepoint will respond with a JSON object without the "results" property:

```JSON
{
    "d": {...dataObject
    }
}
```

The second method is to $filter by a field that you know has unique information, like the getByUserId example from before.

## Post

The basic POST request adds a new item to a Sharepoint list. Any request that attempts to alter data on SP, like this one and some below, must include the X-RequestDigest header and the item type meta data. Here is an example from ErrorsAPI.ts:

```ts
this.#itemEntityType = "SP.Data.MySSCErrorsListItem";

async postError(payload: errorData): Promise<errorData> {
	const digestValue = await AuthAPI.getDigestValue();

	// temp headers for post
	const headers = new Headers({
		"X-RequestDigest": digestValue,
	});

	// add the base headers
	for (const h of this.#baseHeaders.entries()) {
		headers.append(h[0], h[1]);
	}

	// add item entity type to __metdata
	payload.__metadata = { type: this.#itemEntityType };

	const url = new URL("items", this.#listUrl);
	const response = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(payload),
	});

	const data = await response.json();

	return data.d as errorData;
}
```

```http
POST https://sscorder66.sharepoint.com/sites/dev/_api/web/lists/GetByTitle('mySSCErrors')/items
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"
X-RequestDigest: {digestValue}

{
  "__metadata": {
    "type": "SP.Data.MySSCErrorsListItem"
  },
  ...otherErrorData
}
```

The AuthAPI class tracks the digest value. It expires after 12 hours, but it is the same for all lists that share the same base URL on Sharepoint. The \_\_metadata property of the body is unique for each list, but it never changes. The itemEntityType property is included in every API class even if unused, in case of future features.

Sharepoint responds to basic POST requests by returning the newly created item like a GET request using items(x). It is often useful to included OData parameters to gain greater control over the returning data.

```JSON
{
    "d": {...dataObject
    }
}
```

## Merge

A MERGE request functions similar to a PATCH request in other REST APIs, but is secretly another POST request. Sharepoint will update an identified item with all fields included in the body of the request. In addition to what is required in a regular POST request, "If-Match": "\*" and "X-HTTP-Method": "MERGE" headers are required, as well as the list item ID in the URL like one of the Get One methods above. Here is an example used to update existing article data:

```ts
this.#itemEntityType = "SP.Data.ArticleListListItem";

async mergeArticle(payload: Partial<articleData>): Promise<void> {
	const digestValue = await AuthAPI.getDigestValue();

	// temp headers for merge
	const headers = new Headers({
		"If-Match": "*",
		"X-HTTP-Method": "MERGE",
		"X-RequestDigest": digestValue,
	});

	// add the base headers
	for (const h of this.#baseHeaders.entries()) {
		headers.append(h[0], h[1]);
	}

	// add item entity type to __metdata
	payload.__metadata = { type: this.#itemEntityType };

	const url = new URL("items" + "(" + payload.ID + ")", this.#listUrl);
	await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(payload),
	});
}
```

```http
POST https://sscorder66.sharepoint.com/sites/dev/_api/web/lists/GetByTitle('ArticleList')/items(01)
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"
If-Match: "*"
X-HTTP-Method: "MERGE"
X-RequestDigest: {digestValue}

{
  "__metadata": {
    "type": "SP.Data.ArticleListListItem"
  },
  ...otherArticleData
}
```

Sharepoint does NOT return a body in the response of a Merge request, but will reply with standard status codes.

## Delete

Delete requests are currently rarely used. Despire DELETE being a standard REST method, this is also a POST request. It is similar to a Merge request but without a body, and "DELETE" for the X-HTTP-Method header:

```ts
this.#itemEntityType = "SP.Data.RecentActivityListItem";

async deleteActivity(itemID: number): Promise<void> {
	const digestValue = await AuthAPI.getDigestValue();

	// temp headers for post
	const headers = new Headers({
		"If-Match": "*",
		"X-HTTP-Method": "DELETE",
		"X-RequestDigest": digestValue,
	});
	// add the base headers
	for (const h of this.#baseHeaders.entries()) {
		headers.append(h[0], h[1]);
	}

	const url = new URL("items" + "(" + itemID + ")", this.#listUrl);
	await fetch(url, {
		method: "POST",
		headers,
	});
}
```

```http
POST https://sscorder66.sharepoint.com/sites/dev/_api/web/lists/GetByTitle('RecentActivity')/items(01)
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"
If-Match: "*"
X-HTTP-Method: "DELETE"
X-RequestDigest: {digestValue}
```

Also like Merge requests, Sharepoint will not have a body in the response.

## Post/Delete Attachment

Sharepoint allows attaching files to list items. In this app, user profile pictures are uploaded and attached to user entries. These files can be added or removed in a way very similar to the Post and Delete methods outlined above, but with unique endpoint URLs. Because these endpoints are only used for SSC User data, I will just include those methods directly from SSCUsersAPI.ts below.

```ts
// Used when uploading an image. Turns a file into a buffer.
async #readFile(file: File): Promise<ArrayBuffer> {
	const reader = new Blob([file]);
	return await reader.arrayBuffer();
}
// Attach a file to a user by the list item ID. Used to attach a profile picture to the user's data.
async postUserAttachment(file: File, filename: string, itemID: number): Promise<void> {
	const listFormDigestValue = await AuthAPI.getDigestValue();

	const headers = new Headers({
		"X-RequestDigest": listFormDigestValue,
	});

	// add the base headers
	for (const h of this.#baseHeaders.entries()) {
		headers.append(h[0], h[1]);
	}

	const url = new URL(`items(${itemID})/AttachmentFiles/add(FileName='${filename}')`, this.#listUrl);
	const buffer = await this.#readFile(file);
	await fetch(url, {
		method: "POST",
		body: buffer,
		headers,
	});
}

// Delete a file attached to a user list item.
async deleteUserAttachment(filename: string, itemID: number): Promise<void> {
	const listFormDigestValue = await AuthAPI.getDigestValue();

	const headers = new Headers({
		"X-RequestDigest": listFormDigestValue,
		"X-HTTP-Method": "DELETE",
	});

	// add the base headers
	for (const h of this.#baseHeaders.entries()) {
		headers.append(h[0], h[1]);
	}

	const url = new URL(`items(${itemID})/AttachmentFiles/getByFileName('${filename}')`, this.#listUrl);
	await fetch(url, {
		method: "POST",
		headers,
	});
}
```

For Post:

```http
POST https://sscorder66.sharepoint.com/sites/dev/_api/web/lists/GetByTitle('Users')/items({itemID})/AttachmentFiles/add(FileName='{filename}')
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"
X-RequestDigest: {digestValue},
{
	...fileBuffer
}
```

For Delete:

```http
POST https://sscorder66.sharepoint.com/sites/dev/_api/web/lists/GetByTitle('Users')/items({itemID})/AttachmentFiles/getByFileName('{filename}')
Accept: "application/json;odata=verbose"
Content-Type: "application/json;odata=verbose"
X-HTTP-Method: "DELETE"
X-RequestDigest: {digestValue}
```

Sharepoint will not include a body in the response when deleting an attachment, but will include data about the file when posting an attachment like below. However, this data is not used in this app, as the file URL is included with the list item.

```JSON
{
    "d": {
        "__metadata": {
            "id": "https://sscorder66.sharepoint.com/sites/dev/_api/Web/Lists(guid'f7355591-c48b-4084-8e0e-84eec23ae341')/Items(5281)/AttachmentFiles('headshot.jpg')",
            "uri": "https://sscorder66.sharepoint.com/sites/dev/_api/Web/Lists(guid'f7355591-c48b-4084-8e0e-84eec23ae341')/Items(5281)/AttachmentFiles('headshot.jpg')",
            "type": "SP.Attachment"
        },
        "FileName": "headshot.jpg",
        "FileNameAsPath": {
            "__metadata": {
                "type": "SP.ResourcePath"
            },
            "DecodedUrl": "headshot.jpg"
        },
        "ServerRelativePath": {
            "__metadata": {
                "type": "SP.ResourcePath"
            },
            "DecodedUrl": "/sites/dev/Lists/Users/Attachments/5281/headshot.jpg"
        },
        "ServerRelativeUrl": "/sites/dev/Lists/Users/Attachments/5281/headshot.jpg"
    }
}
```

To get the URLs of attached files, you must $select "AttachmentFiles" and $expand "AttachmentFiles/URL" in the query parameters.

```ts
const filter = {
	$select: 'AttachmentFiles',
	$expand: 'AttachmentFiles/URL',
};
```
