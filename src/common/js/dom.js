export function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }

  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')

  return reg.test(el.className)
}

const div = document.createElement('div')

const vendor = (() => {
  let map = {
    webkit: 'webkitTransform',
    moz: 'MozTransform',
    o: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in map) {
    let value = map[key]
    if (div.style[value] !== undefined) {
      return key
    }
  }

  return false
})()

export function prefixStyle(el) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return el
  }

  return vendor + el.charAt(0).toUpperCase() + el.substr(1)
}