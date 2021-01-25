/* !
 *  omix v2.4.0 by dntzhang
 *  Github: https://github.com/Tencent/omi
 *  MIT Licensed.
 */

import { I18nPage } from '@miniprogram-i18n/core'
import obaa from './obaa'
import { getPath, needUpdate, fixPath, getUsing } from './path'

interface StoreChangeCallback {
  (detail: any): void
}

interface Obj {
  [x: string]: any
}

interface ComponentOption {
  [key: string]: any
}

interface Computed {
  [key: string]: any
}

type PageOption = WechatMiniprogram.Page.Instance<
  WechatMiniprogram.Page.DataOption,
  WechatMiniprogram.Page.CustomOption
> & {
  use?: Array<string | object>
  computed?: Computed
}

function create(store: any | ComponentOption, option?: Partial<PageOption>) {
  if (arguments.length === 2) {
    if (!store.instances) {
      store.instances = {}
    }

    if (!store.__changes_) {
      store.__changes_ = []
    }

    const changes = store.__changes_
    if (!store.onChange) {
      store.onChange = function(fn: StoreChangeCallback) {
        changes.push(fn)
      }
    }

    if (!store.offChange) {
      store.offChange = function(fn: StoreChangeCallback) {
        for (let i = 0, len = changes.length; i < len; i++) {
          if (changes[i] === fn) {
            changes.splice(i, 1)
            break
          }
        }
      }
    }

    if (!option) {
      return
    }

    const hasData = typeof option.data !== 'undefined'
    let clone: any
    if (option.data) {
      clone = JSON.parse(JSON.stringify(option.data))
      option.data.$ = store.data
    } else {
      option.data = store.data
    }
    observeStore(store)
    const onLoad = option.onLoad
    const onUnload = option.onUnload

    option.onLoad = function(e) {
      this.store = store

      option.use && (this.__updatePath = getPath(option.use))
      this.__use = option.use
      this.__hasData = hasData
      if (hasData) {
        Object.assign(option.data, JSON.parse(JSON.stringify(clone)))
      }
      // @ts-ignore
      store.instances[this.route] = store.instances[this.route] || []
      // @ts-ignore
      store.instances[this.route].push(this)
      this.computed = option.computed
      // @ts-ignore
      this.setData(option.data)
      const using = getUsing(store.data, option.use)

      // @ts-ignore
      option.computed && compute(option.computed, store, using, this)
      // @ts-ignore
      this.setData(using)

      onLoad && onLoad.call(this, e)
    }

    option.onUnload = function(e) {
      // @ts-ignore
      store.instances[this.route] = store.instances[this.route].filter(
        (ins: PageOption) => ins !== this
      )
      onUnload && onUnload.call(this, e)
    }

    Page(option)
  } else {
    store.lifetimes = store.lifetimes || {}
    const ready = store.lifetimes.ready || store.ready

    store.ready = store.lifetimes.ready = function() {
      const page = getCurrentPages()[getCurrentPages().length - 1]
      store.use && (this.__updatePath = getPath(store.use))
      this.store = page.store
      this.__use = store.use

      this.computed = store.computed
      store.data = this.store.data
      this.setData(store.data)
      const using = getUsing(this.store.data, store.use)

      store.computed && compute(store.computed, this.store, using, this)
      this.setData(using)

      page._omixComponents = page._omixComponents || []
      page._omixComponents.push(this)
      ready && ready.call(this)
    }
    Component(store)
  }
}

create.Page = function(store: any, option?: Partial<PageOption>) {
  create(store, option)
}

create.I18nPage = function(store: any, option?: Partial<PageOption>) {
  create(store, I18nPage(option))
}

