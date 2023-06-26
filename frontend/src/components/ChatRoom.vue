<template>
  <div class="chat_room-container">
    <div class="chat_room-header">
      <p v-show="session.routeName === 'private'">{{ privateStatus }}</p>
      <p v-show="session.routeName === 'group'">{{ groupStatus }}</p>
      <v-icon
        @click="menu = !menu"
        class="icon"
        name="bi-three-dots-vertical"
        scale="1.2"
      ></v-icon>
    </div>
    <div @click="menu = false" class="chat_room-body">
      <input type="file" @change="file" />
      <p>{{ connect }}</p>
      <p v-for="msg in messages" class="style1">{{ msg.message }}</p>
      <!-- <p v-for="msg in messages" :class="msg.style">{{ msg.name }}</p> -->
    </div>
    <div class="chat_room-footer">
      <v-icon
        @click="emojiMenu = !emojiMenu"
        :class="emojiMenu && 'emoji-color'"
        class="margin"
        name="bi-emoji-smile"
        scale="1.1"
      ></v-icon>
      <v-icon class="margin" name="bi-image-fill"></v-icon>
      <textarea
        v-model="text"
        class="margin"
        :class="height === '103px' ? 'scrollbar' : 'no-scrollbar'"
        placeholder="Type a message"
        ref="refs"
        @input="resize()"
      ></textarea>
      <!-- <input class="margin" type="text" placeholder="Type a message" /> -->
      <v-icon
        @click="newMsg"
        class="send margin"
        name="io-send-sharp"
        scale="1.1"
      ></v-icon>
    </div>

    <div v-if="menu" class="menu">
      <p @click="copyText2" class="cursor-pointer">Copy chat ID</p>
      <p @click="navigate.push('/')" class="cursor-pointer">Close Chat</p>
    </div>

    <VuemojiPicker
      :is-dark="false"
      v-if="emojiMenu"
      @emojiClick="handleEmojiClick"
      class="emoji"
      :picker-style="
        screenWidth < 360 ? emojiStyle : { width: '100%', height: '16rem' }
      "
    />

    <div class="chat_room-id" v-if="chatIDMenu">
      <div class="copy_box">
        <p>{{ checkCopied }}</p>
        <v-icon
          @click="chatIDMenu = false"
          class="cursor-pointer"
          name="io-close-outline"
          scale="1"
        ></v-icon>
      </div>
      <div class="id_box">
        <p>{{ session.roomID }}</p>
        <v-icon
          @click="copyText"
          class="cursor-pointer"
          name="io-copy-outline"
          scale="1"
        ></v-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import io from "socket.io-client";
import { ref, onMounted, onUnmounted } from "vue";
import { useCounterStore } from "../stores/UserStore";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { VuemojiPicker, EmojiClickEventDetail } from "vuemoji-picker";
import axios from "axios";

type Message = {
  name: string;
  message: string;
}[];

const store = useCounterStore();
const { name, routeOption, roomID, id, admin, routeName } = storeToRefs(store);
const messages = ref<Message>([]);
const connect = ref("");
const users = ref<string[]>([]);
const privateStatus = ref("Waiting for other user");
const groupStatus = ref("Waiting for other users");
const refs = ref();
const menu = ref(false);
const chatIDMenu = ref(false);
const checkCopied = ref("Copy chat ID");
const emojiMenu = ref(false);
const height = ref("");
const text = ref("");
const screenWidth = ref(window.innerWidth);
const navigate = useRouter();
const route = useRoute();
// const style = routeOption.value === "Join" ? "style1" : "style2";
const ID = route.params.room;
const session = ref({
  name: name.value,
  routeOption: routeOption.value,
  roomID: roomID.value,
  id: id.value,
  admin: admin.value,
  routeName: routeName.value,
});

if (!name.value && !sessionStorage.getItem("store")) {
  navigate.push("/");
}

if (!name.value) {
  const storage = JSON.parse(sessionStorage.getItem("store")!);
  session.value = storage;
} else {
  sessionStorage.setItem("store", JSON.stringify(session.value));
}

session.value?.routeOption === "create"
  ? (chatIDMenu.value = true)
  : (chatIDMenu.value = false);

const handleResize = () => {
  screenWidth.value = window.innerWidth;
};

