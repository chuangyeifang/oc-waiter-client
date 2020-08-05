<template>
  <div v-show="show" class="dialog-box">
    <div class="dialog-mask" />
    <div class="dialog-warp" @click="noexec">
      <div class="dialog-container">
        <div class="dialog-content">
          <a class="dialog-close" @click.stop="cancel" />
          <div class="dialog-header">
            <div class="dialog-header-inner">{{ title }}</div>
          </div>
          <div class="dialog-body" :style="{ width: width + 'px'}">
            <slot />
          </div>
          <div v-if="!hideFooter" class="dialog-footer">
            <div v-if="!submitHide" class="dialog-submit" @click.stop="submit">{{ submitValue }}</div>
            <div v-if="!cancelHide" class="dialog-cancel" @click.stop="cancel">{{ cancelValue }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'show',
    event: 'change'
  },
  props: {
    title: {
      type: String,
      default: '对话框'
    },
    width: {
      type: String,
      default: '260'
    },
    show: Boolean,
    submitValue: {
      type: String,
      default: '确认'
    },
    cancelValue: {
      type: String,
      default: '取消'
    },
    hideFooter: Boolean,
    submitHide: Boolean,
    cancelHide: Boolean
  },
  data() {
    return {
      execSubmitTimeout: null
    }
  },
  methods: {
    cancel: function() {
      this.$emit('change', !this.show)
      this.$emit('cancel')
    },
    submit: function() {
      if (this.execSubmitTimeout) {
        clearTimeout(this.execSubmitTimeout)
      }
      this.execSubmitTimeout = setTimeout(() => {
        this.$emit('submit')
        this.execSubmitTimeout = null
      }, 100)
    },
    noexec: function() {
      // ignore
    }
  }
}
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  height: 100%;
  z-index: 1000;
}
.dialog-warp {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  outline: 0;
}
.dialog-container {
  position: absolute;
  top: 50%;
  left: 50%;
}
.dialog-content {
  transform: translate(-50%, -50%);
}
.dialog-content {
  position: relative;
  background-color: #fff;
  border: 0;
  background-clip: padding-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.dialog-close {
  position: absolute;
  display: block;
  width: 11px;
  height: 35px;
  right: 15px;
  top: 0px;
  overflow: hidden;
  cursor: pointer;
  z-index: 1;
  color: #000;
  background: url("../../assets/images/dialog/close.png") center no-repeat;
  background-size: 11px 11px;
}
.dialog-header {
  padding: 0px 15px;
  height: 35px;
  font-size: 13px;
  background: linear-gradient(to right, #507EA4, #6ed2fe);
}
.dialog-header-inner {
  display: inline-block;
  width: 100%;
  line-height: 35px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dialog-body {
  padding: 15px;
  line-height: 1.5;
  min-height: 80px;
  min-width: 260px;
  max-width: 1024px;
  max-height: 768px;
}
.dialog-footer {
  padding: 12px 20px;
  text-align: right;
  font-size: 13px;
}
.dialog-footer > div {
  cursor: pointer;
  margin-left: 15px;
  display: inline-block;
}
.dialog-submit {
  color: #fff;
  padding: 5px 20px;
  line-height: 20px;
  background-color: #11b8f5;
}
.dialog-cancel {
  color: #a0a0a0;
  padding: 5px 20px;
  line-height: 20px;
  border: 1px solid #dcdcdc;
}
</style>
