<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import Multiselect from "@vueform/multiselect";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["show", "organization"]);
const allUsers = ref<Array<any>>([
  { label: "A", value: "A" },
  { label: "B", value: "B" },
]);
const admins = new Set(props.organization.admins);
const members = new Set(props.organization.members);
const emit = defineEmits(["close"]);
const username = ref<string>("");
//const users = await fetchy(`/users`, "GET");
//console.log(users);
console.log(allUsers);

onBeforeMount(async () => {
  try {
    const users = await fetchy(`/users`, "GET");
    // allUsers.value = users
    //   .filter((user: any) => !admins.has(user.username) && members.has(user.username))
    //   .map((user: any) => {
    //     return { label: user.username, value: user.username };
    //   });
    console.log("hi");
    console.log("hello", users);
  } catch {
    return;
  }
});
</script>

<template>
  <transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <div class="modal-header">Settings for {{ props.organization.name }}</div>
        Add Member:

        <Multiselect class="multiselect" v-model="username" :options="allUsers" :searchable="true" required />

        <div class="modal-footer">
          <button class="modal-default-button" @click="emit('close')">Close</button>
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
