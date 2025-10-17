<script setup lang="ts">
import User from '../components/User.vue';
import SharepointData from '@/components/SharepointData.vue';
import { useUserStore } from '@/stores/userStore';
</script>

<template>
	<div class="home">
		<User />
		<SharepointData />
	</div>

</template>

<style scoped></style>