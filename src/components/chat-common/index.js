import ChatCommon from './chat-common.vue'
import CommonTermTab from './chat-common-tabs/common-term-tab.vue'
import CommonCustomerTab from './chat-common-tabs/common-customer-tab.vue'

function plugin(Vue) {
  if (!plugin.installed) {
    Vue.component('oc-common-term-tab', CommonTermTab)
    Vue.component('oc-common-customer-tab', CommonCustomerTab)

    Vue.component('oc-chat-common', ChatCommon)
  }
}

export default plugin
