(function(){
/*jshint multistr: true */
angular.module( 'sunshine.global_utils', [])

// Global Index of Records specific HTML Templates
.run(['$templateCache', function($templateCache) {
  //spinner when pages are waiting to load
    $templateCache.put('loading_msg.html',
    "<div class=\"cg-busy-default-wrapper\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "   <div class=\"cg-busy-default-sign round-corners blue-background-md\">\r" +
    "\n" +
    "\r" +
    "\n" +
    " <i class=\"fa fa-cog fa-spin fa-5x px3 py2\"></i> " +
    "\n" +
    "\r" +
    "\n" +
    "   </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "</div>"
  );
}])


.factory('HttpInterceptor', function($q) {
  return {
    response: function(response) {
      var search_button = angular.element(document.querySelector('.fa-spinner'));
      search_button.removeClass('fa-spinner');
      search_button.removeClass('fa-spin');
      search_button.addClass('fa-search');
      return response;
    },
    responseError: function(response) {
      // do something on error
      if (canRecover(response)) {
        return responseOrNewPromise;
      }
      return $q.reject(response);
    }
  };
})
// .factory('HttpInterceptor', function ($q, $window) {
// // special spinner to make search icon rotate during HTTP call
//   return function (promise) {
//     var search_button = angular.element(document.querySelector('.fa-spinner'));

//     return promise.then(function (response) {

//       search_button.removeClass('fa-spinner');
//       search_button.removeClass('fa-spin');
//       search_button.addClass('fa-search');

//       return response;
//     }, function (response) {

//       search_button.removeClass('fa-spinner');
//       search_button.removeClass('fa-spin');
//       search_button.addClass('fa-search');

//       return $q.reject(response);
//     });
//   };
// })
;
})();
