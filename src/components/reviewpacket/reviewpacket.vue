<template>
  <div>
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/main/memberredpacket' }" replace>会员红包</el-breadcrumb-item>
        <el-breadcrumb-item>创建红包</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <span class="panel-header__desc">预览红包信息</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="review-info__wrapper" v-if="data.act_type === 'type_common'">
          <p class="review-info">
            <span class="info-title">红包类型</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.act_type_label }}</span></span>
          </p>
          <p class="review-info" v-if="!role.single">
            <span class="info-title">适用门店</span>
            <span class="info-desc"><span class="highlight ml-0">{{ shopNameList }}</span></span>
          </p>
          <p class="review-info">
            <span class="info-title">通知会员数</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.member_total || 0 }}</span>人</span>
          </p>
          <p class="review-info">
            <span class="info-title">单个红包金额</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.amt_max }}</span>元</span>
          </p>
          <p class="review-info">
            <span class="info-title">使用条件</span>
            <span class="info-desc">微信支付<span class="highlight">{{ data.limit_amt }}</span>元以上可用</span>
          </p>
          <p class="review-info">
            <span class="info-title">红包有效期</span>
            <span class="info-desc"><span class="highlight ml-0">14</span>天内使用</span>
          </p>
          <div class="review-info flex">
            <span class="info-title">通知时间</span>
            <div class="info-desc__wrapper">
              <div class="info-desc">
                <span class="highlight ml-0">{{ data.notify_time }} 11:00:00</span>
              </div>
              <div class="info-desc remark mt-20">备注：红包费用由商户承担</div>
              </div>
            </div>
          </div>
        </div>
        <div class="review-info__wrapper" v-if="data.act_type === 'type_payment'">
          <p class="review-info">
            <span class="info-title">活动名称</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.act_name }}</span></span>
          </p>
          <p class="review-info">
            <span class="info-title">红包类型</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.act_type_label }}</span></span>
          </p>
          <p class="review-info" v-if="!role.single">
            <span class="info-title">适用门店</span>
            <span class="info-desc"><span class="highlight ml-0">{{ shopNameList }}</span></span>
          </p>
          <p class="review-info">
            <span class="info-title">活动开始时间</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.start_time }}</span></span>
          </p>
          <p class="review-info">
            <span class="info-title">活动结束时间</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.expire_time }}</span></span>
          </p>
          <p class="review-info">
            <span class="info-title">总预算</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.total_amt }}</span>元</span>
          </p>
          <template v-if="data.packetValue === 0">
            <p class="review-info">
              <span class="info-title">单个红包金额</span>
              <span class="info-desc"><span class="highlight ml-0">{{ data.singleValue }}</span>元</span>
            </p>
            <p class="review-info">
              <span class="info-title">红包个数</span>
              <span class="info-desc"><span class="highlight ml-0">{{ data.coupon_num }}</span>个</span>
            </p>
          </template>
          <template v-if="data.packetValue === 1">
            <p class="review-info">
              <span class="info-title">单个红包金额</span>
              <span class="info-desc"><span class="highlight ml-0">{{ data.amt_min }}</span>至<span class="highlight">{{ data.amt_max }}</span>元</span>
            </p>
          </template>
          <div class="review-info flex">
            <span class="info-title">红包规则</span>
            <div class="info-desc__wrapper">
              <div class="info-desc">会员微信扫描收款码支付满<span class="highlight">{{ data.obtain_amt }}元</span>可获得红包；</div>
            <!--   <div class="info-desc">同一会员每天最多领取一个红包；</div> -->
              <div class="info-desc">红包领取后<span class="highlight">{{ effectList[data.effect_offset] }}，{{ data.effect_date }}天</span>内有效</div>
              <div class="info-desc">会员有效期内微信扫收款码<span class="highlight">{{ data.limit_amt }}元</span>以上可用</div>
              <div class="info-desc">
                <div class="remark ml-0 mt-20">备注：红包费用由商户承担</div>
              </div>
            </div>
          </div>
        </div>
        <div class="review-info__wrapper" v-if="data.act_type === 'type_sharing'">
          <p class="review-info">
            <span class="info-title">活动名称</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.act_name }}</span></span>
          </p>
          <p class="review-info">
            <span class="info-title">红包类型</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.act_type_label }}</span></span>
          </p>
          <p class="review-info" v-if="!role.single">
            <span class="info-title">适用门店</span>
            <span class="info-desc"><span class="highlight ml-0">{{ shopNameList }}</span></span>
          </p>
          <p class="review-info">
            <span class="info-title">活动开始时间</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.start_time }}</span></span>
          </p>
          <p class="review-info">
            <span class="info-title">活动结束时间</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.expire_time }}</span></span>
          </p>
          <p class="review-info">
            <span class="info-title">总预算</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.total_amt }}</span>元</span>
          </p>
          <template v-if="data.packetValue === 0">
            <p class="review-info">
              <span class="info-title">单个红包金额</span>
              <span class="info-desc"><span class="highlight ml-0">{{ data.singleValue }}</span>元</span>
            </p>
            <p class="review-info">
              <span class="info-title">红包个数</span>
              <span class="info-desc"><span class="highlight ml-0">{{ data.coupon_num }}</span>个</span>
            </p>
          </template>
          <template v-if="data.packetValue === 1">
            <p class="review-info">
              <span class="info-title">单个红包金额</span>
              <span class="info-desc"><span class="highlight ml-0">{{ data.amt_min }}</span>至<span class="highlight">{{ data.amt_max }}</span>元</span>
            </p>
          </template>
          <div class="review-info flex">
            <span class="info-title">红包规则</span>
            <div class="info-desc__wrapper">
              <div class="info-desc">会员微信扫描收款码支付满<span class="highlight">{{ data.obtain_amt }}元</span>可获得红包；</div>
              <div class="info-desc">每个分享链接可以有10人领取红包，每人只能领取一个；</div>
              <div class="info-desc">红包领取后<span class="highlight">{{ effectList[data.effect_offset] }}，{{ data.effect_date }}天</span>内有效</div>
              <div class="info-desc">会员有效期内微信扫收款码<span class="highlight">{{ data.limit_amt }}元</span>以上可用</div>
              <div class="info-desc">
                <div class="remark ml-0 mt-20">备注：红包费用由商户承担</div>
              </div>
            </div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="form-submit_wrapper">
          <span class="cancel" @click="backToEdit">返回修改</span>
          <div class="panel-btn__download panel-btn__download_detail" @click="submit">
            <i class="el-icon-loading" v-if="iconShow"></i>
            <i class="icon-create" v-else="">
              <span>确认提交</span>
            </i>
          </div>
        </div>
      </div>
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
        vm.data = Store.get('reviewpacketdata');
      });
    },
    data() {
      return {
        data: {},
        role: Store.get('role') || {},
        iconShow: false,
        effectList: ['即刻生效', '次日生效']
      };
    },
    computed: {
      shopDict() {
        return this.$store.state.shopDict;
      },
      shopNameList() {
        let shopArr = this.data.sub_mchnt_list;
        let tmpStr = '';
        if (shopArr) {
          shopArr.forEach((v) => {
            if(tmpStr === '') {
              tmpStr += this.shopDict[v];
            } else {
              tmpStr += '、' + this.shopDict[v];
            }
          });
          return tmpStr;
        }
      }
    },
    methods: {
      backToEdit() {
        this.$router.go(-1);
      },
      fixData() {
        var tmpData = deepClone(this.data);
        if (tmpData.packetValue === 0) {
          tmpData.amt_max = tmpData.singleValue;
          tmpData.amt_min = tmpData.singleValue;
        }
        if(tmpData.sub_mchnt_list.indexOf('') !== -1) {
          tmpData.sub_mchnt_list = [];
        }
        tmpData.amt_min *= 100;
        tmpData.amt_max *= 100;
        tmpData.total_amt *= 100;
        tmpData.limit_amt *= 100;
        if(tmpData.obtain_amt) {
          tmpData.obtain_amt *= 100;
        }
        return tmpData;
      },
      submit() {
        let data = this.fixData();
        console.log(data);

        if(!this.iconShow) {
          this.iconShow = true;
          axios.post(`${config.host}/merchant/activity/create`, data)
            .then((res) => {
              this.iconShow = false;
              let data = res.data;
              if (data.respcd === config.code.OK) {
                this.$message({
                  type: 'success',
                  message: '创建红包活动成功'
                });
                this.$router.push('/main/memberredpacket');
              } else {
                this.$message.error(data.resperr);
              }
            })
            .catch(() => {
              this.iconShow = false;
              this.$message.error('创建红包活动失败');
            });
        }
      }
    }
};
</script>
<style lang="scss">
.flex {
  display: flex;
}

.review-info__wrapper {
  padding: 22px 0px 20px 20px;
  @at-root .review-info {
    margin-bottom: 10px;
    font-size: 0;
    .info-title {
      display: inline-block;
      width: 100px;
      line-height: 22px;
      font-size: 16px;
      color: #8A8C92;
    }
    .info-desc {
      line-height: 22px;
      font-size: 16px;
      color: #1F2D3D;
      margin-left: 35px;
      .highlight {
        color: #FE9B20;
        margin: 0px 5px;
      }
      .ml-0 {
        margin-left: 0px;
      }
    }
  }
}

.flex .info-desc {
  line-height: 25px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
