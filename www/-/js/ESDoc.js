var ESDoc = {
  post: function(path, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', path);
    xhr.onload = function(res) {
      // check response text
      var responseText = res.target.responseText;
      if (!responseText) {
        callback(new Error(), null);
        return;
      }

      // check status
      if (res.target.status !== 200) {
        callback(new Error('status is not 200'), res.target.responseText);
        return;
      }

      callback(null, res.target.responseText);
    };

    xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );

    var params = null;
    if (data) {
      var temp = [];
      for (var key in data || {}) {
        temp.push(key + '=' + encodeURIComponent(data[key]));
      }
      params = temp.join('&');
    }

    xhr.send(params);
  },

  polling: function(url, timeout, callback) {
    var startTime = Date.now();

    setTimeout(function(){
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = function(res) {
        if (res.target.status === 200){
          callback(null, res.target.responseText);
        } else {
          var endTime = Date.now();
          timeout = timeout - (endTime - startTime);
          if (timeout <= 0) {
            callback(new Error('timeout'));
          } else {
            ESDoc.polling(url, timeout, callback);
          }
        }
      };

      xhr.send();
    }, 5000);
  },

  validateGitURL(url) {
    return !!url.match(/^git@github\.com:[\w\d._-]+\/[\w\d._-]+\.git$/);
  }
};

window.ESDoc = ESDoc;
