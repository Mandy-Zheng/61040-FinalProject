<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { computed } from "vue";
import AdjustableStockComponent from "./AdjustableStockComponent.vue";

const props = defineProps(["show", "household", "allocation"]);
const emit = defineEmits(["close", "refreshHouseholds"]);

const newAllocations = computed(()=>{
  const help=new Array<number>;
  props.allocation.map((stock:any,_)=>{
    help.push(stock.allocation);
  });
  return help;
});
async function allocateItems() {
  try {
    await fetchy(`/api/profile/visit/${props.household._id}`, "PATCH");
    await Promise.all(
      props.allocation.map(async (stock: any, idx) => {
        const body = { id: stock._id, update: { count: stock.count - newAllocations.value[idx] } };
        return fetchy(`/api/inventories/allocate`, "PATCH", { body: body });
      }),
    );
  } catch {
    return;
  }
  emit("close");
  emit("refreshHouseholds");
}

function update(idx: number, amount: number) {
  newAllocations.value[idx] = Number(amount);
}
</script>

<template>
  <transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-container">
        <div class="modal-header"><h2>Allocate the following items</h2></div>
        This action will automatically update the inventory. Are you sure?
        <div class="row stocks">
          <article v-for="(stock, idx) in props.allocation" :key="stock" style="width: 25em">
            <AdjustableStockComponent :household="household" :stock="stock" :idx="idx" @updateAllocation="update" />
          </article>
        </div>

        <div class="modal-footer">
          <button class="button-39" @click="emit('close')">Cancel</button>
          <button class="button-39" style="background-color: var(--primary); border: none; color: white" @click="allocateItems">Allocate</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
img {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 0;
  top: 0;
}
.modal-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1em;
}

.edit-btn {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
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
  max-height: 90%;
  width: 82em;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  height: 40em;
}

.modal-header {
  margin-top: 0;
  color: var(--primary);
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

span {
  color: black;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 0.5em 1.5em;
  flex-wrap: wrap;
  overflow-wrap: normal;
  width: 85em;
}
.stocks {
  max-height: 75%;
  overflow: scroll;
}
</style>
