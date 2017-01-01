window.onload = function(){
  var audioPlayer = {
    element: document.querySelectorAll('audio')[0],
    metaData: null,
    data: null
  };
  
  var utils = {
    throttle : function(cb){
      if(typeof cb === 'function')
        setTimeout(cb, 50); 
    },
    getFileName : function (uri){
      var reg = /[^/]*(?=\.)/g;
      return uri.match(reg)[0]
    },
    /**
     * 生成script标签（可解决跨域问题）
    **/
    genScript : function (){
      var head = document.getElementsByTagName('head')[0];
      var musicUri = audioPlayer.element.src;
      var musicName = utils.getFileName(musicUri);
      var script = document.createElement('script');
      script.setAttribute('type','text/lrc');
      script.setAttribute('src','/2017/'+ musicName +'.lrc');
      script.async = true;
      head.appendChild(script)
    },
    ajax : function (url){
      var xhr = new XMLHttpRequest();
      xhr.open('get', url, true);
      xhr.onreadystatechange = function (e){
        if(xhr.readyState === 4){
           if(xhr.status === 200 || xhr.status == 0){
             audioPlayer.metaData = xhr.responseText
           }
        }
      }
      xhr.send(null);
    },
    calcTimeDiff: function(){
      var data = audioPlayer.data;
      var timeDiffArr = [],
          timeDiff = null;

      for(var i = 0, len = data.length; i < len; i++){

        if(i === 0){
          timeDiff = data[0].time;
        } else {
          timeDiff = parseFloat((data[i].time - data[i-1].time).toFixed(2));
        }

        timeDiffArr.push(timeDiff)
      }
      return timeDiffArr
    }
  };

  function getLyric(){
    var musicUri = audioPlayer.element.src;
    var musicName = utils.getFileName(musicUri);
    utils.ajax('/2017/'+ musicName + '.lrc');
    utils.throttle(parseLyric)
  }
 
  function parseLyric(){
    var rows = audioPlayer.metaData.split('\n'); 
    var head,
        headTitle,
        headContent,
        headReg = /[^\[]*(?=\])/g, 
        msgs = [],
        msg;
    for(var i = 0,len = rows.length; i < len; i++){
      if (rows[i] != ''){
        msg = {};
        head = rows[i].match(headReg)[0];
        msg.content = rows[i].split(']')[1];
        headTitle = head.split(':')[0];
        headContent = head.split(':')[1];

        if(!isNaN(Number(headTitle)) && !isNaN(Number(headContent))){
          msg.time = Number(headTitle) * 60 + Number(headContent);
          msgs.push(msg)
        }
      }
    }
    audioPlayer.data = msgs
  }

  function concatDom(){
    var data = audioPlayer.data;
    var htmls = [],
        html = '';

    for(var i = 0, len = data.length; i < len; i++){
      //html = '<span>' + data[i].content + '</span>';
      html = data[i].content;
      htmls.push(html)
    }

    return htmls
  }

  function tigger(){ 
    var element = audioPlayer.element;
    var htmls = concatDom();
    var timeDiffArr = utils.calcTimeDiff();
    var timer;

    function renderDom(count){
      count = count || 0;
      if(count == timeDiffArr.length) return false;

      clearTimeout(timer);
      timer = setTimeout(function(){
        if(count > 0) {
          //element.parentNode.removeChild(element.nextElementSibling);
          element.nextElementSibling.innerHTML = '';
        }
        //element.insertAdjacentHTML('afterend', htmls[count])
        element.nextElementSibling.innerHTML = htmls[count];
        renderDom(count + 1)
      }, timeDiffArr[count] * 1000)
    }
    renderDom()
  }

  function lyricInit(){
    getLyric(); //准备好lyric数据 
    utils.throttle(tigger); //渲染前端样式
  }  

  lyricInit();

}












