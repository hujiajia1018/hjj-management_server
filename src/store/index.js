import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import config from 'config'
import { Message, Loading } from 'qfpay-element-ui'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    shopData: [],
    member_total: '',
    redpacketData: [],
    storageData: [],
    shopDict: {},
    pageShopData: []
  },
  mutations: {
    getStorageData (state, payload) {
      state.storageData = payload.storageData
    },
    getPageShopData (state, payload) {
      state.pageShopData = payload.pageShopData;
    },
    getShopList (state, payload) {
      payload.shopData.list.unshift({shop_name: '全部', uid: ''})
      state.shopData = payload.shopData
    },
    updateMemberTotal (state, payload) {
      state.member_total = payload.member_total
    },
    getRedpacketData (state, payload) {
      state.redpacketData = payload.redpacketData
    },
    getShopDict (state, payload) {
      var data = payload.shopData.list
      var tmpObj = {}
      data.forEach((v) => {
        tmpObj[v.uid] = v.shop_name
      })
      console.log(tmpObj)
      state.shopDict = tmpObj
    }
  },
  actions: {
    getStorageData ({ commit }, payload) {
      var loading = Loading.service({
        target: document.getElementById('memberstorage'),
        fullscreen: false
      })
      axios.get(`${config.host}/merchant/prepaid/list`, {
        params: Object.assign({}, {activity_status: '', pos: 0, count: 10}, payload && payload.params)
      })
      .then((res) => {
        loading.close()
        let data = res.data
        if (data.respcd === config.code.OK) {
          commit({
            type: 'getStorageData',
            storageData: data.data
          })
        } else {
          Message.error(data.resperr)
        }
      })
      .catch(() => {
        loading.close()
        Message.error('获取储值列表失败')
      })
    },
    getPageShopData ({ commit }, payload) {
      axios.get(`${config.host}/merchant/sub/list`, {
        params: Object.assign({}, {start: 0, len: 10, format: 'cors'}, payload)
      })
      .then((res) => {
        let data = res.data
        if (data.respcd === config.code.OK) {
          commit({
            type: 'getPageShopData',
            pageShopData: data.data
          })
        } else {
          Message.error(data.respmsg)
        }
      })
      .catch(() => {
        Message.error('获取分页店铺列表失败')
      })
    },
    getShopList ({ commit }, payload) {
      axios.get(`${config.host}/merchant/sub/list?format=cors`)
      .then((res) => {
        let data = res.data
        if (data.respcd === config.code.OK) {
          commit({
            type: 'getShopList',
            shopData: data.data
          })
          commit({
            type: 'getShopDict',
            shopData: data.data
          })
        } else {
          Message.error(data.respmsg)
        }
      })
      .catch(() => {
        Message.error('首次获取店铺列表失败!')
      })
    },
    getMemberTotal ({ commit }, payload) {
      axios.get(`${config.host}/merchant/member/count?format=cors`)
      .then((res) => {
        let data = res.data
        if (data.respcd === config.code.OK) {
          commit({
            type: 'updateMemberTotal',
            member_total: data.data.count
          })
        }
      })
      .catch(() => {
        Message.error('获取会员数目失败!')
      })
    },
    getRedpacketData ({ commit }, payload) {
      var loading = Loading.service({
        target: document.getElementById('memberredpacket'),
        fullscreen: false
      })
      axios.get(`${config.host}/merchant/activity/list`, {
        params: Object.assign({}, {
          type: '',
          sub_uid: '',
          length: 10,
          curpage: 0,
          format: 'cors'
        }, payload && payload.params)
      })
      .then((res) => {
        loading.close()
        let data = res.data
        if (data.respcd === config.code.OK) {
          commit({
            type: 'getRedpacketData',
            redpacketData: data.data
          })
        } else {
          Message.error(data.respmsg)
        }
      })
      .catch(() => {
        loading.close()
        Message.error('获取红包数据失败!')
      })
    }
  }
})

export default store
