<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import AddPatronModal from "./AddPatronModal.vue";
import AllocateItemsModal from "./AllocateItemsModal.vue";
import DeleteHouseholdModal from "./DeleteHouseholdModal.vue";
import DeletePatronModal from "./DeletePatronModal.vue";
import HouseholdInfoComponent from "./HouseholdInfoComponent.vue";
import PatronCardComponent from "./PatronCardComponent.vue";
const showDeleteModal = ref<boolean>(false);
const showPatronDeleteModal = ref<boolean>(false);
const showPatronAddModal = ref<boolean>(false);

const props = defineProps(["household", "allLanguages", "allDiets"]);
const emit = defineEmits(["refreshHouseholds", "refreshById"]);
const members = ref<Array<any>>(props.household.members);

const showAllocateModal = ref<boolean>(false);
const allocation = ref();

const deleteHousehold = async () => {
  try {
    await fetchy(`/api/profile/${props.household._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshHouseholds");
};

const addVisit = async () => {
  await getAllocation();
  showAllocateModal.value = true;
};

async function getAllocation() {
  try {
    allocation.value = await fetchy(`/api/profile/allocate/${props.household._id}`, "GET");
  } catch {
    return;
  }
}

async function refreshPatron(patronId: string) {
  const idx = members.value.findIndex((patron) => patron._id === patronId);
  if (idx !== -1) {
    try {
      members.value[idx] = await fetchy(`/api/patron/${patronId}`, "GET");
    } catch (error) {
      return;
    }
  }
}

async function deletePatrons(patrons: Array<string>) {
  try {
    const body = { patrons: patrons, household: props.household._id };

    await fetchy(`/api/profile/removePatron`, "PATCH", { body: body });
    showPatronDeleteModal.value = false;

    emit("refreshById", props.household._id);
  } catch (error) {
    return;
  }
}
</script>

<template>
  <main style="margin: 10px 0px">
    <div class="row">
      <div>
        <HouseholdInfoComponent :allDiets="allDiets" :allLanguages="allLanguages" :household="household" @refreshHouseholds="emit('refreshHouseholds')" @refreshVisits="addVisit" />
      </div>
      <div class="column">
        <p>Members of Household: <button @click="showPatronAddModal = true">Add Members</button> <button @click="showPatronDeleteModal = true">Delete Members</button></p>

        <div class="row" v-for="patron in members" :key="patron">
          <PatronCardComponent :patron="patron" :householdId="household._id" @update="refreshPatron" />
        </div>
      </div>
      <div class="modify">
        <button class="icon" @click.prevent="showDeleteModal = true" title="Delete household">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="black" class="bi bi-trash-fill" viewBox="0 0 16 16">
            <path
              d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
            />
          </svg>
        </button>
      </div>
      <teleport to="body">
        <DeleteHouseholdModal :show="showDeleteModal" :household="household" @close="showDeleteModal = false" @delete="deleteHousehold(), (showDeleteModal = false)" />
        <DeletePatronModal :show="showPatronDeleteModal" :members="members" :householdId="household._id" @close="showPatronDeleteModal = false" @delete="deletePatrons" />
        <AddPatronModal :show="showPatronAddModal" :householdId="household._id" @close="showPatronAddModal = false" @add="emit('refreshById', props.household._id)" />
      </teleport>
    </div>
    <AllocateItemsModal
      :show="showAllocateModal"
      :household="household"
      :allocation="allocation"
      @close="showAllocateModal = false"
      @refreshHouseholds="emit('refreshHouseholds'), (showAllocateModal = false)"
    />
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
