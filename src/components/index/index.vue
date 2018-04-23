<template>
  <div class="index" v-loading="loading1 || loading2" element-loading-text="拼命加载中">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>首页概览</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <h2 class="panel-header__desc">会员及交易数据统计</h2>
        </div>
      </div>

      <div class="panel-body panel-today">
        <div class="member">
          <h3><i></i>今日会员新增</h3>
          <strong><em>{{info.new_member_num}}</em> 人</strong>
          <ul>
            <li>
              <strong><i></i>今日回头客</strong>
              <span><em>{{info.old_member_num}}</em> 个</span>
            </li>
            <li>
              <strong><i></i>本月会员新增</strong>
              <span><em>{{info.month_new_member}}</em> 人</span>
            </li>
            <li>
              <strong><i></i>累计会员数</strong>
              <span><em>{{info.total_member}}</em> 人</span>
            </li>
          </ul>
        </div>
        <div class="fee">
          <h3>活动运营数据统计</h3>
          <strong><em>{{info.today_total_amt | formatCurrency}}</em> {{ role.currency }}</strong>
          <ul>
            <li>
              <strong><i></i>今日交易笔数</strong>
              <span><em>{{info.nums}}</em> 笔</span>
            </li>
            <li>
              <strong><i></i>今日实收</strong>
              <span><em>{{info.today_txamt | formatCurrency}}</em> {{ role.currency }}</span>
            </li>
            <li>
              <strong><i></i>本月实收</strong>
              <span><em>{{info.month_txamt | formatCurrency}}</em> {{ role.currency }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="data-show">
      <h2>活动运营数据统计</h2>
      <div class="content" v-if="activitys.length > 0">
        <div class="item" v-for="activity in activitys">
          <div @click="openDetail('coupon')" v-if="activity.type === 'coupon'">
            <h3><i></i>进行中的活动：红包</h3>
            <div class="title">
              <i class="icon"></i>
              <span>
                <strong>{{activity.title}}</strong>
                活动已进行{{activity.going_days}}天
              </span>
            </div>
            <ul>
              <li>
                <strong>领取数</strong>
                <span><em>{{activity.used_num}}</em>个</span>
              </li>
              <li>
                <strong>使用数</strong>
                <span><em>{{activity.use}}</em>个</span>
              </li>
              <li>
                <strong>刺激消费数</strong>
                <span><em>{{activity.total_amt | formatCurrency}}</em>元</span>
              </li>
            </ul>
          </div>
          <div @click="openDetail('card')" v-else-if="activity.type === 'card'">
            <h3><i class="collect"></i>进行中的活动：集点</h3>
            <div class="title">
              <i class="icon collect"></i>
              <span>
                <strong>满{{activity.exchange_pt}}点送{{activity.goods_name}}</strong>
                活动已进行{{activity.going_days}}天
              </span>
            </div>
            <ul>
              <li>
                <strong>参与人数</strong>
                <span><em>{{activity.in_person_no}}</em>个</span>
              </li>
              <li>
                <strong>会员复购数</strong>
                <span><em>{{activity.repeat_no}}</em>个</span>
              </li>
              <li>
                <strong>兑换数</strong>
                <span><em>{{activity.exchange_num}}</em>份</span>
              </li>
            </ul>
          </div>
          <div @click="openDetail('storage')" v-if="activity.type === 'prepaid'">
            <h3><i class="store"></i>进行中的活动：储值</h3>
            <div class="title">
              <i class="icon store"></i>
              <span>
                <strong>{{activity.title}}</strong>
                活动已进行{{activity.going_days}}天
              </span>
            </div>
            <ul style="text-align:center">
              <!-- <li>
                <strong>今日储值</strong>
                <span><em>{{activity.today_total_pay_amt | formatCurrency}}</em>元</span>
              </li> -->
              <li>
                <strong>储值会员</strong>
                <span><em>{{activity.user_num}}</em>位</span>
              </li>
              <li>
                <strong>储值金额</strong>
                <span><em>{{activity.total_pay_amt | formatCurrency}}</em>元</span>
              </li>
            </ul>
          </div>
        </div>
        <!-- <div class="item" @click="openDetail('storage')">
          <h3><i class="store"></i>进行中的活动：储值</h3>
          <div class="title">
            <i class="icon store"></i>
            <span>
              <strong>储值活动</strong>
              活动已进行2天
            </span>
          </div>
          <ul>
            <li>
              <strong>今日储值</strong>
              <span><em>21</em>元</span>
            </li>
            <li>
              <strong>储值会员</strong>
              <span><em>3</em>位</span>
            </li>
            <li>
              <strong>储值金额</strong>
              <span><em>200</em>元</span>
            </li>
          </ul>
        </div> -->
      </div>
      <div class="no-content" v-else>暂无活动</div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import config from 'config'
  import Store from '../../common/js/store'
  export default {
    data() {
      return {
        loading1: false,
        loading2: false,
        role: Store.get("role") || {},
        info: {},
        activitys: []
      };
    },
    props: {
      shop: {
        type: Object
      }
    },
    created() {
      // 收银员角色跳转实时收款，海外调整交易管理
      if(this.role.isCashier) {
        this.$router.push('/main/todaytrade');
      }else {
        this.fetchDashboardData()
        this.fetchActivityData()
      }
    },
    methods: {
      fetchDashboardData() {
        this.loading1 = true;
        axios.get(`${config.host}/merchant/dashboard/stats`)
          .then((res) => {
            this.loading1 = false;
            let data = res.data
            if(data.respcd === config.code.OK) {
              this.info = data.data
            } else {
              this.$message.error(data.respmsg)
            }
          })
          .catch(() => {
            this.loading1 = false;
            this.$message.error('网络错误')
          });
      },
      fetchActivityData() {
        this.loading2 = true;
        axios.get(`${config.host}/merchant/homeview`)
          .then((res) => {
            this.loading2 = false;
            let data = res.data
            if (data.respcd === config.code.OK) {
              this.activitys = data.data.result
            } else {
              this.$message.error(data.respmsg)
            }
          })
          .catch(() => {
            this.loading2 = false;
            this.$message.error('网络错误')
          })
      },
      openDetail(type) {
        let pathname = '';
        switch (type) {
          case 'coupon':
            pathname = 'memberredpacket';
            break;
          case 'card':
            pathname = 'memberredpoint';
            break;
          case 'storage':
            pathname = 'memberstorage';
            break;
          default:
            break
        }
        this.$router.push(pathname)
      }
    }
  };
</script>

<style lang="scss" scoped>
  .index {
    .panel-body.panel-today{
      padding: 28px 0;
    }
    .panel-today {
      > div {
        width: 48%;
        display: inline-block;
        text-align: center;
        &:first-child:not(:only-child) {
          border-right: 1px solid #E8E7E6;
        }
        > strong {
          color: #FE9B20;
          em {
            font-size: 34px;
          }
        }
      }
      h3 {
        font-weight: bold;
        margin-bottom: 12px;
      }
      ul {
        width: 80%;
        max-width: 480px;
        padding-top: 10px;
        padding-bottom: 15px;
        margin: 0 auto;
      }
      li {
        text-align: right;
        line-height: 32px;
        strong {
          float: left;
          i {
            width: 7px;
            height: 7px;
            vertical-align: middle;
            margin-right: 10px;
            border-radius: 7px;
            display: inline-block;
            background-color: #8883F4;
          }
          color: #8A8C92;
        }
      }
      .fee i{
        background-color: #F5A623;
      }
    }
    .data-show {
      padding: 0 25px;
      h2 {
        font-size: 18px;
        padding-bottom: 12px;
      }
    }
    .content {
      margin-right: -12px;
      .item {
        width: 300px;
        cursor: pointer;
        margin-bottom: 18px;
        display: inline-block;
        margin-right: 12px;
        background-color: #fff;
        box-shadow: 0 3px 3px #E8E7E6;
        &:hover {
          box-shadow: 5px 5px 5px #E8E7E6;
        }
        h3 {
          i {
            width: 5px;
            height: 22px;
            vertical-align: middle;
            margin-right: 10px;
            display: inline-block;
            background: #FF3D1F url('./img/title-bg.png') no-repeat 0 -1px;
            &.collect {
              background-color: #8883F4;
            }
            &.store {
              background-color: #FF8100;
            }
          }
          line-height: 40px;
          font-size: 15px;
          border-bottom: 1px solid #E8E7E6;
        }
        ul {
          padding: 20px 5%;
        }
        .title {
          padding:25px 0 10px 15px;
          i {
            width: 28px;
            height: 28px;
            margin-right: 5px;
            display: inline-block;
            background: url('./img/icons.png') no-repeat;
            &.collect {
              background-position: -28px 0;
            }
            &.store {
              background-position: -56px 0;
            }
          }
          i, span {
            vertical-align: middle;
          }
          strong {
            font-size: 14px;
            display: block;
            color: #262424;
            padding-bottom: 8px;
          }
          span {
            display: inline-block;
            font-size: 12px;
            color: #C2C2C2;
          }
        }
        li {
          width: 30%;
          display: inline-block;
          border-right: 1px solid #E8E7E6;
          text-align: center;
          &:last-child {
            border-right: none;
          }
          strong {
            color: #8A8C92;
            font-size: 12px;
            display: block;
            margin-bottom: 4px;
          }
          span {
            font-size: 12px;
            em {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
</style>
