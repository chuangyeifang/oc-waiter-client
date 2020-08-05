import notify from '@/utils/notify'
import timer from '@/utils/timer'
import { ipcRenderer } from 'electron'
import monitor from '@/utils/monitor.js'
import request from '@/api/request.js'

const htyLenLimit = 30
const ChatEventType = {
  addChatItem: 'addChatItem',
  reAddChatItem: 'reAddChatItem',
  searchAddChatItem: 'searchAddChatItem',
  deleteItem: 'deleteItem',
  deleteHtyItem: 'deleteHtyItem',
  shortcutSwitchItem: 'shortcutSwitchItem',
  stick: 'stick',
  sortEnter: 'sortEnter',
  sortWait: 'sortWait',
  createChatRecord: 'createChatRecord',
  closeChat: 'closeChat',
  clearOffline: 'clearOffline'
}
const state = {
  items: [],
  itemLength: 0,
  currentItem: undefined,
  htyItems: [],
  currentHtyItem: undefined,
  chatRecords: [],
  currentChatRecord: undefined,
  chatInfo: null,
  waittingCount: 0,
  tabIndex: 0,
  chatVariation: false,
  _WS: undefined,
  chatEventQueue: []
}

const getters = {}

const actions = {
  resolver(store, message) {
    const { state } = store
    if (state.tabIndex !== 0) {
      state.chatVariation = true
    }
    switch (message.type) {
      case 'BUILD_CHAT':
        resolverTypeBuildChat(store, message)
        break
      case 'MESSAGE':
        resolverTypeMessage(store, message)
        break
      case 'CLOSE_CHAT':
      case 'TIMEOUT_CLOSE':
        resolverTypeChatClose(store, message)
        break
      case 'TRANSFER':
        resolverTypeMessage(store, message)
        resolverTypeTransfer(store, message)
        break
      case 'BUILD_TRANSFER_CHAT':
        resolverTypeBuildChat(store, message)
        resolverTransferMessage(store, message)
        break
      case 'BROADCAST':
        state.waittingCount = message.body ? message.body.content : 0
        break
    }
    ipcRenderer.send('flash-frame')
  },
  switchChatTab(store, index) {
    const { state } = store
    state.tabIndex = index
    if (state.tabIndex === 0) {
      state.chatVariation = false
    }
    let chatRecord
    if (state.currentItem && state.currentHtyItem && state.currentItem.uid === state.currentHtyItem.uid) {
      chatRecord = state.chatRecords.find(item => item.uid === state.currentItem.uid)
      chatRecord.show = true
      return
    }
    if (index === 0) {
      if (state.currentItem) {
        chatRecord = state.chatRecords.find(item => item.uid === state.currentItem.uid)
        chatRecord.show = true
      }
      if (state.currentHtyItem) {
        chatRecord = state.chatRecords.find(item => item.uid === state.currentHtyItem.uid)
        chatRecord.show = false
      }
      state.chatInfo = state.currentItem
    } else if (index === 1) {
      if (state.currentItem) {
        chatRecord = state.chatRecords.find(item => item.uid === state.currentItem.uid)
        chatRecord.show = false
      }
      if (state.currentHtyItem) {
        chatRecord = state.chatRecords.find(item => item.uid === state.currentHtyItem.uid)
        chatRecord.show = true
      }
      state.chatInfo = state.currentHtyItem
    }

    reloadCommonTab(store)
  },
  createSearchChatItem(store, data) {
    const { state } = store
    const uid = data.customerCode
    const name = data.customerName
    let item = state.items.find(item => item.uid === uid)
    if (state.currentItem && item && item.uid === state.currentItem.uid) {
      return
    }
    // 如果为获取到item, 则创建会话。否则选中
    if (!item) {
      item = createHtyItem(data, uid, name)
      registerChatEvent({ store: store, item: item, type: ChatEventType.searchAddChatItem })
    } else {
      showItem(state, item, false)
      const chatRecord = createChatRecord(state, uid, name)
      chatRecord.show = true
      reloadCommonTab(store)
    }
  },
  selectedItem(store, uid) {
    const { state } = store
    const item = state.items.find(e => e.uid === uid)
    showItem(state, item, false)
    showChatRecord(state, item)
    reloadCommonTab(store)
  },
  selectedHtyItem(store, uid) {
    const { state } = store
    const item = state.htyItems.find(item => item.uid === uid)
    showItem(state, item, true)
    showChatRecord(state, item)
    reloadCommonTab(store)
  },
  closeItem(store, uid) {
    const { state } = store
    const item = state.items.find(e => e.uid === uid)
    if (item && item.isOnline) {
      const record = createCloseTip('客服关闭')
      const chatRecord = state.chatRecords.find(item => item.uid === uid)
      if (chatRecord) {
        chatRecord.data.push(record)
      }
    }
    registerChatEvent({ store: store, item: item, type: ChatEventType.deleteItem })
  },
  closeHtyItem(store, name) {
    const { state } = store
    const item = state.htyItems.find(item => item.uid === name)
    if (item) {
      registerChatEvent({ store: store, item: item, type: ChatEventType.deleteHtyItem })
    }
  },
  clearOfflineItems(store) {
    registerChatEvent({ store: store, type: ChatEventType.clearOffline })
  },
  changeSelectItem(store, arrow) {
    registerChatEvent({ store: store, arrow: arrow, type: ChatEventType.shortcutSwitchItem })
  },
  revocationPacket(store, pid) {
    const { state } = store
    return new Promise((resolve, reject) => {
      const uid = state.chatInfo.uid
      const chatRecord = state.chatRecords.find(item => item.uid === uid)
      if (chatRecord) {
        const data = chatRecord.data
        const index = data.findIndex(item => item.pid === pid)
        if (index) {
          const record = data[index]
          const t = new Date().getTime() - (record.timestamp ? record.timestamp : 0)
          if (t < 60000) {
            record.revocation = true
            resolve('撤回成功')
            return
          }
        }
      }
      reject('消息无法撤回')
      return
    })
  },
  closeActiveItems(store) {
    return new Promise((resolver, reject) => {
      const { state } = store
      for (const item of state.items) {
        if (item.isOnline) {
          state._WS.closeChat(item.uid)
        }
      }
      resolver(true)
    })
  },
  loadHtyItems(store) {
    const { state } = store
    return new Promise((resolve, reject) => {
      request.post('/chat/day', { pageSize: htyLenLimit })
        .then(res => {
          res = JSON.parse(res)
          if (res.rc === 0) {
            res.data.forEach((item) => {
              state.htyItems.push({
                uid: item.customerCode,
                name: item.customerName,
                tenantCode: item.tenantCode,
                teamCode: item.teamCode,
                skillCode: item.skillCode,
                skillName: item.skillName,
                isOnline: false,
                isSelected: false,
                isTransfer: false,
                isReal: item.isLogin === '1'
              })
            })
          }
          resolve(res.rm)
          return null
        })
        .catch(res => {
          reject('接口访问异常')
          return null
        })
    })
  },
  transferByWaiter(store, params) {
    const { state } = store
    return new Promise((resolve, reject) => {
      let result = { rc: 0, rm: '成功发送转接请求' }
      try {
        const item = state.currentItem
        if (item) {
          if (item.isOnline) {
            state._WS.transferByWaiter(item, params)
          } else {
            result = { rc: 1, rm: '客户已离开,不支持转接！' }
          }
        } else {
          result = { rc: 1, rm: '请选择正在咨询列表中客户进行操作！' }
        }
        resolve(result)
      } catch (err) {
        result = { rc: 1, rm: '转接发生错误' }
        reject(result)
      }
      return false
    })
  },
  transferByTeam(store, params) {
    const { state } = store
    return new Promise((resolve, reject) => {
      let result = { rc: 0, rm: '成功发送转接请求' }
      try {
        const item = state.currentItem
        if (item) {
          if (item.isOnline) {
            state._WS.transferByTeam(item, params)
          } else {
            result = { rc: 1, rm: '客户已离开,不支持转接！' }
          }
        } else {
          result = { rc: 1, rm: '请选择正在咨询列表中客户进行操作！' }
        }
        resolve(result)
      } catch (err) {
        result = { rc: 1, rm: '转接发生错误' }
        reject(result)
      }
      return false
    })
  },
  loadHtyChatRecord(store, uid) {
    const { state } = store
    return new Promise((resolve, reject) => {
      const chatRecord = state.chatRecords.find(item => item.uid === uid)
      const htys = chatRecord.htys
      const params = { customerCode: uid, pageNum: 1, pageSize: 10 }
      if (htys.id) {
        params.id = htys.id
      }
      request.post('/chatRecord/before', params).then(res => {
        res = JSON.parse(res)
        let result = { rc: 0, rm: '加载成功' }
        if (res.rc === 0) {
          const data = res.data
          if (data && data.length > 0) {
            if (!htys.data || htys.data.length === 0) {
              htys.data = data
            } else {
              let i
              for (i in data) {
                htys.data.unshift(data[i])
              }
              htys.id = data[i].id
            }
          } else {
            htys.more = false
          }
        } else {
          result = { rc: 1, rm: '加载历史记录失败' }
        }
        resolve(result)
        return null
      }).catch(res => {
        reject({ rc: 2, rm: '无法加载历史记录' })
        return null
      })
    })
  }
}

