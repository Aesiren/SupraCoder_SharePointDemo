import AuthAPI from './AuthAPI';

export interface SPListData {
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
	#baseQuery: {
		$select?: string;
	};

	constructor() {
		this.#listUrl = import.meta.env.VITE_APP_LISTS_BASE_URL + "_api/web/lists/GetByTitle('SupraCoder-Evan')/items";
		this.#baseHeaders = AuthAPI.baseHeaders;
		this.#baseQuery = {
			$select: 'Title,Game,Show,Movie,Food,Change',
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

		return data.d.results[0] as SPListData;
	}
}

export default new SPListAPI();
