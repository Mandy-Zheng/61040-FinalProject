<script setup lang="ts">
import CreateStockModal from "@/components/Inventory/CreateStockModal.vue";
import StockComponent from "@/components/Inventory/StockComponent.vue";
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import Multiselect from "@vueform/multiselect";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const { selectedOrg } = storeToRefs(useOrganizationStore());

const inventories = ref<Array<any>>([]);
const inventory = ref<Array<any>>([]);
const showCreateModal = ref<boolean>(false);
const item = ref("");
const allDiets = computed(() => [...new Set(inventories.value.flatMap((inventory) => inventory.diet))]);

async function getInventory() {
  try {
    if (selectedOrg.value) {
      let name = item.value;
      let query: Record<string, string> = name !== undefined ? { name } : {};
      inventory.value = [await fetchy(`/api/inventory/${selectedOrg.value.id}`, "GET", { query })];
    }
  } catch (error) {
    return;
  }
}

async function getAllInventories() {
  try {
    if (selectedOrg.value) {
      inventory.value = await fetchy(`/api/inventory/${selectedOrg.value.id}`, "GET");
    }
  } catch (error) {
    return;
  }
}
async function getInventories() {
  try {
    if (selectedOrg.value) {
      inventories.value = await fetchy(`/api/inventory/${selectedOrg.value.id}`, "GET");
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
    await getAllInventories();
    await getInventories();
  } catch (_) {
    return;
  }
}
async function getMaxAllocation() {
  try {
    if (selectedOrg.value) {
      await fetchy(`/api/inventories/${selectedOrg.value.id}`, "GET");
    }
  } catch (error) {
    console.log(error);
  }
  await getAllInventories();
  await getInventories();
}

onBeforeMount(async () => {
  await getAllInventories();
  await getInventories();
});
</script>

<template>
  <main v-if="selectedOrg" style="margin-left: 80px">
    <!-- <form class="pure-form pure-form-aligned" @submit.prevent="search"> -->

    <div class="right">
      <button class="inventory-btn button-39" @click.prevent="showCreateModal = true">Create New Item</button>
      <button class="inventory-btn button-39 reset" @click.prevent="getMaxAllocation()">Update Daily Allocation</button>
    </div>
    <div class="search-dropdown">
      <Multiselect
        v-model="item"
        class="search"
        :searchable="true"
        :options="inventories.map((item) => item.item)"
        @clear="getAllInventories"
        @select="getInventory"
        placeholder="Search for an item"
      ></Multiselect>
    </div>

    <teleport to="body">
      <CreateStockModal :allDiets="allDiets" :show="showCreateModal" @close="showCreateModal = false" @add="addItem" />
    </teleport>
    <div v-for="stock in inventory" :key="stock" class="stocks">
      <StockComponent :allDiets="allDiets" @refreshStocks="getAllInventories(), getInventories()" :stockId="stock._id" />
    </div>
  </main>
</template>

<style scoped>
.search-dropdown {
  display: flex;
  margin-left: 10%;
  padding-left: 1em;
  padding-bottom: 4em;
  font-weight: 300;
}
.stocks {
  margin-left: 10%;
  margin-right: 10%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.search {
  margin-top: 5px;
  width: 30em;
  margin-left: 0;
}

.button-39 {
  background-color: var(--primary);
  border: none;
  margin: 1em;
  margin-right: 5em;
  color: white;
}
.right {
  margin-top: 1em;
  display: flex;
  justify-content: flex-end;
}
.reset {
  background-color: var(--secondary);
  color: black;
  margin-left: -30px;
}
</style>
