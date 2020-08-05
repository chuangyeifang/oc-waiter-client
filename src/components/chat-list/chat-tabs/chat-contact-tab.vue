<template>
  <div class="chat-contact-tab-content noselect">
    <oc-chat-contact-bars />
    <div class="chat-contact-items">
      <div
        v-for="(item, index) in chatItems"
        :key="'ci-' + index"
        v-contextmenu:itemmenu
        :class="item.isSelected ? 'chat-item-selected' : 'chat-item'"
        @click.stop="selectChatItem(item.uid)"
        @mousedown="itemMousedown(item.uid)"
      >
        <div class="header">
          <img v-if="item.isSelected" src="../../../assets/images/chat/item/head_select.png" :style="{'-webkit-filter': item.isOnline ? '' : 'grayscale(100%)'}">
          <img v-else src="../../../assets/images/chat/item/head.png" :style="{'-webkit-filter': item.isOnline ? '' : 'grayscale(100%)'}">
        </div>
        <div class="content">
          <div class="name">{{ item.name }}</div>
          <div class="label">
            <div v-show="item.waitTime != 0" class="time">
              <span>{{ item.waitTime }}{{ item.timeUnit }}</span>
            </div>
            <div class="opt">
              <span class="close" @click.stop="closeChatItem(item.uid)" />
              <span v-show="item.count != 0" :class="{count: item.count }">
                <span>{{ item.count }}</span>
              </span>
            </div>
          </div>
        </div>
        <div :class="{ stick: item.isStick }" />
        <div :class="item.device == '1' ? 'device-computer' : 'device-phone'" />
      </div>
    </div>
    <v-contextmenu ref="itemmenu">
      <v-contextmenu-item @click="itemToStick">{{ stickMenuItemName }}</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      stickMenuItemName: ''
    }
  },
  computed: mapState({
    chatItems: state => state.chat.items,
    chatInfo: state => state.chat.chatInfo
  }),
  methods: {
    selectChatItem: function(uid) {
      this.$store.dispatch('chat/selectedItem', uid)
      this.$store.commit('editer/focus')
    },
    itemMousedown: function(uid) {
      this.selectChatItem(uid)
      if (this.chatInfo.isStick) {
        this.stickMenuItemName = '取消置顶'
      } else {
        this.stickMenuItemName = '置顶'
      }
    },
    closeChatItem: function(uid) {
      this.$_WS.closeChat(uid)
      this.$store.dispatch('chat/closeItem', uid)
    },
    itemToStick: function() {
      this.$store.commit('chat/toStick')
    }
  }
}
</script>

<style scoped>
.chat-contact-tab-content {flex: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden;}
.chat-contact-items { flex: 1; overflow-x: hidden; overflow-y: auto; }

/* item normal */
.chat-item { display: flex; position: relative; width: 225px; height: 40px; line-height: 40px; cursor: pointer; color: #626262; font-size: 14px; }
.chat-item:hover { background-color: #eaeaea; }
.chat-item .header { width: 35px; margin-left: 15px; }
.chat-item .header img { width: 25px; height: 25px; vertical-align: middle; filter:Gray;}
.chat-item .content { display: flex; flex-direction: row; flex: 1; }
.chat-item .content .name { flex: 1; max-width: 110px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;  }
.chat-item .content .label { display: flex; flex-direction: row; width: 70px; justify-content: flex-end;}
.chat-item .content .label .time { width: 40px; text-align:  center}
.chat-item .content .label .opt { width: 30px; line-height: 40px; position: relative; }
.chat-item .content .label .opt .close { background:url('../../../assets/images/chat/item/close.png') center no-repeat; z-index: 10; display: none;  width: 18px; height: 18px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); line-height: 15px;}
.chat-item .content .label .opt .count {z-index: 1; display: block; text-align: center;  width: 18px; height: 18px; border-radius: 50%; background-color: #11b8f5; color: #fff; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); line-height: 18px;}
.chat-item:hover .content .label .opt .close { display: block; }
.chat-item:hover .content .label .opt .count { display: none; }
.chat-item .stick { position: absolute; top: 0px; left: 0px; width: 16px; height: 16px; background: url('../../../assets/images/chat/item/top.png') top no-repeat; background-size: 16px 16px; }
.chat-item .device-computer {position: absolute; bottom: 6px; left: 30px; width: 16px; height: 16px; background: url('../../../assets/images/chat/item/computer.png') center no-repeat; background-size: 14px 14px;}
.chat-item .device-phone {position: absolute; bottom: 5px; left: 33px; width: 12px; height: 18px; background: url('../../../assets/images/chat/item/phone.png') center no-repeat; background-size: 10px 15px;}
/* item selected */
.chat-item-selected { background: linear-gradient(to right, #507EA4, #6ed2fe ); color: #fff; font-size: 14px; display: flex; position: relative; width: 225px; height: 70px; cursor: pointer;}
.chat-item-selected .header { width: 63px; line-height: 70px; }
.chat-item-selected .header img { width: 40px; height: 40px; vertical-align: middle; margin-left: 15px; }
.chat-item-selected .content { display: flex; flex-direction: column; flex: 1; height: 70px; align-items: flex-end; font-size: 14px; }
.chat-item-selected .content .name { height: 35px; padding-top: 10px; width: 100%; max-width: 165px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.chat-item-selected .content .label { display: flex; flex-direction: row; line-height: 30px; height: 30px; flex: 1; padding-bottom: 10px; }
.chat-item-selected .content .label .time {width: 30px; text-align:  center; }
.chat-item-selected .content .label .opt { width: 30px; position: relative; text-align:  center; }
.chat-item-selected .content .label .opt .close {  background:url('../../../assets/images/chat/item/close_hover.png') center no-repeat; z-index: 10;  width: 18px; height: 18px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
.chat-item-selected .content .label .opt .count {z-index: 1; display: block; text-align: center;  width: 18px; height: 18px; border-radius: 50%; background-color: #11b8f5; color: #fff; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); line-height: 15px;}
.chat-item-selected .stick { position: absolute; top: 0px; left: 0px; width: 30px; height: 30px; background: url('../../../assets/images/chat/item/top.png') top no-repeat; background-size: 30px 30px; }
.chat-item-selected .device-computer {position: absolute; bottom: 14px; left: 48px; width: 16px; height: 16px; background: url('../../../assets/images/chat/item/computer.png') center no-repeat; background-size: 16px 16px;}
.chat-item-selected .device-phone {position: absolute; bottom: 14px; left: 48px; width: 12px; height: 18px; background: url('../../../assets/images/chat/item/phone.png') center no-repeat; background-size: 12px 18px;}
</style>
