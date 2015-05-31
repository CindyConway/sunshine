(function(){
angular.module( 'sunshine.edit', [
    'ui.router',
    'ui.bootstrap',
    'dialogs.main'
  ])

.config(function config( $stateProvider, dialogsProvider ) {

  dialogsProvider.useFontAwesome();

  $stateProvider.state( 'edit', {
    url: '/edit',
    ncyBreadcrumb: {
      label: 'Edit Schedule'
    },
    views: {
      "admin": {
        templateUrl: 'edit/edit.tpl.html'
      }
    },
    data:{ pageTitle: 'Administration - Edit', authorizedRoles: ['Administrator', 'Publisher', 'Editor'], footer: false }
  });
})

.controller('EditCtrl', function EditCtrl($scope, GlobalVariables, ScheduleDelete, PopulateGrid, Department,
    ScheduleAdd, ScheduleSave, SchedulePublish, ScheduleLock, ScheduleUnlock, Authentication, TipGo,
    RunSearch, SetStatus) { //SchedulePDF

    GlobalVariables.showFooter = false;
    var self = this;
    self.schedule_grid = document.getElementById('schedule-grid');
    self.searchResults = [];
    self.searchValue = "";
    self.selSearchResult = -1;
    self.del = ScheduleDelete;
    self.save = ScheduleSave;
    self.publish = SchedulePublish;
    self.lock = ScheduleLock;
    self.unlock = ScheduleUnlock;
    self.tips = TipGo;
  //  self.next = SearchNext;
  //  self.previous = SearchPrevious;
    self.populateGrid = PopulateGrid.populateGrid;
    self.status = "saved";
    self.allow = false;
    self.allow = (Authentication.userRoles.indexOf("Administrator") > -1 ||
      Authentication.userRoles.indexOf("Publisher") > -1);
    self.run_search = RunSearch;

    //format date picker
    self.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      showWeeks:false
    };
    self.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      self.opened = true;
    };

    //WATCH RETENTION
    $scope.$watch(
      function() {
        return self.status;
      },
      function(newVal, oldVal) {
        var setStatus = SetStatus;
        setStatus(newVal);
      }
    );

    Department
    .get_draft()
    .then(function (data){
        //populate Department DropDown
        draft_depts = data;
        self.dept_list = data;
        self.selected_dept = (typeof Authentication.selDept === 'undefined' ? data[0]._id : Authentication.selDept);
        self.selected_dept_name = (typeof Authentication.selDeptName === 'undefined' ? data[0].draft.department : Authentication.selDeptName);
        Authentication.setValue("selDept", self.selected_dept);
        Authentication.setValue("selDeptName", self.selected_dept_name);
        self.populateGrid();

    });

})

.factory("TipGo",["$state", function($state){
  var  go = function(){
    var self = this;
    $state.go('tip_picker',{dept_id : self.selected_dept});
  };
  return go;
}])

.factory("RunSearch",["PopulateGrid", "Debounce", function(PopulateGrid, Debounce){

  var run_search = Debounce.debounce(function(){

                    var self = this;
                    var hot = PopulateGrid.getHandsontable();
                    self.searchResults = hot.search.query(self.searchValue);
                    var searchCounter = self.searchResults.length;
                    var count = document.getElementById('result-count');
                    var count_clone = document.getElementById('result-count-clone');
                    count.innerHTML = searchCounter;
                    count_clone.innerHTML = searchCounter;
                    hot.render();
                  },669, false, "saved" );

  return run_search;
}])

