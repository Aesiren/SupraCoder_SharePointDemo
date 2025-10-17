<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import moment from "moment";

const userStore = useUserStore();
const formattedDate = moment().format('ddd, D MMM YYYY');
const currentHour = moment().hour();
const isMoon = computed(() => currentHour < 6 || currentHour >= 18);
const timeIcon = computed(() => (isMoon.value ? '🌕' : '☀️'));


function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning,';
  if (hour < 18) return 'Good Afternoon,';
  return 'Good Evening,';
}
</script>

<template>
  <div class="user-container">
    <div class="user-header">
      <span class="time-icon material-rounded" :class="{
        outlined: isMoon,
      }" :style="{
        color: timeIcon,
      }">
        {{ timeIcon }}</span>
      <span class="welcome-date">{{ formattedDate }}, </span>
      <span class="location">{{ userStore.currentUser.Workplace }}</span>
    </div>

    <div class="greeting">
      {{ getGreeting() }}
    </div>

    <div class="user-info">
      <div class="user">
        <div class="user-pic">
          <img v-if="userStore.profilePic != ''" :src="userStore.profilePic" />
          <p v-else>{{ userStore.userInitials }}</p>
          <img class="emblem"
            src="http://sscorder66.sharepoint.com/sites/dev/sscportal/assets/SpaceLaunchEmblem-ZTru3v4r.svg"
            alt="Space Launch Emblem" />
        </div>
        <div class="user-name">
          <p class="user-fullname">{{ userStore.currentUser.Name }}</p>
          <p class="user-title">{{ userStore.currentUser.Job_Title }}</p>
        </div>
      </div>
    </div>

  </div>

</template>

<style scoped>
.user-container {
  display: grid;
  grid-gap: 12px;
  margin: auto;
  align-items: center;
  justify-items: center;
}

.user-header {
  color: var(--text-default, #1e1e1f);
  font-family: var(--font-primary, "roboto flex");
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  letter-spacing: .5px;
  display: flex;
  gap: 5px;
}

.greeting {
  color: var(--text-default, #1e1e1f);
  font-family: var(--font-primary, "roboto flex");
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 150%;
  letter-spacing: .1px;
}

.user-info {
  position: relative;
  margin-left: 50px;
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.user {
  border-radius: 100px;
  height: 100px;
  background-position: 50%;
  background-size: cover;
  background-repeat: no-repeat;
}

.user-pic {
  border-radius: 100px;
  background: var(--primary-default, #122336);
  display: flex;
  height: 100px;
  width: 100px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  z-index: 1;
  position: absolute;
  left: -50px;
  bottom: 15px;
}

.user-name {
  display: flex;
  padding: var(--padding-xs, 8px) var(--padding-m, 16px) var(--padding-xs, 8px) 80px;
  flex-direction: column;
  justify-content: center;
  border-radius: 0px var(--radius-s, 4px) var(--radius-s, 4px) 0px;
  z-index: -10;
  min-width: 300px;
  backdrop-filter: blur(12px);
}

.emblem {
  display: flex;
  width: 40px;
  height: 40px;
  padding: 0 7.459px;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: -10px;
  top: -10px;
}

.material-rounded {
  word-wrap: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  direction: ltr;
  display: inline-block;
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1;
  text-rendering: optimizeLegibility;
  text-transform: none;
  white-space: nowrap;
}

.user-fullname {
  font-family: var(--font-primary, "Roboto Flex");
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 150%;
  letter-spacing: .1px;
  white-space: nowrap;
}

.user-title {
  align-self: stretch;
  font-family: var(--font-primary, "Roboto Flex");
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%;
  letter-spacing: .5px;
}
</style>