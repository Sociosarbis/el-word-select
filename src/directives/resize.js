import {
  addResizeListener,
  removeResizeListener
} from '../lib/detectElementResize'
import {debounce} from '../utils'

function isFunc(obj) {
  return typeof obj === 'function'
}

function tryAddReszieListener(el, listener) {
  if (isFunc(listener)) {
    el._$vresizeHandler = listener
    addResizeListener(el, el._$vresizeHandler)
    return true
  }
  return false
}

export default {
  bind: (el, binding) => {
    const {value, modifiers} = binding
    tryAddReszieListener(el, modifiers.debounce ? debounce(value) : value)
  },
  componentUpdated: (el, binding) => {
    const {oldValue, value, modifiers} = binding
    if (oldValue !== value) {
      removeResizeListener(el, el._$vresizeHandler)
      tryAddReszieListener(el, modifiers.debounce ? debounce(value) : value)
    }
  },
  unbind: el => {
    if (isFunc(el._$vresizeHandler)) {
      removeResizeListener(el, el._$vresizeHandler)
    }
  }
}
