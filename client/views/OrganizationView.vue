<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
onBeforeMount(async () => {
  try {
    // await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <main>
    <h1>Organization Page</h1>
    <p>Dropdown</p>
    <p>Create</p>
    <p>Manage Organization</p>
    <section></section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
