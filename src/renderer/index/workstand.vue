<template>
  <div id="app" class="workbench-container">
    <div class="workbench-header noselect">
      <div class="left-header">
        <div class="left-header-top" />

        <div class="left-header-bottom">
          <div class="header-img">
            <img src="@/assets/images/login/logo.png">
          </div>
          <div class="header-name">{{ waiterName }}</div>
          <div class="calendar-box">
            <span>{{ getCurDate() }}</span>
          </div>
          <oc-status
            style="top:45px; left: 45px;"
            :status="status"
            @change="changeStatus"
          />
        </div>
      </div>
      <div class="center-header">
        <div class="center-header-top" />
        <div class="center-header-bottom">
          <div class="today-accept-box" title="今日接待量">
            <div class="today-accept-icon">今日</div>
            <div class="today-accept-content">{{ todayReception }}</div>
          </div>
          <div class="waiting-box" title="点击接入" @click="reception">
            <div class="waiting-icon">排队</div>
            <div title="排队人数" class="waiting-content">{{ waittingCount }}</div>
          </div>
        </div>
      </div>
      <div class="right-header">
        <ul class="win-ul">
          <li class="win-min" @click="winOperation('min')" />
          <li class="win-max" @click="winOperation('max')" />
          <li class="win-close" @click="winOperation('close')" />
        </ul>
      </div>
    </div>
    <div class="workbench-content">
      <oc-chat-list />
      <oc-chat-main />
      <oc-chat-common />
    </div>

    <oc-dialog
      v-model="reLoginShow"
      title="系统提示"
      :submit-value="reconnectText"
      cancel-value="退出系统"
      width="320"
      @submit="reconnect"
      @cancel="exit"
    >
      {{ reloginMsg }}
    </oc-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'
