import chatListComponents from './chat-list/index.js'
import chatMainComponents from './chat-main/index.js'
import chatCommonComponents from './chat-common/index.js'

import Elements from './elements/index.js'
import Confirm from './confirm/index'
import Notice from './notice/index'

function plugin(Vue) {
  if (!plugin.installed) {
    Vue.use(chatListComponents)
    Vue.use(chatMainComponents)
    Vue.use(chatCommonComponents)
    Vue.use(Elements)
    Vue.prototype.$_Confirm = Confirm
    Vue.prototype.$_Notice = Notice
  }
}

export default plugin
