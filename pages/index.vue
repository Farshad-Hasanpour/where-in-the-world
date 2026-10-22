<template>
	<div class="container">
		<div class="filter-box">
			<div class="search-box">
				<c-icon :name="$store.state.icons.search" />
				<input
						v-model="filter.search"
						inputmode="search"
						placeholder="Search for a country"
						class="search-box__input"
				>
				<c-icon
						v-show="filter.search"
						:name="$store.state.icons.close"
						color="var(--color-input)"
						class="cursor-pointer"
						@click.stop="filter.search = ''"
				/>
			</div>
			<div class="region-select">
				<!-- TODO: A customized select component would be better -->
				<select v-model="filter.region" name="region" class="region-select__input cursor-pointer">
					<option :value="null">Filter by Region</option>
					<option v-for="region in allRegions" :key="region" :value="region">{{ region }}</option>
				</select>
				<c-icon
						v-show="filter.region"
						:name="$store.state.icons.close"
						color="var(--color-input)"
						class="region-select__close cursor-pointer"
						@click.stop="filter.region = null"
				/>
				<c-icon
						:name="$store.state.icons.asc"
						color="var(--color-input)"
						class="region-select__icon cursor-pointer"
				/>
			</div>
			<button v-wave type="button" class="sort-btn normal" @click.stop="toggleSort">
				<span class="sort-btn__name">sort: {{ sort.field }}</span>
				<c-icon
						:name="$store.state.icons.asc"
						color="var(--color-input)"
						:class="{'reverse': sort.type !== 'ASC'}"
				/>
			</button>
		</div>
		<div class="country-list">
			<country-card
					v-for="country in paginatedCountries"
					:key="country.cca3"
					ref="countryCard"
					:country="country"
			/>
		</div>
		<p v-show="!paginatedCountries.length" class="no-country">
			no country is matched with specified filters
		</p>
		<div ref="autoPagination" class="auto-pagination" />
	</div>
</template>

<script>
let flagLazyLoadObserver = null;
let autoPaginationObserver = null;

function termHasAllCharsOrderWise(term, charSet){
	let previousCharIndex = 0;
	for(let i = 0; i < charSet.length; i++){
		const indexOfChar = term.slice(previousCharIndex, term.length).indexOf(charSet[i]);
		if(indexOfChar < 0) return false;
		previousCharIndex += indexOfChar + 1;
	}
	return true;
}

export default {
	name: 'IndexPage',
	async asyncData({ error, query, $countryService }){
		const {
			region,
			sort_field: sortField,
			sort_type: sortType,
			search
		} = query;

		//TODO: !! better to validate queries

		try{
			const allCountries = await $countryService.getAllCountries();
			return {
				allCountries,
				filter: {
					region: region || null,
					search: search || ''
				},
				sort: {
					field: sortField || 'population',
					type: sortType || 'DEC'
				}
			};
		}catch(err){
			if(process.env.NODE_ENV === 'development') console.error(err);
			error({
				status: err.response ? parseInt(err.response.status) : 500,
				msg: 'There was some error in fetching countries.'
			});
		}
	},
	data(){
		return{
			page: 1,
			perPage: 25 // It's better to be divisible by 2, 3 and 4 (number of countries per row in various screens)
		}
	},
	computed:{
		allRegions(){
			return Array.from(
				new Set(
					this.allCountries.map(country => country.region)
				)
			)
		},
		shownCountries(){
			let result = this.allCountries;
			const searchChars = this.filter.search?.toLowerCase().split('');

			result = result.filter(country => {
				// filter by region
				if(this.filter.region && country.region !== this.filter.region) return false;
				// filter by search term
				return !(
					searchChars?.length &&
					!termHasAllCharsOrderWise(country.name.common?.toLowerCase() || '', searchChars)
					// !termHasAllCharsOrderWise(country.name.official?.toLowerCase() || '', searchChars) &&
					// !termHasAllCharsOrderWise(country.name.nativeName?.toLowerCase() || '', searchChars)
				)
			});

			const coef = this.sort.type === 'ASC' ? 1 : -1;
			result.sort((a, b) => {
				let result = 0;
				if(this.sort.field === 'name'){
					result = a.name.common.localeCompare(b.name.common);
				}else if(this.sort.field === 'population'){
					if(a.population > b.population) result = 1;
					else if(a.population < b.population) result = -1;
				}
				return result * coef;
			})

			return result
		},
		paginatedCountries(){
			return this.shownCountries.slice(0, this.page * this.perPage)
		}
	},
	watch: {
		"filter.region"(){
			this.page = 1;
			this.updateURLQueries()
		},
		"filter.search"(){
			this.page = 1;
			this.updateURLQueries()
		},
		"sort.field"(){
			this.page = 1;
			this.updateURLQueries()
		},
		"sort.type"(){
			this.page = 1;
			this.updateURLQueries()
		},
		paginatedCountries: {
			immediate: true,
			handler(){
				// wait for countries to be mounted
				this.$nextTick(() => {
					// get mounted countries
					const countryCardsRef = this.$refs.countryCard;
					if(!countryCardsRef) return;
					// activate image lazy load for each mounted country card
					countryCardsRef.forEach(countryCard => {
						flagLazyLoadObserver.observe(countryCard.$refs.flagImage);
					});
				})
			}
		}
	},
	mounted(){
		flagLazyLoadObserver = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if(!entry.isIntersecting) return;
				const mainSrc = entry.target.getAttribute('data-main-src');
				// disable observer for post cards that have already loaded the high quality image featured image
				if(!mainSrc) {
					flagLazyLoadObserver.unobserve(entry.target);
					return;
				}
				// if post image is visited replace low quality image with high quality image
				entry.target.setAttribute('src', mainSrc);
				entry.target.removeAttribute('data-main-src');
				flagLazyLoadObserver.unobserve(entry.target);
			})
		});

		// observer for auto pagination
		autoPaginationObserver = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if(!entry.isIntersecting) return;
				this.$nextTick(() => {
					this.page = this.page + 1;
				})
			})
		});
		autoPaginationObserver.observe(this.$refs.autoPagination);
	},
	beforeDestroy(){
		//unobserve
		this.$refs.countryCard.forEach(countryCard => {
			flagLazyLoadObserver.unobserve(countryCard.$refs.flagImage);
		});
		autoPaginationObserver.unobserve(this.$refs.autoPagination);
	},
	methods: {
		toggleSort(){
			if(this.sort.type === 'ASC'){
				this.sort.type = 'DEC';
				return;
			}
			if(this.sort.field === 'name') this.sort.field = 'population';
			else this.sort.field = 'name';
			this.sort.type = 'ASC';
		},
		updateURLQueries(){
			const { query } = this.$router.currentRoute;
			query.sort_type = this.sort.type;
			query.sort_field = this.sort.field;
			query.region = this.filter.region;
			query.search = this.filter.search;

			const params = '?' + Object.entries(query)
				.filter(item => item[1])
				.map(item => item.join('='))
				.join('&');

			history.replaceState({}, null, window.location.origin + params)
		}
	}
}
</script>

