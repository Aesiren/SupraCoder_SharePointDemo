<script lang="ts" setup>
import SPListAPI from '@/api/SPListAPI';
import { useSPListStore } from '@/stores/spListStore';
import { ref, onMounted } from 'vue';

let listStore = useSPListStore();
let index = ref(0);

let varTitle = ref('');
let varGame = ref('');
let varMovie = ref('');
let varShow = ref('');
let varFood = ref('');

let newTitle = ref('');
let newGame = ref('');
let newMovie = ref('');
let newShow = ref('');
let newFood = ref('');

function updateVars() {
  const item = listStore.spListData[index.value];
  if (item) {
    varTitle.value = item.Title;
    varGame.value = item.Game;
    varMovie.value = item.Movie;
    varShow.value = item.Show;
    varFood.value = item.Food;
  }
}
async function updateItem() {
  const itemId = listStore.spListData[index.value].ID;

  let data = {
    Title: varTitle.value,
    Game: varGame.value,
    Show: varShow.value,
    Movie: varMovie.value,
    Food: varFood.value
  }

  try {
    await SPListAPI.updateSPListData(itemId, data);
    alert('Data updated')
    await listStore.refresh();
    updateVars();
  } catch (err) {
    console.log('Error updating data: ', err);
  }
  // finally {
  //   loading.value - false;
  // }
}

async function newItem() {
  const data = {
    Title: newTitle.value,
    Game: newGame.value,
    Show: newShow.value,
    Movie: newMovie.value,
    Food: newFood.value
  }

  try {
    await SPListAPI.addSPListData(data);
    alert('Item added')
    await listStore.refresh();
    index.value = listStore.spListData.length - 1;
    updateVars();
  } catch (err) {
    console.log('Error adding data: ', err);
  }

  newTitle = ref('');
  newGame = ref('');
  newMovie = ref('');
  newShow = ref('');
  newFood = ref('');
}

function nextItem() {
  index.value = (index.value + 1) % listStore.spListData.length;
  updateVars();
  //console.log(varTitle);
}

onMounted(() => {
  if (listStore.spListData.length > 0) {
    updateVars();
  }
})

</script>

<template>
  <div class="info">
    <button v-on:click="nextItem">Next</button>
    <h1>Favorites:</h1>
    <form @submit.prevent="updateItem">
      <label for="varTitle">Title: </label><input type="text" v-model="varTitle" /><br />
      <label for="varGame">Game: </label><input type="text" v-model="varGame" /><br />
      <label for="varGame">Move: </label><input type="text" v-model="varMovie" /><br />
      <label for="varGame">TV Show: </label><input type="text" v-model="varShow" /><br />
      <label for="varGame">Food: </label><input type="text" v-model="varFood" /><br />
      <button type="submit">Save Changes</button>
    </form>

    <h1>New:</h1>
    <form @submit.prevent="newItem">
      <label for="varTitle">Title: </label><input type="text" v-model="newTitle" /><br />
      <label for="varGame">Game: </label><input type="text" v-model="newGame" /><br />
      <label for="varMovie">Movie: </label><input type="text" v-model="newMovie" /><br />
      <label for="varShow">TV Show: </label><input type="text" v-model="newShow" /><br />
      <label for="varFood">Food: </label><input type="text" v-model="newFood" /><br />
      <button type="submit">Add Item</button>
    </form>
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
