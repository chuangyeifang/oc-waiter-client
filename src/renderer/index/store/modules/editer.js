const state = {
  range: null,
  el: null
}

const getters = {}

const actions = {}

const mutations = {
  setEditer(state, el) {
    state.el = el
  },
  insert(state, content) {
    state.el.focus()
    const selection = window.getSelection()
    if (state.range) {
      selection.removeAllRanges()
      selection.addRange(state.range)
    }
    const range = selection.getRangeAt(0)
    const el = document.createElement('div')
    const frag = document.createDocumentFragment()
    el.innerHTML = content
    const node = frag.appendChild(el.firstChild)
    range.insertNode(frag)
    const newRange = document.createRange()
    newRange.setStartAfter(node)
    selection.removeAllRanges()
    selection.addRange(newRange)
  },
  replace(state, content) {
    state.el.innerHTML = content
    var range = document.createRange()
    range.selectNodeContents(state.el)
    range.collapse(false)
    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  },
  focus(state) {
    if (state.el.innerHTML) {
      var range = document.createRange()
      range.selectNodeContents(state.el)
      range.collapse(false)
      var sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    } else {
      state.el.focus()
    }
  },
  updateRange(state, range) {
    state.range = range
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
