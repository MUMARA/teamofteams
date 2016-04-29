/**
 * Created by Shahzad on 4/10/2015.
 */

//directive to validate userID asynchronously from server, over singup page.

(function() {
  'use strict';

  angular
    .module('core')
    .directive("checkQuestionbankExistance", checkQuestionbankExistance);

  checkQuestionbankExistance.$inject = ['firebaseService', '$q', 'appConfig'];

  function checkQuestionbankExistance(firebaseService, $q, appConfig) {
    var path;
    //hits a GET to server, to check userID availability.
    var asyncCheckQuestionBankExists = function(modelValue, b, v) {
      var defer = $q.defer();

      firebaseService.asyncCheckIfQuestionBankExists(setChild(modelValue)).then(
        function(response) {
          if (response.exists) {
            defer.reject(); // reject if group already exixts
          } else {
            defer.resolve()
          }
        });
      return defer.promise;
    };

    function setChild(modelValue) {
      if (path) {
        return path + '/' + modelValue
      } else {
        return modelValue
      }

    }
    return {

      require: "ngModel",
      link: function(scope, element, attributes, ngModel) {
         path = attributes['questionbankpath']
        ngModel.$asyncValidators.checkQuestionbankExistance =
          asyncCheckQuestionBankExists;
      }
    };
  }

})();
