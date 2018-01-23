var count = 0

export function originJsonp(url, opts, fn) {
  var cb = opts.callback || opts.jsonpCallback || '__jp' + (count++)

  for (var k in opts) {
    var v = opts[k]
    if (v !== undefined && v !== null) {
      url += (~url.indexOf('?') ? '&' : '?') + encodeURIComponent(k) + '=' + encodeURIComponent(v)
    }
  }

  window[cb] = function(data) {
    if (fn) {
      fn(null, data)
    }

    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }
  }

  var script = document.createElement('script')
  script.src = url
  var target = document.getElementsByTagName('script')[0] || document.head
  target.parentNode.insertBefore(script, target)
}

export default function jsonp(url, opts) {
  return new Promise((resolve, reject) => {
    originJsonp(url, opts, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}