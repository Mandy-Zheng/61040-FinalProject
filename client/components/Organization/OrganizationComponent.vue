<script setup lang="ts">
import AddMemberComponent from "@/components/Organization/AddMemberModal.vue";
import DeleteOrganizationComponent from "@/components/Organization/DeleteOrganizationModal.vue";
import LeaveOrganizationComponent from "@/components/Organization/LeaveOrganizationModal.vue";
import ManageMemberComponent from "@/components/Organization/ManageMembersModal.vue";
import { useOrganizationStore } from "@/stores/organization";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());
const { setOrganization } = useOrganizationStore();
const { selectedOrg } = storeToRefs(useOrganizationStore());
const props = defineProps(["orgId"]);
const emit = defineEmits(["updateName", "leaveOrg"]);
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
  isEditingName.value = false;
  try {
    const body = { orgId: props.orgId, orgName: orgName.value };
    await fetchy("/api/organization", "PATCH", { body: body });
    organization.value = await fetchy(`/api/organization/${props.orgId}`, "GET");
    orgName.value = organization.value.name;
    if (selectedOrg.value && selectedOrg.value.id === props.orgId) {
      await setOrganization({ id: props.orgId, name: orgName.value });
    }
    emit("updateName");
  } catch (_) {
    return;
  }
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
  try {
    await fetchy(`/api/organization/${props.orgId}`, "DELETE");
    emit("leaveOrg", organization.value.id);
  } catch (_) {
    return;
  }
}

async function leaveOrg() {
  try {
    const body = { orgId: props.orgId };
    await fetchy("/api/organization/leaveOrganization", "PATCH", { body: body });
    emit("leaveOrg", organization.value.id);
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
      <h4 v-if="!isEditingName">
        {{ orgName }}
        <button class="icon" @click="isEditingName = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
            <path
              d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
            />
            <path
              fill-rule="evenodd"
              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
            />
          </svg>
        </button>
      </h4>
      <div v-else>
        <input style="padding: 0.5em; border-radius: 0.5em; border-color: rgb(197, 197, 197); border-width: 0.5px" v-model.trim="orgName" />
        <button class="icon" @click="updateOrgName">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
            <path
              d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022"
            />
          </svg>
        </button>
      </div>
    </div>
    <div v-else>
      <h4>{{ orgName }}</h4>
    </div>

    <p>Admins</p>
    <div v-for="admin in organization.admins" :key="admin">{{ admin }}</div>
    <p>Members</p>
    <div v-for="member in organization.members" :key="member">{{ member }}</div>
    <div v-if="organization.admins.includes(currentUsername)">
      <div class="modify">
        <button class="button-39" @click.prevent="showAddModal = true">Add Members</button>
        <button class="button-39" @click.prevent="showManageModal = true">Manage Members</button>
        <button class="button-39 red" @click.prevent="showDeleteModal = true">Delete Org</button>
        <button v-if="organization.admins.length > 1" class="button-39 red" @click.prevent="showLeaveModal = true">Leave Org</button>
      </div>
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
  background: linear-gradient(90deg, rgba(255, 140, 84, 0.5) 100%, rgba(255, 194, 0, 0.5) 100%);
  border-radius: 8px;
  padding: 1em 1em;
  width: 24em;
  height: 15em;
  border-radius: 0.4rem;
  overflow: hidden;
  box-shadow: 0 3rem 6rem rgba(0, 0, 0, 0.028);
  cursor: pointer;
  transition: 0.2s;
}

.org:hover {
  transform: translateY(-0.5%);
  box-shadow: 0 4rem 8rem rgba(0, 0, 0, 0.1);
}

.button-39 {
  margin-left: 5px;
  background-color: var(--primary);
  color: white;
  font-weight: 300;
  border: none;
  margin: 5px;
  padding: 7px;
}
.red {
  background-color: var(--red);
}

.modify {
  display: flex;
  gap: 1em;
}
</style>
