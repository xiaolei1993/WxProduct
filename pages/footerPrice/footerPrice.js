//index.js
var util = require('../../utils/util.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    // 车系信息
    seriesInfo:{},
    userInfo: {},
    //车型id
    productId:'16525',
    //定义发送请求的url公共域名
    ajaxUrl : 'https://dealer-api.360che.com/inquiryprice/',
    truckInfo:{},
    //经销商数据
    dealerData:[],
    //参数配置信息
    parameterData:{},
    //显示哪个参数配置选项
    parameterIndex:0,
    //推荐经销商
    dealerSelected:[],//https://s.kcimg.cn/wap/images/detail/checked.png
    //选择个人信息保护声明
    statementSelected:true,//https://s.kcimg.cn/wap/images/detail/statement-checked.png
    //地区信息
    locationInfo:{},
    // 最终提交数据
    submitData:{

    },
    //错误弹层是否显示和提示
    errPop:false,
    errText:'',
    
    //个人信息保护声明
    statementPop:false,

    //是否显示选择地区
    selectLocationPop: false,

    //导航列表
    indexNav: [],
    //搜索内容
    searchContent:'',
    //定位常用地区
    hotLocation: [],
    //地区列表
    locationList: [],
    //城市列表
    cityList: [],
    //是否显示城市列表
    cityListPop: false,
    //选中的nav
    navInfo: "",
    //显示选中的nav
    navInfoShow: false,
    //搜索结果列表数据
    searchResultData: [],
    searchResultPop: false,
    //换车型弹层是否显示
    switchModelPop: false,
    //换车型弹层数据
    switchModelData: {},
    // 姓名和电话输入框状态和内容
    nameFocus: true,
    phoneFocus: false,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow:function(options){
    // wx.getStorage({
    //   key:"locationInfo",
    //   success:(res) => {
    //     if (res.data.provincesn == this.data.locationInfo.provincesn && res.data.citysn == this.data.locationInfo.citysn){
    //       return 
    //     }

    //     //设置选中地区
    //     this.setData({
    //       locationInfo:res.data
    //     })

    //     //重新请求经销商数据
    //     this.getDealer();
    //   } 
    // })
  },
  // 页面初始化
  onLoad: function (options) {

    //设置标题
    wx.setNavigationBarTitle({
      title: '询底价'
    })
    // 获取车系信息
    wx.getStorage({
      key: 'seriesInfo',
      success: res => {
        this.setData({
          seriesInfo: res.data,
        })
        this.switchModel();
      },
    })

    //获取缓存的经销商信息
    wx.getStorage({
      key: 'dealerId',
      success: res => {
        this.setData({
          dealerId: res.data
        })
        wx.removeStorage({
          key: 'dealerId'
        })
      },
    })
    
    wx.getStorage({
      key: 'priceProductId',
      complete: res => {
        //如果有存储询底价信息
        if(res.data){
          this.setData({
            productId: res.data
          })
          //删除询底价车型id
          wx.removeStorage({
            key: 'priceProductId'
          })
        }else{
          //直接推送的询底价
          if (options.productId) {
            this.setData({
              productId: options.productId
            })
          }
        }
        //请求车型信息
        this.getTruckData()

        //请求车型配置信息
        this.getConfigData();
      }
    })

    //获取已选择地区
    wx.getStorage({
      key: 'locationInfo',
      complete: res => {
        if (res.data) {
          //设置选中地区
          this.setData({
            locationInfo: res.data
          })
        }
        //请求经销商数据
        this.getDealer();
      },
    })
   

    // 判断有没有缓存省份数据 ？ 直接读取缓存 ： 发送请求，请求省份数据
    wx.getStorage({
      key: 'provinceData',
      success: (res) => {
        // this.cancelLoading();
        let data = res.data
        //设置省份和indexNav数据
        this.setData({
          indexNav: data.indexNav,
          locationList: data.list
        })
      },
      //如果没有数据，那么发送请求
      fail: () => {
        //请求省份数据
        wx.request({
          url: 'https://dealer-api.360che.com/inquiryprice/Dealer/getProvinceListAZ.aspx',
          data: {},
          success: (res) => {
            if (res.errMsg == 'request:ok') {
              // this.cancelLoading();

              //设置省份和indexNav数据
              this.setData({
                indexNav: res.data.indexNav,
                locationList: res.data.list
              })
              //缓存省份的数据
              wx.setStorage({
                key: "provinceData",
                data: res.data
              })
            }
          }
        })
      }
    })

    //查看定位城市
    wx.getStorage({
      key: 'myRegion',
      success: res => {
        this.setData({
          myRegion: res.data
        })
      },
    })
    //查看有没有常用地区
    wx.getStorage({
      key: 'hotLocation',
      success: (res) => {
        //查看是否有定位地区
        console.log(this.data.myRegion)
        if (this.data.myRegion.cityname) {
          //查看现在存储的是否是6个
          if (res.data.length == 6) {
            res.data.splice(1, 1)
          }
        }
        this.setData({
          hotLocation: res.data
        })
        console.log(this.data.hotLocation, 'hotLocationhotLocationhotLocationhotLocation')
      }
    })
    // wx.navigateTo({
    //   url: '../location/location'
    // })

    // var that = this
    //调用应用实例的方法获取全局数据
    // app.getUserInfo(function(userInfo){
    //   //更新数据
    //   that.setData({
    //     userInfo:userInfo
    //   })
    // })

  
  },
  //请求经销商数据
  getDealer(provinceId,cityId){
    let ajaxUrl = 'https://dealer-api.360che.com/inquiryprice/Dealer/getDealerList.aspx?productid=' + this.data.productId + '&provincesn=' + this.data.locationInfo.provincesn + '&citysn=' + this.data.locationInfo.citysn + '&type=1';
   
    if (this.data.dealerId){
      ajaxUrl += '&dealerid=' + this.data.dealerId
    }
    wx.request({
      url:ajaxUrl,
      data:{},
      success:(res) => {
        if(res.errMsg == 'request:ok'){
          this.setData({
            dealerData:res.data
          })
          //循环经销商数据，添加选中状态
          let arr = [];
          for(let i = 0; i < this.data.dealerData.length;i++){
            if(i<3){
              arr[i] = this.data.dealerData[i].ShopId;
            }else{
              arr[i] = '';
            }
            
          }
          this.setData({
              dealerSelected:arr
          })
          console.log(arr)
        }
      }
    })
  },
  //请求车型信息
  getTruckData(){
    //请求车型数据
    wx.request({
      url: this.data.ajaxUrl + 'Dealer/getProductInfo.aspx?productid=' + this.data.productId,
      data: {},
      success: (res) => {
        if (res.errMsg == 'request:ok') {
          this.setData({
            truckInfo: res.data
          })
        }
      }
    })
  },
  //请求参数配置信息
  getConfigData(){
    //请求参数配置信息
    wx.request({
      url: 'https://product.360che.com/index.php?r=api/getproparam&id=' + this.data.productId + '&isSem=1',
      data: {},
      success: (res) => {
        if (res.errMsg == 'request:ok') {
          console.log(res.data.data[this.data.productId], 'res')
          this.setData({
            parameterData: res.data.data[this.data.productId]
          })
        }
      }
    })
  },
  // 点击推荐经销商
  selectDealer(e){

    let index = e.currentTarget.dataset.index;
    let ShopId = e.currentTarget.dataset.shopid;
    console.log(ShopId)

    let arr = this.data.dealerSelected;
    console.log(index,'index')
    if(arr[index] != ''){
      arr[index] = ''
    }else{
        arr[index] = ShopId
        // arr[index] = 'https://s.kcimg.cn/wap/images/detail/checked.png'
    }
    this.setData({
      dealerSelected:arr
    })
    console.log(arr)
    // console.log(this.data.dealerData)
  },
  //选择参数配置
  selectParameter(e){
      let index = e.currentTarget.dataset.index;
      this.setData({
        parameterIndex:index,
      })
  },
  //选择个人信息保护声明
  selectStatement(){
    if(this.data.statementSelected){
      this.setData({
        statementSelected:false,
      })
    }else{
      this.setData({
        statementSelected:true,
      })
    }
  },
  getLocation(){
    
    wx.getStorage({
      key: 'locationInfo',
      success: res => {
        this.setData({
          locationInfo:res.data
        })
      },
    })
    // 微信获取经纬度
    // wx.getLocation({
    //     type: 'wgs84',
    //     success: res => {
          
    //       var latitude = res.latitude;
    //       var longitude = res.longitude;
          
    //       // 获取当前位置省市
    //       wx.request({
    //         url:this.data.ajaxUrl + 'Dealer/getLocation.aspx',
    //         data:{},
    //         success:(res) => {
    //           if(res.errMsg == 'request:ok'){
    //             let my_region = {};
    //             my_region.time = new Date().getTime();
    //             my_region.data = res.data;
                
    //             this.setData({
    //                locationInfo:res.data
    //             })
    //             //请求经销商数据
    //             this.getDealer();

    //             //存储定位城市
    //             wx.setStorage({
    //               key:"my_region",
    //               data:JSON.stringify(my_region)
    //             })

    //             //存储常用定位地区列表
    //             wx.getStorage({
    //               key: 'hotLocation',
    //               success: function(res){
    //                 let data = JSON.parse(res.data);
    //                 if(data[0].citysn != my_region.data.citysn){
    //                   data.shift();
    //                   data.unshift(my_region.data);
    //                   wx.setStorage({
    //                     key:"hotLocation",
    //                     data:JSON.stringify(arr)
    //                   })
    //                 }
    //               },
    //               fail: function() {
    //                 let arr = [];
    //                 arr.push(my_region.data)
    //                 wx.setStorage({
    //                   key:"hotLocation",
    //                   data:JSON.stringify(arr)
    //                 })
    //               }
    //             })
    //           }
    //         }
    //       })
    //     }
    //   })
  },
  // 点击选择城市
  goSelectLocation() {
    this.setData({
      selectLocationPop: true
    })
  },
  backSelectLocation() {
    this.setData({
      //选择城市
      cityListPop: false,
      //关闭选择地区弹层
      selectLocationPop: false,
      //取消搜索状态
      searchResultPop: false,
      //删除搜索内容
      searchContent: '',
      //清空搜索结果
      searchResultData: []
    })
  },
  //输入姓名
  importName(e){
    let submitData = this.data.submitData;
    submitData.relname = e.detail.value
    this.setData({
      submitData:submitData
    })
  },
  // 获取焦点
  onFocus(e){
    let name = e.currentTarget.dataset.type;
    if(name == 'name'){
      this.setData({
        phoneFocus: false,
        nameFocus:true
      })
    }else{
      this.setData({
        phoneFocus: true,
        nameFocus: false
      })
    }
  },
  onBlur(e){
    let name = e.currentTarget.dataset.type;
    if (name == 'name') {
      this.setData({
        nameFocus: false
      })
    } else {
      this.setData({
        phoneFocus: false
      })
    }
  },
  importPhone(e){
    let submitData = this.data.submitData;
    submitData.tel = e.detail.value
    this.setData({
      submitData:submitData
    })
  },
  //提交最终数据
  submitData(){
    let submitData = this.data.submitData;
    let locationInfo = this.data.locationInfo;
    
    //车型id赋值
    submitData.truckid = this.data.productId;
    
    // 验证姓名
    let name = /[^\u4e00-\u9fa5]/;  
    if(name.test(submitData.relname) || submitData.relname.length > 6 || submitData.relname == ''){
      this.setData({
        errText:'请填写您的姓名(1-6个汉字)',
        errPop:true
      })
      return 
    }  

    // 验证手机号码
    let phone = /0?(13|14|15|17|18)[0-9]{9}/;
    if(!phone.test(submitData.tel) || submitData.tel == ''){ 
      this.setData({
        errText:'请填写正确的手机号码',
        errPop:true
      })
      return
    } 

    //验证省份
    if(!locationInfo.provincesn){
      this.setData({
        errText:'请选择省份',
        errPop:true
      })
      return      
    }else{
      submitData.provincesn = locationInfo.provincesn;
    }

    //验证城市
    if(!locationInfo.citysn){
      if(locationInfo.provincesn == 820000 || locationInfo.provincesn == 810000 || locationInfo.provincesn == 710000){
       
      }else{
         this.setData({
          errText:'请选择城市',
          errPop:true
        })
        return 
      }
    
    }else{
      submitData.citysn = locationInfo.citysn;
    }

    // 验证选择经销商
    let dealerData = [];
    for (var i = 0 ; i < this.data.dealerSelected.length; i++){
        if(this.data.dealerSelected[i] != ''){
          dealerData.push(this.data.dealerSelected[i])
        }
    }
    if (this.data.dealerData.length){
      if(dealerData.length > 3){
        this.setData({
          errText:'最多选择3家经销商',
          errPop:true
        })
        return 
      }else{
        if(dealerData.length == 0){
            this.setData({
            errText:'请选择经销商',
            errPop:true
          })
          return 
        }
        submitData.shopstr = dealerData.join(',');
      }
    }
    
    //判断个人信息保护声明
    if(!this.data.statementSelected){
      this.setData({
        errText:'请勾选《个人信息保护声明》后再提交您的询价信息',
        errPop:true
      })
      return  
    }

    //线索来源
    submitData.clueresource = 23;//小程序
    //开启loading
    app.globalData.showLoading('提交中');

    // console.log(submitData)
    wx.request({
      url:this.data.ajaxUrl + 'Dealer/submitClues.aspx?',
      data:submitData,
      success:(res) => {

        //关闭loading
        app.globalData.hideLoading();
        if(res.errMsg == 'request:ok'){
          if(res.data.isok == 1){
            wx.redirectTo({
              url: '../success/success?submitData=' + JSON.stringify(submitData) + '&locationInfo=' + JSON.stringify(this.data.locationInfo)
            })
          }else{
            if(res.data.error == 1){
               this.setData({
                  errText:'姓名错误',
                  errPop:true
                })
            }else if(res.data.error == 2){
                this.setData({
                  errText:'手机号错误',
                  errPop:true
                })
            }else if(res.data.error == 3){
                this.setData({
                  errText:'提车地区错误',
                  errPop:true
                })
            }else if(res.data.error == 6){
                this.setData({
                  errText:'同一手机号，对同一款车型，在3天内重复提交',
                  errPop:true
                })
            }else if(res.data.error == 8){
                this.setData({
                  errText:'车型为空或者车型无效',
                  errPop:true
                })
            }else if(res.data.error == 8){
                this.setData({
                  errText:'车型为空或者车型无效',
                  errPop:true
                })
            }else if(res.data.error == 9){
                this.setData({
                  errText:'网络错误',
                  errPop:true
                })
            }
          }
        }else{
          this.setData({
            errText:'网络错误',
            errPop:true
          })
        }
        console.log(res,'最终提交')
      },
      fail:() => {
        this.setData({
            errText:'网络错误啦~',
            errPop:true
          })
      }
    })
  },
  //关闭报错弹层
  closeErrPop(){
    this.setData({
      errPop:false,
      errText:'',
    })
  },
  //跳转到个人信息声明保护页
  goStatement(){
    // wx.navigateTo({
    //   url: '../statement/statement'
    // })
    this.setData({
      statementPop: !this.data.statementPop,
    })
  },
//触摸导航列表
  indexNav(e) {
    // console.log(e)
    console.log(e.target.dataset.index)
    this.setData({
      navInfo: e.target.dataset.index,
      navInfoShow: true
    })
    let time = setTimeout(() => {
      clearTimeout(time)
      this.setData({
        navInfoShow: false
      })
    }, 500)
  },
  //搜索框获取焦点
  searching() {
    this.setData({
      searchResultPop: true
    })
  },
  //取消搜索
  cancelSearch() {
    this.setData({
      searchResultPop: false,
      searchContent: '',
      searchResultData: []
    })
  },
  //清空输入框内容
  clearContent(e) {
    console.log(e.detail)
    e.detail = { value: '' }
  },
  //输入搜素内容，
  searchResult(e) {
    console.log(e.detail.value)
    wx.request({
      url: 'https://product.360che.com/index.php?r=weex/series/get-search-region&value=' + encodeURIComponent(e.detail.value),
      success: (res) => {
        if (res.errMsg == 'request:ok' && res.data.info == 'ok') {
          console.log(res.data, 'res.data')
          this.setData({
            searchResultData: res.data.data,
          })
          console.log(this.data.searchResultData, 'searchResultDatasearchResultData')
        }
      }
    })
  },
  //选择省份，请求城市列表
  selectProvince(e) {

    let locationInfo = e.currentTarget.dataset;
    locationInfo.cityname = '';
    locationInfo.citysn = '';
    //设置选中地区信息
    this.setData({
      locationInfo: locationInfo
    })
    console.log(this.data.locationInfo)
    //存储已选择的城市
    wx.setStorage({
      key: "locationInfo",
      data: this.data.locationInfo
    })

    console.log(this.data.locationInfo)

    wx.request({
      url: 'https://product.360che.com/index.php?r=app/series/city-list&provinceId=' + this.data.locationInfo.provincesn,
      success: (res) => {
        if (res.errMsg == 'request:ok') {
          let cityList = [];
          if (res.data !== null) {
            cityList = res.data.data
          }
          //给城市列表赋值  显示城市列表
          this.setData({
            cityList: cityList,
            cityListPop: true
          })
        }
      }
    })
    console.log(this.data.locationInfo)
  },
  //选择城市弹窗
  selectCity(e) {
    let locationInfo = this.data.locationInfo;
    locationInfo.cityname = e.currentTarget.dataset.cityname;
    locationInfo.citysn = e.currentTarget.dataset.citysn;
    this.setData({
      locationInfo: locationInfo,
      //选择城市
      cityListPop: false,
      //关闭选择地区弹层
      selectLocationPop: false,
    })

    //请求经销商数据
    this.getDealer();

    //存储已选择的城市
    wx.setStorage({
      key: "locationInfo",
      data: this.data.locationInfo
    })


    if (this.data.myRegion && this.data.myRegion.citysn == e.currentTarget.dataset.citysn) return;

    //存储常用地区
    this.storageLocation();

    //返回询底价页面
    // wx.navigateBack()
  },
  //点击搜素结果列表或者定位地区
  speedySelectLocation(e) {
    //赋值
    this.setData({
      locationInfo: e.currentTarget.dataset,
      //选择城市
      cityListPop: false,
      //关闭选择地区弹层
      selectLocationPop: false,
      //关闭搜素结果列表
      searchResultPop: false,
      //删除搜索内容
      searchContent: '',
      //清空搜索结果
      searchResultData: []
    })

    //请求经销商数据
    this.getDealer();

    //存储已选择的城市
    wx.setStorage({
      key: "locationInfo",
      data: this.data.locationInfo
    })

    //请求经销商数据
    this.getDealer();

    //返回询底价页面
    // wx.navigateBack()
  },
  //隐藏选择城市列表弹层
  cityPopHide() {
    this.setData({
      cityListPop: false
    })
  },
  showLoading: function () {
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    });
  },
  cancelLoading: function () {
    wx.hideToast();
  },
  //存储常用地区
  storageLocation() {
    wx.getStorage({
      key: 'hotLocation',
      success: (res) => {
        let data = res.data;

        let ishave = true;
        for (let i = 0; i < data.length; i++) {
          if (data[i].citysn == this.data.locationInfo.citysn && ishave) {
            ishave = false;
          }
        }
        if (ishave) {
          let number = 6;
          //如果有定位地区，那么只能存储5个，否则可以存储6个
          if (this.data.myRegion.cityname) {
            number = 5;
          }
          if (data.length >= number) {
            data.splice(0, 1);
          }
          data.push(this.data.locationInfo)
          wx.setStorage({
            key: 'hotLocation',
            data: data,
          })

          this.setData({
            hotLocation: data
          })
        }
      },
      //如果没有地区存储
      fail: () => {
        let arr = [];
        arr.push(this.data.locationInfo)
        wx.setStorage({
          key: 'hotLocation',
          data: arr,
        })
        this.setData({
          hotLocation: arr
        })
      },
    })
  },
  //打电话
  dial(e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.phone
    })
  },
  // 点击换车型弹层
  switchModelShow() {
    this.setData({
      switchModelPop: true
    })
  },
  // 关闭弹层
  back() {
    this.setData({
      switchModelPop: false
    })
  },
  //请求换车型信息
  switchModel() {
    // 请求换车型弹层
    wx.request({
      url: app.ajaxurl + 'index.php?r=weex/product/get-product-change-list&subId=' + this.data.seriesInfo.F_SubCategoryId + '&seriesId=' + this.data.seriesInfo.F_SeriesId + '&proId=' + this.data.seriesInfo.proid,
      success: ele => {
        if (ele.errMsg == 'request:ok') {
          let switchModelData = {};
          //换车型列表数据
          switchModelData.priceList = ele.data.priceList;
          //换车型标题数据
          switchModelData.attrList = ele.data.attrList

          //当前显示的是哪一个
          if (ele.data.paramName) {
            switchModelData.paramName = ele.data.paramName;
          } else {
            //判断哪一个的length最长显示哪一个
            let paramName = '';
            let has = true;
            ele.data.priceList.forEach((res, index) => {
              if (has) {
                has = false;
                paramName = ele.data.attrList[index];
                ele.data.priceList.forEach((r, i) => {
                  if (ele.data.priceList[index].list.length < ele.data.priceList[i].list.length) {
                    paramName = ele.data.attrList[i];
                  }
                })

              }
            })
            switchModelData.paramName = paramName
          }

          //更新数据
          this.setData({
            switchModelData: switchModelData
          })
        }
      }
    })
  },
  //选择换车型条件选项
  selectModelOption(e) {
    let name = e.currentTarget.dataset.name;
    let switchModelData = this.data.switchModelData;
    switchModelData.paramName = name;
    this.setData({
      switchModelData: switchModelData,
    })
  },
  // 切换车型数据
  goSwitchModel(e){
    //开启loading
    app.globalData.showLoading('正在加载');

    let productId = e.currentTarget.dataset.item.F_ProductId;

    this.setData({
      productId: productId,
      //关闭弹层
      switchModelPop: false
    })

    //请求车型信息
    this.getTruckData()

    //请求车型配置信息
    this.getConfigData();
    //请求经销商数据
    this.getDealer();
  }
})