import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _typeof from '@babel/runtime/helpers/typeof';

var useMouse = !("ontouchstart" in document.documentElement); // we want touchEvent and mouseEvent expose the same properties here

var eventProperties = ["clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "currentTarget"];
var eventNameMapping = {
  mousedown: "vdown",
  mousemove: "vmove",
  mouseup: "vup",
  touchstart: "vdown",
  touchmove: "vmove",
  touchend: "vend"
};

function makeSyntheticEvent(e, target) {
  var pointer = e;
  if (e.touches) pointer = e.touches[0];
  var composedEvent = _typeof(pointer.clientX) === undefined ? {} : eventProperties.reduce(function (acc, prop) {
    return Object.assign(acc, _defineProperty({}, prop, pointer[prop]));
  }, {});
  composedEvent.type = eventNameMapping[e.type];
  composedEvent.target = target;
  composedEvent.nativeEvent = e;

  composedEvent.preventDefault = function () {
    return e.preventDefault();
  };

  composedEvent.stopPropagation = function () {
    return e.stopPropagation();
  };

  return composedEvent;
}

function emit(vnode, name, nativeEvent) {
  // https://stackoverflow.com/questions/40655333/vue-js-emit-event-from-directive
  var handlers = vnode.data && vnode.data.on || vnode.componentOptions && vnode.componentOptions.listeners;
  var syntheticEvent = makeSyntheticEvent(nativeEvent, vnode.elm);

  if (handlers && handlers[name]) {
    handlers[name](syntheticEvent);
  }
}

function addEvent(el, name, handler) {
  el.addEventListener(name, handler);
  return function () {
    el.removeEventListener(name, handler);
  };
}

function combineFuncs() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return funcs.map(function (fn) {
      return fn.apply(void 0, args);
    });
  };
}

