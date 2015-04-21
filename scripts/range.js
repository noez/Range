/**
 * Created by samfisher on 20/04/15.
 */

var Range = (function (window, $, undefined) {

  var
      defaults = {
        from: 1,
        to: 10,
        step: 1,
        el: '.range',
        onStateChange : function(value){}
      },
      options = {},
      $el, el, thumb, track = null,
      isTouchSupported = false,
      events = {},
      offsetX = 0,
      bound = {};

  function Range(opts) {
    // parse options
    options = $.extend({}, defaults, opts || {});

    // initialize module
    initialize();
  }

  var initialize = function () {

    // check touch support
    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
      isTouchSupported = true;
    }

    // that events should be used
    events = (isTouchSupported ? {
      start: 'touchstart',
      end: 'touchend',
      move: 'touchmove'
    } : {
      start: 'mousedown',
      end: 'mouseup',
      move: 'mousemove'
    });

    // jquery el ref
    $el = ($(options.el).length) ? $(options.el) : $(defaults.el);
    // dom el ref
    el = $el[0];

    // jquery thumb
    thumb = $el.find('.range-thumb');

    // track thumb
    track = $el.find('.range-track');

    // check bound box to clamp thumb
    bound = {
      left: track.position().left,
      right: track.width() - thumb.width()
    };

    // initialize listeners
    addListeners();

  };

  var addListeners = function () {
    thumb.on(events.start, function (evt) {
      evt.preventDefault();

      // where is the mouse respect to thumb
      offsetX = getPosition(evt).x - thumb.position().left;

      // add Listeners
      $(document).on(events.end, onEndHandler);
      $(document).on(events.move, onMoveHandler);

    });
  };

  var onEndHandler = function (evt) {
    // remove listeners
    $(document).off(events.move, onMoveHandler);
    $(document).off(events.end, onEndHandler);
  };

  var onMoveHandler = function (evt) {
    var point = getPosition(evt),
        intrinsicProportion = (options.to - options.from)
            / (bound.right - bound.left),
        thisPoint = (point.x - offsetX),
        value = (thisPoint - bound.left)
            * intrinsicProportion + options.from,
        newPoint = clamp(thisPoint, bound.left, bound.right);

    // drag thumb
    thumb.css({left: newPoint});

    // value to dispatch
    value = clamp(value, options.from, options.to);
    options.onStateChange({
      value: value,
      from : options.from,
      to: options.to });
  };

  // get mouse/touch position
  var getPosition = function (evt) {
    var posX = 0,
        posY = 0;

    if (evt.originalEvent.targetTouches) {
      posX = evt.originalEvent.targetTouches[0].pageX;
      posY = evt.originalEvent.targetTouches[0].pageY;
    } else if (evt.pageX || evt.pageY) {
      posX = evt.pageX;
      posY = evt.pageY;
    } else if (evt.clientX || evt.clientY) {
      posX = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posY = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {x: posX, y: posY};
  };

  // clamp helper
  var clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  // expose the module
  return Range;

})(window, jQuery);

