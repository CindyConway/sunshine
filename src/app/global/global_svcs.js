angular.module( 'sunshine.global_svcs', [])

// Department Related API Calls
.service('DepartmentList', function($http, $rootScope, $log) {
  this.get_adopted = function() {
    var apiUrl = $rootScope.API_URL;
    return $http
      .get(apiUrl + '/department')
      .then(function(res) {
        return res.data;
      });
  };

  this.get_draft = function() {
    var apiUrl = $rootScope.API_URL;
    return $http
      .get(apiUrl + '/draft/department')
      .then(function(res) {
        return res.data;
      });
  };
})

//Search Related API Calls
.service('Search', function($http, $rootScope, $filter, $log) {

  var apiUrl = $rootScope.API_URL;

  search_terms = {};
  search_filters = {};

  this.suggest_string = function(suggestObj){

      var general = suggestObj.general;
      var arr_len = general.length;
      var suggest = '';
      var count = 0;

      for(var i = 0; i < arr_len ; i++){
        if(general[i].options.length > 0){
          count++;
          suggest += general[i].options[0].text + ' ';
        }else{
          suggest += general[i].text + ' ';
        }
      }

      if(count > 0){
        return suggest;
      }else{
          return null;
      }
  };

  this.set_filters = function(field, arrToAdd ){

    delete search_filters[field];

    if(arrToAdd.length > 0) {
      search_filters[field] = arrToAdd;
    }
    return search_filters;
  };

  this.clear_filters = function(){
    search_fitlers = {};
  };

  this.get_filters = function(){
    return search_filters;
  };

  this.set_terms = function(terms){
    var json = {};
    json.terms = terms;
    search_terms = json;
  };


  this.get_terms = function(){
    return search_terms;
  };

  this.get_result_count = function(){
    return result_count;
  };

  this.full_text = function() {
    var url = apiUrl + '/search';

    var req_data = {};
    req_data.criteria = search_terms;

    req_data.filters = search_filters;

    return $http.put(url, req_data)
      .success(function(res) {
        return res.data;
      })
      .error(function(data) {
        $log.log(data);
      });
  };
})

//Schedule Related API Calls
.service('Schedule', function($http, $rootScope, $log) {

  var apiUrl = $rootScope.API_URL;

  this.get_draft = function() {
    return $http
      .get(apiUrl + '/draft/schedule/' + $rootScope.selected_draft_dept)
      .then(function(res) {
        return res.data;
      });
  };

  this.get_adopted = function(schedule_id) {

    return $http
      //.get(apiUrl + '/schedule/' + $rootScope.selected_adopted_dept)
      .get(apiUrl + '/schedule/' + schedule_id)
      .then(function(res) {
        return res.data;
      });
  };

  this.saveDraftRecord = function(record) {
    var url = apiUrl + '/draft/record/';
    console.log(url);

    return $http.put(url, record)
      .success(function(data) {
        $log.log(data);
        // this.post.push(data);
      })
      .error(function(data) {
        $log.log(data);
      });
  };

  this.publish = function(schedule) {
    var url = apiUrl + '/publish/';

    return $http.post(url + schedule)
      .success(function(data) {})
      .error(function(data) {
        $log.log({
          "fail": "sad face"
        });
        $log.log(data);
      });
  };
})

;
