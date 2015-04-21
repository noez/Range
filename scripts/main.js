/**
 * Created by fisher on 4/21/15.
 */

(function () {

    $(document).ready(function () {
        var zoom = new Zoom();

        // new range
        var range = new Range({
            from: 1,
            to : 2,
            onStateChange : function (value){
                zoom.scale(value);
            }
        });
    });




})();