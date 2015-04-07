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
      footer: true
    }
  });
})

.controller('SearchCtrl', function($scope, Search, GlobalVariables) {

  var self = this;
  self.results = {};
  self.aggs = {};
  self.count = null;
  self.suggestion = '';
  self.terms = Search.get_terms().terms;

  self.dept_sel = [];
  self.category_sel = [];
  self.retention_sel = [];

  Search.clear_filters();

  //WATCH DEPARTMENT
  $scope.$watch(
    function() {
      return self.dept_sel.toString();
    },
    function(newVal, oldVal) {
      filter ('department.og', self.dept_sel);
    }
  );

  //WATCH CATEGORY
  $scope.$watch(
    function() {
      return self.category_sel.toString();
    },
    function(newVal, oldVal) {
      filter ('category.og', self.category_sel);
    }
  );

  //WATCH RETENTION
  $scope.$watch(
    function() {
      return self.retention_sel.toString();
    },
    function(newVal, oldVal) {
      filter ('retention.og', self.retention_sel);
    }
  );

  var filter  = function (es_field, filterArray ){
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

  };

  this.search = function() {

    self.dept_sel = [];
    self.division_sel = [];
    self.category_sel = [];
    self.retention_sel = [];

    Search.set_terms(self.terms);
    Search.full_text()
      .success(function(data, status) {
        self.results = data.hits.hits;
        self.aggs = data.aggregations;
        self.suggest = Search.suggest_string(data.suggest);
        self.count = data.hits.total;
        console.log(self.aggs);
      })
      .error(function(err, status) {});
  };
})

;
