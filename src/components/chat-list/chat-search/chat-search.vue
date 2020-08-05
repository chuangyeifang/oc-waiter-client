<template>
  <div class="search-pane">
    <div class="searh-input-box" title="搜索时效七天内">
      <div class="search-icon" @click="doSearch" />
      <input v-model="searchValue" placeholder="搜索" @keydown.enter="doSearch" @focus="searchInputFocus">
      <div class="search-clear-icon" @click="clearSearch" />
    </div>
    <div v-show="show" class="search-result-pane">
      <div class="result-box">
        <div class="contact-person-list">
          <div class="list-title">联系人</div>
          <div class="list-items">
            <div v-for="(item, index) in contactList" :key="'cl-' + index" class="contact-item" @click.stop="contactClick(item)">
              <div class="contact-head" />
              <div class="contact-name">{{ item.customerName }}</div>
            </div>
            <div v-show="isMoreContact" class="list-more noselect" @click="loadContacts">
              <span>查看更多</span>
            </div>
          </div>
        </div>
        <div class="chat-record-list">
          <div class="list-title">聊天记录</div>
          <div class="list-items">
            <div v-for="(item, index) in recordList" :key="'rl-' + index" class="record-item" @click="recordClick(item)">
              <div class="record-head" />
              <div class="record-content">
                <div class="record-content-name" :title="item.customerName">
                  <span>{{ item.customerName }}</span>
                </div>
                <div class="record-content-describe" :title="item.nums + '条与(' + searchValue +')相关的聊天记录'">
                  <span>{{ item.nums }}条与<span style="color:#11b8f5;">{{ doSearchValue }}</span>相关的聊天记录</span>
                </div>
              </div>
              <div class="record-opt-icon" />
            </div>
            <div v-show="isMoreRecord" class="list-more noselect" @click="loadRecords">
              <span>查看更多</span>
            </div>
          </div>
        </div>
        <div class="offline-message-list">
          <div class="list-title">留言</div>
          <div class="list-items">
            <div v-for="(item, index) in offlineList" :key="'ol-' + index" class="offline-item">
              <div class="offline-head" />
              <div class="offline-content">
                <div class="offline-content-name">{{ item.name }}</div>
                <div class="offline-content-describe">
                  <span>{{ item.nums }}条与<span style="color:#11b8f5;">{{ doSearchValue }}</span>相关的聊天记录</span>
                </div>
              </div>
              <div class="offline-opt-icon" />
            </div>
            <div class="list-more noselect">
              <span>查看更多</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="showDetail" class="search-record-detail">
      <div class="record-detail-back" @click.stop="recordBack">
        <div class="record-detail-back-icon" />
        <div class="record-detail-back-name">返回</div>
      </div>
      <div class="record-detail-header">
        <div class="record-detail-header-icon" />
        <div class="record-detail-header-name">{{ customerName }}</div>
      </div>
      <div class="record-detail-items">
        <div v-for="(item, index) in recordDetails" :key="'rd-' + index" class="record-detail-item" @click="recordDetailClick(item)">
          <div class="record-detail-item-content" :title="item.messages">{{ item.messages }}</div>
          <div class="record-detail-item-date">{{ item.createTime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      showDetail: false,
      searchValue: '',
      doSearchValue: '',
      contactList: [],
      isMoreContact: false,
      recordList: [],
      isMoreRecord: false,
      offlineList: [],
      recordDetails: [],
      customerName: null,
      doSearchTimeout: false
    }
  },
  watch: {
    searchValue: function(n) {
      if (!n) {
        this.show = false
        this.showDetail = false
        this.contactList = []
        this.recordList = []
        this.offlineList = []
        this.recordDetails = []
        this.customerName = null
      }
    }
  },
  methods: {
    loadContacts: function() {
      if (this.searchValue) {
        const params = { searchInner: this.searchValue }
        if (!this.contactList.pageNum) {
          this.contactList.pageNum = 1
          params.pageNum = 1
        } else {
          params.pageNum = this.contactList.pageNum
        }
        this.$Request.post('/chat/week', params)
          .then(res => {
            res = JSON.parse(res)
            if (res.rc === 0) {
              const data = res.data
              const length = data.length
              for (let i = 0; i < length; i++) {
                this.contactList.push(data[i])
              }
              if (params.pageNum === 1 && length === 0) {
                this.contactList = []
                return null
              }
              this.contactList.pageNum = params.pageNum + 1
              if (length < 10) {
                this.isMoreContact = false
              } else {
                this.isMoreContact = true
              }
            } else {
              this.$_Notice.tip('查询联系人错误：' + res.rm)
            }
            return null
          })
          .catch(res => {
            this.$_Notice.tip('访问失败')
          })
      } else {
        this.$_Notice.tip('请输入查询内容！')
      }
    },
    loadRecords: function() {
      if (this.searchValue) {
        const params = { subMessage: this.searchValue }
        if (!this.recordList.pageNum) {
          this.recordList.pageNum = 1
          params.pageNum = 1
        } else {
          params.pageNum = this.recordList.pageNum
        }
        this.$Request.post('/chatRecord/weekCollect', params)
          .then(res => {
            res = JSON.parse(res)
            if (res.rc === 0) {
              const data = res.data
              const length = data.length
              for (let i = 0; i < length; i++) {
                this.recordList.push(data[i])
              }
              if (params.pageNum === 1 && length === 0) {
                this.recordList = []
                return null
              }
              this.recordList.pageNum = params.pageNum + 1
              if (length < 10) {
                this.isMoreRecord = false
              } else {
                this.isMoreRecord = true
              }
            } else {
              this.$_Notice.tip('查询聊天记录错误：' + res.rm)
            }
            return null
          })
          .catch(res => {
            this.$_Notice.tip('访问失败')
          })
      }
    },
    doSearch: function() {
      if (this.doSearchTimeout) {
        return
      }
      this.doSearchTimeout = true
      const _this = this
      setTimeout(function() {
        _this.doSearchTimeout = false
      }, 1500)

      this.doSearchValue = this.searchValue
      this.contactList.pageNum = 1
      this.recordList.pageNum = 1
      this.customerName = null
      this.recordList = []
      this.contactList = []
      this.loadContacts()
      this.loadRecords()
      this.show = true
      this.showDetail = false
    },
    clearSearch: function() {
      this.show = false
      this.showDetail = false
      this.searchValue = null
      this.contactList = []
      this.recordList = []
      this.offlineList = []
      this.recordDetails = []
      this.customerName = null
    },
    contactClick: function(item) {
      this.$emit('search', 0)
      this.$store.dispatch('chat/createSearchChatItem', item)
      this.show = false
    },
    recordClick: function(item) {
      this.showDetail = true
      if (this.customerName && this.customerName === item.customerName) {
        return
      }
      this.customerName = item.customerName
      if (this.searchValue) {
        this.$Request.post('/chatRecord/weekDetail', {
          customerName: item.customerName,
          subMessage: this.searchValue
        })
          .then(res => {
            res = JSON.parse(res)
            if (res.rc === 0) {
              this.recordDetails = res.data
            } else {
              this.$_Notice.tip('查询聊天记录失败')
            }
            return null
          })
          .catch(res => {
            this.$_Notice.tip('访问失败')
          })
      }
    },
    recordBack: function() {
      this.showDetail = false
    },
    recordDetailClick: function(item) {
      this.$emit('search', 0)
      this.$store.dispatch('chat/createSearchChatItem', item)
      this.show = false
      this.showDetail = false
    },
    searchInputFocus: function() {
      if (this.searchValue && !this.show) {
        this.show = true
      }
    }
  }
}
</script>

