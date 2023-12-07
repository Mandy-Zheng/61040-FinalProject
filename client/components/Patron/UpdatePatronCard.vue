<script setup lang="ts">
import { ref } from "vue";

const props = defineProps(["patron"]);
const today = new Date().toISOString().split("T")[0];
const name = ref<string>(props.patron.name);
const img = ref<string>(props.patron.image);
const birthday = ref<any>(props.patron.birthday);
</script>

<template>
  <main>
    <div v-if="patron">
      <div class="column">
        <h3 class="name">Name: <input v-model="name" /></h3>
        <h3 class="name">Image Link: <input v-model="img" /></h3>
        <div class="content">Date of Birth: <input type="date" :max="today" v-model="birthday" /></div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.button-39 {
  margin: 10px;
  padding: 10px;
}

.name {
  color: rgb(79, 78, 78);
}

.content {
  color: rgb(117, 117, 117);
  font-weight: 300;
}

h3 {
  margin: 0;
}

article {
  background-color: white;
  border: solid;
  border-color: rgb(214, 214, 214);
  border-radius: 1em;
  display: flex;
  flex-direction: row;
  padding: 1.5em 1.5em;
  font-weight: 400;
  font-size: small;
  gap: 2.5em;
  width: 20em;
  overflow: scroll;
}

.column {
  align-items: flex-start;
}

.circle {
  border-radius: 10em;
}
</style>
