// https://github.com/yourowndisaster09/feckless-broccoli

;(function(angular) {
  "use strict";

  var count = 1, names = [];
  var moduleFn = angular.module;
  angular.module = function(name, requires, configFn) {
    if (name === "ngLocale") {
      var uniqueName = "ngLocale" + count;
      names.push(uniqueName);
      count = count + 1;
      return moduleFn.call(this, uniqueName, requires, configFn);
    } else {
      return moduleFn.apply(this, arguments);
    }
  };

  angular.module("dynLocale", []);

  angular.module("dynLocale").provider("$dynamicLocale", [
    function() {
      var localesCache = {};

      this.register = function register(id, rules) {
        localesCache[id] = rules;
      };

      this.$get = [
        "$locale",
        "$rootScope",
        function($locale, $rootScope) {
          var extend = (function ext(dest, src) {
            for (var k in dest) {
              if (angular.isObject(dest[k])) {
                ext(dest[k], src[k]);
              } else {
                dest[k] = src[k];
              }
            }
          });

          return {
            set: function(id) {
              if ($locale.id !== id) {
                extend($locale, localesCache[id]);
                $rootScope.$broadcast("$dynamicLocaleChange", id);
              }
            }
          };
        }
      ];
    }
  ]);

  angular.module("dynLocale").config([
    "$dynamicLocaleProvider",
    function($dynamicLocaleProvider) {
      names.forEach(function(name) {
        var $injector = angular.injector([name]);
        var $locale = $injector.get("$locale");
        $dynamicLocaleProvider.register($locale.id, $locale);
      });
    }
  ]);

})(angular);