<style scoped>
.search-pane {
    font-size: 13px;
}
.searh-input-box {
    display: flex;
    width: 100%;
    height: 40px;
    border-bottom: 1px solid #e5e5e5;
    padding: 0 15px;
}
.searh-input-box input {
    outline: none;
    border: none;
    margin: 0;
    padding: 0;
    padding-left: 5px;
    line-height: 40px;
    flex: 1;
    color: #000000;
}
.search-icon {
    cursor: pointer;
    width: 20px;
    height: 40px;
    background: url("../../../assets/images/search/search.png") left center no-repeat;
    background-size: 18px 16px;
}
.search-clear-icon {
    cursor: pointer;
    width: 20px;
    height: 40px;
    background: url("../../../assets/images/search/search_clear.png") left center no-repeat;
    background-size: 18px 18px;
}
.search-result-pane {
    display: flex;
    position: absolute;
    width: 225px;
    top: 40px;
    bottom: 41px;
    left: 0;
    z-index: 11;
    background-color: #fff;
    border-right: 1px solid #ededed;
    overflow: hidden;
}
.result-box {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
}

.list-title {
    height: 35px;
    padding-top: 5px;
    line-height: 30px;
    color: #a0a0a0;
    margin-left: 15px;
}
.list-items {
    padding-bottom: 8px;
    border-bottom: 1px solid #dcdcdc;
}
.contact-item {
    display: flex;
    padding: 8px 15px;
    background-color: #fff;
    cursor: pointer;
}
.contact-item:hover {
    background-color: #eaeaea;
}
.contact-head {
    width: 30px;
    height: 30px;
    background: url("../../../assets/images/head/head.png") center no-repeat;
    background-size: 30px 30px;
}
.contact-name {
    width: 152px;
    padding-left: 10px;
    line-height: 30px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.record-item {
    display: flex;
    padding: 8px 15px;
    background-color: #fff;
    cursor: pointer;
}
.record-item:hover {
    background-color: #eaeaea;
}
.record-head {
    width: 30px;
    height: 35px;
    background: url("../../../assets/images/head/head.png") center no-repeat;
    background-size: 30px 30px;
}
.record-content {
    flex: 1;
    height: 35px;
    padding-left: 5px;
}
.record-content-name, .record-content-describe {
    line-height: 17px;
    width: 140px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.record-content-describe {
    font-size: 12px;
    color: #898989;
}
.record-opt-icon {
    width: 12px;
    height: 35px;
    background: url('../../../assets/images/search/search_arrow.png') center no-repeat;
    background-size: 6px 11px;
}

.offline-item {
    display: flex;
    padding: 8px 15px;
    background-color: #fff;
    cursor: pointer;
}
.offline-item:hover {
    background-color: #eaeaea;
}
.offline-head {
    width: 30px;
    height: 35px;
    background: url("../../../assets/images/head/head.png") center no-repeat;
    background-size: 30px 30px;
}
.offline-content {
    flex: 1;
    height: 35px;
    padding-left: 5px;
}
.offline-content-name, .offline-content-describe {
    line-height: 17px;
    width: 140px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.offline-content-describe {
    font-size: 12px;
    color: #898989;
}
.offline-opt-icon {
    width: 12px;
    height: 35px;
    background: url('../../../assets/images/search/search_arrow.png') center no-repeat;
    background-size: 6px 11px;
}

.list-more {
    font-size: 12px;
    color: #11b8f5;
    text-align: center;
    line-height: 20px;
}
.list-more span {
    cursor: pointer;
}

.search-record-detail {
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 225px;
    top: 40px;
    bottom: 41px;
    left: 0;
    z-index: 11;
    background-color: #fff;
    border-right: 1px solid #ededed;
    overflow: hidden;
}
.record-detail-back {
    display: flex;
    margin: 4px 15px 0 15px;
    cursor: pointer;
    width: 40px;
}
.record-detail-back:hover {
    color: #11b8f5;
}
.record-detail-back:hover .record-detail-back-icon {
    background: url('../../../assets/images/search/arrow_left_hover.png') left center no-repeat;
}
.record-detail-back-icon {
    width: 12px;
    height: 30px;
    background: url('../../../assets/images/search/arrow_left.png') left center no-repeat;
    background-size: 6px 11px;
}
.record-detail-back-name {
    height: 30px;
    line-height: 30px;
    font-size: 13px;
}

.record-detail-header {
    display: flex;
    margin: 8px 15px;
}
.record-detail-header-icon {
    width: 30px;
    height: 30px;
    background: url("../../../assets/images/head/head.png") center no-repeat;
    background-size: 30px 30px;
}
.record-detail-header-name {
    flex: 1;
    height: 30px;
    line-height: 30px;
    padding-left: 8px;
    font-size: 13px;
}
.record-detail-items {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
}
.record-detail-item {
    display: flex;
    padding: 0 15px;
    cursor: pointer;
    color: #535353;
}
.record-detail-item:hover {
    background-color: #eaeaea;
}
.record-detail-item-content {
    width: 155px;
    height: 30px;
    line-height: 30px;
    overflow: hidden;  white-space: nowrap; text-overflow: ellipsis;
}
.record-detail-item-date {
    width: 40px;
    height: 30px;
    line-height: 30px;
}
</style>

