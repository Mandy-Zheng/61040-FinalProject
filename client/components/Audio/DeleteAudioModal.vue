<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";

const props = defineProps(["show", "language", "translation", "id"]);
const emit = defineEmits(["close", "delete"]);

async function deleteAudioFile() {
  try {
    await fetchy(`/api/languageAudio/${props.id}`, "DELETE");
    emit("delete");
  } catch (_) {
    return;
  }
}
</script>

<template>
  <transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-container">
        <h2>Are you sure you want to delete the following {{ props.language }} audio file that translates to:</h2>
        <p>{{ props.translation }}</p>
        <div class="modal-footer">
          <button class="button-39" @click="emit('close')">Cancel</button>
          <button class="button-39" @click="deleteAudioFile">Confirm</button>
        </div>
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
  width: 500px;
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
</style>
