<template>
  <div class="center">
    <Logo />

    <input class="input" type="text" placeholder="name" />
    <input v-if="option === 'Join'" class="input" type="text" placeholder="link" />
    <RouterLink :to="`/chat-room/generated`" class="button">{{ option }} {{ name }}</RouterLink>
  </div>
</template>

<script setup lang="ts">
import "../styles/global.scss";
import Logo from "../components/Logo.vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();
const name = route.params.name === "group" ? "Group" : "Chat";
const option = route.params.option === "join" ? "Join" : "Create";
</script>

<style scoped lang="scss">
.input {
  margin: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e0e3e7;
  font-size: 1rem;

  &:focus {
    border: 1px solid #11468f;
    outline: none;
  }
}

.button {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-family: "Poppins", sans-serif;
  border: none;
  margin: 0.5rem;
  background-color: #11468f;
  color: white;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    transform: scale(1.02);
  }
}
</style>
