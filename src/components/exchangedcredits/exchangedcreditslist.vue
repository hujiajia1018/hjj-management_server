<template>
  <div class="exchangedList">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/main/memberredpoint' }" replace>会员集点</el-breadcrumb-item>
        <el-breadcrumb-item>礼品兑换</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group">
          <div class="panel-select__wrapper" v-if="role.single">
            <span class="panel-select__desc" style="width:100px;">输入兑换码</span>
            <el-input placeholder="输入4位兑换码" style="width:234px;margin-right:15px;" v-model="code"></el-input>
            <el-button type="primary" class="panel-edit-btn__subshopnum" style="width:158px;" @click="exchangeHandler">兑换</el-button>
          </div>
          <div class="panel-select__wrapper" v-if="!role.single">
            <span class="panel-select__desc">店铺名称</span>
            <el-select v-model="nameValue" placeholder="全部" size="small" @change="nameChange">
              <el-option v-for="shop in shopData.list" :label="shop.shop_name" :value="shop.uid" :key="shop.uid">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="panel-body">
        <el-table :data="exchangedData.records" style="width: 100%" row-class-name="el-table__row_fix" v-loading="loading" id="ex_points">
          <el-table-column label="头像" min-width="104">
            <template scope="scope">
              <img :src="scope.row.avatar" class="points-avatar">
            </template>
          </el-table-column>
          <el-table-column label="微信昵称" min-width="114">
            <template scope="scope">
              <span>{{ scope.row.nickname}}</span>
            </template>
          </el-table-column>
          <el-table-column label="兑换时间" min-width="206">
            <template scope="scope">
              <span>{{ scope.row.exchange_time }}</span>
            </template>
          </el-table-column>
          <el-table-column label="兑换码" min-width="124">
            <template scope="scope">
              <span>{{ scope.row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column label="礼品详情" min-width="196">
            <template scope="scope">
              <span>{{ scope.row.goods_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="兑换店铺" v-if="!role.single" min-width="162">
            <template scope="scope">
              <span>{{ scope.row.apply_shops.join(',') }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="exchangedData.count >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="+exchangedData.count"
          @current-change="currentChange"
          :current-page="currentpage">
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
  import axios from 'axios';
  import config from 'config';
import Store from '../../common/js/store';
import ElInput from "../../../node_modules/qfpay-element-ui/packages/input/src/input";
import ElButton from "../../../node_modules/qfpay-element-ui/packages/button/src/button";
  export default {
    components: {
      ElButton,
      ElInput},
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        Object.assign(vm, {
          flag: false,
          nameValue: '',
          code: '',
          activityId: '',
          loading: false,
          currentpage: 1,
          pageSize: 10
        });

        vm.getExchangedCreditsList();

        if(Store.get('role').single) {
          vm.getActivityId();
        }

        // 延时改变
        setTimeout(() => {
          Object.assign(vm, {
            flag: true
          });
        }, 200);
      });
    },
    data() {
        return {
          role: Store.get('role') || {},
          nameValue: '',
          flag: false,
          code: '',
          activityId: '',
          loading: false,
          currentpage: 1,
          pageSize: 10,
          exchangedData: {}
        }
    },
    computed: {
      basicParams() {
        return {
          sub_uid: this.nameValue,
          pagesize: this.pageSize,
          page: this.currentpage
        };
      },
      shopData() {
        return this.$store.state.shopData;
      }
    },
    methods: {
      getActivityId() {
        let _this = this;
        axios.get(`${config.host}/merchant/card/activity_id_code?format=cors`, {
        }).then((res) => {
          let data = res.data;
          if (data.respcd === config.code.OK) {
            _this.activityId = data.data.activity_id;
          } else {
            this.$message.error(data.respmsg);
          }
        }).catch(() => {
            console.log('获取activityId失败');
        });
      },

      exchangeHandler() {
        if(!this.code) {
          this.$message.error('请输入兑换码');
        }else {
          axios.post(`${config.ohost}/mchnt/card/v1/exchange_goods`, {
            id: this.activityId,
            code: this.code,
            format: 'cors'
          }).then((res) => {
            let data = res.data;
            if (data.respcd === config.code.OK) {
              this.code = '';
              this.$message({
                type: 'success',
                message: '兑换成功!'
              });

              this.getExchangedCreditsList();
            } else {
              this.$message.error(data.respmsg);
            }
          }).catch(() => {
            this.$message.error('获取集点兑换记录失败!');
          });
        }
      },

      getExchangedCreditsList() {
        this.loading = true;
        axios.get(`${config.host}/merchant/card/records_list`, {
          params: this.basicParams
        }).then((res) => {
          this.loading = false;
          let data = res.data;
          if (data.respcd === config.code.OK) {
            this.exchangedData = data.data;
          } else {
            this.$message.error(data.respmsg);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('获取集点兑换记录失败!');
        });
      },
      // 改变size
      handleSizeChange(size) {
        this.pageSize = size;
        this.currentChange();
      },

      // 改变当前页
      currentChange(current) {
        if (!current && this.currentpage !== 1) {
          this.currentpage = 1;
          return;
        }
        if (current) {
          this.currentpage = current;
        }
        if (this.flag) {
          this.getExchangedCreditsList();
        }
      },
      nameChange() {
        this.currentChange();
      }
    }
  }
</script>
<style lang="scss">
  .exchangedList {
    .points-avatar {
      width:44px;
      height:44px;
      vertical-align: middle;
    }
  }
</style>
