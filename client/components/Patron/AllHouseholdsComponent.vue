<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import CreateHouseholdComponent from "../Household/CreateHouseholdComponent.vue";
import HouseholdComponent from "./HouseholdComponent.vue";
import ResetVisitsModal from "./ResetVisitsModal.vue";
import SearchHouseholdsForm from "./SearchHouseholdsForm.vue";

const showCreateModal = ref<boolean>(false);
const showResetModal = ref<boolean>(false);

const loaded = ref(false);
let households = ref<Array<Record<string, string>>>([]);
let searchId = ref("");
const { selectedOrg } = storeToRefs(useOrganizationStore());

async function getHouseholds(_id?: string) {
  let results;
  try {
    if (_id) {
      results = await fetchy(`/api/profile/one/${_id}`, "GET");
    } else if (selectedOrg.value) {
      results = await fetchy(`/api/profile/org/${selectedOrg.value.id}`, "GET");
    }
  } catch (_) {
    return;
  }
  searchId.value = _id ? _id : "";
  households.value = results;
}

onBeforeMount(async () => {
  await getHouseholds();
  loaded.value = true;
});
</script>

<template>
  <div class="right">
    <button class="button-39" @click.prevent="showCreateModal = true">Create New Household</button>
    <button class="button-39 reset" @click.prevent="showResetModal = true">Reset All Visits</button>
  </div>
  <CreateHouseholdComponent :show="showCreateModal" @close="showCreateModal = false" @refreshHouseholds="getHouseholds" />
  <ResetVisitsModal :show="showResetModal" @close="showResetModal = false" @refreshHouseholds="getHouseholds" />
  <div class="row">
    <h2 v-if="!searchId">Households:</h2>
    <h2 v-else>{{ searchId }}:</h2>
    <SearchHouseholdsForm @search="getHouseholds" />
  </div>
  <section class="posts" v-if="loaded && households.length !== 0">
    <article v-for="household in households" :key="household._id">
      <HouseholdComponent :household="household" @refreshHouseholds="getHouseholds" />
    </article>
  </section>
  <p v-else-if="loaded">No households yet!</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 55em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em 2em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}

.household {
  margin-left: 4em;
}

.button-39 {
  background-color: var(--primary);
  color: black;
  margin: 1em;
  border: none;
}
.reset {
  background-color: var(--secondary);
}
.right {
  display: flex;
  justify-content: flex-end;
  margin-top: 2em;
  margin-right: 10em;
}
</style>