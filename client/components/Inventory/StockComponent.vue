<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount } from "vue";

const props = defineProps(["stockId"]);

async function getInventory() {
  inventory.value = await fetchy(`/api/inventory`, "GET");
}

onBeforeMount(async () => {
  await getInventory();
});
</script>

<template>
  <main>
    <p>Stock</p>
    <div>{{ props.stockId }}</div>
  </main>
</template>
