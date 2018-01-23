export const S = (function(ls) {
  function set(k, v) {
    ls.setItem(k, JSON.stringify(v))
  }

  function get(k) {
    return JSON.parse(ls.getItem(k))
  }

  function remove(k) {
    ls.removeItem(k)
  }

  function clear() {
    ls.clear()
  }

  return {
    set,
    get,
    remove,
    clear
  }
})(localStorage)

export const FAVORITE_SONGS = '_xx_favorite_songs'

export const SEARCH_HISTORY = '_xx_search_history'

export const LISTEN_HISTORY = '_xx_listen_history'