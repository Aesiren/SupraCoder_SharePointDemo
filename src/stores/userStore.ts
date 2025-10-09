import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useErrorStore } from './errorStore';
import SPUsersAPI, { type SPUserData } from '@/api/SPUsersAPI';
import SSCUsersAPI, { type SSCUserData } from '@/api/SSCUsersAPI';

export const useUserStore = defineStore('users', () => {
	const errorStore = useErrorStore();
	const loading = ref<boolean>(true);
	const loaded = ref<boolean>(false);
	const spUserData = ref<SPUserData>(<SPUserData>{});
	const currentUser = ref<SSCUserData>(<SSCUserData>{});

	async function getUser() {
		if (import.meta.env.VITE_APP_ENV === 'development') {
			await getDevSPUser();
		} else {
			await getProdSPUser();
		}
		await getSSCUser();
	}

	async function getDevSPUser(): Promise<void> {
		try {
			spUserData.value = await SPUsersAPI.getByID(import.meta.env.VITE_APP_DEV_ID);
		} catch (err: unknown) {
			errorStore.logError(
				err,
				'Error fetching Sharepoint Developer User information',
				'userStore.ts',
				import.meta.env.VITE_APP_DEV_ID
			);
		}
	}

	async function getProdSPUser(): Promise<void> {
		try {
			spUserData.value = await SPUsersAPI.getCurrentUser();
		} catch (err: unknown) {
			errorStore.logError(err, 'Error fetching Sharepoint User information', 'userStore.ts');
		}
	}

	async function getSSCUser(): Promise<void> {
		try {
			currentUser.value = await SSCUsersAPI.getByEmail(spUserData.value.Email);
		} catch (err: unknown) {
			errorStore.logError(err, 'Error fetching MySSC User information', 'userStore.ts', spUserData.value.Email);
		}
	}

	async function searchUsers(queryString: string): Promise<SSCUserData[]> {
		const queryStrings = queryString.toUpperCase().split(/\W+/g);
		try {
			const queriedUsers = await SSCUsersAPI.searchSSCUsers(queryStrings);

			return queriedUsers;
		} catch (err: unknown) {
			errorStore.logError(
				err,
				'Error searching for other MySSC User information',
				'userStore.ts',
				JSON.stringify(queryStrings)
			);
			return [];
		}
	}

	async function updateUser(payload: Partial<SSCUserData>): Promise<void> {
		payload.ID = currentUser.value.ID;
		try {
			await SSCUsersAPI.mergeUser(payload);
			await getSSCUser();
		} catch (err: unknown) {
			errorStore.logError(
				err,
				'Error searching for other MySSC User information',
				'userStore.ts',
				JSON.stringify(payload)
			);
		}
	}

	// async function uploadPhoto(file: File) {
	// 	try {
	// 		if (currentUser.value.AttachmentFiles.results.length > 0) {
	// 			for (const i in currentUser.value.AttachmentFiles.results) {
	// 				await SSCUsersAPI.deleteUserAttachment(
	// 					currentUser.value.AttachmentFiles.results[i].FileName,
	// 					currentUser.value.ID
	// 				);
	// 			}
	// 		}
	// 		await SSCUsersAPI.postUserAttachment(file, file.name, currentUser.value.ID);
	// 		await getUser();
	// 	} catch (err) {
	// 		errorStore.logError(err, 'Error updating updating photo', 'userStore.ts');
	// 	}
	// }

	// use computed to extract data from the currentUser object that is needed in other stores
	const profilePic = computed(() => {
		if (currentUser.value?.AttachmentFiles?.results[0]?.ServerRelativeUrl) {
			return import.meta.env.VITE_APP_BASE + currentUser.value?.AttachmentFiles?.results[0]?.ServerRelativeUrl;
		} else {
			return '';
		}
	});

	const userID = computed(() => currentUser.value.User_Id || '');
	const letter = computed(() => currentUser.value.Name?.charAt(0) || '');
	const userInitials = computed(() => {
		if (!currentUser.value?.Name) {
			return '';
		}
		const fullNameArray: string[] = currentUser.value.Name.split(' ');
		if (fullNameArray.length === 0) {
			return '';
		}
		const firstNameInitial: string = fullNameArray[0]?.[0] || '';
		const lastNameInitial: string = fullNameArray[fullNameArray.length - 1]?.[0] || '';
		const initials: string = `${firstNameInitial}${lastNameInitial}`;

		return initials;
	});

	async function initialize() {
		loading.value = true;

		try {
			await getUser();
		} catch (err) {
			errorStore.logError(err, 'Error in initialize()', 'userStore.ts');
		}

		loading.value = false;
		loaded.value = true;
	}

	return {
		initialize,
		loading,
		loaded,
		updateUser,
		searchUsers,
		profilePic,
		userID,
		letter,
		userInitials,
		currentUser,
		spUserData,
		// uploadPhoto,
	};
});
