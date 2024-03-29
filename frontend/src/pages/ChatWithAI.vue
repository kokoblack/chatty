<template>
  <div class="ai_room-container">
    <div class="ai_room-header">
      <p>Online</p>
      <v-icon
        @click="menu = !menu"
        class="icon"
        name="bi-three-dots-vertical"
        scale="1.2"
      ></v-icon>
    </div>

    <div @click="closeMenu" class="ai_room-body" id="scroll-to-bottom">
      <Error v-show="errorMsg" :message="errorMsg" class="z-index" />
      <div
        v-for="msg in messages"
        :class="'human' === msg._id ? 'style2' : 'style1'"
      >
        <p>
          {{ msg.message }}
        </p>
      </div>
      <div v-show="loader" class="msg-loader"><MsgLoader /></div>
      <div class="last-child" id="last-child"></div>
    </div>

    <div class="ai_room-footer">
      <v-icon
        @click="emojiMenu = !emojiMenu"
        :class="emojiMenu && 'emoji-color'"
        class="margin"
        name="bi-emoji-smile"
        scale="1.1"
      ></v-icon>

      <textarea
        @focus="errShow = false"
        v-model="text"
        class="margin"
        :class="height === '103px' ? 'scrollbar' : 'no-scrollbar'"
        placeholder="Type a message"
        ref="refs"
        @input="resize()"
      ></textarea>

      <v-icon
        v-show="!loader"
        @click="newMsg"
        class="send margin"
        name="io-send-sharp"
        scale="1.1"
      ></v-icon>
      <div v-show="loader" class="send-loader"><SendLoader /></div>
    </div>

    <div v-if="menu" class="menu">
      <p @click="closeChat" class="cursor-pointer">Close Chat</p>
    </div>

    <VuemojiPicker
      v-show="emojiMenu"
      :is-dark="false"
      @emojiClick="handleEmojiClick"
      class="emoji"
      :picker-style="
        screenWidth < 360 ? emojiStyle : { width: '100%', height: '16rem' }
      "
    />

    <div @click="resendMsg" v-show="errShow" class="resend">
      <button>Resend message</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import "../styles/global.scss";
import Error from "../components/Error.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { VuemojiPicker, EmojiClickEventDetail } from "vuemoji-picker";
import axios from "axios";
import MsgLoader from "../components/MessageLoader.vue";
import SendLoader from "../components/SendLoader.vue";

type Message = {
  message: string;
  _id: string;
}[];

// axios.defaults.withCredentials = true;

const menu = ref(false);
const loader = ref(false);
const emojiMenu = ref(false);
const errShow = ref(false);
const refs = ref();
const height = ref("");
const text = ref("");
const errorMsg = ref("");
const navigate = useRouter();
const screenWidth = ref(window.innerWidth);
const messages = ref<Message>([
  { message: "Hello human. What would you like to know?", _id: "bot" },
]);
const emojiStyle = {
  width: "100%",
  categoryEmojiSize: "1.2rem",
  categoryEmojiPadding: ".2rem",
  numColumns: "6",
  indicatorHeight: "2px",
  height: "17rem",
};

if (sessionStorage.getItem("ai")) {
  // get ai saved info in session storage
  const storage = JSON.parse(sessionStorage.getItem("ai")!);
  messages.value = storage;
} else {
  // set user info in session storage
  sessionStorage.setItem("ai", JSON.stringify(messages.value));
}

const resize = () => {
  // resize the textarea when a user types a message
  refs.value.style.height = "35px";
  refs.value.style.height = refs.value.scrollHeight + "px";
  refs.value.style.maxHeight = "79px";
  height.value = refs.value.scrollHeight + "px";
};
const handleResize = () => {
  // resize the screen width of user for the emoji to fit
  screenWidth.value = window.innerWidth;
};

const handleEmojiClick = (emoji: EmojiClickEventDetail) => {
  // add emoji unicode to input value
  text.value += emoji.unicode;
};

const closeMenu = () => {
  // close menu
  menu.value = false;
};

