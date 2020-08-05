<template>
  <div class="customer-box">
    <div class="basic-infos">
      <div v-if="chatInfo" class="basic-title">客服资料</div>
      <div v-else>请选择客户</div>
      <div v-show="basicShow" v-if="chatInfo">
        <div class="basic-row">
          <div class="basic-label">客户编号：</div>
          <div class="basic-content">{{ chatInfo.uid }}</div>
        </div>
        <div class="basic-row">
          <div class="basic-label">客户账号：</div>
          <div class="basic-content">{{ chatInfo.name }}</div>
        </div>
        <div class="basic-row">
          <div class="basic-label">来源终端：</div>
          <div class="basic-content">{{ chatInfo.device | formatterDevice }}</div>
        </div>
        <div class="basic-row">
          <div class="basic-label">队列名称：</div>
          <div class="basic-content">{{ chatInfo.skillName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  filters: {
    formatterDevice: function(device) {
      let result
      switch (device) {
        case '1':
          result = '电脑'
          break
        case '2':
          result = '手机浏览器'
          break
        case '3':
          result = '手机APP'
          break
        case '4':
          result = '微信'
          break
        default:
          result = '未知'
      }
      return result
    }
  },
  data() {
    return {
      basicShow: true,
      baseInfoShow: true,
      serviceInfoShow: true,
      purchaseInfoShow: true,
      socialInfoShow: true,
      netInfoShow: true,
      sex: null,
      age: null
    }
  },
  computed: mapState({
    chatInfo: state => state.chat.chatInfo
  }),
  watch: {
    customerInfos: function() {
      if (this.customerInfos && this.customerInfos.baseInfo) {
        this.sex = this.customerInfos.baseInfo['性别']
        this.age = this.customerInfos.baseInfo['年龄']
      }
    }
  },
  methods: {
    basicTitleClick: function() {
      this.basicShow = !this.basicShow
    },
    baseInfoClick: function() {
      this.baseInfoShow = !this.baseInfoShow
    },
    serviceInfoClick: function() {
      this.serviceInfoShow = !this.serviceInfoShow
    },
    purchaseInfoClick: function() {
      this.purchaseInfoShow = !this.purchaseInfoShow
    },
    socialInfoClick: function() {
      this.socialInfoShow = !this.socialInfoShow
    },
    netInfoClick: function() {
      this.netInfoShow = !this.netInfoShow
    },
    submitSex: function() {
      if (!this.chatInfo) {
        this.$_Notice.tip('请选择会话')
        return
      }
      const params = {
        customerCode: this.chatInfo.uid,
        customerName: this.chatInfo.name,
        label: JSON.stringify([{ tagTypeCode: '性别', tagValueCode: this.sex }])
      }
      this.$Request.post('/customer/putLabel', params)
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.$_Notice.tip('已提交审核，审核通过后生效')
          } else {
            this.$_Notice.tip(res.rm)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    submitAge: function() {
      if (!this.chatInfo) {
        this.$_Notice.tip('请选择会话')
        return
      }
      const params = {
        customerCode: this.chatInfo.uid,
        customerName: this.chatInfo.name,
        label: JSON.stringify([{ tagTypeCode: '年龄', tagValueCode: this.age }])
      }
      this.$Request.post('/customer/putLabel', params)
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.$_Notice.tip('已提交审核，审核通过后生效')
          } else {
            this.$_Notice.tip(res.rm)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    }
  }
}
</script>

<style scoped>
.customer-box {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.line-height {
  line-height: 25px;
  vertical-align: center;
  margin: 0;
}

.submit_protrait {
  cursor: pointer;
}

.submit_protrait:hover {
  color: #11b8f5;
}

.el-radio {
  line-height: 25px;
}

.basic-infos,
.protrait-infos {
  margin: 15px;
  padding-bottom: 15px;
}
.basic-row,
.protrait-row {
  line-height: 25px;
  font-size: 12px;
}
.basic-row > div,
.protrait-row > div {
  display: inline-block;
}
.basic-title,
.protrait-title {
  line-height: 30px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.basic-content,
.protrait-content {
  color: #535353;
}
</style>
