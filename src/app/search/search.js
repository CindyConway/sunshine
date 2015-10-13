angular.module('sunshine.search', ['ui.router'])

.config(function config($stateProvider) {
  $stateProvider.state('search', {
    url: '/search',
    ncyBreadcrumb: {
      label: 'Search'
    },
    views: {
      "main": {
        controller: 'SearchCtrl',
        templateUrl: 'search/search.tpl.html'
      }
    },
    data: {
      pageTitle: 'Search Results',
      authorizedRoles: ['Everyone'],
      footer: false
    }
  });
})


.controller('SearchCtrl', function($scope, Search, Authentication) {

  var self = this;
  var storedTerms = $window.sessionStorage.searchTerms;

  self.results = {};
  self.aggs = {};
  self.count = null;
  self.suggestion = '';
  self.dept_sel = [];
  self.category_sel = [];
  self.retention_sel = [];

  //check for undefined terms
  if(storedTerms == 'undefined') {storedTerms = '';}
  self.terms = storedTerms;

  //clear filters in search object
  Search.clear_filters();

  responsiveness($window.innerWidth);

  //WATCH DEPARTMENT
  $scope.$watch(
    function() {
      return self.dept_sel.toString();
    },
    function(newVal, oldVal) {
      if (newVal !== oldVal) {//avoid calling on initial page load
        filter ('department.og', self.dept_sel);
      }
    }
  );

  //WATCH CATEGORY
  $scope.$watch(
    function() {
      return self.category_sel.toString();
    },
    function(newVal, oldVal) {
      if (newVal !== oldVal) {//avoid calling on initial page load
        filter ('category.og', self.category_sel);
      }
    }
  );

  //WATCH RETENTION
  $scope.$watch(
    function() {
      return self.retention_sel.toString();
    },
    function(newVal, oldVal) {
      if (newVal !== oldVal) {//avoid calling on initial page load
        filter ('retention.og', self.retention_sel);
      }
    }
  );

  //WATCH RESIZE
  angular.element($window).bind('resize', Debounce.debounce(function() {
    // must apply since the browser resize event is not seen by the digest process
    $scope.$apply(function() {
      responsiveness($window.innerWidth);
    });
  }, 50));

  function responsiveness(innerWidth){

    if(innerWidth > 691){
      self.ps_side = 'left';
      self.ps_push = true;
      self.ps_open = true;
      self.ps_top = "250px";
    }

    if(innerWidth <= 691){
      self.ps_side = 'right';
      self.ps_push = false;
      self.ps_open = false;
      self.ps_top = "0px";
    }
  }

  function filter (es_field, filterArray ){
    Search.set_filters(es_field, filterArray);
    Search.full_text()
    .success(function(data, status) {
      if (typeof data.hits != 'undefined') {
        self.results = data.hits.hits;
        self.aggs = data.aggregations;
        self.suggest = Search.suggest_string(data.suggest);
        self.count = data.hits.total;
      }
    })
    .error(function(err, status) {});
  }

  self.toggle = function(){
      self.ps_open = !self.ps_open;
  };

  self.search = function() {
    self.dept_sel = [];
    self.division_sel = [];
    self.category_sel = [];
    self.retention_sel = [];

    Search.set_terms(self.terms);
    Search.full_text()
      .success(function(data, status) {
        self.results = data.hits.hits;
        console.log(self.results);
        self.aggs = data.aggregations;
        //console.log(self.aggs);
        self.suggest = Search.suggest_string(data.suggest);
        self.count = data.hits.total;
      })
      .error(function(err, status) {});
  };

  self.search();

})

;
