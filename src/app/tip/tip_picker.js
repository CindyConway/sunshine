(function(){
angular.module( 'sunshine.tip_picker', [
        'ui.router',
        'ui.bootstrap'
    ])

.config(function config( $stateProvider ) {

    $stateProvider.state( 'tip_picker', {
        url: '/tip_picker/:dept_id',
        ncyBreadcrumb: {
          label: 'Add Record Template',
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
  var tip_picker_Handsontable;
  self.draft_dept =  Authentication.selDept;
  self.draft_dept_name = Authentication.selDeptName;
  self.tip_picker_grid = document.getElementById('tip-picker-grid');
  self.tip_count = document.getElementById("tip-count");
  self.searchResults = [];
  self.selSearchResult = -1;
  self.status = "saved";
  self.info_msg = "";

    Template.getByDeptId(self.draft_dept)
      .then(function (data){

        var template = Template.for_dept;

        //Add runtime settings
         var settings = HOTHelper.config(TipPicker.config());
         settings.search = {callback: HOTHelper.searchResultCounter};
         settings.data = template;

        //Display Table
        self.tip_picker_grid.style.visibility = 'hidden';

        if(typeof tip_picker_Handsontable != 'undefined'){
            tip_picker_Handsontable.destroy();
        }

        if(typeof tip_picker_Handsontable == 'undefined'){
          tip_picker_Handsontable = new Handsontable(self.tip_picker_grid, settings);
        }

        self.tip_picker_grid.style.visibility = 'visible';
      });

  // add listener to tip_search field to cause the grid to
  // be searched
  var tip_search = document.getElementById('tip-search');
  Handsontable.Dom.addEvent(tip_search, 'keyup', function (event) {
    self.searchResults = tip_picker_Handsontable.search.query(this.value);
    self.tip_count.innerHTML = self.searchResults.length;
    tip_picker_Handsontable.render();
  });

})

.factory('TipPicker', ["Template", "Schedule","RetentionCategories", 'Authentication',
  function (Template, Schedule, RetentionCategories, Authentication) {

    //Function to adjust the width of the columns
    var colWidth = function(index){
      win_width = window.innerWidth;
      win_width = win_width * 0.924;
      var fivePct = win_width * 0.05;
      var sevenPct = win_width * 0.07;
      var tenPct = win_width * 0.1;
      var fifteenPct = win_width * 0.15;
      var twentyPct = win_width * 0.2;

      switch(index){
        case 0 :
          return  1;
        case 1 :
          return fivePct;
        case 2 :
          return tenPct;
        case 3 :
          return twentyPct;
        case 4 :
          return tenPct;
        case 5 :
          return fifteenPct;
        case 6 :
          return sevenPct;
        case 7 :
          return sevenPct;
        case 8 :
          return sevenPct;
        case 9 :
          return twentyPct;
      }

    };

    //Before Save
    var beforeSave = function(change, source){
      setStatus("saving");
    };

    var setStatus = function(str){
        var status = document.getElementById("tippicker-status");
        var status_spinner = document.getElementById("status-spinner");
        if(status_spinner){
          if(str == 'saving'){
            status_spinner.className = status_spinner.className.replace("off-side", '');
          }

          if(str == 'saved'){
            status_spinner.className += " off-side";
          }
        }

        if(status){
          status.innerHTML = str;
        }
    };

    var setInfoMsg = function(str){
      var elem = document.getElementById("info-msg");
      if(elem){
        elem.innerHTML = str;
      }
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
          setInfoMsg("Added to your schedule");
          setStatus("saved");
        });
    }

    if(!row.selected){
      Schedule.delete_draft_record(dept)
      .success(function(res){
        setInfoMsg ("Removed from your schedule");
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
      config.autoColumnSize = false;
      config.colWidths = colWidth;

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
