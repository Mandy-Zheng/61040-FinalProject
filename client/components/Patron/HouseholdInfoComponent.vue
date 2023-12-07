<script setup lang="ts">
import { formatDate } from "@/utils/formatDate";
import Multiselect from "@vueform/multiselect";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useOrganizationStore } from "../../stores/organization";
import { fetchy } from "../../utils/fetchy";
const props = defineProps(["household"]);
const emit = defineEmits(["refreshVisits", "refreshHouseholds"]);
const dietaryTags = ["Vegetarian", "Halal", "Gluten-Free", "Nut-Free", "Low-Sodium", "Seafood", "Dairy-Free", "Kosher"];
const LANGUAGES = ["English", "Spanish", "French", "Portuguese", "Arabic", "Russian", "Japanese", "Bengali", "Dutch", "Urdu", "Polish", "Indonesian", "Korean", "Mandarin", "Cantonese"];

const { selectedOrg } = storeToRefs(useOrganizationStore());
const language = ref<string>(props.household.preferredLanguage);
const requests = ref<string>(props.household.specialRequests);
const dietRestrictions = ref<Array<string>>(props.household.dietaryRestrictions);
const allAudios = ref<Array<any>>([]);
const editMode = ref<boolean>(false);
const showAudio = ref<boolean>(false);
const tagColors = new Map([
  ["Vegetarian", "#b9fbc0"],
  ["Halal", "#fde4cf"],
  ["Gluten-Free", "#fbf8cc"],
  ["Nut-Free", "#ffcfd2"],
  ["Low-Sodium", "#8eecf5"],
  ["Seafood", "#90dbf4"],
  ["Dairy-Free", "#a3c4f3"],
  ["Kosher", "#cfbaf0"],
]);
const multiselectDietTags = dietaryTags.map((tag) => {
  return { label: tag, value: tag };
});

function resetUpdate() {
  editMode.value = false;
  language.value = props.household.preferredLanguage;
  requests.value = props.household.specialRequests;
  dietRestrictions.value = props.household.dietaryRestrictions;
}
async function updateOverview() {
  try {
    if (selectedOrg.value) {
      const body = { id: props.household._id, update: { dietaryRestrictions: dietRestrictions.value, preferredLanguage: language.value, specialRequests: requests.value } };
      await fetchy(`/api/profile`, "PATCH", { body: body });

      emit("refreshHouseholds");
      editMode.value = false;
    }
  } catch (error) {
    return;
  }
}

async function getAudioForLanguage() {
  try {
    if (selectedOrg.value && language.value.length) {
      console.log("here", selectedOrg.value.id, language.value);
      const languageAudio = await fetchy(`/api/languageAudio/owner/${selectedOrg.value.id}/${language.value}`, "GET");
      allAudios.value = languageAudio.audios;
    }
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  try {
    await getAudioForLanguage();
  } catch (error) {
    return;
  }
});
</script>

<template>
  <div v-if="props.household" class="item-card">
    <div class="item">
      <div>
        <h3>{{ props.household._id }}</h3>
        <div class="info">
          <p>
            Past visits: {{ props.household.pastVisits.length }}
            <button class="icon" @click="emit('refreshVisits')" title="Add visit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
              </svg>
            </button>
          </p>
          <ul v-if="props.household.pastVisits.length > 0">
            <div v-for="visit in props.household.pastVisits" :key="visit" class="date">{{ formatDate(visit) }}</div>
          </ul>
        </div>
        <button @click="editMode = true">Edit Overview</button>
        <div v-if="editMode" class="row">
          <p class="label">Diet:</p>
          <Multiselect class="multiselect" v-model="dietRestrictions" mode="tags" :options="multiselectDietTags" :searchable="true" required />
        </div>
        <div class="info" v-else>
          <p class="diet-title">Dietary Restrictions:</p>
          <div class="row">
            <div v-for="tag in props.household.dietaryRestrictions" :key="tag">
              <p class="tag" v-bind:style="{ backgroundColor: tagColors.get(tag) }">{{ tag }}</p>
            </div>
          </div>
        </div>

        <div class="row">
          <div v-if="editMode" class="edit-row">
            <p class="label">Language:</p>
            <Multiselect class="multiselect" v-model="language" :createTag="true" :options="LANGUAGES" :searchable="true" />
          </div>
          <div v-else>
            <p>Language: {{ props.household.preferredLanguage }}</p>
            <div v-if="allAudios.length !== 0">
              <button v-if="!showAudio" @click="showAudio = true">Show Audio</button>
              <button v-else @click="showAudio = false">Hide Audio</button>
              <div v-if="showAudio">
                <div v-for="audio in allAudios" :key="audio">
                  <audio controls preload="auto">
                    <source :src="audio.audio" type="audio/mp3" />
                    <source :src="audio.audio" type="audio/ogg" />
                    <source :src="audio.audio" type="audio/wav" />
                    Your browser does not support the audio tag.
                  </audio>
                  <p class="">{{ audio.translation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="info" v-if="household.specialRequests">
          <div v-if="editMode" class="row">
            <p class="label">Requests:</p>
            <input v-model="requests" />
          </div>
          <p v-else>Requests: {{ props.household.specialRequests }}</p>
        </div>
        <button class="button-39" v-if="editMode" @click="updateOverview">Update</button>
        <button class="button-39" v-if="editMode" @click="resetUpdate">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modify {
  display: flex;
  height: fit-content;
}

.label {
  margin-right: 1em;
}
.item-card {
  display: flex;
  flex-direction: row;
  padding: 0em;
}
.multiselect {
  width: 80%;
  margin: 0;
}
.edit-row {
  display: flex;
  width: 100%;
}

.item {
  display: flex;
  flex-direction: row;
  height: max-content;
  justify-content: space-between;
}

.tag {
  border: 1px solid rgba(0, 0, 0, 0.296);
  font-size: smaller;
  padding: 5px;
  border-radius: 64px;
  width: fit-content;
}

.info {
  padding: 0;
  padding-left: 0em;
  border-radius: 16px;
  margin-bottom: 1em;
}
.diet-title {
  margin-bottom: 1em;
  margin-top: 1em;
}

h2 {
  margin-bottom: 1;
  font-weight: lighter;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 0.5em;
  flex-wrap: wrap;
  row-gap: 0.5em;
}

p {
  margin: 0px;
  display: flex;
  align-content: center;
  gap: 1em;
}

.date {
  font-weight: 400;
}
</style>
