<template>
  <div class="storagelist">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/main/memberstorage' }" replace>会员储值</el-breadcrumb-item>
        <el-breadcrumb-item>储值会员</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="panel">
      <div class="panel-body">
        <el-table
          :data="storeData.data"
          style="width: 100%"
          row-class-name="el-table__row_fix"
          v-loading="loading">
          <el-table-column label="头像">
            <template scope="scope">
              <img v-if="scope.row.avatar || scope.row.c_avatar" :src="scope.row.avatar || scope.row.c_avatar" alt="" width="44" height="44" />
              <img src="../../assets/img/default.png" height="44" width="44" v-else />
            </template>
          </el-table-column>
          <el-table-column label="姓名" prop="name">
          </el-table-column>
          <el-table-column min-width="100" label="手机号" prop="mobile">
          </el-table-column>
          <el-table-column min-width="100" label="生日" prop="birthday">
          </el-table-column>
          <el-table-column min-width="100" label="本店储值次数" prop="recharge_times">
          </el-table-column>
          <el-table-column label="余额">
            <template scope="scope">{{ scope.row.balance | formatCurrency }}元</template>
          </el-table-column>
          <el-table-column label="操作" min-width="100">
            <template scope="scope">
              <el-button type="text" size="small" class="el-button__fix" @click="goDetail(scope.row.c)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="storeData.count >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="storeData.count"
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
          pageSize: 10,
          currentpage: 1,
          flag: false
        });

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
        pageSize: 10,
        loading: false,
        currentPage: 1,
        storeData: {}
      };
    },

    computed: {
      basicParams() {
        return {
          curpage: this.currentPage,
          length: this.pageSize
        };
      }
    },

    methods: {
      // 获取数据
      getData() {
        if(!this.loading) {
          this.loading = true;
          axios.get(`${config.host}/merchant/prepaid/members`, {
            params: this.basicParams
          }).then((res) => {
            this.loading = false;
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.storeData = data.data;
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.loading = false;
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
      handleSizeChange(size = 10) {
        this.pageSize = size;
        this.currentChange();
      },

      // 详情页
      goDetail(id) {
        this.$router.push({path: 'storagedetail', query: {id: id}});
      }
    }
  };
</script>

<style lang="scss">

</style>
