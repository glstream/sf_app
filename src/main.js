import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persist'

import Antd from 'ant-design-vue'
// import 'ant-design-vue/dist/reset.css'
import 'primevue/resources/themes/aura-light-green/theme.css'
import PrimeVue from 'primevue/config'

import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primevue/resources/primevue.min.css' /* Deprecated */
import { Chart, registerables } from 'chart.js'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersist)

app.use(pinia)
app.use(router)
app.use(Antd)
app.use(PrimeVue)

app.mount('#app')
