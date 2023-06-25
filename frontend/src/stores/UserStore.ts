import { defineStore } from "pinia";
import { ref } from "vue";

export const useCounterStore = defineStore("user", () => {
  const roomID = ref("");
  const name = ref("");
  const routeOption = ref("");
  const routeName = ref("");
  const id = ref("")
  const admin = ref("")

  function setName(nam: string) {
    name.value = nam;
  }

  function setRoomID(id: string) {
    roomID.value = id;
  }

  function setRouteOption(route: string) {
    routeOption.value = route;
  }

  function setRouteName(route: string) {
    routeName.value = route;
  }

  function setId(idf: string) {
    id.value = idf;
  }

  function setAdmin(adm: string) {
    admin.value = adm;
  }

  return {
    roomID,
    name,
    routeOption,
    routeName,
    id,
    admin,
    setName,
    setRoomID,
    setRouteOption,
    setRouteName,
    setId,
    setAdmin
  };
});
