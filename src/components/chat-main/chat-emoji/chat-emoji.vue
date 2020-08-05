<template>
  <div>
    <div class="open-emoji" title="选择表情" @click.stop="show = !show" />
    <div v-show="show" class="emoji-box" @click.stop="noexc">
      <div class="emoji-header" />
      <img v-for="(emoji, index) in emojis" :key="index" :title="emoji.name" :src="emoji.src" @click="selectEmoji(emoji)">
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      emojis: this.$Emoji.getEmojis(),
      event: null
    }
  },
  watch: {
    show: function(n, o) {
      if (n) {
        this.event = () => {
          if (this.show) {
            this.show = !this.show
          }
        }
        this.event.bind(this)
        document.body.addEventListener('click', this.event)
      } else {
        document.body.removeEventListener('click', this.event)
        this.event = null
      }
    }
  },
  methods: {
    selectEmoji: function(emoji) {
      this.$emit('selected', this.$Emoji.adapter(emoji.name))
      this.show = false
    },
    noexc: function() {
      // ignore
    }
  }
}
</script>

<style scoped>
.emoji-box { position: absolute; width: 380px; height: 160px; left: 0px; background-color: #fff; top:-160px; z-index: 999;
    box-shadow: 3px 3px 10px rgba(55, 55, 55, .3); padding: 15px 8px; }
.emoji-box img { width: 25px; height: 25px; margin-left: 8px; margin-bottom: 8px; cursor: pointer;}
.emoji-header { text-align: right; }
.emoji-header span { cursor: pointer; }

.open-emoji { background-size: 20px 20px; width: 20px; height: 44px; cursor: pointer; }
.open-emoji { margin: 0 15px; background: url("../../../assets/images/chat/bar/emoji.png") center no-repeat; }
.open-emoji:hover { background: url("../../../assets/images/chat/bar/emoji_hover.png") center no-repeat; }
</style>
