<template>
  <div class="html-box">
    <div v-if="reversedMessage.type == 'LOGISTICS'" class="html-item">
      <div style="padding-bottom: 10px;">以下是您最新的物流动态：</div>
      <div
        v-for="(item, index) in reversedMessage.data"
        :key="'lcs' + index"
        style="padding-bottom: 5px;"
      >
        <div style="line-height: 18px;">{{ item.lgtime }}</div>
        <div style="max-width: 360px;line-height: 18px;">{{ item.lgdesc }}</div>
      </div>
    </div>
    <div v-else-if="reversedMessage.type == 'IMAGE'" class="html-item">
      <div class="chat-body-image">
        <img :src="reversedMessage.data">
      </div>
    </div>
    <div v-else-if="reversedMessage.type == 'GOODS'" class="html-item">
      <div @click="openGoodsUrl(reversedMessage.data.pcUrl)">
        <div class="goods-name">{{ reversedMessage.data.name }}</div>
      </div>
    </div>
    <div v-else-if="reversedMessage.type == 'ORDER'" class="html-item">
      <div class="order-theme">
        <div class="order-title">
          <div class="item-lable">订单号：</div>
          <div class="item-content">{{ reversedMessage.data.orderCode }}</div>
          <div class="item-lable" style="padding-left: 10px;">下单时间：</div>
          <div class="item-content">{{ reversedMessage.data.orderTime }}</div>
          <div class="item-content" style="font-weight: bold; float:right; padding-right: 2px;" >{{ reversedMessage.data.orderStatusInfo }}</div>
        </div>
        <div class="order-detail">
          <div class="prd-pic">
            <img :src="transUrl(reversedMessage.data.prdInfo.prdImgUrl)">
          </div>
          <div class="prd-info">
            <div class="prd-name" @click="prdDetail(reversedMessage.data.prdInfo)" :title="reversedMessage.data.prdInfo.prdName">{{ reversedMessage.data.prdInfo.prdName }}</div>
            <div class="prd-price">
              <div class="item-lable" style="padding-left: 5px;">商品编号：</div>
              <div class="item-content">{{ reversedMessage.data.prdInfo.prdCode }}</div>
            </div>
            <div class="prd-price">
              <div class="item-lable" style="padding-left: 5px;">数量：</div>
              <div class="item-content">{{ reversedMessage.data.prdInfo.prdAcount }}</div>
              <div class="item-content" style="color: black; font-weight: bold; padding-left: 15px;">{{ '￥' + reversedMessage.data.orderAmount }}</div>
            </div>
          </div>
        </div>
        <div class="order-info">
          <div class="item-lable">{{ '共 ' + reversedMessage.data.orderAcount + ' 件' }}</div>
          <div class="item-lable" style="padding-left: 10px;">订单金额：</div>
          <div class="item-content" style="color: red; font-weight: bold;">{{ '￥' + reversedMessage.data.orderAmount }}</div>
          <div class="item-button" title="搜索">
            <i class="order-search" @click="searchOrder(reversedMessage.data.orderCode)" />
          </div>
        </div>
      </div>
    </div>
    <div v-else ref="normalMsgRef" class="html-item">
      <div class="html-content" v-html="reversedMessage.data" />
    </div>
  </div>
</template>

