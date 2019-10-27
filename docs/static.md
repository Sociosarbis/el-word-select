扩展用法

**利用static prop让el-word-select暂停相应selection的变化，进一步让操作弹出的表单时，不会隐藏**

**也可以利用el-word-select的close方法强制关闭表单**
```vue
<template>
  <el-word-select ref="wordSelect" @change="handleSelectChange" :static="needStatic">
    <div
      id="subject_summary"
      class="subject_summary_all"
      property="v:summary"
      style="display: block;"
    >
      《银河英雄传说》的时间设定约在距今一千六百年后，范围约扩及全银河系的五分之一。当时宇宙中存在着两大势力，分别是专制的“银河帝国”，和由逃出帝国的共和主义者建立的“自由行星同盟”。 帝国视同盟为“边境叛徒的根据地”，同盟则将帝国当作“邪恶的黑暗专制势力”，彼此水火不容，持续了长达二百多年的战争。在两国领域之间，充满了不利宇宙航行的异常重力场，使得两国间的通道，只有著名的“费沙回廊”和“伊谢尔伦回廊”。伊谢尔伦回廊有着难攻不落的强大军事要塞，而在费沙回廊中，是介于两大势力间的半独立国——“费沙自治领”。因此整个宇宙就在专制的高登巴姆王朝银河帝国和崇尚自由、自主、自尊、自律的自由行星同盟及以经济、情报生存的费沙三方平衡之下运转着。
      <br />终于，双方各出现了一位年轻的英雄：帝国的莱因哈特·冯·罗严克拉姆，和同盟的杨威利。历史的车轮开始转动了。两人带动整个银河的局势急剧的变化着，他们和同时代涌现出的许多优秀的将士们一起，展开了一连串精采纷呈的战役。 莱因哈特在掌握政军大权后，击败了帝国内大贵族的势力，完成许多平民期待中的改革，并利用帝国皇帝挟持事件，正式向同盟宣战，而第一步即是拿下费沙。大军避开有着强敌及强大要塞的伊谢尔伦回廊，取道费沙向同盟进攻。虽然同盟军在杨威利的巧妙指挥下，取得了战术上的胜利，但就在杨威利即将击毁莱因哈特的旗舰时，自由行星同盟被逼宣布投降，在帝国的主宰下维持着屈辱的政权。
      <br />不久，由于同盟政府的自作聪明，想先杀了已退役的杨威利来讨好帝国驻同盟高等事务官，终致引发了一连串的动乱。杨威利在旧部下的营救下成功逃出，并联合艾尔·法西尔自治政府，重新夺回伊谢尔伦要塞。而莱因哈特则正式率军灭亡同盟，接着便进攻伊谢尔伦要塞。双方在伊谢尔伦回廊大战，因莱因哈特病倒而休兵和谈，而杨威利在前往和谈的路上不幸遭到地球教暗杀。其妻格林希尔接任他政治上的职务，而其养子尤里安·敏兹接任其军事上的职务，继续杨未竟的事业。接着，帝国重臣，新领土总督罗严塔尔元帅被逼反叛莱因哈特。与他并称“帝国双璧”的挚友米达麦亚奉命领军讨伐，罗严塔尔身亡。莱因哈特为了一统全宇宙而再次举兵进攻伊谢尔伦回廊。尤里安经过艰苦的战斗终于获得了和皇帝莱因哈特谈判的机会，以归还伊谢尔伦为代价换取原同盟首都星系的内政自治权，保留下了民主的火种。而莱因哈特也在不久之后病逝。
      <br />《银河英雄传说》的视点不仅仅限于描写以莱因哈特和杨威利为代表的英雄人物的传奇，更向广大读者提出了一个令人深思的问题：宇宙中是否存在独一无二的真理？“清廉的专制”与“腐败的民主”之间，何去何从？这使得这部作品超越一般奇幻作品常见的“善与恶的争斗”的主题，而有了更加深邃的内涵。在历史的洪流之中，各种不同价值观的碰撞，构成了银英这部史诗的主旋律。
      <br />
      <el-button class="bangumi-pink">
        Source from
        <a href="http://bangumi.tv/subject/2907#;">Bangumi.tv</a>
      </el-button>
    </div>
    <el-form-renderer class="popper-form" slot="suggestion" ref="form" :content="formContent">
    <el-row type="flex" justify="center" :gutter="4">
      <el-col :span="10"><el-button @click="submitForm">搜索</el-button></el-col>
      <el-col :span="10"><el-button @click="cancel">取消</el-button></el-col>
    </el-row>
    </el-form-renderer>
  </el-word-select>
</template>

<script>
const DEFAULT_FORM_CONTENT = [
  {
    type: 'input',
    id: 'keywords',
    label: '关键词',
    default: '',
    el: {
      placeholder: '搜索关键词'
    },
    rules: [{required: true, message: 'miss name', trigger: 'change'}]
  },
  {
    type: 'select',
    id: 'cat',
    label: '类别',
    default: 'all',
    el: {
      placeholder: '搜索类别'
    },
    options: [
      {label: '全部', value: 'all'},
      {label: '动画', value: '2'},
      {label: '书籍', value: '1'},
      {label: '音乐', value: '3'},
      {label: '游戏', value: '4'},
      {label: '三次元', value: '6'},
      {label: '虚构角色', value: 'crt'},
      {label: '现实人物', value: 'prsn'}
    ],
    rules: [{required: true, message: 'miss name', trigger: 'change'}]
  }
]
export default {
  data() {
    return {
      selectWord: '',
      needStatic: false,
      formContent: DEFAULT_FORM_CONTENT
    }
  },
  methods: {
    handleSelectChange(str) {
      this.selectWord = str
      if (str) {
        this.$refs.form.updateForm({
          keywords: this.selectWord,
          cat: 'all'
        })
        this.$nextTick(() => {
          this.needStatic = true
        })
      }
    },
    submitForm() {
      const form = this.$refs.form
      form.validate(valid => {
        if (valid) {
          const {keywords, cat} = form.getFormValue()
          this.closeForm()
          window.location.href = `http://bgm.tv/subject_search/${keywords}?cat=${cat}`
        }
      })
    },
    closeForm() {
      this.needStatic = false
      this.$refs.wordSelect.close()
    },
    cancel() {
      this.closeForm()
    }
  }
}
</script>
<style>
.bangumi-pink {
  background-color: #f09199;
  color: white;
  cursor: auto;
}
.bangumi-pink:hover {
  background-color: #d18a90;
}
.bangumi-pink a {
  color: white;
  text-decoration: none;
}
.popper-form {
  padding: 10px 15px;
}
</style>
```