<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["patronId"]);
const patron = ref();
const loaded = ref(false);

async function getPatron() {
  let patronResult;
  try {
    patronResult = await fetchy(`/api/patron/${props.patronId}`, "GET");
  } catch (_) {
    return;
  }
  patron.value = patronResult;
}
onBeforeMount(async () => {
  try {
    await getPatron();
  } catch (e) {
    return;
  }
  loaded.value = true;
});
</script>

<template>
  <main>
    <div v-if="loaded && patron">
      <article>
        <img v-if="!patron.image.length" class="circle" src="../../assets/images/image.svg" width="60" height="60" />
        <img v-else :src="patron.image" width="60" height="60" class="circle" />
        <div class="column">
          <h3 class="name">{{ patron.name }}</h3>
          <div class="content">Date of Birth: {{ patron.birthday }}</div>
        </div>
      </article>
    </div>
    <p v-else-if="loaded">No profile found</p>
    <p v-else>Loading...</p>
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
  overflow: auto;
}

.column {
  align-items: flex-start;
}

.circle {
  border-radius: 10em;
}
</style>
