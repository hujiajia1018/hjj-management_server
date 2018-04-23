<template>
  <div class="storegroup" v-loading="isLoading">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>账户信息</el-breadcrumb-item>
        <el-breadcrumb-item>门店分组</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel" @click="resetEditStatus($event)">
      <div class="panel-header panel-header__auto">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="门店名称">
            <el-input v-model="form.mchname" size="small"></el-input>
          </el-form-item>
          <el-select v-model="form.is_fenzu" size="small" placeholder="是否分组">
            <el-option label="全部" value="all"></el-option>
            <el-option label="已分组" value="1"></el-option>
            <el-option label="未分组" value="2"></el-option>
          </el-select>
          <el-select v-model="form.groupid" size="small" placeholder="门店分组">
            <el-option
              v-for="group in groupList"
              :key="group.group_id"
              :label="group.group_name"
              :value="group.group_id">
            </el-option>
          </el-select>
          <el-select v-model="form.provinceId" ref="province" size="small" @change="selectProvince()" placeholder="所属省份">
            <el-option
              v-for="area in provinces"
              :key="area.full_name"
              :label="area.full_name"
              :value="area.area_id">
            </el-option>
          </el-select>
          <el-select v-model="form.city" size="small" :loading="isCitysLoading" placeholder="所属地市">
            <el-option
              v-for="city in citys"
              :key="city.area_id"
              :label="city.full_name"
              :value="city.full_name">
            </el-option>
          </el-select>
          <footer>
            <el-button size="medium" @click="submitForm()" type="primary">查询</el-button>
            <el-button size="medium" @click="resetForm()">重置</el-button>
          </footer>
        </el-form>
      </div>
      <div class="panel-body">
        <el-row :gutter="20">
          <el-col :span="4">
            <h3>门店分组</h3>
            <ul class="group-list" :class="{'edit': isEdit}">
              <li v-for="group in groupList" @click="getGroupStores(group.group_id)" :class="{'active': groupId === group.group_id}">
                <em>{{group.group_name}}</em>
                <span><img @click.stop="updateGroup(group.group_id, group.group_name)" src="./image/icon-edit.svg" alt="编辑"><img src="./image/icon-delete.svg" @click.stop="deleteGroup(group.group_id, group.group_name)" alt="删除"></span>
              </li>
            </ul>
            <footer>
              <el-button @click.stop="toggleEditStatus()" type="text">{{isEdit ? '完成' : '管理分组'}}</el-button><el-button @click="addGroup()" type="text">添加分组</el-button>
            </footer>
          </el-col>
          <el-col :span="20">
            <el-table ref="tabel" stripe :data="storeList" @selection-change="handleSelectionChange">
              <el-table-column prop="userid" type="selection" width="45">
                <input type="hidden" value="userid">
              </el-table-column>
              <el-table-column prop="shopname" label="门店名称"></el-table-column>
              <el-table-column prop="province" label="省" width="100"></el-table-column>
              <el-table-column prop="city" label="市" width="100"></el-table-column>
              <el-table-column prop="address" label="地址"></el-table-column>
              <el-table-column prop="group_name" label="所属分组"></el-table-column>
            </el-table>
            <div class="panel-body-footer">
              <div class="operate">
                <el-button v-show="groupId !== 'vl'" type="text" @click="deleteStoreFromGroup()">从组中移除</el-button>
                <el-button v-show="groupId === 'vl'" type="text" @click="updateStoreFromGroup()">门店分组</el-button>
                <el-button v-show="groupId !== 'vl'" type="text" @click="updateStoreFromGroup('update')">修改分组</el-button>
              </div>
              <el-pagination
                v-show="storeCount > 0"
                ref="page"
                layout="total, sizes, prev, pager, next, jumper"
                :page-size="pageSize"
                @size-change="handleSizeChange"
                :total="storeCount"
                @current-change="currentChange"
                :current-page="currentPage">
              </el-pagination>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-dialog
      :title="getDialogTitle(groupType)"
      :visible.sync="dialogVisible"
      :show-close="false"
      size="tiny"
      width="300px">
      <div v-if="groupType === 'add'" class="add-group">
        <label>分组名称</label>
        <el-input ref="addgroupinput" v-model="groupName"></el-input>
        <p v-if="groupName" class="warn-tip" :class="{'show': getByteLength() > 20}">分组名称不能超过20个字符</p>
        <p v-else class="warn-tip" :class="{'show': isNullGroupName}">分组名称不能为空</p>
      </div>
      <div v-if="groupType === 'delete'">
        <p>您确定要删除{{groupName}}分组吗？</p>
      </div>
      <div v-if="groupType === 'update'" class="add-group">
        <label>分组名称</label>
        <el-input ref="updategroupinput" v-model="groupName"></el-input>
        <p v-if="groupName" class="warn-tip" :class="{'show': getByteLength() > 20}">分组名称不能超过20个字符</p>
        <p v-else class="warn-tip" :class="{'show': isNullGroupName}">分组名称不能为空</p>
      </div>
      <div v-if="groupType === 'select'">
        <label>分组名称</label>
        <el-select v-model="selectedGroupId" size="small">
          <el-option
            v-for="group in groupList"
            :key="group.group_id"
            :label="group.group_name"
            :value="group.group_id">
          </el-option>
        </el-select>
      </div>
      <div v-if="groupType === 'deleteStore'">
        <p>您确定要将该门店从当前分组中移除吗？</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="groupType === 'add' || groupType === 'delete' || groupType === 'update'" type="primary" @click="operateGroup()">确定</el-button>
        <el-button v-else type="primary" @click="operateStoreFromGroup()">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs';
  import config from 'config';

  export default {
    data() {
      return {
        form: {
          mchname: '',
          is_fenzu: '',
          groupid: '',
          provinceId: '',
          city: '',
        },
        provinces: [],
        isCitysLoading: false,
        citys: [],
        groupList: [],
        isEdit: false,
        dialogVisible: false,
        groupType: '',  // add update delete select
        groupId: 'vl',  // vl 是未分组 groupid
        selectedGroupId: '',
        groupName: '',
        isNullGroupName: false,
        storeList: [{
          shopname: '',
          province: '',
          city: '',
          address: '',
          group_name: ''
        }],
        selectedStores: [],   // 选中的店铺
        isLoading: false,
        storeCount: 0,
        currentPage: 1,
        pageSize: 10
      }
    },
    props: {
      shop: {
        type: Object
      }
    },
    created() {
      this.getArea(0, 'province')
      this.getGroup()
    },
    methods: {
      resetEditStatus (e) {
        this.isEdit = false
      },
      selectProvince () {
        this.form.city = ''
        let provinceId = Number(this.form.provinceId)
        if (provinceId > 0) {
          this.isCitysLoading = true
          this.getArea(provinceId, 'city')
        }
      },
      submitForm () {
        this.groupId = ''
        this.currentPage = 1
        this.pageSize = 10
        this.getFilterStores()
      },
      getFilterStores () {
        this.isLoading = true
        let params = Object.assign(this.form, {
          format: 'cors',
          province: this.$refs.province.selected.label,
          pagesize: this.pageSize,
          page: this.currentPage
        })
        axios.get(`${config.host}/merchant/group/search`, {
          params
        })
        .then((res) => {
          this.isLoading = false
          let data = res.data
          if (data.respcd === config.code.OK) {
            this.storeList = data.data.data
            this.storeCount = data.data.count
          } else {
            this.$message({
              message: data.resperr,
              type: 'error'
            })
          }
        })
      },
      resetForm() {
        // 重置表单
        this.form.mchname = ''
        this.form.is_fenzu = ''
        this.form.groupid = ''
        this.form.provinceId = ''
        this.form.city = ''
        this.citys = []
      },
      toggleEditStatus () {
        this.isEdit = !this.isEdit
      },
      addGroup () {
        this.groupName = ''
        this.groupType = 'add'
        this.isNullGroupName = false
        this.dialogVisible = true
      },
      deleteGroup (id, name) {
        this.groupType = 'delete'
        this.groupName = name
        this.groupId = id
        this.dialogVisible = true
      },
      updateGroup (id, name) {
        this.groupType = 'update'
        this.groupId = id
        this.groupName = name
        this.isNullGroupName = false
        this.dialogVisible = true
      },
      // 1个汉字等于2个字符
      getByteLength() {
        let len = 0
        let val = this.groupName
        for (let i = 0; i < val.length; i++) {
          let length = val.charCodeAt(i)
          if (length >= 0 && length <= 128) {
            len += 1
          } else {
            len += 2
          }
        }
        return len
      },
      operateGroup () {
        if (!this.groupName) {
          this.isNullGroupName = true
          return false
        } else if (this.getByteLength() > 20) {
          return false
        }
        let params = {
          operate: this.groupType,
          group_name: this.groupName,
          group_id: this.groupId,
          format: 'cors'
        }
        axios.post(`${config.host}/merchant/group/group_operate`, qs.stringify(params))
        .then((res) => {
          let data = res.data
          if (data.respcd === config.code.OK) {
            if (this.groupType === 'add') {
              let insertIndex = this.groupList.length - 1   // 插入倒数第二的位置，未分组前面
              this.groupList.splice(insertIndex, 0, {
                group_name: this.groupName,
                group_id: data.data.group_id
              })
            } else if (this.groupType === 'delete') {
              this.groupList.map((group, index) => {
                if (group.group_id === this.groupId) {
                  this.groupList.splice(index, 1)
                }
              })
              // 删除组的同时，清空当前组的店铺
              this.storeList = []
            } else if (this.groupType === 'update') {
              this.groupList.map((group) => {
                if (group.group_id === this.groupId) {
                  group.group_name = this.groupName
                }
              })
            }
            this.dialogVisible = false
          } else {
            this.$message({
              message: data.resperr,
              type: 'error'
            })
          }
        })
      },
      getDialogTitle (type) {
        switch (type) {
          case 'add':
            return '添加分组'
          case 'update':
            return '编辑'
          case 'delete':
            return '删除'
          case 'select':
            return '修改分组'
          case 'deleteStore':
            return '提示'
        }
      },
      getArea (pid, type) {
        axios.get(`${config.ohost}/mchnt/oauth/get_area`, {
          params: {
            format: 'cors',
            pid
          }
        })
        .then((res) => {
          let data = res.data
          if (data.respcd === config.code.OK) {
            if (type === 'province') {
              this.provinces = data.data
            } else {
              this.isCitysLoading = false
              this.citys = data.data
            }
          } else {
            this.$message({
              message: data.resperr,
              type: 'error'
            })
          }
        })
      },
      getGroup () {
        this.isLoading = true
        axios.get(`${config.host}/merchant/group/allgroups`, {
          params: {
            format: 'cors'
          }
        })
        .then((res) => {
          this.isLoading = false
          let data = res.data
          if (data.respcd === config.code.OK) {
            this.groupList = data.data
            this.getGroupStores(data.data[0].group_id)
          } else {
            this.$message({
              message: data.resperr,
              type: 'error'
            });
          }
        })
      },
      getGroupStores (groupid) {
        this.resetForm()
        this.groupId = groupid
        this.isLoading = true
        axios.get(`${config.host}/merchant/group/allgroup_shops`, {
          params: {
            format: 'cors',
            group_id: groupid,
            pagesize: this.pageSize,
            page: this.currentPage
          }
        })
        .then((res) => {
          this.isLoading = false
          let data = res.data
          if (data.respcd === config.code.OK) {
            this.storeCount = data.data.count
            this.storeList = data.data.data
          } else {
            this.$message({
              message: data.resperr,
              type: 'error'
            })
          }
        })
      },
      currentChange(current) {
        if (current) {
          this.currentPage = current;
        } else {
          this.currentPage = 1
        }
        if (this.groupId) {
          this.getGroupStores(this.groupId)
        } else {
          this.getFilterStores()
        }
      },
      handleSizeChange(size = 10) {
        this.pageSize = size;
        this.currentChange();
      },
      handleSelectionChange (stores) {
        this.selectedStores = stores
      },
      deleteStoreFromGroup() {
        if (this.selectedStores.length === 0) {
          this.$message({
            message: '请先勾选门店后再进行操作',
            type: 'error'
          })
          return false
        }
        this.groupType = 'deleteStore'
        this.dialogVisible = true
      },
      updateStoreFromGroup() {
        if (this.selectedStores.length === 0) {
          this.$message({
            message: '请先勾选门店后再进行操作',
            type: 'error'
          })
          return false
        }
        this.groupType = 'select'
        this.selectedGroupId = ''
        this.dialogVisible = true
      },
      operateStoreFromGroup () {
        let userids = []
        for (let i = 0; i < this.selectedStores.length; i++) {
          userids.push(this.selectedStores[i].userid)
        }
        let params = {
          operate: '',
          userids: userids.toString(),
          groupid: this.selectedGroupId,
          format: 'cors'
        }
        if (this.groupType === 'select') {
          params.operate = 'update'
        } else if (this.groupType === 'deleteStore') {
          params.operate = 'delete'
        }
        axios.post(`${config.host}/merchant/group/shop_operate`, qs.stringify(params))
        .then((res) => {
          let data = res.data
          if (data.respcd === config.code.OK) {
            this.getGroupStores(this.groupId)
            this.selectedStores = []
            this.dialogVisible = false
          } else {
            this.$message({
              message: data.resperr,
              type: 'error'
            })
          }
        })
      }
    }
  }
