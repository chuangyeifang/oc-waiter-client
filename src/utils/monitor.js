export default (function() {
  var monitor = new Map()
  var client
  return {
    init: function(c) {
      client = c
    },
    start: function(item) {
      let interval
      if (item && !monitor.has(item.uid)) {
        interval = monitor.get(item.uid)
        if (interval) {
          clearInterval(interval)
          monitor.delete(item.uid)
        }
        interval = setTimeout(() => {
          timeoutTip(item)
        }, 3 * 60 * 1000)
        monitor.set(item.uid, interval)
      }
    },
    stop: function(uid) {
      if (uid) {
        const interval = monitor.get(uid)
        if (interval) {
          clearInterval(interval)
          monitor.delete(uid)
        }
      }
    },
    clearAll: function() {
      for (const interval of monitor.values()) {
        clearInterval(interval)
      }
      monitor.clear()
    }
  }

  function timeoutTip(item) {
    const timeoutTipPacket = {
      type: 'MESSAGE',
      cid: item.cid,
      to: {
        uid: item.uid,
        name: item.name,
        idy: 'CUSTOMER'
      },
      body: {
        type: 'TIMEOUT_TIP'
      }
    }
    client.sendPacket(timeoutTipPacket)
    const interval = setTimeout(() => {
      timeoutClose(item)
    }, 2 * 60 * 1000)
    monitor.set(item.uid, interval)
  }

  function timeoutClose(item) {
    const timeoutClosePacket = {
      type: 'MESSAGE',
      cid: item.cid,
      to: {
        uid: item.uid,
        name: item.name,
        idy: 'CUSTOMER'
      },
      body: {
        type: 'TIMEOUT_CLOSE'
      }
    }
    client.sendPacket(timeoutClosePacket)
    monitor.delete(item.uid)
  }
})()
