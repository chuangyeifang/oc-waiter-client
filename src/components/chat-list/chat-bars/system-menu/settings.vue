<template>
  <div>
    <oc-dialog
      v-model="showSettings"
      title="系统设置"
      :submit-hide="true"
      :cancel-hide="true"
      width="500"
    >
      <div class="oc-settings">
        <div class="sound-setting">
          <div class="setting-head">声音设置:</div>
          <div class="setting-body">
            <div style="height: 20px;">
              <el-checkbox v-model="isMute" @change="muteChanage">关闭所有声音</el-checkbox>
            </div>
          </div>
        </div>
      </div>
    </oc-dialog>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'show',
    event: 'change'
  },
  props: {
    show: Boolean
  },
  data() {
    return {
      showSettings: this.show,
      isMute: localStorage.isMute === 'true'
    }
  },
  watch: {
    show(n) {
      this.showSettings = n
      this.$emit('change', n)
    },
    showSettings(n) {
      this.$emit('change', n)
    }
  },
  mounted() {
    console.log(localStorage.isMute)
  },
  methods: {
    muteChanage: function(_isMute) {
      localStorage.isMute = _isMute
    },
    noexec: function() {
      // ignore
    }
  }
}
</script>

<style scoped>
.setting-head {
    font-size: 13px;
}
.setting-body {
    margin: 10px 15px 10px 15px;
}
</style>