var wordSelectDirective = {
  bind: function bind(el, _, vnode) {
    var disposeSelect = addEvent(document, 'selectionchange', emit.bind(null, vnode, 'vselectchange'));

    if (useMouse) {
      var downHandler = function downHandler(e) {
        var disposeMove = addEvent(document, "mousemove", emit.bind(null, vnode, "vmove"));

        var upHandler = function upHandler(e) {
          disposeMove();
          emit(vnode, "vup", e);
          document.removeEventListener('mouseup', upHandler);
          el._$vselectDiposer = combinedSelectDown;
        };

        el._$vselectDiposer = combineFuncs(combinedSelectDown, disposeMove, addEvent(document, "mouseup", upHandler));
        emit(vnode, "vdown", e);
      };

      var disposeDown = addEvent(el, "mousedown", downHandler);
      var combinedSelectDown = combineFuncs(disposeDown, disposeSelect);
      el._$vselectDiposer = combinedSelectDown;
    } else {
      el._$vselectDiposer = combineFuncs(disposeSelect, addEvent(el, "touchstart", emit.bind(null, vnode, "vdown")), addEvent(el, "touchmove", emit.bind(null, vnode, "vmove")), addEvent(el, "touchend", emit.bind(null, vnode, "vup")));
    }
  },
  unbind: function unbind(el) {
    if (el._$vselectDiposer) el._$vselectDiposer();
  }
};

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var defaultHandlePopoverOptions = {
  placement: 'right-start',
  visibleArrow: false,
  popperClass: 'el-word-select-popper',
  popperOptions: {
    boundariesElement: 'body',
    gpuAcceleration: false
  }
};
var defaultSuggestPopoverOptions = {
  popperClass: 'el-word-select-popper',
  visibleArrow: false,
  popperOptions: {
    boundariesElement: 'body',
    gpuAcceleration: false
  }
};
var script = {
  props: {
    /**
     * 是否需要显示handle slot的popper
     */
    showHandle: {
      type: Boolean,
      "default": true
    },

    /**
     * 是否显示suggest slot的popper
     */
    showSuggest: {
      type: Boolean,
      "default": true
    },

    /**
     * handle slot的popper的props，属性直接绑定在el-popover组件上
     */
    handlePopoverOptions: {
      type: Object,
      "default": function _default() {
        return _objectSpread({}, defaultHandlePopoverOptions);
      }
    },

    /**
     * suggest slot的popper的props，使用方法与handlePopoverOptions一样
     */
    suggestPopoverOptions: {
      type: Object,
      "default": function _default() {
        return _objectSpread({}, defaultSuggestPopoverOptions);
      }
    },

    /**
     * 当autoClose为false时，不会因为组件内的用户的文本选择丢失，而关闭上面的popper
     */
    autoClose: {
      type: Boolean,
      "default": true
    }
  },
  data: function data() {
    return {
      isSelected: false,
      offsetX: 0,
      offsetY: 0,
      selectionWidth: 0,
      selectionHeight: 0
    };
  },
  directives: {
    select: wordSelectDirective
  },
  watch: {
    autoClose: function autoClose(value) {
      if (value) {
        this.maybeHidePoppper();
      }
    }
  },
  computed: {
    popperStyle: function popperStyle() {
      return {
        left: "".concat(this.offsetX, "px"),
        top: "".concat(this.offsetY, "px"),
        width: "".concat(this.selectionWidth, "px"),
        height: "".concat(this.selectionHeight, "px")
      };
    },
    mergedHandlePopoverOptions: function mergedHandlePopoverOptions() {
      return this.mergePopoverOptions(defaultHandlePopoverOptions, this.handlePopoverOptions);
    },
    mergedSuggestPopoverOptions: function mergedSuggestPopoverOptions() {
      return this.mergePopoverOptions(defaultSuggestPopoverOptions, this.suggestPopoverOptions);
    }
  },
  methods: {
    /**
     * 收起所有的popper
     * @public
     */
    close: function close() {
      this.isSelected = false;
    },
    updatePopperPosition: function updatePopperPosition() {
      this.$refs.handle && this.$refs.handle.updatePopper();
      this.$refs.suggest && this.$refs.suggest.updatePopper();
    },
    getOffsetParent: function getOffsetParent() {
      return this.$refs.selectWrapper.offsetParent || document.body;
    },
    getRangeOffsetToParent: function getRangeOffsetToParent(range) {
      var bounds = range.getBoundingClientRect();
      var parentBounds = this.getOffsetParent().getBoundingClientRect();
      return [bounds.left - parentBounds.left, bounds.top - parentBounds.top];
    },
    handlePointerUp: function handlePointerUp(e) {
      var _this = this;

      var selection = document.getSelection();

      if (selection && selection.type === 'Range') {
        var range = this.pruneRange(selection.getRangeAt(0));
        var bounds = range.getBoundingClientRect();
        var parentBounds = this.getOffsetParent().getBoundingClientRect();

        var _this$getRangeOffsetT = this.getRangeOffsetToParent(range),
            _this$getRangeOffsetT2 = _slicedToArray(_this$getRangeOffsetT, 2),
            nextOffsetX = _this$getRangeOffsetT2[0],
            nextOffsetY = _this$getRangeOffsetT2[1];

        this.offsetX = nextOffsetX;
        this.offsetY = nextOffsetY;
        this.selectionWidth = bounds.width;
        this.selectionHeight = bounds.height;
        this.isSelected = true;
        /**
         * @property {string} selectedText 用户选中的文本
         */

        this.$emit('change', range.toString());

        if (!this.autoClose) {
          this.$nextTick(function () {
            _this.updatePopperPosition();
          });
        }
      } else {
        if (!this.autoClose) return;
        this.close();
      }
    },
    handlePointerMove: function handlePointerMove() {},
    handlePointerDown: function handlePointerDown(e) {
      if (!this.autoClose) return;
      this.$emit('change', '');
      this.close();
    },
    pruneRange: function pruneRange(range) {
      var newRange = range.cloneRange();
      var startContainer = newRange.startContainer,
          endContainer = newRange.endContainer;
      var selectWrapper = this.$refs.selectWrapper;
      var isContainStart = selectWrapper.contains(startContainer);
      var isContainEnd = selectWrapper.contains(endContainer);

      if (isContainStart || isContainEnd) {
        if (!isContainStart) {
          newRange.setStart(selectWrapper, 0);
        }

        if (!isContainEnd) {
          newRange.setEnd(selectWrapper, selectWrapper.childNodes.length);
        }
      }

      return newRange;
    },
    maybeHidePoppper: function maybeHidePoppper() {
      if (!this.autoClose) return;

      if (this.isSelected && !this.checkIsInSelection()) {
        this.close();
      }
    },
    checkIsInSelection: function checkIsInSelection() {
      var selection = document.getSelection();

      if (selection && selection.type === 'Range') {
        var range = selection.getRangeAt(0);
        var startContainer = range.startContainer,
            endContainer = range.endContainer;
        var selectWrapper = this.$refs.selectWrapper;
        var curNode = startContainer;

        do {
          if (selectWrapper.contains(curNode)) {
            return range;
          }

          curNode = this.getNextNode(startContainer, false, endContainer);
        } while (curNode);
      }

      return null;
    },
    // ref: https://stackoverflow.com/questions/667951/how-to-get-nodes-lying-inside-a-range-with-javascript
    getNextNode: function getNextNode(node, skipChildren, endNode) {
      //if there are child nodes and we didn't come from a child node
      if (endNode == node) {
        return null;
      }

      if (node.firstChild && !skipChildren) {
        return node.firstChild;
      }

      if (!node.parentNode) {
        return null;
      }

      return node.nextSibling || this.getNextNode(node.parentNode, true, endNode);
    },
    mergePopoverOptions: function mergePopoverOptions(source, target) {
      if (target) {
        var newPopperOptions = target.popperOptions ? _objectSpread({}, source.popperOptions, {}, target.popperOptions) : source.popperOptions;
        return _objectSpread({}, source, {}, target, {}, {
          popperOptions: newPopperOptions
        });
      }

      return source;
    }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD = document.head || document.getElementsByTagName('head')[0];
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) style.element.setAttribute('media', css.media);
      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) style.element.removeChild(nodes[index]);
      if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
    }
  }
}

