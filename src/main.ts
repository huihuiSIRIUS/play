import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './styles/index.css'
import SectionCard from './components/SectionCard.vue'

const app = createApp(App)
app.use(ElementPlus)
app.component('SectionCard', SectionCard)
app.mount('#root')