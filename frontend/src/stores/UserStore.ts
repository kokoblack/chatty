import { defineStore } from "pinia";
import { ref } from "vue";

export const useCounterStore = defineStore("user", () => {
  const roomID = ref("");
  const chatID = ref("");
  const name = ref("ffff");
  const routeOption = ref("");
  const routeName = ref("");

  function setName(nam: string) {
    name.value = nam;
  }

  function setRoomID(id: string) {
    roomID.value = id;
  }
  
  function setChatID(id: string) {
    chatID.value = id;
  }

  function setRouteOption(route: string) {
    routeOption.value = route;
  }

  function setRouteName(route: string) {
    routeName.value = route;
  }

  return { roomID, chatID, name, routeOption, routeName, setName, setRoomID, setChatID, setRouteOption, setRouteName };
});
