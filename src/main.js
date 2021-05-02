import Vue from 'vue'
import App from './App.vue'
import './filters/time'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
