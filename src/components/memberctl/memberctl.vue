<template>
  <div class="redpacket">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item>会员管理</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- <div class="panel-btn-group__wrapper panel-header-download-btn-group">
          <div class="panel-btn__download panel-btn__download_detail">
            <i class="icon-create"></i>
            <span>批量导入会员</span>
          </div>
          <div class="panel-btn__download panel-btn__download_record">
            <i class="icon-download"></i>
            <span>下载导入模板</span>
          </div>
      </div> -->
    </div>
    <div :class="origin=='yirui'?'.yirui-panel':'panel'">
      <div class="panel-header" v-show="!role.single">
        <div class="panel-select-group">
          <div class="panel-select__wrapper">
            <span class="panel-select__desc">店铺名称</span>
            <el-select v-model="nameValue" placeholder="全部" size="small" @change="nameChange">
              <el-option v-for="shop in shopData.list" :label="shop.shop_name" :value="shop.uid" :key="shop.uid">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="panel-body">
        <el-table
          :data="memberData.list"
          style="width: 100%"
          row-class-name="el-table__row_fix"
          @sort-change="changeSort"
          v-loading="loading"
          >
          <el-table-column
            label="头像">
            <template scope="scope">
              <img v-if="scope.row.avatar" :src="scope.row.avatar" alt="" width="44" height="44" />
              <img src="../../assets/img/default.png" height="44" width="44" v-else />
            </template>
          </el-table-column>
          <el-table-column
            min-width="90"
            label="微信昵称">
            <template scope="scope">{{ scope.row.nickname || '-' }}</template>
          </el-table-column>
          <el-table-column
            min-width="90"
            label="真实姓名">
            <template scope="scope">{{ scope.row.realname || '-' }}</template>
          </el-table-column>
          <el-table-column
            label="性别">
            <template scope="scope">{{ scope.row.sex || '-' }}</template>
          </el-table-column>
          <el-table-column
            min-width="120"
            label="手机号">
            <template scope="scope">{{ scope.row.mobile || '-' }}</template>
          </el-table-column>
          <el-table-column
            label="生日"
            min-width="110">
            <template scope="scope">{{ scope.row.birthday || '-' }}</template>
          </el-table-column>
          <el-table-column
            prop="last_txdtm"
            sortable
            class="pointer"
            label="最近到店时间"
            min-width="170">
            <template scope="scope">{{ scope.row.last_txdtm }}</template>
          </el-table-column>
          <el-table-column
            prop="total_times"
            sortable
            class="pointer"
            min-width="110"
            label="到店次数">
          </el-table-column>
          <!-- pointer变大 ？-->
          <el-table-column
            prop="total_amt"
            sortable
            class="pointer"
            label="累计消费金额"
            min-width="140">
            <template scope="scope">{{ scope.row.total_amt | formatCurrency }}元</template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="memberData.count >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="memberData.count"
          @current-change="currentChange">
        </el-pagination>
      </div>
      <div class="table_placeholder" v-else></div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import config from 'config';
  import Store from '../../common/js/store';

  export default {
    data() {
      return {
        origin: localStorage.getItem('origin'),
        role: Store.get('role') || {},
        pageSize: 10,
        currentPage: 0,
        nameValue: '',
        memberData: {},
        loading: false,
        uid: '',
        sortObj: {
          ascending: 'asc',
          descending: 'desc',
          last_txdtm: 'lasttime',
          total_times: 'totaltimes',
          total_amt: 'totalamt'
        }
      };
    },
    computed: {
      shopData() {
        return this.$store.state.shopData;
      },
      basicParams() {
        return {
          sorted_key: 'lasttime',
          sort_way: 'desc',
          sub_uid: this.uid,    // ? 是数组还是字符串
          curpage: 0,
          length: this.pageSize
        };
      }
    },
    created() {
      this.loading = true;
      axios.get(`${config.host}/merchant/member/list`, {
        params: this.basicParams
      })
      .then((res) => {
        this.loading = false;
        let data = res.data;
        if(data.respcd === config.code.OK) {
          this.memberData = data.data;
        } else {
          this.$message.error(data.respmsg);
        }
      })
      .catch(() => {
        this.loading = false;
        this.$message.error('首次获取会员列表失败!');
      });
    },
    methods: {
      changeSort(sort) {
        this.basicParams.sort_way = this.sortObj[sort.order];
        this.basicParams.sorted_key = this.sortObj[sort.prop];
        this.getMemberData({
          curpage: this.currentPage
        });
      },
      getMemberData(params) {
        // 因BUG取消loading
        // 待查看
        axios.get(`${config.host}/merchant/member/list`, {
          params: Object.assign({}, this.basicParams, params)
        })
        .then((res) => {
          this.loading = false;
          let data = res.data;
          if(data.respcd === config.code.OK) {
            this.memberData = data.data;
          } else {
            this.$message.error(data.respmsg);
          }
        })
        .catch(() => {
          this.loading = false;
          this.$message.error('获取会员列表失败!');
        });
      },
      nameChange(uid) {
        this.loading = true;
        if(this.$refs['page']) {
          this.$refs['page'].internalCurrentPage = 1;
        }
        this.uid = uid;
        console.log(this.uid);
        this.getMemberData();
      },
      currentChange(current) {
        this.loading = true;
        this.currentPage = current - 1;
        this.getMemberData({
          curpage: current - 1
        });
      },
      handleSizeChange(size) {
        if(this.$refs['page']) {
          this.$refs['page'].internalCurrentPage = 1;
        }
        this.loading = true;
        this.pageSize = size;
        this.basicParams.curpage = 0;
        this.getMemberData();
      }
    }
  };
</script>

<style lang="scss">
  .yirui-panel {
    margin: 0;
  }

  // 采用BEM命名规则
  .panel-header-download-btn-group {
    margin-top: 0;
  }

  .panel-btn__download {
    .icon-create {
      margin-right: 5px;
    }
  }

  .el-table .descending .sort-caret.descending {
    border-top-color: #FE9B20;
  }

  .el-table .ascending .sort-caret.ascending {
    border-bottom-color: #FE9B20;
  }

</style>
