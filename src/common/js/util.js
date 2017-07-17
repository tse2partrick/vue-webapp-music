/* export function filter(arr) {
  let ret = []

  arr.forEach((item) => {
    let id = item.songid
    if (ret.indexOf(id) === -1) {
      ret.push(id)
    }
  })

  arr = arr.filter((item) => {
    let firstIndex = ret.findIndex((i) => {
      return item.songid === i
    })
    ret.splice(firstIndex - 1, 1)
    return item.songid === ret[firstIndex]
  })

  return arr
} */

export function filter(arr) {
  for (var i = 0, temp = {}, result = []; i < arr.length; i++) {
    var ci = arr[i]
    var u = ci.songid
    if (temp[u]) {
      continue
    }

    temp[u] = true
    result.push(ci)
  }

  return result
}