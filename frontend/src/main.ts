import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import {
  BiThreeDotsVertical,
  BiEmojiSmile,
  IoSendSharp,
  BiImageFill,
  IoCopyOutline,
  IoCloseOutline,
  RiMessage3Line
} from "oh-vue-icons/icons";
import "./main.scss";
import router from "./router/router";

const pinia = createPinia();

addIcons(
  BiImageFill,
  IoSendSharp,
  BiEmojiSmile,
  BiThreeDotsVertical,
  IoCopyOutline,
  IoCloseOutline,
  RiMessage3Line
);

createApp(App)
  .use(router)
  .use(pinia)
  .component("v-icon", OhVueIcon)
  .mount("#app");
