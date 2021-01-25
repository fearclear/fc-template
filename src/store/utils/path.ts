const OBJECTTYPE = '[object Object]'
const ARRAYTYPE = '[object Array]'

interface Obj {
  [x: string]: any
}

export function getUsing(data: any, paths?: any[]) {
  if (!paths) return {}
  const obj: Obj = {}
  paths.forEach(path => {
    const isPath = typeof path === 'string'
    if (!isPath) {
      const key = Object.keys(path)[0]
      const value = path[key]
      if (typeof value !== 'string') {
        const tempPath = value[0]
        if (typeof tempPath === 'string') {
          const tempVal = getTargetByPath(data, tempPath)
          obj[key] = value[1] ? value[1](tempVal) : tempVal
        } else {
          const args: any[] = []
          tempPath.forEach((path: any) => {
            args.push(getTargetByPath(data, path))
          })
          obj[key] = value[1].apply(null, args)
        }
      }
    }
  })
  return obj
}

export function getTargetByPath(origin: any, path: string) {
  const arr = path
    .replace(/]/g, '')
    .replace(/\[/g, '.')
    .split('.')
  let current = origin
  for (let i = 0, len = arr.length; i < len; i++) {
    current = current[arr[i]]
  }
  return current
}

export function getPath(obj: any[]) {
  if (Object.prototype.toString.call(obj) === '[object Array]') {
    const result: Obj = {}
    obj.forEach(item => {
      if (typeof item === 'string') {
        result[item] = true
      } else {
        const tempPath = item[Object.keys(item)[0]]
        if (typeof tempPath === 'string') {
          result[tempPath] = true
        } else if (typeof tempPath[0] === 'string') {
          result[tempPath[0]] = true
        } else {
          tempPath[0].forEach((path: string | number) => (result[path] = true))
        }
      }
    })
    return result
  }
  return getUpdatePath(obj)
}

export function getUpdatePath(data: any[]) {
  const result = {}
  dataToPath(data, result)
  return result
}

function dataToPath(data: Obj, result: Obj) {
  Object.keys(data).forEach(key => {
    result[key] = true
    const type = Object.prototype.toString.call(data[key])
    if (type === OBJECTTYPE) {
      _objToPath(data[key], key, result)
    } else if (type === ARRAYTYPE) {
      _arrayToPath(data[key], key, result)
    }
  })
}

function _objToPath(data: { [x: string]: any }, path: string, result: Obj) {
  Object.keys(data).forEach(key => {
    result[path + '.' + key] = true
    delete result[path]
    const type = Object.prototype.toString.call(data[key])
    if (type === OBJECTTYPE) {
      _objToPath(data[key], path + '.' + key, result)
    } else if (type === ARRAYTYPE) {
      _arrayToPath(data[key], path + '.' + key, result)
    }
  })
}

function _arrayToPath(data: any[], path: string, result: Obj) {
  data.forEach((item, index) => {
    result[path + '[' + index + ']'] = true
    delete result[path]
    const type = Object.prototype.toString.call(item)
    if (type === OBJECTTYPE) {
      _objToPath(item, path + '[' + index + ']', result)
    } else if (type === ARRAYTYPE) {
      _arrayToPath(item, path + '[' + index + ']', result)
    }
  })
}

export function needUpdate(diffResult: any, updatePath: { [x: string]: any }) {
  for (const keyA in diffResult) {
    if (updatePath[keyA]) {
      return true
    }
    for (const keyB in updatePath) {
      if (includePath(keyA, keyB)) {
        return true
      }
    }
  }
  return false
}

function includePath(pathA: string, pathB: string) {
  if (pathA.indexOf(pathB) === 0) {
    const next = pathA.substr(pathB.length, 1)
    if (next === '[' || next === '.') {
      return true
    }
  }
  return false
}

export function fixPath(path: string) {
  let mpPath = ''
  const arr = path.replace('#-', '').split('-')
  arr.forEach((item, index) => {
    if (index) {
      if (isNaN(Number(item))) {
        mpPath += '.' + item
      } else {
        mpPath += '[' + item + ']'
      }
    } else {
      mpPath += item
    }
  })
  return mpPath
}
