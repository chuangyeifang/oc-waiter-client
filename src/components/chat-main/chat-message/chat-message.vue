<template>
  <div class="chat-message">
    <div class="chat-tools">
      <div class="chat-tool-left">
        <div class="chat-tool">
          <oc-chat-emoji @selected="emojiSelect" />
        </div>
        <div class="chat-tool">
          <div class="send-img" title="发送本地图片" @click.stop="sendImage" />
        </div>
        <div class="chat-tool">
          <div class="invite-evaluate" title="邀请评价" @click.stop="inviteEvaluate" />
        </div>
      </div>
      <div class="chat-tool-right">
        <div class="open-history" title="聊天历史" @click.stop="openHistory" />
      </div>
      <div v-if="smartList && smartList.length > 0" class="smart-tips">
        <div
          v-for="(item, index) in smartList"
          :key="index"
          class="smart-item"
          @click.stop="selectSmartTip(item.content)"
        >

          <span>{{ (index + 1) + '. ' }}</span>
          <span v-if="item.keyword" style="color: #11b8f5;">[{{ item.keyword }}]</span>
          <span>{{ item.content }}</span>
        </div>
      </div>
    </div>
    <div class="message">
      <div
        ref="editerRef"
        class="editer"
        contentEditable="plaintext-only"
        placeholder="请输入500以内的字符"
        @keydown.exact.enter.stop.prevent="sendMessageEnter"
        @keyup.exact.ctrl.enter.stop.prevent="sendMessageCtrlEnter"
        @blur="editerBlur($event)"
        @keyup.exact="editerKeyup"
        @keydown="editerKeydown"
      />
    </div>
    <div class="footer">
      <div class="send-box" title="发送消息" @click="sendMessageEnter">发送</div>
    </div>
    <oc-chat-record-detail v-model="htyDialogShow" :customer-code="chatInfo ? chatInfo.uid : undefined" />
    <oc-dialog
      v-model="imgDialogShow"
      title="图片预览"
      submit-value="发送"
      width="500"
      @submit="sendImgb64"
    >
      <div v-if="imgb64">
        <img :src="imgb64" style="max-width: 470px; max-height:450px">
      </div>
    </oc-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import common from '@/utils/common.js'
