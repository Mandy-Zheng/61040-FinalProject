<script setup lang="ts"></script>

<template>
  <main>
    <div class="cover">
      <div class="background"></div>
      <h1 class="title">Cornucopia</h1>
      <div class="float-button">
        <button class="button-39">
          <a href="#info">Learn More</a>
        </button>
      </div>
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
  text-align: left;
  display: flex;
  float: left;
  width: 100%;
  padding-left: 60px;
  padding-top: 150px;
  margin: 5px;
}

/* .background {
  background: url(../assets/images/vegetables.png) no-repeat center fixed;
  background-size: cover;
  height: 32em;
  width: 100%;
} */

.title {
  color: #fff;
  font-family: "Gowun Batang", serif;
  font-size: 150px;
  font-weight: 400;
}

.button-39 {
  font-size: x-large;
  padding: 15px;
  font-weight: 400;
}

.cover {
  background-image: url("../assets/images/vegetables.png");
  background-size: cover;
  display: block;
  height: 32em;
  width: 100%;
}
.float-button {
  float: left top;
  padding-left: 70px;
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
