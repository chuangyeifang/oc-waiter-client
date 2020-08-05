<template>
  <oc-dialog
    v-model="showChatRecord"
    title="聊天记录"
    :hide-footer="true"
    width="800"
  >
    <div class="oc-form">
      <div class="oc-form-items-row">
        <div class="oc-form-label-right">客户账号:</div>
        <el-input
          v-model="searchParams.customerName"
          placeholder="请输入客户账号"
          clearable
        />
        <div class="oc-form-label-right">客户编码:</div>
        <el-input
          v-model="searchParams.customerCode"
          placeholder="请输入Id"
          clearable
        />
      </div>
      <div class="oc-form-items-row">
        <div class="oc-form-label-right">查询日期:</div>
        <el-date-picker
          v-model="searchParams.beginTime"
          type="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          :clearable="false"
        />
        <oc-button @click="loadData">查询</oc-button>
        <oc-button @click="reset">重置</oc-button>
      </div>
    </div>
    <el-table
      :data="chatRecords"
      height="360"
      border
      style="width: 100%;"
    >
      <el-table-column
        prop="customerName"
        label="客户账号"
        width="100"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="customerCode"
        label="客户编码"
        width="100"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="skillName"
        label="队列名称"
        width="160"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="msgTotal"
        label="总消息数"
        width="70"
      />
      <el-table-column
        prop="createTime"
        label="创建日期"
      />
      <el-table-column
        prop="endTime"
        label="结束日期"
      />
      <el-table-column
        fixed="right"
        label="操作"
        width="50"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="chatDetailClick(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pageView.pageNum"
      :page-sizes="[10, 20, 40, 60, 80, 100]"
      :page-size="pageView.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageView.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <oc-dialog
      v-model="chatDetailShow"
      title="详情"
      :hide-footer="true"
      width="800"
    >
      <div class="chat-record-history">
        <div
          v-for="(detail, index) in chatRecordDetail"
          :key="index"
          :class="$options.filters.transferOwner(detail.ownerType)"
        >
          <div class="header">
            <div class="name">
              <span>{{ $options.filters.transferName(detail) }}</span>
            </div>
            <div class="time">
              <span>{{ detail.createTime }}</span>
            </div>
          </div>
          <div v-viewer class="content">
            <oc-html :message="detail" />
          </div>
        </div>
      </div>
    </oc-dialog>
  </oc-dialog>
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
    show: Boolean
  },
  data() {
    return {
      searchParams: {
        customerName: null,
        custonerCode: null,
        beginTime: this.$DateFormat.format(new Date(), 'yyyy-MM-dd')
      },
      chatRecords: [],
      chatRecordDetail: [],
      pageView: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      chatDetailShow: false,
      showChatRecord: this.show
    }
  },
  watch: {
    show(n) {
      this.showChatRecord = n
      if (!n) {
        this.chatRecords = []
        this.pageView = {
          pageNum: 1,
          pageSize: 10,
          total: 0
        }
      }
      this.$emit('change', n)
    },
    showChatRecord(n) {
      this.$emit('change', n)
    }
  },
  methods: {
    loadData: function() {
      const params = Object.assign(this.searchParams, this.pageView)
      this.$Request.post('/chat/list', params)
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.chatRecords = res.data
            this.pageView = res.pageView
          } else {
            this.$_Notice.tip(res.rm)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    handleCurrentChange: function(pageNum) {
      this.pageView.pageNum = pageNum
      this.loadData()
    },
    handleSizeChange: function(pageSize) {
      this.pageView.pageSize = pageSize
      this.loadData()
    },
    chatDetailClick: function(row) {
      this.chatDetailShow = true
      const params = {
        chatId: row.chatId,
        waiterCode: row.waiterCode,
        customerCode: row.customerCode
      }
      this.$Request.post('/chatRecord/all', params)
        .then(res => {
          res = JSON.parse(res)
          if (res.rc === 0) {
            this.chatRecordDetail = res.data
          } else {
            this.$_Notice.tip(res.rm)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    reset: function() {
      this.searchParams = {
        customerName: null,
        custonerCode: null,
        beginTime: this.$DateFormat.format(new Date(), 'yyyy-MM-dd')
      }
    }
  }
}
</script>

<style scoped>
.chat-record-history { position: relative; flex: 1; height: 493px;
    overflow-x: hidden; overflow-y: auto; padding: 8px 15px; font-size: 13px; }
.waiter, .robot, .customer { display: flex; flex-direction: column; padding: 8px 0; cursor: inherit; }
.header { display: flex; }
.header > div { padding-right: 8px; }
.content { padding: 4px 0; font-size: 14px; overflow: hidden; white-space: wrap; line-height: 25px; display: inline;}
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
