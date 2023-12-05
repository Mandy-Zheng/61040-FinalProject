<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import DeleteHouseholdModal from "./DeleteHouseholdModal.vue";
import HouseholdInfoComponent from "./HouseholdInfoComponent.vue";
import PatronCardComponent from "./PatronCardComponent.vue";

const showDeleteModal = ref<boolean>(false);
const props = defineProps(["household"]);
const emit = defineEmits(["refreshHouseholds"]);

const deleteHousehold = async () => {
  try {
    await fetchy(`api/profile/${props.household._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshHouseholds");
};
</script>

<template>
  <main style="margin: 10px 0px">
    <div class="row">
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
  justify-content: space-between;
}

main {
  padding: 0;
}
</style>
