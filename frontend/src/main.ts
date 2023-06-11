import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import {
  RiMessage3Line,
  BiThreeDotsVertical,
  BiEmojiSmile,
  IoSendSharp,
  BiImageFill,
} from "oh-vue-icons/icons";
import "./main.scss";
import router from "./router/router";

const pinia = createPinia();

addIcons(
  RiMessage3Line,
  BiImageFill,
  IoSendSharp,
  BiEmojiSmile,
  BiThreeDotsVertical
);

createApp(App)
  .use(router)
  .use(pinia)
  .component("v-icon", OhVueIcon)
  .mount("#app");
