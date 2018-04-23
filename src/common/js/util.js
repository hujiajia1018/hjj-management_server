let formatObj = (obj) => {
  let arr = []
  for (let attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      let one = attr + '=' + obj[attr]
      arr.push(one)
    }
  }
  return arr.join('&')
}

// 获取params的key对应的value
const getParams = (key) => {
  // 获取参数
  let url = window.location.hash.split('?')[1] || '';
  // 正则筛选地址栏
  let reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)')
  // 匹配目标参数
  let result = url.match(reg)
  // 返回参数值
  return result ? decodeURIComponent(result[2]) : ''
}

// QQ safari时间乱码
const setformateDate = (date) => {
  return date.replace(/-/g, "/")
}

// 日期格式化
const formatDate = (parDate, formatStr) => {

  if(parDate.constructor === String) {
    parDate = parDate.replace(/-/g, "/");
  }

  let date = new Date(parDate)
  /*
   函数：填充0字符
   参数：value-需要填充的字符串, length-总长度
   返回：填充后的字符串
   */
  let zeroize = function (value, length) {
    let i, zeros
    if (!length) {
      length = 2
    }
    value = value + ''
    for (i = 0, zeros = ''; i < (length - value.length); i++) {
      zeros += '0'
    }
    return zeros + value
  }

  if (!formatStr) {
    formatStr = 'yyyy-MM-dd'
  }

  return formatStr.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|yy(?:yy)?|([hHmstT])\1?|[lLZ])\b/g, function ($0) {
    switch ($0) {
      case 'd':
        return date.getDate()
      case 'dd':
        return zeroize(date.getDate())
      case 'ddd':
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][date.getDay()]
      case 'dddd':
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]
      case 'M':
        return date.getMonth() + 1
      case 'MM':
        return zeroize(date.getMonth() + 1)
      case 'MMM':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]
      case 'MMMM':
        return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()]
      case 'yy':
        return (date.getFullYear() + '').substr(2)
      case 'yyyy':
        return date.getFullYear()
      case 'h':
        return date.getHours() % 12 || 12
      case 'hh':
        return zeroize(date.getHours() % 12 || 12)
      case 'H':
        return date.getHours()
      case 'HH':
        return zeroize(date.getHours())
      case 'm':
        return date.getMinutes()
      case 'mm':
        return zeroize(date.getMinutes())
      case 's':
        return date.getSeconds()
      case 'ss':
        return zeroize(date.getSeconds())
      case 'l':
        return date.getMilliseconds()
      case 'll':
        return zeroize(date.getMilliseconds())
      case 'tt':
        return date.getHours() < 12 ? 'am' : 'pm'
      case 'TT':
        return date.getHours() < 12 ? 'AM' : 'PM'
    }
  })
}

let isEmptyObject = (obj) => {
  var name
  for (name in obj) {
    return false
  }
  return true
}

let deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

// 用户角色
const getRole = (data = {}) => {
  let role = {
    type: 'chain',
    haiwai: data.country !== 'CN', // 是否海外
    currency: data.currency || '元', // 货币单位
    country: data.country, // 国家
    rate: data.rate || 100, // 汇率
    isMerchant: data.cate !== 'submerchant', // 是否大商户或者单店
    single: data.cate !== 'bigmerchant', // 是否子商户或者直营
    isBaoshang: data.group_name === 'baoshang', // 是否包商
    isCashier: Boolean(data.opinfo && data.opinfo.opuid), // 是否收银员角色
    diancan: data.diancan_display === 1, // 是否展示智慧餐厅
    isClound: data.wuxiang_display === 1 // 是否展示舞项云
  }

  if (data.cate !== 'bigmerchant') {
    role.type = 'single'
  }

  // 包商baoshang 日本japan 香港hongkong 印尼id 迪拜ar
  // bigmerchant:大商户 submerchant:子商户 merchant:商户
  if(data.group_name === 'baoshang') {
    role.type = 'baoshang'
    if (data.cate !== 'bigmerchant') {
      role.type = 'baoshang_single'
    }
  }

  return role
}

