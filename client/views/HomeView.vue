<script setup lang="ts"></script>

<template>
  <main>
    <div class="cover">
      <div class="background">
        <img src="../assets/images/vegetables.png" />
      </div>
      <h1 class="title">Cornucopia</h1>
      <button class="button-39">
        <a href="#info">Learn More</a>
      </button>
    </div>
    <div class="info" id="info">
      <p>
        Food insecurity affects the well-being of individuals and communities and it's especially prominent since the pandemic, with over 40 million adults and children in the US facing food
        insecurity in 2020. To address these challenges we present Cornucopia, an app that helps streamline food pantry operations.
      </p>
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
img {
  height: auto;
  width: 100%;
}
.background {
  display: flex;
  justify-content: center;
  height: 32em;
}

.title {
  position: absolute;
  top: 30%;
  left: 30%;
  transform: translate(-50%, -50%);
  color: #fff;
  padding: 10px 20px;
  font-size: 150px;
  font-weight: 400;
  text-align: flex-start;
  font-family: "Gowun Batang", serif;
}

.button-39 {
  position: absolute;
  top: 60%;
  left: 12%;
  transform: translate(-50%, -50%);
  font-size: x-large;
  padding: 15px;
  font-weight: 400;
}

.cover {
  text-align: flex-start;
  display: block;
}

.info {
  display: flex;
  justify-content: flex-start;
  width: 35em;
  font-size: x-large;
  padding: 2em;
}

a {
  color: black;
  text-decoration: none;
}
</style>
