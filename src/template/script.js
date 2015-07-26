window.addEventListener('DOMContentLoaded', function(){
  var el = document.createElement('a');
  el.className = 'esdoc-hosting-logo';
  el.textContent = 'ESDoc';
  el.href = '/';

  var headerEl = document.querySelector('header');
  headerEl.insertBefore(el, headerEl.children[0]);
});
