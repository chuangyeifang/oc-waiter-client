<template>
  <div v-show="show" class="dialog-box">
    <div class="dialog-mask" />
    <div class="dialog-warp" @click="noexec">
      <div class="dialog-container">
        <div class="dialog-content">
          <a class="dialog-close" @click.stop="cancel" />
          <div class="dialog-header">
            <div class="dialog-header-inner">历史聊天</div>
          </div>
          <div class="dialog-body">
            <div class="chat-record-history">
              <div class="record-more noselect" @click="loadMore">
                <span>{{ htyMoreTip }}</span>
              </div>
              <div v-for="(record, index) in htyRecords" :key="'hr-' + index" :class="$options.filters.transferOwner(record.ownerType)">
                <div class="header">
                  <div class="name">
                    <span>{{ $options.filters.transferName(record) }}</span>
                  </div>
                  <div class="time">
                    <span>{{ record.createTime }}</span>
                  </div>
                </div>
                <div v-viewer class="content">
                  <oc-html :message="record" />
                </div>
              </div>
            </div>
          </div>
          <div class="dialog-footer">
            <div class="dialog-cancel" @click.stop="cancel">关闭</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    transferMessage(record) {
      let result
      switch (record.messageType) {
        case '2':
          result = '<div style="max-width: 360px; height:150px;"><img style="max-width: auto; height:auto;" src="' + record.messages + '" />'
          break
        default:
          result = record.messages
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
  model: {
    prop: 'show',
    event: 'change'
  },
  props: {
    customerCode: {
      type: String,
      default: undefined
    },
    show: Boolean
  },
  data() {
    return {
      htyRecords: [],
      pageHelper: {
        pageNum: 1,
        pageSize: 10
      },
      htyMoreTip: '点击加载更多',
      id: '',
      isLoad: true,
      once: true
    }
  },
  watch: {
    show: function(n) {
      if (n) {
        this.loadMore()
      }
    }
  },
  methods: {
    transfer(type) {
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
    cancel: function() {
      this.htyRecords = []
      this.isLoad = true
      this.pageHelper = {
        pageNum: 1,
        pageSize: 10
      }
      this.id = ''
      this.$emit('cancel')
      this.$emit('change', !this.show)
    },
    noexec: function() {
      // ignore
    },
    loadMore: function() {
      if (this.isLoad && this.customerCode) {
        const params = { customerCode: this.customerCode, id: this.id }
        Object.assign(params, this.pageHelper)
        this.$Request.post('/chatRecord/before', params)
          .then(res => {
            res = JSON.parse(res)
            if (res.rc === 0) {
              const data = res.data
              for (const i in data) {
                this.htyRecords.unshift(data[i])
              }
              if (data.length > 0) {
                this.id = data[data.length - 1].id
              }
              if (data.length < 10) {
                this.htyMoreTip = '没有更多'
                this.isLoad = false
              }
            }
            return null
          })
          .catch(res => {
            this.$_Notice.tip('访问失败')
          })
      }
    }
  }
}
</script>

<style scoped>
.dialog-mask { position: fixed; top: 0; bottom: 0; left: 0; right: 0; background-color: rgba(0, 0, 0, .5); height: 100%; z-index: 1000; }
.dialog-warp { position: fixed; top: 0; bottom: 0; left: 0; right: 0; z-index: 1000; outline: 0; }
.dialog-container { position: absolute; top: 50%; left: 50%;}
.dialog-content { transform: translate(-50%, -50%); }
.dialog-content { position: relative; background-color: #fff; border: 0; background-clip: padding-box; box-shadow: 0 4px 12px rgba(0, 0, 0, .15) }
.dialog-close { position: absolute; display: block; width: 11px; height: 35px; right: 8px; top: 0px; overflow: hidden; cursor: pointer; z-index: 1;  color: #000; background: url("../../../assets/images/dialog/close.png") center no-repeat; background-size: 11px 11px; }
.dialog-header { padding: 0px 15px; height: 35px; font-size: 13px; background: linear-gradient(to right, #507EA4, #6ed2fe ); }
.dialog-header-inner { display: inline-block; width: 100%; line-height: 35px; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dialog-body { width: 600px; height: 450px; display: flex; flex-direction: column; overflow: hidden; padding: 15px; line-height: 1.5;}
.dialog-footer { padding: 12px 20px; text-align: right; font-size: 13px; }
.dialog-footer > div { cursor: pointer; margin-left: 15px; display: inline-block; }
.dialog-submit { color: #fff; padding: 5px 20px; line-height: 20px; background-color: #11b8f5;  }
.dialog-cancel { color: #a0a0a0; padding: 5px 20px; line-height: 20px; border: 1px solid #dcdcdc; }

.chat-record-history { position: relative; flex: 1; overflow-x: hidden; overflow-y: auto; padding: 8px 15px; font-size: 13px; }
.record-more { cursor: pointer; text-align: center; color: #a0a0a0; }
.record-new-line { text-align: center; color: #a0a0a0; line-height: 20px; }
.waiter, .robot, .customer { display: flex; flex-direction: column; padding: 8px 0; cursor: inherit; }
.header { display: flex; }
.header > div { padding-right: 8px; }
.content { padding: 4px 0; font-size: 14px; overflow: hidden; white-space: wrap; word-wrap:break-word; word-break: break-all; line-height: 25px; display: flex;}
.waiter { align-items: flex-end; }
.customer { align-items: flex-start; }
.robot { align-items: flex-end; }
.waiter .content { color: #000; padding-right: 8px; }
.waiter .name { color: #3dc998; }
.customer .content { color: #000;  }
.customer .name { color: #11b8f5; }
.robot .content { color: #000;  }
.content img { width: 10px; height: 25px; }
.robot .name { color: #3dc998; }
.name { font-size: 13px; }
.time { color: #a0a0a0; font-size: 13px; }
.header::after { content:".";  height:0; visibility:hidden; clear:both}
</style>
