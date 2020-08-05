<template>
  <div id="app" class="login-container">
    <div class="win-container">
      <ul class="win-ul">
        <li class="win-min" @click="winOperation('min')" />
        <li class="win-close" @click="winOperation('close')" />
      </ul>
    </div>
    <div class="login-header noselect">
      <div class="login-header-title">
        <img src="@/assets/images/login/logo_title.png" alt="">
      </div>
      <span class="login-header-img">
        <img src="@/assets/images/login/logo.png">
      </span>
      <oc-status
        :status="loginInfo.status"
        style="bottom: -22px; left: 50%; margin-left: 22px;"
        @change="statusChange"
      />
    </div>
    <div class="login-form">
      <div class="waiterName-box">
        <i class="waiterName-icon" />
        <input
          ref="waiterName"
          v-model="loginInfo.waiterName"
          placeholder="请输入账号"
          @blur="waiterNameBlur"
        >
      </div>

      <div class="password-box">
        <i class="password-icon" />
        <input
          ref="password"
          v-model="loginInfo.password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter.prevent="loginSubmit"
        >
      </div>
      <div class="btn-box noselect">
        <div class="login-btn" @click="loginSubmit">登录</div>
      </div>
    </div>
    <div v-show="loading" class="login-loading">
      <div class="loading-box">
        <div style="color: #fff; text-align: center; font-size: 16px; letter-spacing:3px;">登录中...</div>
        <img src="@/assets/images/login/loading_01.gif" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import request from '@/api/request'
export default {
  name: 'Login',
  data() {
    return {
      loginInfo: {
        waiterName: localStorage.userName,
        password: undefined,
        status: localStorage.status ? localStorage.status : '1'
      },
      statusShow: false,
      loading: false
    }
  },
  mounted() {
    ipcRenderer.on('workstand-reply', (event, res) => {
      if (res.rc === 1006) {
        this.$_Notice.tip(res.rm)
      }
      this.loading = false
    })
  },
  methods: {
    loginSubmit() {
      if (!this.loginInfo.waiterName || !this.loginInfo.waiterName.trim()) {
        this.$_Notice.tip('请输入账号')
        this.loginInfo.waiterName = ''
        this.$refs.waiterName.focus()
        return
      }

      if (!this.loginInfo.password) {
        this.$_Notice.tip('请输入密码')
        this.$refs.password.focus()
        return
      }

      localStorage.userName = this.loginInfo.waiterName
      localStorage.status = this.loginInfo.status
      this.loading = true
      request.post('waiter/login', {
        tenantCode: '1',
        waiterName: this.loginInfo.waiterName,
        password: this.loginInfo.password
      }).then(res => {
        res = JSON.parse(res)
        if (res.rc === 0) {
          ipcRenderer.send('workstand-open', { token: res.data, status: this.loginInfo.status })
        } else {
          this.loading = false
          this.$_Notice.tip(res.rm)
        }
      }).catch(res => {
        this.loading = false
        this.$_Notice.tip('请检测网络是否正确或与技术人员联系')
      })
    },
    waiterNameBlur() {
      this.loginInfo.waiterName = this.loginInfo.waiterName.trim()
    },
    statusChange(status) {
      this.loginInfo.status = status
    },
    winOperation(opt) {
      ipcRenderer.send('login-window-opt', opt)
    }
  }
}
</script>

<style>
body,
html,
ul,
li {
  margin: 0;
  padding: 0;
}
* {
  font-family: "Microsoft YaHei";
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
html,
body {
  height: 100%;
}
</style>

<style scoped>
  body {
    font-size: 12px;
    color: #000;

    background-color: #fff;
    -webkit-font-smoothing: antialiased;
  }

  .login-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: #fff;
    font-size: 10px;
    border: 1px solid #507EA4;
    overflow: hidden;
  }
  .login-header {
    background: linear-gradient(to right, #507EA4, #6ed2fe);
    text-align: center;
    height: 95px;
    padding-top: 50px;
    position: relative;
  }
  .login-header-title {
    color: #fff;
    font-size: 16px;
    position: fixed;
    top: 12px;
    left: 18px;
    margin-left: auto;
    margin-right: auto;
  }
  .login-header-img {
    display: inline-block;
    text-align: center;
    color: #fff;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    width: 64px;
    height: 64px;
    line-height: 64px;
  }

  .login-header-img img {
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
  }

  .login-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 50px 80px 10px 80px;
  }
  .waiterName-box,
  .password-box {
    position: relative;
  }
  .waiterName-box input,
  .password-box input {
    width: 100%;
    font-size: 14px;
    outline: none;
    border: 0;
    border-bottom: 1px solid #cccccc;
    margin: 0;
    padding: 0;
    padding-left: 45px;
    line-height: 40px;
    height: 40px;
    flex: 1;
    color: #000000;
  }
  .waiterName-icon,
  .password-icon {
    display: block;
    position: absolute;
    bottom: 12px;
    left: 15px;
    background-size: 16px 20px;
    width: 16px;
    height: 20px;
  }
  .waiterName-icon {
    background: url("../../assets/images/login/account.png") center no-repeat;
  }
  .password-icon {
    background: url("../../assets/images/login/password.png") center no-repeat;
  }
  .login-btn {
    width: 100%;
    height: 35px;
    line-height: 35px;
    text-align: center;
    cursor: pointer;
    color: #fff;
    font-size: 16px;
    background-color: #507EA4;
    margin-top: 20px;
  }

  .win-container {
    height: 40px;
    -webkit-app-region: drag;
    background: linear-gradient(to right, #507EA4, #6ed2fe);
  }
  .win-ul {
    -webkit-app-region: no-drag;
    list-style: none;
    vertical-align: middle;
    text-align: right;
    height: 33px;
    float: right;
  }
  .win-container li {
    float: left;
  }
  .win-min {
    background-image: url("../../assets/images/window/min.png");
    background-repeat: no-repeat;
    width: 32px;
    height: 33px;
  }
  .win-min:hover {
    background-image: url("../../assets/images/window/min_hover.png");
  }
  .win-min:active {
    background-image: url("../../assets/images/window/min_press.png");
  }
  .win-max {
    background-image: url("../../assets/images/window/max.png");
    background-repeat: no-repeat;
    width: 32px;
    height: 33px;
  }
  .win-max:hover {
    background-image: url("../../assets/images/window/max_hover.png");
  }
  .win-max:active {
    background-image: url("../../assets/images/window/max_press.png");
  }
  .win-close {
    background-image: url("../../assets/images/window/close.png");
    background-repeat: no-repeat;
    width: 32px;
    height: 33px;
  }
  .win-close:hover {
    background-image: url("../../assets/images/window/close_hover.png");
  }
  .win-close:active {
    background-image: url("../../assets/images/window/close_press.png");
  }
  .noselect {
    -webkit-user-select: none;
  }
  .login-loading {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, #507EA4, #6ed2fe);
    z-index: 1001;
  }
  .loading-box {
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translate(-50%, -50%);
    z-index: 1002;
  }
</style>

