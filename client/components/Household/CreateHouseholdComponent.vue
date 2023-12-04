<script setup lang="ts">
import Multiselect from "@vueform/multiselect";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useOrganizationStore } from "../../stores/organization";
import { fetchy } from "../../utils/fetchy";
import CreatePatronComponent from "./CreatePatronComponent.vue";

const props = defineProps(["show"]);
const emit = defineEmits(["close", "add"]);

const { selectedOrg } = storeToRefs(useOrganizationStore());

const dietaryTags = ["Vegetarian", "Halal", "Gluten-Free", "Nut-Free", "Low-Sodium", "Seafood", "Dairy-Free", "Kosher"];
const LANGUAGES = ["English", "Spanish", "French", "Portuguese", "Arabic", "Russian", "Japanese", "Bengali", "Dutch", "Urdu", "Polish", "Indonesian", "Korean", "Mandarin", "Cantonese"];

const multiselectDietTags = dietaryTags.map((tag) => {
  return { label: tag, value: tag };
});

const members = ref<Array<[string, string, string]>>([["", "", ""]]);
const enum memberProfile {
  Name = 0,
  Birthday = 1,
  Image = 2,
}

const diet = ref<Array<string>>([]);
const language = ref<string>("English");
//const pastVisits = ref<Array<Date>>([]);
const specialRequests = ref<string>("");
const isSubmitting = ref<boolean>(false);
function addPatron() {
  members.value.push(["", "", ""]);
}

function deletePatron(idx: number) {
  members.value.splice(idx, 1);
}

function updatePatronName(idx: number, name: string) {
  console.log(name);
  members.value[idx][memberProfile.Name] = name;
  console.log(members);
}

function updatePatronBirthday(idx: number, birthday: string) {
  members.value[idx][memberProfile.Birthday] = birthday;
}

function updatePatronImage(idx: number, image: string) {
  members.value[idx][memberProfile.Image] = image;
}

async function addHousehold() {
  try {
    if (selectedOrg.value) {
      const body = { orgId: selectedOrg.value.id, patrons: members.value, diet: diet.value, lang: language.value, req: specialRequests.value };
      await fetchy(`/api/profile`, "POST", { body: body });
      emit("close");
    }
  } catch (error) {
    return;
  }
}
onBeforeMount(async () => {});
</script>

<template>
  <div v-if="props.show">
    <div class="container">
      <h1>Create New Household</h1>
      <div class="form">
        <div class="overview">
          <h3>Overview</h3>
          <div class="form-input">
            Language
            <select v-model="language">
              <option v-for="lang in LANGUAGES" :key="lang" :selected="language === lang" :value="lang">{{ lang }}</option>
            </select>
          </div>
          <div class="form-input">Diet <Multiselect class="multiselect" v-model="diet" mode="tags" :options="multiselectDietTags" :searchable="true" required /></div>
          <div class="special-request">Special Requests<textarea v-model="specialRequests"></textarea></div>
        </div>
        <div class="member-add">
          <div class="member-title">
            <h3>Members</h3>
            <button class="button-39" @click="addPatron">Add</button>
          </div>
          <div class="member" v-for="(item, idx) in members" :key="idx">
            <CreatePatronComponent
              :idx="idx"
              :submit="isSubmitting"
              :name="item[memberProfile.Name]"
              :birthday="item[memberProfile.Birthday]"
              :image="item[memberProfile.Image]"
              @delete="deletePatron"
              @updateName="updatePatronName"
              @updateBirthday="updatePatronBirthday"
              @updateImage="updatePatronImage"
            />
          </div>
        </div>
      </div>

      <div class="footer">
        <button class="button-39" @click="emit('close')">Cancel</button>
        <button class="button-39" @click="addHousehold">Submit</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
}
.overview {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: space-between;
  justify-content: space-between;
  margin-right: 2em;
}

.member-title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.special-request {
  display: flex;
  flex-direction: column;
}

.multiselect {
  margin-left: 1em;
  width: 16em;
  --ms-radius: 32px;
  --ms-ring-color: #eb721630;
  padding-left: 8px;
  --ms-py: 0;
  --ms-tag-bg: var(--primary);
}

.multiselect.is-open {
  --ms-radius: 16px;
}

input {
  padding-left: 0.5em;
  padding-left: 0.5em;
  margin-left: 1em;
  border-radius: 64px;
}

img {
  height: 125px;
  width: 125px;
  margin-right: 2.5em;
}
.form-input {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5em;
}

.form {
  width: 50%;
  height: 50%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

span {
  color: black;
}
</style>
