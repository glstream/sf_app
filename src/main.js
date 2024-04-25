import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persist'

import Antd from 'ant-design-vue'
import PrimeVue from 'primevue/config'

import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primeicons/primeicons.css'

import VueGtag from 'vue-gtag'

const gtag = import.meta.env.VITE_GTAG

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersist)

app.use(pinia)
app.use(router)
app.use(Antd)
app.use(PrimeVue)
app.use(VueGtag, {
  config: { id: gtag }
})
app.use(PrimeVue, {
  unstyled: true
})

app.mount('#app')
