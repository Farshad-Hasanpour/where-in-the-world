<template>
	<div class="country-skeleton" aria-hidden="true">
		<div class="country-skeleton__flag" />
		<div class="country-skeleton__details">
			<div class="country-skeleton__name" />
			<div
					v-for="i in 3"
					:key="i"
					class="country-skeleton__field"
			/>
		</div>
	</div>
</template>

<script>
export default {
	name: 'CountrySkeleton'
}
</script>

<style lang="scss" scoped>
@keyframes country-skeleton-pulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}

.country-skeleton{
	display: flex;
	flex-direction: column;
	border-radius: 4px;
	overflow: hidden;
	background-color: var(--color-element);
}

.country-skeleton__flag{
	width: 100%;
	aspect-ratio: 5 / 3;
	border-bottom: 1px solid var(--color-line);
	background-color: var(--color-line);
	animation: country-skeleton-pulse 1.4s ease-in-out infinite;
}

.country-skeleton__details{
	padding: 26px 12px;
}

.country-skeleton__name{
	width: 65%;
	height: 22px;
	margin-bottom: 19px;
	border-radius: 4px;
	background-color: var(--color-line);
	animation: country-skeleton-pulse 1.4s ease-in-out infinite;
}

.country-skeleton__field{
	width: 80%;
	height: 14px;
	margin-bottom: 10px;
	border-radius: 4px;
	background-color: var(--color-line);
	animation: country-skeleton-pulse 1.4s ease-in-out infinite;

	&:nth-child(2){
		width: 70%;
		animation-delay: 0.1s;
	}
	&:nth-child(3){
		width: 55%;
		animation-delay: 0.2s;
	}
	&:nth-child(4){
		width: 60%;
		margin-bottom: 0;
		animation-delay: 0.3s;
	}
}
</style>
