// ===== SP Users API =====

import AuthAPI from './AuthAPI';

export interface SPUserData {
	Title: string;
	Email: string;
	UserPrincipalName: string;
}

class SPUsersAPI {
	// class property types
	#userUrl: string;
	#baseHeaders: Headers;
	#baseQuery: {
		$select?: string;
		$expand?: string;
	};

	constructor() {
		this.#baseHeaders = AuthAPI.baseHeaders;
		this.#userUrl = import.meta.env.VITE_APP_USERS_URL + '_api/web/';
		this.#baseQuery = {
			$select: 'Title,Email,UserPrincipalName',
		};
	}

	// Get the currently logged-in SP user. Returns SPUserData.
	async getCurrentUser(): Promise<SPUserData> {
		const url = new URL('currentuser', this.#userUrl);
		const filter = {
			...this.#baseQuery,
		};
		url.search = new URLSearchParams(filter).toString();
		const response = await fetch(url, {
			method: 'GET',
			headers: this.#baseHeaders,
		});

		const data = await response.json();

		return data.d as SPUserData;
	}

	// Get by ID, only used to get SP information when run locally. Returns SPUserData.
	async getByID(devUserID: number): Promise<SPUserData> {
		const url = new URL('siteusers?', this.#userUrl);
		const filter = {
			...this.#baseQuery,
			$filter: 'Id eq ' + devUserID,
		};
		url.search = new URLSearchParams(filter).toString();
		const response = await fetch(url, {
			method: 'GET',
			headers: this.#baseHeaders,
		});
		const data = await response.json();

		return data.d.results[0] as SPUserData;
	}
}

export default new SPUsersAPI();
