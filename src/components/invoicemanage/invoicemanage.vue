<template>
  <div>
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>开票信息管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-body">
        <el-row :gutter="20">
          <el-col :span="7" style="padding: 0;">
            <h3 class="panel-header">开票列表</h3>
            <ul class="company-list">
              <li v-for="item, index in companyList" :class="{'active' : currentIndex === index}" @click="chooseCompany(index)">{{item.title}}</li>
            </ul>
          </el-col>
          <el-col :span="16" style="padding: 0;">
            <h3 class="panel-header">开票信息</h3>
            <ul class="note-info">
              <li>
                <em>名称</em>
                <span>{{note.title}}</span>
                <button @click="copyText($event)">复制</button>
              </li>
              <li>
                <em>税号</em>
                <span>{{note.tax_no}}</span>
                <button @click="copyText($event)">复制</button>
              </li>
              <li>
                <em>单位地址</em>
                <span>{{note.address}}</span>
                <button @click="copyText($event)">复制</button>
              </li>
              <li>
                <em>电话号码</em>
                <span>{{note.telephone}}</span>
                <button @click="copyText($event)">复制</button>
              </li>
              <li>
                <em>开户银行</em>
                <span>{{note.bank_name}}</span>
                <button @click="copyText($event)">复制</button>
              </li>
              <li>
                <em>银行账户</em>
                <span>{{note.bank_num}}</span>
                <button @click="copyText($event)">复制</button>
              </li>
            </ul>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from 'src/config'
export default {
  data () {
    return {
      companyList: [],
      currentIndex: 0,
      note: {}
    }
  },
  created () {
    this.getInvoiceList()
  },
  methods: {
    copyText (e) { // 复制到剪切板
      window.getSelection().selectAllChildren(e.target.previousElementSibling)
      document.execCommand('copy')
      this.$message({
        type: 'success',
        message: '复制成功!'
      })
    },
    chooseCompany (index) {
      this.currentIndex = index
      this.note = this.companyList[index]
    },
    getInvoiceList () {
      axios.get(`${config.ohost}/mchnt/invoice/list`, {
        params: {
          format: 'cors'
        }
      }).then((res) => {
        let data = res.data
        this.companyList = data.data
        this.chooseCompany(0)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.panel {
  background: none;
  box-shadow: none;
}
.el-col {
  background-color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.12);
  min-height: 464px;
  box-sizing: border-box;
}
.el-col-7 {
  margin-right: 20px;
}
.company-list {
  font-size: 14px;
  li {
    height: 50px;
    line-height: 50px;
    cursor: pointer;
    border-bottom: 1px solid #f1f1f1;
    padding-left: 30px;
    &.active {
      background-color: #f1f1f1;
    }
  }
}
.panel-header {
  line-height: 50px;
  text-align: center;
  padding-left: 0;
}
.note-info {
  li {
    line-height: 1.2;
    border-bottom: 1px solid #f1f1f1;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    em {
      display: inline-block;
      width: 80px;
      text-align: left;
      font-size: 15px;
      color: #9B9B9B;
    }
    button {
      width: 50px;
      height: 30px;
      background-color: #FE9B20;
      color: #fff;
      text-align: center;
      font-size: 14px;
      border: none;
      outline: none;
      border-radius: 3px;
      cursor: pointer;
      &:active {
        background-color: #ffb457;
      }
    }
  }
}
</style>
