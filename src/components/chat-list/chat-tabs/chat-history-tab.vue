<template>
  <div class="chat-history-tab-content">
    <div class="chat-history-items">
      <div
        v-for="(item, index) in chatHistoryItems"
        :key="'chi-' + index"
        :class="{'chat-item': !item.isSelected, 'chat-item-selected': item.isSelected}"
        @click.stop="selectChatHtyItem(item.uid)"
      >
        <div class="header">
          <img v-if="item.isSelected" src="../../../assets/images/chat/item/head_select.png" :style="{'-webkit-filter': item.isOnline ? null : 'grayscale(100%)'}">
          <img v-else src="../../../assets/images/chat/item/head.png" :style="{'-webkit-filter': item.isOnline ? null : 'grayscale(100%)'}">
        </div>
        <div class="content">
          <div class="name">{{ item.name }}</div>
          <div class="label">
            <div class="time" />
            <div class="opt">
              <span class="close" @click.stop="closeHtyItem(item.uid)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: mapState({
    chatHistoryItems: state => state.chat.htyItems
  }),
  methods: {
    selectChatHtyItem: function(uid) {
      this.$store.dispatch('chat/selectedHtyItem', uid)
      this.$store.commit('editer/focus')
    },
    closeHtyItem: function(uid) {
      this.$store.dispatch('chat/closeHtyItem', uid)
    }
  }
}
</script>

<style scoped>
.chat-history-tab-content { flex: 1; overflow-x: hidden; overflow-y: auto; height: 100%; transition: all .5s;}
.chat-history-items { flex: 1; overflow-x: hidden; overflow-y: auto; }
/* item normal */
.chat-item { display: flex; position: relative; width: 225px; height: 40px; line-height: 40px; cursor: pointer; transition: all .3s; color: #626262; font-size: 14px; }
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
/* item selected */
.chat-item-selected { background: linear-gradient(to right, #507EA4, #6ed2fe ); color: #fff; font-size: 14px; display: flex; position: relative; width: 225px; height: 70px; cursor: pointer; transition: all .3s;}
.chat-item-selected .header { width: 63px; line-height: 70px; }
.chat-item-selected .header img { width: 40px; height: 40px; vertical-align: middle; margin-left: 15px; }
.chat-item-selected .content { display: flex; flex-direction: column; flex: 1; height: 70px; align-items: flex-end; font-size: 14px; }
.chat-item-selected .content .name { height: 35px; padding-top: 10px; width: 100%; max-width: 170px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.chat-item-selected .content .label { display: flex; flex-direction: row; line-height: 30px; height: 30px; flex: 1; padding-bottom: 10px; }
.chat-item-selected .content .label .time {width: 30px; text-align:  center; }
.chat-item-selected .content .label .opt { width: 30px; position: relative; text-align:  center; }
.chat-item-selected .content .label .opt .close {  background:url('../../../assets/images/chat/item/close_hover.png') center no-repeat; z-index: 10;  width: 18px; height: 18px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
.chat-item-selected .content .label .opt .count {z-index: 1; display: block; text-align: center;  width: 18px; height: 18px; border-radius: 50%; background-color: #11b8f5; color: #fff; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); line-height: 15px;}
.chat-item-selected .stick { position: absolute; top: 0px; left: 0px; width: 30px; height: 30px; background: url('../../../assets/images/chat/item/top.png') top no-repeat; background-size: 30px 30px; }

</style>
