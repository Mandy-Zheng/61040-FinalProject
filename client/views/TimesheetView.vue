<script setup lang="ts">
import CreateShiftForm from "@/components/Shift/CreateShiftForm.vue";
import ShiftComponent from "@/components/Shift/ShiftComponent.vue";
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

let hidePastShifts = ref(true);
let showOnlyMyShifts = ref(false);
let shifts = ref<Array<Record<string, string>>>([]);
let myShifts = ref<Array<Record<string, string>>>([]);
const { selectedOrg } = storeToRefs(useOrganizationStore());

async function getOrgShifts() {
  let results;
  try {
    if (selectedOrg.value) {
      results = await fetchy(`/api/shift/org/${selectedOrg.value.id}/${hidePastShifts.value}`, "GET");
    }
  } catch (_) {
    return;
  }
  shifts.value = results;
}

async function getMyShifts() {
  let results;
  try {
    results = await fetchy(`/api/shift/user/${hidePastShifts.value}`, "GET");
  } catch (_) {
    return;
  }
  myShifts.value = results;
}

async function getAllShifts() {
  await getOrgShifts();
  await getMyShifts();
}

async function toggleFuturePref() {
  hidePastShifts.value = !hidePastShifts.value;
  await getAllShifts();
}

async function toggleMyShiftsPref() {
  showOnlyMyShifts.value = !showOnlyMyShifts.value;
  await getAllShifts();
}

onBeforeMount(async () => {
  try {
    await getAllShifts();
  } catch {
    return;
  }
});
</script>

<template>
  <div v-if="selectedOrg?.isAdmin">
    <CreateShiftForm @refreshShifts="getAllShifts" />
  </div>
  <div class="row">
    <button v-if="hidePastShifts" class="button-39" @click="toggleFuturePref">show past and future shifts</button>
    <button v-else class="button-39" @click="toggleFuturePref">show only future shifts</button>
    <button v-if="showOnlyMyShifts" class="button-39" @click="toggleMyShiftsPref">show claimed and unclaimed shifts</button>
    <button v-else class="button-39" @click="toggleMyShiftsPref">show only claimed shifts</button>
  </div>
  <div v-if="showOnlyMyShifts && myShifts.length !== 0">
    <article v-for="shift in myShifts" :key="shift._id">
      <ShiftComponent :shift="shift" @refreshShifts="getAllShifts" />
    </article>
  </div>
  <div v-else-if="!showOnlyMyShifts && shifts.length !== 0">
    <article v-for="shift in shifts" :key="shift._id">
      <ShiftComponent :shift="shift" @refreshShifts="getAllShifts" />
    </article>
  </div>
  <div v-else>
    <h3>no shifts found</h3>
  </div>
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
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
