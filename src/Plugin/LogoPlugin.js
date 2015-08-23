exports.onHandleHTML = function(ev) {
  ev.data.html = ev.data.html.replace('<header>', '<header><a class="esdoc-hosting-logo" href="/">ESDoc</a>');
};
