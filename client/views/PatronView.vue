<script setup lang="ts">
import CreateHouseholdComponent from "@/components/Household/CreateHouseholdComponent.vue";
import { useOrganizationStore } from "@/stores/organization";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import PatronComponent from "../components/Patron/PatronComponent.vue";
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
    <div class="right">
      <button class="button-39" @click.prevent="showCreateModal = true">Create New Household</button>
    </div>
    <PatronComponent />
    <CreateHouseholdComponent :show="showCreateModal" @close="showCreateModal = false" @add="addHousehold" />
  </div>
</template>
<style scoped>
.household {
  margin-left: 4em;
}

.button-39 {
  background-color: var(--primary);
  color: white;
}
.right {
  display: flex;
  justify-content: flex-end;
  margin-top: 2em;
  margin-right: 10em;
}
</style>
