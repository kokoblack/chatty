import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import JoinChat from "../pages/JoinChat.vue";
import ChatWithAI from "../pages/ChatWithAI.vue";
import NotFound from "../pages/404.vue";
import CreateJoinChat from "../pages/InitiateChat.vue";
import ChatRoom from "../components/ChatRoom.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/home",
      redirect: "/",
    },
    {
      path: "/chat/:name",
      name: "join chat",
      component: JoinChat,
    },
    {
      path: "/chat/:name/:option",
      name: "chat",
      component: CreateJoinChat,
    },
    {
      path: "/ai-chat",
      name: "chat with AI",
      component: ChatWithAI,
    },

    {
      path: "/:catchall(.*)*",
      name: "not found",
      component: NotFound,
    },
    {
        path: "/chat-room/:room",
        name: "chat-room",
        component: ChatRoom,
      },
  ],
});

export default router;
