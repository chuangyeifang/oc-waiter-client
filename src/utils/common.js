const instance = function() {
  var subId = 1000
  return {
    getPid() {
      return (
        subId++ + '-' +
                fragment() +
                fragment() + '-' +
                fragment() + '-' +
                fragment() + '-' +
                fragment() + '-' +
                fragment() + fragment() + fragment()
      )
    }
  }

  function fragment() {
    return Math.floor(65535 * (1 + Math.random())).toString(16).substring(1)
  }
}

const common = instance()

export default common
