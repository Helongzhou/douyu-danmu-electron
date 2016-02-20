(function() {
  'use strict';

  var http = require('http');
  var net = require('net');
  var uuid = require('node-uuid');
  var md5 = require('md5');

  angular
    .module('dm')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $interval, $mdToast, douyuMsg) {
    var authServer;
    var danmuServer = {
      ip: 'danmu.douyutv.com',
      port: 8602
    }

    angular.extend($scope, {
      roomAddr: "http://www.douyutv.com/wt55kai",
      roomInfo: {},
      getRoomInfo: getRoomInfo,
      isRoomInfoReady: false,
      messages:[]
    });

    function showMsg (text) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(text)
          .hideDelay(5000)
      );
    }

    function connDanmuServ (roomID, gid, username) {
      showMsg("连接弹幕服务器中...");
      var client = net.connect({host:danmuServer.ip, port:danmuServer.port},
        () => {
        showMsg("弹幕服务器连接成功");
        var data = "type@=loginreq/username@="+username+
                    "/password@=1234567890123456/roomid@=" + roomID + "/";
        var dataTwo = "type@=joingroup/rid@=" + roomID + "/gid@="+gid+"/";

        client.write(douyuMsg.toBytes(data));
        client.write(douyuMsg.toBytes(dataTwo));
        //keep Alive!
        $interval(function () {
          client.write(douyuMsg.toBytes("type@=keeplive/tick@=" + Date.now() + "/"));
        }, 20000);
        setInterval
      });


      client.on('data', (data) => {
        var msg = data.toString();
        var qItem = douyuMsg.parseReadable(msg);
        console.log(qItem.str);
        $scope.messages.push(qItem);
        $scope.$apply();
      });

      client.on('end', () => {
        console.error('Disconnect to Danmu server');
        showMsg("弹幕服务器连接断开");
      });

      client.on('error', () => {
        console.error('Error: Danmu server');
        showMsg("弹幕服务器连接错误");
      });
    }

    function connAuthServ (serv, roomID) {
      var authInfo = "";
      var userRegex = /\/username@=(.+)\/nickname/;
      var gidRegex = /\/gid@=(\d+)\//;
      var username;
      var gid;

      console.log('ip'+serv.ip+':'+serv.port);

      showMsg("连接弹幕认证服务器中...");
      var client = net.connect({host:serv.ip, port:serv.port},
        () => {
        showMsg("弹幕服务器认证中...");
        var time = Date.now();
        var magicString = '7oE9nPEG9xXV69phU31FYCLUagKeYtsF';
        var devID = uuid.v4().replace(/-/g, '');
        var vk = md5(time+magicString+devID);
        var dataInit = "type@=loginreq/username@=/ct@=0/password@=/roomid@="+
                    roomID+
                    "/devid@="+devID+
                    "/rt@="+Date.now()+
                    "/vk@="+vk+"/ver@=20150929/";
        var dataTwo = "type@=qrl/rid@=" + roomID + "/";
        var dataThr = "type@=keeplive/tick@=" + Date.now() +
                   "/vbw@=0/k@=19beba41da8ac2b4c7895a66cab81e23/"

        client.write(douyuMsg.toBytes(dataInit));
        client.write(douyuMsg.toBytes(dataTwo));
        client.write(douyuMsg.toBytes(dataThr));
      });

      client.on('data', (data) => {
        authInfo+=data.toString();
        console.log(authInfo);
        username = userRegex.exec(authInfo);
        gid = gidRegex.exec(authInfo);
        if ((username!==null)&&(gid!== null)){
          console.log('wrong logic');
          client.end();
        }
      });
      client.on('end', () => {
        if (username&&gid){
          connDanmuServ(roomID, gid[1], username[1]);
          showMsg("弹幕服务器认证完成");
          console.log('Auth server sucess');
        } else {
          console.log('Auth server fail');
          showMsg("弹幕服务器认证失败");
        }
        console.log('Auth server Close');
      });
    }

    function getRoomInfo () {
      var html;
      var roomRegex = /var\s\$ROOM\s=\s({.*})/;
      var authServerRegex = /server_config":"(.*)",/;

      showMsg("开始获取房间信息");
      http.get($scope.roomAddr, (res) => {
        console.log(`Got response: ${res.statusCode}`);
        var html = "";
        showMsg("获取房间信息中...");
        res.on("data", function(data) {
          html += data;
        });

        res.on('end', () => {
          var roomObj=angular.fromJson(roomRegex.exec(html)[1]);
          var serverObj=angular.fromJson(unescape(authServerRegex.exec(html)[1]));;

          authServer = serverObj[0];

          $scope.roomInfo.anchor = roomObj.owner_name;
          $scope.roomInfo.roomName = roomObj.room_name;
          $scope.roomInfo.roomID = roomObj.room_id;
          $scope.roomInfo.cate = roomObj.cate_name;

          $scope.isRoomInfoReady = true;

          connAuthServ(authServer, $scope.roomInfo.roomID);
          showMsg('获取房间信息成功!');
        });
      }).on('error', (e) => {
        showMsg('获取房间信息失败!');
      });
    }

  }
})();