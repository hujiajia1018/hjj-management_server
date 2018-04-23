<template>
  <div class="sidebar" v-if="origin!=='yirui'">
    <div class="sidebar-logo__wrapper">
      <img src="./img/logo.png" alt="logo" class="sidebar-img"/>
      <h1 class="sidebar-logo__title">{{ shop.shopname }}</h1>
    </div>
    <ul class="left-nav">
      <li v-for="(nav, index) in navs">
        <router-link class="sidebar-nav__item" v-if="nav.pathname" :to="router('main/' + nav.pathname)">{{ nav.val }}</router-link>
        <a v-else class="sidebar-nav__item" @click="toggle(nav.subnav)" :class="{'dark': subNavDark($route.fullPath, nav.subnav)}">
          {{ nav.val }}
          <i v-if="nav.sub" class="icon-down_arrow" :class="{'icon-down_arrow__rotate': isSlides[nav.subnav]}"></i>
        </a>
        <transition name="collpase">
          <ul v-if="nav.sub" v-show="!isSlides[nav.subnav]" class="collpase" :class="{'dark': subNavDark($route.fullPath, nav.subnav)}">
            <li v-for="subnav in nav.sub">
              <router-link class="sidebar-nav__item sidebar-nav__subitem" :to="router('main/' + subnav.pathname)">
                {{ subnav.val }}
              </router-link>
            </li>
            <li v-if="nav.subnav === 'member' && role.isClound && role.single"><router-link class="sidebar-nav__item sidebar-nav__subitem" :to="{name: 'memberIntegral'}">会员积分</router-link></li>
          </ul>
        </transition>
      </li>
      <li :class="{'dark': subNavDark($route.fullPath, 'dinner')}" v-if="role.diancan && !role.isCashier">
        <a class="sidebar-nav__item" @click="toggle('dinner')">
          智慧餐厅
          <i class="icon-down_arrow" :class="{'icon-down_arrow__rotate': isSlides['dinner']}"></i>
        </a>
        <transition name="collpase">
          <ul v-show="!isSlides['dinner']" class="collpase">
            <li>
              <router-link class="sidebar-nav__item sidebar-nav__subitem" :to="{ name: 'noPublic', params: {hasPublic: 'yes'}}">
                有公众号二维码
              </router-link>
            </li>
            <li>
              <router-link class="sidebar-nav__item sidebar-nav__subitem" :to="{ name: 'hasPublic', params: {hasPublic: 'no'}}">
                无公众号二维码
              </router-link>
            </li>
            <li>
              <a href="/wxofficial/setting#!/goods-management" class="sidebar-nav__item sidebar-nav__subitem">商品管理</a>
              <!--<router-link class="sidebar-nav__item sidebar-nav__subitem" :to="{ path: '/main/merchandise' }">商品管理</router-link>-->
            </li>
          </ul>
        </transition>
      </li>
    </ul>
  </div>
