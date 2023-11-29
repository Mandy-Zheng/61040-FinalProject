<script setup lang="ts">
import AddMemberComponent from "@/components/Organization/AddMemberComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());
const props = defineProps(["organization"]);
const showAddModal = ref<boolean>(false);
onBeforeMount(() => {
  console.log("WOAH");
});
</script>

<template>
  <div class="org">
    <h4>{{ props.organization.name }}</h4>
    <p>Admins</p>
    <div v-for="admin in props.organization.admins" :key="admin">{{ admin }}</div>
    <p>Members</p>
    <div v-for="member in props.organization.members" :key="member">{{ member }}</div>
    <div v-if="props.organization.admins.includes(currentUsername)">
      <button class="pure-button" @click.prevent="showAddModal = true">Add Member</button>
      <teleport to="body">
        <AddMemberComponent :show="showAddModal" :organization="organization" @close="showAddModal = false" />
      </teleport>
    </div>
  </div>
  <section></section>
</template>

<style scoped>
.org {
  background-color: #9b9b9b;
  border-radius: 8px;
  margin-left: 16em;
  margin-right: 16em;
  padding: 0.5em;
}
</style>
