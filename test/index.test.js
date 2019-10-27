import {mount} from '@vue/test-utils'
import Vue from 'vue'
import Element from 'element-ui'
import ElWordSelect from '@/el-word-select'
Vue.use(Element)

describe('Component', () => {
  test('mount', () => {
    const wrapper = mount(ElWordSelect)
    expect(wrapper.classes()).toContain('el-word-select')
  })

  test('slots', () => {
    const slots = {
      slots: {
        default: [`<div class="default" />`],
        'selection-handle': `<div class="selection-handle" />`,
        suggestion: `<div class="suggestion" />`
      }
    }
    const wrapper = mount(ElWordSelect, slots)
    wrapper.vm.isSelected = true
    expect(wrapper.find('.default').isVisible()).toBe(true)
    expect(wrapper.find('.selection-handle').isVisible()).toBe(true)
    expect(wrapper.find('.suggestion').isVisible()).toBe(true)
  })

  test('mousedown', () => {
    const wrapper = mount(ElWordSelect)
    wrapper.vm.isSelected = true
    wrapper.find('.el-word-select').trigger('mousedown')
    expect(wrapper.vm.isSelected).toBe(false)
  })
})
