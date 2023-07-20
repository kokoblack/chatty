<template>
  <div v-if="!checkRoom" class="chat_room-container">
    <div class="chat_room-header">
      <p
        @click="userMenu = !userMenu"
        v-show="session?.routeName === 'private'"
      >
        {{ privateStatus }}
      </p>
      <p @click="userMenu = !userMenu" v-show="session?.routeName === 'group'">
        {{ groupStatus }}
      </p>
      <v-icon
        @click="menu = !menu"
        class="icon"
        name="bi-three-dots-vertical"
        scale="1.2"
      ></v-icon>
    </div>
    <div @click="closeMenu" class="chat_room-body" id="scroll-to-bottom">
      <!--  <div v-show="imageValidation" class="img-error">
        <p>{{ imageValidation }}</p>
      </div> -->
      <Error v-show="imageValidation" :message="imageValidation" />
      <form class="hidden" id="form">
        <input
          id="input-file"
          type="file"
          accept="image/*"
          @change="file"
          name="images"
        />
      </form>
      <template v-if="session?.routeName === 'private'" v-for="msg in messages">
        <p
          v-show="msg.option === 'message'"
          :class="session?.id === msg._id ? 'style2' : 'style1'"
        >
          {{ msg.message }}
        </p>
        <img
          v-if="msg.option === 'image'"
          :src="msg.message"
          :class="session?.id === msg._id ? 'img2' : 'img1'"
          @click="showImg(msg.message)"
        />
      </template>

      <template v-if="session?.routeName === 'group'" v-for="msg in messages">
        <p v-if="msg.option === 'connection'" class="connection">
          {{ msg.message }}
        </p>
        <div
          v-if="msg.option === 'message'"
          :class="session?.id === msg._id ? 'chat-style2' : 'chat-style1'"
        >
          <p v-show="session?.id !== msg._id">~{{ msg.name }}</p>
          <p v-show="msg.option === 'message'">{{ msg.message }}</p>
        </div>
        <div
          v-if="msg.option === 'image'"
          :class="session?.id === msg._id ? 'img-style2' : 'img-style1'"
        >
          <p v-show="session?.id !== msg._id">~{{ msg.name }}</p>
          <img :src="msg.message" @click="showImg(msg.message)" />
        </div>
      </template>
      <div class="last-child" id="last-child"></div>
    </div>
    <div v-show="displayImg" class="show-image">
      <v-icon
        @click="closeImg"
        class="close-image"
        name="io-close-outline"
        scale="1.5"
      ></v-icon>
      <img :src="displayImg" />
    </div>
    <div class="chat_room-footer">
      <v-icon
        @click="emojiMenu = !emojiMenu"
        :class="emojiMenu && 'emoji-color'"
        class="margin"
        name="bi-emoji-smile"
        scale="1.1"
      ></v-icon>
      <v-icon @click="openFile" class="margin" name="bi-image-fill"></v-icon>
      <textarea
        v-model="text"
        class="margin"
        :class="height === '103px' ? 'scrollbar' : 'no-scrollbar'"
        placeholder="Type a message"
        ref="refs"
        @input="resize()"
      ></textarea>
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

    <div class="user-menu" v-if="userMenu && session.routeName === 'group'">
      <p v-for="user in users">{{ user }}</p>
      <p v-if="users.length === 0">no user connected</p>
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
        <p>{{ session?.roomID }}</p>
        <v-icon
          @click="copyText"
          class="cursor-pointer"
          name="io-copy-outline"
          scale="1"
        ></v-icon>
      </div>
    </div>
  </div>
  <h1 v-else class="not_found">{{ checkRoom }}</h1>
</template>

<script setup lang="ts">
import io from "socket.io-client";
import { ref, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useCounterStore } from "../stores/UserStore";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { VuemojiPicker, EmojiClickEventDetail } from "vuemoji-picker";
import axios from "axios";
import Error from "../components/Error.vue";

type Message = {
  name: string;
  message: string;
  option: string;
  _id: string;
}[];

axios.defaults.withCredentials = true;

