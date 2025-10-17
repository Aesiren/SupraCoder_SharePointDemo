import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useErrorStore } from './errorStore';
import SPListAPI, { type SPListData } from '@/api/SPListAPI';

export const useSPListStore = defineStore('lists', () => {
	const errorStore = useErrorStore();
	const loading = ref<boolean>(true);
	const loaded = ref<boolean>(false);
	const spListData = ref<SPListData>(<SPListData>{});

	async function getList(): Promise<void> {
		console.log('Getting list...');
		try {
			spListData.value = await SPListAPI.getSPListData();
		} catch (err: unknown) {
			errorStore.logError(err, 'Error fetching SharePoint List information', 'spListStore.ts');
		}
	}

	async function initialize() {
		console.log('Initializing...');
		loading.value = true;

		try {
			await getList();
		} catch (err) {
			errorStore.logError(err, 'Error in initialization()', 'spListStore.ts');
		}

		loading.value = false;
		loaded.value = true;
	}

	return {
		initialize,
		loading,
		loaded,
		spListData,
	};
});
