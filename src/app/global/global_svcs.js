(function(){
angular.module( 'sunshine.global_svcs', [])

/*================================

      [Global Variable ]

==================================*/
.value('GlobalVariables',
  {
    //"showFooter" : true,
    "api_url": 'http://localhost:1971' //,
    //"user_dept": null,
    //"selected_dept": null
  }
)

/*================================

      [ User Object ]

==================================*/
.service("User", function($http, GlobalVariables){
  var apiUrl = GlobalVariables.api_url;
  var url = apiUrl + "/v1/signup";

  this.signup = function(user){

      return $http.post(url, user)
        .success(function(data) {})
        .error(function(data) {
          console.log({"fail": "sad face"});
        });
  };

})

/*================================

      [ Department Object ]

==================================*/

.service('Department', function($http, GlobalVariables) {
  var apiUrl =GlobalVariables.api_url;

  /*****************************************
  METHOD: del

  Remove the draft document from a deparmtment
  This in effect removes the document from the
  system
  ******************************************/
  this.del = function(department) {

    var url = apiUrl + '/v1/pub/department/' + department;
    return $http["delete"](url)
      .success(function(data) {
      })
      .error(function(data) {
        console.log(data);
      });
  };

  /*****************************************
  METHOD: new

  Add a new Department
  ******************************************/
  this.add = function() {
    var url = apiUrl + '/v1/edit/add';
    return $http
      .put(url)
      .then(function(res) {
        return res.data;
      });
  };

  /*****************************************
  METHOD: save_draft

  Save the propertied of the department.
  (name, contact, webasite, etc)
  ******************************************/
  this.save_draft = function(dept) {
    var url = apiUrl + '/v1/edit/department/' + dept._id;
    return $http
      .put(url, dept)
      .then(function(res) {
        return res.data;
      });
    };

  /*****************************************
  METHOD: get_adopted

  returns the adopted information about a
  department or agency
  ******************************************/
  this.get_adopted = function() {

    return $http
      .get(apiUrl + '/v1/department')
      .then(function(res) {
        return res.data;
      });
  };


  /*****************************************
  METHOD: get_draft

  returns the draft information about a
  department or agency
  ******************************************/
  this.get_draft = function() {

    return $http
      .get(apiUrl + '/v1/edit/department')
      .then(function(res) {
        return res.data;
      });
  };
})

/*================================

        [ Search Object ]

==================================*/
.service('Search', function($http, GlobalVariables) {
  var apiUrl = GlobalVariables.api_url;
  search_terms = {};
  search_filters = {};


  /*****************************************
    METHOD: suggest_string

    Iterates over the suggestions
    returned by Elasticsearch
    and combines them into one string
  ******************************************/
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

  /*****************************************
  METHOD: set_filters

  accepts arrays from the search results page
  and converts them into the right format to
  send to Elasticsearch.
  ******************************************/
  this.set_filters = function(field, arrToAdd ){

    delete search_filters[field];

    if(arrToAdd.length > 0) {
      search_filters[field] = arrToAdd;
    }
    return search_filters;
  };

  /*****************************************
  METHOD: clear_fitlers
  ******************************************/
  this.clear_filters = function(){
    search_filters = {};
  };

  /*****************************************
  METHOD: get_fitlers
  ******************************************/
  this.get_filters = function(){
    return search_filters;
  };

  /*****************************************
  METHOD: set_terms

  takes the terms typed into the search
  textbox and converts them into JSON
  so it can be passed to Elasticsearch
  ******************************************/
  this.set_terms = function(terms){
    var json = {};
    json.terms = terms;
    search_terms = json;
  };

  /*****************************************
  METHOD: get_terms
  ******************************************/
  this.get_terms = function(){
    return search_terms;
  };

  /*****************************************
  METHOD: full_text

  This is the method that makes the HTTP
  call to the elasticsearch API. It does
  the full text search of the index
  ******************************************/
  this.full_text = function() {
    var url = apiUrl + '/v1/search';

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

/*================================

      [ Template Object ]

==================================*/

.service('Template', function($http, GlobalVariables) {
  var apiUrl = GlobalVariables.api_url;
  var self = this;
  self.all = null;
  self.for_dept = null;

  /*****************************************
  METHOD: delete

  Deletes one record from templates.
  ******************************************/
  this.del = function(record) {

    var url = apiUrl + '/v1/pub/template/' + record._id;
    return $http["delete"](url)
      .success(function(data) {
      })
      .error(function(data) {
        console.log(data);
      });
  };

  /*****************************************
  METHOD: get

  This method returns all the records that the
  Administrator's office recommends that all
  departments have.
  ******************************************/

  this.get = function() {
    var url = apiUrl + '/v1/pub/template';
    return $http
      .get(url)
      .then(function(res) {
        self.all = res.data;
        //return res.data;
      });
  };

  /*****************************************
  METHOD: get

  The same as get, but includes an extra field
  called selected if the template record
  is present in the department's draft schedule
  ******************************************/

  this.getByDeptId = function(dept_id) {
    var url = apiUrl + '/v1/edit/template/' + dept_id;
    return $http
      .get(url)
      .then(function(res) {
        self.for_dept = res.data;
      });
  };
  /*****************************************
  METHOD: upsert

  Update a template record class
  ******************************************/
  this.upsert = function(record) {
    var url = apiUrl + '/v1/pub/template';

    return $http.put(url, record)
      .success(function(data) {
        //console.log(data);

      })
      .error(function(data) {
        //console.log(data);
      });
  };

})
/*================================

      [ Schedule Object ]

==================================*/

.service('Schedule', function($http, GlobalVariables) {

  var apiUrl = GlobalVariables.api_url;
  var self = this;
  self.draft = null;
  self._id = null;
  self.records = null;

  /*****************************************
  METHOD: get_pdf

  This method downloads the pdf of a schedule
  for a department
  ******************************************/

  this.get_pdf = function(dept_id){
    var url = apiUrl + '/v1/pdf/' + dept_id;
    return $http
      .get(url)
      .then(function(err, res) {
        return res;
      });
  };


  /*****************************************
  METHOD: get_draft

  This method returns all the DRAFT data
  for a particular schedule; both the information
  about each records, and the information about the
  department.
  ******************************************/

  this.get_draft = function(dept_id) {
    var url = apiUrl + '/v1/temp/schedule/' + dept_id;
    //console.log(url);
    return $http
      .get(url)
      .then(function(res) {
        self.draft = res.data;
        self._id = res.data._id;
        self.draft = res.data.draft;
        self.records = res.data.draft.record;
        return res.data;
      });
  };

  /*****************************************
  METHOD: get_adopted

  This method returns all the ADOPTED (aka published)
  data for a particular schedule; both the information
  about each records, and the information about the
  department.
  ******************************************/
  this.get_adopted = function(schedule_id) {
    var url = apiUrl + '/v1/schedule/' + schedule_id;
    return $http
      .get(url)
      .then(function(res) {
        return res.data;
      });
  };

  /*****************************************
  METHOD: save_draft_record

  Saves one record in a schedule. It is
  saved as a draft.
  ******************************************/
  this.save_draft_record = function(record) {
    var url = apiUrl + '/v1/edit/record/';
    return $http.put(url, record)
      .success(function(data) {
      //  $log.log(data);
        // this.get.push(data);
      })
      .error(function(data) {
        //$log.log(data);
      });
  };

  /*****************************************
  METHOD: add_tip

  Adds a record class from the list of
  recommendations (aka tips) to
  a schedule
  ******************************************/
  this.add_tip = function(record) {
    var url = apiUrl + '/v1/edit/add_template/';
    return $http.put(url, record)
      .success(function(data) {
      //  $log.log(data);
        // this.get.push(data);
      })
      .error(function(data) {
        //$log.log(data);
      });
  };


  /*****************************************
  METHOD: delete_draft_record

  Deletes one record in a schedule. It is
  deleted from a draft.
  ******************************************/
  this.delete_draft_record = function(dept) {
    var url = apiUrl + '/v1/edit/record/' + dept.draft.record._id + '/' + dept._id;
    return $http["delete"](url)
      .success(function(data) {
      })
      .error(function(data) {
        //console.log(data);
      });
  };

  /*****************************************
  METHOD: publish

  Publishes and entire schedule such that it
  is available to the public. This affects all
  the records in a schedule as well as the
  department information
  ******************************************/
  this.publish = function(dept_id) {
    var url = apiUrl + '/v1/pub/publish/' + dept_id;

    return $http.post(url)
      .success(function(data) {})
      .error(function(data) {
        $log.log({
          "fail": "sad face"
        });
        $log.log(data);
      });
  };


    /*****************************************
    METHOD: lock

    Lock the draft version of a schedule
    ******************************************/
    this.lock = function(dept_id) {
      var url = apiUrl + '/v1/edit/lock/' + dept_id;

      return $http.post(url)
      .success(function(data, status, headers, config){
        return data;
      })
      .error(function(data, status, headers, config){
        return status;
      });
    };

    /*****************************************
    METHOD: unlock

    unlock the draft version of a schedule
    ******************************************/
    this.unlock = function(dept_id) {
      var url = apiUrl + '/v1/pub/unlock/' + dept_id;

      return $http.post(url)
      .success(function(data, status, headers, config){
        return data;
      })
      .error(function(data, status, headers, config){
        return status;
      });
    };
})

/*================================

      [ Debounce Object ]

==================================*/

.service('Debounce', function() {
  var self = this;

  // debounce() method is slightly modified version of:
  // Underscore.js 1.4.4
  // http://underscorejs.org
  // (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
  // Underscore may be freely distributed under the MIT license.
  self.debounce = function(func, wait, immediate, status) {
    var timeout,
    result;

    return function() {

      var context = this,
      args = arguments,
      callNow = immediate && !timeout;
      //if debouce breaks for other functions it is
      //because I added context.status and the status argumanet
      //It is used on the save of the schedule edit

      if(typeof context.status != 'undefined'){
        context.status = status;
      }

      var later = function() {
        timeout = null;

        if (!immediate) {
          result = func.apply(context, args);
        }
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        result = func.apply(context, args);
      }

      return result;
    };
  };

  return self;
})

/*================================

      [ List of Valid Retention Categories ]

==================================*/
.value("RetentionCategories",
    ["1 - Permanent",
    "2 - Current",
    "3 - Storage",
    "1 - Permanent, 2 - Current",
    "1 - Permanent, 3 - Storage",
    "2 - Current, 3 - Storage",
    "1 - Permanent, 2 - Current, 3 - Storage",
    "4 - No Retention Required"
  ])
;
})();
