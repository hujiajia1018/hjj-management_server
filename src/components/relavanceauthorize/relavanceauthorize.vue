<template lang="html">
  <div class="relevanceauthorize">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>授权管理</el-breadcrumb-item>
        <el-breadcrumb-item>门店关联</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group">
          <span class="panel-header__desc">关联外部shopID</span>
        </div>
      </div>
      <div class="panel-body">
        <el-table :data="shopData.list" style="width: 100%" row-class-name="el-table__row_fix" v-loading="loading" element-loading-text="拼命加载中">
          <el-table-column label="好近门店名称" prop="shop_name">
          </el-table-column>
          <el-table-column label="口碑门店名称">
            <template scope="scope">
              <el-select placeholder="请选择门店" size="small" v-model="scope.row.shop_id" v-if="!scope.row.status" @change="checkShop">
                <el-option v-for="shop in kouBeiShopList" :label="shop.shop_name" :key="shop.shop_id" :value="shop.shop_id">
                </el-option>
              </el-select>
              <span v-else>{{scope.row.bindInfo.shop_name}}</span>
            </template>
          </el-table-column>
          <el-table-column label="绑定状态" min-width="50">
            <template scope="scope" >
              <span>{{scope.row.status ? '已绑定' : '未绑定'}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作时间">
            <template scope="scope" >
              <span v-if="!scope.row.status">{{'未操作'}}</span>
              <span v-else>{{ scope.row.bindInfo.update_time }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template scope="scope">
              <el-button type="text" size="small" class="el-button__fix" @click="scope.row.status ? showsReviseConfirm(scope.row) : saveBound(scope.row)">{{scope.row.status ? '修改' : '绑定'}}</el-button>
              <el-button type="text" size="small" class="el-button__fix" @click="showConfirm(scope.row)" :disabled="scope.row.status == 0">解绑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="shopData.count >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="shopData.count"
          @current-change="currentChange"
          :current-page="currentPage">
        </el-pagination>
      </div>
      <div class="table_placeholder" v-else></div>
    </div>
    <el-dialog title="提示" :visible.sync="showRelieveConfirm"  top="20%" custom-class="mydialog" :show-close="false">
      <span class="tip-text">是否确认解除绑定?</span>
      <span slot="footer" class="dialog-footer dialog-center">
        <el-button @click="showRelieveConfirm = false" class="dialog-btn">取 消</el-button>
        <el-button type="primary" @click="relieveBound" class="dialog-btn green-btn">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="showReviseConfirm"  top="20%" custom-class="mydialog" :show-close="false">
      <span class="tip-text">修改绑定需要先解绑，是否解绑？</span>
      <span slot="footer" class="dialog-footer dialog-center">
        <el-button @click="showReviseConfirm = false" class="dialog-btn">取 消</el-button>
        <el-button type="primary" @click="relieveBound" class="dialog-btn green-btn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import qs from 'qs';
import config from 'config';
import Store from '../../common/js/store';

export default {
  data () {
    return {
      heihei: '',
      role: Store.get('role') || {},
      loading: false,
      selectKouBei: '',
      kouBeiShopList: [],
      pageSize: 10,
      currentPage: 0,
      shopData: {},
      showRelieveConfirm: false,
      showReviseConfirm: false,
      shopname: ''
    }
  },
  created () {
    this.getInfo()
  },
  watch: {
  },
  methods: {
    getInfo () { // 获取好近门店列表
      axios.get(`${config.host}/merchant/info?format=cors`)
        .then((res) => {
          let data = res.data;
          if(data.respcd === config.code.OK) {
            this.shopname = data.data.shopname
            this.getHjShopList()
          } else {
            this.$message.error(data.respmsg);
          }
        })
        .catch(() => {
          this.loading = false;
          this.$message.error('网络错误');
        });
    },
    checkShop () {
    },
    getHjShopList () {
      let data = {
        start: this.currentPage,
        len: this.pageSize,
        format: 'cors'
      }
      if(!this.loading) {
        this.loading = true;
        axios.get(`${config.host}/merchant/sub/list`, {
          params: data
        }).then((res) => {
          this.loading = false;
          let data = res.data;
          if(data.respcd === config.code.OK) {
            this.shopData = data.data
            if (data.data.list.length === 0 && this.role.isMerchant) {
              this.shopData.list = []
              this.shopData.list.push({
                shop_name: this.shopname,
                uid: 'merchant'
              })
            }
            this.getBindIndo() // 获取已经口碑未绑定门店列表 及 已经绑定对应关系
          } else {
            this.$message.error(data.resperr);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('获取数据失败');
        });
      }
    },
    getBindIndo () {
      axios.get(`${config.host}/merchant/koubei/bind_info`, {
        parmas: {
          format: 'cors'
        }
      }).then((res) => {
        let data = res.data;
        if(data.respcd === config.code.OK) {
          this.kouBeiShopList = data.data.unbound_shops
          this.splitData(data.data.bound_shops)
        } else {
          this.splitData()
          this.$message.error(data.resperr);
        }
      }).catch(() => {
        this.$message.error('获取数据失败');
      });
    },
    splitData (obj) {
      let shopArry = this.shopData.list
      for (let i = 0; i < shopArry.length; i++ ) {
        shopArry[i].status = 0
      }
      if (obj) {
        for (let key in obj) {
          for (let i = 0; i < shopArry.length; i++ ) {
            if (shopArry[i].uid === key) {
              shopArry[i].bindInfo = obj[key]
              shopArry[i].status = 1
            } else if (shopArry[i].status === 1) {
              continue
            } else {
              shopArry[i].status = 0
            }
          }
        }
      }
    },
    saveBound (data) { // 保存绑定
      if (!data.shop_id) {
        this.$message.error('请选择口碑门店');
      } else {
        let parmas = {
          mode: 'bind',
          uid: data.uid,
          shop_id: data.shop_id
        }
        axios.post(`${config.host}/merchant/koubei/bind`, qs.stringify(parmas)).then((res) => {
          let data = res.data;
          if(data.respcd === config.code.OK) {
            this.$message({
              type: 'success',
              message: '绑定成功'
            })
            this.getHjShopList()
          } else {
            this.$message.error(data.resperr);
          }
        })
      }
    },
    relieveBound () { // 解除绑定
      let data = this.flagData
      let parmas = {
        mode: 'untie',
        uid: data.uid,
        shop_id: data.bindInfo.shop_id
      }
      axios.post(`${config.host}/merchant/koubei/bind`, qs.stringify(parmas)).then((res) => {
        let data = res.data;
        if(data.respcd === config.code.OK) {
          this.getHjShopList()
          this.showRelieveConfirm = false
          this.showReviseConfirm = false
          this.$message({
            type: 'success',
            message: '解绑成功'
          })
        } else {
          this.$message.error(data.resperr);
        }
      })
    },
    currentChange(current) {
      if (!current && this.currentPage !== 0) {
        this.currentPage = 0;
        return;
      }
      if (current) {
        this.currentPage = current;
      }
      this.getHjShopList();
    },
    handleSizeChange(size = 10) {
      this.pageSize = size
      this.currentChange()
    },
    showConfirm (data) {
      if (data.status === 1) {
        this.showRelieveConfirm = true
        this.flagData = data
      }
    },
    showsReviseConfirm (data) {
      this.showReviseConfirm = true
      this.flagData = data
    }
  }
}
</script>

<style lang="scss" scoped>
  .tip-text {
    display: inline-block;
    width: 100%;
    text-align: center;
    font-size: 16px;
    padding: 0 0 5px;
  }
  .dialog-center {
    border-top: 1px solid #E8E7E6;
    padding-top: 20px;
    .dialog-btn {
      width: 100px;
      margin-left: 20px;
      font-size: 15px;
    }
    .green-btn {
      background-color: #7ED321;
      border-color: #7ED321;
      &:hover {
        background-color: #64A61A;
        border-color: #64A61A;
      }
    }
  }
</style>
