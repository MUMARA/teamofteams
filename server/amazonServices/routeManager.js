/**
 * Created with JetBrains WebStorm.
 * User: Khurram
 * Date: 12/8/14
 * Time: 2:02 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

var preFix = '/';
var amazonServiceRoutes = [

    "./profilePictureManager/routes"
];


module.exports.setupRoutes = function(app) {

    amazonServiceRoutes.forEach(function(route) {

        var apiFile = require(route);

        apiFile.config.forEach(function(api) {


            var routePath = preFix + api.url;

            app[api.httpVerb](routePath, apiCall);

            function apiCall(req, res, next) {
                var handler = apiFile[api.method];

                var params = api.params.map(function(param) {
                    return req.params[param];
                });

                handler.apply(api, [req, res, next, req].concat(params));
            }

        });
    });
};
