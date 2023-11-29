<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { ref } from "vue";
const { createOrganization } = useOrganizationStore();

const orgName = ref<string>("");
async function register() {
  const body = { name: orgName.value };
  await createOrganization(body);
}
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="register">
    <h3>Register New Organization</h3>
    <fieldset>
      <div class="pure-control-group">
        <label for="aligned-name">Organization Name</label>
        <input v-model.trim="orgName" type="text" id="aligned-name" placeholder="Organization Name" required />
      </div>

      <div class="pure-controls">
        <button class="pure-button pure-button-primary" @click="register">Register</button>
      </div>
    </fieldset>
  </form>
</template>
