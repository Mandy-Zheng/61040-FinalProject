<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import moment from "moment";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import VueCal from "vue-cal";
import ClaimShiftModal from "../components/Shift/ClaimShiftModal.vue";
import DeleteShiftModal from "../components/Shift/DeleteShiftModal.vue";
import UnclaimShiftModal from "../components/Shift/UnclaimShiftModal.vue";
let hidePastShifts = ref(true);
let showOnlyMyShifts = ref(false);
let shifts = ref<Array<Record<string, string>>>([]);
let myShifts = ref<Array<Record<string, string>>>([]);
const { selectedOrg } = storeToRefs(useOrganizationStore());
const { currentUsername } = storeToRefs(useUserStore());
const showClaimModal = ref<boolean>(false);
const showUnclaimModal = ref<boolean>(false);
const showDeleteModal = ref<boolean>(false);
const shift = ref(undefined);
const today = new Date();

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

function convertDates(shifts: Record<string, string>[]) {
  return shifts.map((s) => {
    const start = moment(s.start).format("YYYY-MM-DD, HH:mm");
    const end = moment(s.end).format("YYYY-MM-DD, HH:mm");
    return {
      start: start,
      end: end,
      content: s.volunteers, //.includes(currentUsername.value) ? "Claimed!" : "Not claimed",
      shift: s,
      class: s.volunteers.includes(currentUsername.value) ? "claimedShift" : "unclaimedShift",
    };
  });
}

onBeforeMount(async () => {
  try {
    await getAllShifts();
  } catch {
    return;
  }
});

async function createShift(event: any) {
  try {
    if (selectedOrg.value) {
      const body = { orgId: selectedOrg.value.id, start: event.start, end: event.end };
      await fetchy("api/shift", "POST", {
        body: body,
      });
    }
  } catch (_) {
    return;
  }
  await getAllShifts();
  return event;
}

const triggerDelete = async (event: any) => {
  shift.value = event.shift;
  showDeleteModal.value = true;
};

const deleteShift = async (shift: any) => {
  try {
    await fetchy(`api/shift/${shift._id}`, "DELETE");
  } catch {
    return;
  }
  shift.value = undefined;
  await getAllShifts();
};

const claimShift = async (shift: any) => {
  try {
    await fetchy(`api/shift/claim/${shift._id}`, "PATCH");
  } catch {
    return;
  }
  shift.value = undefined;
  await getAllShifts();
};

const unclaimShift = async (shift: any) => {
  try {
    await fetchy(`api/shift/unclaim/${shift._id}`, "PATCH");
  } catch {
    return;
  }
  shift.value = undefined;
  await getAllShifts();
};

const triggerClaim = async (event: any) => {
  if (event.end < today) {
    return;
  }
  shift.value = event.shift;
  if (event.shift.volunteers.includes(currentUsername.value)) {
    showUnclaimModal.value = true;
  } else {
    showClaimModal.value = true;
  }
};
</script>

<template>
  <div class="shifts">
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
    </div>
    <teleport to="body">
      <ClaimShiftModal :show="showClaimModal" :shift="shift" @close="showClaimModal = false" @claim="claimShift(shift), (showClaimModal = false)" />
      <UnclaimShiftModal :show="showUnclaimModal" :shift="shift" @close="showUnclaimModal = false" @unclaim="unclaimShift(shift), (showUnclaimModal = false)" />
      <div v-if="selectedOrg?.isAdmin">
        <DeleteShiftModal :show="showDeleteModal" :shift="shift" @close="showDeleteModal = false" @delete="deleteShift(shift), (showDeleteModal = false)" />
      </div>
    </teleport>
  </div>
  <div class="cal">
    <vue-cal
      :time-from="7 * 60"
      :time-to="22 * 60"
      :snap-to-time="15"
      :disable-views="['years', 'year']"
      :editable-events="{ title: false, drag: false, resize: false, delete: selectedOrg?.isAdmin, create: selectedOrg?.isAdmin }"
      :drag-to-create-threshold="15"
      style="height: 100%"
      :events="convertDates(showOnlyMyShifts ? myShifts : shifts)"
      today-button
      :on-event-click="triggerClaim"
      @event-drag-create="createShift"
      @event-delete="triggerDelete"
      :min-date="today"
    >
    </vue-cal>
  </div>
</template>

<style scoped>
.cal {
  margin: 0 1.5em 3em 1.5em;
}

.shifts {
  margin: 1em;
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
