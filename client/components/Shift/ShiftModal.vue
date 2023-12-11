<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const showDeleteModal = ref<boolean>(false);
const showClaimModal = ref<boolean>(false);
const showUnclaimModal = ref<boolean>(false);
const { currentUsername } = storeToRefs(useUserStore());

const props = defineProps(["shift", "show"]);
const emit = defineEmits(["refreshShifts", "close", "delete"]);
const { selectedOrg } = storeToRefs(useOrganizationStore());
const today = new Date().toISOString();

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
  <transition name="modal fade">
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <div :class="showDeleteModal ? 'hide' : ''">
          <p>Start: {{ formatDate(shift.start) }}</p>
          <p>End: {{ formatDate(shift.end) }}</p>
          <div class="shift" v-if="shift.volunteers.length !== 0">
            <h4>Volunteers</h4>
            <div class="row">
              <article v-for="volunteer in shift.volunteers" :key="volunteer" style="background-color: #cdb9a29c">{{ volunteer }}</article>
            </div>
          </div>
          <div v-else class=""><h4>No volunteers yet!</h4></div>

          <div v-if="shift.volunteers.includes(currentUsername)" class="btn-group">
            <div class="modify">
              <button class="button-39" @click="emit('close')">Cancel</button>
              <button v-if="shift.end > today" class="button-39" @click.prevent="unclaimShift">Unclaim</button>
              <button v-if="selectedOrg?.isAdmin && shift.end > today" class="button-39 red" @click.prevent="showDeleteModal = true">Delete Shift</button>
            </div>
            <!-- <teleport to="body">
              <div v-if="selectedOrg?.isAdmin">
                <DeleteShiftModal :show="showDeleteModal" :shift="shift" @close="showDeleteModal = false" @delete="deleteShift(), (showDeleteModal = false)" />
              </div>
            </teleport> -->
          </div>
          <div v-else style="margin-top: 1em">
            <div class="modify">
              <button class="button-39" @click="emit('close')">Cancel</button>
              <button v-if="shift.end > today" class="button-39" @click.prevent="claimShift">Claim</button>
              <button v-if="selectedOrg?.isAdmin && shift.end > today" class="button-39 red" @click.prevent="showDeleteModal = true">Delete Shift</button>
            </div>
          </div>
        </div>
        <div :class="showDeleteModal ? '' : 'hide'">
          <div class="modal-header">Delete shift from {{ formatDate(props.shift.start) }} to {{ formatDate(props.shift.end) }}</div>
          This action will delete the shift permanently. Are you sure?
          <div class="modal-footer">
            <button class="button-39" @click="emit('close')">Cancel</button>
            <button class="button-39 red" @click="emit('delete')">Delete shift</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.show {
  display: flex;
  flex-direction: column;
  transition: 0.3 ease-in;
}
.hide {
  display: none;
}
.red:hover {
  color: rgb(163, 3, 3);
}
.shift {
  background-color: #fff;
  border: solid;
  border-width: 1px;
  border-color: rgb(186, 185, 185);
  padding: 1em 1em;
  max-height: 15em;
  border-radius: 0.4rem;
  overflow-y: scroll;
  transition: 0.2s;
}

.modify {
  display: flex;
  gap: 3em;
  width: 26em;
  padding-top: 0.5em;
  justify-content: center;
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
  max-height: 17em;
}
h4 {
  margin-top: 0;
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
