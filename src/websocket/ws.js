const imConfig = require('../im.config.js')
import Common from '../utils/common.js'
const Base64 = require('js-base64').Base64
const globalSession = require('electron').remote.getGlobal('session')

const instance = function() {
  var _WS
  const timer = {}
  const listener = {}
  const infos = Base64.decode(globalSession.token).split('=')[0].split('|')
  const session = {
    waiterName: infos[0],
    waiterCode: infos[1],
    tenantCode: infos[2],
    teamCode: infos[3],
    status: globalSession.status,
    token: globalSession.token,
    uri: getUri()
  }
  const wsManage = {
    active: true,
    reconnect: false,
    status: 0,
    retryCnt: 0,
    retryCntLimit: 3,
    retryDelayTime: 3000
  }

  return {
    connect(callback) {
      listener.callback = callback
      if (wsManage.status === 1) {
        listener.callback({
          rc: 1001,
          rm: '已经登录'
        })
      } else {
        const loginPacket = {
          type: 'AUTH',
          ts: 'WEBSOCKET',
          from: {
            idy: 'WAITER'
          },
          body: {
            type: 'LOGIN',
            content: JSON.stringify({
              status: session.status,
              token: encodeURIComponent(session.token)
            })
          }
        }
        _WS = new WebSocket(session.uri + JSON.stringify(loginPacket))
        _WS.onopen = onOpen
        _WS.onmessage = onMessage
        _WS.onclose = onClose
        _WS.onerror = onError
      }
    },
    registerListener(openListener, messagelistener, noticeListener) {
      listener.openListener = openListener
      listener.messagelistener = messagelistener
      listener.noticeListener = noticeListener
    },
    transferByWaiter(item, params) {
      const transferInfo = {
        uid: item.uid,
        name: item.name,
        ttc: item.tenantCode,
        tmc: params.teamCode,
        skc: params.skillCode,
        skn: params.skillName,
        toWc: params.waiterCode,
        toWn: params.waiterName,
        fromWc: session.waiterCode,
        FromWn: session.waiterName,
        reason: params.reason ? params.reason : '无'
      }
      const transformPacket = {
        type: 'TRANSFER',
        body: {
          type: 'TRANSFER_WAITER',
          content: JSON.stringify(transferInfo)
        }
      }
      return doSend(transformPacket)
    },
    transferByTeam(item, params) {
      const transferInfo = {
        uid: item.uid,
        name: item.name,
        ttc: item.tenantCode,
        tmc: params.teamCode,
        skc: params.skillCode,
        skn: params.skillName,
        fromWc: session.waiterCode,
        FromWn: session.waiterName,
        reason: params.reason ? params.reason : '无'
      }
      const transformPacket = {
        type: 'TRANSFER',
        body: {
          type: 'TRANSFER_TEAM',
          content: JSON.stringify(transferInfo)
        }
      }
      return doSend(transformPacket)
    },
    inviteEvaluate: function(uid) {
      const inviteEvaluatePacket = {
        type: 'EVALUATE',
        to: {
          uid: uid,
          idy: 'CUSTOMER'
        },
        body: {
          type: 'TEXT',
          content: '客服邀请评价'
        }
      }
      return doSend(inviteEvaluatePacket)
    },
    reception: function() {
      const receptionPacket = {
        type: 'RECEPTION'
      }
      return doSend(receptionPacket)
    },
    revocation: function(uid, cid, pid) {
      const revocationPacket = {
        type: 'REVOCATION',
        pid: pid,
        cid: cid,
        to: {
          uid: uid,
          idy: 'CUSTOMER'
        }
      }
      return doSend(revocationPacket)
    },
    changeStatus(status) {
      if (session.status !== status) {
        session.status = status
        const changeStatusPacket = {
          type: 'CHANGE_STATUS',
          body: {
            content: status
          }
        }
        return doSend(changeStatusPacket)
      }
    },
    sendMessage(params) {
      const item = params.item
      const messagePacket = {
        pid: params.pid,
        type: 'MESSAGE',
        cid: item.cid,
        to: {
          uid: item.uid,
          name: item.name,
          idy: 'CUSTOMER'
        },
        body: {
          type: params.bodyType,
          content: params.body
        }
      }
      return doSend(messagePacket)
    },
    sendPacket(packet) {
      return doSend(packet)
    },
    closeChat(uid) {
      const closeChatPacket = {
        type: 'CLOSE_CHAT',
        to: {
          uid: uid,
          idy: 'CUSTOMER'
        },
        body: {
          type: 'TEXT',
          content: '客服关闭会话'
        }
      }
      return doSend(closeChatPacket)
    },
    getWaiterName() {
      return session.waiterName
    },
    getWaiterCode() {
      return session.waiterCode
    },
    getStatus() {
      return session.status
    },
    disconnect() {
      _WS.close()
    }
  }

  function onOpen() {
    wsManage.status = 1
    listener.callback({
      rc: 1000,
      rm: '成功'
    })
    doSend({
      type: 'BIND',
      ts: 'WEBSOCKET'
    })
  }

  function onMessage(message) {
    const packet = JSON.parse(message.data)
    switch (packet.type) {
      case 'RE_LOGIN':
        wsManage.active = true
        wsManage.status = 2
        clearInterval(timer.startCheckHeartInterval)
        clearInterval(timer.startPongTimeout)
        _WS.close()
        listener.noticeListener({
          rc: 1002,
          rm: '账号已在其他客户端进行登录，如非本人操作，请尽快修改密码，必要时请联系技术人员！'
        })
        break
      case 'BIND':
        startCheckHeart()
        listener.openListener({
          rc: 1000,
          rm: '服务开启成功'
        })
        break
      case 'PONG':
        startPongTimeout()
        break
      case 'TRANSFER':
      case 'BROADCAST':
      case 'BUILD_TRANSFER_CHAT':
        listener.messagelistener(packet)
        break
      case 'CLOSE_CHAT':
        listener.messagelistener(packet)
        break
      case 'MESSAGE':
        listener.messagelistener(packet)
        break
      default:
        listener.messagelistener(packet)
    }
  }

  function onClose(event) {
    if (!wsManage.active) {
      stopCheckHeart()
      stopPongTimeout()
      return
    }
    if (wsManage.status === 0) {
      listener.callback({
        rc: 1006,
        rm: '与服务器通讯失败，请与技术人员联系'
      })
      return
    }
    // 断线重连
    if (wsManage.status === 2) {
      wsManage.status = 0
      return
    }
    // 如果服务不可用 进行断线重连
    if (_WS.readyState === 3) {
      wsManage.status = 3
      stopCheckHeart()
      stopPongTimeout()
      reconnect()
    }
  }

  function onError(error) {
    console.log(error)
  }

  function startPongTimeout() {
    clearTimeout(timer.pongTimeout)
    timer.pongTimeout = setTimeout(() => {
      stopCheckHeart()
      _WS.close()
      listener.noticeListener({
        rc: 1001,
        rm: '服务器60秒无响应，触发断线重连'
      })
    }, 35000)
  }

  function stopPongTimeout() {
    clearTimeout(timer.pongTimeout)
  }

  function startCheckHeart() {
    clearInterval(timer.startCheckHeartInterval)
    timer.startCheckHeartInterval = setInterval(() => {
      var startCheckHeartPacket = {
        type: 'PING',
        to: {
          idy: 'SYS'
        },
        body: {
          type: 'TEXT',
          content: 'PING'
        }
      }
      return doSend(startCheckHeartPacket)
    }, 30000)
  }

  function stopCheckHeart() {
    clearInterval(timer.startCheckHeartInterval)
  }

  function reconnect() {
    let retryCnt = wsManage.retryCnt
    if (retryCnt > wsManage.retryCntLimit) {
      wsManage.status = 0
      listener.noticeListener({
        rc: 1003,
        rm: '与服务器断开连接，请检测网络是否可用或联系技术人员！'
      })
      return
    }
    wsManage.retryCnt = ++retryCnt
    setTimeout(_ => {
      client.connect(res => {
        if (res.rc === 1000) {
          wsManage.retryCnt = 0
          return true
        }
      })
    }, wsManage.retryDelayTime)
  }

  function doSend(packet) {
    if (_WS.readyState !== 1) {
      listener.noticeListener({
        rc: 1004,
        rm: '正在断线重连中，消息发送失败，请检测网络是否可用。如有问题请与技术人员联系！'
      })
      return
    }
    packet.from = {
      idy: 'WAITER',
      uid: session.waiterCode
    }
    if (!packet.pid) {
      packet.pid = Common.getPid()
    }
    if (wsManage.status === 1) {
      _WS.send(JSON.stringify(packet))
      return true
    }
    return false
  }
}
function getUri() {
  return imConfig.imServer.protocol + imConfig.imServer.host +
  ':' + imConfig.imServer.port + '/ws.io?packet='
}

const client = instance()

export default client
