<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { formatDate } from "@/utils/formatDate";
const props = defineProps(["household"]);
const emit = defineEmits(["refreshHousehold"]);

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

const addVisit = async () => {
  try {
    await fetchy(`/api/profile/visit/${props.household._id}`, "PATCH");
  } catch {
    return;
  }
  emit("refreshHousehold");
};
</script>

<template>
  <div v-if="household" class="item-card">
    <div class="item">
      <div>
        <h2>{{ household._id }}</h2>
        <div class="info">
          <p>Past visits: {{ household.pastVisits.length }}</p>
          <ul v-if="household.pastVisits.length > 0">
            <div v-for="visit in household.pastVisits" :key="visit">{{ formatDate(visit) }}</div>
          </ul>
          <!-- <button class="button-39" @click="addVisit">add visit</button> -->
        </div>
        <div class="info">
          <p class="diet-title">Dietary Restrictions:</p>
          <div class="row">
            <div v-for="tag in household.dietaryRestrictions" :key="tag">
              <p class="tag" v-bind:style="{ backgroundColor: tagColors.get(tag) }">{{ tag }}</p>
            </div>
          </div>
        </div>
        <div class="info">
          <p>Language: {{ household.preferredLanguage }}</p>
          <!-- TODO relevant audio -->
        </div>
        <div class="info" v-if="household.specialRequests">
          <p>Requests: {{ household.specialRequests }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modify {
  display: flex;
  height: fit-content;
}
.item-card {
  display: flex;
  flex-direction: row;
  padding: 1em;
}

.item {
  display: flex;
  flex-direction: row;
  height: max-content;
  width: 45em;
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
}
</style>
