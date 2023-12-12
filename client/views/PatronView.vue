<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { storeToRefs } from "pinia";
import AllHouseholdsComponent from "../components/Patron/AllHouseholdsComponent.vue";
const { selectedOrg } = storeToRefs(useOrganizationStore());
</script>

<template>
  <div class="household" v-if="selectedOrg" style="background-color: rgb(246, 246, 246); padding-top: 2em; padding-bottom: 10em">
    <AllHouseholdsComponent />
  </div>
</template>
<style scoped></style>
