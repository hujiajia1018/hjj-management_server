<template>
  <div class="storagedetail" v-loading="loading1 || loading2">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/main/memberstorage' }" replace>会员储值</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/main/memberstorage/storagelist' }" replace>储值会员</el-breadcrumb-item>
        <el-breadcrumb-item>储值会员详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group">
          <span class="panel-header__desc">储值会员资料</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="info_wrapper">
          <div class="info-header">
            <div class="info-left">
              <div class="info-img">
                <img v-if="storeData.avatar" :src="storeData.avatar" alt="头像">
                <img src="../../assets/img/default.png" alt="头像" v-else>
              </div>
              <div class="information">
                <p class="info-title">{{ storeData.name }}</p>
                <p>
                  <img src="./img/tel.png" alt="图标">
                  <span>{{ storeData.mobile }}</span>
                </p>
                <p>
                  <img src="./img/birthday.png" alt="图标">
                  <span>{{ storeData.birthday }}</span>
                </p>
              </div>
            </div>
            <div class="info-right">
              <div>
                <p class="right-title">余额</p>
                <p class="right-count">￥{{ storeData.balance | formatCurrency }}</p>
              </div>
              <div>
                <p class="right-title">累计储值</p>
                <p class="right-count">￥{{ (storeData.pay_amt || storeData.recharge_amt) | formatCurrency }}</p>
              </div>
              <div>
                <p class="right-title">储值次数</p>
                <p class="right-count">{{ storeData.recharge_times }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group">
          <span class="panel-header__desc">储值交易记录</span>
        </div>
      </div>
      <div class="panel-body">
        <el-table
          :data="listData.data"
          style="width: 100%"
          row-class-name="el-table__row_fix"
          :row-style="rowStyle">
          <el-table-column label="交易类型">
            <template scope="scope">{{ scope.row.biz_type | formatType }}</template>
          </el-table-column>
          <el-table-column min-width="100" label="时间" prop="sysdtm">
          </el-table-column>
          <el-table-column min-width="100" label="交易金额">
            <template scope="scope">
              <span v-if="scope.row.biz_type === 2 || scope.row.biz_type === 3" class="table-title1">-{{ scope.row.txamt | formatCurrency }}元</span>
              <span v-else class="table-title2">+{{ (scope.row.txamt - scope.row.present_amt) | formatCurrency }}元</span>
              <span v-show="scope.row.status === 4">(已撤销)</span>
              <span v-show="scope.row.present_amt" class="table-content">(赠送￥{{ scope.row.present_amt | formatCurrency }}元)</span>
            </template>
          </el-table-column>
          <el-table-column min-width="200" label="交易门店" prop="shopname">
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="listData.count >= 7">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          :page-sizes="[7,14,21,28,35]"
          @size-change="handleSizeChange"
          :total="listData.count"
          @current-change="currentChange"
          :current-page="currentPage">
        </el-pagination>
      </div>
      <div class="table_placeholder" v-else></div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import config from 'config';

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        Object.assign(vm, {
          pageSize: 7,
          currentpage: 1,
          flag: false
        });

        vm.getInfoData();
        vm.getData();

        setTimeout(() => {
          Object.assign(vm, {
            flag: true
          });
        }, 200);
      });
    },

    data() {
      return {
        pageSize: 7,
        loading1: false,
        loading2: false,
        currentPage: 1,
        listData: {},
        storeData: {}
      };
    },

    computed: {
      basicParams() {
        return {
          curpage: this.currentPage,
          length: this.pageSize,
          cid: this.$route.query.id
        };
      }
    },

    methods: {
      // 获取数据
      getData() {
        if(!this.loading) {
          this.loading = true;
          axios.get(`${config.host}/merchant/prepaid/transactions`, {
            params: this.basicParams
          }).then((res) => {
            this.loading = false;
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.listData = data.data;
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.loading = false;
            this.$message.error('获取数据失败');
          });
        }
      },

      // 获取数据
      getInfoData() {
        if(!this.loading2) {
          this.loading2 = true;
          axios.get(`${config.host}/merchant/prepaid/member`, {
            params: {
              cid: this.$route.query.id
            }
          }).then((res) => {
            this.loading2 = false;
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.storeData = data.data;
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.loading2 = false;
            this.$message.error('获取数据失败');
          });
        }
      },

      // 页数
      currentChange(current) {
        if (!current && this.currentPage !== 1) {
          this.currentPage = 1;
          return;
        }
        if (current) {
          this.currentPage = current;
        }

        this.getData();
      },

      // 每页条数
      handleSizeChange(size = 7) {
        this.pageSize = size;
        this.currentChange();
      },

      // 当交易为撤销的时候样式
      rowStyle(row) {
        if (row.status === 4) {
          return {opacity: 0.4}
        }
        return {}
      }
    }
  };
</script>

<style lang="scss">
  .storagedetail {
    .info-header {
      display: flex;

      .info-left {
        flex: 1;
        display: flex;

        .info-img {
          img {
            border-radius: 50%;
            width: 70px;
            height: 70px;
          }
        }

        .information {
          flex: auto;
          margin-left: 20px;
          p {
            height: 25px;
            line-height: 25px;
            font-size: 15px;
            color: #777A7D;
          }
          .info-title {
            font-size: 20px;
            color: #282b2d;
          }
          img {
            vertical-align: middle;
            width: 12px;
          }
          span {
            vertical-align: middle;
          }

        }
      }
      .info-right {
        flex: 2;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        div {
          flex: 1;
          text-align: center;
          max-width: 150px;

          &:not(:first-child) {
            border-left: 1px solid #E8E7E6;
          }
          p {
            height: 30px;
            line-height: 30px;
          }
          .right-title {
            font-size: 15px;
            color: #282b2d;
          }
          .right-count {
            font-size: 20px;
            color: #fe9b20;
          }
        }
      }
    }

    .table-title1 {
      font-size: 16px;
    }
    .table-title2 {
      color: #FE9B20;
      font-size: 16px;
    }
    .head-content {
      color: #777a7d;
    }
  }

</style>
