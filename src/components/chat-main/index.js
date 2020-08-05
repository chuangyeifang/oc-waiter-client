import ChatMain from './chat-main.vue'

import ChatTransfer from './chat-transfer/chat-transfer.vue'
import ChatInfo from './chat-info/chat-info.vue'
import ChatPane from './chat-pane/chat-pane.vue'
import ChatRecord from './chat-pane/chat-record.vue'
import ChatRecordDetail from './chat-pane/chat-record-detail.vue'
import ChatMessage from './chat-message/chat-message.vue'

import Vhtml from './chat-pane/v-html.vue'

import ChatEmoji from './chat-emoji/chat-emoji.vue'

function plugin(Vue) {
  if (!plugin.installed) {
    Vue.component('oc-chat-transfer', ChatTransfer)
    Vue.component('oc-chat-info', ChatInfo)
    Vue.component('oc-chat-emoji', ChatEmoji)
    Vue.component('oc-chat-message', ChatMessage)
    Vue.component('oc-chat-record', ChatRecord)
    Vue.component('oc-chat-record-detail', ChatRecordDetail)
    Vue.component('oc-chat-pane', ChatPane)
    Vue.component('oc-html', Vhtml)

    Vue.component('oc-chat-main', ChatMain)
  }
}

export default plugin