const ScrollToBottom = () => {
  // get the last div in messages body
  const messageContainer = document.getElementById(
    "last-child"
  ) as HTMLDivElement;
  // scroll to the last div hen a user send a new message
  messageContainer?.scrollIntoView({ behavior: "smooth", block: "end" });
};

const closeChat = () => {
  sessionStorage.removeItem("ai");
  navigate.push("/");
};

const newMsg = (e: Event) => {
  e.preventDefault();

  if (text.value) {
    messages.value.push({
      message: text.value,
      _id: "human",
    });

    refs.value.style.height = "35px";
    ScrollToBottom();
    sessionStorage.setItem("ai", JSON.stringify(messages.value));

    loader.value = true;
    emojiMenu.value = false

    axios
      .post(
        "https://www.botlibre.com/rest/json/chat",
        {
          application: "3092550274072837282",
          instance: "165",
          message: text.value,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      )
      .then((req) => {
        console.log(req);
        loader.value = false;
        messages.value.push({
          message: req.data.message,
          _id: "bot",
        });
        ScrollToBottom();
        sessionStorage.setItem("ai", JSON.stringify(messages.value));
      })
      .catch((err) => {
        console.log(err);
        loader.value = false;
        errShow.value = true;
        errorMsg.value = "something went wrong. Please try again";

        setTimeout(() => {
          errorMsg.value = "";
        }, 3000);
      });

    text.value = "";
  }
};

const resendMsg = () => {
  loader.value = true;
  errShow.value = false;

  axios
    .post(
      "https://www.botlibre.com/rest/json/chat",
      {
        application: "3092550274072837282",
        instance: "165",
        message: messages.value[messages.value.length - 1].message,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    )
    .then((req) => {
      console.log(req);
      loader.value = false;
      messages.value.push({
        message: req.data.message,
        _id: "bot",
      });
      ScrollToBottom();
      sessionStorage.setItem("ai", JSON.stringify(messages.value));
    })
    .catch((err) => {
      console.log(err);
      loader.value = false;
      errShow.value = true;
      errorMsg.value = "something went wrong. Please try again";

      setTimeout(() => {
        errorMsg.value = "";
      }, 3000);
    });
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped lang="scss">
@use "../styles/mixin" as s;

.ai_room-container {
  @include s.room-container;

  .ai_room-header {
    @include s.room-header;
  }

  .ai_room-body {
    @include s.room-body;

    .last-child {
      @include s.room-body_last-child;
    }

    .msg-loader {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      margin-top: 0.2rem;
      background-color: #dedfe0;
      padding: 0.4rem 0;
      border-radius: 6px;
      width: 45px;
    }

    .loader {
      @include s.room-body_loader;
    }

    .z-index {
      z-index: 50;
    }

    .style1 {
      @include s.style1;
    }

    .style2 {
      @include s.style2;
      padding: 0.4rem;

      .status-icon {
        @include s.status-icon;
      }
    }
  }

  .ai_room-footer {
    @include s.room-footer;

    .emoji-color {
      color: #071d7c;
    }

    textarea {
      @include s.textarea;
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

    .send-loader {
      width: 40px;
      @include s.flex-center;
    }

    .margin {
      margin: 0 0.5rem;

      @media screen and (max-width: 480px) {
        margin: 0 0.3rem;
      }
    }
  }

  .menu {
    @include s.menu;
    cursor: pointer;
  }

  .emoji {
    @include s.emoji;
  }

  .resend {
    position: fixed;
    bottom: 3rem;
    left: 50%;
    width: fit-content;
    transform: translate(-50%, -50%);

    & button {
      font-family: "DM Sans", sans-serif;
      font-size: 1rem;
      border-radius: 6px;
      border: none;
      padding: 0.4rem 0.8rem;
      cursor: pointer;
      border: 1px solid #e0e3e7;
      box-shadow: 2px 2px 4px #eaedf1;

      @media screen and (max-width: 305px) {
        font-size: .8rem;
      }
    }
  }
}
</style>
