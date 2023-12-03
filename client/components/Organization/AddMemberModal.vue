<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import Multiselect from "@vueform/multiselect";
import { computed, onBeforeMount, ref } from "vue";

const props = defineProps(["show", "organization"]);
const allUsers = ref<Array<{ label: string; value: string }>>([]);
const emit = defineEmits(["close", "add"]);
const usersToAdd = ref<Array<string>>([]);
const nonTeamMembers = computed(() => {
  const adminsAndMembers = props.organization.admins.concat(props.organization.members);
  return allUsers.value.filter((user) => !adminsAndMembers.includes(user.label));
});

onBeforeMount(async () => {
  try {
    const users = await fetchy(`/api/users`, "GET");
    allUsers.value = users.map((user: any) => {
      return { label: user.username, value: user._id };
    });
  } catch {
    return;
  }
});
</script>

<template>
  <transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-container">
        <div class="modal-header">Settings for {{ props.organization.name }}</div>
        Add Members:

        <Multiselect class="multiselect" v-model="usersToAdd" mode="tags" :options="nonTeamMembers" :searchable="true" required />

        <div class="modal-footer">
          <button class="button-39" @click="emit('close')">Close</button>
          <button class="button-39" @click="emit('add', usersToAdd)">Add Members</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: space-between;
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
