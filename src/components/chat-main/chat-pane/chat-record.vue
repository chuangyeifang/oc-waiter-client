<template>
  <div ref="recordsRef" v-contextmenu:chatPaneMenu class="chat-records" @mouseup.left="mouseupLeft" @contextmenu.stop.prevent="doSelectElText($event)">
    <div class="chat-record-content">
      <div v-if="records.htys.more">
        <div class="record-more noselect" @click="loadHistoryRecord">
          <span>点击加载更多</span>
        </div>
      </div>
      <div v-else>
        <div class="record-more noselect">
          <span>亲，没有更多了~</span>
        </div>
      </div>
      <div
        v-for="(htyRecord, index) in records.htys.data"
        :key="'hr-' + index"
        :class="$options.filters.transferOwner(htyRecord.ownerType)"
      >
        <div class="header">
          <div class="name">
            <span>{{ $options.filters.transferName(htyRecord) }}</span>
          </div>
          <div class="time">
            <span>{{ htyRecord.createTime }}</span>
          </div>
        </div>
        <div class="content-box">
          <div v-viewer class="content">
            <div class="arrow" />
            <oc-html :message="htyRecord" />
          </div>
        </div>
      </div>
      <div v-if="records.data.length !== 0">
        <div class="tip-box">
          <span class="tip-content">~新消息~</span>
        </div>
      </div>
      <div v-else>
        <div class="tip-box">
          <span class="tip-content">{{ getCurDate() }}</span>
        </div>
      </div>
      <div
        v-for="(record, index) in records.data"
        :key="'r' + index"
      >
        <div v-if="record.revocation" class="revocation-box">
          <span class="revocation-content">你撤回了一条消息</span>
        </div>
        <div v-else-if="record.messageType == 'TIP'" class="tip-box">
          <span class="tip-content">{{ record.messages }}</span>
        </div>
        <div v-else :class="record.ownerType">
          <div class="header">
            <div class="name">
              <span>{{ record.name }}</span>
            </div>
            <div class="time">
              <span>{{ record.time }}</span>
            </div>
          </div>
          <div class="content-box">
            <div
              v-if="record.ownerType == 'waiter'"
              class="revocation-opt"
              title="撤回"
              @click="revactionPacket(record.pid)"
            />
            <div v-viewer class="content">
              <div class="arrow" />
              <oc-html :message="record" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-contextmenu ref="chatPaneMenu">
      <v-contextmenu-item @click="copy">复制</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script>
const { clipboard } = require('electron')
import { mapState } from 'vuex'
export default {
  filters: {
    transferOwner(type) {
      let result
      switch (type) {
        case '1':
          result = 'customer'
          break
        case '2':
          result = 'waiter'
          break
        default:
          result = 'robot'
      }
      return result
    },
    transferName(record) {
      let result
      switch (record.ownerType) {
        case '1':
          result = record.customerName
          break
        case '2':
          result = record.waiterCode
          break
        case '3':
          result = '客服助手'
          break
      }
      return result
    }
  },
  props: {
    records: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      selectEL: null,
      selectText: null
    }
  },
  computed: mapState({
    chatInfo: state => state.chat.chatInfo
  }),
  watch: {
    'records.show': function(show) {
      if (show) {
        if (this.records.htys.data.length === 0) {
          this.initHistoryRecord()
        }
        this.scroll()
      }
    },
    'records.data': function() {
      if (this.records.show) {
        this.scroll()
      }
    }
  },
  mounted() {
    if (this.records.show) {
      if (this.records.htys.data.length === 0) {
        this.initHistoryRecord()
      }
    }
  },
  methods: {
    getCurDate: function() {
      return this.$DateFormat.format()
    },
    scroll: function() {
      this.$nextTick(function() {
        const scroll = this.$refs.recordsRef
        if (scroll.scrollHeight > scroll.clientHeight) {
          scroll.scrollTop = scroll.scrollHeight - scroll.clientHeight
        }
      })
    },
    initHistoryRecord: function() {
      this.$store.dispatch('chat/loadHtyChatRecord', this.records.uid).then(res => {
        this.scroll()
      })
    },
    loadHistoryRecord: function() {
      this.$store.dispatch('chat/loadHtyChatRecord', this.records.uid).then(res => {

      })
    },
    revactionPacket(pid) {
      this.$store.dispatch('chat/revocationPacket', pid)
        .then(() => {
          this.$_WS.revocation(this.chatInfo.uid, this.chatInfo.cid, pid)
        })
        .catch((res) => {
          this.$_Notice.tip(res)
        })
    },
    copy() {
      if (this.selectText) {
        clipboard.writeText(this.selectText.replace(/<br([/]*)>/, '\n'))
      } else if (this.selectEL) {
        const innerHTML = this.selectEL.innerHTML
        if (innerHTML) {
          clipboard.writeText(innerHTML.replace(/<br([/]*)>/, '\n'))
        }
      } else {
        clipboard.clear()
      }
      this.selectText = null
      this.selectEL = null
    },
    doSelectElText(event) {
      if (this.selectText) {
        return
      }
      this.selectEL = event.target
      const selection = window.getSelection()
      selection.removeAllRanges()
      const range = document.createRange()
      range.selectNodeContents(event.target)
      selection.addRange(range)
    },
    mouseupLeft() {
      this.selectText = window.getSelection().toString()
    }
  }
}
</script>

