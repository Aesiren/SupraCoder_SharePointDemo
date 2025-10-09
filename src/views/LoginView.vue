<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();
</script>

<template>
	<div>Login Page Placeholder</div>
	<main>Hello, {{ userStore.spUserData.Title }}</main>
	<router-link to="/dashboard">Go to My Home</router-link>
</template>
