<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { ref } from "vue";

const emit = defineEmits(["addOrg"]);

const orgName = ref<string>("");
async function register() {
  try {
    const body = { name: orgName.value };
    await fetchy("/api/organization", "POST", { body: body });
    orgName.value = "";
    emit("addOrg");
  } catch (_) {
    return;
  }
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
        <button class="button-39">Register</button>
      </div>
    </fieldset>
  </form>
</template>
<style scoped>
.button-39 {
  background-color: var(--primary);
  color: white;
}
</style>
