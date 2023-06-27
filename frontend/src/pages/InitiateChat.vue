<template>
  <div
    class="center"
    v-if="
      (route.params.name === 'private' && route.params.option === 'create') ||
      (route.params.name === 'private' && route.params.option === 'join') ||
      (route.params.name === 'group' && route.params.option === 'create') ||
      (route.params.name === 'group' && route.params.option === 'join')
    "
  >
    <div v-show="showError" class="display-error">
      <ErrorMessage :message="userValidation" @close-error="closeError" />
    </div>
    <Logo />
    <input
      @focus="() => ((nameValidation = ''), (chatIDValidation = ''))"
      class="input"
      type="text"
      placeholder="name"
      v-model.trim="name"
    />
    <p class="error" v-show="nameValidation">{{ nameValidation }}</p>
    <input
      @focus="() => ((nameValidation = ''), (chatIDValidation = ''))"
      v-if="option === 'Join'"
      class="input"
      type="text"
      placeholder="link"
      v-model.trim="chatID"
    />
    <p class="error" v-show="chatIDValidation">{{ chatIDValidation }}</p>
    <button v-if="option !== 'Join'" class="button" @click="createChat">
      Create {{ routerName }}
    </button>
    <button v-if="option === 'Join'" class="button" @click="joinChat">
      Join {{ routerName }}
    </button>
  </div>
  <h1 v-else class="not_found">Page Not Found</h1>
</template>

<script setup lang="ts">
import "../styles/global.scss";
import Logo from "../components/Logo.vue";
import { useRoute, useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { useCounterStore } from "../stores/UserStore";
import { ref } from "vue";
import axios from "axios";
import ErrorMessage from "../components/ErrorMessage.vue";

const store = useCounterStore();
const { setName, setRoomID, setRouteOption, setRouteName, setId, setAdmin } =
  store;
const route = useRoute();
const navigate = useRouter();
const routeName = route.params.name === "private" ? "private" : "group";
const routeOption = route.params.option === "join" ? "join" : "create";
const routerName = route.params.name === "group" ? "Group" : "Chat";
const option = route.params.option === "join" ? "Join" : "Create";
const linkID = uuidv4();
const _id = uuidv4();
const showError = ref(false);
const chatID = ref("");
const name = ref("");
const userValidation = ref("");
const nameValidation = ref("");
const chatIDValidation = ref("");

console.log(route.params.name);

const closeError = (close: boolean) => {
  showError.value = close;
};

const joinChat = async () => {
  type User = { user: string[]; room: string };
  const users = ref<User>(null!);

  if (!name.value && !chatID.value) {
    nameValidation.value = "Please provide a name";
    chatIDValidation.value = "Please provide a chat ID";
  } else if (!chatID.value) {
    chatIDValidation.value = "Please provide a chat ID";
  } else if (!name.value) {
    nameValidation.value = "Please provide a name";
  } else {
    setName(name.value);
    setRouteName(routeName);
    setRouteOption(routeOption);
    setRoomID(chatID.value);
    setId(_id);
    setAdmin("no");

    await axios
      .get(`http://localhost:3000/rooms/${chatID.value}`)
      .then((res) => {
        users.value = res.data;
        console.log(res.data);
      })
      .catch((err) => console.log(err));

    if (users.value?.room === "private") {
      if (users.value?.user.length >= 2) {
        userValidation.value = `unable to join room, only two users are allowed.`;
        showError.value = true;
      } else {
        navigate.push(`/chat-room/${chatID.value}`);
      }
    } else if (users.value?.room !== route.params.name) {
      userValidation.value =
        "The room ID provided doesn't match this room. Please select the correct room.";
      showError.value = true;
    } else {
      navigate.push(`/chat-room/${chatID.value}`);
    }
  }
};

const createChat = async () => {
  if (name.value === "") {
    nameValidation.value = "Please provide a name";
  } else {
    setName(name.value);
    setRouteName(routeName);
    setRouteOption(routeOption);
    setRoomID(linkID);
    setId(_id);
    setAdmin("yes");

    await axios
      .post("http://localhost:3000/rooms", {
        _id: linkID,
        room: route.params.name,
        user: [],
        conversation: [],
      })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));

    navigate.push(`/chat-room/${linkID}`);
  }
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

.display-error {
  position: absolute;
  // top:
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
