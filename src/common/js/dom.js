export function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }

  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function removeClass(el, className) {
  if (!hasClass(el, className)) {
    return
  }

  let classes = el.className.split(' ')
  let i = classes.findIndex((item) => {
    return item === className
  })

  if (i >= 0) {
    classes.splice(i, 1)
  }

  el.className = classes.join(' ')
}

export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}