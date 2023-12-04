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
      <div class="pure-control-group align">
        <input v-model.trim="orgName" type="text" id="aligned-name" placeholder="Organization Name" required />
        <button class="button-39">Register</button>
      </div>
    </fieldset>
  </form>
</template>
<style scoped>
.button-39 {
  background-color: var(--primary);
  color: white;
  height: 2.5em;
  align-content: center;
  text-align: center;
  padding-bottom: 2em;
}
.align {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  gap: 1em;
}
</style>
