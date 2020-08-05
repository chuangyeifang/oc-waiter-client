<template>
  <div class="chat-common">
    <div class="chat-common-tabs">
      <div :class="['customer', {active: tabIndex == 2}]" @click="switchTab(2)">客户</div>
      <div :class="['commonword', {active: tabIndex == 3}]" @click="switchTab(3)">常用话术</div>
      <div class="common-blank" />
      <div class="common-refrush" @click.stop="commonRefrush" />
    </div>
    <div class="chat-common-tab-contents">
      <oc-common-customer-tab v-show="tabIndex == 2" />
      <oc-common-term-tab v-show="tabIndex == 3" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {}
  },
  computed: mapState({
    tabIndex: state => state.common.index
  }),
  methods: {
    switchTab: function(index) {
      if (this.tabIndex !== index) {
        this.$store.commit('common/switchTab', index)
        this.$store.dispatch('common/reload')
      }
    },
    commonRefrush: function() {
      this.$store.dispatch('common/refrush')
    }
  }
}
</script>

<style scoped>

.chat-common {
  width: 450px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}
.chat-common-tab-contents {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-common-tabs {
  position: fixed;
  top: 43px;
  right: 0;
  z-index: 20;
  display: flex;
  flex: 1;
  background-color: transparent;
  width: 450px;
  -webkit-app-region: no-drag;
  justify-items: flex-start;
}
.chat-common-tabs .customer,
.chat-common-tabs .commonword{
  color: #fff;
  font-size: 13px;
  width: 80px;
  line-height: 25px;
  text-align: center;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
}
.chat-common-tabs .active {
  background: linear-gradient(to bottom, #3e6d99, #79d7ff );
}
.common-blank {
  flex: 1
}
.chat-common-tabs .common-refrush {
  width: 40px;
  text-align: center;
  cursor: pointer;
}

.common-refrush { width: 16px; height: 25px;  background: url("../../assets/images/common/refrush.png") center no-repeat; background-size: 16px 16px;}
</style>
