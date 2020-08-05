import ChatList from './chat-list.vue'

import ChatContactTab from './chat-tabs/chat-contact-tab.vue'
import ChatHistoryTab from './chat-tabs/chat-history-tab.vue'
import ChatOfflineTab from './chat-tabs/chat-offline-tab.vue'
import ChatSearch from './chat-search/chat-search.vue'
import ChatContactBars from './chat-tool/chat-contact-tool.vue'

import SystemMenus from './chat-bars/menus.vue'
import MyChatRecords from './chat-bars/my-chat-records.vue'
import UpdatePassword from './chat-bars/system-menu/update-password.vue'
import About from './chat-bars/system-menu/about.vue'
import Settings from './chat-bars/system-menu/settings.vue'

function plugin(Vue) {
  if (!plugin.installed) {
    Vue.component('oc-chat-contact-bars', ChatContactBars)
    Vue.component('oc-chat-contact-tab', ChatContactTab)
    Vue.component('oc-chat-history-tab', ChatHistoryTab)
    Vue.component('oc-chat-offline-tab', ChatOfflineTab)

    Vue.component('oc-chat-search', ChatSearch)
    Vue.component('oc-upadate-password', UpdatePassword)
    Vue.component('oc-my-chat-records', MyChatRecords)
    Vue.component('oc-about', About)
    Vue.component('oc-settings', Settings)
    Vue.component('oc-system-menus', SystemMenus)

    Vue.component('oc-chat-list', ChatList)
  }
}

export default plugin
