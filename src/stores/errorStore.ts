import { defineStore } from 'pinia';
import ErrorsAPI from '@/api/ErrorsAPI';
import { useUserStore } from './userStore';

export const useErrorStore = defineStore('errors', () => {
	const application = 'MySSC';
	const userStore = useUserStore();

	async function logError(error: unknown, Title: string, location: string, payload: string | number = 'no payload') {
		if (error instanceof Error) {
			const errorData = {
				Title: Title,
				application: application,
				location: location,
				payload: payload,
				message: error.message,
				userID: userStore.userID || 'No User Data Loaded',
			};
			console.log(error.message);
			try {
				await ErrorsAPI.postError(errorData);
				console.log('Error data posted to remote log');
			} catch (err) {
				// This would be rough.
				console.log('Failed to post error data posted to remote log');
				if (err instanceof Error) {
					console.log(err.message);
				}
			}
		}
	}
	return { logError };
});
