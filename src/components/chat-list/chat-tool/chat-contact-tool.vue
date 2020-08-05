<template>
  <div class="chat-list-bar noselect">
    <div class="reception-box">
      接待：
      <span>{{ itemLength }}</span>
    </div>
    <div class="operation-box">
      <div class="chat-sort" @click.stop="openSortDropdown">
        <span>排序</span>
        <i class="chat-sort-icon" />
      </div>
      <div class="chat-clear" title="清除离线客户" @click="clearChatItem">
        <i class="chat-clear-icon" />
      </div>
      <div v-show="dropdown" class="chat-sort-dropdown">
        <div @click="enterTime(2)">
          <span>联系时间</span>
          <i class="desc-icon" />
        </div>
        <div class="menu-line" />
        <div @click="enterTime(4)">
          <span>等待时间</span>
          <i class="desc-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      dropdown: false,
      sortActive: -1,
      event: null
    }
  },
  computed: mapState({
    itemLength: state => state.chat.itemLength
  }),
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
    clearChatItem: function() {
      this.$store.dispatch('chat/clearOfflineItems')
    },
    openSortDropdown: function() {
      if (!this.dropdown) {
        document.body.click()
      }
      this.dropdown = !this.dropdown
    },
    enterTime: function(index) {
      this.dropdown = !this.dropdown
      switch (index) {
        case 1:
          this.$store.commit('chat/sortEnterTime', true)
          break
        case 2:
          this.$store.commit('chat/sortEnterTime', false)
          break
        case 3:
          this.$store.commit('chat/sortWaitTime', false)
          break
        case 4:
          this.$store.commit('chat/sortWaitTime', true)
          break
      }
    }
  }
}
</script>

<style scoped>
.chat-list-bar {
    display: flex;
    width: 100%;
    height: 42px;
    background-color: #f8f8f8;
    font-size: 13px;
    color: #a0a0a0;
    line-height: 40px;
    border-bottom: 1px solid #e5e5e5;
}
.reception-box {
    width: 86px;
    padding-left: 15px;
}
.operation-box {
    display: flex;
    flex-direction: row;
    flex: 1;
    justify-content: flex-end;
}

.chat-sort,
.chat-clear {
    padding-right: 15px;
    cursor: pointer;
}

.chat-sort-dropdown {
    position: absolute;
    width: 95px;
    top: 120px;
    left: 130px;
    z-index: 9999;
    background-color: #ffffff;
    padding: 8px 0px;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
}
.chat-sort-dropdown > div {
    display: flex;
    height: 25px;
    line-height: 25px;
    cursor: pointer;
    font-size: 12px;
    color: #000;
    padding: 0px 12px;
}

.chat-sort-dropdown > div:hover {
    color: #fff;
    background-color: #11b8f5;
}
.chat-sort-dropdown > div:hover .desc-icon {
    background: url("../../../assets/images/chat/tools/desc_selected.png") center no-repeat;
}
.chat-sort-dropdown > div:hover .asc-icon {
    background: url("../../../assets/images/chat/tools/asc_selected.png") center no-repeat;
}
.chat-sort-dropdown .menu-line {
    height: 0;
    border-bottom: 1px solid #dcdcdc;
    margin: 5px 12px;
}
.chat-sort-icon,
.chat-clear-icon {
    display: inline-block;
    vertical-align: middle;
    width: 12px;
    height: 12px;
    margin-left: 4px;
}
.chat-sort-icon {
    background: url("../../../assets/images/chat/tools/sort.png") left no-repeat;
    background-size: 12px 12px;
}
.chat-clear-icon {
    background: url("../../../assets/images/chat/tools/clear.png") left no-repeat;
    background-size: 12px 12px;
}

.desc-icon,
.asc-icon {
    margin-left: 5px;
    width: 14px;
    height: 25px;
    background-size: 14px 14px;
}
.desc-icon {
    background: url("../../../assets/images/chat/tools/desc.png") center no-repeat;
}
.asc-icon {
    background: url("../../../assets/images/chat/tools/asc.png") center no-repeat;
}
</style>
