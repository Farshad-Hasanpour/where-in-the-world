import countryService from '~/services/country';

export default ({ $axios, env }, inject) => {
	const services = {
		countryService: countryService($axios, env),
	};
	const serviceNames = Object.keys(services);
	serviceNames.forEach((serviceName) => {
		inject(serviceName, services[serviceName]);
	});
}
