<template>
	<div class="error_message-container">
		<div class="error_message">
			<v-icon
				class="error_message-icon"
				name="io-close-outline"
				scale="1.1"
				@click="buttonClick(false)"
			>
			</v-icon>
			<p class="error_message-text">{{ message }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">

const { message } = defineProps({message: String});
const emit = defineEmits(["closeError"]);

const buttonClick = (close: boolean) => {
	emit('closeError', close)
}
</script>

<style scoped lang="scss">
.error_message-container {
	background-color: rgba(255, 255, 255, 0.3);
	height: 100vh;
	width: 100vw;
	position: relative;
	backdrop-filter: blur(4px) brightness(50%);
	z-index: 50;

	.error_message {
		background-color: #fff;
		border-radius: 8px;
		padding: 0.5rem;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 14rem;
		box-sizing: border-box;
	}

	.error_message-icon {
		display: block;
		margin: 0 0 0.3rem auto;
		cursor: pointer;
	}

	.error_message-text {
		margin: 0;
		text-align: center;
		font-size: .9rem;
		padding: 0 .5rem;
	}
}
</style>
