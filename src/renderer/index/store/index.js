import Vue from 'vue'
import Vuex from 'vuex'
import chat from './modules/chat'
import common from './modules/common'
import editer from './modules/editer'

import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

const debug = false

const state = {}

const mutations = {}

export default new Vuex.Store({
  state,
  mutations,
  modules: {
    chat,
    common,
    editer
  },
  strict: false,
  plugins: debug ? [createLogger()] : []
})
