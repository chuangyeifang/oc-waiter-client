import Vue from 'vue'
import notice from './Notice.vue'

const defaults = {
  text: '',
  time: 1.5,
  show: false,
  site: 'center'
}

var NoticeConstructor = Vue.extend(notice)

const NoticeTip = (options = {}) => {
  if (Vue.prototype.$isServer) return
  options = Object.assign({}, defaults, options)
  const parent = document.body
  const instance = new NoticeConstructor({
    el: document.createElement('div'),
    data: options
  })
  parent.appendChild(instance.$el)

  Vue.nextTick(() => {
    instance.show = true
    setTimeout(() => {
      instance.show = false
      parent.removeChild(instance.$el)
    }, options.time * 1000)
  })
}

NoticeTip.info = function(text) {
  NoticeTip({ text: text })
}

NoticeTip.error = function(text) {
  NoticeTip({ text: text })
}

NoticeTip.top = function(text) {
  NoticeTip({ text: text, site: 'top-center' })
}

NoticeTip.tip = function(text) {
  NoticeTip({ text: text, site: 'center' })
}

NoticeTip.bottom = function(text) {
  NoticeTip({ text: text, site: 'bottom-center' })
}

export default NoticeTip
