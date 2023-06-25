export default function($axios) {
	return {
		getAllCountries({
			fields = 'cca3,name,population,region,capital,flags'
		} = {}){
			return $axios.get(`/api/all`, {
				params: {
					fields
				}
			}).then(async res =>
				await Promise.all(res.data.map(async country => await this.sanitizeCountry(country)))
			)
		},
		getCountryDetails({
			fields = 'cca3,name,population,region,subregion,capital,flags,tld,borders',
			code = ''
		} = {}){
			if(!code) throw new Error('code is required');
			return $axios.get(`/api/alpha/${code}`, {
				params: {
					fields,
				}
			}).then(async res =>
				await this.sanitizeCountry(res.data)
			)
		},
		async sanitizeCountry(country){
			if(country.name){
				const langCodes = Object.keys(country.name.nativeName);
				country.name.nativeName = !langCodes.length ? null : country.name.nativeName[langCodes[0]].common
			}
			if(country.capital) country.capital = !country.capital[0] ? 'N/A' : country.capital[0]
			if(country.population) country.population = country.population.toLocaleString()

			if(country.borders && country.borders.length){
				country.borders = await this.getCountryNames({ codes: country.borders.join(',') })
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
			}).then(res => {
				return res.data.map(country => ({
					...country,
					name: country.name.common
				}));
			})
		}
	}
}
