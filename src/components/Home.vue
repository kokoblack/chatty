<template>
  <div class="home-container">
    <div class="home-logo">
      <h1 >Chatty</h1>
      <v-icon name="ri-message-3-line" scale="1.3"/>

    </div>

    <div class="home-text_container">
      <RouterLink to="/private-chat" class="home-text">Private chat</RouterLink>
      <RouterLink to="/group-chat" class="home-text">Group chat</RouterLink>
      <RouterLink to="/ai-chat" class="home-text">Chat with AI</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import "../styles/home.scss";
import { RouterLink } from "vue-router";


</script>

<style scoped></style>
