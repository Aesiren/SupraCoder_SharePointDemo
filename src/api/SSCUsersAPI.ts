// ===== SSC Users API =====

import AuthAPI from './AuthAPI';

export interface SSCUserData {
	__metadata: {
		type: string;
	};
	AttachmentFiles: {
		results: {
			FileName: string;
			ServerRelativePath: {
				DecodedUrl: string;
			};
			ServerRelativeUrl: string;
		}[];
	};
	User_Id: string;
	Mil_Rank: string;
	Name: string;
	Email: string;
	Started_Immersion: boolean;
	Employment_Category: string;
	Workplace: string;
	Leadership: boolean;
	Job_Title: string;
	Organization: string;
	Step_Completed: number;
	Completed_Immersion: boolean;
	Description: string;
	About_Me: string;
	Phone: string;
	Education: string;
	Certification: string;
	ContactDirectoryRecentSearch: string;
	Views: number;
	InterestsId: {
		results: number[];
	};
	SavedContactsId: {
		results: number[];
	};
	ResourcesId: {
		results: number[];
	};
	ApplicationsId: {
		results: number[];
	};
	SavedArticlesId: {
		results: number[];
	};
	SkillsId: {
		results: number[];
	};
	SavedJobsId: {
		results: number[];
	};
	ID: number;
}

class SSCUsersAPI {
	// class property types
	#listUrl: string;
	#baseHeaders: Headers;
	#itemEntityType: string;
	#baseQuery: {
		$select?: string;
		$expand?: string;
	};

	constructor() {
		this.#listUrl = import.meta.env.VITE_APP_LISTS_BASE_URL + "_api/web/lists/GetByTitle('Users')/";
		this.#baseHeaders = AuthAPI.baseHeaders;
		this.#itemEntityType = 'SP.Data.UsersListItem';
		this.#baseQuery = {
			$select:
				'Name,User_Id,Organization,Email,Employment_Category,Workplace,Leadership,Job_Title,Started_Immersion,Step_Completed,Completed_Immersion,Mil_Rank,Description,About_Me,Phone,Education,Certification,ContactDirectoryRecentSearch,Views,Notifications,InterestsId,ResourcesId,ApplicationsId,SavedContactsId,SavedArticlesId,SkillsId,SavedJobsId,ID',
			$expand: 'AttachmentFiles/URL',
		};
	}

	// Get one by email, returns SSCUserData
	async getByEmail(email: string): Promise<SSCUserData> {
		const url = new URL('items', this.#listUrl);
		const filter = {
			...this.#baseQuery,
			$filter: `Email eq '${email}'`,
		};

		url.search = new URLSearchParams(filter).toString();

		const response = await fetch(url, {
			method: 'GET',
			headers: this.#baseHeaders,
		});

		const data = await response.json();

		return data.d.results[0] as SSCUserData;
	}

	// Get one by listID, returns SSCUserData
	async getByListID(listID: number): Promise<SSCUserData> {
		const url = new URL('items', this.#listUrl);
		const filter = {
			...this.#baseQuery,
			$filter: `ID eq '${listID}'`,
		};

		url.search = new URLSearchParams(filter).toString();

		const response = await fetch(url, {
			method: 'GET',
			headers: this.#baseHeaders,
		});

		const data = await response.json();

		return data.d.results[0] as SSCUserData;
	}

	// Merge User list item. No return.
	async mergeUser(payload: Partial<SSCUserData>): Promise<void> {
		const listFormDigestValue = await AuthAPI.getDigestValue();

		// temp headers for MERGE
		const headers = new Headers({
			'If-Match': '*',
			'X-HTTP-Method': 'MERGE',
			'X-RequestDigest': listFormDigestValue,
		});

		// add the base headers
		for (const h of this.#baseHeaders.entries()) {
			headers.append(h[0], h[1]);
		}

		// add item entity type to __metdata
		payload.__metadata = { type: this.#itemEntityType };

		const url = new URL('items' + '(' + payload.ID + ')', this.#listUrl);
		await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload),
		});
	}

	async searchSSCUsers(queryStrings: string[]): Promise<SSCUserData[]> {
		const url = new URL('items', this.#listUrl);
		let filterString = '';
		for (let i = 0; i < queryStrings.length; i++) {
			if (i !== 0) {
				filterString += ' and ';
			}
			filterString += `substringof('${queryStrings[i]}',Name)`;
		}
		const filter = {
			...this.#baseQuery,
			$filter: filterString,
			$top: '20',
		};

		url.search = new URLSearchParams(filter).toString();

		const response = await fetch(url, {
			method: 'GET',
			headers: this.#baseHeaders,
		});

		const data = await response.json();

		return data.d.results as SSCUserData[];
	}

	// Used when uploading an image. Turns a file into a buffer.
	async #readFile(file: File): Promise<ArrayBuffer> {
		const reader = new Blob([file]);
		return await reader.arrayBuffer();
	}

	// Attach a file to a user by the list item ID. Used to attach a profile picture to the user's data.
	async postUserAttachment(file: File, filename: string, itemID: number): Promise<void> {
		const listFormDigestValue = await AuthAPI.getDigestValue();

		const headers = new Headers({
			'X-RequestDigest': listFormDigestValue,
		});

		// add the base headers
		for (const h of this.#baseHeaders.entries()) {
			headers.append(h[0], h[1]);
		}

		const url = new URL(`items(${itemID})/AttachmentFiles/add(FileName='${filename}')`, this.#listUrl);
		const buffer = await this.#readFile(file);
		await fetch(url, {
			method: 'POST',
			body: buffer,
			headers,
		});
	}

	// Delete a file attached to a user list item.
	async deleteUserAttachment(filename: string, itemID: number): Promise<void> {
		const listFormDigestValue = await AuthAPI.getDigestValue();

		const headers = new Headers({
			'X-RequestDigest': listFormDigestValue,
			'X-HTTP-Method': 'DELETE',
		});

		// add the base headers
		for (const h of this.#baseHeaders.entries()) {
			headers.append(h[0], h[1]);
		}

		const url = new URL(`items(${itemID})/AttachmentFiles/getByFileName('${filename}')`, this.#listUrl);
		await fetch(url, {
			method: 'POST',
			headers,
		});
	}
}

export default new SSCUsersAPI();
