<template>
  <div class="oc-select noselect">
    <div class="oc-select-input" :style="{width: width}">
      <input readonly :value="content" placeholder="请选择" @click.stop="openDropdown">
      <div :class="['select-arrow', { 'select-arrow-selected': dropdown }]" @click.stop="openDropdown" />
    </div>
    <div v-show="dropdown" class="oc-select-dropdown" :style="{width: width}">
      <div class="oc-select-scroll">
        <div
          v-for="(option, index) in options"
          :key="index"
          :title="option[label]"
          @click="optionChange(option)"
        >
          <span>{{ option[label] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'inputValue',
    event: 'change'
  },
  props: {
    options: {
      type: Array,
      default() {
        return []
      }
    },
    label: {
      type: String,
      default: 'label'
    },
    value: {
      type: String,
      default: 'value'
    },
    width: {
      type: String,
      default: ''
    },
    inputValue: {
      type: [String, Number],
      default() {
        return undefined
      }
    }
  },
  data() {
    return {
      dropdown: false,
      content: '',
      clickEvent: null,
      defaultInputValue: this.inputValue,
      defaultInputName: ''
    }
  },
  watch: {
    inputValue: function() {
      this.init()
    }
  },
  methods: {
    init: function() {
      if (this.inputValue) {
        for (const key in this.options) {
          if (this.inputValue === this.options[key][this.value]) {
            this.content = this.options[key][this.label]
            break
          }
        }
      } else {
        this.content = ''
      }
    },
    optionChange: function(option) {
      this.$emit('change', option[this.value])
      this.hideDropdown()
    },
    openDropdown: function() {
      if (!this.dropdown && this.options.length > 0) {
        this.dropdown = true
        this.clickEvent = () => {
          this.dropdown = !this.dropdown
          document.body.removeEventListener('click', this.clickEvent)
        }
        this.clickEvent.bind(this)
        document.body.addEventListener('click', this.clickEvent)
      } else {
        this.dropdown = false
        document.body.removeEventListener('click', this.clickEvent)
      }
    },
    hideDropdown: function() {
      if (this.dropdown) {
        this.dropdown = false
      }
      if (this.clickEvent) {
        document.body.removeEventListener('click', this.clickEvent)
      }
    }
  }
}
</script>

<style scoped>
.oc-select {
    position: relative;
}
.oc-select-input {
    position: relative;
}

.oc-select-input:hover input {
    border-bottom: 1px solid #000;
}

.oc-select-input input {
    width: 100%;
    height: 25px;
    border: 0;
    outline: 0;
    cursor: pointer;
    font-size: 13px;
    margin: 0;
    padding: 3px 8px 0 8px;
    border-bottom: 1px solid #9c9c9c;
}

.oc-select-dropdown {
    width: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    background-color: #fff;
    overflow: hidden;
    max-height: 140px;
    z-index: 5000;
}

.oc-select-scroll {
    flex: 1;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
}

.oc-select-scroll > div {
    height: 28px;
    line-height: 28px;
    padding: 0px 8px;
    color: #606266;
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.oc-select-scroll > div:hover {
    background-color: #f5f7fa;
}
.select-arrow {
    position: absolute;
    background: url("../../assets/images/icon/arrow.png") center no-repeat;
    background-size: 8px 4px;
    width: 20px;
    height: 25px;
    right: 0px;
    top: 0px;
}

.oc-select-input .select-arrow-selected {
    transform: rotateZ(180deg);
}
</style>