<script>
const { shell,ipcRenderer } = require('electron')
const regex = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=#]*)?$/
const arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' }
export default {
  props: {
    message: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    reversedMessage: function() {
      const data = {}
      const content = this.message.messages
      switch (this.message.messageType) {
        case '2':
        case 'IMAGE':
          data.type = 'IMAGE'
          data.data = content
          break
        case '10':
        case 'GOODS':
          data.type = 'GOODS'
          data.data = JSON.parse(content)
          break
        case '11':
        case 'ORDER':
          data.type = 'ORDER'
          data.data = JSON.parse(content)
          break
        case '12':
        case 'LOGISTICS':
          data.type = 'LOGISTICS'
          data.data = JSON.parse(content)
          break
        case 'FAIL':
          data.type = 'NORMAL'
          data.data = content
          break
        default:
          data.type = 'NORMAL'
          data.data = this.resolveMsg(content)
      }
      return data
    }
  },
  mounted() {
    const refEl = this.$refs.normalMsgRef
    if (refEl) {
      const aTags = refEl.getElementsByClassName('a-link')
      for (let i = 0; i < aTags.length; i++) {
        const el = aTags[i]
        let url = el.innerHTML
        el.onclick = function() {
          url = url.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) { return arrEntities[t] })
          shell.openExternal(url)
        }
      }
    }
  },
  methods: {
    searchOrder(item) {
      // 切换到订单页面
      this.$store.state.common.index = 0
      this.$store.state.common.my_order = true
      this.$store.state.common.searchInner = item
      this.$store.dispatch('common/searchOrder', item)
    },
    openGoodsUrl: function(url) {
      shell.openExternal(url)
    },
    resolveMsg: function(content) {
      // 去除多余空行
      var chars = content.replace(/[\s| | ]*\r/gi, ' ')
      chars = content.replace(/<(?!br([/]*)>)[^>]*>/gi, '')
      var dealMsg = ''
      var url = ''
      for (let i = 0; i < chars.length; i++) {
        const char = chars.charAt(i)
        const charCode = char.charCodeAt()
        // 如果非英文字符，则判断是否超链接， 否则拼接链接
        if (charCode > 255 || char === ' ') {
          if (url && url.length > 8 && url.substr(0, 4) === 'http') {
            url = url.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) { return arrEntities[t] })
            if (url && regex.test(url)) {
              url = '<span class="a-link" ' +
                                'style="color: #0000FF; cursor: pointer; text-decoration: underline;">' +
                                url + '</span>'
            }
          }
          dealMsg += url + char
          url = ''
        } else {
          url += char
        }
      }
      if (url) {
        if (url && url.length > 8 && url.substr(0, 4) === 'http') {
          url = url.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) { return arrEntities[t] })
          if (regex.test(url)) {
            url = '<span class="a-link" ' +
                            'style="color: #0000FF; cursor: pointer; text-decoration: underline;">' +
                            url + '</span>'
          }
        }
      }
      dealMsg += url
      return this.$Emoji.resolve(dealMsg)
    },
    transUrl(url){
      if(url.substr(0,7).toLowerCase() == "http://" || url.substr(0,8).toLowerCase() == "https://"){
          url = url;
      }else{
          url = "http://" + url;
      }
      return url;
    },
    prdDetail(item){
      if(item && item.prdDetailUrl){
        const url = this.transUrl(item.prdDetailUrl)
        shell.openExternal(url);
      }
    }
  }
}
</script>

<style scoped>
.item-lable {
  padding: 0px 2px 0px 2px;
  font-size: small;
  font-style:normal
}
.html-box {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.html-item {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.html-content {
    overflow: hidden;
    word-wrap: break-word;
    white-space: pre-line;
}

.goods-name {
    color: #14b0e2;
    cursor: pointer;
    text-decoration: underline;
    font-size: 13px;
}

.chat-body-image {
    height: 150px;
    width: 200px;
    text-align: center;
    display: table-cell;
    vertical-align: middle;
}

.chat-body-image > img {
    max-height: 150px;
    max-width: 360px;
    vertical-align: bottom;
}

.order-theme {
  border: 2px solid #d2d2d2;
  max-width: 500px;
  min-width: 450px;
  height: 160px;
  background-color: white;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap-reverse;
}

.order-title {
  height: 35px;
  padding: 5px;
  vertical-align: middle;
  border-bottom: 1px dashed #d2d2d2;
}
.order-title > div { display: inline-block; }

.order-detail {
  flex: 1;
  display: flex;
  flex-direction: row;
}
.prd-pic {
  position:relative;
  width: 85px;
  overflow: hidden;
}
.prd-pic > img {
  position: absolute;
  padding: 10px 12px 10px 10px;
  height: 100%;
  display: block;
}

.prd-name {
  cursor: pointer;
  padding: 7px 5px 0 5px;
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.prd-name:hover {
  color: #11B8F5;
}

.prd-price > div {
  display: inline;
}

.prd-info {
  flex: 1;
  font-size: small;
}

.order-info {
  position: relative;
  height: 35px;
  padding: 5px;
  display: flex;
  border-top: 1px dashed #d2d2d2;
  overflow: hidden;
}
.item-button {
  width: 25px;
  right: 2px;
  position: absolute;
}
.order-search {
  cursor: pointer;
  display: block;
  background-size: 100%;
  background: url("../../../assets/images/chat_pane/move.png") center no-repeat;
  height: 25px;
}
.order-search:hover {
  background-size: 100%;
  background: url("../../../assets/images/chat_pane/move_hover.png") center no-repeat;
  height: 25px;
}

</style>
