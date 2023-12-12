<script setup lang="ts">
import { defineProps, ref, watch } from "vue";

const searchId = ref<string>("");
const props = defineProps(["empty"]);
const emit = defineEmits(["search", "resetEmpty"]);

console.log(props);
watch(
  () => props.empty,
  (val) => {
    if (val === true) {
      searchId.value = "";
      emit("resetEmpty");
    }
  },
);
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="emit('search', searchId)">
    <fieldset>
      <div class="pure-control-group">
        <input v-model.trim="searchId" type="text" id="aligned-name" placeholder="Search by id or name" style="border-radius: 2em; width: 25em" />
        <button class="icon search">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" class="bi bi-search" viewBox="0 0 16 16">
            <path
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
            />
          </svg>
        </button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
.search {
  margin-left: -35px;
  margin-top: 5px;
}
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
.button-39 {
  margin: 10px;
  padding: 10px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding-right: 2em;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
</style>
