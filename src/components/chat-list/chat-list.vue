<template>
  <div class="chat-aside">
    <oc-chat-search @search="switchTab" />
    <div class="chat-tab-container">
      <div ref="tabs" class="chat-tabs">
        <div ref="tabLine" class="chat-tab-line" />
        <i :class="['chat-contact-tab', {active: tabIndex == 0}]" @click="switchTab(0)" />
        <i :class="['chat-history-tab', {active: tabIndex == 1}]" @click="switchTab(1)" />
        <i :class="['chat-offline-tab', {active: tabIndex == 2}]" @click="switchTab(2)" />
        <div v-if="chatVariation" class="red" />
      </div>
      <div class="chat-tab-contents">
        <oc-chat-contact-tab v-show="tabIndex == 0" />
        <oc-chat-history-tab v-show="tabIndex == 1" />
        <oc-chat-offline-tab v-show="tabIndex == 2" />
      </div>
    </div>
    <div class="system-bar">
      <oc-system-menus />
      <div class="my_hty_record" title="我的聊天记录" @click="openMyChatRecords" />
    </div>
    <oc-my-chat-records v-model="showMyChatRecords" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      tabIndex: 0,
      showMyChatRecords: false
    }
  },
  computed: mapState({
    waittingCount: state => state.chat.waittingCount,
    chatVariation: state => state.chat.chatVariation
  }),
  methods: {
    switchTab: function(index) {
      if (this.tabIndex !== index) {
        this.tabIndex = index
        this.$store.dispatch('chat/switchChatTab', index)
        const tabsBox = this.$refs.tabs
        const width = tabsBox.offsetWidth / 3
        this.$refs.tabLine.style = 'visibility: visible; width: ' + width + 'px; transform: translate3d(' +
                    width * index + 'px, 0px, 0px);'
      }
    },
    openMyChatRecords: function() {
      this.dropdown = !this.dropdown
      this.showMyChatRecords = true
    }
  }
}
</script>

<style scoped>
.chat-aside { display: flex; flex-direction: column; width: 225px; overflow: hidden; }
.chat-tab-container { display: flex; flex-direction: column; flex: 1; overflow: hidden; background-color: #f8f8f8; }

.chat-tabs { position: relative;  margin-left: 0; margin-right: 0; height: 42px; z-index: 1; display: flex; background-color: #f8f8f8; border-bottom: 1px solid #e5e5e5; }
.chat-tabs::before { box-sizing: border-box; }
.chat-tabs::after { box-sizing: border-box; }
.chat-tabs i { display: block; flex:1; height: 42px; float: left; }

.chat-tabs .red {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 100%;
    background-color: red;
    top: 10px;
    left: 46px;
}

.chat-contact-tab {  background: url('../../assets/images/chat/tabs/contacts.png') center no-repeat; }
.chat-contact-tab:hover { background: url('../../assets/images/chat/tabs/contacts_hover.png') center no-repeat; }
.chat-contact-tab.active { background: url('../../assets/images/chat/tabs/contacts_selected.png') center no-repeat; }

.chat-history-tab { background: url('../../assets/images/chat/tabs/history.png') center no-repeat; }
.chat-history-tab:hover { background: url('../../assets/images/chat/tabs/history_hover.png') center no-repeat; }
.chat-history-tab.active { background: url('../../assets/images/chat/tabs/history_selected.png') center no-repeat; }

.chat-offline-tab { background: url('../../assets/images/chat/tabs/offline.png') center no-repeat; }
.chat-offline-tab:hover { background: url('../../assets/images/chat/tabs/offline_hover.png') center no-repeat; }
.chat-offline-tab.active { background: url('../../assets/images/chat/tabs/offline_selected.png') center no-repeat; }

.chat-tab-line { width: 33.3333%; display: block; height: 2px; box-sizing: border-box; background-color: #2d8cf0; position: absolute; left: 0; bottom: 1px; z-index: 1; transition: transform .3s ease-in-out,-webkit-transform .3s ease-in-out; transform-origin: 0 0;}

.chat-tab-contents { flex: 1; overflow: hidden; height: 100%; background-color: #f8f8f8; }

.system-bar { display: flex; flex-direction: row; height: 41px; background-color: #fff; border-top: 1px solid #e5e5e5; }
.my_hty_record {
  margin-left: 15px;
  background: url("../../assets/images/system/bar/my_hty_record.png") center no-repeat;
  background-size: 20px 20px;
  width: 20px;
  height: 40px; }
.my_hty_record:hover { background: url("../../assets/images/system/bar/my_hty_record_hover.png") center no-repeat; }

</style>
