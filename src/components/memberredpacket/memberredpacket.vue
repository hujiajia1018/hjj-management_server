<template>
  <div class="redpacket">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item>会员红包</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="banner-btn" @click="creatPackage">
        <i class="icon-create"></i>
        <span class="banner-btn__desc">新建红包</span>
      </div>
    </div>
    <div :class="origin=='yirui'?'.yirui-panel':'panel'">
      <div class="panel-header">
        <div class="panel-select-group">
          <div class="panel-select__wrapper" v-show="!role.single">
            <span class="panel-select__desc">店铺名称</span>
            <el-select v-model="nameValue" placeholder="全部" size="small" @change="nameChange">
              <el-option v-for="shop in shopData.list" :label="shop.shop_name" :value="shop.uid" :key="shop.uid">
              </el-option>
            </el-select>
          </div>
          <div class="panel-select__wrapper">
            <span class="panel-select__desc">红包类型</span>
            <el-select v-model="packetValue" placeholder="全部" size="small" @change="packetChange">
              <el-option v-for="item in packetList" :label="item.label" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="panel-body">
        <el-table :data="redpacketData.list" style="width: 100%" row-class-name="el-table__row_fix" v-loading="loading" id="memberredpacket">
          <el-table-column prop="create_time" label="创建时间" min-width="145">
          </el-table-column>
          <el-table-column prop="title" label="活动名称" min-width="130">
          </el-table-column>
          <el-table-column prop="type_str" label="红包类型" min-width="100">
          </el-table-column>
          <el-table-column label="活动状态" prop="status_str">
          </el-table-column>
          <el-table-column label="活动时间" min-width="160">
            <template scope="scope">
              <p><span class="scope_cotent_title">开始时间</span>{{ scope.row.start_time | removeHMS }}</p>
              <p><span class="scope_cotent_title">结束时间</span>{{ scope.row.expire_time | removeHMS }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="giveout_num" label="领取数">
          </el-table-column>
          <el-table-column min-width="150" label="操作">
            <template scope="scope">
              <el-button type="text" size="small" class="el-button__fix" @click="showDetail(scope)">查看详情</el-button>
              <el-dropdown :hide-on-click="true" @command="cancelAct(scope)">
                <span class="el-dropdown-link el-dropdown-link__fix">
                  更多<i class="el-icon-caret-bottom el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown" class="el-dropdown-menu__fix">
                  <!-- <el-dropdown-item class="el-dropdown-item__fix">下载物料</el-dropdown-item> -->
                  <el-dropdown-item class="el-dropdown-item__fix" :disabled="scope.row.status === 3">终止活动</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="redpacketData.total >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="redpacketData.total"
          @current-change="currentChange"
          :current-page="currentpage">>
        </el-pagination>
      </div>
      <div class="table_placeholder" v-else></div>
    </div>
    <el-dialog v-model="isShowDetail" class="detail_dialog" title="红包详情">
      <template v-if="detailData.type === 'type_common'">
        <el-row>
          <el-col :span="5" class="title">红包类型</el-col>
          <el-col :span="19" class="desc">{{ detailData.type_str }}</el-col>
        </el-row>
        <el-row v-if="!role.single">
          <el-col :span="5" class="title">适用门店</el-col>
          <el-col :span="19" class="desc">
            <span v-for="(shop,index) in detailData.effect_sub_merchant">{{ shop.shopname }}{{ index < detailData.effect_sub_merchant.length - 1?"、":"" }}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">通知会员数</el-col>
          <el-col :span="19" class="desc">{{ member_total }}人</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">单个红包金额</el-col>
          <el-col :span="19" class="desc">{{ detailData.share_info.amt_max | formatCurrency }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">红包有效期</el-col>
          <el-col :span="19" class="desc">{{ detailData.share_info.coupon_rule.effect_len }}天</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">通知时间</el-col>
          <el-col :span="19" class="desc">
            <div class="desc-item">{{ detailData.notify_time }}</div>
            <div class="remark">备注：红包费用由商户承担</div>
          </el-col>
        </el-row>
      </template>
      <template v-if="detailData.type === 'type_sharing'">
        <el-row>
          <el-col :span="5" class="title">活动名称</el-col>
          <el-col :span="19" class="desc">{{ detailData.act_name }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">红包类型</el-col>
          <el-col :span="19" class="desc">{{ detailData.type_str }}</el-col>
        </el-row>
        <el-row v-if="!role.single">
          <el-col :span="5" class="title">适用门店</el-col>
          <el-col :span="19" class="desc">
            <span v-for="(shop,index) in detailData.effect_sub_merchant">{{ shop.shopname }}{{ index < detailData.effect_sub_merchant.length - 1?"、":"" }}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">活动开始时间</el-col>
          <el-col :span="19" class="desc">{{ detailData.start_time }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">活动结束时间</el-col>
          <el-col :span="19" class="desc">{{ detailData.expire_time }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">总预算</el-col>
          <el-col :span="19" class="desc">{{ detailData.total_amt | formatCurrency }}元</el-col>
        </el-row>
        <el-row>
          <template v-if="packetType === 0">
            <el-col :span="5" class="title">单个红包金额</el-col>
            <el-col :span="19" class="desc">{{ detailData.share_info.amt_max | formatCurrency }}元</el-col>
          </template>
          <template v-if="packetType === 1">
            <el-col :span="5" class="title">单个红包金额</el-col>
            <el-col :span="19" class="desc">{{ detailData.share_info.amt_min | formatCurrency }} - {{ detailData.share_info.amt_max | formatCurrency }}元</el-col>
          </template>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">红包规则</el-col>
          <el-col :span="19">
            <div class="desc">
              <div class="desc-item">会员微信扫描收款二维码<span class="highlight">{{ detailData.share_info.rule.amt | formatCurrency  }}</span>元可分享红包；</div>
              <div class="desc-item">每个分享链接可以有10人领取红包，每人只能领取一个；</div>
              <div class="desc-item">红包领取后<span class="highlight">{{ effectList[detailData.share_info.coupon_rule.effect_offset] }},</span><span class="highlight">{{ detailData.share_info.coupon_rule.effect_len }}</span>日内有效；</div>
              <div class="desc-item">会员有效期内微信扫描收款码<span class="highlight">{{ detailData.share_info.coupon_rule.use_rule.amt | formatCurrency }}</span>元以上可用；</div>
            </div>
            <div class="remark">备注：会员红包费用由商户承担</div>
          </el-col>
        </el-row>
      </template>
      <template v-if="detailData.type === 'type_payment'">
        <el-row>
          <el-col :span="5" class="title">活动名称</el-col>
          <el-col :span="19" class="desc">{{ detailData.act_name }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">红包类型</el-col>
          <el-col :span="19" class="desc">{{ detailData.type_str }}</el-col>
        </el-row>
        <el-row v-if="!role.single">
          <el-col :span="5" class="title">适用门店</el-col>
          <el-col :span="19" class="desc">
            <span v-for="(shop,index) in detailData.effect_sub_merchant">{{ shop.shopname }}{{ index < detailData.effect_sub_merchant.length - 1?"、":"" }}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">活动开始时间</el-col>
          <el-col :span="19" class="desc">{{ detailData.start_time }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">活动结束时间</el-col>
          <el-col :span="19" class="desc">{{ detailData.expire_time }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="title">总预算</el-col>
          <el-col :span="19" class="desc">{{ detailData.total_amt | formatCurrency }}元</el-col>
        </el-row>
        <el-row>
          <template v-if="packetType === 0">
            <el-col :span="5" class="title">单个红包金额</el-col>
            <el-col :span="19" class="desc">{{ detailData.obtain_info.amt_max | formatCurrency }}元</el-col>
          </template>
          <template v-if="packetType === 1">
            <el-col :span="5" class="title">单个红包金额</el-col>
            <el-col :span="19" class="desc">{{ detailData.obtain_info.amt_min | formatCurrency }} - {{ detailData.obtain_info.amt_max | formatCurrency }}元</el-col>
          </template>
        </el-row>

        <el-row>
          <el-col :span="5" class="title">红包规则</el-col>
          <el-col :span="19">
            <div class="desc">
              <div class="desc-item">会员微信扫描收款二维码<span class="highlight">{{ detailData.obtain_info.rule.amt | formatCurrency }}</span>元可返红包；</div>
              <!-- <div class="desc-item">同一会员每天最多领取一个红包；</div> -->
              <div class="desc-item">红包领取后<span class="highlight">{{ effectList[detailData.obtain_info.coupon_rule.effect_offset] }},</span><span class="highlight">{{ detailData.obtain_info.coupon_rule.effect_len }}</span>日内有效；</div>
              <div class="desc-item">会员有效期内微信扫描收款码<span class="highlight">{{ detailData.obtain_info.coupon_rule.use_rule.amt | formatCurrency }}</span>元以上可用；</div>
            </div>
            <div class="remark">备注：会员红包费用由商户承担</div>
          </el-col>
        </el-row>
      </template>
    </el-dialog>
  </div>
</template>
<script>
  import axios from 'axios';
  import config from 'config';
  import { formatDate, setformateDate } from '../../common/js/util';
  import Store from '../../common/js/store';

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        vm = Object.assign(vm, {
          flag: false,
          currentpage: 1,
          pageSize: 10,
          packetValue: '',
          nameValue: '',
          packetType: 0,
          role: Store.get('role') || {}
        });

        if(vm.role.isBaoshang) {
            vm.packetList = [{
            value: '',
            label: '全部'
          }, {
            value: 'type_sharing',
            label: '分享红包'
          }, {
            value: 'type_payment',
            label: '消费返红包'
          }];
        }
        vm.$store.dispatch('getRedpacketData');

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
        role: {},
        pageSize: 10,
        packetType: 0,
        effectList: ['当日生效', '次日生效'],
        isShowDetail: false,
        packetList: [{
          value: '',
          label: '全部'
        }, {
          value: 'type_common',
          label: '红包通知'
        }, {
          value: 'type_sharing',
          label: '分享红包'
        }, {
          value: 'type_payment',
          label: '消费返红包'
        }],
        packetValue: '',
        nameValue: '',
        loading: false,
        detailData: {},
        show: false,
        currentpage: 1
      };
    },
    computed: {
      member_total() {
        return this.$store.state.member_total;
      },
      basicParams() {
        return {
          type: this.packetValue,
          sub_uid: this.nameValue,
          length: this.pageSize,
          curpage: this.currentpage - 1
        };
      },
      redpacketData() {
        return this.$store.state.redpacketData;
      },
      shopData() {
        return this.$store.state.shopData;
      }
    },
    methods: {
      // 新建红包
      creatPackage() {
        if(this.role.isCashier) {
          this.$message.error('您暂无权限执行此操作');
        }else {
          this.$router.push('/main/memberredpacket/createpacket');
        }
      },

      // 红包类型
      packetChange() {
        this.currentChange();
      },

      // 店铺名称
      nameChange() {
        this.currentChange();
      },

      // 改变当前页
      currentChange(current) {
        if(!current && this.currentpage !== 1) {
          this.currentpage = 1;
          return;
        }
        if(current) {
          this.currentpage = current;
        }
        if(this.flag) {
          this.$store.dispatch('getRedpacketData', {
            params: this.basicParams
          });
        }
        console.log(this.basicParams);
      },

      // 改变size
      handleSizeChange(size) {
        this.pageSize = size;
        this.currentChange();
      },

      // 取消活动
      cancelAct(scope) {
        if(this.role.isCashier) {
          this.$message.error('您暂无权限执行此操作');
        }else {
          this.$confirm('是否要取消此活动?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '关闭'
          }).then(() => {
            axios.post(`${config.host}/merchant/activity/close`, {
              act_id: scope.row.id
            }).then((res) => {
              let data = res.data;
              if (data.respcd === config.code.OK) {
                this.$message({
                  type: 'success',
                  message: '红包活动取消成功'
                });
                this.$store.dispatch('getRedpacketData', {
                  params: this.basicParams
                });
              } else {
                this.$message.error(data.respmsg);
              }
            });
          }).catch(() => {
            console.log("取消");
          });
        }
      },

      showDetail(scope) {
        let actName = scope.row.title;
        let createTime = setformateDate(scope.row.create_time);
        let date = new Date(createTime);
        date.setDate(date.getDate() + 1);

        let notifyTime = formatDate(date) + ' 11:00:00';

        axios.get(`${config.host}/merchant/activity/info`, {
            params: {
              act_id: scope.row.id
            }
          })
          .then((res) => {
            let data = res.data;
            if (data.respcd === config.code.OK) {
              this.detailData = data.data;
              this.detailData.act_name = actName;
              this.detailData.notify_time = notifyTime;
              if(this.detailData.obtain_info.amt_max) {
                this.packetType = this.detailData.obtain_info.amt_max === this.detailData.obtain_info.amt_min ? 0 : 1;
              } else {
                this.packetType = this.detailData.share_info.amt_max === this.detailData.share_info.amt_min ? 0 : 1;
              }
              this.isShowDetail = true;
            } else {
              this.$message.error(data.respmsg);
            }
          })
          .catch(() => {
            this.$message.error('获取红包信息失败');
          });
      }
    }
  };
</script>
<style lang="scss">
// 采用BEM命名规则
.banner_wrapper {
  display: flex;
  height: 66px;
  padding: 0px 25px;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  background-color: #fff;

  @at-root .banner-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 140px;
    padding: 0 10px;
    height: 40px;
    background-color: #7ED321;
    border-radius: 3px;
    color: #fff;
    cursor: pointer;
    transition: .3s cubic-bezier(.645, .045, .355, 1);
    @at-root .banner-btn__desc {
      margin-left: 8px;
    }
    .icon-create {
      transition: .3s cubic-bezier(.645, .045, .355, 1);
      transform: rotateZ(0deg);
    }
    &:hover {
      box-shadow: -3px 3px 5px rgba(0, 0, 0, 0.12);
      .icon-create {
        transform: rotateZ(90deg);
      }
    }
  }
}

.panel {
  margin: 23px 25px 23px;
  background-color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.12);
}

.panel-header {
  height: 50px;
  padding-left: 15px;
  border-top: 2px solid #FE9B20;
  border-bottom: 1px solid #E7EAEC;
  background-color: #FEFDFB;
  font-size: 16px;
  @at-root .panel-select__wrapper {
    display: flex;
    align-items: center;
    margin-right: 40px;
    @at-root .panel-select__desc {
      margin-right: 15px;
    }
  }
}

.panel-body {
  padding: 10px 10px 0px;
}

.pagination_wrapper {
  display: flex;
  height: 60px;
  padding-right: 20px;
  justify-content: flex-end;
  align-items: center;
}
.detail_dialog {
  .el-row {
    line-height: 30px;
    .title {
      font-size: 16px;
    }
  }
  .highlight {
    color: #FE9B20;
    margin: 0px 5px;
  }
}
.scope_cotent_title {
  margin-right: 10px;
  font-weight: 500;
}
</style>
