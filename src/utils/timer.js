export default (function() {
  var timers = new Map()
  return {
    start: function(item) {
      if (item && item.isOnline && !timers.has(item.uid)) {
        const interval = setInterval(() => {
          item.seconds = item.seconds + 1
          if (item.seconds > 60) {
            item.timeUnit = 'm'
          } else if (item.seconds === 3600) {
            item.timeUnit = 'h'
          } else {
            item.timeUnit = 's'
          }
          switch (item.timeUnit) {
            case 's':
              item.waitTime = item.seconds
              break
            case 'm':
              item.waitTime = parseInt(item.seconds / 60)
              break
            case 'h':
              item.waitTime = parseInt(item.seconds / 3600)
              break
          }
        }, 1000)
        timers.set(item.uid, interval)
      }
    },
    stop: function(item) {
      item.seconds = 0
      item.waitTime = 0
      const interval = timers.get(item.uid)
      if (interval) {
        clearInterval(interval)
      }
      timers.delete(item.uid)
    },
    clearAll: function() {
      for (const interval of timers.values()) {
        clearInterval(interval)
      }
      timers.clear()
    }
  }
})()