const socket = io("https://chatty-api-service.onrender.com", {
  withCredentials: true,
  transports: ["websocket"]
});
const store = useCounterStore();
const { name, routeOption, roomID, id, admin, routeName } = storeToRefs(store);
const messages = ref<Message>([]);
const users = ref<string[]>([]);
const images = ref("");
const imageValidation = ref("");
const showImgInFull = ref(false);
const displayImg = ref("");
const privateStatus = ref("Waiting for other user");
const groupStatus = ref("Waiting for other users");
const refs = ref();
const menu = ref(false);
const userMenu = ref(false);
const chatIDMenu = ref(false);
const checkCopied = ref("Copy chat ID");
const emojiMenu = ref(false);
const height = ref("");
const text = ref("");
const checkRoom = ref("");
const screenWidth = ref(window.innerWidth);
const navigate = useRouter();
const route = useRoute();
const ID = route.params.room;
const session = ref({
  name: name.value,
  routeOption: routeOption.value,
  roomID: roomID.value,
  id: id.value,
  admin: admin.value,
  routeName: routeName.value,
});

const emojiStyle = {
  width: "100%",
  categoryEmojiSize: "1.2rem",
  categoryEmojiPadding: ".2rem",
  numColumns: "6",
  indicatorHeight: "2px",
  height: "17rem",
};

if (!name.value && !sessionStorage.getItem("store")) {
  // navigate user to home page when a user manually types in the link
  navigate.push("/");
}

if (!name.value) {
  // get user saved info in session storage
  const storage = JSON.parse(sessionStorage.getItem("store")!);
  session.value = storage;
} else {
  // set user info in session storage
  sessionStorage.setItem("store", JSON.stringify(session.value));
}

// didplay the option to copy chat ID for user who create the chat
session.value?.routeOption === "create"
  ? (chatIDMenu.value = true)
  : (chatIDMenu.value = false);

const showImg = (src: string) => {
  // display image sent or recieved in full screen
  displayImg.value = src;
  showImgInFull.value = true;
};

const closeImg = () => {
  // close image from full screen
  displayImg.value = "";
  showImgInFull.value = false;
};

const handleResize = () => {
  // resize the screen width of user for the emoji to fit
  screenWidth.value = window.innerWidth;
};

const resize = () => {
  // resize the textarea when a user types a message
  refs.value.style.height = "35px";
  refs.value.style.height = refs.value.scrollHeight + "px";
  refs.value.style.maxHeight = "79px";
  height.value = refs.value.scrollHeight + "px";
};

const handleEmojiClick = (details: EmojiClickEventDetail) => {
  // add emoji unicode to input value
  text.value += details.unicode;
};

const copyText = () => {
  // allow user to copy the chat id to Clipboard
  navigator.clipboard.writeText(session.value?.roomID);
  checkCopied.value = "Copied!";
};

const copyText2 = () => {
  // allow user to copy the room id to Clipboard and close the Clipboard menu
  navigator.clipboard.writeText(route.params.room as string);
  menu.value = false;
};

const closeMenu = () => {
  // close both available group user menu and room id menu
  menu.value = false;
  userMenu.value = false;
};

const ScrollToBottom = () => {
  // get the last div in messages body
  const messageContainer = document.getElementById(
    "last-child"
  ) as HTMLDivElement;
  // scroll to the last div hen a user send a new message
  messageContainer?.scrollIntoView({ behavior: "smooth", block: "end" });
};

// const textarea = (e: KeyboardEvent) => {
//   if (e.key === "Enter") {
//     e.preventDefault()

//     text.value += document.createElement('br')
//   }
// };

const newMsg = (e: Event) => {
  e.preventDefault();

  if (text.value) {
    // if the user input isn't empty then push the message to message body
    messages.value?.push({
      name: session.value?.name,
      message: text.value,
      _id: session.value?.id,
      option: "message",
    });

    // this send the message to backend to other users
    socket.emit(
      "chat message",
      {
        name: session.value?.name,
        message: text.value,
        _id: session.value?.id,
        option: "message",
      },
      ID,
      (response: any) => {
        console.log(response);
      }
    );

    // revert the text area to it initial size
    refs.value.style.height = "35px";
    // then the message is pushed to the message body then scroll to last div
    ScrollToBottom();
    // and set the text area to an empty string
    text.value = "";
  }
};

