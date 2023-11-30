<script setup lang="ts">
import { useUserStore } from "@/stores/user";

import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());

const props = defineProps(["show", "organization"]);

const adminsAndMembers = computed(() => {
  return props.organization.admins.concat(props.organization.members).filter((u: string) => u !== currentUsername.value);
});
const emit = defineEmits(["close", "manage"]);
const currMember = ref<string>("");
const currAction = ref<string>("");

function changeMember() {
  currAction.value = "";
}

function resetForm() {
  currMember.value = "";
  currAction.value = "";
}

function close() {
  resetForm();
  emit("close");
}

function update() {
  emit("manage", currMember.value, currAction.value);
  resetForm();
}
</script>

<template>
  <transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <div class="modal-header">Settings for {{ props.organization.name }}</div>
        Choose member:
        <select v-if="adminsAndMembers.length !== 0" v-model="currMember" @change="changeMember">
          <option value="" :selected="currMember === ''" disabled>--select a member--</option>
          <option v-for="u in adminsAndMembers" :key="u" :selected="currMember === u" :value="u">{{ u }}</option>
        </select>
        <div v-else>No members yet!</div>
        <div v-if="currMember !== ''">
          Action:
          <select v-model="currAction">
            <option value="" :selected="currAction === ''" disabled>--select an action--</option>
            <option value="demote" v-if="organization.admins.includes(currMember)">demote to volunteer</option>
            <option value="promote" v-else-if="organization.members.includes(currMember)">promote to admin</option>
            <option value="remove">remove member</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="button-39" @click="close">Close</button>
          <button class="button-39" @click="update">Update</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
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
  width: 300px;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
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