// 数据格式化
const formatData = (arg1, arg2) => {
  let m = 0;
  let s1 = arg1.toString();
  let s2 = arg2.toString();

  try{ m += s1.split(".")[1].length }catch(e) {}
  try{ m += s2.split(".")[1].length }catch(e) {}

  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

const formatLength = (val) => {
  let len;
  let num = (val || 0).toString();
  if(num && num.indexOf('.') > -1) {
    len = num.split('.')[1];
    num = num.split('.')[0];
  }

  let result = '';
  while (num.length > 3) {
    result = ',' + num.slice(-3) + result;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return len ? `${result}.${len}` : result;
};

const getCookie = (sName) => {
  var aCookie = document.cookie.split(';')

  for (let sCookie of aCookie) {
    var aCrumb = sCookie.split('=')
    if (sName == aCrumb[0].replace(/(^\s*)|(\s*$)/g, '')) {
      return (aCrumb[1])
    }
  }
  return null
}

const clearCookie = (name, dom) => {
  let domain = dom.split('.').slice(-2).join('.');
  let exp = new Date();
  exp.setTime(exp.getTime() - 10000);
  document.cookie = name + "=''" + ";path=/;expires=" + exp.toGMTString();
  document.cookie = name + "=''" + ";Domain=." + domain + ";path=/;expires=" + exp.toGMTString();
}
function GetVerifyBit(id) {
  var result
  var nNum = +(id.charAt(0) * 7 + id.charAt(1) * 9 + id.charAt(2) * 10 + id.charAt(3) * 5 + id.charAt(4) * 8 + id.charAt(5) * 4 + id.charAt(6) * 2 + id.charAt(7) * 1 + id.charAt(8) * 6 + id.charAt(9) * 3 + id.charAt(10) * 7 + id.charAt(11) * 9 + id.charAt(12) * 10 + id.charAt(13) * 5 + id.charAt(14) * 8 + id.charAt(15) * 4 + id.charAt(16) * 2)
  nNum = nNum % 11
  switch (nNum) {
    case 0:
      result = '1'
      break
    case 1:
      result = '0'
      break
    case 2:
      result = 'X'
      break
    case 3:
      result = '9'
      break
    case 4:
      result = '8'
      break
    case 5:
      result = '7'
      break
    case 6:
      result = '6'
      break
    case 7:
      result = '5'
      break
    case 8:
      result = '4'
      break
    case 9:
      result = '3'
      break
    case 10:
      result = '2'
      break
  }
  return result
}

const cardValid = (card) => {
  var aCity = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外'
  }
  var iSum = 0
  var strIDno = card
// alert(strIDno.substring(0, 6));
  var idCardLength = strIDno.length
  if (!/^\d{17}(\d|x)$/i.test(strIDno) && !/^\d{15}$/i.test(strIDno)) {
    return 1
  } // 非法身份证号

  if (aCity[parseInt(strIDno.substr(0, 2))] == null) {
    return 2
  }// 非法地区

// 15位身份证转换为18位
  if (idCardLength == 15) {
    sBirthday = '19' + strIDno.substr(6, 2) + '-' +
      Number(strIDno.substr(8, 2)) + '-' +
      Number(strIDno.substr(10, 2))
    var d = new Date(sBirthday.replace(/-/g, '/'))
    var dd = d.getFullYear().toString() + '-' + (d.getMonth() + 1) + '-' +
      d.getDate()
    if (sBirthday != dd) {
      return 3
    } // 非法生日
    strIDno = strIDno.substring(0, 6) + '19' + strIDno.substring(6, 15)
    strIDno = strIDno + GetVerifyBit(strIDno)
  }

// 判断是否大于2078年，小于1900年
  var nowDate = new Date()
  var nowYear = nowDate.getFullYear()
  var oldYear = nowYear - 150
  var year = strIDno.substring(6, 10)
  if (year < oldYear || year > nowYear) {
    return 3
  }// 非法生日

// 18位身份证处理

// 在后面的运算中x相当于数字10,所以转换成a
  strIDno = strIDno.replace(/x$/i, 'a')

  var sBirthday = strIDno.substr(6, 4) + '-' + Number(strIDno.substr(10, 2)) +
    '-' + Number(strIDno.substr(12, 2))
  d = new Date(sBirthday.replace(/-/g, '/'))
  if (sBirthday != (d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d
      .getDate())) {
    return 3
  } // 非法生日
// 身份证编码规范验证
  for (var i = 17; i >= 0; i--) {
    iSum += (Math.pow(2, i) % 11) * parseInt(strIDno.charAt(17 - i), 11)
  }
  if (iSum % 11 != 1) {
    return 1
  }// 非法身份证号

// 判断是否屏蔽身份证
  var words = ['11111119111111111', '12121219121212121', '123456789087654321']

  for (var k = 0; k < words.length; k++) {
    if (strIDno.indexOf(words[k]) != -1) {
      return 1
    }
  }
  return 0
}

module.exports = {
  formatObj,
  formatDate,
  isEmptyObject,
  deepClone,
  getParams,
  getRole,
  setformateDate,
  formatData,
  formatLength,
  getCookie,
  clearCookie,
  cardValid
}
