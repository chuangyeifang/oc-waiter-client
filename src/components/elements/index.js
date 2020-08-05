import dialog from './dialog.vue'
import status from './status.vue'
import select from './select.vue'
import button from './button.vue'

function plugin(Vue) {
  if (!plugin.installed) {
    Vue.component('oc-dialog', dialog)
    Vue.component('oc-status', status)
    Vue.component('oc-select', select)
    Vue.component('oc-button', button)
  }
}

export default plugin
