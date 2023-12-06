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
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(0.000000,25) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                  <path
                    d="M71 206 c-87 -48 -50 -186 49 -186 51 0 100 49 100 99 0 75 -83 124
-149 87z m59 -61 c0 -8 7 -15 15 -15 8 0 15 -4 15 -10 0 -5 -7 -10 -15 -10 -8
0 -15 -7 -15 -15 0 -8 -4 -15 -10 -15 -5 0 -10 7 -10 15 0 8 -7 15 -15 15 -8
0 -15 5 -15 10 0 6 7 10 15 10 8 0 15 7 15 15 0 8 5 15 10 15 6 0 10 -7 10
-15z"
                  />
                </g>
              </svg>
            </button>
          </p>
          <ul v-if="props.household.pastVisits.length > 0">
            <div v-for="visit in props.household.pastVisits" :key="visit">{{ formatDate(visit) }}</div>
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
}
</style>
