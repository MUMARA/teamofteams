/**
 * Created by Shahzad on 3/31/2015.
 */

(function () {
    'use strict';

    module.exports = {
        isMissingStrings: function ( res, payload, requiredProps, minLength ) {
            minLength = minLength || 1;

            var currentProp;
            var isInValid = false;

            for ( var i = 0, len = requiredProps.length; i < len; i++ ) {
                currentProp = requiredProps[i];

                if ( !(typeof payload[currentProp] === 'string' && payload[currentProp].length >= minLength ) ) {
                    res.send({
                        statusCode: 0,
                        statusDesc: "missing or invalid " + currentProp + "."
                    });

                    isInValid = true;
                    break;
                }
            }

            return isInValid;
        }
    };

})();
