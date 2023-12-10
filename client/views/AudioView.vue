<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import AudioComponent from "../components/Audio/AudioComponent.vue";
import CreateAudioModal from "../components/Audio/CreateAudioModal.vue";
import { useOrganizationStore } from "../stores/organization";
import { fetchy } from "../utils/fetchy";

const { selectedOrg } = storeToRefs(useOrganizationStore());
const showCreateModal = ref<boolean>(false);
const allLanguageAudio = ref<Array<any>>([]);
const allLanguages = computed(() => allLanguageAudio.value.map((languageAudio) => languageAudio.language));

async function refresh(language: string) {
  const idx = allLanguageAudio.value.findIndex((languageAudio) => languageAudio.language === language);
  if (selectedOrg.value) {
    if (idx !== -1) {
      allLanguageAudio.value[idx] = await fetchy(`/api/languageAudio/owner/${selectedOrg.value.id}/${language}`, "GET");
    } else {
      allLanguageAudio.value = await fetchy(`/api/languageAudio/owner/${selectedOrg.value.id}/allLanguages`, "GET");
    }
  }
}

async function getAllLanguageAudio() {
  try {
    if (selectedOrg.value) {
      allLanguageAudio.value = await fetchy(`/api/languageAudio/owner/${selectedOrg.value.id}/allLanguages`, "GET");
    }
  } catch {
    return;
  }
}

onBeforeMount(async () => {
  try {
    await getAllLanguageAudio();
  } catch (error) {
    return;
  }
});
</script>

<template>
  <main>
    <div style="margin-left: 170px; margin-right: 200px">
      <div class="right">
        <button class="button-39" @click="showCreateModal = true">
          Upload New Audio File
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z" />
          </svg>
        </button>
        <!-- <button class="button-39 reset" @click.prevent="showResetModal = true">Reset All Visits</button> -->
      </div>
      <teleport to="body">
        <CreateAudioModal @close="showCreateModal = false" :show="showCreateModal" :allLanguages="allLanguages" @add="refresh" />
      </teleport>
      <div class="language">
        <AudioComponent
          v-for="languageAudio in allLanguageAudio"
          :key="languageAudio"
          :language="languageAudio.language"
          :audios="languageAudio.audios"
          :allLanguages="allLanguages"
          @refresh="refresh"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

select {
  height: 35px;
  padding: 5px;
  border-color: rgb(188, 188, 188);
  border-radius: 5px;
}
.grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2em 2em;
}

.right {
  display: flex;
  justify-content: flex-end;
  margin-top: 2em;
  margin-right: 0em;
}

.language {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  gap: 4em;
  margin-bottom: 75px;
}

.button-39 {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
</style>
