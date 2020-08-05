<template>
  <div>
    <div class="oc-button" @click="click">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    click: function() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.oc-button {
    color: #fff;
    padding: 5px 20px;
    line-height: 20px;
    background-color: #11b8f5;
    cursor: pointer;
    margin: 0 8px;
}
</style>
