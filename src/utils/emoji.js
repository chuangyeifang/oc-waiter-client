const dataMap = new Map()
const data = initData(dataMap)

const emoji = {
  getEmojis() {
    return data
  },
  resolve(strs) { // 转换表情
    if (!strs) {
      return ''
    }
    let temp = strs[0]
    let result = ''
    for (let i = 1; i < strs.length; i++) {
      if (temp === '[' && strs[i] === ':') {
        i++
        const find = findEmoji(i, strs)
        result += find.stay
        i = find.i
        temp = find.temp
      } else {
        result += temp
        temp = strs[i]
      }
    }
    result += temp
    return result
  },
  adapter(str) {
    return '[:' + str + ':]'
  }
}

function findEmoji(i, strs) {
  let temp = ''
  let stay = '[:'
  let key = ''
  while (i < strs.length - 1) {
    if (strs[i] === ':' && strs[i + 1] === ']') {
      const m = dataMap.get(key)
      if (m) {
        stay = '<img style="width:25px; height:25px; cursor: pointer; vertical-align: text-bottom;" src="' + m.src + '" name="[:' + m.name + ':]" title="' + m.name + '" />'
      } else {
        stay += key + ':]'
      }
      i++
      break
    } else if (strs[i] === '[') {
      stay += key
      temp = strs[i]
      break
    } else {
      key += strs[i]
      i++
    }
  }
  return { stay: stay, temp: temp, i: i }
}

function initData(dataMap) {
  const data = [{
    'name': '笑脸',
    'src': require('../assets/emojis/笑脸.png')
  }, {
    'name': '开心',
    'src': require('../assets/emojis/开心.png')
  }, {
    'name': '大笑',
    'src': require('../assets/emojis/大笑.png')
  }, {
    'name': '爱心',
    'src': require('../assets/emojis/爱心.png')
  }, {
    'name': '飞吻',
    'src': require('../assets/emojis/飞吻.png')
  }, {
    'name': '调皮',
    'src': require('../assets/emojis/调皮.png')
  }, {
    'name': '讨厌',
    'src': require('../assets/emojis/讨厌.png')
  }, {
    'name': '笑哭',
    'src': require('../assets/emojis/笑哭.png')
  }, {
    'name': '流泪',
    'src': require('../assets/emojis/流泪.png')
  }, {
    'name': '坏笑',
    'src': require('../assets/emojis/坏笑.png')
  }, {
    'name': '流汗',
    'src': require('../assets/emojis/流汗.png')
  }, {
    'name': '汗颜',
    'src': require('../assets/emojis/汗颜.png')
  }, {
    'name': '尴尬',
    'src': require('../assets/emojis/尴尬.png')
  }, {
    'name': '流泪',
    'src': require('../assets/emojis/流泪.png')
  }, {
    'name': '冷酷',
    'src': require('../assets/emojis/冷酷.png')
  }, {
    'name': '惊恐',
    'src': require('../assets/emojis/惊恐.png')
  }, {
    'name': '惊悚',
    'src': require('../assets/emojis/惊悚.png')
  }, {
    'name': '惊讶',
    'src': require('../assets/emojis/惊讶.png')
  }, {
    'name': '大惊',
    'src': require('../assets/emojis/大惊.png')
  }, {
    'name': '大闹',
    'src': require('../assets/emojis/大闹.png')
  }, {
    'name': '发呆',
    'src': require('../assets/emojis/发呆.png')
  }, {
    'name': '犯困',
    'src': require('../assets/emojis/犯困.png')
  }, {
    'name': '心碎',
    'src': require('../assets/emojis/心碎.png')
  }, {
    'name': '酷',
    'src': require('../assets/emojis/酷.png')
  }, {
    'name': '生气',
    'src': require('../assets/emojis/生气.png')
  }, {
    'name': '闭嘴',
    'src': require('../assets/emojis/闭嘴.png')
  }, {
    'name': '睡着',
    'src': require('../assets/emojis/睡着.png')
  }, {
    'name': '奋斗',
    'src': require('../assets/emojis/奋斗.png')
  }, {
    'name': '愤怒',
    'src': require('../assets/emojis/愤怒.png')
  }, {
    'name': '瞌睡',
    'src': require('../assets/emojis/瞌睡.png')
  }, {
    'name': '难过',
    'src': require('../assets/emojis/难过.png')
  }, {
    'name': '天使',
    'src': require('../assets/emojis/天使.png')
  }, {
    'name': '无聊',
    'src': require('../assets/emojis/无聊.png')
  }, {
    'name': '骂人',
    'src': require('../assets/emojis/骂人.png')
  }, {
    'name': '点赞',
    'src': require('../assets/emojis/点赞.png')
  }, {
    'name': '懵逼',
    'src': require('../assets/emojis/懵逼.png')
  }, {
    'name': '白眼',
    'src': require('../assets/emojis/白眼.png')
  }, {
    'name': '恶魔',
    'src': require('../assets/emojis/恶魔.png')
  }, {
    'name': '感冒',
    'src': require('../assets/emojis/感冒.png')
  }, {
    'name': '爱你',
    'src': require('../assets/emojis/爱你.png')
  }, {
    'name': '呕吐',
    'src': require('../assets/emojis/呕吐.png')
  }, {
    'name': '呲牙',
    'src': require('../assets/emojis/呲牙.png')
  }]

  for (const i in data) {
    dataMap.set(data[i].name, data[i])
  }

  return data
}

export default emoji
