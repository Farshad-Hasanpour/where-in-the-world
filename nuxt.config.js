export default {
	env: {
		'GTAG_MEASUREMENT_ID': process.env.NODE_ENV === 'production' ? process.env.GTAG_MEASUREMENT_ID || '' : '',
		'NUXT_APP_COUNTRY_API_TOKEN': process.env.NUXT_APP_COUNTRY_API_TOKEN || '',
	},
	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		title: 'Where in the World',
		htmlAttrs: {
			lang: 'en'
		},
		meta: [
			{charset: 'utf-8'},
			{name: 'viewport', content: 'width=device-width, initial-scale=1'},
			{hid: 'description', name: 'description', content: ''},
			{name: 'format-detection', content: 'telephone=no'}
		],
		link: [
			{rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
		],
		bodyAttrs: {
			'data-dark': ''
		}
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [
		'~/assets/style/main.scss',
	],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
		'~/plugins/service.js',
	],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/eslint
		'@nuxtjs/eslint-module',
		'@nuxtjs/google-fonts',
		'@nuxtjs/pwa',
	],

	googleFonts: {
		families: {
			'Nunito Sans': {
				wght: [300, 600, 800],
			}
		},
		display: 'swap'
	},

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		// https://go.nuxtjs.dev/axios
		'@nuxtjs/axios',
		'v-wave/nuxt'
	],

	pwa: {
		icon: {
			purpose: 'any'
		},
		meta:{
			lang: 'en',
			theme_color: '#333'
		},
		manifest: {
			dir: 'ltr',
			lang: 'en',
		},
		workbox: false, // service worker
		oneSignal: false, //push notification
	},

	loading: {
		color: '#00b38c',
		height: '4px'
	},

	// Axios module configuration: https://go.nuxtjs.dev/config-axios
	axios: {
		// Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
		proxy: true
	},
	proxy: {
		// Target must be origin-only; path belongs in pathRewrite (http-proxy-middleware).
		'/api': {
			target: 'https://api.restcountries.com',
			pathRewrite: { '^/api': '/countries/v5' },
			changeOrigin: true
		}
	},
	server:{
		host: '0.0.0.0',
		port: 3000
	},
	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {}
}
