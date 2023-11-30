<script setup lang="ts">
import OrganizationComponent from "@/components/Organization/OrganizationComponent.vue";
import RegisterOrganizationForm from "@/components/Organization/RegisterOrganizationForm.vue";
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const { allOrgs, selectedOrg } = storeToRefs(useOrganizationStore());
const { getOrganizations, setOrganization } = useOrganizationStore();
const orgWithNames = ref<Array<any>>([]);
const allOrgsComputed = computed(() => allOrgs.value.map((org: any) => org));
// const curOrg = ref<string>(selectedOrg.value !== undefined ? allOrgNames.value[selectedOrg.value] : "");
const curOrg = ref<string>(selectedOrg.value !== undefined ? allOrgs.value[selectedOrg.value].id : "");

async function changeOrganization() {
  if (curOrg.value !== "") {
    await setOrganization(curOrg.value);
    console.log(selectedOrg.value);
  }
}

async function getUserOrganizations() {
  try {
    orgWithNames.value = await fetchy(`/api/organization`, "GET");
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  try {
    await getOrganizations();
    await getUserOrganizations();
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
      <option v-for="org in orgWithNames" :key="org" :selected="curOrg === org" :value="org.id">{{ org.name }}</option>
    </select>
    <p v-else>You are currently not a part of organization</p>
    <h3>Manage Your Organizations</h3>
    <div v-for="org in allOrgsComputed" :key="org"><OrganizationComponent :orgId="org.id" @updateName="getUserOrganizations" /></div>
    <RegisterOrganizationForm />
    <section></section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
