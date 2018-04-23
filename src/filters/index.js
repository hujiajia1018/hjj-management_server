import Vue from 'vue'
import Store from '../common/js/store'
import { formatLength } from '../common/js/util'

let filters = {

  formatCurrency (number) {
    if(isNaN(number)) {
      return 0
    } else if(number === 0) {
      return 0
    }
    let role = Store.get('role') || {};
    return formatLength((number / role.rate).toFixed(2))
  },

  formatNumber (string) {
    if(!string) {
      return 0
    }else if(parseInt(string) === 0) {
      return 0
    }
    let role = Store.get('role') || {};
    return formatLength((string / role.rate).toFixed(2))
  },

  // 交易类型选填: 1储值(充值) 或 2(消费) 或3(消费退款) 或4(手动储值)
  formatType (type) {
    switch (type) {
      case 1:
        return '储值充值'
      case 2:
        return '储值消费'
      case 3:
        return '消费退款'
      case 4:
        return '手动储值'
      default:
        return '储值充值'
    }
  },

  removeHMS (time) {
    return time.split(' ')[0]
  },

  addZero (number) {
    if (isNaN(number)) {
      return
    }
    return (number * 100 / 100).toFixed(2)
  },

  tradeStatus (cancel) {
    if (parseInt(cancel) === 0) {
      return '交易成功'
    } else {
      return '已撤销'
    }
  },

  busicdText (busicd) {
    let frontStr = busicd.substring(0, 4)
    switch (frontStr) {
      case '8002':
        return '微信收款'
      case '8001':
        return '支付宝收款'
      case '8005':
        return '京东钱包'
      case '8006':
        return 'QQ钱包'
      case '7000':
        return '储值消费'
      case '0000':
        return '刷卡消费'
      default:
        return '其他类型'
    }
  }

}

Object.keys(filters).forEach((k) => {
  Vue.filter(k, filters[k])
})
