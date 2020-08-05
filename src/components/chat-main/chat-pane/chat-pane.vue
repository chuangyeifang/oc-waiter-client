<template>
  <div ref="chatPanes" class="chat-panes">
    <div
      v-for="(records, index) in chatRecords"
      v-show="records.show"
      :key="index"
      class="chat-pane"
    >
      <oc-chat-record :records="records" /></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: mapState({
    chatRecords: state => state.chat.chatRecords
  })
}
</script>

<style scoped>
.chat-panes { display: flex; flex-direction: column; flex: 1; overflow: hidden; position: relative; background-color: #f8f8f8; }
.chat-pane { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
</style>