.factory("PopulateGrid",["Schedule", "HOTHelper", "ScheduleEdit", "Debounce", "GlobalVariables", "Authentication",
  function(Schedule, HOTHelper, ScheduleEdit, Debounce, GlobalVariables, Authentication){
        var thisHandsontable;

        var getHandsontable = function(){
          return thisHandsontable;
        };

        var populateGrid = function(){
            var self = this;

            var dept_id = self.selected_dept;
            Authentication.setValue("selDept", dept_id);
            //var dept_name = self.selected_dept_name;
            //Authentication.setValue("selDeptName", dept_name);

              Schedule.get_draft(dept_id)
                .then(function (data){

                    // put the data on the controller's scope
                    self.draft = Schedule.draft;
                    self._id = Schedule._id;

                    //reset validation error
                    self.errorMsg = "";

                    self.pdf_link = GlobalVariables.api_url + "/v1/pdf/" + self._id;
                    Authentication.setValue("selDeptName", self.draft.department);

                    //setup configuration
                    var settings = HOTHelper.config(ScheduleEdit.config());

                    //Make grid read only if it is locked
                    if(self.draft.status == "Locked"){
                      settings.contextMenu = false;
                      settings.readOnly = true;
                    }

                    settings.data = Schedule.records;

                    //Deal with Angular validation triggering before ajax call is finished
                    var department_info = document.getElementById('department-info');
                    var error_disp = document.getElementById('error-disp');
                    department_info.className = department_info.className.replace("hidden", '');
                    error_disp.className = error_disp.className.replace("hidden", '');

                    if(typeof thisHandsontable != 'undefined'){
                        thisHandsontable.destroy();
                    }

                    thisHandsontable = new Handsontable(self.schedule_grid, settings);
                    thisHandsontable.render();

                    //add event to monitor seach input element
                    var schedule_search = document.getElementById('schedule-search');
                    var schedule_search_clone = document.getElementById('schedule-search-clone');

                });
            };


  return {
    populateGrid : populateGrid,
    getHandsontable : getHandsontable
  };
}])

// .factory("SearchPrevious", ["PopulateGrid", function(PopulateGrid){
//   var searchPrevious = function(){
//               var self = this;
//               var thisHandsontable = PopulateGrid.getHandsontable();
//
//               if (self.searchResults.length < 1 ){return;}
//
//               self.selSearchResult--;
//
//               if(self.selSearchResult < 0 )
//               {
//                 self.selSearchResult = self.searchResults.length - 1;
//               }
//
//               var sel = self.searchResults[self.selSearchResult];
//
//               thisHandsontable.selectCell(sel.row, sel.col);
//             };
//
//       return searchPrevious;
// }])

// .factory("SearchNext", ["PopulateGrid", function(PopulateGrid){
//
//     var searchNext = function(){
//       var self = this;
//       var thisHandsontable = PopulateGrid.getHandsontable();
//
//         if (self.searchResults.length < 1 ){return;}
//
//         self.selSearchResult++;
//         console.log(self.selSearchResult);
//
//         if(self.selSearchResult > (self.searchResults.length - 1))
//         {
//           self.selSearchResult = 0;
//         }
//
//         var sel = self.searchResults[self.selSearchResult];
//         console.log(sel);
//         thisHandsontable.selectCell(sel.row, sel.col);
//       };
//
//       return searchNext;
// }])

