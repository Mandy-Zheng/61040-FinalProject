<script setup lang="ts">
import AddMemberComponent from "@/components/Organization/AddMemberComponent.vue";
import DeleteOrganizationComponent from "@/components/Organization/DeleteOrganizationComponent.vue";
import LeaveOrganizationComponent from "@/components/Organization/LeaveOrganizationComponent.vue";
import ManageMemberComponent from "@/components/Organization/ManageMembersComponent.vue";
import { useOrganizationStore } from "@/stores/organization";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());
const { updateOrganizationName, deleteOrganization, leaveOrganization } = useOrganizationStore();
const props = defineProps(["orgId"]);
const showAddModal = ref<boolean>(false);
const showManageModal = ref<boolean>(false);
const showDeleteModal = ref<boolean>(false);
const showLeaveModal = ref<boolean>(false);
const organization = ref<any>(undefined);
const isEditingName = ref<boolean>(false);
const orgName = ref<string>("");

async function addMembers(members: any) {
  const body = { orgId: props.orgId, newMembers: members };
  showAddModal.value = false;
  try {
    await fetchy(`/api/organization/addMember`, "PATCH", { body: body });
    organization.value = await fetchy(`/api/organization/${props.orgId}`, "GET");
  } catch (_) {
    return;
  }
}

async function updateOrgName() {
  await updateOrganizationName({ orgId: props.orgId, orgName: orgName.value });
  isEditingName.value = false;
}

async function manageMember(member: any, action: any) {
  showManageModal.value = false;
  if (action === "remove") {
    try {
      const memberId = (await fetchy(`/api/users/${member}`, "GET"))._id;
      const body = { orgId: props.orgId, member: memberId };
      await fetchy(`/api/organization/removeMember`, "PATCH", { body: body });
      organization.value = await fetchy(`/api/organization/${props.orgId}`, "GET");
    } catch (_) {
      return;
    }
  } else {
    try {
      const memberId = (await fetchy(`/api/users/${member}`, "GET"))._id;
      const isPromoting = action === "promote";
      const body = { orgId: props.orgId, member: memberId, isPromoting };
      await fetchy(`/api/organization/updateMember`, "PATCH", { body: body });
      organization.value = await fetchy(`/api/organization/${props.orgId}`, "GET");
    } catch (_) {
      return;
    }
  }
}

async function deleteOrg() {
  await deleteOrganization(props.orgId);
}

async function leaveOrg() {
  try {
    await leaveOrganization(props.orgId);
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  try {
    organization.value = await fetchy(`/api/organization/${props.orgId}`, "GET");
    orgName.value = organization.value.name;
  } catch (error) {
    return;
  }
});
</script>

<template>
  <div class="org" v-if="organization">
    <div v-if="organization.admins.includes(currentUsername)">
      <h4 v-if="!isEditingName">{{ organization.name }} <button class="button-39" @click="isEditingName = true">Edit Name</button></h4>
      <div v-else><input v-model.trim="orgName" /> <button class="button-39" @click="updateOrgName">Submit</button></div>
    </div>
    <div v-else>
      <h4>{{ organization.name }}</h4>
    </div>

    <p>Admins</p>
    <div v-for="admin in organization.admins" :key="admin">{{ admin }}</div>
    <p>Members</p>
    <div v-for="member in organization.members" :key="member">{{ member }}</div>
    <div v-if="organization.admins.includes(currentUsername)">
      <button class="button-39" @click.prevent="showAddModal = true">Add Members</button>
      <button class="button-39" @click.prevent="showManageModal = true">Manage Members</button>
      <button class="button-39 red" @click.prevent="showDeleteModal = true">Delete Org</button>
      <button v-if="organization.admins.length > 1" class="button-39 red" @click.prevent="showLeaveModal = true">Leave Org</button>
      <teleport to="body">
        <AddMemberComponent :show="showAddModal" :organization="organization" @close="showAddModal = false" @add="addMembers" />
        <ManageMemberComponent :show="showManageModal" :organization="organization" @close="showManageModal = false" @manage="manageMember" />
        <DeleteOrganizationComponent :show="showDeleteModal" :organization="organization" @close="showDeleteModal = false" @delete="deleteOrg(), (showDeleteModal = false)" />
        <div v-if="organization.admins.length > 1">
          <LeaveOrganizationComponent :show="showLeaveModal" :organization="organization" @close="showLeaveModal = false" @leave="leaveOrg(), (showLeaveModal = false)" />
        </div>
      </teleport>
    </div>
    <div v-else>
      <button class="button-39 red" @click.prevent="showLeaveModal = true">Leave Org</button>
      <teleport to="body">
        <LeaveOrganizationComponent :show="showLeaveModal" :organization="organization" @close="showLeaveModal = false" @leave="leaveOrg(), (showLeaveModal = false)" />
      </teleport>
    </div>
  </div>
  <section></section>
</template>

<style scoped>
.org {
  background-color: #9b9b9b;
  border-radius: 8px;
  margin-left: 8em;
  margin-top: 0.5em;
  padding: 0.5em;
  width: 24em;
}
.button-39 {
  margin-left: 5px;
  background-color: var(--primary);
  color: white;
}
.red {
  background-color: var(--red);
}
</style>
