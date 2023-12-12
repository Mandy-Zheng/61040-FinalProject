<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { ref, onBeforeMount } from "vue";
import Multiselect from "@vueform/multiselect";

const props = defineProps(["show", "organization"]);
const emit = defineEmits(["close", "edit"]);
const newDays = ref<Array<string>>([]);
const days = ref<Array<string>>(["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]);
const newRestockDay = ref<string>();

onBeforeMount(async () => {
  newDays.value=[];
  console.log(props.organization.restockDay);
  if(props.organization.openDays)
    props.organization.openDays.forEach(day => {
      newDays.value.push(days.value[day]);
    });
  if(props.organization.restockDay)
    newRestockDay.value=days.value[props.organization.restockDay];
});
</script>

<template>
  <transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-container">
        <h3>Edit days for {{ props.organization.name }}</h3>
        <h5>Open Days</h5>
        <div class="column">
          <Multiselect class="multiselect" v-model="newDays" mode="tags" :options="days" :searchable="true" :closeOnSelect="false" placeholder="Edit Days" required />
        </div>
        <h5>Restock Day</h5>
        <div class="column">
          <select class="restockDays" v-model="newRestockDay">
            <option v-for="day in days" :value="day">{{day}}</option>
          </select>
        </div>

        <div class="modal-footer">
          <button class="button-39" @click="emit('close')">Close</button>
          <button class="button-39" @click="emit('edit', newDays, newRestockDay),emit('close')">Edit Days</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
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
  width: 400px;
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

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

.multiselect {
  margin-bottom: 2em;
}

span {
  color: black;
}
</style>
