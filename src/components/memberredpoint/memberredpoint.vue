<template>
  <div class="memberpoint">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item>会员集点</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="btn-wrap">
        <el-button type="primary" class="panel-edit-btn__subshopnum" @click.native="jumpToPointsExchange" style="width:158px;">礼品兑换</el-button>
        <div class="banner-btn" @click="creatPoint">
          <i class="icon-create"></i>
          <span class="banner-btn__desc">新建集点</span>
        </div>
      </div>
    </div>
    <div :class="origin=='yirui'?'.yirui-panel':'panel'">
      <div class="panel-header">
        <div class="panel-select-group">
          <div class="panel-select__wrapper">
            <span class="panel-select__desc">活动状态</span>
            <el-select v-model="stateValue" placeholder="全部" size="small" @change="stateChange">
              <el-option v-for="item in stateLists" :label="item.name" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
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
        <el-table :data="collectData.result" style="width: 100%" row-class-name="el-table__row_fix" v-loading="loading" id="memberredcollect">
          <el-table-column label="活动时间" min-width="140">
            <template scope="scope">
              <p><span class="scope_cotent_title">开始时间</span>{{ scope.row.start_time | removeHMS }}</p>
              <p><span class="scope_cotent_title">结束时间</span>{{ scope.row.expire_time | removeHMS }}</p>
            </template>
          </el-table-column>
          <el-table-column label="集点条件" min-width="150">
            <template scope="scope">
              <span>支付满{{ scope.row.obtain_amt | formatNumber }}元可集一点</span>
            </template>
          </el-table-column>
          <el-table-column label="礼品详情" min-width="100">
            <template scope="scope">
              <span>满{{ scope.row.exchange_pt }}点可兑换{{ scope.row.goods_name }}一份</span>
            </template>
          </el-table-column>
          <el-table-column prop="status_chn" label="状态">
          </el-table-column>
          <el-table-column prop="in_person_no" label="参与人数">
            <template scope="scope">
              <span>{{ scope.row.in_person_no || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="exchange_num" label="已兑换">
          </el-table-column>
          <el-table-column prop="total_amt" label="刺激收益">
            <template scope="scope">
              <span>{{ scope.row.total_amt | formatNumber }}元</span>
            </template>
          </el-table-column>
          <el-table-column prop="who_create" label="活动来源" min-width="140">
          </el-table-column>
          <el-table-column min-width="150" label="操作">
            <template scope="scope">
              <el-button type="text" size="small" class="el-button__fix" @click="showDetail(scope.row)">查看详情</el-button>
              <el-dropdown>
                <span class="el-dropdown-link el-dropdown-link__fix">
                  更多<i class="el-icon-caret-bottom el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown" class="el-dropdown-menu__fix collect">
                  <el-dropdown-item class="el-dropdown-item__fix" :disabled="scope.row.can_operate == 1 || scope.row.state == 2 || scope.row.state == 3" @click.native="editActivity(scope.row)">修改活动</el-dropdown-item>
                  <el-dropdown-item class="el-dropdown-item__fix" :disabled="scope.row.can_operate == 1 || scope.row.state == 2 || scope.row.state == 3" @click.native="stopActivity(scope.row.id)">停止活动</el-dropdown-item>
                  <a :href=scope.row.promotion_url download>
                    <el-dropdown-item command=3 class="el-dropdown-item__fix">下载宣传物料</el-dropdown-item>
                  </a>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="+collectData.count >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="+collectData.count"
          @current-change="currentChange"
          :current-page="currentPage">
        </el-pagination>
      </div>
      <div class="table_placeholder" v-else></div>
    </div>
    <el-dialog :visible.sync="isShowDetail" class="detail_dialog" title="集点详情">
      <el-row>
        <el-col :span="4" class="title">目标点数</el-col>
        <el-col :span="20" class="desc"><span class="orange">{{ detailData.exchange_pt }}点</span></el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="title">集点条件</el-col>
        <el-col :span="20" class="desc">
          支付满<span class="orange">{{ detailData.obtain_amt | formatNumber }}元</span>可集一点
          <span v-if="detailData.obtain_limit == 0" style="font-size: 14px;" class="orange">/一次付款可集多点</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="title">礼品名称</el-col>
        <el-col :span="20" class="desc">{{ detailData.goods_name }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="title">礼品价格</el-col>
        <el-col :span="20" class="desc">{{ detailData.goods_amt | formatNumber }}元</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="title">活动时间</el-col>
        <el-col :span="20" class="desc">{{ detailData.start_time }} - {{ detailData.expire_time }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="title">适用门店</el-col>
        <el-col :span="20" class="desc">
          <div class="desc-item">
            <span v-for="(shop,index) in detailData.apply_shops">{{ shop.shop_name }}{{ index < detailData.apply_shops.length - 1?"、":"" }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20" :offset="4" class="desc">
          <div class="remark">备注：会员在集点满额兑换礼品后，将自动重新集点</div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
  import axios from 'axios';
  import config from 'config';
  import Store from '../../common/js/store';

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        Object.assign(vm, {
          flag: false,
          currentPage: 1,
          pageSize: 10,
          nameValue: '',
          stateValue: ''
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
        origin: localStorage.getItem('origin'),
        role: Store.get('role') || {},
        collectData: {},
        isShowDetail: false,
        pageSize: 10,
        nameValue: '',
        stateValue: '',
        loading: false,
        currentPage: 1,
        detailData: {},
        stateLists: [
          {
            name: '全部',
            value: ''
          },
          {
            name: '未开始',
            value: 0
          },
          {
            name: '进行中',
            value: 1
          },
          {
            name: '已结束',
            value: 2
          },
          {
            name: '已终止',
            value: 3
          }
        ]
      };
    },
    computed: {
      basicParams() {
        return {
          sub_uid: this.nameValue,
          stateOptions: this.stateValue,
          length: this.pageSize,
          curpage: this.currentPage,
          format: 'cors'
        };
      },

      shopData() {
        return this.$store.state.shopData;
      }
    },

    methods: {
      jumpToPointsExchange() {
        this.$router.push("/main/memberredpoint/exchangedcredits");
      },
      // 改变活动状态
      stateChange() {
        this.handleSizeChange();
      },

      // 改变店铺名称
      nameChange() {
        this.handleSizeChange();
      },

      // 请求数据
      getData() {
        this.loading = true;
        axios.get(`${config.host}/merchant/card/points`, {
          params: this.basicParams
        }).then((res) => {
          this.loading = false;
          let data = res.data;
          if (data.respcd === config.code.OK) {
            this.collectData = data.data;
          } else {
            this.$message.error(data.respmsg);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('获取集点数据失败!');
        });
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

      // 停止活动
      stopActivity(id) {
        if(this.role.isCashier) {
          this.$message.error('您暂无权限执行此操作');
        }else {
          this.$confirm('活动停止后，顾客消费将不再获得集点，是否确认停止?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '关闭'
          }).then(() => {
            axios.post(`${config.ohost}/mchnt/card/v1/actv_close`, {
              id: id,
              format: 'cors'
            }).then((res) => {
              let data = res.data;
              if (data.respcd === config.code.OK) {
                this.$message({
                  type: 'success',
                  message: '集点活动停止成功'
                });

                this.getData();
              } else {
                this.$message.error(data.respmsg);
              }
            }).catch(() => {
              this.$message.error("停止活动失败");
            });
          }).catch(() => {
            console.log("取消");
          });
        }
      },

      // 编辑活动
      editActivity(data) {
        if(this.role.isCashier) {
          this.$message.error('您暂无权限执行此操作');
        }else {
          Store.set('pointData', Object.assign(data, {
            obtain_amt: (data.obtain_amt) / 100,
            goods_amt: (data.goods_amt) / 100
          }));
          this.$router.push("/main/memberredpoint/editpoint");
        }
      },

      // 新建集点，判断是否可以创建
      creatPoint() {
        if(this.role.isCashier) {
          this.$message.error('您暂无权限执行此操作');
        }else {
          if(this.role.single) {
            if(this.getCurrentShop()) {
              this.$message.error('当前有活动正在进行，请终止后再创建');
            }else {
              this.$router.push("/main/memberredpoint/createpoint");
            }
          }else {
            this.$router.push("/main/memberredpoint/createpoint");
          }
        }
      },

      // 格式化店铺列表
      formatData(list) {
        for(let i of list) {
            if(i.state == 0) {
                return true;
            }
         }
         return false;
      },

      // 获取店铺列表信息
      getCurrentShop() {
        axios.get(`${config.host}/merchant/card/active_state`).then((res) => {
          let data = res.data;
          if (data.respcd === config.code.OK) {
            this.formatData(data.data);
          } else {
            this.$message.error(data.respmsg);
            return false;
          }
        }).catch(() => {
          this.$message.error('获取店铺数据失败!');
          return false;
        });
      },

      // 展示详情
      showDetail(data) {
        this.detailData = data;
        this.isShowDetail = true;
      }
    }
  };
</script>
<style lang="scss">
.collect {
  a {
    color: #FE9B20;
  }
}
.orange {
  color: #FE9B20;
}
  .memberpoint {
    .btn-wrap {
      display: flex;
      .panel-edit-btn__subshopnum {
        margin-right: 15px;
      }
    }
  }
</style>
