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
  showCreateModal.value = false;
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
    <div style="margin-left: 50px">
      <h3>Language Audio Files</h3>
      <div class="right">
        <button class="button-39" @click="showCreateModal = true">Add New Audio Files</button>
        <!-- <button class="button-39 reset" @click.prevent="showResetModal = true">Reset All Visits</button> -->
      </div>
      <teleport to="body">
        <CreateAudioModal @close="showCreateModal = false" :show="showCreateModal" :allLanguages="allLanguages" @add="refresh" />
      </teleport>
      <AudioComponent
        v-for="languageAudio in allLanguageAudio"
        :key="languageAudio"
        :language="languageAudio.language"
        :audios="languageAudio.audios"
        :allLanguages="allLanguages"
        @refresh="refresh"
      />
      <!-- <Multiselect class="multiselect" v-model="selected" :options="allOrgNames" :searchable="true" required /> -->
      <!-- <select v-if="allOrgs.length !== 0" v-model="curOrg" @change="changeOrganization">
        <option :value="undefined" :selected="curOrg === undefined" disabled>--Select an Organization--</option>
        <option v-for="org in orgWithNames" :key="org" :selected="curOrg === org.id" :value="org.id">{{ org.name }}</option>
      </select>
      <p v-else>You are currently not a part of organization</p> -->
      <h3>Manage Your Audio</h3>
      <div class="grid"></div>
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
  margin-right: 10em;
}
</style>
