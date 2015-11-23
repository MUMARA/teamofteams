/**
 * Created by ZiaKhan on 07/01/15.
 */

'use strict';

angular.module('core')
    .factory('utilService',['$q',function($q) {
        return {
            trim: function(str, characters) {
                var c_array = characters.split('');
                var result  = '';

                for (var i=0; i < characters.length; i++)
                    result += '\\' + c_array[i];

                return str.replace(new RegExp('^[' + result + ']+|['+ result +']+$', 'g'), '');
            },
            trimID: function(str) {
                return this.trim(str, "/");
            },
            base64ToBlob:function(base64){
                console.log(base64.split(',')[0])
                var blobBin = atob(base64.split(',')[1]);
                var array = [];
                for (var i = 0; i < blobBin.length; i++) {
                    array.push(blobBin.charCodeAt(i));
                }

                return new Blob([new Uint8Array(array)], {type: 'image/png'});
            }
        };
    }]);
