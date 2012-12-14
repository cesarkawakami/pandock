/*
==UserScript==
@name       Pandock: Flowdock UX fixes
@version    0.2
@description  Adds fixes to Flowdock UX, like keyboard shortcuts and a more readable UI
@match      http*://*.flowdock.com/app/*
@copyright  2012+, Cesar Kawakami
@updateURL
==/UserScript==
*/


(function() {
  var circularElementDelta, getUnsafeWindow, init, simulateMouseClick, waitForJQueryThen;

  circularElementDelta = function(list, element, delta) {
    var idx;
    idx = list.indexOf(element);
    if (idx === -1) {
      throw new RangeError("element not found in list");
    }
    return list[(idx + list.length + delta % list.length) % list.length];
  };

  simulateMouseClick = function(element) {
    var evt;
    evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, true);
    return element.dispatchEvent(evt);
  };

  init = function($, window) {
    var AnnoyingWarningAnnihilator, CodeHighlighter, KeyboardMagic, TabHighlighter, cls, _i, _len, _ref, _results;
    TabHighlighter = (function() {

      function TabHighlighter() {}

      TabHighlighter.prototype.updateTabHighlight = function() {
        return $("#tab-bar li").css("border-bottom", "").has(".current").css("border-bottom", "5px solid #666");
      };

      TabHighlighter.prototype.init = function() {
        return window.setInterval(this.updateTabHighlight, 200);
      };

      return TabHighlighter;

    })();
    KeyboardMagic = (function() {

      function KeyboardMagic() {}

      KeyboardMagic.prototype.init = function() {
        return $("body").on("keydown", function(evt) {
          var currentTab, delta, existingTabs, nextTab, nextTabElement, tabElements, x, _ref;
          if (evt.which === 222 && evt.ctrlKey) {
            if ($(".chat-input:focus").length > 0 && $("#search [contenteditable]").length > 0) {
              $("#search [contenteditable]").focus();
            } else {
              $(".chat-input").focus();
            }
          }
          if (((_ref = evt.which) === 188 || _ref === 190) && evt.ctrlKey) {
            delta = evt.which === 188 ? -1 : 1;
            tabElements = $("#tab-bar li.tabs-reorderable a.tab");
            existingTabs = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = tabElements.length; _i < _len; _i++) {
                x = tabElements[_i];
                _results.push($(x).attr("href"));
              }
              return _results;
            })();
            currentTab = tabElements.filter(".current").attr("href");
            nextTab = circularElementDelta(existingTabs, currentTab, delta);
            nextTabElement = ((function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = tabElements.length; _i < _len; _i++) {
                x = tabElements[_i];
                if ($(x).attr("href") === nextTab) {
                  _results.push(x);
                }
              }
              return _results;
            })())[0];
            return simulateMouseClick(nextTabElement);
          }
        });
      };

      return KeyboardMagic;

    })();
    AnnoyingWarningAnnihilator = (function() {

      function AnnoyingWarningAnnihilator() {}

      AnnoyingWarningAnnihilator.prototype.annihilate = function() {
        return $(".error").filter(function() {
          return /A New Desktop App Available/.exec($(this).html());
        }).remove();
      };

      AnnoyingWarningAnnihilator.prototype.init = function() {
        return window.setInterval(this.annihilate, 200);
      };

      return AnnoyingWarningAnnihilator;

    })();
    CodeHighlighter = (function() {

      function CodeHighlighter() {}

      CodeHighlighter.prototype.prettify = function() {
        var el, _i, _len, _ref, _results;
        if (window.prettyPrintOne != null) {
          _ref = $("pre > code").not(".prettyprinted");
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            el = _ref[_i];
            _results.push($(el).html(prettyPrintOne($(el).html())).addClass("prettyprinted").css("font-size", "90%"));
          }
          return _results;
        }
      };

      CodeHighlighter.prototype.init = function() {
        $("<link rel=stylesheet href=//cdn.jsdelivr.net/prettify/0.1/prettify.css>").appendTo($("head"));
        $("<script src=//cdnjs.cloudflare.com/ajax/libs/prettify/188.0.0/prettify.js>").appendTo($("body"));
        return setInterval(this.prettify, 1000);
      };

      return CodeHighlighter;

    })();
    _ref = [KeyboardMagic, AnnoyingWarningAnnihilator, CodeHighlighter];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cls = _ref[_i];
      _results.push((new cls).init());
    }
    return _results;
  };

  getUnsafeWindow = function() {
    var el;
    el = document.createElement("p");
    el.setAttribute("onclick", "return window;");
    return el.onclick();
  };

  waitForJQueryThen = function(callback) {
    var unsafeWindow;
    unsafeWindow = getUnsafeWindow();
    if (unsafeWindow.$ != null) {
      return callback(unsafeWindow.$, unsafeWindow);
    } else {
      return window.setTimeout((function() {
        return waitForJQueryThen(callback);
      }), 500);
    }
  };

  waitForJQueryThen(init);

}).call(this);
