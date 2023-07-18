<template>
	<div class="err">
		<p>{{ message }}</p>
	</div>
</template>

<script setup lang="ts">
const { message } = defineProps({ message: String });
</script>

<style scoped lang="scss">
.err {
	margin: 0 auto;
	background-color: #ee6b6e;
	padding: 0.2rem 0.5rem;
	position: fixed;
	right: 0;
	left: 0;
	top: 15%;
	text-align: center;
	width: fit-content;
	border-radius: 6px;

	& > p {
		font-size: 0.8rem;
		color: #c30010;
		margin: 0;
	}
}
</style>
