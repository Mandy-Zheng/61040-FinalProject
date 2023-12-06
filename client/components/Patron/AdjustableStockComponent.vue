<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount,ref } from "vue";
const props = defineProps(["household","stock"]);
const emit = defineEmits([""]);
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
function changeCount(count) {
    props.stock.allocation=count;
}
async function remove() {
    changeCount(0);
}

onBeforeMount(async () => {
  console.log(props.stock);
});
</script>

<template>
  <div v-if="props.stock" class="item-card">
    <img v-if="props.stock.image.length" :src="props.stock.image" />
    <img v-else src="../../assets/images/image.svg" />
    <div class="item">
      <div>
        <div class="row" style="align-items: center; gap: 20em">
          <h2>{{ props.stock.item }}</h2>
          <h3 v-if="props.stock.count <= 5" style="color: rgb(203, 1, 1)">Low in stock!</h3>
        </div>
        <div class="subtext">
          <p class="count">{{ props.stock.allocation }} Units</p>
          <p class="maxp">Max for household: {{ props.stock.maxPerPerson*household.members.length }}</p>
        </div>
        <div class="diet">
          <p class="diet-title">Dietary Restrictions:</p>
          <div class="row">
            <div v-for="tag in props.stock.diet" :key="tag">
              <p class="tag" v-bind:style="{ backgroundColor: tagColors.get(tag) }">{{ tag }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row" style="gap: 1em">
      <div class="link">
        <a :href="props.stock.supplyLink" v-if="props.stock.supplyLink"
          ><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" class="bi bi-cart-fill" viewBox="0 0 16 16">
            <path
              d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
            />
          </svg>
        </a>
      </div>
      <div>
        <button class="icon" @click.prevent="">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
            <path
              d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
            />
            <path
              fill-rule="evenodd"
              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
            />
          </svg>
        </button>
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
.subtext {
  display: flex;
  flex-direction: row;
}
.item {
  display: flex;
  flex-direction: row;
  height: max-content;
  width: 35em;
  justify-content: space-between;
}

.tag {
  border: 1px solid rgba(0, 0, 0, 0.296);
  font-size: smaller;
  padding: 5px;
  border-radius: 64px;
  width: fit-content;
}
.diet {
  padding: 0;
  padding-left: 0em;
  border-radius: 16px;
  height: 50%;
}
.diet-title {
  margin-bottom: 1em;
  margin-top: 1em;
}

h2 {
  margin-bottom: 1;
  font-weight: lighter;
}

.count {
  margin: 0;
}

.link {
  margin: 0;
  padding: 0;
}
.maxp {
  margin: 0;
  margin-left: 1em;
}

img {
  width: 200px;
  height: 200px;
  border-radius: 20px;
  border: 1px solid var(--primary);
  margin-right: 4em;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 0.5em;
  flex-wrap: wrap;
  row-gap: 0.5em;
  align-items: flex-start;
  align-content: flex-start;
}

p {
  margin: 0px;
}

a {
  margin: 0px;
  padding: 0;
  text-decoration: none;
}
</style>