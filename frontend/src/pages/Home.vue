<template>
  <div class="center">
    <Logo />

    <div class="home-text_container">
      <RouterLink to="/chat/private" class="shadow-text"
        >Private chat</RouterLink
      >
      <RouterLink to="/chat/group" class="shadow-text">Group chat</RouterLink>
      <RouterLink to="/ai-chat" class="shadow-text">Chat with AI</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import "../styles/global.scss";
import { RouterLink } from "vue-router";
import Logo from "../components/Logo.vue";
</script>

<style scoped></style>