</template>
<script>
  import Store from '../../common/js/store';
  export default {
    data() {
      return {
        role: Store.get('role') || {},
        origin: localStorage.getItem('origin'),
        navs: [],
        isSlides: {
          'member': false,
          'trans': false,
          'account': false,
          'dinner': false,
          'ticket': false,
          'authorize': false
        }
      };
    },

    props: {
      shop: {
        type: Object
      }
    },

    created() {
      this.getPath();
    },

    methods: {
      router(router) {
        return `/${router}`;
      },
      subNavDark(path, subnav) {
        if (path.indexOf('member') >= 0 && subnav === 'member') {
          return true;
        } else if (path.indexOf('trans') >= 0 && subnav === 'trans') {
          return true;
        } else if (path.indexOf('chain') >= 0 && subnav === 'account') {
          return true;
        } else if (path.indexOf('Public') >= 0 && subnav === 'dinner') {
          return true;
        } else if (path.indexOf('writeoff') >= 0 && subnav === 'ticket') {
          return true;
        } else if (path.indexOf('authorize') >= 0 && subnav === 'authorize') {
          return true;
        }
        return false;
      },
      toggle(subnav) {
        for (let key in this.isSlides) {
          if (subnav === key) {
            this.isSlides[key] = !this.isSlides[key];
          }
        }
      },
      // 根据角色左侧菜单初始化
      getPath() {
        switch (this.role.type) {
          case 'chain':
            this.navs = [
              {
                val: '首页概览',
                pathname: 'index'
              }, {
                val: '会员功能',
                subnav: 'member',
                sub: [{
                  val: '会员管理',
                  pathname: 'memberctl'
                }, {
                  val: '会员集点',
                  pathname: 'memberredpoint'
                }, {
                  val: '会员红包',
                  pathname: 'memberredpacket'
                }, {
                  val: '会员储值',
                  pathname: 'memberstorage'
                }]
              }, {
                val: '交易管理',
                subnav: 'trans',
                sub: [{
                  val: '交易汇总',
                  pathname: 'transcollect'
                }, {
                  val: '交易明细',
                  pathname: 'transdetail'
                }]
              }, {
                val: '授权管理',
                subnav: 'authorize',
                sub: [{
                  val: '支付宝授权',
                  pathname: 'kbauthorize'
                }, {
                  val: '门店关联',
                  pathname: 'relavanceauthorize'
                }]
              }, {
                val: '卡券管理',
                subnav: 'ticket',
                sub: [{
                  val: '卡券核销',
                  pathname: 'writeoffticket'
                }, {
                  val: '商品券核销明细',
                  pathname: 'writeofflist'
                }]
              }, {
                val: '账单管理',
                pathname: 'billctl'
              }, {
                val: '公众号授权',
                pathname: 'publicauth'
              }, {
                val: '账户信息',
                subnav: 'account',
                sub: [{
                  val: '门店信息',
                  pathname: 'chainmanage'
                }, {
                  val: '门店分组',
                  pathname: 'chaingroup'
                }]
              }
            ];
            break;
          case 'single':
            if(this.role.isCashier) {
              this.navs = [
                {
                  val: '实时收款',
                  pathname: 'todaytrade'
                }, {
                  val: '会员功能',
                  subnav: 'member',
                  sub: [{
                    val: '会员管理',
                    pathname: 'memberctl'
                  }, {
                    val: '会员集点',
                    pathname: 'memberredpoint'
                  }, {
                    val: '会员红包',
                    pathname: 'memberredpacket'
                  }, {
                    val: '会员储值',
                    pathname: 'memberstorage'
                  }]
                }, {
                  val: '交易管理',
                  subnav: 'trans',
                  sub: [{
                    val: '交易汇总',
                    pathname: 'transcollect'
                  }, {
                    val: '交易明细',
                    pathname: 'transdetail'
                  }]
                }, {
                  val: '账户信息',
                  pathname: 'singlemanage'
                }, {
                  val: '开票信息管理',
                  pathname: 'invoicemanage'
                }
              ];
            } else if (this.role.isMerchant) {
              this.navs = [
                {
                  val: '首页概览',
                  pathname: 'index'
                }, {
                  val: '实时收款',
                  pathname: 'todaytrade'
                }, {
                  val: '会员功能',
                  subnav: 'member',
                  sub: [{
                    val: '会员管理',
                    pathname: 'memberctl'
                  }, {
                    val: '会员集点',
                    pathname: 'memberredpoint'
                  }, {
                    val: '会员红包',
                    pathname: 'memberredpacket'
                  }, {
                    val: '会员储值',
                    pathname: 'memberstorage'
                  }]
                }, {
                  val: '交易管理',
                  subnav: 'trans',
                  sub: [{
                    val: '交易汇总',
                    pathname: 'transcollect'
                  }, {
                    val: '交易明细',
                    pathname: 'transdetail'
                  }]
                }, {
                  val: '账单管理',
                  pathname: 'billctl'
                }, {
                  val: '公众号授权',
                  pathname: 'publicauth'
                }, {
                  val: '账户信息',
                  pathname: 'singlemanage'
                }, {
                  val: '收银员管理',
                  pathname: 'cashiermanage'
                }, {
                  val: '开票信息管理',
                  pathname: 'invoicemanage'
                },
                {
                  val: '授权管理',
                  subnav: 'authorize',
                  sub: [{
                    val: '支付宝授权',
                    pathname: 'kbauthorize'
                  }, {
                    val: '门店关联',
                    pathname: 'relavanceauthorize'
                  }]
                },
                {
                  val: '卡券管理',
                  subnav: 'ticket',
                  sub: [{
                    val: '卡券核销',
                    pathname: 'writeoffticket'
                  }, {
                    val: '商品券核销明细',
                    pathname: 'writeofflist'
                  }]
                }
              ];
            } else { // 大商户下分店
              this.navs = [
                {
                  val: '首页概览',
                  pathname: 'index'
                }, {
                  val: '实时收款',
                  pathname: 'todaytrade'
                }, {
                  val: '会员功能',
                  subnav: 'member',
                  sub: [{
                    val: '会员管理',
                    pathname: 'memberctl'
                  }, {
                    val: '会员集点',
                    pathname: 'memberredpoint'
                  }, {
                    val: '会员红包',
                    pathname: 'memberredpacket'
                  }, {
                    val: '会员储值',
                    pathname: 'memberstorage'
                  }]
                }, {
                  val: '交易管理',
                  subnav: 'trans',
                  sub: [{
                    val: '交易汇总',
                    pathname: 'transcollect'
                  }, {
                    val: '交易明细',
                    pathname: 'transdetail'
                  }]
                }, {
                  val: '账单管理',
                  pathname: 'billctl'
                }, {
                  val: '公众号授权',
                  pathname: 'publicauth'
                }, {
                  val: '账户信息',
                  pathname: 'singlemanage'
                }, {
                  val: '收银员管理',
                  pathname: 'cashiermanage'
                }, {
                  val: '开票信息管理',
                  pathname: 'invoicemanage'
                }, {
                  val: '卡券管理',
                  subnav: 'ticket',
                  sub: [{
                    val: '卡券核销',
                    pathname: 'writeoffticket'
                  }, {
                    val: '商品券核销明细',
                    pathname: 'writeofflist'
                  }]
                }
              ];
            }
            break;
          case 'baoshang':
            this.navs = [
              {
                val: '首页概览',
                pathname: 'index'
              }, {
                val: '会员功能',
                subnav: 'member',
                sub: [{
                  val: '会员管理',
                  pathname: 'memberctl'
                }, {
                  val: '会员集点',
                  pathname: 'memberredpoint'
                }, {
                  val: '会员红包',
                  pathname: 'memberredpacket'
                }, {
                  val: '会员储值',
                  pathname: 'memberstorage'
                }]
              }, {
                val: '交易管理',
                pathname: 'transctl'
              }, {
                val: '授权管理',
                subnav: 'authorize',
                sub: [{
                  val: '支付宝授权',
                  pathname: 'kbauthorize'
                }, {
                  val: '门店关联',
                  pathname: 'relavanceauthorize'
                }]
              }, {
                val: '公众号授权',
                pathname: 'publicauth'
              }, {
                val: '账户信息',
                pathname: 'chainmanage'
              }
            ];
            break;
          case 'baoshang_single':
            if(this.role.isCashier) {
              this.navs = [
                {
                  val: '实时收款',
                  pathname: 'todaytrade'
                }, {
                  val: '会员功能',
                  subnav: 'member',
                  sub: [{
                    val: '会员管理',
                    pathname: 'memberctl'
                  }, {
                    val: '会员集点',
                    pathname: 'memberredpoint'
                  }, {
                    val: '会员红包',
                    pathname: 'memberredpacket'
                  }, {
                    val: '会员储值',
                    pathname: 'memberstorage'
                  }]
                }, {
                  val: '交易管理',
                  pathname: 'transctl'
                }, {
                  val: '账户信息',
                  pathname: 'singlemanage'
                }, {
                  val: '开票信息管理',
                  pathname: 'invoicemanage'
                }
              ];
            }else {
              this.navs = [
                {
                  val: '首页概览',
                  pathname: 'index'
                }, {
                  val: '实时收款',
                  pathname: 'todaytrade'
                }, {
                  val: '会员功能',
                  subnav: 'member',
                  sub: [{
                    val: '会员管理',
                    pathname: 'memberctl'
                  }, {
                    val: '会员集点',
                    pathname: 'memberredpoint'
                  }, {
                    val: '会员红包',
                    pathname: 'memberredpacket'
                  }, {
                    val: '会员储值',
                    pathname: 'memberstorage'
                  }]
                }, {
                  val: '交易管理',
                  pathname: 'transctl'
                }, {
                  val: '公众号授权',
                  pathname: 'publicauth'
                }, {
                  val: '账户信息',
                  pathname: 'singlemanage'
                }, {
                  val: '收银员管理',
                  pathname: 'cashiermanage'
                }, {
                  val: '开票信息管理',
                  pathname: 'invoicemanage'
                }
              ];
            }
            break;
          default:
            if(this.role.isCashier) {
              this.navs = [
                {
                  val: '交易管理',
                  pathname: 'transctl'
                }, {
                  val: '账户信息',
                  pathname: 'singlemanage'
                }
              ];
            }else {
              this.navs = [
                {
                  val: '首页概览',
                  pathname: 'index'
                }, {
                  val: '交易管理',
                  pathname: 'transctl'
                }, {
                  val: '账户信息',
                  pathname: 'singlemanage'
                }, {
                  val: '收银员管理',
                  pathname: 'cashiermanage'
                }
              ];
            }
        }
      }

    }
  };
