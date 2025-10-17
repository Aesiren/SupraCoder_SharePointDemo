<script lang="ts" setup>
import { useSPListStore } from '@/stores/spListStore';

const listStore = useSPListStore();

</script>

<template>
  <div class="info">
    <h1>Favorites:</h1>
    <h2>Game: {{ listStore.spListData.Game }}</h2>
    <h2>Movie: {{ listStore.spListData.Movie }}</h2>
    <h2>TV Show: {{ listStore.spListData.Show }}</h2>
    <h2>Food: {{ listStore.spListData.Food }}</h2>
  </div>
</template>

<style scoped>
.info {
  display: flex;
  flex-direction: column;
  border: 5px;
  border-color: white;
}
</style>