import {createRouter, createWebHistory} from "vue-router"
import Home from "../components/Home.vue"
import PrivateChat from "../pages/PrivateChat.vue"
import GroupChat from "../pages/GroupChat.vue"
import ChatWithAI from "../pages/ChatWithAI.vue"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "Home",
            component: Home
        },
        {
            path: "/private-chat",
            name: "PrivateChat",
            component: PrivateChat
        },
        {
            path: "/group-chat",
            name: "GroupChat",
            component: GroupChat
        },
        {
            path: "/ai-chat",
            name: "ChatWithAI",
            component: ChatWithAI
        }
    ]
})

export default router