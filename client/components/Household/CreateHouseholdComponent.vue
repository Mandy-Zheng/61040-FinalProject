<script setup lang="ts">
import Multiselect from "@vueform/multiselect";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { LANGUAGES, capitalizePhrase } from "../../../server/framework/utils";
import { useOrganizationStore } from "../../stores/organization";
import { fetchy } from "../../utils/fetchy";
import CreatePatronComponent from "./CreatePatronComponent.vue";

const props = defineProps(["show", "allLanguages"]);
const emit = defineEmits(["close", "refreshHouseholds"]);

const { selectedOrg } = storeToRefs(useOrganizationStore());

const dietaryTags = ["Vegetarian", "Halal", "Gluten-Free", "Nut-Free", "Low-Sodium", "Seafood", "Dairy-Free", "Kosher"];

const multiselectDietTags = dietaryTags.map((tag) => {
  return { label: tag, value: tag };
});

const languageOptions = computed(() => [...new Set([...props.allLanguages, ...LANGUAGES])]);
console.log(languageOptions);
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
  members.value[idx][memberProfile.Name] = name;
}

function updatePatronBirthday(idx: number, birthday: string) {
  members.value[idx][memberProfile.Birthday] = birthday;
}

function updatePatronImage(idx: number, image: string) {
  members.value[idx][memberProfile.Image] = image;
}

function resetForm() {
  members.value = [["", "", ""]];
  emit("close");
}
async function addHousehold() {
  try {
    if (selectedOrg.value) {
      const body = { orgId: selectedOrg.value.id, patrons: members.value, diet: diet.value, lang: language.value ?? "", req: specialRequests.value };
      await fetchy(`/api/profile`, "POST", { body: body });

      emit("refreshHouseholds");
      resetForm();
    }
  } catch (error) {
    return;
  }
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
  <div v-if="props.show">
    <form>
      <div class="top">
        <h2>Create New Household</h2>
      </div>
      <div class="container">
        <div class="form">
          <div class="overview">
            <h3>Overview</h3>
            <div class="form-input">
              Language
              <Multiselect v-model="language" :createTag="true" :options="languageOptions" :searchable="true" @create="onCreate" />
            </div>
            <div class="form-input">Diet <Multiselect class="multiselect" v-model="diet" mode="tags" :options="multiselectDietTags" :searchable="true" /></div>
            <div class="special-request">Special Requests<textarea v-model="specialRequests"></textarea></div>
          </div>
          <div class="member-add">
            <div class="member-title">
              <h3>Members</h3>
              <div>
                <button class="icon" @click="addPatron">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
                  </svg>
                </button>
              </div>
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
          <div>
            <button class="button-39" @click="resetForm">Cancel</button>
          </div>
          <div>
            <button class="button-39" type="submit" @click="addHousehold">Submit</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
select {
  height: 35px;
  padding: 5px;
  border-color: rgb(188, 188, 188);
  border-radius: 5px;
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
  align-items: center;
}

.special-request {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  gap: 5px;
}

.multiselect {
  margin-left: 1em;
  width: 16em;
  --ms-ring-color: #eb721630;
  padding-left: 8px;
  --ms-py: 0;
  --ms-tag-bg: var(--primary);
  border-color: rgb(188, 188, 188);
}

img {
  height: 125px;
  width: 125px;
  margin-right: 2.5em;
}
.form-input {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5em;
  gap: 1em;
  align-items: center;
}
.form {
  width: 50%;
  height: 50%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 3em;
}

span {
  color: black;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

textarea {
  border-color: rgb(188, 188, 188);
  border-radius: 5px;
  height: 8.6em;
}

.top {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin-top: 3em;
}

.footer {
  width: 100%;
  gap: 1em;
  display: flex;
  justify-content: space-around;
}
</style>
