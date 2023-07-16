<template>
	<div class="back">
		<v-icon @click="navigate.go(-1)" scale="1.2" name="md-arrowback-outlined">
		</v-icon>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const navigate = useRouter();
</script>

<style scoped lang="scss">
.back {
	color: #041562;
	position: absolute;
	top: 2.8vh;
	right: 1%;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;

	// @media screen and (max-width: 980px) {
	// 	top: 3.25vh;
	// }
}
</style>