const mutations = {
  setWS(state, WS) {
    state._WS = WS
    monitor.init(WS)
    execChatEvent()
  },
  renderOutChatRecord(state, data) {
    data.revocation = false
    let item = state.chatInfo
    if (data.uid) {
      item = state.items.find(e => e.uid === data.uid)
    }
    if (item) {
      const chatRecord = state.chatRecords.find(e => e.uid === item.uid)
      chatRecord.data.push(data)
      timer.stop(item)
      if (item.isOnline) {
        monitor.start(item)
      } else {
        monitor.stop(item.uid)
      }
    }
  },
  sortWaitTime(state, asc) {
    registerChatEvent({ state: state, asc: asc, type: ChatEventType.sortWait })
  },
  sortEnterTime(state, asc) {
    registerChatEvent({ state: state, asc: asc, type: ChatEventType.sortEnter })
  },
  toStick(state) {
    registerChatEvent({ state: state, type: ChatEventType.stick })
  }
}

function reloadCommonTab(store) {
  const { dispatch } = store
  dispatch('common/reload', {}, { root: true })
}

function resolverTypeBuildChat(store, message) {
  const { state } = store
  const uid = message.from.uid
  const name = message.from.name
  let item = state.items.find(item => item.uid === uid)
  if (!item) {
    item = createItem(message, uid, name)
    registerChatEvent({ store: store, item: item, type: ChatEventType.addChatItem, buildChat: message.body.content })
  } else {
    item.cid = message.cid
    item.isOnline = true
    timer.start(item)
  }
}

