<template>
	<div class="dots-5"></div>
</template>

<style scoped>
.dots-5 {
	width: 8px;
	aspect-ratio: 1;
	border-radius: 50%;
	animation: d5 1s infinite linear alternate;
}
@keyframes d5 {
	0% {
		box-shadow: 13px 0 #000, -13px 0 #0002;
		background: #000;
	}
	33% {
		box-shadow: 13px 0 #000, -12px 0 #0002;
		background: #0002;
	}
	66% {
		box-shadow: 13px 0 #0002, -13px 0 #000;
		background: #0002;
	}
	100% {
		box-shadow: 13px 0 #0002, -13px 0 #000;
		background: #000;
	}
}
</style>
