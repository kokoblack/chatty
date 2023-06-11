<template>
  <div class="center">
    <Logo />
    <input
      @focus="() => (nameValidation = '')"
      class="input"
      type="text"
      placeholder="name"
      v-model="name"
    />
    <p class="error" v-show="nameValidation">{{ nameValidation }}</p>
    <input
      v-if="option === 'Join'"
      class="input"
      type="text"
      placeholder="link"
      v-model="chatID"
    />
    <button class="button" @click="user">{{ option }} {{ routerName }}</button>
  </div>
</template>

<script setup lang="ts">
import "../styles/global.scss";
import Logo from "../components/Logo.vue";
import { useRoute, useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { useCounterStore } from "../stores/UserStore";
// import axios from "axios";
import { ref } from "vue";

const store = useCounterStore();
const { setName, setRoomID, setChatID, setRouteOption, setRouteName } = store;
const route = useRoute();
const navigate = useRouter();
const routerName = route.params.name === "group" ? "Group" : "Chat";
const option = route.params.option === "join" ? "Join" : "Create";
const linkID = uuidv4();
const chatID = ref("");
const linkName = option === 'Join' ? chatID : linkID
const name = ref("");
const nameValidation = ref("");

const user = () => {
  // if (name.value === "") {
  //   nameValidation.value = "Please provide a name";
  // } else {
  //   axios
  //     .post("http://localhost:3000/users", {
  //       name: name.value,
  //       ID: "",
  //       linkID: linkID,
  //       roomID: "",
  //     })
  //     .then((res) => {
  //       console.log(res);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  setName(name.value);
  setRoomID(linkID);
  setChatID(chatID.value);
  setRouteName(routerName);
  setRouteOption(option);
  navigate.push(`/chat-room/${linkName}`);
  // }
};
</script>

<style scoped lang="scss">
.input {
  margin: 0.5rem;
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #e0e3e7;
  font-size: 1rem;

  &:focus {
    border: 1px solid #11468f;
    outline: none;
  }
}

.error {
  color: red;
  font-size: 0.8rem;
  margin: 0.1rem;
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
