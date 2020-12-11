/**packaged by focusbe cli**/
'use strict';var img = "./static/e4d08bd543af927e.jpg";var html = "<div>\r\n  test\r\n</div>";function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}var css_248z = "body {\n  background: #f00;\n}\nbody div {\n  transform: translate(0, 0);\n  -webkit-animation-delay: 0.3s;\n          animation-delay: 0.3s;\n}\n";
styleInject(css_248z);console.log(img);
console.log(html);
console.log(css_248z);