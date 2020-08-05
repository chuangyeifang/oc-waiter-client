<template>
  <div>
    <oc-dialog
      v-model="showUpdatePass"
      title="客服更新密码"
      width="300"
      @submit="submitUpdatePassword"
    >
      <div class="oc-form">
        <div class="oc-form-items-row">
          <div class="oc-form-label-right">原始密码:</div>
          <input
            v-model="updateInfo.oldPassword"
            type="password"
            placeholder="请输入原始密码"
          >
        </div>
        <div class="oc-form-items-row">
          <div class="oc-form-label-right">新 密 码:</div>
          <input
            v-model="updateInfo.password"
            type="password"
            placeholder="请输入新密码"
          >
        </div>
        <div class="oc-form-items-row">
          <div class="oc-form-label-right">确认密码:</div>
          <input
            v-model="updateInfo.rePassword"
            type="password"
            placeholder="请重复输入新密"
          >
        </div>
      </div>
    </oc-dialog>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'show',
    event: 'change'
  },
  props: {
    show: Boolean
  },
  data() {
    return {
      showUpdatePass: this.show,
      updateInfo: {
        oldPassword: '',
        password: '',
        rePassword: ''
      }
    }
  },
  watch: {
    show(n) {
      this.showUpdatePass = n
      this.$emit('change', n)
    },
    showUpdatePass(n) {
      this.$emit('change', n)
    }
  },
  methods: {
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
      this.$Request.post('/waiter/updatePassword', {
        password: this.updateInfo.password,
        oldPassword: this.updateInfo.oldPassword
      })
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.$_Notice.tip('密码更新成功')
            this.updateInfo = {}
            this.show = false
            this.$emit('change', false)
          } else {
            this.$_Notice.tip(res.rm)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    noexec: function() {
      // ignore
    }
  }
}
</script>

<style scoped>
.update-password {
    width: 95px;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
}

.update-password {
    padding: 0 12px 0 32px;
}
</style>