function resolverTypeMessage(store, message) {
  const { state } = store
  const uid = message.from.uid
  const name = message.from.name
  const record = createRecordItem(store, message)
  const item = state.items.find(e => e.uid === uid)
  if (!item) {
    setTimeout(() => {
      delayResolverTypeMessage(store, uid, name, record, message)
    }, 500)
  } else {
    dealChatRecord(store, item, record, message)
  }
}

function delayResolverTypeMessage(store, uid, name, record, message) {
  const { state } = store
  let item = state.items.find(item => item.uid === uid)
  if (!item) {
    item = createItem(message, uid, name)
    registerChatEvent({ store: store, item: item, record: record, message: message, type: ChatEventType.reAddChatItem })
  } else {
    dealChatRecord(store, item, record, message)
  }
}

function showChatRecord(state, item) {
  const chatRecord = createChatRecord(state, item.uid, item.name)
  chatRecord.show = true
}

function hideChatRecord(state, uid) {
  const chatRecord = state.chatRecords.find(e => e.uid === uid)
  if (chatRecord) {
    chatRecord.show = false
  }
}

function showItem(state, item, isHty) {
  let prevItem
  if (isHty) {
    prevItem = state.currentHtyItem
    state.currentHtyItem = item
  } else {
    prevItem = state.currentItem
    state.currentItem = item
    item.count = 0
  }
  if (prevItem) {
    prevItem.isSelected = false
    hideChatRecord(state, prevItem.uid)
  }
  item.isSelected = true
  state.chatInfo = item
}

