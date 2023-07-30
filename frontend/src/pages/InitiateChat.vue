<template>
  <div
    class="center"
    v-if="
      (rName === 'private' && rOption === 'create' && !id) ||
      (rName === 'private' && rOption === 'join') ||
      (rName === 'group' && rOption === 'create' && !id) ||
      (rName === 'group' && rOption === 'join')
    "
  >
    <div v-show="showError" class="display-error">
      <ErrorMessage :message="userValidation" @close-error="closeError" />
    </div>
    <div v-show="loading" class="loading">
      <p v-show="rOption === 'create'">Initializing room</p>
      <p v-show="rOption === 'join'">Joining room</p>
      <Loading />
    </div>
    <Error v-show="errorMessage" :message="errorMessage" />
    <Logo />
    <Back />
    <input
      ref="inputRef"
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
      placeholder="room ID"
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
import Back from "../components/Back.vue";
import "../styles/global.scss";
import Logo from "../components/Logo.vue";
import { useRoute, useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { useCounterStore } from "../stores/UserStore";
import { ref, onMounted } from "vue";
import axios from "axios";
import ErrorMessage from "../components/ErrorMessage.vue";
import Error from "../components/Error.vue";
import Loading from "../components/Loading.vue";

// axios.defaults.withCredentials = true;

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
const inputRef = ref<HTMLInputElement>();
const userValidation = ref("");
const nameValidation = ref("");
const chatIDValidation = ref("");
const errorMessage = ref("");
const loading = ref(false);
const id = ref(route.params.id);
const rName = ref(route.params.name);
const rOption = ref(route.params.option);

if (route.params.id) {
  chatID.value = route.params.id as string;
}

console.log(id.value);
console.log(rName.value);
console.log(rOption.value);

const closeError = (close: boolean) => {
  showError.value = close;
};

const joinChat = async () => {

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

    loading.value = true;

    await axios
      .get(`https://chatty-api-service.onrender.com/rooms/${chatID.value}`, {
        timeout: 10000
      })
      .then((res) => {
        // users.value = res.data;

        loading.value = false;

        if (res.data) {
          if (route.params.name === "private") {
            if (res.data?.room !== route.params.name) {
              userValidation.value =
                "The room ID provided doesn't match this room. Please select the correct room.";
              showError.value = true;
            } else if (res.data?.user.length >= 2) {
              userValidation.value = `unable to join room, only two users are allowed.`;
              showError.value = true;
            } else {
              navigate.push(`/chat-room/${chatID.value}`);
            }
          } else if (res.data?.room !== route.params.name) {
            userValidation.value =
              "The room ID provided doesn't match this room. Please select the correct room.";
            showError.value = true;
          } else if (res.data?.room === route.params.name) {
            navigate.push(`/chat-room/${chatID.value}`);
          }
        } else {
          userValidation.value =
            "This room does not exist. Please create a new room";
          showError.value = true;
        }

        console.log(res);
      })
      .catch((err) => {
        loading.value = false;

        errorMessage.value = "something went wrong. Please try again";

        console.log(errorMessage.value);

        setTimeout(() => {
          errorMessage.value = "";
        }, 3000);
        console.log(err);
      });
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

    loading.value = true;

    await axios
      .post(
        "https://chatty-api-service.onrender.com/rooms",
        {
          _id: linkID,
          room: route.params.name,
          user: [],
          conversation: [],
        },
        { timeout: 10000 }
      )
      .then((res) => {
        console.log(res.data);
        loading.value = false;
        navigate.push(`/chat-room/${linkID}`);
      })
      .catch((err) => {
        loading.value = false;

        errorMessage.value = "something went wrong. Please try again";

        console.log(errorMessage.value);

        setTimeout(() => {
          errorMessage.value = "";
        }, 3000);
        console.log(err);
      });
  }
};

onMounted(() => {
  inputRef.value?.focus();
});
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

.loading {
  background-color: rgba(255, 255, 255, 0.3);
  height: 100vh;
  width: 100vw;
  max-width: 992px;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  backdrop-filter: blur(4px) brightness(50%);
  z-index: 10;

  & p {
    margin: 0;
    font-size: 1.2rem;
    color: #041562;
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
