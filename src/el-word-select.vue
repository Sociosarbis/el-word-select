<template>
  <div
    ref="selectWrapper"
    :class="['el-word-select', {selected: isSelected}]"
    v-select
    v-resize.debounce="updateSelectionInfos"
    @vselectchange="maybeHidePoppper"
    @vdown="handlePointerDown"
    @vmove="handlePointerMove"
    @vup="updateSelectionInfos"
  >
    <!-- @slot 放置被包裹的组件 -->
    <slot />
    <el-popover
      v-if="showHandle"
      ref="handle"
      v-bind="mergedHandlePopoverOptions"
      trigger="manual"
      :value="isSelected"
    >
      <!-- @slot 原意是当有selection时，该slot显示对selection进行操作的组件 -->
      <slot name="selection-handle" />
      <div class="selection-ref" slot="reference" :style="popperStyle"></div>
    </el-popover>
    <el-popover
      v-if="showSuggest"
      ref="suggest"
      v-bind="mergedSuggestPopoverOptions"
      trigger="manual"
      :value="isSelected"
    >
      <!-- @slot 功能放置是类似于搜索框下带有的结果列表或需要根据selection弹出的信息 -->
      <slot name="suggestion" />
      <div class="selection-ref" slot="reference" :style="popperStyle"></div>
    </el-popover>
  </div>
</template>
<script>
import wordSelectDirective from './directives/wordSelect'
import resizeDirective from './directives/resize'

const defaultHandlePopoverOptions = {
  placement: 'right-start',
  visibleArrow: false,
  popperClass: 'el-word-select-popper',
  popperOptions: {
    boundariesElement: 'body',
    gpuAcceleration: false
  }
}

const defaultSuggestPopoverOptions = {
  popperClass: 'el-word-select-popper',
  visibleArrow: false,
  popperOptions: {
    boundariesElement: 'body',
    gpuAcceleration: false
  }
}