const file = (e: Event) => {
  e.preventDefault();

  // get the file from the user and the form where the input type of file is
  const file = (<HTMLInputElement>e.target).files![0];
  const form = document.getElementById("form") as HTMLFormElement;

  if ((<HTMLInputElement>e.target).files!.length === 0) {
    // if the file is empty send the error message to user and reset the input file
    imageValidation.value = "No image selected";
    form.reset();

    // set a timeout to clear the message
    setTimeout(() => {
      imageValidation.value = "";
    }, 3000);
  } else {
    // store all image type to check if file is an image
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];

    if (!validImageTypes.includes(file.type)) {
      // if not an image send error to user and reset the input file
      imageValidation.value = "File is not an image";
      form.reset();

      // set a timeout to clear the message
      setTimeout(() => {
        imageValidation.value = "";
      }, 3000);
    } else if (file.size > 1024 * 1024) {
      // if the image is > than 1mb send error message to user and reset input file
      imageValidation.value = "select an image < 1mb";
      form.reset();

      // set a timeout to clear the message
      setTimeout(() => {
        imageValidation.value = "";
      }, 3000);
    } else {
      // use the file reader to convert to data url
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        images.value = reader.result! as string;

        // push the converted image to the message body
        messages.value?.push({
          name: session.value?.name,
          message: images.value,
          _id: session.value?.id,
          option: "image",
        });

        // send to backend for other users
        socket.emit(
          "chat message",
          {
            name: session.value?.name,
            message: images.value,
            _id: session.value?.id,
            option: "image",
          },
          ID,
          (response: any) => {
            console.log(response);
          }
        );

        // reset input file and scroll to the last message
        form.reset();
        ScrollToBottom();
      };
      reader.onerror = (error) => {
        console.log(`error:`, error);
      };
    }
  }
};

const openFile = () => {
  // allow user to choose images with the hidden input file
  document.getElementById("input-file")?.click();
};

// check if room still exist in database
axios
  .get(`https://chatty-api-service.onrender.com/rooms/${ID}`)
  .then((res) => {
    if (!res.data) {
      checkRoom.value = "Session expired";
    }
  })
  .catch((err) => console.log(err));

// get all conversaton of a particular room when a user refresh or disconnect
axios
  .get(`https://chatty-api-service.onrender.com/rooms/conversation/${ID}`)
  .then((res) => {
    messages.value = res.data;
  })
  .catch((err) => console.log(err));

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  //send request to backend to delete room when all users disconnect
  socket.close();

  axios
    .delete(`https://chatty-api-service.onrender.com/rooms/${ID}`)
    .catch((err) => console.log(err));
  console.log("unmount");
});

socket.emit(
  // send newly connected user to backend and room id
  "new user",
  {
    name: session.value?.name,
    id: session.value?.id,
    admin: session.value?.admin,
    roomID: session.value?.roomID,
  },
  ID
);

socket.on("user connected", (newUser) => {
  // get new connected user and notify existing user in a room
  privateStatus.value = `${newUser} online`;
});

socket.on("online user", (user) => {
  // get every connected user and notify all group user in a room
  users.value = user;
  console.log(user);

  if (session.value.routeName === "group") {
    if (users.value.length === 2) {
      groupStatus.value = `${users.value[0]}, ${users.value[1]} connected`;
    } else if (users.value.length === 3) {
      groupStatus.value = `${users.value[0]}, ${users.value[1]}, ${users.value[2]} connected`;
    } else if (users.value.length > 3) {
      groupStatus.value = `${users.value[0]}, ${users.value[1]}, ${
        users.value[2]
      } and ${users.value.length - 3} connected`;
    }
  }
});

socket.on("users", (user, users) => {
  // get newly connected group user and all user in private room
  const connectedUser = {
    option: "connection",
    name: user.name,
    _id: user.id,
    message: `${user.name} connected`,
  };

  // notify group users in a room of connected user
  messages.value?.push(connectedUser);

  if (users?.length !== 0) {
    // remove existing user from newly connected user in a private room and notify existing user of   the connected user
    const user = users?.filter(
      (user: { name: string; admin: string; _id: string; socketID: string }) =>
        user._id !== session.value.id
    );
    console.log(user);
    if (user?.length !== 0) {
      privateStatus.value = `${user[0]?.name} online`;
    }
  }
});

// send the room id to backend
socket.emit("join-room", ID);

socket.on("chat message", (msg) => {
  // get new message from user and push to message body and scroll to last div
  messages.value?.push(msg);
  ScrollToBottom();
});

socket.on("offline", (user, offlineUsers, offlineUser) => {
  // get disconnected User from backend
  const disconnectedUser = {
    option: "connection",
    name: offlineUser.name,
    _id: offlineUser.id,
    message: `${offlineUser.name} disconnected`,
  };

  // notify group users of disconnected user
  messages.value?.push(disconnectedUser);

  // notify private users of disconnected user
  privateStatus.value = `${user[0]?.name} offline`;

  // get name of all disconnected User
  const offline = offlineUsers.map((eve: any) => eve.name);
  users.value = offline;

  // update the users in the room for group users
  if (session.value.routeName === "group") {
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
  }
});
</script>

