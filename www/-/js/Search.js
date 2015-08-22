window.ESDoc = window.ESDoc || {};

window.ESDoc.search = function(keyword, callback) {
  var xhr = new XMLHttpRequest();
  keyword = encodeURIComponent(keyword);
  xhr.open('GET', '/api/search?keyword=' + keyword);
  xhr.onload = function(ev) {
    // check response text
    var responseText = ev.target.responseText;
    if (!responseText) {
      callback(new Error(), null);
      return;
    }

    // check status
    if (ev.target.status !== 200) {
      callback(new Error('status is not 200'), ev.target.responseText);
      return;
    }

    var result = JSON.parse(ev.target.responseText);

    if (!result.success) {
      callback(new Error(result.message), ev.target.responseText);
      return;
    }

    callback(null, result);
  };

  xhr.send();
};
