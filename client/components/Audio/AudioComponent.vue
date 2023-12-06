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
      <h3>{{ props.language }}</h3>
      <div class="column">
        <div v-for="(audio, idx) in allAudios" :key="audio">
          <audio controls preload="auto">
            <source :src="audio.audio" type="audio/mp3" />
            <source :src="audio.audio" type="audio/ogg" />
            <source :src="audio.audio" type="audio/wav" />
            Your browser does not support the audio tag.
          </audio>
          <p class="">{{ audio.translation }}</p>
          <button class="button-39" @click="(showUpdateModal = true), (selectedToUpdate = idx)">Update</button>
          <button class="button-39" @click="(showDeleteModal = true), (selectedToDelete = idx)">Delete</button>
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

h3 {
  margin: 0;
}

.column {
  align-items: flex-start;
}

.circle {
  border-radius: 10em;
}
</style>
