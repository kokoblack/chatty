<template>
  <div
    class="center"
    v-if="route.params.name === 'private' || route.params.name === 'group'"
  >
    <Logo />
    <Back />

    <div>
      <RouterLink :to="`/chat/${name}/create`" class="shadow-text"
        >Create a {{ option }}</RouterLink
      >
      <RouterLink :to="`/chat/${name}/join`" class="shadow-text"
        >Join a {{ option }}</RouterLink
      >
    </div>
  </div>
  <h1 v-else class="not_found">Page Not Found</h1>
</template>

<script setup lang="ts">
import Back from "../components/Back.vue"
import "../styles/global.scss";
import Logo from "../components/Logo.vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();
const name = route.params.name;
const option = route.params.name === "private" ? "chat" : "group";
</script>

<style scoped></style>
