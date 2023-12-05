<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import DeleteHouseholdModal from "./DeleteHouseholdModal.vue";
import HouseholdInfoComponent from "./HouseholdInfoComponent.vue";
import PatronCardComponent from "./PatronCardComponent.vue";
const searchId = ref("");
const household = ref<any>(undefined);
const showDeleteModal = ref<boolean>(false);

async function search() {
  let householdResult;
  try {
    householdResult = await fetchy(`/api/profile/${searchId.value}`, "GET");
    console.log(householdResult);
  } catch (_) {
    return;
  }
  household.value = householdResult;
}

const deleteHousehold = async () => {
  try {
    await fetchy(`api/profile/${household.value._id}`, "DELETE");
  } catch {
    return;
  }
  searchId.value = "";
  household.value = undefined;
};
</script>

<template>
  <main style="margin: 50px">
    <form class="pure-form pure-form-aligned" @submit.prevent="search">
      <fieldset>
        <div class="pure-control-group">
          <input v-model.trim="searchId" type="text" id="aligned-name" placeholder="Household ID" style="border-radius: 2em; width: 25em" required />
          <button class="icon search">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" class="bi bi-search" viewBox="0 0 16 16">
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
              />
            </svg>
          </button>
        </div>
      </fieldset>
    </form>
    <div v-if="household" class="row">
      <div>
        <HouseholdInfoComponent :household="household" />
      </div>
      <div class="column">
        <div v-for="patron in household.members" :key="patron">
          <PatronCardComponent :patronId="patron" />
        </div>
      </div>
      <div class="modify">
        <button class="icon" @click.prevent="showDeleteModal = true" v-b-tooltip.hover title="Delete shift">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="black" class="bi bi-trash-fill" viewBox="0 0 16 16">
            <path
              d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
            />
          </svg>
        </button>
      </div>
      <teleport to="body">
        <DeleteHouseholdModal :show="showDeleteModal" :household="household" @close="showDeleteModal = false" @delete="deleteHousehold(), (showDeleteModal = false)" />
      </teleport>
    </div>
    <div v-else>Search for a household!</div>
  </main>
</template>

<style scoped>
.button-39 {
  margin: 10px;
  padding: 10px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding-right: 2em;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.search {
  margin-left: -35px;
  margin-top: 5px;
}
</style>
