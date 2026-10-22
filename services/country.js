export default function($axios, env) {
	const headers = {
		Authorization: `Bearer ${env.NUXT_APP_COUNTRY_API_TOKEN}`
	};

	return {
		getAllCountries({
			fields = 'codes.alpha_3,names.common,names.native,population,region,capitals.name,flag',
			limit = 25,
			offset = 0,
			region = null,
			q = null
		} = {}){
			const params = {
				response_fields: fields,
				limit,
				offset
			};
			if(region) params.region = region;
			if(q) params.q = q;

			return $axios.get(`https://api.restcountries.com/countries/v5`, {
				headers,
				params
			}).then(async res => {
				const { objects, meta } = res.data.data;
				const countries = await Promise.all(
					objects.map(async country => await this.sanitizeCountry(country))
				);
				return { countries, meta };
			})
		},
		getCountryDetails({
			fields = 'codes.alpha_3,names.common,names.native,population,region,subregion,capitals.name,flag,tlds,borders,languages.name,currencies.name',
			code = ''
		} = {}){
			if(!code) throw new Error('code is required');
			return $axios.get(`https://api.restcountries.com/countries/v5/codes.alpha_3/${code}`, {
				headers,
				params: {
					response_fields: fields,
				}
			}).then(async res =>
				await this.sanitizeCountry(res.data.data.objects[0])
			)
		},
		async sanitizeCountry(country){
			if(country.names.native){
				const langCodes = Object.keys(country.names.native);
				country.names.native = !langCodes.length ? null : country.names.native[langCodes[0]].common
			}

			if(country.capitals) country.capital = !country.capitals[0]?.name ? 'N/A' : country.capitals[0]?.name

			if(country.languages) country.languages = country.languages.map(lang => lang.name).join(', ');

			if(country.tlds) country.tlds = Object.values(country.tlds).join(', ');

			if(country.currencies) country.currencies = country.currencies.map(curr => curr.name).join(', ');

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
			const codesArray = codes.split(',');
			return Promise.all(
				codesArray.map(countryCode => $axios.get(`https://api.restcountries.com/countries/v5/codes.alpha_3/${countryCode}`, {
					headers,
					params: {
						response_fields: fields,
					}
				}))
			).then(responses => {
				const result = []
				responses.forEach((res, resIndex) => {
					result.push({
						codes: {
							alpha_3: codesArray[resIndex],
						},
						name: res.data.data.objects[0].names.common
					});
				})
				return result;
			})
		}
	}
}
