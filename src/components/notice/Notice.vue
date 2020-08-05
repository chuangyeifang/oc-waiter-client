<template>
  <div v-show="show" :class="['gl-message', site]">
    <div>{{ text }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true,
      text: '提示框',
      site: 'center'
    }
  }
}
</script>

<style scoped>
.gl-message {
    position: fixed;  max-width: 350px; min-width: 200px; font-size: 13px;
    line-height: 30px; padding: 8px 15px; background-color: #edf2fc; color: #fff;
    border: 1px solid #ebeef5; box-sizing: border-box;
    border-radius: 5px; overflow: hidden; white-space: wrap;
    background: rgba(0, 0, 0, 0.8);
    text-align: center;
    word-spacing: 1px;
    word-wrap: break-word; word-break: break-all; z-index: 9999;
}
.bottom-right {
  bottom: 2px;
  right: 2px;
  max-width: 200px;
}
.top-center {
  top: 50px;
  left: 50%;
  transform: translate(-50%, 0)
}
.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%)
}
.bottom-center {
  bottom: 15px;
  left: 50%;
  transform: translate(-50%, 0)
}
</style>
