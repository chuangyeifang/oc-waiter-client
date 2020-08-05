<template>
  <div class="transform-pane noselect" @click.stop="noexec">
    <div class="transform-icon" title="转接客户" @click="openDropdown" />
    <div v-show="dropdown" class="transform-dropdown">
      <div class="transform-header">
        <div>转接客服列表</div>
        <div class="transform-close">
          <i class="transform-close-icon" @click.stop="close" />
        </div>
      </div>
      <div class="transfer-search">
        <el-input
          v-model="searchTransfer.inner"
          placeholder="请输入查询关键字"
          class="input-with-select"
          @keydown.enter="doSearchTransfer"
        >
          <el-select slot="prepend" v-model="searchTransfer.type" style="width: 90px;" placeholder="请选择">
            <el-option label="按团队" value="1" />
            <el-option label="按工号" value="2" />
            <el-option label="按客服" value="3" />
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="doSearchTransferList" />
        </el-input>
      </div>
      <div class="transform-body">
        <div v-for="(team, index) in transferList" :key="'iteam-' + index" class="transform-team">
          <div class="transform-team-node" @click="showWaiters(team)">
            <div class="node-name"><span>{{ team.teamName }}</span></div>
            <div class="node-describe"><span>在线数({{ team.waiters.length }})</span></div>
            <div v-if="team.waiters.length" class="node-transfer-btn" @click.stop="openTransferTeam(team)">转入</div>
          </div>
          <div v-show="team.show" class="transform-waiters">
            <div
              v-for="(waiter, x) in team.waiters"
              :key="'waiter-' + x"
              class="transform-waiter"
            >
              <div class="transform-waiter-reception">
                <span class="reception-icon" :style="{backgroundColor: transferStatus(waiter)}">{{ 0 > waiter.curReception ? 0 : waiter.curReception }}</span>
              </div>
              <div class="transform-waiter-name" :title="waiter.waiterCode + ' (' + waiter.waiterName + ')' ">
                <span>{{ waiter.waiterCode }} ({{ waiter.waiterName }})</span>
              </div>
              <div class="transform-waiter-type">
                <span :style="{color: waiter.type == 1 ? '#000' : '#CD2626'}">{{ waiter.type == 1 ? '售前' : '售后' }}</span>
              </div>
              <div class="transform-opt">
                <div class="transform-submit-b" @click.stop="openTransferWaiter(waiter, team)">转入</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="transform-footer">
        <div class="transform-refrush-b" @click="refrush">刷新</div>
        <div class="transform-cancel-b" @click.stop="close">取消</div>
      </div>
    </div>
    <!-- 按客服转接 -->
    <div v-if="showTransferWaiter && !showTransferBu" class="transfer-waiter">
      <div class="transfer-waiter-header">
        <div>按客服转接客户</div>
        <div class="transfer-waiter-close">
          <i class="transfer-waiter-close-icon" @click.stop="transferWaiterClose" />
        </div>
      </div>
      <div class="transfer-waiter-body">
        <div class="oc-form">
          <div class="oc-form-items-row">
            <div class="oc-form-label">客服工号：</div>
            <div class="oc-form-label"><span>{{ transferWaiter.waiter.waiterCode }}</span></div>
          </div>
          <div class="oc-form-items-row">
            <div class="oc-form-label">客服名称：</div>
            <div class="oc-form-label"><span>{{ transferWaiter.waiter.waiterName }}</span></div>
          </div>
          <div class="oc-form-items-row">
            <div class="oc-form-label">团队名称：</div>
            <div class="oc-form-label"><span>{{ transferWaiter.team.teamName }}</span></div>
          </div>
          <div class="oc-form-items-row">
            <div class="oc-form-label">转接技能：</div>
            <oc-select
              v-model="transferWaiter.skillCode"
              :options="skillsOptions"
              label="skillName"
              value="skillCode"
              width="200"
            />
            <div class="transform-cancel-b" @click="reLoadSkills">刷新</div>
          </div>
          <div class="oc-form-items-column">
            <div class="oc-form-label">转接备注</div>
            <textarea v-model="transferWaiter.reason" rows="5" placeholder="请输入转接备注" />
          </div>
        </div>
      </div>
      <div class="transfer-waiter-footer">
        <div class="transform-refrush-b" @click.stop="submitTransferWaiter">确认</div>
        <div class="transform-cancel-b" @click.stop="transferWaiterClose">取消</div>
      </div>
    </div>
    <!-- 按团队转接 -->
    <div v-if="showTransferTeam && !showTransferBu" class="transfer-team">
      <div class="transfer-team-header">
        <div>按团队转接客户</div>
        <div class="transfer-team-close">
          <i class="transfer-team-close-icon" @click.stop="transferTeamClose" />
        </div>
      </div>
      <div class="transfer-team-body">
        <div class="oc-form">
          <div class="oc-form-items-row">
            <div class="oc-form-label">团队名称：</div>
            <div class="oc-form-label"><span>{{ transferTeam.team.teamName }}</span></div>
          </div>
          <div class="oc-form-items-row">
            <div class="oc-form-label">转接技能：</div>
            <oc-select
              v-model="transferTeam.skillCode"
              :options="skillsOptions"
              label="skillName"
              value="skillCode"
              width="200"
            />
            <div class="transform-cancel-b" @click="reLoadSkills">刷新</div>
          </div>
          <div class="oc-form-items-column">
            <div class="oc-form-label">转接备注</div>
            <textarea v-model="transferTeam.reason" rows="5" placeholder="请输入转接备注" />
          </div>
        </div>
      </div>
      <div class="transfer-team-footer">
        <div class="transform-refrush-b" @click.stop="submitTransferTeam">确认</div>
        <div class="transform-cancel-b" @click.stop="transferTeamClose">取消</div>
      </div>
    </div>
    <!-- 按商品转接 -->
    <div v-if="showTransferBu && !dropdown" class="transfer-bu">
      <div class="transfer-bu-header">
        <div>按商品转接客户</div>
        <div class="transfer-bu-close">
          <i class="transfer-bu-close-icon" @click.stop="closeTransferBu" />
        </div>
      </div>
      <div class="transfer-bu-body">
        <div class="oc-form">
          <div class="oc-form-items-row">
            <div class="oc-form-label">访客账号：</div>
            <div style="margin: auto 0; padding-top: 5px;">{{ product.info.customerName }}</div>
          </div>
          <div class="oc-form-items-row">
            <div class="oc-form-label">转接技能：</div>
            <div style="margin: auto 0; padding-top: 5px;">{{ product.info.skillName }}</div>
          </div>
          <div class="oc-form-items-column">
            <div class="oc-form-label">转接备注</div>
            <textarea v-model="transferBuReason" rows="5" placeholder="请输入转接备注" />
          </div>
        </div>
      </div>
      <div class="transfer-bu-footer">
        <div class="transform-refrush-b" @click.stop="submitTransferBu">确认</div>
        <div class="transform-cancel-b" @click.stop="closeTransferBu">取消</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      transferList: [],
      baseData: [],
      dropdown: false,
      event: null,
      teamsShow: {},
      skillsOptions: [],
      showTransferWaiter: false,
      showTransferTeam: false,
      searchTransfer: {
        inner: '',
        type: '1'
      },
      transferTeamCode: null,
      transferWaiter: {
        skillCode: null,
        waiter: null,
        reason: null,
        team: null
      },
      transferTeam: {
        skillCode: null,
        reason: null,
        team: null
      },
      transferListSetInterval: null,
      skillName: '',
      transferBuReason: null
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
    },
    'searchTransfer.inner': function() {
      this.transferList = this.doSearchTransferList()
    }
  },
  computed: {
    ...mapState({
      showTransferBu: state => state.common.showTransferBu,
      product: state => state.common.product
    })
  },
  methods: {
    transferStatus: function(waiter) {
      if (waiter.curReception >= waiter.maxReception) {
        return '#FF4040'
      }
      if (waiter.status === '1') {
        return '#40db2a'
      } else {
        return '#ffbc2e'
      }
    },
    loadData: function() {
      this.$Request.post('/waiter/onlines', {})
        .then(res => {
          res = JSON.parse(res)
          if (res.rc === 0) {
            res.data.forEach(item => {
              item.show = true
            })
            this.baseData = res.data
            this.transferList = this.doSearchTransferList()
          } else {
            this.$_Notice.tip('加载转接列表失败。')
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    loadSkills: function() {
      this.$Request.post('/team/skills', { teamCode: this.transferTeamCode })
        .then(res => {
          res = JSON.parse(res)
          if (res.rc === 0) {
            this.skillsOptions = res.data
          } else {
            this.$_Notice.tip('加载队列失败，请点击刷新按钮。')
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    reLoadSkills: function() {
      this.$Request.post('/team/skills', { teamCode: this.transferTeamCode })
        .then(res => {
          res = JSON.parse(res)
          if (res.rc === 0) {
            this.skillsOptions = res.data
            this.$_Notice.tip('重新加载队列成功。')
          } else {
            this.$_Notice.tip('重新加载队列失败。')
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    openDropdown: function() {
      if (!this.dropdown) {
        document.body.click()
      }
      this.loadData()
      this.searchTransfer = {
        inner: '',
        type: '1'
      }
      this.dropdown = !this.dropdown
    },
    close: function() {
      this.dropdown = !this.dropdown
    },
    transferWaiterClose: function() {
      this.showTransferWaiter = false
      this.transferWaiter = {}
    },
    transferTeamClose: function() {
      this.showTransferTeam = false
      this.transferTeam = {}
    },
    refrush: function() {
      this.$Request.post('/waiter/onlines', {})
        .then(res => {
          res = JSON.parse(res)
          if (res.rc === 0) {
            res.data.forEach(item => {
              item.show = true
            })
            this.baseData = res.data
            this.$_Notice.tip('刷新转接列表成功。')
            this.transferList = this.doSearchTransferList()
          } else {
            this.$_Notice.tip('刷新转接列表失败。')
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    openTransferWaiter: function(waiter, team) {
      if (waiter.waiterName === this.$_WS.getWaiterName()) {
        this.$_Notice.tip('不能转接自己')
        return
      }
      if (waiter.curReception >= waiter.maxReception || waiter.status !== '1') {
        this.$_Notice.tip('当前客服处于忙碌状态，拒绝转入')
        return
      }

      this.transferTeamCode = team.teamCode
      this.transferWaiter.waiter = waiter
      this.transferWaiter.team = team
      this.loadSkills()
      this.showTransferWaiter = true
    },
    openTransferTeam: function(team) {
      if (!team || team.waiters.length === 0) {
        this.$_Notice.tip('当前团队无客服人员值守，拒绝转入。')
        return
      }
      this.transferTeamCode = team.teamCode
      this.transferTeam.team = team
      this.loadSkills()
      this.showTransferTeam = true
    },
    submitTransferWaiter() {
      const skill = this.skillsOptions.find(item => item.skillCode === this.transferWaiter.skillCode)
      const params = {
        waiterCode: this.transferWaiter.waiter.waiterCode,
        waiterName: this.transferWaiter.waiter.waiterName,
        teamCode: this.transferWaiter.team.teamCode,
        skillName: skill.skillName,
        skillCode: this.transferWaiter.skillCode,
        reason: this.transferWaiter.reason
      }
      this.$store
        .dispatch('chat/transferByWaiter', params)
        .then(res => {
          if (res.rc === 0) {
            this.dropdown = !this.dropdown
            this.transferWaiter = {}
            this.skillsOptions = []
            this.showTransferWaiter = false
          } else {
            this.$_Notice.tip(res.rm)
          }
        })
        .catch(res => {
          this.$_Notice.tip(res.rm)
        })
    },
    submitTransferTeam() {
      const skill = this.skillsOptions.find(item => item.skillCode === this.transferTeam.skillCode)
      const params = {
        teamCode: this.transferTeam.team.teamCode,
        skillName: skill.skillName,
        skillCode: this.transferTeam.skillCode,
        reason: this.transferTeam.reason
      }
      this.$store
        .dispatch('chat/transferByTeam', params)
        .then(res => {
          if (res.rc === 0) {
            this.dropdown = !this.dropdown
            this.transferTeam = {}
            this.skillsOptions = []
            this.showTransferTeam = false
          } else {
            this.$_Notice.tip(res.rm)
          }
        })
        .catch(res => {
          this.$_Notice.tip(res.rm)
        })
    },
    showWaiters: function(team) {
      team.show = !team.show
    },
    doSearchTransferList: function() {
      const searchInner = this.searchTransfer.inner
      const datas = this.baseData
      if (!searchInner) {
        return this.baseData
      }
      const array = JSON.parse(JSON.stringify(datas))
      let result = null
      switch (this.searchTransfer.type) {
        case '1':
          return array.filter(data => {
            if (data.teamName.indexOf(searchInner) !== -1) {
              return data
            }
          })
        case '2':
          result = array.filter((data) => {
            if (data.waiters && data.waiters.length > 0) {
              data.waiters = data.waiters.filter(waiter => {
                if (waiter.waiterCode.indexOf(searchInner) !== -1) {
                  return waiter
                }
              })
              if (data.waiters.length > 0) {
                return data
              }
            }
          })
          return result
        case '3':
          return array.filter((data) => {
            if (data.waiters && data.waiters.length > 0) {
              data.waiters = data.waiters.filter(waiter => {
                if (waiter.waiterName.indexOf(searchInner) !== -1) {
                  return waiter
                }
              })
              if (data.waiters.length > 0) {
                return data
              }
            }
          })
      }
      return this.baseData
    },
    noexec: function() {
      // ignore
    },
    submitTransferBu() {
      this.$Request.post('/waiter/onlines', {})
        .then(res => {
          res = JSON.parse(res)
          if (res.rc === 0) {
            const teams = res.data
            if (teams && teams.length > 0) {
              const team = teams.find(item => item.teamCode == this.product.info.teamCode)
              if (team && team.waiters && team.waiters.length > 0) {
                const params = {
                  teamCode: this.product.info.teamCode,
                  skillName: this.product.info.skillName,
                  skillCode: this.product.info.skillCode,
                  reason: this.transferBuReason
                }
                this.$store
                  .dispatch('chat/transferByTeam', params)
                  .then(res => {
                    if (res.rc === 0) {
                      this.transferBuReason = null
                      this.$store.state.common.showTransferBu = false
                    } else {
                      this.$_Notice.tip(res.rm)
                    }
                  })
                  .catch(res => {
                    this.$_Notice.tip(res.rm)
                  })
              } else {
                this.$_Notice.tip('当前队列无客服人员值守，拒绝转入。')
              }
            }
          } else {
            this.$_Notice.tip('请重试')
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('转接失败')
        })
    },
    closeTransferBu() {
      this.$store.state.common.product = null
      this.$store.state.common.showTransferBu = false
      this.transferBuReason = null
    }
  }
}
</script>

<style scoped>
.transform-pane {
    position: relative;
}
.transform-icon {
    cursor: pointer;
    background: url("../../../assets/images/chat/info/transform.png") center
        no-repeat;
    height: 40px;
    width: 20px;
    margin-right: 15px;
}
.transform-icon:hover {
    background: url("../../../assets/images/chat/info/transform_hover.png")
        center no-repeat;
}

.transform-dropdown {
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 450px;
    height: 450px;
    right: 0px;
    background-color: #fff;
    z-index: 100;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

.transfer-bu,
.transfer-team,
.transfer-waiter {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 450px;
    height: 450px;
    right: 0px;
    background-color: #fff;
    z-index: 102;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}
.transfer-bu{
  height: 300px !important;
}
.transfer-bu-header,
.transfer-team-header,
.transfer-waiter-header,
.transform-header {
    display: flex;
    padding: 0 15px;
    height: 35px;
    line-height: 35px;
    font-size: 13px;
    color: #fff;
    background: linear-gradient(to right, #507EA4, #6ed2fe);
}
.transfer-bu-close,
.transfer-team-close,
.transfer-waiter-close,
.transform-close {
    display: flex;
    flex: 1;
    justify-content: flex-end;
}
.transfer-bu-close-icon,
.transfer-team-close-icon,
.transfer-waiter-close-icon,
.transform-close-icon {
    width: 11px;
    height: 35px;
    cursor: pointer;
    background: url("../../../assets/images/dialog/close.png") center no-repeat;
    background-size: 11px 11px;
}
.transfer-bu-body,
.transfer-team-body,
.transfer-waiter-body,
.transform-body {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 15px;
}

.transform-waiters {
    margin: 4px 0;
}
.transform-waiter {
    display: flex;
}
.transform-team-node {
    line-height: 25px;
    display: flex;
    flex-direction: row;
    font-size: 14px;
    cursor: pointer;
    background-color: #f1efef;
}

.transform-team-node .node-name {
    flex: 3;
}

.transform-team-node .node-describe {
    text-align: left;
    color: #535353;
    font-size: 12px;
    padding-right: 5px;
    flex: 1;
}
.transform-team-node .node-transfer-btn {
    height: 19px;
    line-height: 19px;
    font-size: 12px;
    cursor: pointer;
    margin-top: 3px;
    padding: 0 5px;
    color: #fff;
    width: 36px;
    background-color: #EE4000;
}

.transform-team-node:hover {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 1px;
}

.transform-waiter {
    display: flex;
    cursor: pointer;
    padding-left: 25px;
}
.transform-waiter:hover {
    background-color: #eaeaea;
}
.transform-waiters .active {
    background-color: #eaeaea;
}
.transform-waiter-name,
.transform-waiter-type {
    height: 30px;
    line-height: 30px;
    font-size: 12px;
}
.transform-waiter-reception {
    position: relative;
    text-align: center;
}
.reception-icon {
    position: absolute;
    top: 6px;
    left: -23px;
    display: block;
    height: 18px;
    line-height: 18px;
    width: 18px;
    color: #fff;
    border-radius: 50%;
}
.transform-waiter-name {
    width: 240px;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.transform-waiter-type {
    width: 60px;
    text-align: center;
}
.transform-opt {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding-right: 2px;
}
.transform-submit-b {
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    cursor: pointer;
    margin: 5px 0;
    padding: 0 5px;
    color: #fff;
    background-color: #3dc998;
}
.transfer-bu-footer,
.transfer-team-footer,
.transfer-waiter-footer,
.transform-footer {
    display: flex;
    justify-content: flex-end;
    height: 55px;
    padding: 15px 20px;
    border-top: 1px solid #e5e5e5;
}
.transform-refrush-b,
.transform-cancel-b {
    width: 65px;
    height: 25px;
    line-height: 25px;
    font-size: 13px;
    text-align: center;
    cursor: pointer;
    margin-left: 15px;
}
.transform-refrush-b {
    background-color: #11b8f5;
    color: #fff;
}
.transform-cancel-b {
    background-color: #fff;
    border: 1px solid #dcdcdc;
    color: #a0a0a0;
}

.transform-body::-webkit-scrollbar {
    width: 8px;
}
.transform-body::-webkit-scrollbar-thumb {
    width: 8px;
    background: rgba(0, 0, 0, 0.3);
}
.transform-body::-webkit-scrollbar-track {
    background: transparent;
}
</style>

