<script setup lang="ts">
import AddMemberComponent from "@/components/Organization/AddMemberComponent.vue";
import DeleteOrganizationComponent from "@/components/Organization/DeleteOrganizationComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useOrganizationStore } from "@/stores/organization";

const { currentUsername } = storeToRefs(useUserStore());
const { getOrganizations,deleteOrganization } = useOrganizationStore();
const props = defineProps(["orgId"]);
const showAddModal = ref<boolean>(false);
const showDeleteModal = ref<boolean>(false);
const organization = ref<any>(undefined);
async function addMembers(members:any) {
  const body = { orgId: props.orgId, newMembers: members };
  console.log(members);
  showAddModal.value = false;
  try {
    await fetchy(`/api/organization/addMember`, "PATCH", { body: body });
    organization.value = await fetchy(`/api/organization/${props.orgId}`, "GET");
  } catch (_) {
    return;
  }
}
async function deleteOrg() {
  await deleteOrganization(props.orgId);
}
onBeforeMount(async () => {
  try {
    organization.value = await fetchy(`/api/organization/${props.orgId}`, "GET");
  } catch (error) {
    return;
  }
});
</script>

<template>
  <div class="org" v-if="organization">
    <h4>{{ organization.name }}</h4>
    <p>Admins</p>
    <div v-for="admin in organization.admins" :key="admin">{{ admin }}</div>
    <p>Members</p>
    <div v-for="member in organization.members" :key="member">{{ member }}</div>
    <div v-if="organization.admins.includes(currentUsername)">
      <button class="button-39" @click.prevent="showAddModal = true">Add Member</button>
      <button class="button-39 red" @click.prevent="showDeleteModal = true">Delete Org</button>
      <teleport to="body">
        <AddMemberComponent :show="showAddModal" :organization="organization" @close="showAddModal = false" @add="addMembers" />
        <DeleteOrganizationComponent :show="showDeleteModal" :organization="organization" @close="showDeleteModal = false" @delete="deleteOrg(),showDeleteModal = false" />
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
  margin-left:5px;
  background-color: var(--primary);
  color: white;
}
.red {
  background-color: var(--red);
}
</style>