<style scoped lang="scss">
@use "~/assets/style/variables" as *;

$input-pad-h: 12px;
$input-h: 42px;

.filter-box,
.country-list{
	width: 100%;
	display: grid;
}
.filter-box{
	grid-gap: 16px;
	padding: 32px 16px 16px;
	grid-template-columns: repeat(12, 1fr);
}
.country-list{
	grid-gap: 42px;
	padding: 16px;
	grid-template-columns: repeat(1, 1fr);
}

.search-box{
	background-color: var(--color-element);
	display: flex;
	align-items: center;
	height: $input-h;
	grid-column: span 12;
	border-radius: 4px;
	overflow: hidden;
	padding-left: $input-pad-h;
	padding-right: $input-pad-h;
	color: var(--color-input);
}
.search-box__input{
	height: 100%;
	flex-grow: 1;
	padding-left: $input-pad-h;
	padding-right: $input-pad-h;
}

.region-select{
	grid-column: span 12;
	height: $input-h;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: var(--color-element);
	border-radius: 4px;
	position: relative;
}
.region-select__input{
	height: 100%;
	width: 100%;
	padding-left: $input-pad-h;
	padding-right: $input-pad-h;
	z-index: 2;
	background-color: transparent;
}
.region-select__input option{
	background-color: var(--color-element);
	color: var(--color-input);
}
.region-select__icon{
	position: absolute;
	right: $input-pad-h;
	top: calc((#{$input-h} - 32px) / 2);
}
.region-select__close{
	position: absolute;
	right:calc(#{$input-pad-h} + 32px);
	top: calc((#{$input-h} - 32px) / 2);
	z-index: 3;
}

.sort-btn{
	justify-content: space-between;
	grid-column: span 12;
	height: $input-h;
	text-transform: capitalize;
}
.sort-btn__name{
	margin-inline-end: 8px;
	color: var(--color-input);
}

.auto-pagination{
	width: 100%;
	height: 12px;
}

.no-country{
	width: 100%;
	text-align: center;
	text-transform: capitalize;
	font-size: 18px;
}

@media #{map-get($display-breakpoints, 'sm-and-up')} {
	.country-list{
		grid-template-columns: repeat(2, 1fr);
	}
	.region-select{
		grid-column: span 6;
	}
	.sort-btn{
		grid-column: span 6;
	}
}

@media #{map-get($display-breakpoints, 'md-and-up')} {
	.country-list{
		grid-template-columns: repeat(3, 1fr);
	}
	.search-box{
		grid-column: span 6;
	}
	.region-select{
		grid-column: span 3;
	}
	.sort-btn{
		grid-column: span 3;
	}
}

@media #{map-get($display-breakpoints, 'lg-and-up')} {
	.country-list{
		grid-template-columns: repeat(4, 1fr);
	}
	.search-box{
		grid-column: span 6;
	}
	.region-select{
		grid-column: 9 / span 2;
	}
	.sort-btn{
		grid-column: span 2;
	}
}
</style>