const file = (e: Event) => {
  console.log((<HTMLInputElement>e.target).files);
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const handleEmojiClick = (details: EmojiClickEventDetail) => {
  text.value += details.unicode;
};

const copyText = () => {
  navigator.clipboard.writeText(session.value.roomID);
  checkCopied.value = "Copied!";
};

const copyText2 = () => {
  navigator.clipboard.writeText(session.value.roomID);
  menu.value = false;
};

axios
  .get(`http://localhost:3000/rooms/conversation/${ID}`)
  .then((res) => (messages.value = res.data.conversation))
  .catch((err) => console.log(err));

const socket = io("http://localhost:3000");

socket.emit("new user", {
  name: session.value?.name,
  id: session.value?.id,
  admin: session.value?.admin,
  roomID: session.value?.roomID,
}, ID);
socket.on("user connected", (newUser, admin, notAdmin) => {
  privateStatus.value = `${newUser} online`;
  connect.value = newUser;
  console.log(admin);
  console.log(notAdmin);
});
socket.on("users", (user, admin, notAdmin) => {
  users.value = user;
    if (users.value.length === 2) {
      groupStatus.value = `${users.value[0]}, ${users.value[1]} connected`;
    } else if (users.value.length === 3) {
      groupStatus.value = `${users.value[0]}, ${users.value[1]}, ${users.value[2]} connected`;
    } else if (users.value.length > 3) {
      groupStatus.value = `${users.value[0]}, ${users.value[1]}, ${
        users.value[2]
      } and ${users.value.length - 3} connected`;
    }

  if (session.value.routeOption === "join") {
    if (admin.length) {
      privateStatus.value = `${admin[0].name} online`;
    }
  } else {
    if (notAdmin.length) {
      privateStatus.value = `${notAdmin[0].name} online`;
    }
  }

  console.log(user);
});
socket.emit("join-room", ID);
socket.on("chat message", (msg) => messages.value.push(msg));
socket.on("offline", (user, offlineUsers) => {
  privateStatus.value = `${user[0]?.name} offline`;

  const offline = offlineUsers.map((eve: any) => eve.name);
  users.value = offline;

  if (users.value.length === 1) {
    groupStatus.value = `Waiting for other users`;
  } else if (users.value.length === 2) {
    groupStatus.value = `${users.value[0]}, ${users.value[1]} connected`;
  } else if (users.value.length === 3) {
    groupStatus.value = `${users.value[0]}, ${users.value[1]}, ${users.value[2]} connected`;
  } else if (users.value.length > 3) {
    groupStatus.value = `${users.value[0]}, ${users.value[1]}, ${
      users.value[2]
    } and ${users.value.length - 3} connected`;
  }
});

const newMsg = (e: Event) => {
  e.preventDefault();
  if (text.value) {
    messages.value.push({ name: session.value?.name, message: text.value });
    socket.emit(
      "chat message",
      { name: session.value?.name, message: text.value },
      ID
    );

    axios.patch(`http://localhost:3000/rooms/conversation/${ID}`, {
      name: session.value?.name,
      message: text.value,
    });

    text.value = "";
  }
};

const emojiStyle = {
  width: "100%",
  categoryEmojiSize: "1.2rem",
  categoryEmojiPadding: ".2rem",
  numColumns: "6",
  indicatorHeight: "2px",
  height: "17rem",
};

const resize = () => {
  refs.value.style.height = "35px";
  refs.value.style.height = refs.value.scrollHeight + "px";
  refs.value.style.maxHeight = "79px";
  height.value = refs.value.scrollHeight + "px";
};
</script>

<style scoped lang="scss">
.chat_room-container {
  display: block;
  min-height: 100vh;
  position: relative;
  box-sizing: border-box;
  .chat_room-header {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #041562;
    color: white;
    width: 100%;
    position: sticky;
    top: 0;
    padding: 1rem;
    box-sizing: border-box;

    p {
      font-size: 1.2rem;
      margin: 0 auto 0 0;
    }

    .icon {
      margin: 0;
    }
  }

  .chat_room-body {
    padding: 0 0 5rem 0;
    width: 100%;
    box-sizing: border-box;
    .style1 {
      margin: 0.2rem;
      background-color: #dedfe0;
      color: #19191a;
      padding: 0.5rem;
      border-radius: 6px;
      width: fit-content;
      max-width: 70%;
      margin-right: auto;
      box-sizing: border-box;
      word-break: break-all;
    }

    .style2 {
      margin: 0.2rem;
      background-color: #041562;
      color: white;
      padding: 0.5rem;
      border-radius: 6px;
      width: fit-content;
      max-width: 70%;
      margin-left: auto;
      box-sizing: border-box;
      word-break: break-all;
    }
  }

  .chat_room-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    color: #333436;
    width: 100%;
    position: fixed;
    bottom: 0;
    padding: 0.7rem;
    max-width: 992px;
    box-sizing: border-box;
    border-top: 1px solid #e0e3e7;

    .emoji-color {
      color: #071d7c;
    }

    textarea {
      padding: 0.4rem 0.3rem 0 0.3rem;
      border-radius: 6px;
      border: none;
      font-size: 1rem;
      height: 35px;
      width: 90%;
      border: 1px solid #e0e3e7;
      resize: none;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;

      &:focus {
        outline: none;
      }

      &::placeholder {
        font-family: "DM Sans", sans-serif;
        font-size: 0.8rem;
        padding-top: 0.1rem;
      }
    }

    .scrollbar::-webkit-scrollbar {
      width: 5px;
    }

    .no-scrollbar::-webkit-scrollbar {
      width: 0px;
    }

    textarea::-webkit-scrollbar-thumb {
      background-color: #19191a; /* color of the scroll thumb */
      border-radius: 20px; /* roundness of the scroll thumb */
    }

    .margin {
      margin: 0 0.5rem;

      @media screen and (max-width: 480px) {
        margin: 0 0.3rem;
      }
    }
  }

  .chat_room-id {
    width: 15rem;
    border-radius: 8px;
    background-color: white;
    box-sizing: border-box;
    padding: 1rem 0.5rem;
    position: absolute;
    bottom: 2%;
    left: 0.5%;
    border: 1px solid#e0e3e7;

    .copy_box {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 1rem;

      & > p {
        margin: 0;
        margin-right: auto;
      }
    }

    .id_box {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.9rem;
      background-color: #e3e5e8;
      gap: 0.5rem;

      & > p {
        margin: 0;
      }
    }

    @media screen and (max-width: 480px) {
      width: 13rem;
    }
  }

  .menu {
    position: absolute;
    border-radius: 6px;
    background-color: #071d7c;
    color: white;
    padding: 0 1.2rem;
    top: 3rem;
    right: 1rem;
  }

  .emoji {
    width: 100%;
    max-width: 992px;
    position: fixed;
    bottom: 3.6rem;
  }

  .cursor-pointer {
    cursor: pointer;
  }
}
</style>
