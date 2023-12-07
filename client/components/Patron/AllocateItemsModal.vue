<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import AdjustableStockComponent from "./AdjustableStockComponent.vue";

const props = defineProps(["show", "household", "allocation"]);
const emit = defineEmits(["close", "refreshHouseholds"]);

async function allocateItems() {
  try {
    await fetchy(`/api/profile/visit/${props.household._id}`, "PATCH");
    await Promise.all(props.allocation.map(async (stock: Record<string, any>) => await fetchy(`/api/inventories/allocate/${stock._id}`, "PATCH", { body: { update: { count: stock.allocation } } })));
  } catch {
    return;
  }
  emit("close");
  emit("refreshHouseholds");
}
</script>

<template>
  <transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-container">
        <div class="modal-header">Allocate the following items</div>
        This action will automatically update the inventory. Are you sure?
        <article v-for="stock in props.allocation" :key="stock">
          <AdjustableStockComponent :household="household" :stock="stock" />
        </article>
        <div class="modal-footer">
          <button class="button-39" @click="emit('close')">Close</button>
          <button class="button-39" style="background-color: var(--primary); border: none; color: white" @click="allocateItems(), emit('refreshHouseholds')">Allocate</button>
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
  width: 50%;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  height: 40em;
  overflow: scroll;
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
</style>
