import { Message } from 'qfpay-element-ui'

let isSupportStorage = () => {
  try {
    localStorage.setItem('key', 'test')
    localStorage.removeItem('key')
    return true
  } catch (e) {
    Message.error('请关闭无痕浏览模式')
    return false
  }
}

isSupportStorage()

let Store = {
  get (key) {
    return JSON.parse(localStorage.getItem(key))
  },
  set (key, val) {
    localStorage.setItem(key, JSON.stringify(val))
  }
}

export default Store
