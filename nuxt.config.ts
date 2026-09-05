// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      title: 'Ostfront 1941–1945',
      meta: [
        { name: 'description', content: 'Interaktive Karte der Ostfront im Zweiten Weltkrieg: Frontverlauf, Großschlachten, Operationen und Truppenstärken auf einem Zeitstrahl.' },
        // Private App: zusätzlich zur robots.txt auch per Meta-Tag aus dem Index halten.
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'theme-color', content: '#0a0a0a' },
      ],
    },
  },
  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['shadcn-nuxt'],
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  }
})