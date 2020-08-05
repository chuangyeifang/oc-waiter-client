export default (function() {
  var audioElm

  function init() {
    audioElm = document.createElement('audio')
    audioElm.src = require('../assets/audio/msg.mp3')
    document.body.appendChild(audioElm)
  }
  init()

  return {
    play: function() {
      if (localStorage.isMute !== 'true') {
        audioElm.play()
      }
    }
  }
})()
