<template>
    <RouterLink to="/" class="home-logo">
      <h1>Chatty</h1>
      <v-icon name="ri-message-3-line" scale="1.3"/>

    </RouterLink>
</template>

<script setup lang="ts">
import {RouterLink} from "vue-router"
</script>

<style scoped>
.home-logo {
    font-family: "Poppins", sans-serif;
    font-size: .7rem;
    text-align: left;
    color: #041562;
    position: absolute;
    top: 1%;
    left: 1%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
    text-decoration: none;
}
</style>