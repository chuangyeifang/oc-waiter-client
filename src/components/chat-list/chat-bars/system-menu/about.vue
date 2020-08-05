<template>
  <div>
    <oc-dialog
      v-model="showAbout"
      title="关于-就是爱"
      :submit-hide="true"
      cancel-value="关闭"
      width="520"
    >
      <div class="oc-form">
        <p>当前版本号：1.0.1</p>
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
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showAbout: this.show
    }
  },
  watch: {
    show(n) {
      this.showAbout = n
      this.$emit('change', n)
    },
    showAbout(n) {
      this.printChatRecords()
      this.$emit('change', n)
    }
  },
  methods: {
    printChatRecords: function() {
      this.$store.dispatch('chat/printChatRecords')
    },
    noexec: function() {
      // ignore
    }
  }
}
</script>

<style scoped>

</style>
