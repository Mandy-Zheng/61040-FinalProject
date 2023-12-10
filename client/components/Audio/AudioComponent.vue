<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useOrganizationStore } from "../../stores/organization";
import { fetchy } from "../../utils/fetchy";
import DeleteAudioModal from "../Audio/DeleteAudioModal.vue";
import UpdateAudioModal from "./UpdateAudioModal.vue";

const { selectedOrg } = storeToRefs(useOrganizationStore());
const props = defineProps(["language", "audios", "allLanguages"]);
const emit = defineEmits(["refresh"]);
const loaded = ref<boolean>(true);
const allAudios = ref<Array<any>>(props.audios);
const showDeleteModal = ref<boolean>(false);
const showUpdateModal = ref<boolean>(false);
const selectedToDelete = ref<number | undefined>(undefined);
const selectedToUpdate = ref<number | undefined>(undefined);

async function getAudioForLanguage() {
  closeDeleteModal();
  try {
    if (selectedOrg.value) {
      const languageAudio = await fetchy(`/api/languageAudio/owner/${selectedOrg.value.id}/${props.language}`, "GET");
      allAudios.value = languageAudio.audios;
      if (!languageAudio.length) {
        emit("refresh");
      }
    }
  } catch (_) {
    return;
  }
}

async function deleteRefresh() {
  closeDeleteModal();
  await getAudioForLanguage();
}

async function updateRefresh(id: string, refresh: boolean) {
  closeUpdateModal();
  try {
    const languageAudio = await fetchy(`/api/languageAudio/${id}`, "GET");
    const idx = allAudios.value.findIndex((audio) => audio._id === id);
    if (idx !== -1) {
      allAudios.value[idx] = languageAudio;
    }
    if (refresh) {
      emit("refresh");
    }
  } catch (_) {
    return;
  }
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  selectedToDelete.value = undefined;
}

function closeUpdateModal() {
  showUpdateModal.value = false;
  selectedToUpdate.value = undefined;
}

//test link "https://drive.google.com/uc?id=1VtInAa-BG3uaxU26zqQLazd3afQL213C"
</script>

<template>
  <main>
    <div v-if="loaded && allAudios">
      <div class="column">
        <h2>{{ props.language }}</h2>
        <div v-for="(audio, idx) in allAudios" :key="audio">
          <p style="margin-left: 0.5em; margin-bottom: 10px; width: 50em; line-height: 1.25em">{{ audio.translation }}</p>
          <div class="row">
            <audio controls preload="auto">
              <source :src="audio.audio" type="audio/mp3" />
              <source :src="audio.audio" type="audio/ogg" />
              <source :src="audio.audio" type="audio/wav" />
              Your browser does not support the audio tag.
            </audio>

            <button class="icon" title="Update Audio" @click="(showUpdateModal = true), (selectedToUpdate = idx)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z" />
              </svg>
            </button>
            <button class="icon" title="Delete Audio" @click="(showDeleteModal = true), (selectedToDelete = idx)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                <path
                  d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
                />
              </svg>
            </button>
          </div>
        </div>
        <teleport to="body">
          <DeleteAudioModal
            v-if="selectedToDelete !== undefined && allAudios"
            :show="showDeleteModal"
            :id="audios[selectedToDelete]._id"
            :translation="audios[selectedToDelete].translation"
            :language="props.language"
            @close="closeDeleteModal"
            @delete="deleteRefresh"
          />
          <UpdateAudioModal
            v-if="selectedToUpdate !== undefined && allAudios"
            :allLanguages="props.allLanguages"
            :show="showUpdateModal"
            :id="audios[selectedToUpdate]._id"
            :oldLanguage="props.language"
            :oldAudioLink="audios[selectedToUpdate].audio"
            :oldTranslation="audios[selectedToUpdate].translation"
            @update="updateRefresh"
            @close="closeUpdateModal"
          />
        </teleport>
      </div>
    </div>
    <p v-else-if="loaded">No Audio found</p>
    <p v-else>Loading...</p>
  </main>
</template>

<style scoped>
.name {
  color: rgb(79, 78, 78);
}

.content {
  color: rgb(117, 117, 117);
  font-weight: 300;
}

h2 {
  margin: 0;
}

.column {
  align-items: flex-start;
  display: flex;
  gap: 1.25em;
}

.circle {
  border-radius: 10em;
}

.audio {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 0.5em;
}

audio {
  height: 2em;
}

.row {
  display: flex;
  align-content: center;
}
</style>