function hideItem(state, item) {
  if (state.currentItem && item.uid === state.currentItem.uid) {
    const chatRecord = state.chatRecords.find(e => e.uid === item.uid)
    if (chatRecord) {
      chatRecord.show = false
    }
    item.isSelected = false
    state.currentItem = null
    state.chatInfo = null
  }
}

function dealChatRecord(store, item, record, message) {
  const { state } = store
  const chatRecord = state.chatRecords.find(e => e.uid === item.uid)
  if (!chatRecord) {
    registerChatEvent({ store: store, item: item, record: record, type: ChatEventType.createChatRecord })
  } else {
    if (!state.currentItem || state.currentItem.uid !== item.uid) {
      item.count = item.count + 1
    }
    chatRecord.data.push(record)
    doStart(message, item)
  }
  notify.play()
}

function doStart(message, item) {
  if (message.body && message.body.type) {
    switch (message.body.type) {
      case 'TIMEOUT_TIP':
      case 'TIMEOUT_CLOSE':
        break
      default:
        timer.start(item)
        monitor.stop(item.uid)
        break
    }
  } else {
    timer.start(item)
  }
}

function resolverTransferMessage(store, message) {
  const buildChat = JSON.parse(message.body.content)
  message.body.content = buildChat.reason
  resolverTypeMessage(store, message)
}

function createCloseTip(content) {
  return {
    revocation: false,
    messageType: 'TIP',
    messages: content
  }
}

function createRecordItem(store, message) {
  let type
  let name = message.from.name
  if (message.type === 'TRANSFER') {
    type = 'robot'
    name = '客服助手'
  } else {
    switch (message.body.type) {
      case 'TEXT':
        type = 'customer'
        break
      case 'TIMEOUT_TIP':
      case 'WAITER_GREET':
      case 'TEAM_GREET':
      case 'TRANSFER':
      case 'BUILD_TRANSFER_CHAT':
      case 'TIP':
      case 'ROBOT':
        type = 'robot'
        name = '客服助手'
        break
      case 'TIMEOUT_CLOSE':
        type = 'robot'
        name = '客服助手'
        resolverTypeChatClose(store, message)
        break
      default:
        type = 'customer'
    }
  }
  return {
    name: name,
    time: message.datetime,
    revocation: false,
    messageType: message.body.type,
    messages: message.body.content,
    ownerType: type
  }
}

function resolverTypeChatClose(store, message) {
  const uid = message.from.uid
  registerChatEvent({ store: store, uid: uid, type: ChatEventType.closeChat })
}

function createItem(message, uid, name) {
  const item = {
    uid: uid,
    name: name,
    cid: message.cid,
    count: 0,
    enterTime: new Date().getTime(),
    waitTime: 0,
    seconds: 0,
    timeUnit: 's',
    isInvite: false,
    isSelected: false,
    isOnline: true,
    isStick: false,
    isTransfer: false
  }
  return item
}

function initCustomerInfo(item, content) {
  const buildChat = JSON.parse(content)
  item.tenantCode = buildChat.ttc
  item.teamCode = buildChat.tmc
  item.skillCode = buildChat.skc
  item.skillName = buildChat.skn
  item.goodsCode = buildChat.gc
  item.device = buildChat.device
  item.isReal = buildChat.login
}

function createHtyItem(data, uid, name) {
  return {
    uid: uid,
    name: name,
    cid: data.chatId,
    goodsCode: null,
    tenantCode: data.tenantCode,
    teamCode: data.teamCode,
    skillCode: data.skillCode,
    skillName: null,
    count: 0,
    enterTime: new Date().getTime(),
    waitTime: 0,
    seconds: 0,
    timeUnit: 's',
    isSelected: false,
    isOnline: false,
    isStick: false,
    isTransfer: false,
    isReal: data.isLogin === '1'
  }
}