</script>

<style scoped lang="scss">
.group-list {
  text-align: center;
  padding: 10px;
  li {
    padding: 10px 0;
    line-height: 1.2;
    border-bottom: 1px dashed #C2C2C2;
    em {
      word-break: break-all;
    }
  }
  li {
    font-size: 14px;
    cursor: pointer;
    &.active {
      background-color: #F7F6F1;
    }
  }
  img {
    display: none;
    cursor: pointer;
    vertical-align: middle;
    &:last-child {
      margin-left: 15px;
    }
  }
  &.edit {
    li {
      text-align: right;
      padding: 12px 5px;
      em {
        float: left;
        text-align: left;
      }
      span {
        white-space: nowrap;
      }
      &:last-child {
        text-align: left;
      }
    }
    img {
      display: inline-block;
    }
  }
  li:last-child {
    img {display: none;}
    em {float: none;}
  }
}
.el-form {
  .el-form-item {
    display: inline-block;
    width: 240px;
  }
  .el-select {
    width: 160px;
  }
  footer {
    padding-left: 80px;
    padding-top: 15px;
    button {
      width: 100px;
      &:first-child {
        margin-right: 10px;
      }
    }
  }
}
.el-dialog__body {
  .warn-tip {
    padding-top: 6px;
    color: #ff4949;
    font-size: 12px;
    margin-left: 60px;
    visibility: hidden;
  }
  .show {
    visibility: visible;
  }
}
.el-col {
  position: relative;
  min-height: 400px;
  padding-bottom: 60px;
  footer, .panel-body-footer {
    height: 60px;
    background-color: #FBFBFB;
    position: absolute;
    bottom: 0;
    left: 0;
  }
}
.el-col-4 {
  h3 {
    text-align: center;
    line-height: 45px;
  }
  border-right: 1px solid #E7EAEC;
  footer {
    line-height: 60px;
    width: 100%;
    button {
      width: 50%;
      height: 24px;
      padding: 0;
      color: #262424;
      border-radius: 0;
      &:hover {
        color: #FE9B20
      }
      &:first-child {
        border-right: 1px solid #C2C2C2;
      }
    }
  }
}
.panel-body-footer {
  padding: 0 30px;
  box-sizing: border-box;
  z-index: 10;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .el-button--text {
    color: #262424;
    &:first-child {
      margin-right: 15px;
    }
    &:hover {
      color: #FE9B20
    }
  }
}
.add-group {
  .el-input {
    width: 60%;
  }
}
.hide {
  display: none;
}
</style>
