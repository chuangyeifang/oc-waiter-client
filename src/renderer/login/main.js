import Vue from 'vue'
import Login from './login.vue'

import Status from '@/components/elements/status'
import Notice from '@/components/notice/index'

Vue.config.productionTip = false

Vue.component('oc-status', Status)

Vue.prototype.$_Notice = Notice

new Vue({
  render: h => h(Login)
}).$mount('#app')