function createChatRecord(state, uid, name) {
  let chatRecord = state.chatRecords.find(item => item.uid === uid)
  if (!chatRecord) {
    const htys = { data: [], id: undefined, more: true }
    chatRecord = { data: [], htys: htys, show: false, uid: uid, name: name }
    state.chatRecords.push(chatRecord)
  }
  return chatRecord
}

function nextHtyItemIndex(index, len, arrow) {
  if (len > 1) {
    if (arrow === 'up') {
      if (index === 0) {
        index = len - 1
      } else {
        --index
      }
    } else {
      if (index === len - 1) {
        index = 0
      } else {
        ++index
      }
    }
  }
  return index
}

function shortcutIsUp(index, len) {
  let item
  const i = index
  if (index === 0) {
    index = len - 1
  } else {
    --index
  }
  while (i !== index) {
    item = state.items[index]
    if (item.seconds > 0) {
      return index
    }
    if (index === 0) {
      index = len - 1
    } else {
      --index
    }
  }
  return index
}

function shortcutIsDown(index, len) {
  let item
  const i = index
  if (index === len - 1) {
    index = 0
  } else {
    ++index
  }
  while (i !== index) {
    item = state.items[index]
    if (item.seconds > 0) {
      return index
    }
    if (index === len - 1) {
      index = 0
    } else {
      ++index
    }
  }
  return index
}

function nextItemIndex(index, len, arrow) {
  if (len > 1) {
    if (arrow === 'up') {
      index = shortcutIsUp(index, len)
    } else {
      index = shortcutIsDown(index, len)
    }
  }
  return index
}

function resolverTypeTransfer(store, message) {
  const { state } = store
  if (message.body && message.body.type === 'SUCCESS') {
    const uid = message.from.uid
    const item = state.items.find(e => e.uid === uid)
    if (item) {
      item.isOnline = false
      timer.stop(item)
      monitor.stop(item.uid)
      const record = createCloseTip('转接关闭')
      const chatRecord = state.chatRecords.find(e => e.uid === uid)
      if (chatRecord) {
        chatRecord.data.push(record)
      }
    }
  }
}

function removeChatRecord(state, uid) {
  const item = state.items.find(item => item.uid === uid)
  if (!item) {
    const index = state.chatRecords.findIndex(item => item.uid === uid)
    if (index !== -1) {
      state.chatRecords.splice(index, 1)
    }
  }
}

function removeCommonCache(rootState, uid) {
  const s = rootState.common
  s.footprintGoodsCache.delete(uid)
  s.orderListCache.delete(uid)
  s.customerInfosCache.delete(uid)
}

function removeChatCache(state, rootState, item) {
  removeChatRecord(state, item.uid)
  removeCommonCache(rootState, item.uid)
}

function addHtyItems(store, item) {
  const hryItem = state.htyItems.find(e => e.uid === item.uid)
  if (!hryItem) {
    item.isOnline = false
    item.isSelected = false
    item.isTransfer = false
    state.htyItems.unshift(item)
  }
  dealHtyItemsOverflow(store)
}

function dealHtyItemsOverflow(store) {
  const { state, rootState } = store
  let item
  while (state.htyItems.length >= htyLenLimit) {
    item = state.htyItems.pop()
    if (state.currentHtyItem && state.currentHtyItem.uid === item.uid) {
      state.currentHtyItem = null
    }
    removeChatCache(state, rootState, item)
  }
}

function buildChatItem(event) {
  const { state } = event.store
  const item = event.item
  const uid = item.uid

  if (event.buildChat) {
    initCustomerInfo(item, event.buildChat)
  }

  createChatRecord(state, uid, item.name)

  const exsitItem = state.items.find(m => m.uid === uid)
  if (!exsitItem) {
    let site = state.items.findIndex(e => !e.isStick)
    site = site === 0 ? 0 : site
    state.items.splice(site, 0, item)
    state.itemLength = state.items.length
    return item
  }
  return exsitItem
}

function addChatItemEvent(event) {
  const item = buildChatItem(event)
  startChat(item)
}