<style scoped lang="scss">
@use "../styles/mixin" as s;

.chat_room-container {
  display: block;
  min-height: 100vh;
  position: relative;
  box-sizing: border-box;

  .chat_room-header {
    @include s.flex-center;
    background-color: #041562;
    color: white;
    width: 100%;
    position: sticky;
    top: 0;
    padding: 1rem;
    box-sizing: border-box;
    z-index: 10;

    p {
      font-size: 1rem;
      margin: 0 auto 0 0;
    }

    .icon {
      margin: 0;
    }
  }

  .chat_room-body {
    padding: 0 0.2rem;
    width: 100%;
    box-sizing: border-box;
    position: relative;

    .last-child {
      height: 20.5rem;

      @media screen and (max-width: 480px) {
        height: 12.5rem;
      }
    }

    .img-error {
      display: block;
      margin: 0 auto;
      background-color: #ee6b6e;
      padding: 0.2rem 0.5rem;
      position: fixed;
      right: 0;
      left: 0;
      top: 10%;
      text-align: center;
      width: fit-content;
      border-radius: 6px;

      & > p {
        font-size: 0.8rem;
        color: #c30010;
        margin: 0;
      }
    }

    .style1 {
      margin: 0.2rem auto 0 0;
      background-color: #dedfe0;
      color: #19191a;
      @include s.chat-style(fit-content);
    }

    .style2 {
      margin: 0.2rem 0 0 auto;
      background-color: #041562;
      color: white;
      @include s.chat-style(fit-content);
    }

    .chat-style1 {
      margin: 0.2rem auto 0 0;
      background-color: #dedfe0;
      color: #19191a;
      @include s.group-chat-style;
    }

    .chat-style2 {
      margin: 0.2rem 0 0 auto;
      background-color: #041562;
      color: white;
      @include s.group-chat-style;
    }

    .img-style1 {
      margin: 0.2rem auto 0 0;
      background-color: #dedfe0;
      @include s.group-img-style;
    }

    .img-style2 {
      margin: 0.2rem 0 0 auto;
      background-color: #041562;
      @include s.group-img-style;
    }
  }

  .img1 {
    margin: 0.2rem auto 0 0;
    @include s.img-style(#dedfe0);
  }

  .img2 {
    margin: 0.2rem 0 0 auto;
    @include s.img-style(#041562);
  }

  .connection {
    text-align: center;
    margin: 0.2rem;
    color: #19191a;
    font-size: 0.8rem;
  }

  .hidden {
    display: none;
  }

  img {
    width: 30%;
  }

  .show-image {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100vh;
    z-index: 20;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: brightness(15%) blur(6px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    row-gap: 0.5rem;
    padding: 1rem 0;

    .close-image {
      position: fixed;
      top: 2%;
      right: 2%;
      color: #fff;
    }

    & > img {
      width: 70%;
      text-align: center;

      @media screen and (max-width: 992px) {
        width: 100%;
      }
    }
  }

  .chat_room-footer {
    @include s.flex-center;
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
      @include s.flex-center;
      padding: 0.4rem 0.3rem 0 0.3rem;
      border-radius: 6px;
      border: none;
      font-size: 1rem;
      height: 35px;
      width: 90%;
      border: 1px solid #e0e3e7;
      resize: none;
      box-sizing: border-box;

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
    position: fixed;
    bottom: 2%;
    left: 2%;
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
      @include s.flex-center;
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
    position: fixed;
    border-radius: 6px;
    background-color: #071d7c;
    color: white;
    padding: 0 1.2rem;
    top: 3rem;
    right: 1rem;
  }

  .user-menu {
    position: absolute;
    border-radius: 6px;
    border: 1px solid #e0e3e7;
    background-color: #fff;
    color: #11468f;
    padding: 0 0.2rem;
    top: 3rem;
    left: 1rem;
    width: 6.5rem;
    max-height: 20rem;
    overflow-x: auto;

    & > p {
      font-size: 0.9rem;
      margin: 0.5rem;
      word-break: break-all;
    }
  }

  .user-menu::-webkit-scrollbar {
    width: 1px;
  }

  .user-menu::-webkit-scrollbar-thumb {
    background-color: #333436; /* color of the scroll thumb */
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
