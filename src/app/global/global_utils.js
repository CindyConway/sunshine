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

.service('HttpQueue', function(){
  var self = this;
  self.count = 0;
    this.add = function(){ self.count++; };
    this.subtract = function(){ self.count--; };
})
.factory('HttpInterceptor', function($q, HttpQueue) {
  return {
    request: function(request){
      //console.log("interceptor request");
      HttpQueue.add();
      return request;
    },
    response: function(response) {
      var search_button = angular.element(document.querySelector('.fa-spinner'));
      //console.log("interceptor response");
      search_button.removeClass('fa-spinner');
      search_button.removeClass('fa-spin');
      search_button.addClass('fa-search');
      HttpQueue.subtract();
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
;
})();
