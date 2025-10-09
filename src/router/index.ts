import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';

const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'login',
			component: LoginView,
		},
		{
			path: '/dashboard',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/home',
			redirect: '/dashboard',
		},
	],
});

export default router;