</script>
<style lang="scss">

  .sidebar {
    overflow-y: scroll;
    position: fixed;
    width: 220px;
    height: 100%;
    background-color: #2A2A2A;
    @at-root .sidebar-logo__wrapper {
      margin: 20px auto 28px;
      text-align: center;
    }
    @at-root .sidebar-img {
      margin-bottom: 13px;
    }
    @at-root .sidebar-logo__title {
      font-size: 20px;
      color: #fff;
      word-break: break-all;
      word-wrap: break-word;
      line-height: 1.4;
      padding: 0 27px;
    }
    .sidebar-nav__item {
      position: relative;
      display: block;
      line-height: 48px;
      padding-left: 27px;
      cursor: pointer;
      &.sidebar-nav__subitem {
        position: relative;
        padding-left: 45px;
        overflow: hidden;
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 1px;
          top: 0px;
          left: 27px;
          background-color: #373737;
        }
      }
      &.active {
        background-color: #000;
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 7px;
          height: 100%;
          background-color: #FE9B20;
        }
      }
      .icon-down_arrow {
        position: absolute;
        font-size: 14px;
        right: 16px;
        top: 17px;
        transform-origin: center center;
        transition: .3s cubic-bezier(.33,.48,.74,.86);
      }
    }
    .left-nav {
      padding-bottom: 50px;
    }
  }
  .icon-down_arrow__rotate {
    transform: rotateZ(-90deg);
  }
  .dark {
    background-color: #000;
  }

  .copyright_wrapper {
    position: fixed;
    left: 6px;
    bottom: 10px;
    text-align: center;
    font-size: 14px;
    @at-root .copyright-text {
      color: #fff;
    }
    @at-root .copyright-desc {
      text-align: center;
      color: #FE9B20;
    }
    .custom-stylee {
      background-color: #2a2a2a;
      color: #8a8c92;
    }
  }
  .collpase {
    overflow: hidden;
  }
  .collpase-enter-active {
    animation: expand-enter .3s cubic-bezier(.33,.48,.74,.86);
  }
  .collpase-leave-active {
    animation: expand-leave .3s cubic-bezier(.33,.48,.74,.86);
  }

  @keyframes expand-enter {
    0% {
      height: 0px;
    }

    100% {
      height: 144px;
    }
  }
  @keyframes expand-leave {
    0% {
      height: 144px;
    }

    100% {
      height: 0px;
    }
  }
  .popperBg {
    background-color: white;
  }
</style>
