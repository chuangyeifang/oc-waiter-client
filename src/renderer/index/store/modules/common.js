import Request from '@/api/request.js'
import Notice from '@/components/notice/index'

const state = {
  index: 3,
  my_order: true,
  searchInner: '',
  reverseSearchInner: '',
  showTransferBu: false,
  product: null,
  orderList: null,
  orderListCache: new Map(),
  reverseOrderList: null,
  reverseOrderListCache: new Map(),
  goodsList: null,
  footprintGoods: null,
  footprintGoodsCache: new Map(),
  customerInfos: null,
  customerInfosCache: new Map(),
  personalWords: [],
  teamWords: []
}

const getters = {}

const actions = {
  reload({ state, rootState }) {
    switch (state.index) {
      case 0:
        reLoadOrder(state, rootState)
        reReverseLoadOrder(state, rootState)
        break
      case 1:
        reLoadGoods(state, rootState)
        break
      case 2:
        reloadCustomer(state, rootState)
        break
    }
  },
  refrush({ state, rootState }) {
    switch (state.index) {
      case 0:
        state.searchInner = ''
        doLoadOrder(state, rootState).then((res) => {
          Notice.tip(res)
        }).catch(res => {
          Notice.tip(res)
        })
        state.reverseSearchInner = ''
        doLoadReverseOrder(state, rootState).then((res) => {
          Notice.tip(res)
        }).catch(res => {
          Notice.tip(res)
        })
        break
      case 1:
        doLoadGoods(state, rootState)
          .then((res) => {
            Notice.tip(res)
          })
          .catch(res => {
            Notice.tip(res)
          })
        break
      case 2:
        doLoadCustomer(state, rootState)
          .then(res => {
            Notice.tip(res)
          })
          .catch(res => {
            Notice.tip(res)
          })
        break
      case 3:
        doLoadPersonalWords(state, rootState)
          .then(res => {
            Notice.tip(res)
          })
          .catch(res => {
            Notice.tip(res)
          })
        doLoadTeamWords(state, rootState)
          .catch(res => {
            Notice.tip(res)
          })
        break
    }
  },
  searchGoods({ state, rootState }, params) {
    doSearchGoods(state, rootState, params)
  },
  loadPersonalWords({ state, rootState }) {
    doLoadPersonalWords(state, rootState).catch(res => {
      Notice.tip(res)
    })
  },
  loadTeamWords({ state, rootState }) {
    doLoadTeamWords(state, rootState).catch(res => {
      Notice.tip(res)
    })
  },
  updateOrder({ state, rootState }, params) {
    updateSingleOrder(state, rootState, params).catch(res => {
      Notice.tip(res)
    })
  },
  searchOrder({ state, rootState }, key) {
    doLoadOrder(state, rootState, key).catch(res => {
      Notice.tip(res)
    })
  },
  searchReverseOrder({ state, rootState }, params) {
    doLoadReverseOrder(state, rootState, params).catch(res => {
      Notice.tip(res)
    })
  }
}

const mutations = {
  switchTab(state, index) {
    state.index = index
  }
}

function updateSingleOrder(state, rootState, params) {
}

function doLoadOrder(state, rootState, orderCode) {
}

function reLoadOrder(state, rootState) {
}

function doLoadReverseOrder(state, rootState, key) {
}

function reReverseLoadOrder(state, rootState) {
  const chatInfo = rootState.chat.chatInfo
  if (chatInfo && chatInfo.uid) {
    const reverseOrderList = state.reverseOrderListCache.get(chatInfo.uid)
    if (reverseOrderList) {
      state.reverseOrderList = reverseOrderList
    } else {
      doLoadReverseOrder(state, rootState).catch(res => {})
    }
  } else {
    state.reverseOrderList = null
  }
}

function doLoadGoods(state, rootState) {
}

function reLoadGoods(state, rootState) {
}

function doLoadCustomer(state, rootState) {
}

function reloadCustomer(state, rootState) {
}

function doSearchGoods(state, rootState, params) {

}

function doLoadPersonalWords(state, rootState) {

}

function doLoadTeamWords(state, rootState) {
  return new Promise((resolve, reject) => {
    Request.post('/term/tree', { type: 0 }).then(res => {
      res = JSON.parse(res)
      if (res && res.rc === 0) {
        const data = res.data
        if (data) {
          for (let i = 0; i < data.length; i++) {
            data[i].show = false
          }
        }
        state.teamWords = data
        resolve('加载话术成功')
      } else {
        resolve(res.rm)
      }
      return null
    }).catch(res => {
      resolve('加载团队话术失败')
      return null
    })
  })
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
