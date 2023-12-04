<script setup lang="ts">
import CreateHouseholdComponent from "@/components/Household/CreateHouseholdComponent.vue";
import { useOrganizationStore } from "@/stores/organization";
import { storeToRefs } from "pinia";
import { ref } from "vue";
const { selectedOrg } = storeToRefs(useOrganizationStore());

const showCreateModal = ref<boolean>(false);
async function getHousehold() {
  try {
    if (selectedOrg.value) {
      // inventory.value = await fetchy(`/api/inventory/${selectedOrg.value.id}`, "GET");
      // console.log(inventory.value);
    }
  } catch (error) {
    return;
  }
}

async function addHousehold() {
  try {
    await getHousehold();
  } catch (error) {
    return;
  }
}
</script>

<template>
  <div class="household" v-if="selectedOrg">
    <h3>Patrons</h3>
    <button class="button-39 red" @click.prevent="showCreateModal = true">Create New Household</button>

    <CreateHouseholdComponent :show="showCreateModal" @close="showCreateModal = false" @add="addHousehold" />

    <!-- <div v-for="stock in inventory" :key="stock" class="stocks"><StockComponent :stockId="stock._id" /></div> -->
  </div>
</template>

<style scoped>
.household {
  margin-left: 4em;
}
</style>