create.Component = function(
  store: any | ComponentOption,
  option?: ComponentOption
) {
  if (arguments.length === 2) {
    if (!store.instances) {
      store.instances = {}
    }

    if (!store.__changes_) {
      store.__changes_ = []
    }

    const changes = store.__changes_
    if (!store.onChange) {
      store.onChange = function(fn: any) {
        changes.push(fn)
      }
    }

    if (!store.offChange) {
      store.offChange = function(fn: any) {
        for (let i = 0, len = changes.length; i < len; i++) {
          if (changes[i] === fn) {
            changes.splice(i, 1)
            break
          }
        }
      }
    }
    if (!option) {
      return
    }
    const hasData = typeof option.data !== 'undefined'
    let clone: any
    if (option.data) {
      clone = JSON.parse(JSON.stringify(option.data))
      option.data.$ = store.data
    } else {
      option.data = store.data
    }
    observeStore(store)

    const detached = option.detached

    option.lifetimes = option.lifetimes || {}
    const created = option.lifetimes.created || option.created
    const ready = option.lifetimes.ready || option.ready

    option.created = option.lifetimes.created = function(e: any) {
      this.store = store

      option.use && (this.__updatePath = getPath(option.use))
      this.__use = option.use
      this.__hasData = hasData
      if (hasData) {
        Object.assign(option.data, JSON.parse(JSON.stringify(clone)))
      }

      created && created.call(this, e)
    }

    option.ready = option.lifetimes.ready = function(e: any) {
      const store = this.store
      store.instances[this.is] = store.instances[this.is] || []
      store.instances[this.is].push(this)
      this.computed = option.computed
      this.setData(option.data)
      const using = getUsing(store.data, option.use)

      option.computed && compute(option.computed, store, using, this)
      this.setData(using)

      ready && ready.call(this, e)
    }

    option.lifetimes.detached = option.detached = function(e: any) {
      this.store.instances[this.is] = this.store.instances[this.is].filter(
        (ins: ComponentOption) => ins !== this
      )
      detached && detached.call(this, e)
    }

    Component(option)
  } else {
    store.lifetimes = store.lifetimes || {}
    const ready = store.lifetimes.ready || store.ready

    store.ready = store.lifetimes.ready = function() {
      const page = getCurrentPages()[getCurrentPages().length - 1]
      store.use && (this.__updatePath = getPath(store.use))
      this.store = page.store
      this.__use = store.use
      this.computed = store.computed
      store.data = this.store.data
      this.setData(store.data)
      const using = getUsing(this.store.data, store.use)

      store.computed && compute(store.computed, this.store, using, this)
      this.setData(using)

      page._omixComponents = page._omixComponents || []
      page._omixComponents.push(this)
      ready && ready.call(this)
    }
    Component(store)
  }
}

function compute(
  computed: Computed,
  store: { data: any },
  using: any,
  scope: PageOption
) {
  for (const key in computed) {
    using[key] = computed[key].call(store.data, scope)
  }
}

function observeStore(store: { data: any; set: any }) {
  const oba = obaa(
    store.data,
    (
      prop: string | string[],
      value: string | any[],
      old: string | any[],
      path: string
    ) => {
      const patch: Obj = {}
      if (prop.indexOf('Array-push') === 0) {
        const dl = value.length - old.length
        for (let i = 0; i < dl; i++) {
          patch[fixPath(path + '-' + (old.length + i))] = value[old.length + i]
        }
      } else if (prop.indexOf('Array-') === 0) {
        patch[fixPath(path)] = value
      } else {
        patch[fixPath(path + '-' + prop)] = value
      }

      _update(patch, store)
    }
  )

  if (!store.set) {
    store.set = function(obj: any, prop: any, val: any) {
      // @ts-ignore
      obaa.set(obj, prop, val, oba)
    }
  }
}

function _update(
  kv: {},
  store: { data?: any; set?: any; instances?: any; debug?: any }
) {
  for (const key in store.instances) {
    store.instances[key].forEach((ins: { _omixComponents: any[] }) => {
      // @ts-ignore
      _updateOne(kv, store, ins)
      if (ins._omixComponents) {
        ins._omixComponents.forEach(compIns => {
          _updateOne(kv, store, compIns)
        })
      }
    })
  }
  // @ts-ignore
  store.__changes_.forEach(change => {
    change(kv)
  })
  // @ts-ignore
  store.debug && storeChangeLogger(store, kv)
}

function _updateOne(
  kv: { [x: string]: any },
  store: {
    data?: any
    set?: any
    instances?: any
    debug?: any
    updateAll?: any
  },
  ins: PageOption
) {
  if (
    store.updateAll ||
    (ins.__updatePath && needUpdate(kv, ins.__updatePath))
  ) {
    if (ins.__hasData) {
      const patch = Object.assign({}, kv)
      for (const pk in patch) {
        if (!/\$\./.test(pk)) {
          patch['$.' + pk] = kv[pk]
          delete patch[pk]
        }
      }
      // eslint-disable-next-line no-useless-call
      ins.setData.call(ins, patch)
    } else {
      // eslint-disable-next-line no-useless-call
      ins.setData.call(ins, kv)
    }

    const using = getUsing(store.data, ins.__use)

    // @ts-ignore
    compute(ins.computed, store, using, ins)
    ins.setData(using)
  }
}

function storeChangeLogger(
  store: { data: any; set?: any; instances?: any; debug?: any },
  diffResult: {}
) {
  try {
    const preState = wx.getStorageSync(`CurrentState`) || {}
    const title = `Data Changed`
    console.groupCollapsed(
      `%c  ${title} %c ${Object.keys(diffResult)}`,
      'color:#e0c184; font-weight: bold',
      'color:#f0a139; font-weight: bold'
    )
    console.log(`%c    Pre Data`, 'color:#ff65af; font-weight: bold', preState)
    console.log(
      `%c Change Data`,
      'color:#3d91cf; font-weight: bold',
      diffResult
    )
    console.log(
      `%c   Next Data`,
      'color:#2c9f67; font-weight: bold',
      store.data
    )
    console.groupEnd()
    wx.setStorageSync(`CurrentState`, store.data)
  } catch (e) {
    console.log(e)
  }
}

create.obaa = obaa

export default create
