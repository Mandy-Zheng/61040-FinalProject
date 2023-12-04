<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const content = ref("");
const start = ref("");
const end = ref("");
const emit = defineEmits(["refreshShifts"]);
const { selectedOrg } = storeToRefs(useOrganizationStore());
const today = new Date().toISOString().slice(0, new Date().toISOString().lastIndexOf(":"));

async function createShift() {
  try {
    if (selectedOrg.value) {
      const body = { orgId: selectedOrg.value.id, start: start.value, end: end.value };
      await fetchy("api/shift", "POST", {
        body: body,
      });
    }
  } catch (_) {
    return;
  }
  emit("refreshShifts");
  emptyForm();
}

const emptyForm = () => {
  content.value = "";
  start.value = "";
  end.value = "";
};
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="createShift">
    <fieldset>
      <div class="pure-control-group align">
        <p>Start: <input v-model.trim="start" type="datetime-local" id="start-date" :min="today" required /></p>
        <p>End: <input v-model.trim="end" type="datetime-local" :min="start.slice(0, new Date().toISOString().lastIndexOf(':'))" required /></p>
        <button class="button-39">Create shift</button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: 0.9em;
  height: 7em;
  padding: 0.5em;
  border-radius: 10px;
  resize: none;
  border: none;
  background-color: white;
}

.pure-button {
  background-color: var(--cadet);
  border-radius: 8px;
  width: auto;
  font-size: 0.9em;
}
</style>
