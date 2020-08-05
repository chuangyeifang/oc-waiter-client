<template>
  <div class="status-box">
    <span class="statuc-icon">
      <i :class="onlineStatusClass" @click.stop="openSataus" />
    </span>
    <div :class="['dropdown-list', { active: dropdown}]">
      <div class="dropdown-item" @click="statusChanage('1')"><i class="status-online" /> 在线</div>
      <div class="dropdown-item" @click="statusChanage('2')"><i class="status-busy" /> 忙碌</div>
      <div class="dropdown-item" @click="statusChanage('3')"><i class="status-offline" /> 挂起</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      dropdown: false,
      onlineStatusClass: 'status-online',
      event: null
    }
  },
  watch: {
    dropdown: function(n, o) {
      if (n) {
        this.event = () => {
          if (this.dropdown) {
            this.dropdown = !this.dropdown
          }
        }
        this.event.bind(this)
        document.addEventListener('click', this.event)
      } else {
        document.removeEventListener('click', this.event)
        this.event = null
      }
    },
    status: function(n) {
      this.initStatus(n)
    }
  },
  mounted() {
    this.initStatus(this.status)
  },
  methods: {
    initStatus(val) {
      if (val === '1') {
        this.onlineStatusClass = 'status-online'
      } else if (val === '2') {
        this.onlineStatusClass = 'status-busy'
      } else if (val === '3') {
        this.onlineStatusClass = 'status-offline'
      }
    },
    statusChanage: function(val) {
      if (val === '1') {
        this.onlineStatusClass = 'status-online'
      } else if (val === '2') {
        this.onlineStatusClass = 'status-busy'
      } else if (val === '3') {
        this.onlineStatusClass = 'status-offline'
      }
      this.$emit('change', val)
      this.dropdown = !this.dropdown
    },
    openSataus: function() {
      if (!this.dropdown) {
        document.body.click()
      }
      this.dropdown = !this.dropdown
    }
  }
}
</script>

<style scoped>
.status-box { position: absolute; z-index: 10; }
.dropdown-list { display: none; width: 80px; position:absolute; left:15px; top: 15px; background-color:#fff; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); }
.dropdown-item { cursor: pointer; padding: 5px 8px;}
.dropdown-item:hover { background-color: #eaeaea; }
.status-box .active { display:block; }

.status-online, .status-busy, .status-offline{ display: inline-block ; line-height: 1; padding-right: 1px; vertical-align: middle;}
.status-online::before {  content: url("../../assets/images/status/online.png"); }
.status-busy::before { content: url("../../assets/images/status/busy.png"); }
.status-offline::before { content: url("../../assets/images/status/offline.png"); }
</style>
