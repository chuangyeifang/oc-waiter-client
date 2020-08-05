<template>
  <div v-show="show" class="dialog-box">
    <div class="dialog-mask" />
    <div class="dialog-warp">
      <div class="dialog-container">
        <div class="dialog-content">
          <a class="dialog-close" @click="show=!show" />
          <div class="dialog-header">
            <div class="dialog-header-inner">{{ title }}</div>
          </div>
          <div class="dialog-body">
            <div>{{ text }}</div>
          </div>
          <div class="dialog-footer">
            <div class="dialog-submit" @click.stop="submit">{{ submitValue }}</div>
            <div class="dialog-cancel" @click.stop="cancel">{{ cancelValue }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true,
      title: '提示',
      text: '确认要这样操作吗？',
      submitValue: '确认',
      cancelValue: '取消'
    }
  }
}
</script>

<style scoped>
.dialog-box { transition: all .9s ease-in-out; }
.dialog-mask { position: fixed; top: 0; bottom: 0; left: 0; right: 0; background-color: rgba(0, 0, 0, .5); height: 100%; z-index: 9999; }
.dialog-warp { position: fixed; top: 0; bottom: 0; left: 0; right: 0; z-index: 9999; outline: 0; }
.dialog-container { position: absolute; top: 50%; left: 50%; }
.dialog-content { transform: translate(-50%, -50%); }
.dialog-content { position: relative; background-color: #fff; border: 0; background-clip: padding-box; box-shadow: 0 4px 12px rgba(0, 0, 0, .15) }
.dialog-close { position: absolute; display: block; width: 11px; height: 35px; right: 8px; top: 0px; overflow: hidden; cursor: pointer; z-index: 1;  color: #000; background: url("../../assets/images/dialog/close.png") center no-repeat; background-size: 11px 11px; }
.dialog-header { padding: 0px 15px; height: 35px; font-size: 13px; background: linear-gradient(to right, #507EA4, #6ed2fe ); }
.dialog-header-inner { display: inline-block; width: 100%; line-height: 35px; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dialog-body { padding: 15px; line-height: 1.5; min-height: 80px; min-width: 260px; }
.dialog-footer { padding: 12px 20px; text-align: right; font-size: 13px; }
.dialog-footer > div { cursor: pointer; margin-left: 15px; display: inline-block; }

.dialog-submit { color: #fff; padding: 5px 20px; line-height: 20px; background-color: #11b8f5;  }
.dialog-cancel { color: #a0a0a0; padding: 5px 20px; line-height: 20px; border: 1px solid #dcdcdc; }
</style>
