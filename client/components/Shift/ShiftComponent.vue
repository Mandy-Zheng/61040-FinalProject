<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import DeleteShiftModal from "./DeleteShiftModal.vue";

const showDeleteModal = ref<boolean>(false);

const props = defineProps(["shift", "appliedJobs"]);
const emit = defineEmits(["refreshShifts"]);
const { selectedOrg } = storeToRefs(useOrganizationStore());

const deleteShift = async () => {
  try {
    await fetchy(`api/shift/${props.shift._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshShifts");
};
</script>

<template>
  <div class="item">
    <p>start: {{ formatDate(shift.start) }}</p>
    <p>end: {{ formatDate(shift.end) }}</p>
    <p>volunteers: {{ shift.volunteers.length !== 0 ? shift.volunteers : "No volunteers yet!" }}</p>
    <div v-if="selectedOrg?.isAdmin">
      <button class="icon" @click.prevent="showDeleteModal = true" v-b-tooltip.hover title="Delete shift">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="black" class="bi bi-trash-fill" viewBox="0 0 16 16">
          <path
            d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
          />
        </svg>
      </button>
      <teleport to="body">
        <DeleteShiftModal :show="showDeleteModal" :shift="shift" @close="showDeleteModal = false" @delete="deleteShift(), (showDeleteModal = false)" />
      </teleport>
    </div>
  </div>
</template>

<style scoped></style>