var browser = createInjector;

/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c("div", {
    directives: [{
      name: "select",
      rawName: "v-select"
    }],
    ref: "selectWrapper",
    staticClass: "el-word-select",
    on: {
      vselectchange: _vm.maybeHidePoppper,
      vdown: _vm.handlePointerDown,
      vmove: _vm.handlePointerMove,
      vup: _vm.handlePointerUp
    }
  }, [_vm._t("default"), _vm._v(" "), _vm.showHandle ? _c("el-popover", _vm._b({
    ref: "handle",
    attrs: {
      trigger: "manual",
      value: _vm.isSelected
    }
  }, "el-popover", _vm.mergedHandlePopoverOptions, false), [_vm._t("selection-handle"), _vm._v(" "), _c("div", {
    staticClass: "selection-ref",
    style: _vm.popperStyle,
    attrs: {
      slot: "reference"
    },
    slot: "reference"
  })], 2) : _vm._e(), _vm._v(" "), _vm.showSuggest ? _c("el-popover", _vm._b({
    ref: "suggest",
    attrs: {
      trigger: "manual",
      value: _vm.isSelected
    }
  }, "el-popover", _vm.mergedSuggestPopoverOptions, false), [_vm._t("suggestion"), _vm._v(" "), _c("div", {
    staticClass: "selection-ref",
    style: _vm.popperStyle,
    attrs: {
      slot: "reference"
    },
    slot: "reference"
  })], 2) : _vm._e()], 2);
};

var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;
/* style */

var __vue_inject_styles__ = function __vue_inject_styles__(inject) {
  if (!inject) return;
  inject("data-v-09a3be51_0", {
    source: ".el-word-select .selection-ref {\n  position: absolute;\n  visibility: hidden;\n  pointer-events: none;\n}\n.el-word-select > * {\n  user-select: text;\n}\n.el-word-select-popper {\n  padding: 0;\n  min-width: auto;\n}\n",
    map: {
      "version": 3,
      "sources": ["el-word-select.vue"],
      "names": [],
      "mappings": "AAAA;EACE,kBAAkB;EAClB,kBAAkB;EAClB,oBAAoB;AACtB;AACA;EACE,iBAAiB;AACnB;AACA;EACE,UAAU;EACV,eAAe;AACjB",
      "file": "el-word-select.vue",
      "sourcesContent": [".el-word-select .selection-ref {\n  position: absolute;\n  visibility: hidden;\n  pointer-events: none;\n}\n.el-word-select > * {\n  user-select: text;\n}\n.el-word-select-popper {\n  padding: 0;\n  min-width: auto;\n}\n"]
    },
    media: undefined
  });
};
/* scoped */


var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject SSR */

var Component = normalizeComponent_1({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, browser, undefined);

// Import vue component
// the same plugin more than once,
// so calling it multiple times on the same plugin
// will install the plugin only once

Component.install = function (Vue) {
  Vue.component(Component.name, Component);
}; // To auto-install when vue is found


var GlobalVue = null;

if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}

if (GlobalVue) {
  GlobalVue.use(Component);
} // To allow use as module (npm/webpack/etc.) export component
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;

export default Component;
