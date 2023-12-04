<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import DeleteStockModal from "./DeleteStockModal.vue";

const props = defineProps(["stockId"]);
const item = ref<any>(undefined);
const emit = defineEmits(["refreshStocks"]);
const showDeleteModal = ref<boolean>(false);

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
</style>
