<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import HouseholdComponent from "./HouseholdComponent.vue";
import PatronCardComponent from "./PatronCardComponent.vue";

const searchId = ref("");
const household = ref<any>(undefined);

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
</script>

<template>
  <main style="margin-left: 50px">
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
        <HouseholdComponent :household="household" />
      </div>
      <div class="column">
        <div v-for="patron in household.members" :key="patron">
          <PatronCardComponent :patronId="patron" />
        </div>
      </div>
    </div>
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
