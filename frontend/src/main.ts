import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vue3Toasity, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import store from './store'

createApp(App).use(router).use(store).use(Vue3Toasity,
    {
      autoClose: 1500,
      position: 'top-center',
      theme: 'dark',
      transition: 'flip',
      
    } as ToastContainerOptions,).mount('#app')
