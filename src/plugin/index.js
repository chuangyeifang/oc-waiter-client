import WS from '@/websocket/ws'
import DateFormat from '@/utils/date'
import Request from '@/api/request'
import Emoji from '@/utils/emoji'

function installPlugin(Vue) {
  if (installPlugin.installed) {
    return
  }
  Vue.prototype.$_WS = WS
  Vue.prototype.$DateFormat = DateFormat
  Vue.prototype.$Request = Request
  Vue.prototype.$Emoji = Emoji
}

export default installPlugin
