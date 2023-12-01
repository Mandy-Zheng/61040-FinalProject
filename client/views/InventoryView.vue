<script setup lang="ts">
import StockComponent from "@/components/Inventory/StockComponent.vue";
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
const { selectedOrg } = storeToRefs(useOrganizationStore());
const inventory = ref<Array<any>>([]);

async function getInventory() {
  try {
    if (selectedOrg.value) {
      inventory.value = await fetchy(`/api/inventory/${selectedOrg.value.id}`, "GET");
    }
  } catch (error) {
    return;
  }
}

onBeforeMount(async () => {
  await getInventory();
});
</script>

<template>
  <main>
    <h3>Inventory</h3>
    <div v-for="stock in inventory" :key="stock"><StockComponent :stock="stock._id" /></div>
  </main>
</template>
