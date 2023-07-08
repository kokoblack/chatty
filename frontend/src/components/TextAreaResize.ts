
const handleResize = (srnWidth: Ref<number>) => {
  srnWidth.value = window.innerWidth;
};

const resize = (ref, height) => {
  refs.value.style.height = "35px";
  refs.value.style.height = refs.value.scrollHeight + "px";
  refs.value.style.maxHeight = "79px";
  height.value = refs.value.scrollHeight + "px";
};