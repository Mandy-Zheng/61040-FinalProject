<script setup lang="ts">
const props = defineProps(["stockId"]);
</script>

<template>
  <main>
    <p>Stock</p>
    <div>{{ props.stockId }}</div>
  </main>
</template>
