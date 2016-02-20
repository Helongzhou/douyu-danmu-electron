(function() {
  'use strict';

  angular.module('dm')
    .factory('douyuMsg', douyuMsg);

  function douyuMsg() {

    var service = {
      toBytes: toBytes,
      parseReadable: parseReadable
    };

    return service;

    function parseReadable (rawData) {
      var item = {};

      if (rawData.indexOf('chatmessage') > -1) {
        item.type = 'msg';
        item.userName = /\/snick@=(.+?)\//.exec(rawData)[1]; 
        item.content = /\/content@=(.+?)\//.exec(rawData)[1];

        item.str = item.userName + ': ' + item.content;
      } else if (rawData.indexOf('userenter') > -1) {
        item.type = 'userEnter';
        item.userName = /nick@A=(.+?)@/.exec(rawData)[1];

        item.str = item.userName + ' 进入直播间';
      } else if (rawData.indexOf('dgn') > -1) {
        /*************************
        **gfid  name
        *   57  Zan
        */
        item.type = 'gift';
        item.userName = /\/src_ncnm@=(.+?)\//.exec(rawData)[1];
        item.hits = /\/hits@=(.+?)\//.exec(rawData)[1];

        item.str = item.userName + '赠送礼物 x' + item.hits;
      } else {
        console.log(rawData);
        /********************
        * Known unknown data
        * type@=spbc/sn@=点赞哥/dn@=環妹你好/gn@=火箭/gc@=1/drid@=170587/gs@=6/gb@=1/es@=1/gfid@=59/eid@=7/rid@=20360/gid@=74/
        */
        item.type = 'unknown';
        item.str = 'unknown';

      }

      return item;
    }

    function toBytes(content) {
      var length = [content.length + 9, 0x00, 0x00, 0x00];
      var magic = [0xb1, 0x02, 0x00, 0x00];
      var ending = [0x00];
      var contentArr = [];

      for (var i = 0; i < content.length; ++i) {
        contentArr.push(content.charCodeAt(i));
      }

      var msg = length.concat(length, magic, contentArr, ending);
      var buf = new Buffer(msg);

      return buf;
    }
  }
})();
