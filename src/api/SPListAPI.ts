import myAuth from './AuthAPI';
import AuthAPI from './AuthAPI';

export interface SPListData {
	__metadata: {
		type: string;
	};
	ID: number;
	Title: string;
	Game: string;
	Show: string;
	Movie: string;
	Food: string;
	Change: string;
}

class SPListAPI {
	//class property types
	#listUrl: string;
	#baseHeaders: Headers;
	#itemEntityType: string;
	#baseQuery: {
		$select?: string;
	};

	constructor() {
		this.#listUrl = import.meta.env.VITE_APP_LISTS_BASE_URL + "_api/web/lists/GetByTitle('SupraCoder-Evan')/items";
		this.#baseHeaders = myAuth.baseHeaders;
		this.#itemEntityType = 'SP.Data.SupraCoderEvanListItem';
		this.#baseQuery = {
			$select: 'ID,Title,Game,Show,Movie,Food,Change',
		};
	}

	async getSPListData() {
		console.log('Getting list...');
		const url = new URL(this.#listUrl);
		url.search = new URLSearchParams(this.#baseQuery).toString();

		const response = await fetch(url, {
			method: 'GET',
			headers: this.#baseHeaders,
		});
		if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
		const data = await response.json();

		return data.d.results as SPListData[];
	}

	async updateSPListData(itemId: number, data: Partial<SPListData>): Promise<any> {
		const url = `${this.#listUrl}(${itemId})`;

		const listFormDigestValue = await myAuth.getDigestValue();

		data.__metadata = { type: this.#itemEntityType };
		const headers = new Headers({
			Accept: 'application/json;odata=verbose',
			'Content-Type': 'application/json;odata=verbose',
			'X-RequestDigest': listFormDigestValue,
			'IF-MATCH': '*',
			'X-HTTP-Method': 'MERGE',
		});

		for (const h of this.#baseHeaders.entries()) {
			if (h[0].toLowerCase() !== 'accept' && h[0].toLowerCase() !== 'content-type') {
				headers.append(h[0], h[1]);
			}
		}
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`Update failed: ${response.status}`);
		}
	}

	async addSPListData(data: Partial<SPListData>) {
		const url = new URL(this.#listUrl);
		const listFormDigestValue = await AuthAPI.getDigestValue();

		data.__metadata = { type: this.#itemEntityType };

		const headers = new Headers({
			Accept: 'application/json;odata=verbose',
			'Content-Type': 'application/json;odata=verbose',
			'X-RequestDigest': listFormDigestValue,
		});

		for (const h of this.#baseHeaders.entries()) {
			if (h[0].toLowerCase() !== 'accept' && h[0].toLowerCase() !== 'content-type') {
				headers.append(h[0], h[1]);
			}
		}
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`Creation failed: ${response.status}`);
		}
	}
}

export default new SPListAPI();
