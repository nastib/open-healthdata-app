// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    '@nuxt/icon',
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt'
  ],
  shadcn: {
    componentDir: './components/ui'
  },
  ssr: true, // if false use $fetch instead useFetch
  imports: {
   autoImport: true,
   dirs: [
     'composables',
     'composables/*/*.{ts,js,mjs,mts}',
     'utils',
     'stores',
     'stores/*/*.{ts,js,mjs,mts}',
     'types',
     'types/*/*.{ts,js,mjs,mts}',
     'components/ui',
     'components',
     'components/*/*.{ts,js,mjs,mts}',
     'layouts',
     'layouts/*/*.{ts,js,mjs,mts}',
     'middleware',
     'middleware/*/*.{ts,js,mjs,mts}',
     'pages',
     'pages/*/*.{ts,js,mjs,mts}',
     'plugins',
     'plugins/*/*.{ts,js,mjs,mts}',
     'server',
     'server/*/*.{ts,js,mjs,mts}',
     'utils/*/*.{ts,js,mjs,mts}',
   ]
  },
  nitro: {
    preset: 'node-server',
    // routeRules: {
    //   '/_nuxt/manifest-route-rule': { middleware: { override: true } }
    // }
  },
  experimental: {
    componentIslands: false, // Disable experimental component islands
    // routeRules: {
    //   '/_nuxt/manifest-route-rule': { override: true }
    // }
  },
  css: ['~/assets/css/main.css'],
  supabase: {
    redirect: false,
    cookies: {
      name: 'sb-auth-token',
      lifetime: 60 * 60 * 8, // 8 hours
      domain: process.env.NODE_ENV === 'production' ? 'digitlab.app' : 'localhost',
      path: '/dashboard',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
      secure: process.env.NODE_ENV === 'production',
    },
    redirectOptions: {
      login: '/login',
      callback: '/callback',
      include: undefined,
      exclude: [],
      saveRedirectToCookie: false,
    }
  },
  pwa: {
    manifest: {
      name: 'Open Healthdata App',
      short_name: 'OHDA',
      description: 'Open Healthdata Application',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: 'icons/icon_192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icons/icon_512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'icons/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
          purpose: 'apple touch icon',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            },
          },
        },
        {
          urlPattern: /\.(?:css|js)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-assets-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
            },
          },
        },
      ],
    },
    strategy: 'generateSW',
    registerType: 'autoUpdate',
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {

    BASE_URL: process.env.BASE_URL,
    public: {
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
    }
  }
})
