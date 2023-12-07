<script setup lang="ts">
import { LANGUAGES, capitalizePhrase } from "@/../server/framework/utils";
import { fetchy } from "@/utils/fetchy";
import Multiselect from "@vueform/multiselect";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useOrganizationStore } from "../../stores/organization";

const { selectedOrg } = storeToRefs(useOrganizationStore());

const props = defineProps(["show", "allLanguages"]);
const emit = defineEmits(["close", "add"]);

const language = ref<string>("");
const audioLink = ref<string>("");
const translation = ref<string>("");

const languageOptions = computed(() => [...new Set([...props.allLanguages, ...LANGUAGES])]);

async function addAudioFile() {
  try {
    if (selectedOrg.value) {
      const body = { org: selectedOrg.value.id, language: language.value, audio: audioLink.value, translation: translation.value };
      await fetchy("/api/languageAudio", "POST", { body: body });
      emit("close");
      emit("add", language.value);
    }
  } catch (_) {
    return;
  }
  resetForm();
}

function resetForm() {
  language.value = "";
  audioLink.value = "";
  translation.value = "";
  emit("close");
}
function onCreate(option: { value: string; label: string } | string, select$: any) {
  if (typeof option === "string") {
    // Handle the case when the option is just a string
    return capitalizePhrase(option);
  } else {
    // Handle the case when the option has value and label properties
    option.label = capitalizePhrase(option.label);
    option.value = option.label;
  }
  return option;
}
</script>

<template>
  <transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-container">
        <h3>Add New Language Audio File</h3>
        <div class="form">
          <div class="item">
            <div class="form-input">
              Language
              <div><Multiselect class="multiselect" v-model="language" :createTag="true" :options="languageOptions" :searchable="true" @create="onCreate" required /></div>
            </div>
            <div class="form-input">Audio Link:<input v-model="audioLink" /></div>
            <div class="form-input">Translation: <input v-model="translation" /></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button-39" style="color: black; background-color: white; border: solid; border-width: 1px; border-color: grey" @click="resetForm">Cancel</button>
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
  margin-top: 1em;
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

.form-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.multiselect {
  width: 11em;
  height: fit-content;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

input {
  height: 2.2em;
  width: 22em;

  border: solid;
  border-width: 1px;
  border-color: rgb(188, 188, 188);
  border-radius: 3px;
  margin-bottom: 0px;
  padding: 5px;
}
</style>
