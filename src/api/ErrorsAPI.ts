// ===== Errors API =====

import AuthAPI from './AuthAPI';

export interface errorData {
	__metadata: {
		type: string;
	};
	Title: string;
	application: string;
	userID: string;
	location: string;
	payload: string | number;
	message: string;
	ID: number;
}

class ErrorsAPI {
	// class property types
	#listUrl: string;
	#baseHeaders: Headers;
	#itemEntityType: string;
	#baseQuery: {
		$select?: string;
		$expand?: string;
	};

	constructor() {
		this.#listUrl = import.meta.env.VITE_APP_LISTS_BASE_URL + "_api/web/lists/GetByTitle('Errors')/";
		this.#baseHeaders = AuthAPI.baseHeaders;
		this.#itemEntityType = 'SP.Data.ErrorsListItem';
		this.#baseQuery = {
			$select: 'Title,application,userID,location,payload,message,ID',
		};
	}

	// Send an error to SP. Returns the posted item as errorData.
	async postError(payload: Partial<errorData>): Promise<errorData> {
		const digestValue = await AuthAPI.getDigestValue();

		// temp headers for post
		const headers = new Headers({
			'X-RequestDigest': digestValue,
		});

		// add the base headers
		for (const h of this.#baseHeaders.entries()) {
			headers.append(h[0], h[1]);
		}

		// add item entity type to __metdata
		payload.__metadata = { type: this.#itemEntityType };

		const url = new URL('items', this.#listUrl);
		const filter = {
			...this.#baseQuery,
		};
		url.search = new URLSearchParams(filter).toString();
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload),
		});

		const data = await response.json();

		return data.d as errorData;
	}
}

export default new ErrorsAPI();
