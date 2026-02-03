import dynamicRoutes from "./helpers/dynamicRoutes";

export default defineNuxtConfig({
	modules: [
		'@element-plus/nuxt',
		'@stefanobartoletti/nuxt-social-share',
		'@pinia/nuxt',

		'nuxt-gtag',
		['@funken-studio/sitemap-nuxt-3', {
			path: '/sitemap.xml',
			hostname: 'https://www.topskyhome.com',
			gzip: true,
			cacheTime: 1,
			exclude: [
				'/findPwd',
				'/user',
				'/user/*',
				'/user/*/*'
			],
			defaults: {
				changefreq: 'daily',
				priority: 1,
				lastmod: new Date().toISOString(),
			},
			routes: dynamicRoutes,
		}]
	],
	gtag: {
		id: 'G-HXMGCGPB0P',
		config: {
			page_title: 'TopSky Home',
			debug_mode: false
		}
	},
	elementPlus: {},
	css: [
		'/assets/styles/min.scss',
		'/assets/fonts/iconfont.css',
	],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@use "@/assets/styles/base.scss" as *;',
				},
			},
		},
		optimizeDeps: {
			include: [
				'element-plus/es/components/*/index',
				'element-plus/es/components/*/style/css',
				'element-plus/es/locale/lang/en',
				'@unhead/vue',
				'@googlemaps/js-api-loader',
				'qrcode',
				'signature_pad',
				'openai',
				'@matechat/core',
				'leaflet'
			],
		}
	},
	nitro: {
		minify: true,
		sourceMap: false,
		routeRules: {
			"/dev/chat/topsky/**": {
				proxy: "https://ai.dev.topskyhome.com/**",
			},
			"/dev/v1/**": {
				// proxy: "https://www.topskyhome.com/api/**",
				proxy: "http://172.245.108.190:8190/api/**",
				// proxy: "http://127.0.0.1:8190/api/**",
				// proxy: "http://127.0.0.1:8081/api/**",
			},
			"/dev/**": {
				proxy: "https://www.topskyhome.com/dev/**",
			},
			"/chat/v1/**": {
				proxy: "https://fastgpt.dev.topskyhome.com/api/v1/**",
			},
			"/charts/**": {
				proxy: "http://104.168.132.223:3030/api/**",
			}
		},
	},
	runtimeConfig: {
		public: {
			googleMapsApiKey: 'AIzaSyDxH0A3dLQk8h11aZy9RmdrPwiPRdv27Hk',
			baseUrl: process.env.NUXT_PUBLIC_API_BASEURL,
			fastGptApiKey: 'fastgpt-l0ibiXpwB7qMMU3lsbydYG9pQYqazzaztch9AdLLQdhXtRoP07a6R',
		},
	},
	app: {
		head: {
			title: "TopSky Home",
			meta: [
				{
					name: "description",
					content:
						"TopSky Home is a proptech company combining big data and AI in real estate with top notch one-stop real-estate services serving home buyers, sellers and investors. Our mission is to make real estate investment and transactions worry-free, cost-effective and simple.",
				},
				{
					name: "keywords",
					content: "TopSky Home",
				}
			],
		},
	},
	// module options
	socialShare: {
		baseUrl: 'https://www.topskyhome.com' // required!
		// other optional module options
	},
});