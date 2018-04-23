<template>
  <div class="cashiermanage">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>收银员管理</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="btn-wrap">
        <div class="banner-btn" @click="addCashier">
          <i class="icon-create"></i>
          <span class="banner-btn__desc">添加收银员</span>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group">
          <div class="panel-select__wrapper">
            <span class="panel-select__desc">账户状态</span>
            <el-select v-model="stateValue" placeholder="全部" size="small" @change="stateChange">
              <el-option v-for="item in stateLists" :label="item.name" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="panel-select__wrapper">
            <span class="panel-select__desc">退款权限</span>
            <el-select v-model="rightsValue" placeholder="全部" size="small" @change="rightsChange">
              <el-option v-for="item in rightsLists" :label="item.name" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="panel-body">
        <el-table :data="cashierData.opusers" style="width: 100%" row-class-name="el-table__row_fix" v-loading="loading" id="memberredcollect">
          <el-table-column prop="opuid" label="收银员编号"></el-table-column>
          <el-table-column prop="opname" label="姓名"></el-table-column>
          <el-table-column prop="mobile" min-width="80px" label="电话"></el-table-column>
          <el-table-column label="账户状态" min-width="80px">
            <template scope="scope">
              <el-switch v-model="scope.row.status" on-text="" off-text="" on-color="#FF8100" off-color="#d8d8d8" on-value=1 off-value=0 @change="changeStatus(scope.row.opuid, scope.row.status)"></el-switch>
              <span class="explain">{{ scope.row.status == 1 ? '启用账户' : '禁用账户' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="refund" label="退款权限状态" min-width="80px">
            <template scope="scope">
              <el-switch v-model="scope.row.refund" on-text="" off-text="" on-color="#7ed321" off-color="#d8d8d8" on-value=1 off-value=0 @change="changeRights(scope.row.opuid, scope.row.refund)"></el-switch>
              <span class="explain">{{ scope.row.refund == 1 ? '开启退款' : '关闭退款' }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="120" label="操作">
            <template scope="scope">
              <el-button type="text" size="small" class="el-button__fix" @click="goDetail(scope.row.opuid)">查看详情</el-button>
              <a :href="downHref + scope.row.opuid" download class="el-button__fix el-button--text">下载收款码</a>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="cashierData.count >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="cashierData.count"
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
          flag: false,
          pageSize: 10,
          rightsValue: '',
          stateValue: '',
          currentPage: 1
        });

        vm.getData();

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
        cashierData: [],
        pageSize: 10,
        rightsValue: '',
        stateValue: '',
        loading: false,
        currentPage: 1,
        stateLists: [
          {
            name: '全部',
            value: ''
          },
          {
            name: '已启用',
            value: 1
          },
          {
            name: '已禁用',
            value: 0
          }
        ],
        rightsLists: [
          {
            name: '全部',
            value: ''
          },
          {
            name: '有权限',
            value: 1
          },
          {
            name: '无权限',
            value: 0
          }
        ]
      };
    },

    props: {
      shop: {
        type: Object
      }
    },

    computed: {
      basicParams() {
        return {
          refund: this.rightsValue,
          status: this.stateValue,
          pagesize: this.pageSize,
          page: this.currentPage - 1,
          format: 'cors'
        };
      },
      downHref() {
        return `${config.host}/merchant/qrcode?userid=${this.shop.uid}&opuid=`;
      }
    },

    methods: {
      // 改变活动状态
      stateChange() {
        this.handleSizeChange();
      },

      // 改变店铺名称
      rightsChange() {
        this.handleSizeChange();
      },

      // 请求数据
      getData() {
        this.loading = true;
        axios.get(`${config.host}/merchant/opuser/list`, {
          params: this.basicParams
        }).then((res) => {
          this.loading = false;
          let data = res.data;
          if (data.respcd === config.code.OK) {
            this.cashierData = this.formatData(data.data);
          } else {
            this.$message.error(data.respmsg);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('网络错误');
        });
      },

      // 格式化数据
      formatData(list) {
        let opusers = list.opusers || [];
        for(let i of opusers) {
          i.status = i.status + '';
          i.refund = i.refund + '';
        }
        return list;
      },

      // 改变size
      handleSizeChange(size = 10) {
        this.pageSize = size;
        this.currentChange();
      },

      // 改变当前页
      currentChange(current) {
        if (!current && this.currentPage !== 1) {
          this.currentPage = 1;
          return;
        }
        if (current) {
          this.currentPage = current;
        }
        if (this.flag) {
          this.getData();
        }
      },

      // 增加收银员
      addCashier() {
        this.$router.push('/main/cashiermanage/addcashier');
      },

      // 详情页
      goDetail(id) {
        this.$router.push({
          path: '/main/cashiermanage/cashierdetail',
          query: {
            'id': id
          }});
      },

      // 修改状态
      changeStatus(id, st) {
        let message;
        if(st === '1') {
          message = '账户已启用';
        }else {
          message = '账户已禁用';
        }
        if(!this.loading) {
          this.loading = true;
          axios.post(`${config.ohost}/mchnt/opuser/change`, {
            opuid: id,
            status: st,
            format: 'cors'
          }).then((res) => {
            this.loading = false;
            let data = res.data;
            if (data.respcd === config.code.OK) {
              this.$message({
                type: 'success',
                message: message
              });
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.loading = false;
            this.$message.error('网络错误');
          })
        }
      },

      // 修改权限
      changeRights(id, rg) {
        let message;
        if(rg === '1') {
          message = '权限已开启';
        } else {
          message = '权限已关闭';

        }
        if(!this.loading) {
          this.loading = true;
          axios.post(`${config.ohost}/mchnt/opuser/perm/change`, {
            opuid: id,
            type: 'refund',
            status: rg,
            format: 'cors'
          }).then((res) => {
            this.loading = false;
            let data = res.data;
            if (data.respcd === config.code.OK) {
              this.$message({
                type: 'success',
                message: message
              });
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.loading = false;
            this.$message.error('网络错误');
          })
        }
      }
    }
  };
</script>
<style lang="scss">
  .cashiermanage {
    .explain {
      color: #777A7D;
      font-size: 12px;
    }
  }
</style>
