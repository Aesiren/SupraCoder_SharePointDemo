<script setup lang="ts">
import { AtlasClassificationBanner } from '@sscatlas/atlas-design-system-vue';
import HeaderLogo from '@/components/ui/HeaderLogo.vue';
import ProfileDropdown from '@/components/ProfileDropdown.vue';

import { RouterView, useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useSPListStore } from './stores/spListStore';
import { useGeneralStore } from '@/stores/generalStore';

const userStore = useUserStore();
const listStore = useSPListStore();
const generalStore = useGeneralStore();
const router = useRouter();

const loading = ref(true);
const windowWidth = ref(window.innerWidth);
const showProfileDropdown = ref(false);

onMounted(() => {
	if (!userStore.loaded) userStore.initialize().finally(() => (loading.value = false));
	window.addEventListener('resize', () => {
		windowWidth.value = window.innerWidth;
	});

	if (!listStore.loaded) listStore.initialize().finally(() => (loading.value = false));
	window.addEventListener('resize', () => {
		windowWidth.value = window.innerWidth;
	});
});

function routeHome() {
	router.push({ name: 'home' });
}

function toggleProfileDropdown() {
	showProfileDropdown.value = !showProfileDropdown.value;
}

const currentRole = ref<'rater' | 'ratee'>('ratee');
function switchUserRole(role: 'rater' | 'ratee') {
	currentRole.value = role;
}

</script>

<template>
	<div id="main" v-if="userStore.loaded && userStore.spUserData != null">
		<AtlasClassificationBanner level="CUI Privacy" />
		<div class="header">
			<div class="header-logo-container">
				<HeaderLogo v-if="windowWidth > 500" :dark="generalStore.isDark" :small="generalStore.size === 'tiny'"
					@click="routeHome" />
				<HeaderLogo v-else :dark="generalStore.isDark" :small="true" />
			</div>
			<div class="spacer"></div>
		</div>

		<div class="content">
			<RouterView #default="{ Component }">
				<transition>
					<component :is="Component" />
				</transition>
			</RouterView>
		</div>
	</div>
</template>

<style scoped>
#main {
	width: 100vw;
}

.header {
	display: grid;
	grid-template-columns: auto 1fr auto auto;
	grid-gap: var(--padding-m, 16px);
	height: 64px;
	background: var(--surface-secondary, rgba(235, 238, 240, 0.60));
	padding: var(--padding-s, 12px);
	box-sizing: border-box;
}

.header-logo-container {
	display: flex;
	align-items: center;
	justify-content: center;
}

.profile-icon-container {
	border-radius: 50%;
	overflow: hidden;
	width: 40px;
	height: 40px;

	/* padding: 2px; */
}

.profile-icon-border {
	border-radius: 50%;
	overflow: hidden;
	padding: 2px;
	width: 46px;
	height: 46px;
	border: 1px solid var(--ui-victory-blue-450, #005480);
	transition: box-shadow 0.3s;
}

.profile-icon-border:hover {
	cursor: pointer;
	box-shadow: 0 0 0 1px var(--ui-victory-blue-450, #005480);
}

.profile-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background: var(--primary-default, #122336);
	color: white;
}

.content {
	padding: 12px 148px;
	display: flex;
	flex-direction: column;
	min-height: calc(100vh - 150px);
	box-sizing: border-box;
	justify-content: stretch;
}
</style>
