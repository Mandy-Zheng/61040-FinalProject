<script setup lang="ts">
import { computed } from "vue";
import { TAG_COLORS } from "../../../server/framework/utils";
const props = defineProps(["household", "stock"]);
const emit = defineEmits([""]);
const diet = computed(() => props.stock.diet);
</script>

<template>
  <div v-if="props.stock" class="item-card">
    <img v-if="props.stock.image.length" :src="props.stock.image" />
    <img v-else src="../../assets/images/image.svg" />
    <div class="item">
      <div class="row" style="align-items: center; gap: 5em">
        <div>
          <div class="row" style="align-items: center; gap: 20em">
            <h2>{{ props.stock.item }}</h2>
            <h3 v-if="props.stock.count <= 5" style="color: rgb(203, 1, 1)">Low in stock!</h3>
          </div>
          <div class="subtext">
            <p class="maxp">Max for household: {{ props.stock.maxPerPerson * household.members.length }}</p>
            <p class="maxp">Max per Day: {{ props.stock.maxPerDay }}</p>
          </div>
          <div class="diet">
            <p class="diet-title">Dietary Restrictions:</p>
            <div class="row">
              <div v-for="(tag, idx) in diet" :key="tag">
                <p class="tag" v-bind:style="{ backgroundColor: TAG_COLORS[idx % TAG_COLORS.length] }">{{ tag }}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4>Units:</h4>
          <input class="number-input" type="number" v-model="props.stock.allocation" min="0" :max="props.stock.maxPerPerson * household.members.length" />
        </div>
      </div>
    </div>
    <div></div>
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

.form {
  height: fit-content;
  margin-bottom: 1.5em;
}

input {
  padding-left: 0.5em;
  padding-left: 0.5em;
  margin-left: 1em;
  border-radius: 64px;
  border: solid;
  border-color: rgb(216, 216, 216);
  border-width: 1px;
  height: 25px;
  color: black;
  width: 20em;
}

.number-input {
  border-radius: 4px;
  width: 4em;
  font-size: larger;
  text-align: center;
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
  margin-left: 0em;
  padding-right: 1em;
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
