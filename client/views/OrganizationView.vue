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
  <main>
    <div class="org">
      <h1 class="title">
        Current Organization:
<<<<<<< Updated upstream
        <span>{{ selectedOrg?.name ?? "None" }}</span>
      </h1>
      <RegisterOrganizationForm class="form" @addOrg="getUserOrganizations" />
      <h3 class="manage">Manage Your Organizations</h3>
<<<<<<< HEAD
      <div v-if="allOrgs.length">
        <div :class="allOrgs.length < 3 ? 'small-grid' : 'grid'">
          <!-- <div v-for="org in allOrgs" :key="org"><OrganizationComponent :orgId="org" @leaveOrg="leavingOrganizations" @updateName="getUserOrganizations" /></div> -->
          <div v-for="org in allOrgs" :key="org">
            <OrganizationComponent :orgId="org" :isSelected="selectedOrg?.id === org" @leaveOrg="leavingOrganizations" @updateName="getUserOrganizations" @select="changeOrganization" />
          </div>
        </div>
      </div>
      <div class="no-org" v-else>
        <h2><i>No Organizations</i></h2>
      </div>
=======
      <div :class="allOrgs.length < 3 ? 'small-grid' : 'grid'">
        <!-- <div v-for="org in allOrgs" :key="org"><OrganizationComponent :orgId="org" @leaveOrg="leavingOrganizations" @updateName="getUserOrganizations" /></div> -->
||||||| Stash base
        <span>{{ selectedOrg?.name ?? "None" }}</span>
      </h3>
      <h3 style="margin-top: 2em">Manage Your Organizations</h3>
      <div class="grid">
        <!-- <div v-for="org in allOrgs" :key="org"><OrganizationComponent :orgId="org" @leaveOrg="leavingOrganizations" @updateName="getUserOrganizations" /></div> -->
=======
        <span>{{ selectedOrg?.name ?? "no organization selected" }}</span>
      </h3>
      <h3 style="margin-top: 2em">Manage Your Organizations</h3>
      <div v-if="allOrgs.length !== 0" class="grid">
>>>>>>> Stashed changes
        <div v-for="org in allOrgs" :key="org">
          <OrganizationComponent :orgId="org" :isSelected="selectedOrg?.id === org" @leaveOrg="leavingOrganizations" @updateName="getUserOrganizations" @select="changeOrganization" />
        </div>
      </div>
      <h3 style="padding: 2em" v-else>No organizations yet!</h3>
>>>>>>> ea1002c2265d2d2a200bc8c2d1d3d09c9cc7ae63
    </div>
  </main>
</template>

<style scoped>
.no-org,
h2 {
  margin-top: 1em;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--faded);
  font-weight: lighter;
  font-size: 36px;
}
main {
  background-color: rgb(247, 247, 247);
  padding-top: 2em;
  padding-bottom: 10em;
  height: 100vh;
}
.org {
  display: flex;
  flex-direction: column;
}
main {
  padding: 4em;
}
.title {
  font-size: 32px;
  font-weight: bolder;
  margin: 0;
  margin-bottom: 1em;
  margin-left: 1em;
  text-align: start;
}
.manage {
  font-weight: lighter;
  margin-left: 1.75em;
}

span {
  font-weight: lighter;
}
.form {
  margin-left: 2em;
}

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
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2em 2em;
  margin-bottom: 4em;
}

.small-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2em 2em;
  margin-bottom: 4em;
  margin-left: 8em;
}

.box {
  color: var(--primary);
}
</style>
