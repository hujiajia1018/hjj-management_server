<template>
  <div class="memberStorage">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item>会员储值</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="banner-btn" @click="createStorage">
        <i class="icon-create"></i>
        <span class="banner-btn__desc">新建储值</span>
      </div>
    </div>
    <div :class="origin=='yirui'?'.yirui-panel':'panel'">
      <div class="panel-header">
        <div class="panel-select-group">
          <div class="panel-select__wrapper">
            <span class="panel-select__desc">活动状态</span>
            <el-select v-model="stateValue" placeholder="全部" size="small" @change="stateChange">
              <el-option v-for="item in stateOptions" :label="item.label" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
          </div>

          <div class="btn-group">
            <div class="panel-header-btn">
              <router-link :to="{ name: 'storagelist'}">储值会员</router-link>
            </div>
            <div class="panel-header-btn">
              <router-link :to="{ name: 'storagebill'}">储值账单</router-link>
            </div>
          </div>
        </div>

      </div>
      <div class="panel-body">
        <el-table
          :data="storageData.data"
          style="width: 100%"
          row-class-name="el-table__row_fix"
          v-loading="loading"
          element-loading-text="拼命加载中"
          id="memberstorage"
          >
          <el-table-column
            label="活动时间"
            min-width="180">
            <template scope="scope">
              <p><span class="scope_cotent_title">开始时间</span>{{ scope.row.activity_info.start_time | removeHMS }}</p>
              <p><span class="scope_cotent_title">结束时间</span>{{ scope.row.activity_info.end_time | removeHMS }}</p>
            </template>
          </el-table-column>
          <el-table-column
            label="活动状态">
            <template scope="scope">{{ storageDict[scope.row.activity_status.status] }}</template>
          </el-table-column>
          <el-table-column prop="activity_stat.user_num" label="储值人数"></el-table-column>
          <el-table-column
            label="储值金额">
            <template scope="scope">{{ scope.row.activity_stat.total_pay_amt | formatCurrency }}元</template>
          </el-table-column>
          <el-table-column
            prop="rules"
            label="储值规则"
            min-width="180">
            <template scope="scope">
              <div v-for="item in scope.row.activity_info.rules">
                储值<span class="scope-highlight">{{ item.pay_amt | formatCurrency }}</span>元送<span class="scope-highlight">{{ item.present_amt | formatCurrency }}</span>元
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="180" label="创建来源" prop="who_create"></el-table-column>
          <el-table-column
            width="160"
            label="操作">
            <template scope="scope">
              <el-button type="text" size="small" class="el-button__fix" @click="getDetailData(scope.row.activity_info.activity_id)">查看详情</el-button>
              <el-dropdown>
                <span class="el-dropdown-link el-dropdown-link__fix">
                  更多<i class="el-icon-caret-bottom el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown" class="el-dropdown-menu__fix">
                  <el-dropdown-item class="el-dropdown-item__fix" @click.native="changeStorage(scope.row.activity_info.activity_id)" :disabled="scope.row.activity_status.status === 2 || scope.row.activity_status.status === 3">修改活动</el-dropdown-item>
                  <el-dropdown-item class="el-dropdown-item__fix" :disabled="scope.row.activity_status.status === 2 || scope.row.activity_status.status === 3" @click.native="cancelStorage(scope.row.activity_info.activity_id)">终止活动</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="storageData.total_entries >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="storageData.total_entries"
          @current-change="currentChange"
          :current-page="currentpage">
        </el-pagination>
      </div>
      <div class="table_placeholder" v-else></div>
    </div>
    <el-dialog v-if="detailData.activity_info" v-model="isShowDetail" class="detail_dialog" title="储值活动详情">
      <template>
        <el-row class="mb-5" v-if="!this.role.single">
          <el-col :span="5" class="title">适用门店</el-col>
          <el-col :span="19" class="desc">
            <div v-if="shopList.length > 0">
              <span  v-for="(shop,index) in shopList">{{ shop.shop_name }}{{ index < shopList.length - 1?"、":"" }}</span>
            </div>
            <div v-else>无</div>
            <div class="remark mt-0 lh-16">注：请确保以上门店均已开通储值服务，否则无法正常储值！</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">储值规则</el-col>
          <el-col :span="19" class="desc">
            <div class="desc-item" v-for="rule in detailData.activity_info.rules">
              <span>储值{{ rule.pay_amt | formatCurrency }}送{{ rule.present_amt | formatCurrency }}元</span>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">储值规则备注</el-col>
          <el-col :span="19" class="desc">{{ detailData.activity_info.desc }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">活动开始时间</el-col>
          <el-col :span="19" class="desc">{{ detailData.activity_info.start_time }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">活动结束时间</el-col>
          <el-col :span="19" class="desc">{{ detailData.activity_info.end_time }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">预留电话</el-col>
          <el-col :span="19" class="desc">{{ detailData.activity_info.mch_mobile }}</el-col>
        </el-row>

      </template>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios';
  import config from 'config';
  import {deepClone} from '../../common/js/util';
  import Store from '../../common/js/store';

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        vm = Object.assign(vm, {
          stateValue: '',
          pageSize: 10,
          currentpage: 1,
          flag: false
        });
        vm.$store.dispatch('getStorageData');
        setTimeout(() => {
          Object.assign(vm, {
            flag: true
          });
        }, 200);
      });
    },
    data() {
      return {
        origin: localStorage.getItem('origin'),
        pending: false,
        role: Store.get('role') || {},
        storageDict: ['未开始', '进行中', '已结束', '已终止'],
        stateOptions: [
          {
            label: '全部',
            value: ''
          },
          {
            label: '未开始',
            value: 0
          },
          {
            label: '进行中',
            value: 1
          },
          {
            label: '已结束',
            value: 2
          },
          {
            label: '已终止',
            value: 3
          }
        ],
        stateValue: '',
        detailData: {},
        isShowDetail: false,
        pageSize: 10,
        loading: false,
        currentpage: 1,
        shopList: []
      };
    },
    computed: {
      storageData() {
        return this.$store.state.storageData;
      },
      shopData() {
        let shopData = deepClone(this.$store.state.shopData || {});
        let list = shopData.list || [];
        list.shift();
        return list;
      },
      basicParams() {
        return {
          pos: this.currentpage - 1,
          count: this.pageSize,
          activity_status: this.stateValue
        };
      }
    },
    methods: {
      stateChange() {
        this.handleSizeChange();
      },

      // 格式化门店列表
      getshopList() {
        let list = this.shopData;
        let ids = this.detailData.shop_list || [];
        let lists = [];
        if(ids[0] === '') {
          lists = list;
        }else {
          for(let i of ids) {
            for(let val of list) {
              if(val.uid === i) {
                lists.push(val);
              }
            }
          }
        }
        return lists;
      },

      currentChange(current) {
        if(!current && this.currentpage !== 1) {
          this.currentpage = 1;
          return;
        }
        if(current) {
          this.currentpage = current;
        }
        if(this.flag) {
          this.$store.dispatch('getStorageData', {
            params: this.basicParams
          });
        }
        console.log(this.basicParams);
      },

      handleSizeChange(size = 10) {
        this.pageSize = size;
        this.currentChange();
      },

      cancelStorage(id) {
        if(this.role.isCashier) {
          this.$message.error('您暂无权限执行此操作');
        }else {
          this.$confirm('是否要取消此活动?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '关闭'
          })
            .then(() => {
              axios.post(`${config.host}/merchant/prepaid/stop`, {
                activity_id: id
              }).then((res) => {
                let data = res.data;
                if(data.respcd === config.code.OK) {
                  this.$message({
                    type: 'success',
                    message: '取消储值活动成功'
                  });
                  this.$store.dispatch('getStorageData', {
                    params: this.basicParams
                  });
                } else {
                  this.$message.error(data.resperr);
                }
              }).catch(() => {
                this.$message.error('取消储值活动失败');
              });
            }).catch(() => {
            console.log("取消");
          });
        }
      },

      fixData(data) {
        data = deepClone(data);
        data.activity_info.rules.forEach((v) => {
          v.pay_amt = (v.pay_amt / 100).toFixed(2);
          v.present_amt = (v.present_amt / 100).toFixed(2);
        });
        return data;
      },

      // 编辑储值
      changeStorage(id) {
        if(this.role.isCashier) {
          this.$message.error('您暂无权限执行此操作');
        }else {
          this.loading = true;
          axios.get(`${config.host}/merchant/prepaid/detail`, {
            params: {
              activity_id: id
            }
          }).then((res) => {
            let data = res.data;
            this.loading = false;
            if(data.respcd === config.code.OK) {
              Store.set('alterstoredata', data.data);
              this.$router.push({name: 'alterstorage'});
            } else {
              this.$message.error(data.resperr);
            }
          })
            .catch(() => {
              this.loading = false;
              this.$message.error('获取储值详情失败');
            });
        }
      },

      hasPending() {
        axios.get(`${config.host}/merchant/prepaid/list`)
        .then((res) => {
          let data = res.data;
          this.pending = false;
          let _this = this;
          if(data.respcd === config.code.OK) {
            let storageData = data.data.data;
            for(let i = 0; i < storageData.length; i++) {
              if(storageData[i].activity_status.status === 1 || storageData[i].activity_status.status === 0) {
                _this.pending = true;
                break;
              }
            }
            if(_this.pending) {
              _this.$message.error('当前有活动正在进行，请终止后再创建');
            } else {
              _this.$router.push('/main/memberstorage/createstorage');
            }
          } else {
            this.$message.error(data.resperr);
          }
        })
        .catch(() => {
          this.$message.error('获取失败');
        });
      },

      getDetailData(id) {
        this.loading = true;
        axios.get(`${config.host}/merchant/prepaid/detail`, {
          params: {
            activity_id: id
          }
        }).then((res) => {
          this.loading = false;
          let data = res.data;
          if(data.respcd === config.code.OK) {
            this.detailData = data.data;

            if(!this.role.single) {
              this.shopList = this.getshopList();
            }

            this.isShowDetail = true;
          } else {
            this.$message.error(data.resperr);
          }
        }).catch((res) => {
          this.loading = false;
          this.$message.error('获取储值详情失败');
        });
      },

      createStorage() {
        if(this.role.isCashier) {
          this.$message.error('您暂无权限执行此操作');
        }else {
          if(!this.role.single) {
            this.$router.push('/main/memberstorage/createstorage');
          }else {
            this.hasPending();
          }
        }
      }
    }
  };
</script>

<style lang="scss">
  .scope-highlight {
    font-weight: 500;
    margin: 0px 5px;
  }
  .mt-0 {
    margin-top: 0px !important;
  }
  .mb-5 {
    margin-bottom: 5px;
  }

  .memberStorage {
    .panel-select-group {
      justify-content: space-between;
    }
    .btn-group {
      padding-right: 10px;

      .panel-header-btn {
        a {
          color: #FE9B20;
        }
        &:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }
</style>
