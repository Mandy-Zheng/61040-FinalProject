<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import ClaimShiftModal from "./ClaimShiftModal.vue";
import DeleteShiftModal from "./DeleteShiftModal.vue";
import UnclaimShiftModal from "./UnclaimShiftModal.vue";

const showDeleteModal = ref<boolean>(false);
const showClaimModal = ref<boolean>(false);
const showUnclaimModal = ref<boolean>(false);
const { currentUsername } = storeToRefs(useUserStore());

const props = defineProps(["shift", "show"]);
const emit = defineEmits(["refreshShifts", "close"]);
const { selectedOrg } = storeToRefs(useOrganizationStore());

const deleteShift = async () => {
  try {
    await fetchy(`api/shift/${props.shift._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshShifts");
};

const claimShift = async () => {
  try {
    await fetchy(`api/shift/claim/${props.shift._id}`, "PATCH");
  } catch {
    return;
  }
  emit("refreshShifts");
};

const unclaimShift = async () => {
  try {
    await fetchy(`api/shift/unclaim/${props.shift._id}`, "PATCH");
  } catch {
    return;
  }
  emit("refreshShifts");
};
</script>

<template>
  <transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <div class="shift">
          <p>Start: {{ formatDate(shift.start) }}</p>
          <p>End: {{ formatDate(shift.end) }}</p>
          <div v-if="shift.volunteers.length !== 0">
            <h4>Volunteers</h4>
            <div class="row">
              <article v-for="volunteer in shift.volunteers" :key="volunteer" style="background-color: #cdb9a29c">{{ volunteer }}</article>
            </div>
          </div>
          <div v-else><h4>No volunteers yet!</h4></div>

          <div v-if="shift.volunteers.includes(currentUsername)">
            <div class="modify">
              <button class="button-39" @click="emit('close')">Close</button>
              <button class="button-39" @click.prevent="showUnclaimModal = true">Unclaim</button>
              <button v-if="selectedOrg?.isAdmin" class="icon" @click.prevent="showDeleteModal = true" title="Delete shift">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="black" class="bi bi-trash-fill" viewBox="0 0 16 16">
                  <path
                    d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
                  />
                </svg>
              </button>
            </div>
            <teleport to="body">
              <UnclaimShiftModal :show="showUnclaimModal" :shift="shift" @close="showUnclaimModal = false" @unclaim="unclaimShift(), (showUnclaimModal = false)" />
              <div v-if="selectedOrg?.isAdmin">
                <DeleteShiftModal :show="showDeleteModal" :shift="shift" @close="showDeleteModal = false" @delete="deleteShift(), (showDeleteModal = false)" />
              </div>
            </teleport>
          </div>
          <div v-else>
            <div class="modify">
              <button class="button-39" @click="emit('close')">Close</button>
              <button class="button-39" @click.prevent="showClaimModal = true">Claim</button>
              <button v-if="selectedOrg?.isAdmin" class="icon" @click.prevent="showDeleteModal = true" title="Delete shift">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="black" class="bi bi-trash-fill" viewBox="0 0 16 16">
                  <path
                    d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
                  />
                </svg>
              </button>
            </div>
            <teleport to="body">
              <ClaimShiftModal :show="showClaimModal" :shift="shift" @close="showClaimModal = false" @claim="claimShift(), (showClaimModal = false)" />
              <div v-if="selectedOrg?.isAdmin">
                <DeleteShiftModal :show="showDeleteModal" :shift="shift" @close="showDeleteModal = false" @delete="deleteShift(), (showDeleteModal = false)" />
              </div>
            </teleport>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.shift {
  background-color: #fff;
  border: solid;
  border-width: 1px;
  border-color: rgb(186, 185, 185);
  padding: 1em 1em;
  width: 24em;
  height: 15em;
  border-radius: 0.4rem;
  overflow: scroll;
  transition: 0.2s;
}

.modify {
  display: flex;
  gap: auto;
  width: 26em;
  padding-top: 0.5em;
  justify-content: space-around;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 0.75em;
  flex-wrap: wrap;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  width: fit-content;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.25em;
  padding: 0.5em;
  font-weight: 400;
  font-size: small;
}

img {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 0;
  top: 0;
}
.modal-footer {
  display: flex;
  justify-content: space-between;
}

.edit-btn {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 26em;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  height: 17em;
  overflow: scroll;
}

.modal-header {
  margin-top: 0;
  color: var(--primary);
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

span {
  color: black;
}
</style>
