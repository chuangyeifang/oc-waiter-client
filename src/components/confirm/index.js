import confirmVue from './confirm.vue'
import Vue from 'vue'

const defaults = {
  show: false,
  title: '提示',
  text: '确认执行此操作吗？',
  submitValue: '确认',
  cancelValue: '取消'
}

var ConfirmVueConstructor = Vue.extend(confirmVue)

const confirmBox = (options = {}) => {
  if (Vue.prototype.$isServer) return
  options = Object.assign({}, defaults, options)
  const parent = document.body
  const instance = new ConfirmVueConstructor({
    el: document.createElement('div'),
    data: options
  })
  parent.appendChild(instance.$el)

  Vue.nextTick(() => {
    instance.show = true
  })

  return new Promise((resolve, reject) => {
    instance.submit = () => {
      parent.removeChild(instance.$el)
      resolve(true)
      return true
    }
    instance.cancel = () => {
      parent.removeChild(instance.$el)
      resolve(false)
      return false
    }
  })
}

confirmBox.alert = function(text) {
  return confirmBox({ text: text })
}

confirmBox.warn = function(text) {
  return confirmBox({ title: '警告', text: text })
}

export default confirmBox
