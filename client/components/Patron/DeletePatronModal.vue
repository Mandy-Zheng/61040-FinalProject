<script setup lang="ts">
import Multiselect from "@vueform/multiselect";
import { computed, ref } from "vue";
const props = defineProps(["show", "members", "householdId"]);
const emit = defineEmits(["close", "delete"]);
const patronNames = computed(() =>
  props.members.map((patron: any) => {
    return { label: patron.name, value: patron._id };
  }),
);
const patronsToRemove = ref<Array<string>>([]);
</script>

<template>
  <transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-container">
        <h3>Removing Patrons from household {{ householdId }}</h3>
        <br />
        <div v-if="patronNames.length > 1">
          <Multiselect v-model="patronsToRemove" mode="tags" :options="patronNames" :searchable="true" />
          <button @click="emit('close')">Cancel</button>
          <button @click="emit('delete', patronsToRemove)">Delete</button>
        </div>
        <div v-else>Cannot remove only patron in the household <button @click="emit('close')">Cancel</button></div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.button-39 {
  background-color: var(--primary);
  color: white;
  height: 2.5em;
  align-content: center;
  text-align: center;
  padding-bottom: 2.2em;
  border: none;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header {
  margin-top: 0;
  color: var(--primary);
}
.button-39 {
  margin: 10px;
  padding: 10px;
}

.name {
  color: rgb(79, 78, 78);
}

.content {
  color: rgb(117, 117, 117);
  font-weight: 300;
}

h3 {
  margin: 0;
}

article {
  background-color: white;
  border: solid;
  border-color: rgb(214, 214, 214);
  border-radius: 1em;
  display: flex;
  flex-direction: row;
  padding: 1.5em 1.5em;
  font-weight: 400;
  font-size: small;
  gap: 2.5em;
  width: 20em;
  overflow: scroll;
}

.column {
  align-items: flex-start;
}

.circle {
  border-radius: 10em;
}
</style>
