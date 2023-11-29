<script setup lang="ts">
import OrganizationComponent from "@/components/Organization/OrganizationComponent.vue";
import RegisterOrganizationForm from "@/components/Organization/RegisterOrganizationForm.vue";
import { useOrganizationStore } from "@/stores/organization";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const { allOrgs, selectedOrg } = storeToRefs(useOrganizationStore());
const { getOrganizations, setOrganization } = useOrganizationStore();
const allOrgNames = computed(() => allOrgs.value.map((org: any) => org.name));
const curOrg = ref<string>(selectedOrg.value !== undefined ? allOrgNames.value[selectedOrg.value] : "");

async function changeOrganization() {
  if (curOrg.value !== "") {
    await setOrganization(curOrg.value);
    console.log(curOrg.value);
    console.log(selectedOrg.value);
    console.log(allOrgNames.value);
    console.log(allOrgs.value);
  }
}

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
    <h3>Current Selected Organization</h3>
    <!-- <Multiselect class="multiselect" v-model="selected" :options="allOrgNames" :searchable="true" required /> -->
    <select v-if="allOrgs.length !== 0" v-model="curOrg" @change="changeOrganization">
      <option value="" :selected="curOrg === ''" disabled>--Select an Organization--</option>
      <option v-for="org in allOrgs" :key="org.name" :selected="curOrg === org.name" :value="org.name">{{ org.name }}</option>
    </select>
    <p v-else>You are currently not a part of organization</p>
    <h3>Organizations</h3>
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
