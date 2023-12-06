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
  <div class="shifts">
    <div v-if="selectedOrg?.isAdmin">
      <CreateShiftForm @refreshShifts="getAllShifts" />
    </div>
    <div class="row">
      <div class="toggletext">Show only future shifts:</div>
      <label class="switch" style="margin-right: 3em">
        <input type="checkbox" @click="toggleFuturePref" checked />
        <span class="slider round"></span>
      </label>
      <div class="toggletext">Show only claimed shifts:</div>
      <label class="switch">
        <input type="checkbox" @click="toggleMyShiftsPref" />
        <span class="slider round"></span>
      </label>
      <!-- <button v-if="hidePastShifts" class="button-39" @click="toggleFuturePref">show past and future shifts</button>
      <button v-else class="button-39" @click="toggleFuturePref">show only future shifts</button> -->
      <!-- <button v-if="showOnlyMyShifts" class="button-39" @click="toggleMyShiftsPref">show claimed and unclaimed shifts</button>
      <button v-else class="button-39" @click="toggleMyShiftsPref">show only claimed shifts</button> -->
    </div>
    <div class="grid" v-if="showOnlyMyShifts && myShifts.length !== 0">
      <article v-for="shift in myShifts" :key="shift._id">
        <ShiftComponent :shift="shift" @refreshShifts="getAllShifts" />
      </article>
    </div>
    <div class="grid" v-else-if="!showOnlyMyShifts && shifts.length !== 0">
      <article v-for="shift in shifts" :key="shift._id">
        <ShiftComponent :shift="shift" @refreshShifts="getAllShifts" />
      </article>
    </div>
    <p v-else>No shifts yet! Only admins can create shifts.</p>
  </div>
</template>

<style scoped>
.shifts {
  margin: 50px;
}
.button-39 {
  margin: 1em;
}
.row {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  max-width: 60em;
  padding: 1em;
}

h1 {
  text-align: center;
}

select {
  height: 35px;
  padding: 5px;
  border-color: rgb(188, 188, 188);
  border-radius: 5px;
}
.grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2em 2em;
}

.toggletext {
  margin-top: 15px;
}

/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin: 10px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--secondary);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--secondary);
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
