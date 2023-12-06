<script setup lang="ts">
import { formatDate } from "@/utils/formatDate";

const props = defineProps(["household"]);
const emit = defineEmits(["refreshVisits"]);

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
        <div class="info">
          <p class="diet-title">Dietary Restrictions:</p>
          <div class="row">
            <div v-for="tag in props.household.dietaryRestrictions" :key="tag">
              <p class="tag" v-bind:style="{ backgroundColor: tagColors.get(tag) }">{{ tag }}</p>
            </div>
          </div>
        </div>
        <div class="info">
          <p>Language: {{ props.household.preferredLanguage }}</p>
          <!-- TODO relevant audio -->
        </div>
        <div class="info" v-if="household.specialRequests">
          <p>Requests: {{ props.household.specialRequests }}</p>
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
  padding: 0em;
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
