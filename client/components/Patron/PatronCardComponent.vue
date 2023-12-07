<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["patron", "householdId"]);
const emit = defineEmits(["update", "delete"]);
const today = new Date().toISOString().split("T")[0];

const isEditing = ref<boolean>(false);
const name = ref<string>(props.patron.name);
const img = ref<string>(props.patron.image);
const birthday = ref<any>(props.patron.birthday);

async function updatePatrons() {
  const body = { household: props.householdId, patron: props.patron._id, update: { name: name.value, birthday: birthday.value, image: img.value } };
  await fetchy(`/api/profile/updatePatron`, "PATCH", { body: body });
  isEditing.value = false;
  emit("update", props.patron._id);
}
</script>

<template>
  <main>
    <div v-if="patron">
      <div class="column" v-if="isEditing">
        <h3 class="name">Name: <input v-model="name" /></h3>
        <h3 class="name">Image Link: <input v-model="img" /></h3>
        <div class="content">Date of Birth: <input type="date" :max="today" v-model="birthday" /></div>
        <button class="button-39" @click.prevent="updatePatrons">Save Changes</button>
      </div>
      <div class="row" v-else>
        <article>
          <img v-if="!patron.image.length" class="circle" src="../../assets/images/image.svg" width="60" />
          <img v-else :src="patron.image" width="60" height="60" class="circle" />
          <div class="column">
            <h3 class="name">{{ patron.name }}</h3>
            <div class="content">Date of Birth: {{ patron.birthday }}</div>
          </div>
        </article>
        <button class="button-39" @click.prevent="isEditing = true">Update Members</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.row {
  display: flex;
}
.button-39 {
  margin: 10px;
  padding: 10px;
}

.name {
  color: rgb(79, 78, 78);
}

.content {
  color: rgb(117, 117, 117);
  font-weight: 300;
}

h3 {
  margin: 0;
}

article {
  background-color: white;
  border: solid;
  border-color: rgb(214, 214, 214);
  border-radius: 1em;
  display: flex;
  flex-direction: row;
  padding: 1.5em 1.5em;
  font-weight: 400;
  font-size: small;
  gap: 2.5em;
  width: 20em;
  overflow: scroll;
}

.column {
  align-items: flex-start;
}

.circle {
  border-radius: 10em;
}
</style>
