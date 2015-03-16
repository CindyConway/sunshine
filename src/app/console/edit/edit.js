angular.module( 'sunshine.edit', [
    'ui.router',
    'ui.bootstrap'
  ])

.config(function config( $stateProvider ) {

  $stateProvider.state( 'console.edit', {
    url: '/edit',
    views: {
      "console": {
        templateUrl: 'console/edit/edit.tpl.html'
      }
    },
    data:{ pageTitle: 'Administration - Edit', authorizedRoles: ['admin', 'editor', 'anonymous'] }
  });
})

.controller('EditCtrl', function EditCtrl($window, $rootScope, Schedule,
    GlobalVariables, ScheduleEdit, HOTHelper) {

    GlobalVariables.showFooter = false;
    var thisHandsontable;
    var schedule_search = document.getElementById('schedule-search');
    var self = this;
    self.schedule_grid = document.getElementById('schedule-grid');
    self.searchCount = document.getElementById("result-count");
    self.searchResults = [];
    self.selSearchResult = -1;

    // watch for changes to the selected draft department
    $rootScope.$watch('selected_draft_dept', function(newVal, oldVal) {
      Schedule.get_draft(newVal)
        .then(function (data){
            // put the data on the controller's scope
            self.draft = Schedule.draft;

            //setup configuration
            var settings = HOTHelper.config(ScheduleEdit.config());
            var l = HOTHelper.getFittedWidths.call(self.schedule_grid, Schedule.records, settings.columns);
            settings.manualColumnResize = [1, l.division, l.category, l.title, l.link, l.retention, l.on_site, l.off_site, l.total, l.remarks, 1 ];
            settings.data = Schedule.records;

            //display grid
            self.schedule_grid.style.visibility = 'hidden';
            if(typeof thisHandsontable == 'undefined'){
              thisHandsontable = new Handsontable(self.schedule_grid, settings);

              Handsontable.Dom.addEvent(schedule_search, 'keyup', function (event) {
                self.searchResults = thisHandsontable.search.query(this.value);
                self.searchCount.innerHTML = self.searchResults.length;
                thisHandsontable.render();
              });
            }else{

              thisHandsontable.loadData(Schedule.records);
              thisHandsontable.updateSettings(settings);
            }
            self.schedule_grid.style.visibility = 'visible';

        });
    });


    $rootScope.$watch('selected_adopted_dept', function(newVal, oldVal) {
      // Schedule.get_adopted()
      //   .then(function (data){
      //     $scope.gridOptions.data =  data.record;
      //     $scope.draft_schedule = data;
      //   });
    });

    // set selected department when the page first loads
    if ( typeof $rootScope.selected_draft_dept === 'undefined'){
      //$rootScope.selected_draft_dept = "548c8ed3fe0bdfcb496d4bf9"; //MUNI
      //$rootScope.selected_draft_dept = "548c8ed3fe0bdfcb496d4bfe"; //Public Health
      //$rootScope.selected_draft_dept = "548c8ed4fe0bdfcb496d4c08"; //Sherrif

      $rootScope.selected_draft_dept = "548c8ed3fe0bdfcb496d4bce"; // Adult Probation
    }

    if ( typeof $rootScope.selected_adopted_dept === 'undefined'){
      $rootScope.selected_adopted_dept = "5452b9e058779c197dfd05caz";
    }

    self.publish = function(){
      Schedule.publish($rootScope.selected_draft_dept);
    };

    self.next = function(){

      if (self.searchResults.length < 1 ){return;}

      self.selSearchResult++;

      if(self.selSearchResult > (self.searchResults.length - 1))
      {
        self.selSearchResult = 0;
      }

      var sel = self.searchResults[self.selSearchResult];
      thisHandsontable.selectCell(sel.row, sel.col);

    };

    self.previous = function(){
      if (self.searchResults.length < 1 ){return;}

      self.selSearchResult--;

      if(self.selSearchResult < 0 )
      {
        self.selSearchResult = self.searchResults.length - 1;
      }

      var sel = self.searchResults[self.selSearchResult];
      thisHandsontable.selectCell(sel.row, sel.col);

    };
})

.factory("ScheduleEdit",["Schedule", "RetentionCategories", function(Schedule, RetentionCategories){
  var cellFmt =  function(row, col, prop){
     var props = {};
     var is_template = this.instance.getData()[row]["is_template"];
      if (is_template) {
        props.readOnly = true;
      }
     return props;
  };

  //Autosave function
  var autoSave = function(change,source){
    var self = this;

    if (source === 'loadData') {return;} //dont' save this change
    if (source === 'insertId') {return;} // stops an endless loop when the new record id is added after an insert
    var data = change[0];

    // transform sorted row to original row
    var rowNumber = this.sortIndex[data[0]] ? this.sortIndex[data[0]][0] : data[0];
    var row = this.getSourceDataAtRow(rowNumber);
    row.dept_id = Schedule._id;

    Schedule.save_draft_record(row).then(function(res){
      self.setDataAtCell(rowNumber,0, res.data.record_id, "insertId");
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


  //remove one record from the database
  var beforeRemoveRow = function(index, amount){
      var rowNumber = this.sortIndex[index] ? this.sortIndex[index][0] : index;
      var row = this.getSourceDataAtRow(rowNumber);
      row.dept_id = Schedule._id;

      Schedule.delete_draft_record(row)
      .success(function(res){
        console.log(res);
      })
      .error(function(err){
        console.log(err);
      });
  };

  return{
      config : function(){
        var config = {};
        config.columns = [];
        config.minSpareRows = 1;
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
        config.columns.push(categoryConfig);

        //Title Column
        config.columns.push({"data":"title"});

        //Link Column
        config.columns.push({"data":"link"});

        //Retention Column
        var retentionConfig = {};
        retentionConfig.data = "retention";
        retentionConfig.type = "autocomplete";
        retentionConfig.source = RetentionCategories;
        retentionConfig.strict = true;
        retentionConfig.allowInvalid = false;
        config.columns.push(retentionConfig);

        // On-site Column
        config.columns.push({"data":"on_site"});

        // Off-site Column
        config.columns.push({"data":"off_site"});

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
        config.afterChange = autoSave;
        config.beforeRemoveRow = beforeRemoveRow;

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
