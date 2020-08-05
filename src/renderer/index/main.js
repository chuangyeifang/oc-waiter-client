import Vue from 'vue'
import store from './store'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/workstand.css'

import Components from '@/components/index'
import Plugin from '@/plugin/index'

import contentmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'

import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

import Workstand from './workstand.vue'

Vue.config.productionTip = false

Vue.use(Element, { size: 'small' })
Vue.use(Viewer)
Vue.use(Components)
Vue.use(Plugin)
Vue.use(contentmenu)

Viewer.setDefaults({
  title: false,
  zIndex: 9999,
  zIndexInline: 9999,
  toolbar: {
    zoomIn: 4,
    zoomOut: 4,
    reset: 4,
    rotateRight: 4
  },
  navbar: false
})

new Vue({
  store,
  render: h => h(Workstand)
}).$mount('#app')