.factory("ScheduleUnlock",["Schedule", "Debounce", "HttpQueue", "PopulateGrid", "$rootScope",
  function(Schedule, Debounce, HttpQueue, PopulateGrid, $rootScope){
    var unlock = Debounce.debounce(function(){
                        var self = this;
                        var thisHandsontable = PopulateGrid.getHandsontable();


                      //  if(self.editDepartment.$valid && IsValid.length === 0){

                        Schedule.unlock(self._id)
                          .success(function(data){

                            Schedule.draft.status = "Edited";
                            self.draft.status = Schedule.draft.status;
                            var settings = thisHandsontable.getSettings();
                            settings.contextMenu =   {};
                            settings.contextMenu.items = {};
                            settings.contextMenu.items.row_above = {name:"Insert row"};
                            settings.contextMenu.items.remove_row = {name:"Remove row"};
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

.factory("ScheduleLock",["Schedule", "Debounce", "HttpQueue", "PopulateGrid", "$rootScope", "dialogs",
  function(Schedule, Debounce, HttpQueue, PopulateGrid, $rootScope, dialogs){
    var lock = Debounce.debounce(function(){
                        var self = this;
                        var thisHandsontable = PopulateGrid.getHandsontable();
                        var IsValid = angular.element(document.querySelector('.htInvalid'));

                         if(self.editDepartment.$valid && IsValid.length === 0){
                           self.errorMsg = '';
                          var header = "Lock";
                          var msg = "You cannot unlock this schedule without assistance. Would you like to continue?";
                          var dlg = dialogs.confirm(header, msg);
                          dlg.result.then(function(btn){
                            Schedule.lock(self._id)
                              .success(function(data){

                                Schedule.draft.status = "Locked";
                                self.draft.status = "Locked";
                                var settings = thisHandsontable.getSettings();

                                settings.readOnly = true;
                                settings.contextMenu = false;
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
                          },function(btn){
                            //user clicked not in confirmation dialog
                            self.status = "cancelled";
                          });

                        }else{// Validation Error

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

                    Schedule.draft.status = "Published";
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

.factory("ScheduleSave", ["Schedule", "Department", "Debounce", "HttpQueue", "Authentication",
  function(Schedule, Department, Debounce, HttpQueue, Authentication){

  var save = Debounce.debounce(function(){

              var self = this;

              var dept = self.draft;
              delete dept.record;

              var req = {};
              req._id = self._id;
              req.draft = dept;


              //Save Department properties
              Department
              .save_draft(req)
              .then(function (data){
                //update department dropdown
                  Department
                  .get_draft()
                  .then(function (data){
                    //  var hold_selected = self.selected_dept;
                      draft_depts = data;
                      self.dept_list = data;
                      self.selected_dept = Authentication.selDept;

                      Schedule.draft.status = "Edited";
                      self.draft.status = Schedule.draft.status;

                      if(HttpQueue.count === 0){
                        self.status = "saved";
                      }
                  });
              });

      },667, false, "saving");

      return save;

}])

// .factory("SchedulePDF", ["Schedule", "Debounce", function(Schedule, Debounce){
//
//   var pdf = Debounce.debounce(function(){
//     var content = 'file content';
// var blob = new Blob([ content ], { type : 'text/plain' });
// $scope.url = (window.URL || window.webkitURL).createObjectURL( blob );
//
//
//             var self = this;
//             Schedule.get_pdf(self.selected_dept)
//             .then(function(data){
//             });
//
//   },667, false, "saving");
//
//   return pdf;
// }])

.factory("ScheduleDelete", ["Department", "Debounce", "HttpQueue", "dialogs",
  function(Department, Debounce, HttpQueue, dialogs){

  var del = Debounce.debounce(function(){
          var self = this;
          var header = "Delete";
          var msg = "Are you sure you want to delete the entire schedule for the " + self.draft.department + "?";
          var dlg = dialogs.confirm( header, msg);
          dlg.result.then(function(btn){
                //User clicked Yes in confirmation dialog
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
          },function(btn){
            //user clicked not in confirmation dialog
            self.status = "cancelled";
          });
        },667, false, "saving");

  return del;
}])

.factory("SetStatus", function(){
  var setStatus = function(str){
    var status = document.getElementById("edit-status");
    var status_clone = document.getElementById("edit-status-clone");
    var status_spinner = document.getElementById("status-spinner");
    var status_spinner_clone = document.getElementById("status-spinner-clone");

    if(status_spinner){
      if(str == 'saving'){
        status_spinner.className = status_spinner.className.replace("off-side", '');
        status_spinner_clone.className = status_spinner.className.replace("off-side", '');
      }

      if(str == 'saved'){
        status_spinner.className += " off-side";
        status_spinner_clone.className += " off-side";
      }

      if(str == 'cancelled'){
        status_spinner.className += " off-side";
        status_spinner_clone.className += " off-side";
      }
    }

    status.innerHTML = str;
    status_clone.innerHTML = str;
  };

  return setStatus;

})

.factory("ScheduleEdit",["Schedule", "RetentionCategories", "Debounce", "HttpQueue", "HOTHelper",
  "Authentication", "$window", "SetStatus",
  function(Schedule, RetentionCategories, Debounce, HttpQueue, HOTHelper, Authentication, $window, SetStatus){

//  var undoCounter = 0; // addresses bug in HoT that causes issues when deleting a row, then selecting "undo"
  var x = 0;
  var addedRowIndex;

  function callback(res){}

  // Division Autocomplete Function
  var divisionAutoComplete = function(query, process){
      var vals = this.instance.getDataAtCol(1);
      var uniqueVals = vals.unique().sort().nulless();
      process(uniqueVals);
   };

  // Category Autocomplete Function
  var categoryAutoComplete = function(query, process){
     var vals = this.instance.getDataAtCol(3);
     var uniqueVals = vals.unique().sort().nulless();

     process(uniqueVals);
   };

   var setStatus = SetStatus;

  var cellFmt =  function(row, col, prop){
     var props = {};
     var test = this.instance.getData()[row];
     var is_template = this.instance.getData()[row]["is_template"];
      if (is_template && prop == "title") {
        props.readOnly = true;
      }
     return props;
  };

  //Before Save
  var beforeSave = function(change, source){

    if(source == "insertId"){return;}
    setStatus("saving");
  };

  var afterCreateRow = function(index, amount){
    // console.log("aftercreaterow");
    // console.log(index, amount);
    // console.log(this);
    addedRowIndex = index;
  };

  //Autosave function
  var autoSave = function(change,source){
    x++;
    //console.log("counter " + x);

    var self = this;
    var row;
    var data;

    if (source === 'loadData') {return;} //dont' save this change
    if (source === 'insertId') {return;} // stops an endless loop when the new record id is added after an insert

    //To address HoT bug when using undo on deleted row
    if(Array.isArray(change[0])){
      data = change[0];
    }else{
      data = [change[0]];
    }

    // if(source == "external"){//External is the value of source when undo is called on a deleted row
    //   console.log(change);
    //   rowNumber = this.sortIndex[change[0]];
    //   console.log("logical row " + change[0]);
    //   console.log("physical row " + rowNumber);
    //   console.log("added row index" + addedRowIndex);
    //
    //   console.log(source);
    // //  console.log(undoCounter);
    //   console.log(this.countRows());
    //   if (undoCounter === 0){ //HoT bug when using undo on a deleted row
    //       undoCounter = this.countRows() - change[0] + 1;
    //   }
    //
    //   if(undoCounter > 1 ){
    //     undoCounter--;
    //     return;
    //   }
    //
    //   row = change[3];
    //   undoCounter = 0;
    // }else{
      // transform sorted row to original row
      var rowNumber = this.sortIndex[data[0]] ? this.sortIndex[data[0]][0] : data[0];
      row = this.getSourceDataAtRow(rowNumber);
  //  }

    var obj = {};
    obj._id = Schedule._id;
    obj.draft = {};
    obj.draft.record = row;

    if (source != "external"){
      obj.undo = false;
    }

    if(source == 'external'){
      obj.undo = true;
    }
    console.log(obj);
    Schedule.save_draft_record(obj)
    .then(function(res){

      //If it is a new record, set _id to the unique key returned from the DB
      if(obj.draft.record._id === null){
        self.setDataAtCell(rowNumber,0, res.data.record_id, "insertId");
      }

      Schedule.draft.status = "Edited";

      if(HttpQueue.count === 0){
        setStatus("saved");
      }
    });
  };


  //remove one record from the database
  var beforeRemoveRow = function(index, amount){

    function successCallback(res){
      if(HttpQueue.count === 0){
        setStatus("saved");
      }
    }

    var self = this;
    setStatus("saving");

    for(var i = 0; i < amount; i++){
      var rowNumber = Array.isArray(this.sortIndex[index]) ? this.sortIndex[index][0] : index;

      var row = this.getSourceDataAtRow(rowNumber);
      var record = {};
      record._id = Authentication.selDept;
      record.draft = {};
      record.draft.record = row;

      if(row._id){
        Schedule.delete_draft_record(record)
        .then(successCallback);
      }else{
        setStatus("saved");
      }
      index++;
    }
  };

  var afterRender = function(){
    this.validateCells(function(){});
  };

  var colWidth = function(index){
    var info = angular.element(document.querySelector('#department-info'));
    if(typeof info[0] == 'undefined') {return;}

    win_width = info[0].offsetWidth;
    var sevenPct = win_width * 0.07;
    var tenPct = win_width * 0.1;
    var thirteenPct = win_width * 0.13;
    var sixteenPct = win_width * 0.16;

    switch(index){
      case 0 :
        return  1;
      case 1 :
        return tenPct;
      case 2 :
        return tenPct;
      case 3 :
        return thirteenPct;
      case 4 :
        return sixteenPct;
      case 5 :
        return tenPct;
      case 6 :
        return tenPct;
      case 7 :
          return sevenPct;
      case 8 :
        return sevenPct;
      case 9 :
        return sevenPct;
      case 10 :
        return tenPct;
      case 11 :
        return  1;
    }

  };

  return{
      config : function(){
        var config = {};
        config.columns = [];
        config.minSpareRows = 1;
        config.fixedRowsTop = 0;
        config.fixedRowsOffset = 66;
        config.autoColumnSize = false;
        //config.contextMenu = false;
        config.contextMenu =   {};
        config.contextMenu.items = {};
        config.contextMenu.items.row_above = {name:"Insert row"};
        config.contextMenu.items.remove_row = {name:"Remove row"};
      //  config.contextMenu.items.undo = {};
        config.undo = true;

        config.colHeaders = ["_id", "Division", "Division Contact", "Category", "Title", "Link", "Retention", "On-site", "Off-site", "Total", "Remarks", "is_template"];
        config.colWidths = colWidth;

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

        //Division Contact Column
        var divisionContactConfig = {};
        divisionContactConfig.data = "division_contact";
        config.columns.push(divisionContactConfig);


         //Category Column
        var categoryConfig = {};
        categoryConfig.data = "category";
        categoryConfig.type = "autocomplete";
        categoryConfig.source = categoryAutoComplete;
        categoryConfig.strict = false;
        categoryConfig.validator = HOTHelper.isRequired;
        config.columns.push(categoryConfig);

        //Title Column
        var titleConfig = {};
        titleConfig.data = "title";
        titleConfig.validator = HOTHelper.isRequired;
        config.columns.push(titleConfig);

        //Link Column
        config.columns.push({"data":"link"});

        //Retention Column
        var retentionConfig = {};
        retentionConfig.data = "retention";
        //retentionConfig.type = "autocomplete";
        retentionConfig.type = "dropdown";
        retentionConfig.source = RetentionCategories;
        //retentionConfig.allowInvalid = true;
        //retentionConfig.validator = HOTHelper.retentionValidator;
        config.columns.push(retentionConfig);

        // On-site Column
        var onsiteConfig = {};
        onsiteConfig.data = "on_site";
        config.columns.push(onsiteConfig);

        // Off-site Column
        var offsiteConfig = {};
        offsiteConfig.data = "off_site";
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
        config.afterCreateRow = afterCreateRow;

        return config;
    }
  };

}])

.directive('ccHandsontableContainer', ['$window', 'Debounce', 'PopulateGrid', function ($window, Debounce, PopulateGrid) {
  return {
    restrict : 'A',
    scope: true,
    link: function(scope, elem, attr){

        angular.element($window).bind('resize', function() {
          var hot = PopulateGrid.getHandsontable();
          hot.render();
        });
    }
  };

}])
;
})();