export default {
  props: {
    /**
     * 是否需要显示handle slot的popper
     */
    showHandle: {
      type: Boolean,
      default: true
    },
    /**
     * 是否显示suggest slot的popper
     */
    showSuggest: {
      type: Boolean,
      default: true
    },
    /**
     * handle slot的popper的props，属性直接绑定在el-popover组件上
     */
    handlePopoverOptions: {
      type: Object,
      default() {
        return {
          ...defaultHandlePopoverOptions
        }
      }
    },
    /**
     * suggest slot的popper的props，使用方法与handlePopoverOptions一样
     */
    suggestPopoverOptions: {
      type: Object,
      default() {
        return {...defaultSuggestPopoverOptions}
      }
    },
    /**
     * 当autoClose为false时，不会因为组件内的用户的文本选择丢失，而关闭上面的popper
     */
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isSelected: false,
      offsetX: 0,
      offsetY: 0,
      selectionWidth: 0,
      selectionHeight: 0
    }
  },
  directives: {
    select: wordSelectDirective,
    resize: resizeDirective
  },
  watch: {
    autoClose(value) {
      if (value) {
        this.maybeHidePoppper()
      }
    }
  },
  computed: {
    popperStyle() {
      return {
        left: `${this.offsetX}px`,
        top: `${this.offsetY}px`,
        width: `${this.selectionWidth}px`,
        height: `${this.selectionHeight}px`
      }
    },
    mergedHandlePopoverOptions() {
      return this.mergePopoverOptions(
        defaultHandlePopoverOptions,
        this.handlePopoverOptions
      )
    },
    mergedSuggestPopoverOptions() {
      return this.mergePopoverOptions(
        defaultSuggestPopoverOptions,
        this.suggestPopoverOptions
      )
    }
  },
  methods: {
    /**
     * 收起所有的popper
     * @public
     */
    close() {
      this.isSelected = false
    },
    updatePopperPosition() {
      this.$refs.handle && this.$refs.handle.updatePopper()
      this.$refs.suggest && this.$refs.suggest.updatePopper()
    },
    getOffsetParent() {
      return this.$refs.selectWrapper || document.body
    },
    getRangeOffsetToParent(range) {
      const bounds = range.getBoundingClientRect()
      const parentBounds = this.getOffsetParent().getBoundingClientRect()
      return [bounds.left - parentBounds.left, bounds.top - parentBounds.top]
    },
    updateSelectionInfos() {
      const selection = document.getSelection()
      if (selection && selection.type === 'Range') {
        const range = this.pruneRange(selection.getRangeAt(0))
        const bounds = range.getBoundingClientRect()
        const parentBounds = this.getOffsetParent().getBoundingClientRect()
        const [nextOffsetX, nextOffsetY] = this.getRangeOffsetToParent(range)
        this.offsetX = nextOffsetX
        this.offsetY = nextOffsetY
        this.selectionWidth = bounds.width
        this.selectionHeight = bounds.height
        this.isSelected = true
        /**
         * @property {string} selectedText 用户选中的文本
         */
        this.$emit('change', range.toString())
        this.$nextTick(() => {
          this.updatePopperPosition()
        })
      } else {
        if (!this.autoClose) return
        this.close()
      }
    },
    handlePointerMove() {},
    handlePointerDown(e) {
      if (!this.autoClose) return
      this.$emit('change', '')
      this.close()
    },
    pruneRange(range) {
      let newRange = range.cloneRange()
      const {startContainer, endContainer} = newRange
      const selectWrapper = this.$refs.selectWrapper
      const isContainStart = selectWrapper.contains(startContainer)
      const isContainEnd = selectWrapper.contains(endContainer)
      if (isContainStart || isContainEnd) {
        if (!isContainStart) {
          newRange.setStart(selectWrapper, 0)
        }
        if (!isContainEnd) {
          newRange.setEnd(selectWrapper, selectWrapper.childNodes.length)
        }
      }
      return newRange
    },
    maybeHidePoppper() {
      if (!this.autoClose) return
      if (this.isSelected && !this.checkIsInSelection()) {
        this.close()
      }
    },
    checkIsInSelection() {
      const selection = document.getSelection()
      if (selection && selection.type === 'Range') {
        const range = selection.getRangeAt(0)
        const {startContainer, endContainer} = range
        const selectWrapper = this.$refs.selectWrapper
        let curNode = startContainer
        do {
          if (selectWrapper.contains(curNode)) {
            return range
          }
          curNode = this.getNextNode(startContainer, false, endContainer)
        } while (curNode)
      }
      return null
    },
    // ref: https://stackoverflow.com/questions/667951/how-to-get-nodes-lying-inside-a-range-with-javascript
    getNextNode(node, skipChildren, endNode) {
      //if there are child nodes and we didn't come from a child node
      if (endNode == node) {
        return null
      }
      if (node.firstChild && !skipChildren) {
        return node.firstChild
      }
      if (!node.parentNode) {
        return null
      }
      return (
        node.nextSibling || this.getNextNode(node.parentNode, true, endNode)
      )
    },
    mergePopoverOptions(source, target) {
      if (target) {
        const newPopperOptions = target.popperOptions
          ? {...source.popperOptions, ...target.popperOptions}
          : source.popperOptions
        return {
          ...source,
          ...target,
          ...{
            popperOptions: newPopperOptions
          }
        }
      }
      return source
    }
  }
}
</script>
<style lang="less">
.el-word-select {
  position: relative;

  .selection-ref {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
  }

  & > * {
    user-select: text;
  }
}

.el-word-select-popper {
  padding: 0;
  min-width: auto;

  &:not(.fade-in-linear-enter-active) {
    &:not(.fade-in-linear-leave-active) {
      transition-property: left, top, transform;
      transition-duration: 250ms;
      transition-timing-function: ease-in-out;
    }
  }
}
</style>
