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
        <button class="button-39" @click="showCreateModal = true">Add New Audio Files</button>
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
  margin-top: 75px;
  margin-bottom: 75px;
}
</style>
