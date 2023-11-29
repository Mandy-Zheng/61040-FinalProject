<script setup lang="ts">
import OrganizationComponent from "@/components/Organization/OrganizationComponent.vue";
import RegisterOrganizationForm from "@/components/Organization/RegisterOrganizationForm.vue";
import { useOrganizationStore } from "@/stores/organization";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";

const { allOrgs, selectedOrg } = storeToRefs(useOrganizationStore());
const { getOrganizations, setOrganization } = useOrganizationStore();
onBeforeMount(async () => {
  try {
    await getOrganizations();
  } catch {
    return;
  }
});
</script>

<template>
  <main>
    <h1>Organization Page</h1>
    <div v-for="org in allOrgs" :key="org"><OrganizationComponent :organization="org" /></div>
    <p>Selected {{ selectedOrg }}</p>
    <RegisterOrganizationForm />
    <p>Manage Organization</p>
    <section></section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
