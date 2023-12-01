<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useOrganizationStore } from "./stores/organization";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());
const { selectedOrg } = storeToRefs(useOrganizationStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>
<style src="@vueform/multiselect/themes/default.css"></style>

<template>
  <header>
    <nav>
      <div class="title">
        <img src="@/assets/images/logo.jpg" />
        <RouterLink :to="{ name: 'Home' }">
          <h1>{{ selectedOrg ? selectedOrg.name : "" }}</h1>
        </RouterLink>
      </div>
      <ul>
        <li v-if="isLoggedIn && selectedOrg === undefined">
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
          <RouterLink :to="{ name: 'Organization' }" :class="{ underline: currentRouteName == 'Organization' }"> Organization </RouterLink>
          <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }"> Settings </RouterLink>
        </li>
        <li v-else-if="isLoggedIn">
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
          <RouterLink :to="{ name: 'Inventory' }" :class="{ underline: currentRouteName == 'Inventory' }"> Inventory </RouterLink>
          <RouterLink :to="{ name: 'Patrons' }" :class="{ underline: currentRouteName == 'Patrons' }"> Patrons </RouterLink>
          <RouterLink :to="{ name: 'Timesheet' }" :class="{ underline: currentRouteName == 'Timesheet' }"> Timesheet </RouterLink>
          <RouterLink :to="{ name: 'Organization' }" :class="{ underline: currentRouteName == 'Organization' }"> Organization </RouterLink>
          <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }"> Settings </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";
@import url("https://fonts.googleapis.com/css2?family=Exo+2&display=swap");

nav {
  padding: 0.5em 2em;
  background-color: white;
  display: flex;
  align-items: center;
}

h1 {
  font-size: 1.5em;
  font-family: "Exo 2", sans-serif;
  font-weight: 600;
  margin: 0;
  color: var(--primary);
}

.title {
  display: flex;
  align-items: center;
  gap: 1em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: black;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
}

li {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.underline {
  color: var(--primary);
}
</style>
