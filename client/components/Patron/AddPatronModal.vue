<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["show", "householdId"]);
const emit = defineEmits(["add", "close"]);
const today = new Date().toISOString().split("T")[0];
const name = ref<string>("");
const image = ref<string>("");
const birthday = ref<string>(today);

async function addMember() {
  try {
    const body = { id: props.householdId, name: name.value, birthday: birthday.value, img: image.value };
    await fetchy(`/api/profile/addPatron`, "PATCH", { body: body });
    emit("close");
    emit("add");
  } catch (error) {
    return;
  }
}
</script>

<template>
  <transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <div class="patron-card">
          <div class="title">Add Member To Household with id: {{ props.householdId }}</div>
          <div class="form-input"><span>Name:</span> <input v-model="name" /></div>

          <div class="form-input"><span>Birthdate:</span> <input type="date" :max="today" v-model="birthday" /></div>
          <div class="form-input"><span>Photo Link:</span> <input :v-model="image" /></div>
          <div class="row">
            <button @click="emit('close')">Cancel</button>
            <button @click="addMember">Add</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.row {
  display: flex;
}
.modal-container {
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
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
.patron-card {
  display: flex;
  flex-direction: column;
  background-color: rgb(240, 240, 240);
  padding: 1em;
  margin-top: 1em;
  margin-bottom: 1em;
  border-radius: 5px;
}

.title {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-bottom: 0.5em;
}
.form-input {
  margin-bottom: 1em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

input {
  padding-left: 0.5em;
  padding-left: 0.5em;
  margin-left: 1em;
  border-radius: 5px;
  height: 35px;
  border-color: rgb(219, 219, 219);
  border: solid;
  width: 10em;
  border-width: 1px;
}

span {
  margin-right: 1em;
}

img {
  height: 50px;
  width: 50px;
  margin-right: 15em;
  margin-bottom: 1em;
}

.circle {
  border-radius: 10em;
}
</style>
