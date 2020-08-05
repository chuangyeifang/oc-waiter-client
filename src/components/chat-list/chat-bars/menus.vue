<template>
  <div>
    <div v-show="dropdown" class="system-set-dropdown" @click.stop="noexec">
      <div class="update-password" @click="openUpdatePassword">
        <span>修改密码</span>
      </div>
      <div class="system-settings" @click="openSettings">
        <span>设置</span>
      </div>
      <div class="system-about" @click="openAbout">
        <span>关于</span>
      </div>
      <div class="system-exit" @click="systemExit">
        <i class="exit-icon" />
        <span>退出</span>
      </div>
    </div>

    <oc-upadate-password v-model="showUpdatePassword" />
    <oc-settings v-model="showSettings" />
    <oc-about v-model="showAbout" />

    <div class="system-set" title="更多" @click.stop="openSystemDropdown" />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
  data() {
    return {
      dropdown: false,
      event: null,
      showUpdatePassword: false,
      showAbout: false,
      showSettings: false
    }
  },
  watch: {
    dropdown: function(n) {
      if (n) {
        this.event = () => {
          if (this.dropdown) {
            this.dropdown = !this.dropdown
          }
        }
        this.event.bind(this)
        document.addEventListener('click', this.event)
      } else {
        document.removeEventListener('click', this.event)
        this.event = null
      }
    }
  },
  methods: {
    openSystemDropdown: function() {
      if (!this.dropdown) {
        document.body.click()
      }
      this.dropdown = !this.dropdown
    },
    openUpdatePassword: function() {
      this.dropdown = !this.dropdown
      this.showUpdatePassword = true
    },
    openSettings: function() {
      this.dropdown = !this.dropdown
      this.showSettings = true
    },
    openAbout: function() {
      this.dropdown = !this.dropdown
      this.showAbout = true
    },
    systemExit: function() {
      this.$_Confirm.alert('确认退出客服系统吗？')
        .then(confirm => {
          if (confirm) {
            this.$store.dispatch('chat/closeActiveItems')
            const _this = this
            _this.$_WS.disconnect()
            this.$Request.post('/waiter/logout', {})
              .then(res => {
                ipcRenderer.send('system-exit')
                return null
              })
          }
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
      this.dropdown = !this.dropdown
    },
    submitUpdatePassword: function() {
      if (!this.updateInfo.oldPassword) {
        this.$_Notice.tip('请输入原始密码！')
        return
      }
      if (!this.updateInfo.password) {
        this.$_Notice.tip('请输入新密码！')
        return
      }
      if (!this.updateInfo.rePassword) {
        this.$_Notice.tip('请输入确认密码！')
        return
      }
      if (this.updateInfo.rePassword !== this.updateInfo.password) {
        this.$_Notice.tip('两次密码输入不一致， 请重新输入！')
        return
      }
      const params = {
        password: this.updateInfo.password,
        oldPassword: this.updateInfo.oldPassword
      }
      this.$Request.post('/waiter/updatePassword', params)
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.$_Notice.tip('密码更新成功')
            this.updateInfo = {}
            this.updateDialogShow = false
          } else {
            this.$_Notice.tip(res.rm)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('接口调用异常')
        })
    },
    noexec: function() {
      // ignore
    }
  }
}
</script>>

<style scoped>
.system-set {
    margin-left: 15px;
    background: url("../../../assets/images/system/bar/system.png") center no-repeat;
    background-size: 18px 18px;
    width: 18px;
    height: 40px;
}
.system-set-dropdown {
    position: absolute;
    width: 95px;
    bottom: 40px;
    background-color: #fff;
    padding: 15px 0;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
}
.my-chat-records,
.system-settings,
.system-about,
.update-password,
.system-exit {
    width: 95px;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
}

.my-chat-records,
.system-settings,
.system-about,
.update-password {
    padding: 0 12px 0 32px;
}
.system-exit {
    display: flex;
    padding: 0 12px;
}
.system-set-dropdown > div:hover {
    background-color: #11b8f5;
}
.exit-icon {
    margin-right: 4px;
    background: url("../../../assets/images/system/exit.png") center no-repeat;
    background-size: 16px 14px;
    width: 16px;
    height: 24px;
}
.system-exit:hover .exit-icon {
    background: url("../../../assets/images/system/exit_hover.png") center
        no-repeat;
}
</style
>
