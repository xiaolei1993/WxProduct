//index.js
var util = require('../../utils/util.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    //车型id
    productId: '16525',//
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
    errPop:false,
    errText:'',
    //换车型弹层是否显示
    switchModelPop: false,
    //换车型弹层数据
    switchModelData: {},
    //车型信息
    productInfo: {},
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
    wx.getStorage({
      key:"locationInfo",
      success:(res) => {

        //设置选中地区
        this.setData({
          locationInfo:res.data
        })
        //删除缓存
        wx.removeStorage({
          key: 'locationInfo',
        })
        //重新请求经销商数据
        this.getDealer();
      } 
    })
  },
  // 页面初始化
  onLoad: function (options) {

    //设置标题
    wx.setNavigationBarTitle({
      title: '询底价'
    })

    if(options.productId){
      this.setData({
        productId:options.productId
      })
    }
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
    
    //删除保留的选择地区
    // wx.getStorage({
    //   key:"locationInfo",
    //   success:(res) => {
        //删除缓存
        wx.removeStorage({
          key: 'locationInfo',
        })
    //   } 
    // })

    //请求车型数据
    wx.request({
      url:this.data.ajaxUrl + 'Dealer/getProductInfo.aspx?productid=' + this.data.productId,
      data:{},
      success:(res) => {
        if(res.errMsg == 'request:ok'){
          this.setData({
            truckInfo:res.data
          })
          this.switchModel();
        }
      }
    })

    //请求参数配置信息
    wx.request({
      url:'https://product.360che.com/index.php?r=api/getproparam&id=' + this.data.productId + '&isSem=1',
      data:{},
      success:(res) => {
         
        if(res.errMsg == 'request:ok'){
          this.setData({
             parameterData:res.data.data[this.data.productId]
          })
        }
      }
    })

    //调取当前所在地区
      //查看之前是否存储过
      wx.getStorage({
        key: 'myRegion',
        success: (res) => {
            // 如果存储过
            let data = res.data;
            let time = new Date().getTime()

            //获取当前时间是否大于之前存储时间的6小时 ？ 重新获取 ： 否则读取缓存数据
            if(((time - data.time)/1000/60/60) > 6){
              this.getLocation();
            }else{
              wx.getStorage({
                key: 'locationInfo',
                complete: res => {
                  if (res.data) {
                    //设置选中地区
                    this.setData({
                      locationInfo: res.data
                    })
                    //请求经销商数据
                    this.getDealer();
                  }else{
                    this.getLocation();
                  }
                },
              })
            }
        },
        fail: () => {
          this.getLocation();
        } 
      })
   
  },
   // 页面渲染完成
  onReady:() => {
    
  },
  //请求经销商数据
  getDealer(provinceId,cityId){
    console.log(this.data.locationInfo)
    wx.request({
      url:this.data.ajaxUrl + 'Dealer/getDealerList.aspx?productid=' + this.data.productId + '&provincesn=' + this.data.locationInfo.provincesn + '&citysn=' + this.data.locationInfo.citysn,
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
    // 微信获取经纬度
    wx.getLocation({
        type: 'wgs84',
        success: res => {
          
          var latitude = res.latitude;
          var longitude = res.longitude;
          
          // 获取当前位置省市
          wx.request({
            url:this.data.ajaxUrl + '/Dealer/getLocation.aspx',
            data:{},
            success:(res) => {
              if(res.errMsg == 'request:ok'){
                let myRegion = {};
                myRegion.time = new Date().getTime();
                myRegion.data = res.data;
                
                this.setData({
                   locationInfo:res.data
                })
                //请求经销商数据
                this.getDealer();

                //存储定位城市
                wx.setStorage({
                  key:"myRegion",
                  data: myRegion
                })

                //存储常用定位地区列表
                // wx.getStorage({
                //   key: 'hotLocation',
                //   success: function(res){
                //     let data = res.data;
                //     if (data[0].citysn != myRegion.data.citysn){
                //       data.shift();
                //       data.unshift(myRegion.data);
                //       wx.setStorage({
                //         key:"hotLocation",
                //         data:arr
                //       })
                //     }
                //   },
                //   fail: function() {
                //     let arr = [];
                //     arr.push(myRegion.data)
                //     wx.setStorage({
                //       key:"hotLocation",
                //       data:arr
                //     })
                //   }
                // })
              }
            }
          })
        }
      })
  },
  
  //跳转到选择地区
  goSelectLocation(){
    wx.setStorage({
      key: 'locationInfo',
      data: this.data.locationInfo,
      complete: function() {
        wx.navigateTo({
          url: '../location/location'
        })
      }
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
  importPhone(e){
    let submitData = this.data.submitData;
    submitData.tel = e.detail.value
    this.setData({
      submitData:submitData
    })
  },
  // 获取焦点
  onFocus(e) {
    let name = e.currentTarget.dataset.type;
    if (name == 'name') {
      this.setData({
        phoneFocus: false,
        nameFocus: true
      })
    } else {
      this.setData({
        phoneFocus: true,
        nameFocus: false
      })
    }
  },
  onBlur(e) {
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
    //判断是否有经销商
    if (this.data.dealerData.length){
      //如果有经销商 && 最多选择三个 || 最少选择一个
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
    //加载中
    this.showLoading();

    // console.log(submitData)
    wx.request({
      url:this.data.ajaxUrl + 'Dealer/submitClues.aspx?',
      data:submitData,
      success:(res) => {

        //隐藏加载
        this.cancelLoading()
        if(res.errMsg == 'request:ok'){
          if(res.data.isok == 1){
            wx.navigateTo({
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
    wx.navigateTo({
      url: '../statement/statement'
    })
  },
  showLoading:function(){
     wx.showToast({
      title: '加载中',
      icon: 'loading'
     });
  },
  cancelLoading:function(){
     wx.hideToast();
  },
  // 点击换车型弹层
  switchModelShow(){
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
  //请求车型信息
  getTruckData() {
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
  //请求换车型信息
  switchModel() {
    // 请求换车型弹层
    wx.request({
      url: app.ajaxurl + 'index.php?r=weex/product/get-product-change-list&subId=' + this.data.truckInfo.SubCategoryId + '&seriesId=' + this.data.truckInfo.SeriesId + '&proId=' + this.data.productId,
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
  goSwitchModel(e) {
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