<style scoped>
.chat-records {
  position: relative;
  flex: 1;
  overflow: hidden;
  overflow-y: auto;
  padding: 8px 15px;
  font-size: 13px;
}
.record-more {
  cursor: pointer;
  text-align: center;
  color: #a0a0a0;
}
.waiter,
.robot,
.customer {
    display: flex;
    flex-direction: column;
    padding: 8px 0;
    cursor: inherit;
}
.waiter {
  align-items: flex-end;
}
.waiter .content {
    color: #000;
    padding-right: 8px;
    background-color: #caeffd;
    border-radius: 6px;
    padding: 5px 8px;
}

.content-box {
  position: relative;
}

.robot .content .arrow,
.waiter .content .arrow {
  position: absolute;
  top: -6px;
  right: 0;
  width: 10px;
  height: 9px;
  background: url('../../../assets/images/chat_pane/arrow_right.png') center no-repeat;
  background-size: 10px 9px;
}

.customer .content .arrow {
  position: absolute;
  top: -6px;
  left: 0;
  width: 10px;
  height: 9px;
  background: url('../../../assets/images/chat_pane/arrow_left.png') center no-repeat;
  background-size: 10px 9px;
}

.waiter .name {
  color: #a0a0a0;
}
.customer {
  align-items: flex-start;
}
.customer .content {
    color: #000;
    background-color: #e8e8e8;
    border-radius: 6px;
    padding: 5px 8px;
}
.customer .name {
  color: #a0a0a0;
}
.robot {
  align-items: flex-end;
}
.robot .content {
  color: #000;
  background-color: #caeffd;
  border-radius: 6px;
  padding: 5px 8px;
}
.robot .name {
  color: #a0a0a0;
}
.header {
  display: flex;
  flex-direction: row;
}

.header .name {
  padding-right: 8px;
}
.header::after {
  content:".";
  height:0;
  visibility:hidden;
  clear:both;
}

.name {
  font-size: 13px;
}
.time {
  color: #a0a0a0;
  font-size: 13px;
}

.content {
  padding: 4px 0;
  font-size: 14px;
  overflow: hidden;
  white-space: wrap;
  word-wrap:break-all;
  word-break: break-all;
  line-height: 25px;
  display: flex;
}
.content img {
  width: 10px;
  height: 25px;
}

.content-box {
  display: flex;
  align-items: flex-end;
  margin-top: 5px;
}
.content-box .content {
  flex: 1;
}

.tip-box,
.revocation-box {
  color: #818181;
  text-align: center;
  line-height: 40px;
}
.revocation-opt {
  visibility:hidden;
  width: 30px;
  height: 33px;
  cursor: pointer;
  background-size: 16px 16px;
  background: url('../../../assets/images/chat_pane/revocation.png') center no-repeat;
}
.revocation-opt:hover {
  background: url('../../../assets/images/chat_pane/revocation_hover.png') center no-repeat;
}
.content-box:hover .revocation-opt{
  visibility:visible;
}

.tip-box .tip-content,
.revocation-box .revocation-content {
  padding: 5px 15px;
  background-color: #efefef;
}
</style>
