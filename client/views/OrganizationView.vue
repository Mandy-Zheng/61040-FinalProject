<script setup lang="ts">
import OrganizationComponent from "@/components/Organization/OrganizationComponent.vue";
import RegisterOrganizationForm from "@/components/Organization/RegisterOrganizationForm.vue";
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useToastStore } from "../stores/toast";

const { selectedOrg } = storeToRefs(useOrganizationStore());
const { setOrganization } = useOrganizationStore();
const orgWithNames = ref<Array<any>>([]);
const allOrgs = ref<Array<string>>([]);
async function changeOrganization(orgId: string) {
  const selected = orgWithNames.value.filter((org) => org.id === orgId);
  if (selected && selected[0].name !== selectedOrg.value?.name) {
    setOrganization(selected[0]);
    await useToastStore().showToast({ message: "Successfully Changed Workspace to " + selected[0].name, style: "success" });
  }
}

async function leavingOrganizations(org: any) {
  if (org === selectedOrg.value?.id) {
    setOrganization(undefined);
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
  <main style="background-color: rgb(247, 247, 247); padding-top: 2em; padding-bottom: 10em">
    <div style="">
      <RegisterOrganizationForm class="form" @addOrg="getUserOrganizations" />
      <h3>
        Current Organization:
        <span>{{ selectedOrg?.name ?? "None" }}</span>
      </h3>
      <h3 style="margin-top: 2em">Manage Your Organizations</h3>
      <div class="grid">
        <!-- <div v-for="org in allOrgs" :key="org"><OrganizationComponent :orgId="org" @leaveOrg="leavingOrganizations" @updateName="getUserOrganizations" /></div> -->
        <div v-for="org in allOrgs" :key="org">
          <OrganizationComponent :orgId="org" :isSelected="selectedOrg?.id === org" @leaveOrg="leavingOrganizations" @updateName="getUserOrganizations" @select="changeOrganization" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
span {
  font-weight: lighter;
}
.form {
  margin-left: 2em;
}

h1 {
  text-align: center;
}
h3 {
  margin-left: 2em;
}
select {
  height: 35px;
  padding: 5px;
  border-color: rgb(188, 188, 188);
  border-radius: 5px;
}
.grid {
  display: flex;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2em 2em;
  margin-bottom: 4em;
}

.box {
  color: var(--primary);
}
</style>
