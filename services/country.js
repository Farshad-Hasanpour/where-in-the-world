export default function($axios, env) {
	const config = {
		headers: {
			Authorization: `Bearer ${env.NUXT_APP_COUNTRY_API_TOKEN}`
		}
	};

	return {
		getAllCountries({
			fields = 'cca3,name,population,region,capital,flags'
		} = {}){
			return $axios.get(`/api/all`, {
				params: {
					fields
				}
			}, config).then(async res =>
				await Promise.all(res.data.map(async country => await this.sanitizeCountry(country)))
			)
		},
		getCountryDetails({
			fields = 'cca3,name,population,region,subregion,capital,flags,tld,borders,languages,currencies',
			code = ''
		} = {}){
			if(!code) throw new Error('code is required');
			return $axios.get(`/api/alpha/${code}`, {
				params: {
					fields,
				}
			}, config).then(async res =>
				await this.sanitizeCountry(res.data)
			)
		},
		async sanitizeCountry(country){
			if(country.name){
				const langCodes = Object.keys(country.name.nativeName);
				country.name.nativeName = !langCodes.length ? null : country.name.nativeName[langCodes[0]].common
			}

			if(country.capital) country.capital = !country.capital[0] ? 'N/A' : country.capital[0]

			if(country.languages) country.languages = Object.values(country.languages).join(', ');

			if(country.tld) country.tld = Object.values(country.tld).join(', ');

			if(country.currencies){
				country.currencies = Object.values(country.currencies).map(currency => currency.name).join(', ')
			}

			if(country.borders && country.borders.length){
				country.borders = await this.getCountryNames({ codes: country.borders.join(',') })
			}

			if(country.flags){
				country.flag = {
					alt: country.flags.alt || 'country flag',
					src: country.flags.svg || country.flags.png || null
				}
				delete country.flags;
			}

			return country;
		},
		getCountryNames({
			fields = 'cca3,name',
			codes = ''
		} = {}){
			if(!codes) throw new Error('codes are required');
			return $axios.get(`/api/alpha`, {
				params: {
					fields,
					codes
				}
			}, config).then(res => {
				return res.data.map(country => ({
					...country,
					name: country.name.common
				}));
			})
		}
	}
}