// 禁用鼠标选中文字拖拽
document.body.ondragstart = () => {
  return false
}
export default {
  data() {
    return {
      waiterName: undefined,
      status: '1',
      nvgTabShow: 3,
      error: null,
      errorShow: false,
      reLoginShow: false,
      reloginMsg: '',
      todayReception: 0,
      loadStatisticsTimer: null,
      reconnectText: '重试登录'
    }
  },
  computed: mapState({
    waittingCount: state => state.chat.waittingCount
  }),
  mounted() {
    clearInterval(this.loadStatisticsTimer)
    this.waiterName = this.$_WS.getWaiterName()
    this.status = this.$_WS.getStatus()
    this.$store.commit('chat/setWS', this.$_WS)
    this.registerListener()
    this.connect()
    this.startService()
  },
  methods: {
    getCurDate: function() {
      return this.$DateFormat.format(new Date(), 'MM-dd')
    },
    registerListener: function() {
      this.$_WS.registerListener(
        this.openListener,
        this.messageListener,
        this.noticeListener
      )
    },
    connect: function() {
      this.$_WS.connect(res => {
        if (res.rc === 1000) {
          ipcRenderer.send('workstand-done')
        } else if (res.rc === 1006) {
          ipcRenderer.send('workstand-error', res)
        }
      })
    },
    reconnect: function() {
      this.reconnectText = '正在登录中...'
      this.$_WS.connect(res => {
        if (res.rc === 1000) {
          this.reLoginShow = false
        } else {
          this.$_Notice.tip(res.rm)
        }
        this.reconnectText = '重试登录'
      })
    },
    openListener: function() {},
    messageListener: function(message) {
      this.$store.dispatch('chat/resolver', message)
    },
    noticeListener: function(data) {
      switch (data.rc) {
        case 1001:
          this.$_Notice.tip('已经是登录状态')
          break
        case 1002:
          this.reloginMsg = data.rm
          this.reLoginShow = true
          break
        case 1003:
          this.reloginMsg = data.rm
          this.reLoginShow = true
          break
        case 1004:
          this.$_Notice.tip(data.rm)
          break
      }
    },
    winOperation: function(opt) {
      if (opt === 'close') {
        this.$_Confirm.alert('确认退出客服系统吗？').then(confirm => {
          if (confirm) {
            this.$store.dispatch('chat/closeActiveItems')
            this.$_WS.disconnect()
            this.$Request.post('/waiter/logout', {}).then(res => {
              ipcRenderer.send('system-exit')
              return null
            }).catch(res => {
              this.$_Notice.tip('访问失败')
            })
          }
        })
      } else {
        ipcRenderer.send('win-operation', opt)
      }
    },
    changeStatus: function(status) {
      this.$_WS.changeStatus(status)
    },
    exit: function() {
      ipcRenderer.send('system-exit')
    },
    reception: function() {
      if (this.waittingCount !== 0) {
        this.$_WS.reception()
      } else {
        this.$_Notice.tip('没有排队客户')
      }
    },
    startService: function() {
      this.eventListener()
      this.loadStatistics()
      this.loadStatisticsTimer = setInterval(this.loadStatistics, 15000)
    },
    loadStatistics: function() {
      this.$Request.post('/waiterMonitor/receptions', {})
        .then(res => {
          res = JSON.parse(res)
          if (res.rc === 0) {
            this.todayReception = res.data || 0
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    eventListener: function() {
      var _this = this
      document.addEventListener('keyup', event => {
        switch (event.keyCode) {
          case 38:
            _this.$store.dispatch('chat/changeSelectItem', 'up')
            _this.$store.commit('editer/focus')
            event.stopPropagation()
            break
          case 40:
            _this.$store.dispatch('chat/changeSelectItem', 'down')
            _this.$store.commit('editer/focus')
            event.stopPropagation()
            break
        }
      })
    }
  }
}
</script>

<style scoped>
.workbench-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid #507EA4;
}

/* 头部样式 开始 */
.workbench-header {
    display: flex;
    flex-direction: row;
    -webkit-app-region: drag;
    width: 100%;
    height: 68px;
    background: linear-gradient(to right, #507EA4, #6ed2fe);
}
.workbench-header li {
    float: left;
}
.left-header {
    position: relative;
    width: 227px;
    height: 100%;
    background: #507EA4;
}
.left-header-top {
    height: 14px;
    width: 250px;
}
.left-header-bottom {
    -webkit-app-region: no-drag;
}

.center-header {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    width: 100%;
}
.center-header-top {
    height: 20px;
}
.center-header-bottom {
    flex: 1;
    color: #fff;
    -webkit-app-region: no-drag;
    display: flex;
    flex-direction: row;
}

.center-header-bottom .today-accept-box {
  display: flex;
  flex-direction: column;
  height: 40px;
  border-radius: 8px;
  margin-left: 20px;
}
.center-header-bottom .today-accept-icon {
  width: 30px;
  height: 30px;
  background: url("../../assets/images/head/title-box.png") center no-repeat;
  background-size: 30px 30px;
  font-size: 11px;
  font-weight: bold;
  padding-top: 3px;
  text-align: center;
  color: #507EA4;
}

.center-header-bottom .today-accept-content {
  min-width: 16px;
  height: 15px;
  line-height: 15px;
  text-align: center;
  background-color: #507EA4;
  border-radius: 15px;
  font-size: 10px;
}

.center-header-bottom .waiting-box {
  display: flex;
  flex-direction: column;
  height: 40px;
  border-radius: 8px;
  margin-left: 25px;
}
.center-header-bottom .waiting-icon {
  width: 30px;
  height: 30px;
  background: url("../../assets/images/head/title-box.png") center no-repeat;
  background-size: 30px 30px;
  font-size: 11px;
  font-weight: bold;
  padding-top: 3px;
  text-align: center;
  color: #507EA4;
}
.center-header-bottom .waiting-content {
  min-width: 16px;
  height: 15px;
  line-height: 15px;
  text-align: center;
  background-color: #507EA4;
  border-radius: 15px;
  font-size: 10px;
}

.right-header {
    display: flex;
    flex-direction: column;
    width: 450px;
    height: 100%;
    align-items: flex-end;
}

.win-ul {
    -webkit-app-region: no-drag;
    list-style: none;
    vertical-align: middle;
    text-align: right;
    height: 33px;
    float: right;
}
.win-min {
    background: url('../../assets/images/window/min.png') no-repeat center;
    width: 25px;
    height: 26px;
    margin-right: 5px;
}
.win-min:hover {
    background-image: url("../../assets/images/window/min_hover.png");
}
.win-min:active {
    background-image: url("../../assets/images/window/min_press.png");
}
.win-max {
    background: url("../../assets/images/window/max.png") no-repeat center;
    width: 25px;
    height: 26px;
    margin-right: 5px;
}
.win-max:hover {
    background-image: url("../../assets/images/window/max_hover.png");
}
.win-max:active {
    background-image: url("../../assets/images/window/max_press.png");
}
.win-restore {
    background: url("../../assets/images/window/restore.png") no-repeat center;
    width: 25px;
    height: 26px;
}
.win-restore:hover {
    background-image: url("../../assets/images/window/restore_hover.png");
}
.win-restore:active {
    background-image: url("../../assets/images/window/restore_press.png");
}
.win-close {
    background: url("../../assets/images/window/close.png") no-repeat center;
    width: 25px;
    height: 26px;
}
.win-close:hover {
    background-image: url("../../assets/images/window/close_hover.png");
}
.win-close:active {
    background-image: url("../../assets/images/window/close_press.png");
}
/** left header **/
.header-name {
    width: 110px;
    position: absolute;
    bottom: 20px;
    left: 70px;
    font-size: 15px;
    color: #fff;
    font-weight: bold;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.header-img {
    margin-left: 10px;
    display: inline-block;
    background-color: transparent;
    width: 46px;
    height: 46px;
}
.header-img img {
    width: 46px;
    height: 46px;
}

.calendar-box {
  position: absolute;
  bottom: 0px;
  right: 10px;
  line-height: 20px;
  color: #fff;
  font-weight: bold;
}

/* 头部样式 结束 */

.workbench-content {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    border: 1px solid #eaeaea;
}
.workbench-center {
    display: flex;
    width: 100%;
    flex-direction: column;
    flex: 1;
    background-color: #fff;
    border: 1px solid #e5e5e5;
    border-top: 0;
}

</style>
