/**
 * Item Name  : 
 *Creator         :cc
 *Email            :cc
 *Created Date:2016.10.12
 *@pararm     :
 */
(function($, window) {
  function diyBdMap(opts) {
    this.id = opts.id;
    this.newTools = null;
    //登录用户标识
    this.ret = null;

    //点击的区
    this.s_ = null;

    //区监控层计时器
    this._jk_timer = null;
    //区的最佳视角
    this._jk_view = true;

    //------------------追踪
    this.t_outBtn = null;
    //追踪的定时器
    this._trail_timer = null;
    //追踪的marker容器
    this._trail_marker = null;



    //景区模拟数据
    this.s_data = {
      ScenicCompany: [
        { "id": 1, "name": "长河工业园", "lng": 116.285261, "lat": 39.945698, "bikeQuantity": 2 },
        { "id": 2, "name": "盛大集团", "lng": 116.49568, "lat": 39.984186, "bikeQuantity": 3 },
        { "id": 3, "name": "百搭市场", "lng": 116.43129, "lat": 39.901873, "bikeQuantity": 2 },
      ],
      ret: 1,
    };

    //各个景区下的数据
    this.s1_data = {
      bikes: [
        { "id": 4, "position": { "lng": 116.364384, "lat": 39.980178, } },
        { "id": 5, "position": { "lng": 116.377679, "lat": 39.97675, } },
      ]
    };

    this.s2_data = {
      bikes: [
        { "id": 6, "position": { "lng": 116.485422, "lat": 39.952183, } },
        { "id": 7, "position": { "lng": 116.486787, "lat": 39.950178, } },
        { "id": 8, "position": { "lng": 116.482278, "lat": 39.952224, } },
      ]
    };

    this.s3_data = {
      bikes: [
        { "id": 9, "position": { "lng": 116.409551, "lat": 39.908896, } },
        { "id": 10, "position": { "lng": 116.407674, "lat": 39.909352, } },
      ]
    };

    this.s_bikeData = [this.s1_data, this.s2_data, this.s3_data];
  };
  diyBdMap.prototype = {
    //面向对象初始化
    init: function() {
      var me = this;
      me.init_Baner(); //开启控件
      setTimeout(function() {
        me.init_event();
      }, 500);
    },
    //控件默认初始化
    init_Baner: function() {
      var me = this;
      var map = me.map = new AMap.Map(me.id,{
        // mapStyle:'dark',
        // features:[]
      }); 

      // map.centerAndZoom(new BMap.Point(116.404, 39.915), 12); 
      map.setZoomAndCenter(11, [116.404, 39.915]);
    },

    init_event: function() {
      var me = this;
      me.scenic_bind();
      me.scenic();
    },
    //景区
    scenic: function() {
      var me = this;
      me.s_ajax();
    },
    scenic_bind: function() {
      var me = this;
      var fn = {
        //请求回景点数据
        s_ajax: function() {
          var me = this;
          //API.baidu.scenic().done(function (data) {
          //    me.ret = data.ret;
          //    me.map.clearOverlays();
          //    if(data.ret==1){
          //        me.s_draw(data.ScenicCompany);
          //    }
          //    else if(data.ret==2){
          //
          //    }
          //});

          var data = me.s_data;
          me.ret = data.ret;
          // 渲染数据之前先要清除数据
          if (data.ret == 1) {
            me.map.clearMap();
            me.s_draw(data.ScenicCompany);
          }
        },
        //---------------------------------------------------------------市监控
        s_draw: function(data) {
          var me = this;
          if (me.ret == 1) {
            data.forEach(function(item) {
              // var convertData = me.convertCoord({ 'lng': item.lng, 'lat': item.lat });
              var marker = new AMap.Marker({
                icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                position: [item.lng, item.lat]
              });
              marker.setMap(me.map);
              marker.id = item.id;
              marker.name = item.name;
              marker.bikeQuantity = item.bikeQuantity;

              // 添加点击事件
              marker.on('click', function() {
                me.s_out();
                me.s_click(marker);
              });
              // 给marker设置label
              me.s_label(marker);
            });
            // 最优视角
            me.map.setFitView();

          }

        },
        //区的信息框
        s_label: function(marker) {
          var me = this;
          // 自定义点标记内容
          var markerContent = document.createElement("div");
          markerContent.className = "P_div";
          // 点标记中的图标
          var markerImg = document.createElement("img");
          markerImg.className = "markerlnglat";
          markerImg.src = "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png";
          markerContent.appendChild(markerImg);

          // 标记中的信息框
          var markerDIV = document.createElement("div");
          markerDIV.className = 'markLabel';
          markerDIV.innerHTML = '<span class="labelName" id="devName">景区名称：' + marker.name +
            '<br />' +
            '<span class="" id="devReceive" >自行车：' + marker.bikeQuantity + '</span>' +
            '<br />' +
            '</span>' +
            '<div class="labelArrow"></div>';
          markerContent.appendChild(markerDIV);

          marker.setContent(markerContent); //更新点标记内容
        },
        //区的点击事件
        s_click: function(marker) {

          // 记录下当前点击的景区marker
          me.s_ = marker;
          var data = null;
          if (marker.id == 1) {
            data = me.s1_data;
          } else if (marker.id == 2) {
            data = me.s2_data;
          } else if (marker.id == 3) {
            data = me.s3_data;
          }

          me.map.clearMap();
          // 区下面的监控层数据
          me.s_jk_draw(data.bikes);
          // 初始设置为true ，第一次进行视角最优化，接下来关闭
          me._jk_view = false;
          me._jk_timer = setTimeout(function() {
            me.s_click(marker);
          }, 2000);

          // 数据驱动
          data.bikes.forEach(function(item) {
            item.position.lng = item.position.lng + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
            item.position.lat = item.position.lat + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
          });

        },
        //------------------------------------------------------------------区监控数据
        s_jk_draw: function(data) {
          var me = this;
          data.forEach(function(item) {

            var marker = new AMap.Marker({
              position: [item.position.lng, item.position.lat],
              title: 'ID号:' + item.id,
              icon: new AMap.Icon({
                size: new AMap.Size(54, 46), //图标大小
                // imageSize:new AMap.Size(54, 46),
                image: "./images/car_online.png",
                // imageOffset: new AMap.Pixel(5, 5)
              })
            });

            // me.map.addOverlay(marker);
            marker.setMap(me.map);

            // 绑定marker的id
            marker.id = item.id;
            // 追踪模式
            marker.on('click', function(e) {
              var event = e || window.e;
              if (event && event.stopPropagation) {
                event.stopPropagation();
              } else {
                event.cancelBubble = true;
              }
              clearTimeout(me._jk_timer);
              // 退出到区的监控层
              me._trail_out();
              me.map.clearMap();
              me._trail(marker);
            });
          });
          if (me._jk_view) {
            // me.map.setViewport(geoPoints);
            me.map.setFitView();
          }
        },
        //退出到市监控层
        s_out: function() {

          var me = this;
          $('#p_btn').show();
          $('#p_btn').html('返回区监控');
          $('#p_btn').unbind().on('click', function() {
            clearTimeout(me._jk_timer);
            me.map.clearMap();
            $('#p_btn').hide();
            me._jk_view = true;
            me.s_ajax();
          });
        },
        //-------------------------------------------------------------------追踪
        _trail: function(marker) {
          //var opts = {
          //    bikeId:marker.id
          //};
          //API.baidu.b_trail(opts).done(function (data) {
          //    me.t_draw(data.bike);
          //    me.t_timer = setTimeout(function () {
          //        me.t_pContainer  = [];
          //        me.b_trail(marker);
          //    },2000);
          //});
          var data = {
            bike: {}
          };
          me.s_bikeData.forEach(function(item) {
            item.bikes.forEach(function(b_data) {
              if (b_data.id == marker.id) {
                data.bike = b_data;
                return;
              }
            })
          });
          // 拿到渲染数据
          me._trail_draw(data.bike);

          me._trail_timer = setTimeout(function() {
            me._trail(marker);
          }, 2000);


          data.bike.position.lng = data.bike.position.lng + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
          data.bike.position.lat = data.bike.position.lat + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
        },
        // 追踪渲染
        _trail_draw: function(item) {
          var me = this;
          if (me._trail_marker == null) {

            var marker = me._trail_marker = new AMap.Marker({
              position: [item.position.lng, item.position.lat],
              title: 'ID号:' + item.id,
              icon: new AMap.Icon({
                size: new AMap.Size(54, 46), //图标大小
                // imageSize:new AMap.Size(54, 46),
                image: "./images/car_online.png",
                // imageOffset: new AMap.Pixel(5, 5)
              })
            });

            // me.map.addOverlay(marker);
            marker.setMap(me.map);
            marker.setOffset(new AMap.Pixel(-15, -48));

          } else {
            var newPoint = [item.position.lng, item.position.lat];
            var oldP = me._trail_marker.getPosition();
            var oldPoint = [oldP.lng, oldP.lat];

            me._trail_line([oldPoint, newPoint], {});
            me._trail_marker.setPosition(newPoint); //移动到新的数据点上
          }
          me.map.setFitView([me._trail_marker]);
        },
        //退出追踪层，进入区下面的监控层
        _trail_out: function() {
          var me = this;
          $('#p_btn').html('退出追踪');
          $('#p_btn').unbind().on('click', function() {
            clearTimeout(me._trail_timer);
            me.map.clearMap();
            $('#p_btn').hide();
            // 区下面的监控层的最优视角开启
            me._jk_view = true;

            me._trail_marker = null;
            me.s_out();
            // 进入当前记录下的区的marker，然后进入区下的监控
            me.s_click(me.s_);
          });
        },
        //追踪的线
        _trail_line: function(points, opts) {
          var me = this;
          var polyLine = new AMap.Polyline({
            path: points,
            strokeColor: (opts.color || "#21536d"),
            strokeWeight: (opts.weight || 4),
            strokeOpacity: (opts.opacity || 0.8)
          });
          polyLine.setMap(me.map);
        },
      };
      for (k in fn) {
        me[k] = fn[k];
      };
    },




    //景区的数据，渲染数据
    hall_ajaxBackData: function() {
      var me = this;
      me.clearPointer();

      API.baidu.scenic().done(function(data) {
        console.log(data)
      });
      //me.hall_makePointer(me.hallData);


    },
    //地图清除点
    clearPointer: function() {
      var me = this;
      var allOverlay = me.map.getOverlays();
      for (var i = 0; i < allOverlay.length; i++) {
        me.map.removeOverlay(allOverlay[i]);
      };
    },
    //景区生成地图点
    hall_makePointer: function(data) {

      var me = this;

      var geoPoints = [];

      var convertData = me.convertCoord({ 'lng': data.lng, 'lat': data.lat });
      var pt = new BMap.Point(convertData.lng, convertData.lat);
      geoPoints.push(pt);

      var iconPath = "../images/icon/car_online";
      var myIcon = new BMap.Icon(iconPath, new BMap.Size(15, 15));
      var marker = new BMap.Marker(pt, { icon: myIcon });

      me.map.addOverlay(marker);
      me.map.setViewport(geoPoints);

      me.map.enableScrollWheelZoom(); //缩放功能开启
    },
    //楼------预案信息弹出
    hall_planShow: function(data) {
      var me = this;
      layer.open({
        type: 2,
        title: '预案文档',
        offset: 'rb',
        area: 'auto',
        maxmin: true,
        closeBtn: 0,
        shade: 0,
        zIndex: 500,
        shadeClose: false, //点击遮罩关闭
        content: data,
      });
    },

    //两大按钮的事件函数
    event: function() {
      var me = this;
      me.manage_carsEvent();
      me.device_event();
    },

    //人车管理得点击事件
    manage_carsEvent: function() {
      var me = this;
      me.cars = $('#dom_rcc');
      me.cars.click(function() {
        //鼠标没有点----出现点及围栏
        if (me.cars.attr('click_key') == undefined) {
          $(this).animate({ 'width': '90px', 'fontSize': '18px' })
            .css({ 'backgroundColor': '#21536d', color: 'white' }, 50);

          me.cars.attr('click_key', true);
          me.manage_ajaxCarsData();
        } else {
          $(this).animate({ 'width': '72px', 'fontSize': '14px' })
            .css({ 'backgroundColor': 'white', color: '#21536d' }, 50);

          me.cars.attr('click_key', null);
          clearTimeout(me.carsTimer);
          me.manage_clearCarsData();
        };
      });

      if (me.closeBtnKey) {
        me.cars.click();
      }
    },
    //请求回人车的数据
    manage_ajaxCarsData: function() {
      var me = this;

      //var asd = [{
      //    position:{lng:4545,lat:45454},
      //    carNum:000,
      //    phone:000,
      //    name:4545,
      //}];
      getDevice.hall_carsMansData().done(function(data) {
        me.manage_clearCarsData();
        var carsData = data.manCars;
        me.manage_darwCarsData(carsData);
        me.carsViews = false;
        me.carsTimer = setTimeout(function() {
          me.manage_ajaxCarsData();
        }, 2000);
      });

    },
    //所有的数据进行打点--最佳视角
    manage_darwCarsData: function(data) {
      var me = this;
      for (var i = 0; i < data.length; i++) {
        var iconPath = '';
        if (data[i].type == 1) {
          iconPath = "../images/car_online.png";
        } else {
          iconPath = "../images/view_man.png";
        }

        var convertData = me.convertCoord({ 'lng': data[i].position.lng, 'lat': data[i].position.lat });
        var pt = new BMap.Point(convertData.lng, convertData.lat);

        if (me.carsViews) {
          me.carsPointers.push(pt);
        }
        var myIcon = new BMap.Icon(iconPath, new BMap.Size(54, 46));
        var marker = new BMap.Marker(pt, { icon: myIcon });

        marker.id = data[i].id;
        me.manage_clickCarsEvent(marker);


        if (data[i].type == 1) {
          marker.setTitle('车牌号：' + data[i].carNum + '; 电话：' + data[i].phone);
        } else {
          marker.setTitle('联系人：' + data[i].name + '; 电话：' + data[i].phone);
        }
        me.map.addOverlay(marker);
        me.carsMarkers.push(marker);
      };

      if (me.carsViews) {
        me.map.setViewport(me.carsPointers);
      }

    },
    //清除所有人车的的数据
    manage_clearCarsData: function() {
      var me = this;
      var allOverlay = me.carsMarkers;
      for (var i = 0; i < allOverlay.length; i++) {
        me.map.removeOverlay(allOverlay[i]);
      };
      me.carsMarkers = [];
    },
    //每个人车的点击事件
    manage_clickCarsEvent: function(dom) {
      var me = this;
      dom.onclick = function() {
        if (me.carsClickKey) {
          me.carsClickKey = false;

          //清除人车的定时器和点
          clearTimeout(me.carsTimer);
          me.manage_clearCarsData();

          //清除两大功能按钮
          me.map.removeControl(me.newBtns_two);

          //添加退出追踪按钮
          me.newBtns_closeMonitor = new fc.module.diyBdMapTools({
            bdMap: me.map,
            mode: true,
            btns: ['退出追踪tcz'],
            anchor: BMAP_ANCHOR_TOP_LEFT,
            offset: new BMap.Size(10, 10),
          });
          me.map.addControl(me.newBtns_closeMonitor);
          me.manage_closeMonitor();

          var opts = { manCarId: dom.id };

          me.manage_ajaxOneCarData(opts);
        }
      };

    },
    //请求回单个设备的人车的数据
    manage_ajaxOneCarData: function(opts) {
      var me = this;
      getDevice.hall_oneCarsMansData(opts).done(function(data) {
        var carsData = data.manCar;
        me.oneCarsPointers = [];
        me.manage_darwOneCarsData([carsData]);
        me.onecarsTimer = setTimeout(function() {
          me.manage_ajaxOneCarData(opts);
        }, 2000);
      });

    },
    //单个设备的打点和移动
    manage_darwOneCarsData: function(data) {
      var me = this;
      if (me.oneCar == null) {
        //打点打label
        for (var i = 0; i < data.length; i++) {
          var iconPath = '';
          if (data[i].type == 1) {
            iconPath = "../images/car_online.png";
          } else {
            iconPath = "../images/view_man.png";
          }

          var convertData = me.convertCoord({ 'lng': data[i].position.lng, 'lat': data[i].position.lat });
          var pt = new BMap.Point(convertData.lng, convertData.lat);

          me.oneCarsPointers.push(pt);

          var myIcon = new BMap.Icon(iconPath, new BMap.Size(54, 46));
          var marker = me.oneCar = new BMap.Marker(pt, { icon: myIcon });
          marker.setOffset(new BMap.Size(6, -22)); //设置marker偏移以和点对上

          //label信息--设置
          var labelInfo = '<div class="markLabel">' +
            '<span class="labelName" id="devName">车牌号：' + data[i].carNum +
            '<br />' +
            '<span class="" id="devReceive" >速度：' + data[i].position.speed + "km/h</span>" +
            '<br />' +
            '</span>' +
            '<div class="labelArrow"></div>' +
            '</div>';
          var label = new BMap.Label(labelInfo, { offset: new BMap.Size(-35, -48) });
          label.setStyle({
            'backgroundColor': 'transparent',
            'border': 'none'
          });
          marker.setLabel(label);

          marker.lableInstance = label;

          if (data[i].type == 1) {
            marker.setTitle('车牌号：' + data[i].carNum + '; 电话：' + data[i].phone);
          } else {
            marker.setTitle('联系人：' + data[i].name + '; 电话：' + data[i].phone);
          }
          me.map.addOverlay(marker);
        };
      } else {
        for (var j = 0; j < data.length; j++) {
          var convertData = me.convertCoord({ 'lng': data[j].position.lng, 'lat': data[j].position.lat });
          var newPoint = new BMap.Point(convertData.lng, convertData.lat);

          me.oneCarsPointers.push(newPoint);

          var oldPoint = me.oneCar.getPosition();
          me.addPolyLine([oldPoint, newPoint], {});
          me.oneCar.setPosition(newPoint); //移动到新的数据点上

          $('#devReceive').html('速度：' + data[j].position.speed + 'km/h');
        }
      }
      me.map.setViewport(me.oneCarsPointers);
    },
    //退出追踪的事件
    manage_closeMonitor: function() {
      var me = this;
      me.btn_closeMonitor = $('#dom_tcz');
      me.btn_closeMonitor.click(function() {
        me.closeBtnKey = true;
        me.map.removeControl(me.newBtns_closeMonitor);
        clearTimeout(me.onecarsTimer); //清除单个设备的定时器
        me.map.clearOverlays();
        me.carsViews = true; //开启最佳视角
        me.carsClickKey = true; //回归没有点击DOME，没有信息框，有点击事件可以点击
        me.oneCar = null; //回归单个设备容器还没有收集marker
        me.init(me.row); //全部设备渲染

      });
    },

    //周边力量
    device_event: function() {
      var me = this;
      me.zll = $('#dom_zll')
      me.zll.click(function() {
        if (me.zll.attr('click_key') == undefined) {
          $(this).animate({ 'width': '90px', 'fontSize': '18px' })
            .css({ 'backgroundColor': '#21536d', color: 'white' }, 50);

          me.zll.attr('click_key', true);
          me.device_range();
        } else {
          $(this).animate({ 'width': '72px', 'fontSize': '14px' })
            .css({ 'backgroundColor': 'white', color: '#21536d' }, 50);
          me.zll.attr('click_key', null);

          layer.close(me.layerIndex);
          me.device_rangeClear();
          me.device_devsClear();

        };
      });
    },
    //所有消防栓的范围
    device_range: function() {
      var me = this;
      var r = me.circle ? me.circle.getRadius() : 100;
      var convertData = me.convertCoord({ 'lng': me.hallData.lng, 'lat': me.hallData.lat });
      me.circle = circle = new BMap.Circle(new BMap.Point(convertData.lng, convertData.lat), r, { strokeColor: "red", strokeWeight: 1, fillOpacity: 0.1, fillColor: 'red' });
      me.map.addOverlay(circle);
      me.rangeMarkers.push(circle);

      //弹窗信息
      me.layerIndex = layer.open({
        type: 1,
        title: '消防栓信息',
        offset: ['55px', '10px'],
        area: 'auto',
        shade: 0,
        zIndex: 400,
        closeBtn: 0,
        shadeClose: false, //点击遮罩关闭
        content: '<div id = "manForFire">' +
          '<div class="Fire_info">楼宇联系人：' + me.manForFire + '</div>' +
          '<div class="Fire_info">联系人电话：' + me.phoneForFire + '</div>' +
          '</div>' +
          '<ul id = "devUl" style="width: auto"></ul>',
      });

      //初始化的时候就进行一次请求
      var opts = {
        center: [me.hallData.lng, me.hallData.lat],
        radius: me.circle.getRadius(),
      };
      me.device_mouseout(opts);

      circle.addEventListener('mouseover', function() {
        me.circle.enableEditing();
      });
      circle.addEventListener('mouseout', function() {
        me.circle.disableEditing();
        if (me.rangeMarkers.length) {
          me.device_mouseout(opts);
        }
      });



    },
    //清除圆圈的时候就把装圆的容器清空
    device_rangeClear: function() {
      var me = this;
      var allOverlay = me.rangeMarkers;
      for (var i = 0; i < allOverlay.length; i++) {
        me.map.removeOverlay(allOverlay[i]);
      };
      me.rangeMarkers = [];
    },
    device_mouseout: function(opts) {
      var me = this;
      //信息框--信息为空

      getDevice.hall_fireplugData(opts).done(function(data) {
        $('#devUl').html('');
        me.device_devsClear();
        me.device_drawDevsData(data.device);
      });

    },
    //消防栓打点
    device_drawDevsData: function(data) {
      var me = this;
      for (var i = 0; i < data.length; i++) {
        var iconPath = '../images/dev.png';
        var convertData = me.convertCoord({ 'lng': data[i].lng, 'lat': data[i].lat });
        var pt = new BMap.Point(convertData.lng, convertData.lat);
        var myIcon = new BMap.Icon(iconPath, new BMap.Size(30, 30));
        var marker = new BMap.Marker(pt, { icon: myIcon });
        marker.setTitle('名称：' + data[i].name);
        me.map.addOverlay(marker);
        me.devsMarkers.push(marker);

        $('#devUl').append(
          '<li class="dev_info">' +
          '<span>名称：' + data[i].name + '</span>' +
          '<span class="info_wp">水压：' + data[i].waterPress + '</span>' +
          '<span class="info_t">最后通信时间：' + formatterDateDay(data[i].lastTime) + '</span>' +
          '</li>'
        );
      };
    },
    //清除所有消防栓
    device_devsClear: function() {
      var me = this;
      var allOverlay = me.devsMarkers;
      for (var i = 0; i < allOverlay.length; i++) {
        me.map.removeOverlay(allOverlay[i]);
      };
      me.devsMarkers = [];
    },

    //添加折线
    addPolyLine: function(points, opts) {
      var me = this;
      var polyLine = new BMap.Polyline(points, {
        strokeColor: (opts.color || "#21536d"),
        strokeWeight: (opts.weight || 4),
        strokeOpacity: (opts.opacity || 0.8)
      });
      me.map.addOverlay(polyLine);
    },
    convertCoord: function(oLnglat) {
      var me = this;
      var lnglat = {};
      var corG = convertWgsToGcj02(oLnglat.lng, oLnglat.lat);
      if (corG != false) {
        var corP = convertGcj02ToBd09(corG.longitude, corG.latitude);
        lnglat = { lng: corP.longitude, lat: corP.latitude };
      } else {
        lnglat = oLnglat;
      }
      return lnglat;
    },

  };
  window["diyBdMap"] = diyBdMap;
})(jQuery, window);
