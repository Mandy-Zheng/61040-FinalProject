<script setup lang="ts">
import Multiselect from "@vueform/multiselect";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["show", "stock"]);
const emit = defineEmits(["close", "update"]);
const dietaryTags = ["Vegetarian", "Halal", "Gluten-Free", "Nut-Free", "Low-Sodium", "Seafood", "Dairy-Free", "Kosher"];
const multiselectDietTags = dietaryTags.map((tag) => {
  return { label: tag, value: tag };
});

const name = ref<string>("");
const imgLink = ref<string>("");
const units = ref<number>(0);
const purchaseLink = ref<string>("");
const diet = ref<Array<string>>([]);
const maxPerPerson = ref<number>(0);

onBeforeMount(async () => {
  name.value = props.stock.item;
  imgLink.value = props.stock.image;
  units.value = props.stock.count;
  purchaseLink.value = props.stock.supplyLink;
  diet.value = props.stock.diet;
  maxPerPerson.value = props.stock.maxPerPerson;
});
//test link https://drive.google.com/uc?export=view&id=1K3GKKH13ZdvlpePlfIx62OFRsfjMxwoE
</script>

<template>
  <transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-container">
        <h1>Update Inventory</h1>
        <div class="form">
          <img v-if="!imgLink.length" src="../../assets/images/image.svg" />
          <img v-else :src="imgLink" alt="Having Trouble uploading item picture" />
          <div class="item">
            <div class="form-input">Name<input style="color: black" v-model="name" required /></div>
            <div class="form-input">
              Diet
              <div><Multiselect class="multiselect" v-model="diet" mode="tags" :options="multiselectDietTags" :searchable="true" /></div>
            </div>
            <div class="form-input">Image Link<input v-model="imgLink" /></div>
            <div class="form-input">Purchase Link<input v-model="purchaseLink" /></div>
            <div class="form-input">
              Units <input class="number-input" type="number" v-model="units" min="0" /> Max Per Person <input class="number-input" type="number" v-model="maxPerPerson" min="0" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button-39" @click="emit('close')">Cancel</button>
          <button class="button-39" @click="emit('update', name, imgLink, purchaseLink, units, diet, maxPerPerson)">Update</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.item {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: space-between;
  justify-content: space-between;
}

.multiselect {
  --ms-radius: 32px;
  --ms-ring-color: #eb721630;
  padding-left: 8px;
  --ms-py: 0;
  --ms-tag-bg: var(--primary);
  width: 20.75em;
}

.multiselect.is-open {
  --ms-radius: 16px;
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
  gap: 1em;
  align-items: center;
}

.form {
  height: 50%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: fit-content;
  height: fit-content;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

span {
  color: black;
}
</style>