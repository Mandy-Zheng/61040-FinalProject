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
        insecurity in 2020. To address these challenges, we present Cornucopia, an app that helps streamline food pantry operations.
      </p>
    </div>
    <div class="subinfo">
      <p>Some features that Cornucopia offers are</p>
      <ul>
        <li>smart inventory tracking and algorithmic resource allocation</li>
        <li>individualized household management</li>
        <li>support for audio and text translational accommodation</li>
        <li>integrated volunteer scheduling services</li>
        <li>administrative organization management tools</li>
      </ul>
    </div>
    <div class="users">
      <h3>What are you waiting for?</h3>
      <p>If you are an organization administrator, create an account with Cornucopia, register your pantry, and get started!</p>
      <p>If you are looking to volunteer at an organization that uses Cornucopia, create an account and ask an admin to add you!</p>
    </div>
    <div class="about">
      <h3>About us</h3>
      <p>
        We are 3rd and 4th-year computer science undergraduates at MIT, currently taking Software Design (6.1040), tasked with creating an authentic app that addresses an important problem domain for
        our final project. We were initially inspired to create Cornucopia during an interview with Phoebe Heyman, the coordinator of the Margaret Fuller House Food Pantry; we saw many opportunities
        to digitize processes at these important organizations and hope that our app will provide a more efficient, streamlined, centralized, and accommodative experience for administrators,
        volunteers, and patrons.
      </p>
    </div>
    <footer>
      <small> Questions or feedback? Contact us at aaap at mit dot edu. </small>
    </footer>
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
  padding: 2em 2em 0 2em;
}

.subinfo {
  width: 35em;
  font-size: large;
  padding-left: 5em;
}

.users {
  width: 35em;
  font-size: x-large;
  padding-left: 2em;
  padding-top: 2em;
}

.about {
  width: 50em;
  font-size: medium;
  padding-left: 3em;
  padding-top: 2em;
}

footer {
  padding: 10px;
  padding-left: 3em;
  font-style: italic;
}

a {
  color: black;
  text-decoration: none;
}
</style>
