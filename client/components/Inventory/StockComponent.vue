<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import DeleteStockModal from "./DeleteStockModal.vue";

const props = defineProps(["stockId"]);
const item = ref<any>(undefined);
const emit = defineEmits(["refreshStocks"]);
const showDeleteModal = ref<boolean>(false);

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

async function getItem() {
  try {
    item.value = await fetchy(`/api/inventory/stocks/${props.stockId}`, "GET");
  } catch (error) {
    return;
  }
}

const deleteStock = async () => {
  try {
    await fetchy(`/api/inventory/${props.stockId}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshStocks");
};

onBeforeMount(async () => {
  await getItem();
});
</script>

<template>
  <div v-if="item" class="item-card">
    <img :src="item.image" />
    <div class="item">
      <div>
        <h2>{{ item.item }}</h2>
        <div class="subtext">
          <p class="count">{{ item.count }} Units</p>
          <p class="maxp">Max per person: {{ item.maxPerPerson }}</p>
        </div>
        <div class="diet">
          <p class="diet-title">Dietary Restrictions:</p>
          <div class="row">
            <div v-for="tag in item.diet" :key="tag">
              <p class="tag" v-bind:style="{ backgroundColor: tagColors.get(tag) }">{{ tag }}</p>
            </div>
          </div>
        </div>
        <div v-if="item.supplyLink">Purchase Link: {{ item.supplyLink }}</div>
      </div>
      <div class="modify">
        <button class="button-39 red" @click.prevent="showDeleteModal = true">Delete</button>
      </div>
      <teleport to="body">
        <DeleteStockModal :show="showDeleteModal" :stock="item" @close="showDeleteModal = false" @delete="deleteStock(), (showDeleteModal = false)" />
      </teleport>
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
.diet {
  padding: 0;
  padding-left: 0em;
  border-radius: 16px;
  height: 100%;
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
}

p {
  margin: 0px;
}
</style>
