import Vue from 'vue'
import Router from 'vue-router'

import login from 'components/login/login'
import register from 'components/register/register'
import main from 'components/main/main'
import billctl from 'components/billctl/billctl'
import index from 'components/index/index'
import todaytrade from 'components/todaytrade/todaytrade'
import chainmanage from 'components/chainmanage/chainmanage'
import createsubshop from 'components/chainmanage/createSubShop'
import chaingroup from 'components/chainmanage/chaingroup'
import routerhub from 'components/chainmanage/routerHub'
import singlemanage from 'components/singlemanage/singlemanage'
import transctl from 'components/transctl/transctl'
import memberctl from 'components/memberctl/memberctl'
import memberredpoint from 'components/memberredpoint/memberredpoint'
import createpoint from 'components/createpoint/createpoint'
import editpoint from 'components/editpoint/editpoint'
import exchangecreditslist from 'components/exchangedcredits/exchangedcreditslist'
import reviewpoint from 'components/reviewpoint/reviewpoint'
import memberredpacket from 'components/memberredpacket/memberredpacket'
import memberstorage from 'components/memberstorage/memberstorage'
import createpacket from 'components/createpacket/createpacket'
import reviewpacket from 'components/reviewpacket/reviewpacket'
import member from 'components/member/member'
import packetnotify from 'components/packetnotify/packetnotify'
import packetshare from 'components/packetshare/packetshare'
import packetspend from 'components/packetspend/packetspend'
import storagelist from 'components/storagelist/storagelist'
import storagedetail from 'components/storagedetail/storagedetail'
import storagebill from 'components/storagebill/storagebill'
import createstorage from 'components/createstorage/createstorage'
import reviewstorage from 'components/reviewstorage/reviewstorage'
import alterstorage from 'components/alterstorage/alterstorage'
import publicauth from 'components/publicauth/publicauth'
import failed from 'components/publicauth/failed'
import settings from 'components/settings/settings'
import dcqrcode from 'components/dcqrcode/dcqrcode'
import cashiermanage from 'components/cashiermanage/cashiermanage'
import addcashier from 'components/addcashier/addcashier'
import cashierdetail from 'components/cashierdetail/cashierdetail'
import merchandise from 'components/merchandise/merchandise'
import memberIntegral from 'components/memberIntegral/memberIntegral'
import transcollect from 'components/transcollect/transcollect'
import transdetail from 'components/transdetail/transdetail'
import invoicemanage from 'components/invoicemanage/invoicemanage'
import kbauthorize from 'components/kbauthorize/kbauthorize'
import writeoffticket from 'components/writeoffticket/writeoffticket'
import writeofflist from 'components/writeofflist/writeofflist'
import relavanceauthorize from 'components/relavanceauthorize/relavanceauthorize'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: login
    },
    {
      path: '/login',
      component: login
    },
    {
      path: '/register',
      component: register,
      name: 'register'
    },
    {
      path: '/forget',
      component: register,
      name: 'forget'
    },
    {
      path: '/main',
      component: main,
      redirect: '/main/index',
      children: [
        {
          path: 'index',
          component: index
        },
        {
          path: 'todaytrade',
          component: todaytrade
        },
        {
          path: 'memberctl',
          component: memberctl
        },
        {
          path: 'memberredpoint',
          component: member,
          children: [
            {
              path: '',
              component: memberredpoint
            },
            {
              path: 'exchangedcredits',
              name: 'exchangedcredits',
              component: exchangecreditslist
            },
            {
              path: 'createpoint',
              name: 'createpoint',
              component: createpoint
            },
            {
              path: 'editpoint',
              name: 'editpoint',
              component: editpoint
            },
            {
              path: 'reviewpoint',
              name: 'reviewpoint',
              component: reviewpoint
            }
          ]
        },
        {
          path: 'memberstorage',
          component: member,
          children: [
            {
              path: '',
              component: memberstorage
            },
            {
              path: 'storagelist',
              name: 'storagelist',
              component: storagelist
            },
            {
              path: 'storagedetail',
              name: 'storagedetail',
              component: storagedetail
            },
            {
              path: 'storagebill',
              name: 'storagebill',
              component: storagebill
            },
            {
              path: 'createstorage',
              name: 'createstorage',
              component: createstorage
            },
            {
              path: 'reviewstorage',
              name: 'reviewstorage',
              component: reviewstorage
            },
            {
              path: 'alterstorage',
              name: 'alterstorage',
              component: alterstorage
            }
          ]
        },
        {
          path: 'memberredpacket',
          component: member,
          children: [
            {
              path: '',
              component: memberredpacket
            },
            {
              path: 'createpacket',
              component: createpacket,
              children: [
                {
                  path: 'type_common',
                  name: 'type_common',
                  component: packetnotify
                },
                {
                  path: 'type_share',
                  name: 'type_share',
                  component: packetshare
                },
                {
                  path: 'type_payment',
                  name: 'type_payment',
                  component: packetspend
                }
              ]
            },
            {
              path: 'reviewpacket',
              name: 'reviewpacket',
              component: reviewpacket
            }
          ]
        },
        {
          path: 'transcollect',
          name: 'transcollect',
          component: transcollect
        },
        {
          path: 'transdetail',
          name: 'transdetail',
          component: transdetail
        },
        {
          path: 'transctl',
          component: transctl
        },
        {
          path: 'billctl',
          component: billctl
        },
        {
          path: 'chainmanage',
          component: routerhub,
          children: [
            {
              path: '',
              component: chainmanage
            },
            {
              path: 'createsubshop',
              component: createsubshop
            }
          ]
        },
        {
          path: 'chaingroup',
          component: chaingroup
        },
        {
          path: 'singlemanage',
          component: singlemanage
        },
        {
          path: 'publicauth',
          component: publicauth
        },
        {
          path: 'authfailed',
          component: failed
        },
        {
          path: 'settings',
          component: settings
        },
        {
          path: 'noPublic/:hasPublic',
          name: 'noPublic',
          component: dcqrcode
        },
        {
          path: 'hasPublic/:hasPublic',
          name: 'hasPublic',
          component: dcqrcode
        },
        {
          path: 'memberIntegral',
          name: 'memberIntegral',
          component: memberIntegral
        },
        {
          path: 'cashiermanage',
          component: member,
          children: [
            {
              path: '',
              component: cashiermanage
            },
            {
              path: 'addcashier',
              name: 'addcashier',
              component: addcashier
            },
            {
              path: 'cashierdetail',
              name: 'cashierdetail',
              component: cashierdetail
            }
          ]
        },
        {
          path: 'merchandise',
          name: 'merchandise',
          component: merchandise
        },
        {
          path: 'invoicemanage',
          name: 'invoicemanage',
          component: invoicemanage
        },
        {
          path: 'kbauthorize',
          name: 'kbauthorize',
          component: kbauthorize
        },
        {
          path: 'writeoffticket',
          name: 'writeoffticket',
          component: writeoffticket
        },
        {
          path: 'writeofflist',
          name: 'writeofflist',
          component: writeofflist
        },
        {
          path: 'relavanceauthorize',
          name: 'relavanceauthorize',
          component: relavanceauthorize
        }
      ]
    }
  ],
  linkActiveClass: 'active'
})
