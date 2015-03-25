(function(){
angular.module( 'sunshine.edit', [
    'ui.router',
    'ui.bootstrap'
  ])

.config(function config( $stateProvider ) {

  $stateProvider.state( 'edit', {
    url: '/edit',
    views: {
      "main": {
        templateUrl: 'console/edit/edit.tpl.html'
      }
    },
    data:{ pageTitle: 'Administration - Edit', authorizedRoles: ['admin', 'editor', 'anonymous'] }
  });
})

.controller('EditCtrl', function EditCtrl(GlobalVariables, ScheduleDelete, PopulateGrid, Department,
    ScheduleAdd, ScheduleSave, SchedulePublish, ScheduleLock, ScheduleUnlock, SearchNext, SearchPrevious) {

    GlobalVariables.showFooter = false;
    var thisHandsontable;
    var self = this;
    self.schedule_grid = document.getElementById('schedule-grid');
    self.searchCount = document.getElementById("result-count");
    self.searchResults = [];
    self.selSearchResult = -1;
    self.del = ScheduleDelete;
    self.save = ScheduleSave;
    self.add = ScheduleAdd;
    self.publish = SchedulePublish;
    self.lock = ScheduleLock;
    self.unlock = ScheduleUnlock;
    self.next = SearchNext;
    self.previous = SearchPrevious;
    self.populateGrid = PopulateGrid.populateGrid;
    self.status = "saved";

    Department
    .get_draft()
    .then(function (data){
        //populate Department DropDown
        draft_depts = data;
        self.dept_list = data;
        self.selected_dept = GlobalVariables.user_dept;
        self.populateGrid();
    });
})

.factory("PopulateGrid",["Schedule", "HOTHelper", "ScheduleEdit", "Debounce", "GlobalVariables",
  function(Schedule, HOTHelper, ScheduleEdit, Debounce, GlobalVariables){
        var thisHandsontable;

        var getHandsontable = function(){
          return thisHandsontable;
        };

        var populateGrid = function(){
            var self = this;

            if(typeof self.selected_dept == 'undefined'){return;}

            var dept_id = self.selected_dept;

              Schedule.get_draft(dept_id)
                .then(function (data){

                    // put the data on the controller's scope
                    self.draft = Schedule.draft;
                    self._id = Schedule._id;
                    self.pdf_link = GlobalVariables.api_url + "/pdf/" + self._id;

                    //setup configuration
                    var settings = HOTHelper.config(ScheduleEdit.config());
                    var l = HOTHelper.getFittedWidths.call(self.schedule_grid, Schedule.records, settings.columns);
                    settings.manualColumnResize = [1, l.division, l.category, l.title, l.link, l.retention, l.on_site, l.off_site, l.total, l.remarks, 1 ];

                    //Make grid read only if it is locked
                    if(self.draft.status == "LOCKED"){
                      settings.readOnly = true;
                    }

                    settings.data = Schedule.records;
                    self.schedule_grid.style.visibility = 'hidden';


                    if(typeof thisHandsontable == 'undefined'){
                      console.log("undefined");
                      //create handsontable object
                      thisHandsontable = new Handsontable(self.schedule_grid, settings);

                      //add event to monitor seach input element
                      var schedule_search = document.getElementById('schedule-search');
                    //  console.log(settings);
                      Handsontable.Dom.addEvent(schedule_search, 'keyup', Debounce.debounce(function(){
                          //var thisHandsontable = self.getHandsontable();
                          self.searchResults = thisHandsontable.search.query(this.value);
                          self.searchCount.innerHTML = self.searchResults.length;
                          thisHandsontable.render();
                      },667));

                    }else{
                      thisHandsontable = getHandsontable();
                      console.log("defined");
                      console.log(Schedule.records);
                      //Repopulate Existing Handsontable
                      thisHandsontable.loadData(Schedule.records);
                      thisHandsontable.updateSettings(settings);

                    }
                    console.log(self.schedule_grid);
                    self.schedule_grid.style.visibility = 'visible';

                });
            };


  return {
    populateGrid : populateGrid,
    getHandsontable : getHandsontable
  };
}])

.factory("SearchPrevious", ["PopulateGrid", function(PopulateGrid){
  var searchPrevious = function(){
              var self = this;
              var thisHandsontable = PopulateGrid.getHandsontable();

              if (self.searchResults.length < 1 ){return;}

              self.selSearchResult--;

              if(self.selSearchResult < 0 )
              {
                self.selSearchResult = self.searchResults.length - 1;
              }

              var sel = self.searchResults[self.selSearchResult];

              thisHandsontable.selectCell(sel.row, sel.col);
            };

      return searchPrevious;
}])

.factory("SearchNext", ["PopulateGrid", function(PopulateGrid){

    var searchNext = function(){
      var self = this;
      var thisHandsontable = PopulateGrid.getHandsontable();

        if (self.searchResults.length < 1 ){return;}

        self.selSearchResult++;

        if(self.selSearchResult > (self.searchResults.length - 1))
        {
          self.selSearchResult = 0;
        }

        var sel = self.searchResults[self.selSearchResult];
        thisHandsontable.selectCell(sel.row, sel.col);
      };

      return searchNext;
}])

.factory("ScheduleUnlock",["Schedule", "Debounce", "HttpQueue", "PopulateGrid", "$rootScope",
  function(Schedule, Debounce, HttpQueue, PopulateGrid, $rootScope){
    var unlock = Debounce.debounce(function(){
                        var self = this;
                        var thisHandsontable = PopulateGrid.getHandsontable();


                      //  if(self.editDepartment.$valid && IsValid.length === 0){

                        Schedule.unlock(self._id)
                          .success(function(data){

                            Schedule.draft.status = "DIRTY";
                            self.draft.status = Schedule.draft.status;
                            var settings = thisHandsontable.getSettings();
                            settings.readOnly = false;
                            thisHandsontable.updateSettings(settings);

                            //update autosave status
                            if(HttpQueue.count === 0){
                              self.status = "saved";
                              self.errorMsg = "";
                            }

                          })
                          .error(function(data){
                            console.log(data);
                          });
                        // }else{
                        //
                        //   if(HttpQueue.count === 0){
                        //     self.status = "saved";
                        //   }
                        //   self.errorMsg = "Fix validation errors";
                        //   $rootScope.$apply();
                        // }

                        },667, false, "saving");
        return unlock;

}])


.factory("ScheduleLock",["Schedule", "Debounce", "HttpQueue", "PopulateGrid", "$rootScope",
  function(Schedule, Debounce, HttpQueue, PopulateGrid, $rootScope){
    var lock = Debounce.debounce(function(){
                        var self = this;
                        var thisHandsontable = PopulateGrid.getHandsontable();
                        var IsValid = angular.element(document.querySelector('.htInvalid'));

                        if(self.editDepartment.$valid && IsValid.length === 0){

                        Schedule.lock(self._id)
                          .success(function(data){

                            Schedule.draft.status = "LOCKED";
                            self.draft.status = Schedule.draft.status;
                            var settings = thisHandsontable.getSettings();
                            settings.readOnly = true;
                            thisHandsontable.updateSettings(settings);

                            //update autosave status
                            if(HttpQueue.count === 0){
                              self.status = "saved";
                              self.errorMsg = "";
                            }

                          })
                          .error(function(data){
                            console.log(data);
                          });
                        }else{

                          if(HttpQueue.count === 0){
                            self.status = "saved";
                          }
                          self.errorMsg = "Fix validation errors";
                          $rootScope.$apply();
                        }

                        },667, false, "saving");
        return lock;

}])

.factory("SchedulePublish",["Schedule", "Debounce", "HttpQueue", "PopulateGrid",
  function(Schedule, Debounce, HttpQueue, PopulateGrid){

  var publish = Debounce.debounce(function(){

                var self = this;
                var thisHandsontable = PopulateGrid.getHandsontable();

                Schedule.publish(self._id)
                  .success(function(data){

                    Schedule.draft.status = "CLEAN";
                    self.draft.status = Schedule.draft.status;

                    var settings = thisHandsontable.getSettings();
                    settings.readOnly = false;
                    thisHandsontable.updateSettings(settings);

                    //update autosave status
                    if(HttpQueue.count === 0){
                      self.status = "saved";
                    }
                  })
                  .error(function(data){
                    console.log(data);
                  });


            },667, false, "saving");

    return publish;
}])

.factory("ScheduleSave", ["Schedule", "Department", "Debounce", "HttpQueue",
  function(Schedule, Department, Debounce, HttpQueue){

  var save = Debounce.debounce(function(){

              var self = this;

              var dept = self.draft;
              dept.sched_id = self._id;
              delete dept.record;

              //Save Department properties
              Department
              .save_draft(dept)
              .then(function (data){
                //update department dropdown
                  Department
                  .get_draft()
                  .then(function (data){
                      var hold_selected = self.selected_dept;
                      draft_depts = data;
                      self.dept_list = data;
                      self.selected_dept = hold_selected;

                      Schedule.draft.status = "DIRTY";
                      self.draft.status = Schedule.draft.status;

                      if(HttpQueue.count === 0){
                        self.status = "saved";
                      }
                  });
              });

      },667, false, "saving");

      return save;

}])

.factory("ScheduleAdd", ["Department", "Debounce", "HttpQueue",
  function(Department, Debounce, HttpQueue){

  var add = Debounce.debounce(function(){

            var self = this;

            Department.add()
            .then(function(data){
                var new_id = data._id;

                Department.get_draft()
                .then(function (data){
                    var hold_selected = self.selected_dept;

                    draft_depts = data;
                    self.dept_list = data;
                    self.selected_dept = new_id;
                    self.populateGrid();

                    if(HttpQueue.count === 0){
                      self.status = "saved";
                    }
                });
              });

          },667, false, "saving");

  return add;
}])

.factory("ScheduleDelete", ["Department", "Debounce", "HttpQueue",
  function(Department, Debounce, HttpQueue){

  var del = Debounce.debounce(function(){

            var self = this;

            Department.del(self.selected_dept)
              .then(function(data){
                //update department dropdown
                Department
                .get_draft()
                .then(function (data){
                    draft_depts = data;
                    self.dept_list = data;
                    self.selected_dept = data[0]._id;
                    self.populateGrid();

                    if(HttpQueue.count === 0){
                      self.status = "saved";
                    }
                });
              });
          },667, false, "saving");

  return del;
}])

.factory("ScheduleEdit",["Schedule", "RetentionCategories", "Debounce", "HttpQueue",
  function(Schedule, RetentionCategories, Debounce, HttpQueue){

  function callback(res){}

  var cellFmt =  function(row, col, prop){
     var props = {};
     var is_template = this.instance.getData()[row]["is_template"];
      if (is_template) {
        props.readOnly = true;
      }
     return props;
  };

  //Before Save
  var beforeSave = function(change, source){
    var edit_status = document.getElementById("edit-status");
    edit_status.innerHTML = "saving";
  };

  //Autosave function
  var autoSave = function(change,source){

    var self = this;
    var edit_status = document.getElementById("edit-status");
    if (source === 'loadData') {return;} //dont' save this change
    if (source === 'insertId') {return;} // stops an endless loop when the new record id is added after an insert

    var data = change[0];

    // transform sorted row to original row
    var rowNumber = this.sortIndex[data[0]] ? this.sortIndex[data[0]][0] : data[0];
    var row = this.getSourceDataAtRow(rowNumber);
    row.dept_id = Schedule._id;

    Schedule.save_draft_record(row)
    .then(function(res){
      self.setDataAtCell(rowNumber,0, res.data.record_id, "insertId");
      Schedule.draft.status = "DIRTY";
      edit_status.innerHTML = "saved";
    });
  };

  // Division Autocomplete Function
  var divisionAutoComplete = function(query, process){
     var vals = this.instance.getDataAtCol(1);
     var uniqueVals = vals.unique().sort().nulless();
     process(uniqueVals);
  };


  // Division Autocomplete Function
  var categoryAutoComplete = function(query, process){
    var vals = this.instance.getDataAtCol(2);
    var uniqueVals = vals.unique().sort().nulless();

    process(uniqueVals);
  };

  var isRequired = function(value, callback){
    //Skip the spareMinRow when validating
      var row = this.row + 1;
      var rowCount = this.instance.countRows();

      if(row == rowCount){
        //ignore validating minSpareRow
        callback(true);
        return;
      }else if(!value){
        callback(false);
        return;
      }else{
        callback (true);
      }
  };

  //remove one record from the database
  var beforeRemoveRow = function(index, amount){

    function successCallback(res){
      var edit_status = document.getElementById("edit-status");
      if(HttpQueue.count === 0){
        edit_status.innerHTML = "saved";
      }
    }

    var self = this;
    var edit_status = document.getElementById("edit-status");
    edit_status.innerHTML = "saving";

    for(var i = 0; i < amount; i++){
      var rowNumber = Array.isArray(this.sortIndex[index]) ? this.sortIndex[index][0] : index;

      var row = this.getSourceDataAtRow(rowNumber);
      var record = {};
      record.row = row;
      record.dept_id = Schedule._id;

      Schedule.delete_draft_record(record)
      .success(successCallback)
      .error(callback);
      index++;
    }
  };

  var autocompleteStrict = function(value, callback){
    //Had to write custom function for strict autocomplete
    //because the built in validation does not skip the spare row

        var row = this.row + 1;
        var rowCount = this.instance.countRows();

        //skip minSpareRow
        if(row == rowCount){

          callback(true);
          return;
        }

        //validation: field required
        if(!value){
          callback(false);
          return;
        }

        //validation: value must match RetentionCategories
        for(var i = 0; i<RetentionCategories.length; i++ ){
          if(RetentionCategories[i] == value){
            callback(true);
            return;
          }
        }

        //value was NOT in RetentionCategories
        callback(false);
      };

  var afterRender = function(){
    this.validateCells(function(){});
  };

  return{
      config : function(){
        var config = {};
        config.columns = [];
        config.minSpareRows = 1;
        config.contextMenuCopyPaste = true;
        config.contextMenu = true;
        config.colHeaders = ["_id","Division","Category", "Title", "Link", "Retention", "On-site", "Off-site", "Total", "Remarks", "is_template"];

        //schema for empty row
        // NB: A bad dataSchema causes minSpareRows to double
        config.dataSchema={_id:null, division:null, category:null, title:null, link: null, retention:null, on_site:null, off_site:null, total:null, remarks:null, is_template:null};

        //_id Column (hidden)
        config.columns.push({"data":"_id"});

        //Division Column
        var divisionConfig = {};
        divisionConfig.data = "division";
        divisionConfig.type = "autocomplete";
        divisionConfig.source = divisionAutoComplete;
        divisionConfig.strict = false;
        config.columns.push(divisionConfig);


        // //Category Column
        var categoryConfig = {};
        categoryConfig.data = "category";
        categoryConfig.type = "autocomplete";
        categoryConfig.source = categoryAutoComplete;
        categoryConfig.strict = false;
        categoryConfig.validator = isRequired;
        config.columns.push(categoryConfig);

        //Title Column
        var titleConfig = {};
        titleConfig.data = "title";
        titleConfig.validator = isRequired;
        config.columns.push(titleConfig);

        //Link Column
        config.columns.push({"data":"link"});

        //Retention Column
        var retentionConfig = {};
        retentionConfig.data = "retention";
        retentionConfig.type = "autocomplete";
        retentionConfig.source = RetentionCategories;
        retentionConfig.allowInvalid = true;
      //  retentionConfig.strict=true;
        retentionConfig.validator = autocompleteStrict;
        config.columns.push(retentionConfig);

        // On-site Column
        var onsiteConfig = {};
        onsiteConfig.data = "on_site";
        onsiteConfig.validator = isRequired;
        config.columns.push(onsiteConfig);

        // Off-site Column
        var offsiteConfig = {};
        offsiteConfig.data = "off_site";
        offsiteConfig.validator = isRequired;
        config.columns.push(offsiteConfig);

        // Total Column
        config.columns.push({"data":"total"});

        // Remarks Column
        config.columns.push({"data":"remarks"});

        //is_template
        var is_temp = {};
        is_temp.data = "is_template";
        config.columns.push(is_temp);

        // conditional cell formatting
        config.cells = cellFmt;

        //add event handlers
        config.beforeChange = beforeSave;
        config.afterChange = autoSave;
        config.beforeRemoveRow = beforeRemoveRow;
        config.afterRender = afterRender;

        return config;
    }
  };

}])

.directive('ccHandsontableContainer', ['$window', 'Debounce', function ($window, Debounce) {
  return {
    restrict : 'A',
    scope: true,
    link: function(scope, elem, attr){

      var resizeCalc = function(){


        var childHandsontable =elem[0].children[0];

         var win_width = Math.max(document.documentElement.clientWidth, $window.innerWidth || 0);
         elem.css('width', win_width + "px");

         var win_height = Math.max(document.documentElement.clientHeight, $window.innerHeight || 0);
         win_height = win_height - 150;
         elem.css('height', win_height +"px");

         childHandsontable.style.width = win_width - 15 + "px";
         childHandsontable.style.height =  win_height + "px";
       };

      angular.element($window).bind('resize', Debounce.debounce(function() {
        // must apply since the browser resize event is not seen by the digest process
        scope.$apply(function() {
          resizeCalc();
        });
      }, 50));

      angular.element($window).bind('load', Debounce.debounce(function() {
        // must apply since the browser resize event is not seen by the digest process
        scope.$apply(function() {
          resizeCalc();
        });
      }, 50));

    }
  };
}])
;
})();
