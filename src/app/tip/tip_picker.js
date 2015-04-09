(function(){
angular.module( 'sunshine.tip_picker', [
        'ui.router',
        'ui.bootstrap'
    ])

.config(function config( $stateProvider ) {

    $stateProvider.state( 'tip_picker', {
        url: '/tip_picker/:schedule_id',
        ncyBreadcrumb: {
          label: 'Recommendations',
          parent: 'edit'
        },
        views: {
            "admin": {
                //controller: 'DashBoardCtrl',
                templateUrl: 'tip/tip_picker.tpl.html'
            }
        },
        data:{ pageTitle: 'Administration - Dashboard',
        authorizedRoles: ['Administrator', 'Publisher', 'Editor'],
        footer:false
        }
    });
})

.controller('TipPickerCtrl', function tipCtrl( $stateParams, Schedule, Template, Authentication,
  TipPicker, HOTHelper) {
  var self = this;
  var tip_Handsontable;
  self.draft_dept =  Authentication.selDept;
  self.draft_dept_name = Authentication.selDeptName;
  self.tip_grid = document.getElementById('tip-grid');
  self.tip_count = document.getElementById("tip-count");
  self.searchResults = [];
  self.selSearchResult = -1;
  self.status = "saved";

    Template.getByDeptId(self.draft_dept)
      .then(function (data){

        var template = Template.for_dept;

        //Add runtime settings
         var settings = HOTHelper.config(TipPicker.config());
         var l = HOTHelper.getFittedWidths.call(tip_Handsontable, template, settings.columns);
         settings.search = {callback: HOTHelper.searchResultCounter};
         settings.manualColumnResize = [1, l.selected, l.category, l.title, l.link, l.retention, l.on_site, l.off_site, l.total, l.remarks ];
         settings.data = template;

        //Display Table
        self.tip_grid.style.visibility = 'hidden';
        if(typeof tip_Handsontable == 'undefined'){
          tip_Handsontable = new Handsontable(self.tip_grid, settings);
        }

        self.tip_grid.style.visibility = 'visible';
      });

  self.next = function(){

      if (self.searchResults.length < 1 ){return;}

      self.selSearchResult++;

      if(self.selSearchResult > (self.searchResults.length - 1))
      {
        self.selSearchResult = 0;
      }

      var sel = self.searchResults[self.selSearchResult];
      tip_Handsontable.selectCell(sel.row, sel.col);

  };

  self.previous = function(){
      if (self.searchResults.length < 1 ){return;}

      self.selSearchResult--;

      if(self.selSearchResult < 0 )
      {
        self.selSearchResult = self.searchResults.length - 1;
      }

      var sel = self.searchResults[self.selSearchResult];
      tip_Handsontable.selectCell(sel.row, sel.col);

  };

  // add listener to tip_search field to cause the grid to
  // be searched
  var tip_search = document.getElementById('tip-search');
  Handsontable.Dom.addEvent(tip_search, 'keyup', function (event) {
    self.searchResults = tip_Handsontable.search.query(this.value);
    self.tip_count.innerHTML = self.searchResults.length;
    tip_Handsontable.render();
  });

})

.factory('TipPicker', ["Template", "Schedule","RetentionCategories", 'Authentication',
  function (Template, Schedule, RetentionCategories, Authentication) {

    //Before Save
    var beforeSave = function(change, source){
      setStatus("saving");
    };

    var setStatus = function(str){
      var tip_status = document.getElementById("tippicker-status");
      tip_status.innerHTML = str;
    };


    //Autosave function
    var autoSave = function(change,source){
      var self = this;

      if(change == null){return;}
      var data = change[0];

      if (source === 'loadData') {return;} //dont' save this change
      if (source === 'insertId') {return;} // stops an endless loop when the new record id is added after an insert

      // transform sorted row to original row
      var rowNumber = this.sortIndex[data[0]] ? this.sortIndex[data[0]][0] : data[0];
      var row = this.getSourceDataAtRow(rowNumber);
      var dept = {};
      dept._id = Authentication.selDept;
      dept.draft = {};
      dept.draft.record = row;

      if(!!row.selected ){
        Schedule.add_tip(dept)
        .then(function(res){
          self.setDataAtCell(rowNumber,0, res.data.record_id, "insertId");
          setStatus("saved");
        });
    }

    if(!row.selected){
      Schedule.delete_draft_record(dept)
      .success(function(res){
        setStatus("saved");
      })
      .error(function(err){
        console.log(err);
      });
    }

  };

  return{
    config : function(){
      // basic config
      var config = {};
      config.columns = [];
      config.contextMenu = false;
      config.colHeaders = ["_id", " ", "Category", "Title", "Link", "Retention", "On-site", "Off-site", "Total", "Remarks"];

      //schema for empty row
      config.dataSchema={_id:null, selected:false, category:null, title:null, link:null, retention:null, on_site:null, off_site:null, total:null, remarks:null};

      //_id Column (hidden)
      config.columns.push({"data":"_id"});

      var checkboxConfig = {};
      checkboxConfig.data = "selected";
      checkboxConfig.type = "checkbox";
      checkboxConfig.readOnly = false;
      config.columns.push(checkboxConfig);

      //Category Column
      var categoryConfig = {};
      categoryConfig.data = "category";
      categoryConfig.readOnly = "true";
      config.columns.push(categoryConfig);


      //Title Column
      var titleConfig = {};
      titleConfig.data = "title";
      titleConfig.readOnly = "true";
      config.columns.push(titleConfig);

      //Link Column
      var linkConfig = {};
      linkConfig.data = "link";
      linkConfig.readOnly = "true";
      config.columns.push(linkConfig);

      // Retention Column
      var retentionConfig = {};
      retentionConfig.data = "retention";
      retentionConfig.readOnly = "true";
      config.columns.push(retentionConfig);

      // On-site Column
      var on_siteConfig = {};
      on_siteConfig.data = "on_site";
      on_siteConfig.readOnly = "true";
      config.columns.push(on_siteConfig);

      // Off-site Column
      var off_siteConfig = {};
      off_siteConfig.data = "off_site";
      off_siteConfig.readOnly = "true";
      config.columns.push(off_siteConfig);

      // Total Column
      var totalConfig = {};
      totalConfig.data = "total";
      totalConfig.readOnly = "true";
      config.columns.push(totalConfig);

      // Remarks Column
      var remarksConfig = {};
      remarksConfig.data = "remarks";
      remarksConfig.readOnly = "true";
      config.columns.push(remarksConfig);

      //Add Event Functions
      config.afterChange = autoSave;
      config.beforeChange = beforeSave;

      return config;
    }
  };
}])
;
})();
