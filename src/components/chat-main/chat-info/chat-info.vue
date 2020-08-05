<template>
  <div v-if="chatInfo" class="chat-info">
    <div class="header">
      <img src="../../../assets/images/chat/item/head.png">
    </div>
    <div class="name">{{ chatInfo.name }}</div>
    <div v-if="chatInfo.skillName" class="skill-info">
      <div class="icon" />
      <div class="name">{{ chatInfo.skillName }}</div>
    </div>
    <div class="chat-info-tool">
      <oc-chat-transfer />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: mapState({
    chatInfo: state => state.chat.chatInfo
  })
}
</script>

<style scoped>
.chat-info {
  display: flex;
  height: 40px;
  background-color: #fff;
  border-bottom: 1px solid #e5e5e5;
}
.chat-info .header {
  height: 40px;
  width: 25px;
  margin: 8px 15px 0px 15px;
}
.chat-info .header img {
  height: 25px;
  width: 25px;
}
.chat-info .name {
  font-size: 14px;
  height: 40px;
  line-height: 40px;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.chat-info .skill-info {
  display: flex;
  flex-direction: row;
  margin: 10px 0 0 20px;
  height: 21px;
  background-color: #64B2DC;
  border-radius: 3px;
}
.skill-info .icon {
  width: 22px;
  height: 20px;
  background: url('../../../assets/images/chat/info/skill.png') center no-repeat;
  background-size: 22px 20px;
}
.skill-info .name {
  height: 21px;
  line-height: 21px;
  color: #ffffff;
  letter-spacing: 1px;
  font-size: 12px;
  max-width: 260px;
  padding: 0 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.chat-info .chat-info-tool {
  display: flex;
  height: 40px;
  flex: 1;
  flex-direction: row;
  justify-content: flex-end;
}
</style>
