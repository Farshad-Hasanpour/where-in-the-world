<template>
	<div class="container">
		<nav class="navigation">
			<nuxt-link to="/" class="back-link" :draggable="false">
				<button v-wave type="button" class="back-btn normal">
					<c-icon
							:name="$store.state.icons.back"
							color="var(--color-text)"
					/>
					<span class="back-btn__text">Back</span>
				</button>
			</nuxt-link>
		</nav>
		<div class="details">
			<div>
				<img class="flag" :src="country.flag.src" :alt="country.flag.alt" :draggable="false">
			</div>
			<div>
				<h3 class="country-name">{{ country.names.common }}</h3>
				<div class="extra">
					<div class="extra__primary">
						<div v-for="field in primaryFields" :key="field.name" class="country-fields">
							<span class="country-fields__title">{{ field.title }}: </span>
							<span class="country-fields__value">
								{{ getInfoByFieldName(field.name.split('.')) }}
							</span>
						</div>
					</div>
					<div class="extra__secondary">
						<div v-for="field in secondaryFields" :key="field.name" class="country-fields">
							<span class="country-fields__title">{{ field.title }}: </span>
							<span class="country-fields__value">
								{{ getInfoByFieldName(field.name.split('.')) }}
							</span>
						</div>
					</div>
				</div>
				<div class="borders">
					<span class="borders__title">Border Countries:</span>
					<nuxt-link
							v-for="border in country.borders"
							:key="border.codes.alpha_3"
							:to="`/countries/${border.codes.alpha_3}`"
							:draggable="false"
							class="border-btn"
					>
						<button type="button" class="normal">
							{{ border.name }}
						</button>
					</nuxt-link>
					<span v-show="!country.borders?.length" class="borders__none">None</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Country",
	async asyncData({ error, route, $countryService }){
		try{
			const country = await $countryService.getCountryDetails({
				code: route.params.slug
			});
			return {
				country
			};
		}catch(err){
			if(process.env.NODE_ENV === 'development') console.error(err);
			error({
				status: err.response ? parseInt(err.response.status) : 500,
				msg: 'There was some error in fetching country details.'
			});
		}
	},
	computed: {
		primaryFields(){
			return [
				{ name: 'names.native', title: 'Native Name' },
				{ name: 'population', title: 'Population' },
				{ name: 'region', title: 'Region' },
				{ name: 'subregion', title: 'Subregion' },
				{ name: 'capital', title: 'Capital' },
			]
		},
		secondaryFields(){
			return [
				{ name: 'tlds', title: 'Top Level Domains' },
				{ name: 'currencies', title: 'Currencies' },
				{ name: 'languages', title: 'Languages' },
			]
		}
	},
	methods:{
		getInfoByFieldName(fieldName){
			if(!fieldName?.length) return 'N/A';
			let result = this.country;
			fieldName.forEach(part => {
				result = result[part];
			});

			if(!result) return 'N/A';

			if(typeof result === 'number') result = result.toLocaleString();

			return result;
		}
	}
}
</script>

<style lang="scss" scoped>
@use "~/assets/style/variables" as *;

.navigation{
	width: 100%;
	padding: 64px 32px 32px;
	display: flex;
}
.back-btn__text{
	color: var(--color-text);
	padding-left: 8px;
	padding-right: 8px;
}
.details{
	width: 100%;
	padding: 32px;
	display: grid;
	grid-template-columns: repeat(1, 1fr);
	grid-gap: 64px;
}
.flag{
	width: 100%;
	height: auto;
	border: 1px solid var(--color-line)
}

.country-name{
	font-size: 26px;
	font-weight: 800;
}

.extra{
	display: flex;
	flex-wrap: wrap;

}
.extra__primary{
	width: 100%;
	margin-bottom: 42px
}
.extra__secondary{
	width: 100%;
	margin-bottom: 42px;
}

.country-fields__title{
	font-weight: 600;
}

.country-fields__value,
.country-fields__title{
	font-size: 14px
}

.borders{
	display: flex;
	flex-wrap: wrap;
	align-items: center;
}

.borders__title{
	width: 100%;
	margin-right: 8px;
	margin-bottom: 16px;
	font-weight: 800;
}

.border-btn{
	margin-right: 8px;
	margin-bottom: 16px;
	color: var(--color-text);
}

.borders__none{
	margin-right: 8px;
	margin-bottom: 16px;
	color: var(--color-text);
}

@media #{map-get($display-breakpoints, 'md-and-up')} {
	.details{
		grid-template-columns: repeat(2, 1fr);
	}

	.borders__title{
		width: auto;
	}

	.extra__primary{
		width: 50%;
		padding-right: 21px;
	}
	.extra__secondary{
		width: 50%;
		padding-left: 21px;
	}
}
</style>
