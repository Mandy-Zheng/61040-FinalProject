<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Home" });
}
</script>

<template>
  <main class="column">
    <h1>Settings for {{ currentUsername }}</h1>
    <div class="row">
      <div class="column">
        <button class="button-39" style="background-color: var(--primary)" @click="logout">Logout</button>
      </div>
      <div class="column">
        <button class="button-39" style="background-color: var(--secondary)" @click="delete_">Delete</button>
      </div>
    </div>
    <UpdateUserForm />
  </main>
</template>

<style scoped>
.row {
  display: flex;
  margin-bottom: 5%;
}

.column {
  flex: 50%;
  padding: 10px;
}
</style>
