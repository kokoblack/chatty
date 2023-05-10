import { createApp } from "vue";
import App from "./App.vue";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { RiMessage3Line } from "oh-vue-icons/icons";
import "./main.scss";

addIcons(RiMessage3Line);

createApp(App).component("v-icon", OhVueIcon).mount("#app");
