<template>
  <div class="chat_room-container">
    <div class="chat_room-header">
      <p>user</p>
      <v-icon
        @click="menu = !menu"
        class="icon"
        name="bi-three-dots-vertical"
        scale="1.2"
      ></v-icon>
    </div>
    <div @click="menu = false" class="chat_room-body">
      <!-- <p class="test">dbhvbvvvvvvvvvvvvh</p>
      <p class="test">dbhvbvvvvvvvvvvvvh</p>
      <p class="test2">
        dbhvbvvvvvvvvvvvvffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffdgffffffffffffffffnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngfnnnnnnnnnnnnnnnnnnnnnnnh
      </p>
      <p class="test2">dbhvbvvvvvvvvvvvvh</p>
      <p class="test">dbhvbvvvvvvvvvvvvh</p>
      <p class="test">dbhvbvvvvvvvvvvvvh</p>
      <p class="test2">dbhvbvvvvvvvvvvvvh</p>
      <p class="test">dbhvbvvvvvvvvvvvvh</p>
      <p class="test">dbhvbvvvvvvvvvvvvh</p>
      <p class="test2">dbhvbvvvvvvvvvvvvh</p>
      <p class="test">dbhvbvvvvvvvvvvvvh</p> -->
      <p>{{ connect }}</p>
      <p v-for="msg in messages" class="test">{{ msg.message }}</p>
      <p v-for="msg in messages" class="test">{{ msg.name }}</p>
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
      <p>Copy Link</p>
      <p>Close Chat</p>
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
  </div>
</template>

<script setup lang="ts">
import io from "socket.io-client";
import { ref, onMounted, onUnmounted } from "vue";
import { useCounterStore } from '../stores/UserStore'
import { storeToRefs } from 'pinia'
import { useRoute } from "vue-router";
import { VuemojiPicker, EmojiClickEventDetail } from "vuemoji-picker";

type Message = {
  name: string;
  message: string;
}[];

const store = useCounterStore()
const {name} = storeToRefs(store)
const messages = ref<Message>([]);
const connect = ref("");
const refs = ref();
const menu = ref(false);
const emojiMenu = ref(false);
const height = ref("");
const text = ref("");
const screenWidth = ref(window.innerWidth);
const route = useRoute();
const roomID = route.params.room;
console.log(roomID)

const handleResize = () => {
  screenWidth.value = window.innerWidth;
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

const socket = io("http://localhost:3000");
socket.on("connect", () => (connect.value = `${socket.id} is connected`));
socket.emit('join-room', roomID)
socket.on("chat message", (msg) => messages.value.push(msg));


const newMsg = (e: Event) => {
  e.preventDefault();
  if (text.value) {
    messages.value.push({ name: name.value, message: text.value })
    socket.emit("chat message", { name: name.value, message: text.value }, roomID);
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
    .test {
      margin: 0.2rem;
      background-color: #041562;
      color: white;
      padding: 0.5rem;
      border-radius: 6px;
      width: fit-content;
      max-width: 70%;
      margin-left: auto;
      text-align: right;
      box-sizing: border-box;
    }

    .test2 {
      margin: 0.2rem;
      background-color: #dedfe0;
      color: #19191a;
      padding: 0.5rem;
      border-radius: 6px;
      width: fit-content;
      max-width: 70%;
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
}
</style>
