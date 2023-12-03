<script setup lang="ts">
import CreateStockModal from "@/components/Inventory/CreateStockModal.vue";
import StockComponent from "@/components/Inventory/StockComponent.vue";
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
const { selectedOrg } = storeToRefs(useOrganizationStore());

const inventory = ref<Array<any>>([]);
const showCreateModal = ref<boolean>(false);
async function getInventory() {
  try {
    if (selectedOrg.value) {
      inventory.value = await fetchy(`/api/inventory/${selectedOrg.value.id}`, "GET");
      console.log(inventory.value);
    }
  } catch (error) {
    return;
  }
}

async function addItem(name: string, imgLink: string, purchaseLink: string, units: number, diet: Array<string>, maxPerPerson: number) {
  const body = { owner: selectedOrg.value ? selectedOrg.value.id : "", item: name, count: units, link: purchaseLink, img: imgLink, diet: diet, maxp: maxPerPerson };
  showCreateModal.value = false;
  try {
    await fetchy(`/api/inventory`, "POST", { body: body });
    await getInventory();
  } catch (_) {
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
    <button class="button-39 red" @click.prevent="showCreateModal = true">Create New Item</button>
    <teleport to="body">
      <CreateStockModal :show="showCreateModal" @close="showCreateModal = false" @add="addItem" />
    </teleport>
    <div v-for="stock in inventory" :key="stock" class="stocks"><StockComponent :stockId="stock._id" /></div>
  </main>
</template>

<style scoped>
.stocks {
  margin-left: 10%;
  margin-right: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