const { dialog, clipboard } = require('electron').remote
export default {
  data() {
    return {
      htyDialogShow: false,
      smartOpen: false,
      smartList: null,
      beferChatInfo: null,
      imgb64: null,
      imgDialogShow: false
    }
  },
  computed: mapState({
    chatInfo: state => state.chat.chatInfo,
    editerValue: state => state.editer.value,
    personalWords: state => state.common.personalWords,
    teamWords: state => state.common.teamWords
  }),
  watch: {
    chatInfo() {
      if (this.chatInfo) {
        if (!this.beferChatInfo) {
          this.beferChatInfo = this.chatInfo
        } else {
          if (this.chatInfo.uid === this.beferChatInfo.uid) {
            return
          }
          const editer = this.$refs.editerRef
          this.beferChatInfo.editerValue = editer.innerHTML
          const editerValue = this.chatInfo.editerValue
          editer.innerHTML = editerValue || ''
          this.beferChatInfo = this.chatInfo
        }
      }
    }
  },
  mounted() {
    this.$store.commit('editer/setEditer', this.$refs.editerRef)
  },
  methods: {
    sendImage: function() {
      if (!this.chatInfo) {
        this.$_Notice.tip('请选择会话')
        return
      }
      const customerInfo = {
        uid: this.chatInfo.uid,
        name: this.chatInfo.name,
        cid: this.chatInfo.cid
      }
      const options = {
        filters: [{
          name: 'Images',
          extensions: ['jpg', 'png', 'jpeg']
        }]
      }
      dialog.showOpenDialog(options, result => {
        if (result) {
          this.$Request.upload('/upload/image', result[0], res => {
            if (res && res.rc === 0) {
              const data = res.data
              if (data.success) {
                this.$store.commit('chat/renderOutChatRecord', {
                  uid: customerInfo.uid,
                  name: this.$_WS.getWaiterCode(),
                  time: this.$DateFormat.format(),
                  messages: data.imgurl,
                  messageType: 'IMAGE',
                  ownerType: 'waiter'
                })
                const params = {
                  pid: common.getPid(),
                  item: customerInfo,
                  body: data.imgurl,
                  bodyType: 'IMAGE'
                }
                this.$_WS.sendMessage(params)
              }
            } else {
              this.$_Notice.tip(res.msg)
            }
          })
        }
      })
    },
    inviteEvaluate: function() {
      if (this.chatInfo) {
        if (this.chatInfo.isOnline) {
          if (!this.chatInfo.isInvite) {
            this.$_WS.inviteEvaluate(this.chatInfo.uid)
            this.chatInfo.isInvite = true
            this.$_Notice.tip('邀请评价发送成功！')
          } else {
            this.$_Notice.tip('已邀请评价！')
          }
        } else {
          this.$_Notice.tip('会话已关闭，不能邀请评价！')
        }
      } else {
        this.$_Notice.tip('请选择会话')
      }
    },
    openHistory: function() {
      if (this.chatInfo) {
        this.name = this.chatInfo.name
        this.htyDialogShow = true
      } else {
        this.$_Notice.tip('请选择会话')
      }
    },
    emojiSelect: function(content) {
      if (content) {
        this.$store.commit('editer/insert', this.$Emoji.resolve(content))
      }
    },
    sendMessageCtrlEnter: function() {
      this.sendMessageEnter()
    },
    sendMessageEnter: function() {
      const editer = this.$refs.editerRef
      let message = ''
      const nodes = editer.childNodes
      nodes.forEach((node, index) => {
        if (node.nodeName === 'IMG') {
          message += node.getAttribute('name')
        } else if (node.nodeName === '#text') {
          if (node.nodeValue) {
            message += node.nodeValue.replace(/<(?!br([/]*)>)[^>]*>/gi, '')
          }
        } else {
          if (node.innerHTML) {
            message += node.innerHTML.replace(/<(?!br([/]*)>)[^>]*>/gi, '')
          }
        }
      })
      message = message.trim()
      if (!message || message.length === 0) {
        this.$_Notice.tip('发送内容不能为空')
      } else if (message.length > 500) {
        this.$_Notice.tip('发送内容不能超过500字符')
      } else {
        if (this.chatInfo) {
          const customerInfo = {
            uid: this.chatInfo.uid,
            name: this.chatInfo.name,
            cid: this.chatInfo.cid
          }
          const pid = common.getPid()
          const params = {
            pid: pid,
            item: customerInfo,
            body: message,
            bodyType: 'TEXT'
          }
          this.$_WS.sendMessage(params)

          this.$store.commit('chat/renderOutChatRecord', {
            pid: pid,
            name: this.$_WS.getWaiterCode(),
            time: this.$DateFormat.format(),
            timestamp: new Date().getTime(),
            messages: message,
            messageType: 'TEXT',
            ownerType: 'waiter'
          })
          editer.innerHTML = ''
        } else {
          this.$_Notice.tip('请选择会话')
        }
      }
    },
    editerBlur() {
      const sel = window.getSelection()
      this.$store.commit('editer/updateRange', sel.getRangeAt(0))
    },
    editerKeyup(event) {
      const editer = this.$refs.editerRef
      const editerValue = editer.innerHTML
      if (event.keyCode === 38 || event.keyCode === 40) {
        if (editerValue) {
          event.stopPropagation()
        }
        return
      }
      if (!editerValue) {
        this.smartList = []
        return
      }
      const len = editerValue.length
      if (len === 1 && event.key === '/') {
        const key = editerValue.charAt(0)
        if (key === '、') {
          editer.innerHTML = len === 1 ? '/' : editerValue.substring(0, len - 1) + '/'
          this.cursorToEnd(editer)
        }
      }
      if (editerValue.charAt(0) === '/' && len > 1) {
        this.smartList = this.smartTips(editerValue.substring(1))
      }
    },
    editerKeydown(event) {
      if (event.ctrlKey && event.keyCode === 86) {
        const image = clipboard.readImage()
        if (!image.isEmpty()) {
          this.imgb64 = image.toDataURL()
          this.imgDialogShow = true
        }
      }
    },
    sendImgb64() {
      if (!this.chatInfo) {
        this.$_Notice.tip('请选择会话')
        return
      }
      const customerInfo = {
        uid: this.chatInfo.uid,
        name: this.chatInfo.name,
        cid: this.chatInfo.cid
      }
      this.imgDialogShow = false
      if (!this.imgb64) {
        return
      }
      this.$Request.post('/upload/imgb64', { imgb64: this.imgb64 })
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            const data = res.data
            if (data.success) {
              this.$store.commit('chat/renderOutChatRecord', {
                uid: customerInfo.uid,
                name: this.$_WS.getWaiterCode(),
                time: this.$DateFormat.format(),
                messages: data.imgurl,
                messageType: 'IMAGE',
                ownerType: 'waiter'
              })
              const params = {
                pid: common.getPid(),
                item: customerInfo,
                body: data.imgurl,
                bodyType: 'IMAGE'
              }
              this.$_WS.sendMessage(params)
            }
            this.imgb64 = null
          } else {
            this.imgDialogShow = true
            this.$_Notice.tip(res.msg)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    smartTips(key) {
      if (!key) {
        return []
      }
      let datas = this.personalWords.concat(this.teamWords)
      datas = JSON.parse(JSON.stringify(datas))
      const result = []
      datas.map((data) => {
        data.items = data.items.filter((item) => {
          if (item.content.indexOf(key) !== -1) {
            result.push(item)
          } else if (item.keyword && item.keyword.indexOf(key) !== -1) {
            result.push(item)
          }
        })
      })
      return result
    },
    selectSmartTip(content) {
      const editer = this.$refs.editerRef
      editer.innerHTML = content
      this.cursorToEnd(editer)
    },
    cursorToEnd(el) {
      el.focus()
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
      this.smartList = []
    }
  }
}
</script>

<style scoped>

.chat-tools { position: relative; height: 44px; border-top: 1px solid #D9D9D9; display: flex; }
.chat-tool-left { flex: 4; display: flex; }
.chat-tool-right { flex: 1; display: flex; flex-direction: column; align-items: flex-end; margin-right: 15px; }

.open-history { background-size: 20px 20px; width: 20px; height: 44px; cursor: pointer; }
.open-history {  background: url("../../../assets/images/chat/bar/history.png") center no-repeat;  }
.open-history:hover { background: url("../../../assets/images/chat/bar/history_hover.png") center no-repeat; }

.send-img, .invite-evaluate { margin-right: 15px; background-size: 20px 18px; width: 20px; height: 44px; cursor: pointer; }
.send-img {  background: url("../../../assets/images/chat/bar/img.png") center no-repeat; }
.send-img:hover { background: url("../../../assets/images/chat/bar/img_hover.png") center no-repeat; }
.invite-evaluate { background: url("../../../assets/images/chat/bar/heart.png") center no-repeat; }
.invite-evaluate:hover { background: url("../../../assets/images/chat/bar/heart_hover.png") center no-repeat; }
.chat-message .footer { height: 32px; }
.chat-message .footer { line-height: 25px; height: 25px; width: 62px; float: right; text-align: center; cursor: pointer; color: #898989; font-size: 13px; border: 1px solid #dcdcdc; margin: 0 15px 8px 0; }

.smart-tips { position: absolute; bottom: 45px; left: 0; padding: 8px 0; max-height: 260px; width: 600px; box-shadow: 3px 3px 10px rgba(55, 55, 55, .3); overflow-x: hidden; overflow-y: auto; background-color: #fff; }
.smart-item { cursor: pointer; line-height: 30px; font-size: 13px; padding: 0 15px; overflow: hidden;  white-space: nowrap; text-overflow: ellipsis;}
.smart-item:hover { background-color: #f0f0f0; }

.chat-message .message { height: 110px; background-color: #fff; outline: none;}
.editer { padding: 0 15px; height: 100%; width: 100%; resize: none; overflow-y: auto; color: #000; font-size: 14px; line-height: 20px; outline: none; background-color: #fff; word-break: break-all; white-space: normal; }
.editer:empty:before { content: attr(placeholder); color: #CFCFCF;  display: block; }

.editer::-webkit-scrollbar { width: 0px; }
.editer::-webkit-scrollbar-thumb { width: 0px; }
.editer::-webkit-scrollbar-track { background: transparent; }
</style>
