import storage from 'good-storage'

// localStorage数组保存唯一值函数，超过某个长度自动删除最后一个
export function save(arrName, val, maxLen, compare) {
  let arr = storage.get(arrName, [])
  let index = arr.findIndex(compare)

  if (index === 0) {
    return arr
  }

  if (index > 0) {
    arr.splice(index, 1)
  }

  arr.unshift(val)

  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }

  storage.set(arrName, arr)
  return arr
}

export function saveSearchHistory(val) {
  const arr = 'searchHistoryArr'
  const maxLen = 15

  return save(arr, val, maxLen, (item) => {
    return item === val
  })
}

export function deleteSearchHistory(val) {
  let arrName = 'searchHistoryArr'
  if (!val) {
    storage.set(arrName, [])
    return []
  }

  let arr = storage.get(arrName)
  let index = arr.findIndex((item) => {
    return item === val
  })

  arr.splice(index, 1)

  storage.set(arrName, arr)

  return arr
}

export function savePlayHistory(val) {
  const arr = 'playHistoryArr'
  const maxLen = 1000

  return save(arr, val, maxLen, (item) => {
    return item.songid === val.songid
  })
}