(function(){
angular.module( 'sunshine.prod', [])
.constant('SunshineConfig',
  {
    "api_url": 'http://index.sfgov.org/node'
  }
);
})();

(function(){
angular.module( 'sunshine.dev', [])
.constant('SunshineConfig',
  {
    "api_url": 'http://localhost:1971'
  }
);
})();