function startChat(item) {
  if (item) {
    item.isOnline = true
    timer.start(item)
    notify.play()
  }
}

function reAddChatItemEvent(event) {
  const item = buildChatItem(event)
  startChat(item)
  dealChatRecord(event.store, event.item, event.record, event.message)
}

function searchAddChatItemEvent(event) {
  const { state } = event.store
  const item = buildChatItem(event)
  const chatRecord = createChatRecord(state, item.uid, item.name)
  chatRecord.show = true
  showItem(state, item, false)
  state.currentItem = item
}

function doCreateChatRecordEvent(event) {
  const state = event.state
  const item = event.item
  const record = event.record
  const chatRecord = createChatRecord(state, item.uid, name)

  chatRecord.data.push(record)

  let exsitItem = state.items.find(m => m.uid === item.uid)
  if (!exsitItem) {
    exsitItem = item
    let site = state.items.findIndex(e => !e.isStick)
    site = site === 0 ? 0 : site
    state.items.splice(site, 0, item)
    state.itemLength = state.items.length
    item.isOnline = true
    timer.start(item)
  }
  if (!state.currentItem || state.currentItem.uid !== item.uid) {
    exsitItem.count = exsitItem.count + 1
  }
}

function deleteChatItemEvent(event) {
  const { state } = event.store
  const item = event.item
  item.isSelected = false
  const findIndex = state.items.findIndex(e => e.uid === item.uid)
  if (findIndex !== -1) {
    state.items.splice(findIndex, 1)
    hideItem(state, item)
    addHtyItems(event.store, item)
    hideChatRecord(state, item.uid)
    state.itemLength = state.items.length
  }
  timer.stop(item)
  monitor.stop(item.uid)
  reloadCommonTab(event.store)
}

function deleteHtyChatItemEvent(event) {
  const { state, rootState } = event.store
  const item = event.item
  const findIndex = state.htyItems.findIndex(e => e.uid === item.uid)
  if (findIndex !== -1) {
    state.htyItems.splice(findIndex, 1)
    if (state.currentHtyItem && item.uid === state.currentHtyItem.uid) {
      state.currentHtyItem = null
      state.chatInfo = null
      hideChatRecord(state, item.uid)
    }
    removeChatCache(state, rootState, item)
  }
  reloadCommonTab(event.store)
}

function doShortcutSwitchItemEvent(event) {
  const { state } = event.store
  let nextItem
  let index
  let nextIndex
  if (state.tabIndex === 0) {
    if (state.currentItem) {
      index = state.items.findIndex(item => item.uid === state.currentItem.uid)
      index = index === -1 ? 0 : index
      const len = state.items.length
      nextIndex = nextItemIndex(index, len, event.arrow)
      if (nextIndex === index) {
        return
      }
      nextItem = state.items[nextIndex]
      state.currentItem.isSelected = false
      hideChatRecord(state, state.currentItem.uid)
    } else {
      if (state.items.length > 0) {
        nextItem = state.items[0]
      } else {
        return
      }
    }
    state.currentItem = nextItem
    showItem(state, nextItem, false)
  } else if (state.tabIndex === 1) {
    if (state.currentHtyItem) {
      index = state.htyItems.findIndex(item => item.uid === state.currentHtyItem.uid)
      index = index === -1 ? 0 : index
      const len = state.htyItems.length
      nextIndex = nextHtyItemIndex(index, len, event.arrow)
      if (nextIndex === index) {
        return
      }
      nextItem = state.htyItems[nextIndex]
      state.currentHtyItem.isSelected = false
      hideChatRecord(state, state.currentHtyItem.uid)
    } else {
      if (state.htyItems.length > 0) {
        nextItem = state.htyItems[0]
      } else {
        return
      }
    }
    state.currentHtyItem = nextItem
    showItem(state, nextItem, true)
  }
  if (nextItem) {
    showChatRecord(state, nextItem)
  }
  reloadCommonTab(event.store)
}

