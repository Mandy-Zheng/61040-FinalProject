<script setup lang="ts">
const props = defineProps(["idx", "name", "birthday", "image"]);
const emit = defineEmits(["updateName", "updateBirthday", "updateImage", "delete"]);

function updateName(event: any) {
  emit("updateName", props.idx, event.target.value);
}

function updateBirthday(event: any) {
  emit("updateBirthday", props.idx, event.target.value);
}

function updateImage(event: any) {
  emit("updateImage", props.idx, event.target.value);
}
</script>

<template>
  <div class="patron-card">
    <div class="title"><span>Patron</span><button @click="emit('delete', props.idx)">Delete</button></div>
    <div class="form-input"><span>Name:</span> <input @input="updateName" :value="props.name" /></div>

    <div class="form-input"><span>Birthday:</span> <input type="date" :value="props.birthday" @input="updateBirthday" /></div>
    <div class=""><span>Image:</span> <input @input="updateImage" :value="props.image" /></div>
  </div>
</template>

<style scoped>
.patron-card {
  display: flex;
  flex-direction: column;
  background-color: var(--primary);
  padding: 1em;
  margin-top: 1em;
  margin-bottom: 1em;
}

.title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 0.5em;
}
.form-input {
  margin-bottom: 0.5em;
  display: flex;
  flex-direction: row;
}
input {
  border: 1px solid black;
  padding-left: 0.5em;
  padding-left: 0.5em;
  margin-left: 1em;
  border-radius: 64px;
}

span {
}
</style>
