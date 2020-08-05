<template>
  <div class="term-box noselect">
    <div class="term-search">
      <input v-model="searchInner" placeholder="搜索话术">
      <i class="search-icon" />
    </div>
    <div class="term-container">
      <div class="term-tabs-bar">
        <div class="tabs-nav-container">
          <div :class="{active: personalShow}" @click="change(1)">个人</div>
          <div :class="{active: teamShow}" @click="change(2)">团队</div>
        </div>
      </div>
      <div class="term-tab">
        <div v-show="personalShow" class="personal-term">
          <div v-for="(classify, index) in personalterms" :key="index">
            <div class="node">
              <div class="classify">
                <div class="classify-name" :title="classify.classifyName" @click.stop="showClassifyItem(classify)">{{ classify.classifyName }}</div>
                <div class="classify-opt">
                  <div class="classify-arrow" :style="{transform: classify.show ? '' : 'rotateZ(180deg)'}" title="展示/隐藏">
                    <i class="arrow-icon" @click.stop="showClassifyItem(classify)" />
                  </div>
                  <div class="classify-edit" title="编辑分类">
                    <i class="edit-icon" @click.stop="classifyEdit(classify)" />
                  </div>
                  <div class="classify-delete" title="删除分类">
                    <i class="del-icon" @click.stop="classifyDelete(classify)" />
                  </div>
                </div>
              </div>
              <div class="items" :style="{display: classify.show ? 'none' : 'block'}">
                <div v-for="(item, x) in classify.items" :key="x" class="item">
                  <div class="item-content" :title="item.content" @click="clickItem(item.content)">
                    <span v-if="item.keyword" class="item-keyword">[{{ item.keyword }}]</span>
                    <span>{{ item.content }}</span>
                  </div>
                  <div class="item-opt">
                    <div class="item-edit" title="编辑话术">
                      <i class="edit-icon" @click.stop="itemEdit(item)" />
                    </div>
                    <div class="item-delete" title="删除话术">
                      <i class="del-icon" @click.stop="itemDelete(item)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-show="teamShow" class="team-term">
          <div v-for="(classify, index) in teamterms" :key="index">
            <div class="node">
              <div class="classify" @click="showClassifyItem(classify)">
                <span class="classify-name" :title="classify.classifyName">{{ classify.classifyName }}</span>
                <div class="classify-opt">
                  <div class="classify-arrow" :style="{transform: classify.show ? '' : 'rotateZ(180deg)'}" title="展示/隐藏">
                    <i class="arrow-icon" @click.stop="showClassifyItem(classify)" />
                  </div>
                </div>
              </div>
              <div class="items" :style="{display: classify.show ? 'none' : 'block'}">
                <div v-for="(item, i) in classify.items" :key="i" class="item" @click="clickItem(item.content)">
                  <div class="item-content" :title="item.content">
                    <span>{{ item.content }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="personalShow" class="personal-term-bar">
      <div class="tool-bar" @click.stop="openAddDialog">
        <i class="add-icon" />
        <span>新建</span>
      </div>
      <div class="tool-bar" @click.stop="importterm">
        <i class="upload-icon" />
        <span>导入</span>
      </div>
      <div class="tool-bar" @click.stop="exportterm">
        <i class="download-icon" />
        <span>导出</span>
      </div>
    </div>
    <oc-dialog v-model="classifyEditShow" title="话术类型编辑" width="350" @submit="submitClassifyEdit">
      <div class="oc-form">
        <div class="oc-form-items-row">
          <div class="oc-form-label">分类名称:</div>
          <input v-model="classifyEditData.classifyName" placeholder="请输入分类">
        </div>
      </div>
    </oc-dialog>
    <oc-dialog v-model="addDialogShow" title="新建话术" width="450" @submit="addterm">
      <div class="oc-form">
        <div class="oc-form-items-column">
          <div class="oc-form-label">话术内容:</div>
          <textarea v-model="term.content" rows="5" placeholder="请输入话术内容，长度在500个字符内" />
        </div>
        <div class="oc-form-items-row">
          <div class="oc-form-label">选择分类:</div>
          <oc-select
            v-model="term.classifyId"
            :options="classifyOptions"
            label="classifyName"
            value="classifyId"
            width="200"
          />
        </div>
        <div class="oc-form-items-row">
          <div class="oc-form-label">快捷短语:</div>
          <input v-model="term.keyword" placeholder="字母、数字、中文" maxlength="10">
        </div>
        <div class="oc-form-items-row">
          <div class="oc-form-label">创建分类:</div>
          <input v-model="classifyName" placeholder="请输入分类" axlength="10">
          <div class="classify-add-btn" @click.stop="addClassify">添加</div>
        </div>
        <div class="oc-form-tip">
          <div>1. 快捷短语：当输入"/" + "快捷短语"或关键字，可以快速匹配关联话术。</div>
          <div>2. 创建分类：如果无法选择分类，请先创建新分类。</div>
        </div>
      </div>
    </oc-dialog>
    <oc-dialog v-model="itemEditShow" title="话术内容编辑" width="450" @submit="submittermEdit">
      <div class="oc-form">
        <div class="oc-form-items-column">
          <div class="oc-form-label">话术:</div>
          <textarea v-model="termEditData.content" rows="8" placeholder="请输入话术内容" />
        </div>
        <div class="oc-form-items-row">
          <div class="oc-form-label">快捷短语:</div>
          <input v-model="termEditData.keyword" placeholder="字母、数字、中文">
        </div>
      </div>
    </oc-dialog>
  </div>
</template>

<script>
const { dialog } = require('electron').remote
import { mapState } from 'vuex'
export default {
  data() {
    return {
      searchInner: '',
      personalShow: true,
      teamShow: false,
      classifyEditShow: false,
      itemEditShow: false,
      addDialogShow: false,
      term: {
        content: '',
        classifyId: ''
      },
      classifyEditData: {
        classifyId: '',
        classifyName: ''
      },
      termEditData: {
        id: '',
        content: ''
      },
      classifyName: '',
      classifyOptions: [],
      personalterms: [],
      teamterms: []
    }
  },
  computed: mapState({
    personalWords: state => state.common.personalWords,
    teamWords: state => state.common.teamWords
  }),
  watch: {
    searchInner: function() {
      this.personalterms = this.filterPersonalterms()
      this.teamterms = this.filterTeamterms()
    },
    personalWords: function() {
      this.personalterms = this.personalWords
    },
    teamWords: function() {
      this.teamterms = this.teamWords
    }
  },
  mounted() {
    this.$store.dispatch('common/loadPersonalWords')
    this.$store.dispatch('common/loadTeamWords')
  },
  methods: {
    loadPersonalData: function() {
      this.$store.dispatch('common/loadPersonalWords')
    },
    loadClassifyOptions: function() {
      this.$Request.post('/termClassify/person', {})
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.classifyOptions = res.data
          } else {
            this.$_Notice.tip(res)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    change: function(type) {
      if (type === 1) {
        this.personalShow = true
        this.teamShow = !this.personalShow
      } else {
        this.personalShow = false
        this.teamShow = !this.personalShow
      }
    },
    clickItem: function(val) {
      if (val) {
        this.$store.commit('editer/replace', val)
      }
    },
    openAddDialog: function() {
      this.loadClassifyOptions()
      this.term.content = ''
      this.term.classifyId = ''
      this.term.keyword = ''
      this.addDialogShow = true
    },
    addClassify: function() {
      if (!this.classifyName || this.classifyName.trim().length === 0) {
        this.$_Notice.tip('请输入分类名称!')
        return
      }
      this.$Request.post('/termClassify/save', {
        classifyName: this.classifyName
      })
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.loadClassifyOptions()
            this.classifyName = ''
            this.$_Notice.tip('话术分类添加成功!')
          } else {
            this.$_Notice.tip(res.rm)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    addterm: function() {
      if (!this.term.content || this.term.content.trim().length === 0) {
        this.$_Notice.tip('请输入话术内容')
        return
      }
      if (this.term.content.length > 500) {
        this.$_Notice.tip('长度在500个字符')
        return
      }
      if (!this.term.classifyId) {
        this.$_Notice.tip('请选择分类!')
        return
      }
      this.$Request.post('/term/save', this.term)
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.loadPersonalData()
            this.$_Notice.tip('话术分类添加成功!')
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败!')
        })
      this.addDialogShow = false
    },
    classifyEdit: function(classify) {
      this.classifyEditData.classifyId = classify.classifyId
      this.classifyEditData.classifyName = classify.classifyName
      this.classifyEditShow = true
    },
    submitClassifyEdit: function() {
      if (!this.classifyEditData.classifyName || this.classifyEditData.classifyName.trim().length === 0) {
        this.$_Notice.tip('请输入分类名称')
        return
      }
      this.$Request.post('/termClassify/update', this.classifyEditData)
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.loadPersonalData()
            this.$_Notice.tip('分类更新成功！')
            this.classifyEditShow = false
          } else {
            this.$_Notice.tip(res.rm)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    classifyDelete: function(classify) {
      this.$_Confirm({ text: '确认删除分类及分类下所有话术吗？' }).then(confirm => {
        if (confirm) {
          this.$Request.post('/termClassify/delete', { id: classify.classifyId })
            .then(res => {
              res = JSON.parse(res)
              if (res.rc === 0) {
                this.$_Notice.tip('删除成功！')
                this.loadPersonalData()
              } else {
                this.$_Notice.tip(res.rm)
              }
              return null
            })
            .catch(res => {
              this.$_Notice.tip('访问失败')
            })
        }
      })
    },
    itemEdit: function(item) {
      this.termEditData.content = item.content
      this.termEditData.id = item.id
      this.termEditData.keyword = item.keyword
      this.itemEditShow = true
    },
    submittermEdit: function() {
      if (!this.termEditData.content || this.termEditData.content.trim().length === 0) {
        this.$_Notice.tip('请输入话术内容！')
        return
      }
      if (this.termEditData.content.length > 500) {
        this.$_Notice.tip('长度在500个字符')
        return
      }
      this.$Request.post('/term/update', this.termEditData)
        .then(res => {
          res = JSON.parse(res)
          if (res && res.rc === 0) {
            this.loadPersonalData()
            this.$_Notice.tip('话术内容更新成功!')
            this.itemEditShow = false
          } else {
            this.$_Notice.tip(res.rm)
          }
          return null
        })
        .catch(res => {
          this.$_Notice.tip('访问失败')
        })
    },
    itemDelete: function(item) {
      this.$_Confirm({ text: '确认要删除当前选中记录吗？' }).then(confirm => {
        if (confirm) {
          this.$Request.post('/term/delete', { id: item.id })
            .then(res => {
              res = JSON.parse(res)
              if (res.rc === 0) {
                this.$_Notice.tip('删除成功')
                this.loadPersonalData()
              } else {
                this.$_Notice.tip(res.rm)
              }
              return null
            })
            .catch(res => {
              this.$_Notice.tip('访问失败')
            })
        }
      })
    },
    classifyEditCancel: function() {
      this.classifyEditDialogShow = false
    },
    classifyDelCancel: function() {
      this.classifyDelDialogShow = false
    },
    showClassifyItem: function(classify) {
      classify.show = !classify.show
    },
    importterm: function() {
      const options = {
        filters: [{ name: 'Execl', extensions: ['xlsx', 'xls'] }]
      }
      dialog.showOpenDialog(options, result => {
        if (result) {
          this.$Request.upload('/term/import', result[0], (res) => {
            if (res && res.rc === 0) {
              this.$_Notice.tip('话术导入成功！')
              this.loadPersonalData()
            } else {
              this.$_Notice.tip(res.rm)
            }
          })
        }
      })
    },
    exportterm: function() {
      const options = {
        defaultPath: '客服个人话术',
        filters: [{ name: 'Execl', extensions: ['xlsx'] }]
      }
      dialog.showSaveDialog(options, result => {
        if (result) {
          this.$Request.download('/term/export', result, () => {
            this.$_Notice.tip('导出成功！文件存放到[' + result + ']')
          })
        }
      })
    },
    filterPersonalterms: function() {
      const searchStr = this.searchInner
      const datas = this.personalWords
      if (!searchStr || searchStr.length === 0) {
        return datas
      }
      let array = JSON.parse(JSON.stringify(datas))
      array = array.map((data) => {
        data.items = data.items.filter((item) => {
          if (item.content.indexOf(searchStr) !== -1) {
            return item
          }
          if (item.keyword && item.keyword.indexOf(searchStr) !== -1) {
            return item
          }
        })
        return data
      })
      return array
    },
    filterTeamterms: function() {
      const searchStr = this.searchInner
      const datas = this.teamWords
      if (!searchStr || searchStr.length === 0) {
        return datas
      }
      let array = JSON.parse(JSON.stringify(datas))
      array = array.map((data) => {
        data.items = data.items.filter((item) => {
          if (item.content.indexOf(searchStr) !== -1) {
            return item
          }
          if (item.keyword && item.keyword.indexOf(searchStr) !== -1) {
            return item
          }
        })
        return data
      })
      return array
    }
  }
}
</script>

<style scoped>
.term-box {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 5px;
}
.term-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.term-search {
  text-align: center;
  margin: 10px 20px;
  position: relative;
}
.term-search input {
  outline: none;
  border: 1px solid #dcdcdc;
  margin: 0;
  padding: 0;
  line-height: 25px;
  border-radius: 15px;
  width: 100%;
  padding: 0px 35px;
}

.search-icon {
  cursor: pointer;
  z-index: 10;
  display: block;
  position: absolute;
  top: 5px;
  left: 12px;
  background: url("../../../assets/images/term/search.png") center no-repeat;
  background-size: 18px 16px;
  width: 18px;
  height: 16px;
}

.term-tabs-bar { border-bottom: 1px solid #dcdcdc; padding-left: 20px; }
.term-tabs-bar .active { border: 1px solid #dcdcdc; border-bottom: 1px solid #fff; background-color: #fff; color: #47D1D6; }
.tabs-nav-container {
  height: 25px;
  margin-bottom: -1px;
  color: #626262;
  font-size: 13px;
  line-height: 1.5;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  zoom: 1;
}
.tabs-nav-container div {
  height: 25px;
  display: inline-block;
  padding: 2px 25px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all .5s;
  border-radius: 4px 4px 0 0;
}

.term-tab { flex: 1; overflow-x: hidden; overflow-y: auto; margin-top: 10px; }
.classify { height: 30px; padding-right: 100px; position: relative; cursor: pointer; padding-left: 20px; }
.classify:hover { background-color: #f0f0f0; }
.classify:hover .classify-opt { display: flex; padding-right: 20px;}
.classify-name { font-weight: bold; line-height: 30px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.classify-opt { position: absolute; cursor: pointer; top:0; right: 0px; display: none; }
.classify-edit, .classify-arrow { padding: 0 8px; }
.classify-delete { padding-left: 8px; }

.items { font-size: 12px; color: #535353; }
.item { line-height: 25px; height: 25px; cursor: pointer;  position: relative; padding-left: 20px; }
.item-content { overflow: hidden;  white-space: nowrap; text-overflow: ellipsis; max-width: 320px; }
.item-keyword { color: #11b8f5; padding-right: 3px; }
.item:hover { background-color: #f0f0f0; }
.item-opt { position: absolute; cursor: pointer; top:0; right: 0; display: none; }
.item:hover .item-opt { display: block; }
.item-edit { display: inline-block; padding-right: 15px; }
.item-delete { display: inline-block; padding-right: 20px; }

.classify .edit-icon, .classify .del-icon, .classify .arrow-icon, .classify .new-icon { height: 30px; width: 16px; background-size: 16px 16px; }
.new-icon { display: block; background: url("../../../assets/images/term/new.png") center no-repeat; }
.new-icon:hover { background: url("../../../assets/images/term/new_hover.png") center no-repeat; }
.arrow-icon { display: block; background: url("../../../assets/images/term/arrow.png") center no-repeat; }
.arrow-icon:hover { background: url("../../../assets/images/term/arrow_hover.png") center no-repeat; }
.item .edit-icon, .item .del-icon { height: 25px; width: 16px; background-size: 16px 16px; }
.edit-icon { display: block; background: url("../../../assets/images/term/edit.png") center no-repeat; }
.edit-icon:hover { background: url("../../../assets/images/term/edit_hover.png") center no-repeat; }
.del-icon { display: block; background: url("../../../assets/images/term/del.png") center no-repeat; }
.del-icon:hover { background: url("../../../assets/images/term/del_hover.png") center no-repeat; }

.add-icon, .upload-icon, .download-icon { height: 40px; width: 18px; background-size: 18px 18px; display: block; float: left; }
.add-icon { background: url("../../../assets/images/term/add.png") center no-repeat; }

.personal-term-bar { height: 40px; border-top: 1px solid #f0f0f0; padding-left: 20px; }
.tool-bar { display: inline-block; line-height: 40px; margin-right: 50px; cursor: pointer; }

.tool-bar:hover .add-icon { background: url("../../../assets/images/term/add_hover.png") center no-repeat; }
.upload-icon { background: url("../../../assets/images/term/upload.png") center no-repeat; }
.tool-bar:hover .upload-icon { background: url("../../../assets/images/term/upload_hover.png") center no-repeat; }
.download-icon { background: url("../../../assets/images/term/download.png") center no-repeat; }
.tool-bar:hover .download-icon { background: url("../../../assets/images/term/download_hover.png") center no-repeat; }

.personal-term { position: relative; margin-bottom: 5px; }

.tool-bar > span { display: block; float: left; margin-left: 5px; }
.tool-bar:hover { color: #11b8f5; }

.classify-add-btn { height: 25px; line-height: 25px; margin-left: 8px; cursor: pointer; text-align: center; width: 60px; background-color: #fff; border: 1px solid #dcdcdc; }

</style>
