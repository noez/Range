/**
 * Created by fisher on 4/21/15.
 */

var Zoom = (function (window, $, undefine) {
    var
        defaults = {
            el: '.zoom'
        },
        options = {},
        events = {},
        bound = {},
        imageRect = {},
        isTouchSupported = false,
        $el = null,
        $zoom_image = null,
        $zoom_mask = null,

        vector_capture_init = Vec2D.ObjectVector(0,0),
        vector_capture_current = Vec2D.ObjectVector(0,0),
        vector_image_init = Vec2D.ObjectVector(0,0),
        vector_image_dest = Vec2D.ObjectVector(0,0);


    function Zoom(opts) {
        // parse options
        options = $.extend({}, defaults, opts || {});

        // initialize module
        initialize();
    }

    // set scale range
    Zoom.prototype.scale = function (range) {

        var newWidth = clamp(range.value * imageRect.width,
                imageRect.width,imageRect.width * range.to),
            newHeight = newWidth * imageRect.height / imageRect.width;

        $zoom_image.css({
            width : newWidth,
            heigth : newHeight
        });
    };

    var initialize = function () {
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

        // jq zoom image
        $zoom_image = $el.find('.zoom-image');

        // jq zoom mask
        $zoom_mask = $el.find('.zoom-mask');

        // get image zoom rect
        imageRect = $zoom_image[0].getBoundingClientRect();


        vector_image_init.setAxes(imageRect.left, imageRect.top);

        // initalize listeners
        addListeners();
    };

    var addListeners = function () {
        $zoom_image.on(events.start, function (evt) {
            // prevent scroll
            this.allowUp = (this.scrollTop > 0);
            this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
            this.prevTop = null; this.prevBot = null;
            this.lastY = event.pageY;

            vector_capture_init.setAxes(getPosition(evt).x, getPosition(evt).y);
            // add listeners to document
            $(document).on(events.end, onEndHandler);
            $(document).on(events.move, onMoveHandler);
            $zoom_image.on('dragstart', function(event) { event.preventDefault(); });

        });
    };

    var onEndHandler = function (evt) {
        $('html').removeClass('disable-selection');
        // remove listeners
        $(document).off(events.move, onMoveHandler);
        $(document).off(events.end, onEndHandler);

    };

    var onMoveHandler = function (evt) {
        var up = (event.pageY > this.lastY), down = !up;
        this.lastY = event.pageY;

        if ((up && this.allowUp) || (down && this.allowDown)) event.stopPropagation();
        else event.preventDefault();

        var capture = getPosition(evt);

        bound = {
            top : $zoom_mask.outerHeight() - $zoom_image.height(),
            left : $zoom_mask.outerWidth() - $zoom_image.width(),
            right: 0,
            bottom: 0
        };

        $('html').addClass('disable-selection');

        vector_capture_current.setAxes(capture.x, capture.y);

        var dx = vector_capture_current.x - vector_capture_init.x,
            dy = vector_capture_current.y - vector_capture_init.y,
            newX = clamp(vector_image_init.x + dx , bound.left, bound.right),
            newY = clamp(vector_image_init.y + dy , bound.top, bound.bottom);

        vector_image_dest.setAxes(newX, newY);

        $zoom_image.css({
            left : vector_image_dest.x,
            top : vector_image_dest.y
        });

        vector_capture_init.setAxes(vector_capture_current.x , vector_capture_current.y);
        vector_image_init.setAxes(vector_image_dest.x, vector_image_dest.y);


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

    return Zoom;
})(window, jQuery);

