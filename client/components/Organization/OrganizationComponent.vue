<script setup lang="ts">
import AddMemberComponent from "@/components/Organization/AddMemberComponent.vue";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["organization"]);
const showEditModal = ref<boolean>(false);
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
    <button class="pure-button" @click.prevent="showEditModal = true">Edit</button>
    <teleport to="body">
      <AddMemberComponent :show="showEditModal" :organization="organization" @close="showEditModal = false" />
    </teleport>
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