function doSortEnterTimeEvent(event) {
  const state = event.state
  const asc = event.asc
  const result = asc ? -1 : 1
  const stickItems = []
  const leaveItems = []
  const items = []
  // 整理状态
  for (const item of state.items) {
    if (item.isStick) {
      stickItems.push(item)
    } else if (!item.isOnline) {
      leaveItems.push(item)
    } else {
      items.push(item)
    }
  }
  items.sort((a, b) => {
    if (a.enterTime > b.enterTime) {
      return result
    } else {
      return -result
    }
  })
  state.items = stickItems.concat(items).concat(leaveItems)
}

function doSortWaitTimeEvent(event) {
  const state = event.state
  const asc = event.asc
  const result = asc ? -1 : 1
  const stickItems = []
  const leaveItems = []
  const items = []
  // 整理状态
  for (const item of state.items) {
    if (item.isStick) {
      stickItems.push(item)
    } else if (!item.isOnline) {
      leaveItems.push(item)
    } else {
      items.push(item)
    }
  }
  items.sort((a, b) => {
    if (a.seconds > b.seconds) {
      return result
    } else {
      return -result
    }
  })
  state.items = stickItems.concat(items).concat(leaveItems)
}

function doToStickEvent(event) {
  const state = event.state
  state.chatInfo.isStick = !state.chatInfo.isStick
  const index = state.items.findIndex(item => item.uid === state.currentItem.uid)
  state.items.splice(index, 1)
  if (state.chatInfo.isStick) {
    state.items.unshift(state.chatInfo)
  } else {
    state.items.push(state.chatInfo)
  }
}

function doCloseChatEvent(event) {
  const { state } = event.store
  const uid = event.uid
  monitor.stop(uid)
  const item = state.items.find(item => item.uid === uid)
  if (item) {
    item.isOnline = false
    timer.stop(item)
    const record = createCloseTip('客户关闭')
    const chatRecord = state.chatRecords.find(item => item.uid === uid)
    if (chatRecord) {
      chatRecord.data.push(record)
    }
  }
  reloadCommonTab(event.store)
}

function doClearOffineEvent(event) {
  const { state } = event.store
  let item
  const len = state.items.length - 1
  for (let i = len; i >= 0; i--) {
    item = state.items[i]
    if (!item.isOnline) {
      state.items.splice(i, 1)
      if (state.currentItem && item.uid === state.currentItem.uid) {
        state.currentItem = null
        state.chatInfo = null
        hideChatRecord(state, item.uid)
      }
      addHtyItems(event.store, item)
    }
  }
  dealHtyItemsOverflow(event.store)
  state.itemLength = state.items.length
  reloadCommonTab(event.store)
}

function registerChatEvent(event) {
  state.chatEventQueue.unshift(event)
}

function execChatEvent() {
  if (execChatEvent.timeout) {
    clearTimeout(execChatEvent.timeout)
  }
  let event = state.chatEventQueue.pop()
  while (event) {
    switch (event.type) {
      case ChatEventType.addChatItem:
        addChatItemEvent(event)
        break
      case ChatEventType.reAddChatItem:
        reAddChatItemEvent(event)
        break
      case ChatEventType.searchAddChatItem:
        searchAddChatItemEvent(event)
        break
      case ChatEventType.deleteItem:
        deleteChatItemEvent(event)
        break
      case ChatEventType.deleteHtyItem:
        deleteHtyChatItemEvent(event)
        break
      case ChatEventType.shortcutSwitchItem:
        doShortcutSwitchItemEvent(event)
        break
      case ChatEventType.stick:
        doToStickEvent(event)
        break
      case ChatEventType.sortEnter:
        doSortEnterTimeEvent(event)
        break
      case ChatEventType.sortWait:
        doSortWaitTimeEvent(event)
        break
      case ChatEventType.createChatRecord:
        doCreateChatRecordEvent(event)
        break
      case ChatEventType.closeChat:
        doCloseChatEvent(event)
        break
      case ChatEventType.clearOffline:
        doClearOffineEvent(event)
        break
    }
    event = state.chatEventQueue.pop()
  }
  execChatEvent.timeout = setTimeout(execChatEvent, 200)
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
