<script setup lang="ts">
import OrganizationComponent from "@/components/Organization/OrganizationComponent.vue";
import RegisterOrganizationForm from "@/components/Organization/RegisterOrganizationForm.vue";
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { selectedOrg } = storeToRefs(useOrganizationStore());
const { setOrganization } = useOrganizationStore();
const orgWithNames = ref<Array<any>>([]);
const allOrgs = ref<Array<string>>([]);
const curOrg = ref<string | undefined>(selectedOrg.value?.id);

async function changeOrganization() {
  if (curOrg.value) {
    const selected = orgWithNames.value.filter((org) => org.id === curOrg.value);
    if (selected) {
      await setOrganization(selected[0]);
    }
  }
}

async function leavingOrganizations(org: any) {
  if (org === curOrg.value) {
    curOrg.value = "";
    selectedOrg.value = undefined;
  }
  await getUserOrganizations();
}

async function getUserOrganizations() {
  try {
    orgWithNames.value = await fetchy(`/api/organization`, "GET");
    allOrgs.value = orgWithNames.value.map((org) => org.id);
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  try {
    await getUserOrganizations();
  } catch {
    return;
  }
});
</script>

<template>
  <main>
    <div style="margin-left: 50px">
      <h3>Current Organization</h3>
      <!-- <Multiselect class="multiselect" v-model="selected" :options="allOrgNames" :searchable="true" required /> -->
      <select v-if="allOrgs.length !== 0" v-model="curOrg" @change="changeOrganization">
        <option :value="undefined" :selected="curOrg === undefined" disabled>--Select an Organization--</option>
        <option v-for="org in orgWithNames" :key="org" :selected="curOrg === org.id" :value="org.id">{{ org.name }}</option>
      </select>
      <p v-else>You are currently not a part of organization</p>
      <h3>Manage Your Organizations</h3>
      <div class="grid">
        <!-- <div v-for="org in allOrgs" :key="org"><OrganizationComponent :orgId="org" @leaveOrg="leavingOrganizations" @updateName="getUserOrganizations" /></div> -->
        <div v-for="org in allOrgs" :key="org"><OrganizationComponent :orgId="org" @leaveOrg="leavingOrganizations" @updateName="getUserOrganizations" /></div>
      </div>
      <RegisterOrganizationForm @addOrg="getUserOrganizations" />
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

select {
  height: 35px;
  padding: 5px;
  border-color: rgb(188, 188, 188);
  border-radius: 5px;
}
.grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2em 2em;
}

.box {
  color: var(--primary);
}
</style>
