// ===== Sharepoint Token API ===== //

// There are two types of auth needed.

// 1) API Token when running locally in dev mode.
// 	This class will add the token to its headers when needed,
// 	other API classes will use these headers.

// 2) Digest value for all REST operations besides GET.
//	The digest value lasts for 30 minutes,
//	So this class will refresh it when needed.

class AuthAPI {
	// class property types
	baseHeaders: Headers;
	digestURL: string;
	digestValue: string;
	digestTimeStamp: Date;
	digestTimeLimit: number;

	constructor() {
		this.baseHeaders = new Headers({
			Accept: 'application/json;odata=verbose',
			'Content-Type': 'application/json;odata=verbose',
		});
		this.digestURL = import.meta.env.VITE_APP_LISTS_BASE_URL + '_api/contextinfo';
		this.digestValue = '';
		this.digestTimeStamp = {} as Date;
		this.digestTimeLimit = 1000 * 60 * 30;
	}

	// Retrieve token, if running locally.
	async retrieveToken(): Promise<void> {
		console.log('Grabbing New Dev Token');
		try {
			const response = await fetch(import.meta.env.VITE_APP_TOKEN_URL, {
				method: 'GET',
				headers: this.baseHeaders,
			});
			
			if (!response.ok) {
				console.warn('Token server not available in development mode, proceeding without token');
				return;
			}
			
			const data = await response.json();
			this.baseHeaders.append('Authorization', 'Bearer ' + data.access_token);
		} catch (error) {
			console.warn('Failed to retrieve development token, proceeding without token:', error);
		}
	}

	// Retrieve digest value, returns string.
	async getDigestValue(): Promise<string> {
		const currentTime = new Date();
		if (this.digestValue && currentTime.getTime() - this.digestTimeStamp.getTime() <= this.digestTimeLimit) {
			return this.digestValue;
		} else {
			console.log('Grabbing New Digest Value');
			try {
				const response = await fetch(this.digestURL, {
					method: 'POST',
					headers: this.baseHeaders,
				});
				
				if (!response.ok) {
					console.warn('Digest endpoint not available, using fallback digest value');
					this.digestValue = 'development-digest-fallback';
					this.digestTimeStamp = new Date();
					return this.digestValue;
				}
				
				const json = await response.json();
				this.digestTimeStamp = new Date();
				this.digestValue = json.d.GetContextWebInformation.FormDigestValue;
				return json.d.GetContextWebInformation.FormDigestValue;
			} catch (error) {
				console.warn('Failed to retrieve digest value, using fallback:', error);
				this.digestValue = 'development-digest-fallback';
				this.digestTimeStamp = new Date();
				return this.digestValue;
			}
		}
	}
}

// Create a TokenAPI instance
const myAuth = new AuthAPI();
// Grab Token (if needed)
if (import.meta.env.VITE_APP_ENV === 'development') {
	await myAuth.retrieveToken();
}

export default myAuth;
