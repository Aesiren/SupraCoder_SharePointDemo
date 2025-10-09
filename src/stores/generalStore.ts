import { defineStore } from 'pinia';
import { useStorage, useDark, useToggle, useBreakpoints } from '@vueuse/core';
// import type { localSearchData } from '@/types';

export const useGeneralStore = defineStore('general', () => {
	// Theme
	// useDark uses local storage to persist selection.
	const isDark = useDark({
		selector: 'html',
		valueDark: 'dark',
		valueLight: 'light',
	});
	const toggleDark = useToggle(isDark);
	// clear selection entirely, if needed.
	function preferSystemTheme() {
		const storedValue = useStorage('vueuse-color-scheme', 'light');
		storedValue.value = null;
	}

	// window size
	const breakpoints = useBreakpoints({
		tiny: 0, // optional
		small: 700, // navrail becomes square in top left
		medium: 1200, // navrail overlays content when expanded
		large: 1800, // navrail pushes content when expanded
	});

	const size = breakpoints.active();

	return {
		isDark,
		size,
		toggleDark,
		preferSystemTheme,
	};
});
