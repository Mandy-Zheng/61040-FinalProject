<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import Multiselect from "@vueform/multiselect";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useOrganizationStore } from "../../stores/organization";

const { selectedOrg } = storeToRefs(useOrganizationStore());

const props = defineProps(["show", "allLanguages"]);
const emit = defineEmits(["close", "add"]);

const language = ref<string>("");
const audioLink = ref<string>("");
const translation = ref<string>("");

async function addAudioFile() {
  try {
    if (selectedOrg.value) {
      const body = { org: selectedOrg.value.id, language: language.value, audio: audioLink.value, translation: translation.value };
      await fetchy("/api/languageAudio", "POST", { body: body });
      emit("add", language.value);
    }
  } catch (_) {
    return;
  }
}
</script>

<template>
  <transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-container">
        <h1>Add New Language Audio File</h1>
        <div class="form">
          <div class="item">
            <div class="form-input">
              Language
              <div><Multiselect v-model="language" class="single" :createTag="true" :options="allLanguages" :searchable="true" /></div>
            </div>
            <div class="form-input">Audio Link<input v-model="audioLink" /></div>
            <div class="form-input">Translation: <input v-model="translation" /></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button-39" @click="console.log('click'), emit('close')">Cancel</button>
          <button class="button-39" @click="addAudioFile">Add</button>
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
  width: 300px;
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
