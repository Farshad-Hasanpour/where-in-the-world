<template>
	<nuxt-link v-wave class="country" :to="`/countries/${country.codes.alpha_3}`" :draggable="false">
		<img
			ref="flagImage"
			class="country__flag"
			:src="require('@/assets/img/flag-placeholder.png')"
			:data-main-src="country.flag.src"
			:alt="country.flag.alt || ''"
			:draggable="false"
		>
		<div class="country-details">
			<h3 class="country-details__name">{{ country.names.common }}</h3>
			<div v-for="field in fields" :key="field.key" class="country-fields">
				<span class="country-fields__title">{{ field.label }}: </span>
				<span class="country-fields__value">
					{{
						!country[field.key]
							? 'N/A'
							: typeof country[field.key] !== 'number'
								? country[field.key]
								: country[field.key].toLocaleString()
					}}
				</span>
			</div>
		</div>
	</nuxt-link>
</template>

<script>
export default {
	name: "CountryCard",
	props: {
		country: { required: true, type: Object }
	},
	computed: {
		fields(){
			return [
				{
					key: 'population',
					label: 'Population'
				},
				{
					key: 'region',
					label: 'Region',
				},
				{
					key: 'capital',
					label: 'Capital'
				}
			]
		}
	}
}
</script>

<style lang="scss" scoped>
	.country{
		display: flex;
		flex-direction: column;
		border-radius: 4px;
		overflow: hidden;
		background-color: var(--color-element);
		color: var(--color-text);
	}

	.country__flag{
		width: 100%;
		height: auto;
		object-fit: cover;
		aspect-ratio: 5 / 3;
		border-bottom: 1px solid var(--color-line);
	}
	.country-details{
		padding: 26px 12px;

	}

	.country-details__name{
		margin-top: 0;
		margin-bottom: 19px;
		font-size: 19px;
		font-weight: 800;
	}

	.country-fields__title{
		font-weight: 600;
	}
</style>
