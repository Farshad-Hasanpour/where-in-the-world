export default function($axios, env) {
	const headers = {
		Authorization: `Bearer ${env.NUXT_APP_COUNTRY_API_TOKEN}`
	};

	return {
		getAllCountries({
			fields = 'codes.alpha_3,names.common,names.native,population,region,capitals.name,flag',
			limit = 25
		} = {}){
			return $axios.get(`https://api.restcountries.com/countries/v5`, {
				headers,
				params: {
					response_fields: fields,
					limit,
				}
			}).then(async res => {
				return await Promise.all(res.data.data.objects.map(async country => await this.sanitizeCountry(country)))
			})
		},
		getCountryDetails({
			fields = 'cca3,name,population,region,subregion,capital,flags,tld,borders,languages,currencies',
			code = ''
		} = {}){
			if(!code) throw new Error('code is required');
			return $axios.get(`/api/alpha/${code}`, {
				headers,
				params: {
					response_fields: fields,
				}
			}).then(async res =>
				await this.sanitizeCountry(res.data)
			)
		},
		async sanitizeCountry(country){
			if(country.names.native){
				const langCodes = Object.keys(country.names.native);
				country.names.native = !langCodes.length ? null : country.names.native[langCodes[0]].common
			}

			if(country.capitals) country.capital = !country.capitals[0]?.name ? 'N/A' : country.capitals[0]?.name

			if(country.languages) country.languages = Object.values(country.languages).join(', ');

			if(country.tld) country.tld = Object.values(country.tld).join(', ');

			if(country.currencies){
				country.currencies = Object.values(country.currencies).map(currency => currency.name).join(', ')
			}

			if(country.borders && country.borders.length){
				country.borders = await this.getCountryNames({ codes: country.borders.join(',') })
			}

			if(country.flag){
				country.flag = {
					alt: country.flag.description || 'country flag',
					src: country.flag.url_svg || country.flag.url_png || null
				}
			}

			return country;
		},
		getCountryNames({
			fields = 'codes.alpha_3,names.common',
			codes = ''
		} = {}){
			if(!codes) throw new Error('codes are required');
			return $axios.get(`https://api.restcountries.com/countries/v5/codes.alpha_3/${codes}`, {
				headers,
				params: {
					response_fields: fields,
				}
			}).then(res => {
				if (!res.data.data.objects.length) return codes.map(code => ({
					codes: {
						alpha_3: code
					},
					name: code
				}))

				return res.data.data.objects.map(country => ({
					...country,
					name: country.name.common
				}));
			})
		}
	}
}
