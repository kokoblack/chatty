<template>
	<div class="dots-6"></div>
</template>

<style scoped>
.dots-6 {
  width: 5px;
  aspect-ratio: 1;
  background: #333436;
  border-radius: 50%;
  animation: d6 .6s infinite linear alternate;
}
@keyframes d6 {
    0%  {box-shadow: 9px 0,-11px 0}
    50% {box-shadow: 9px 0,-9px 0}
    100%{box-shadow: 11px 0,-9px 0}
}
/*.dot-stretching {
	position: relative;
	width: 10px;
	height: 10px;
	border-radius: 5px;
	background-color: #9880ff;
	color: #9880ff;
	transform: scale(1.25, 1.25);
	animation: dot-stretching 2s infinite ease-in;
}
.dot-stretching::before,
.dot-stretching::after {
	content: "";
	display: inline-block;
	position: absolute;
	top: 0;
}
.dot-stretching::before {
	width: 10px;
	height: 10px;
	border-radius: 5px;
	background-color: #9880ff;
	color: #9880ff;
	animation: dot-stretching-before 2s infinite ease-in;
}
.dot-stretching::after {
	width: 10px;
	height: 10px;
	border-radius: 5px;
	background-color: #9880ff;
	color: #9880ff;
	animation: dot-stretching-after 2s infinite ease-in;
}

@keyframes dot-stretching {
	0% {
		transform: scale(1.25, 1.25);
	}
	50%,
	60% {
		transform: scale(0.8, 0.8);
	}
	100% {
		transform: scale(1.25, 1.25);
	}
}
@keyframes dot-stretching-before {
	0% {
		transform: translate(0) scale(0.7, 0.7);
	}
	50%,
	60% {
		transform: translate(-20px) scale(1, 1);
	}
	100% {
		transform: translate(0) scale(0.7, 0.7);
	}
}
@keyframes dot-stretching-after {
	0% {
		transform: translate(0) scale(0.7, 0.7);
	}
	50%,
	60% {
		transform: translate(20px) scale(1, 1);
	}
	100% {
		transform: translate(0) scale(0.5, 0.5);
	}
}
*/
</style>
