<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["patronId"]);
const patron = ref();

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
  } catch {
    return;
  }
});
</script>

<template>
  <main>
    <div>{{ patron.name }}</div>
    <div>{{ patron.birthday }}</div>
  </main>
</template>

<style scoped>
.button-39 {
  margin: 10px;
  padding: 10px;
}
</style>
