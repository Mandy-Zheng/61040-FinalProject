<script setup lang="ts">
import OrganizationComponent from "@/components/Organization/OrganizationComponent.vue";
import RegisterOrganizationForm from "@/components/Organization/RegisterOrganizationForm.vue";
import { useOrganizationStore } from "@/stores/organization";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const { allOrgs, selectedOrg } = storeToRefs(useOrganizationStore());
const { getOrganizations, setOrganization } = useOrganizationStore();
const allOrgNames = computed(() => allOrgs.value.map((org: any) => org.name));
const selected = ref<string | null>(allOrgs.value[0]);

onBeforeMount(async () => {
  try {
    await getOrganizations();
  } catch {
    return;
  }
});
console.log(allOrgs);
</script>

<template>
  <main>
    <h1>Organization Page</h1>
    <h3>Current Selected Organization</h3>
    <!-- <Multiselect class="multiselect" v-model="selected" :options="allOrgNames" :searchable="true" required /> -->
    <select v-if="allOrgs.length !== 0">
      <option v-for="org in allOrgs" :key="org._id" :value="org._id">{{ org.name }}</option>
    </select>
    <p v-else>You are currently not a part of organization</p>
    <div v-for="org in allOrgs" :key="org"><OrganizationComponent :organization="org" /></div>
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
