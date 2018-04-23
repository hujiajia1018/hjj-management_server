<template>
  <div class="content">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>实时收款</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group panel-select-group__justify">
          <span class="panel-header__desc">流水列表</span>
          <span style="padding-right:30px">每5s自动刷新</span>
        </div>
      </div>
      <div class="panel-body">
        <el-table
          v-loading="loading"
          :data="trades"
          row-class-name="el-table__row_fix"
          class="trade-table">
          <el-table-column
            label="店铺名称">
            <template scope="scope">{{ shop.shopname }}</template>
          </el-table-column>
          <el-table-column
            prop="busicd"
            label="交易类型">
            <template scope="scope">{{ scope.row.busicd | busicdText }}</template>
          </el-table-column>
          <el-table-column
            prop="sysdtm"
            min-width="150"
            label="交易时间">
            <template scope="scope">{{ scope.row.sysdtm }}</template>
          </el-table-column>
          <el-table-column
            label="交易金额">
            <template scope="scope">
              <strong class="font-large">{{ scope.row.orig_amt || scope.row.txamt | formatCurrency }}元</strong>
              <p class="font-small" v-if="scope.row.busicd.substring(0, 4) === '7000'">实收0元</p>
              <p class="font-small" v-else>实收{{ scope.row.txamt | formatCurrency }}元</p>
              <p class="font-small" v-show="scope.row.merchanCouponAmt">商家红包{{ scope.row.merchanCouponAmt | formatCurrency }}元</p>
              <p class="font-small" v-show="parseInt(scope.row.coupon_amt)">平台补贴{{ scope.row.coupon_amt | formatCurrency }}元</p>
            </template>
          </el-table-column>
          <el-table-column
            prop="cancel"
            label="交易状态">
            <template scope="scope">{{ scope.row.cancel | tradeStatus }}</template>
          </el-table-column>
          <el-table-column
            prop="syssn"
            min-width="210"
            label="流水号">
          </el-table-column>
        </el-table>
      </div>
      <footer class="view-more">
        <router-link :to="toLink">查看更多 &gt;&gt;</router-link>
      </footer>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import config from 'config'
  import Store from '../../common/js/store'
  export default {
    props: {
      shop: {
        type: Object
      }
    },
    data() {
      return {
        trades: [],
        loading: false,
        timeId: null,
        role: Store.get('role') || {},
        toLink: ''
      }
    },
    created() {
      this.fetchData()
      if (this.role.isBaoshang) {
        this.toLink = '/main/transctl'
      } else{
        this.toLink = '/main/transdetail'
      }
    },
    beforeRouteLeave (to, from, next) {
      clearTimeout(this.timeId)
      next()
    },
    methods: {
      fetchData() {
        this.loading = true
        this.trades = []
        axios.get(`${config.o2host}/trade/v1/tradelist?busicd=000000,700000,700003,800101,800107,800108,800201,800207,800208,800401,800407,800408,800501,800507,800508,800601,800607,800608&start=1&len=10&respcd=0000&fix=1&stat=0&format=cors`)
        .then((res) => {
          let data = res.data
          if (data.respcd === config.code.OK) {
            let tradeskey = data.data.tradelist.head
            let tradesvalue = data.data.tradelist.body
            for (let key in tradesvalue) {
              let tradesObject = {}
              for (let variable in tradeskey) {
                tradesObject[tradeskey[variable]] = tradesvalue[key][variable]
                // note key 是json string 只提取有用的 mchnt_coupon
                if (tradeskey[variable] === 'note' && tradesObject['note']) {
                  let noteObject = JSON.parse(tradesObject['note'])
                  tradesObject['merchanCouponAmt'] = noteObject.coupon_amt
                  tradesObject['orig_amt'] = noteObject.orig_amt
                }
              }
              this.trades.push(tradesObject)
            }
            this.loading = false
          } else {
            this.loading = false
            this.trades = []
            clearTimeout(this.timeId)
            this.$message.error(data.resperr + '，请刷新页面重试')
          }
        })
        this.timeId = setTimeout(this.fetchData, 5000)
      }
    }
  }
</script>

<style lang="scss">
  .table-title {
    font-size: 16px;
  }
  .font-large {
    font-size: 16px;
    font-weight: 500;
  }
  .font-small {
    font-size: 12px;
    line-height: 1.5;
  }
  .trade-table {
    width:100%;
    min-height:661px;
    td {
      padding: 6px 0;
    }
  }
  .view-more {
    text-align: right;
    line-height: 50px;
    padding-right: 30px;
    a {
      color: #FE9B20;
      font-size: 17px;
      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
