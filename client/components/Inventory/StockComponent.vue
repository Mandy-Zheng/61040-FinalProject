<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["stockId"]);
const item = ref<any>(undefined);
async function getItem() {
  try {
    console.log("id", props.stockId);
    item.value = await fetchy(`/api/inventory/stocks/${props.stockId}`, "GET");
    console.log(item.value);
  } catch (error) {
    return;
  }
}
onBeforeMount(async () => {
  await getItem();
});
</script>

<template>
  <div v-if="item" class="item-card">
    <div class="item">
      <div class="item-img"><img :src="item.image" /></div>
      <div>
        <h2>{{ item.item }}</h2>
        <div class="subtext">
          <p class="count">{{ item.count }} in stock</p>
          <p class="maxp">max per person: {{ item.maxPerPerson }}</p>
        </div>

        <br />
        <div class="diet">
          <p class="diet-title">Dietary Restriction Tags:</p>
          <div v-for="tag in item.diet" :key="tag">
            <p class="tag">{{ tag }}</p>
            <p></p>
          </div>
        </div>
        <div v-if="item.supplyLink">Purchase Link: {{ item.supplyLink }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-card {
  display: flex;
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
}

.tag {
  border: 1px solid black;
  font-size: smaller;
  padding: 4px;
  border-radius: 64px;
  width: fit-content;
}
.diet {
  padding: 0;
  padding-left: 0em;
  border-radius: 16px;
  height: 100%;
}
.diet-title {
  margin-bottom: 0;
}

h2 {
  margin: 0;
  font-weight: lighter;
}

.count {
  margin: 0;
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
.item-img {
}
</style>
