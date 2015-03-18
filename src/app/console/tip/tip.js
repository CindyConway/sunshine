(function(){
angular.module( 'sunshine.tip', [
        'ui.router',
        'ui.bootstrap'
    ])

.config(function config( $stateProvider ) {

    $stateProvider.state( 'console.tip', {
        url: '/tip',
        views: {
            "console": {
                //controller: 'DashBoardCtrl',
                templateUrl: 'console/tip/tip.tpl.html'
            }
        },
        data:{ pageTitle: 'Administration - Dashboard', authorizedRoles: ['admin', 'editor', 'anonymous'] }
    });
})

.controller('TipCtrl', function tipCtrl( $rootScope, Schedule, Template,
 TipEdit, TipPicker, HOTHelper) {
  var self = this;
  var tip_Handsontable;
  self.draft_dept = $rootScope.selected_draft_dept;
  self.tip_grid = document.getElementById('tip-grid');
  self.tip_count = document.getElementById("tip-count");
  self.searchResults = [];
  self.selSearchResult = -1;


  if (Schedule._id != null){
    Template.getByDeptId(Schedule._id)
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
  }

  if(Schedule.draft == null){
    Template.get()
      .then(function (data){
        var template = Template.all;

        //Add runtime settings
          var settings = HOTHelper.config(TipEdit.config());
         var l = HOTHelper.getFittedWidths.call(tip_Handsontable, template, settings.columns);
         settings.search = {callback: HOTHelper.searchResultCounter};
         settings.manualColumnResize = [1, l.category, l.title, l.link, l.retention, l.on_site, l.off_site, l.total, l.remarks ];
         settings.data = template;

         //Display Table
         self.tip_grid.style.visibility = 'hidden';
         if(typeof tip_Handsontable == 'undefined'){
           tip_Handsontable = new Handsontable(self.tip_grid, settings);
         }
         self.tip_grid.style.visibility = 'visible';
      });
  }

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
  Handsontable.Dom.addEvent(tip_search, 'keyup', function (event) {
    self.searchResults = tip_Handsontable.search.query(this.value);
    self.tip_count.innerHTML = self.searchResults.length;
    tip_Handsontable.render();
  });

})

.factory('TipEdit', ["Template", "RetentionCategories", function (Template, RetentionCategories) {

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

      Template.upsert(row).then(function(res){
         self.setDataAtCell(rowNumber,0, res.data._id, "insertId");
       });
    };

    // Category Autocomplete Function
    var categoryAutoComplete = function(query, process){
      var vals = this.instance.getDataAtCol(1);
      var uniqueVals = vals.unique().sort().nulless();

      process(uniqueVals);
    };


    //remove one record from the database
    var beforeRemoveRow = function(index, amount){
        var rowNumber = this.sortIndex[index] ? this.sortIndex[index][0] : index;
        var row = this.getSourceDataAtRow(rowNumber);

        Template.del(row)
        .success(function(res){

        })
        .error(function(err){
          console.log(err);
        });
    };

    return {
      config : function(){
        var config = {};
        config.columns = [];
        config.minSpareRows = 1;
        config.contextMenu = ["row_above", "row_below", "remove_row"];
        config.colHeaders = ["_id","Category", "Title", "Link", "Retention", "On-site", "Off-site", "Total", "Remarks"];

        //schema for empty row
        config.dataSchema={_id:null, category:null, title:null, link:null, retention:null, on_site:null, off_site:null, total:null, remarks:null};

        //_id Column (hidden)
        config.columns.push({"data":"_id"});

        //Category Column
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

        // Retention Column
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

        //Add Event Functions
        config.afterChange = autoSave;
        config.beforeRemoveRow = beforeRemoveRow;

        return config;
      }
    };
}])

.factory('TipPicker', ["Template", "Schedule","RetentionCategories",
  function (Template, Schedule, RetentionCategories) {

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
    row.dept_id = Schedule._id;

    if(row.selected){
      Schedule.save_draft_record(row).then(function(res){
        self.setDataAtCell(rowNumber,0, res.data.record_id, "insertId");
      });
    }

    if(!row.selected){
      Schedule.delete_draft_record(row)
      .success(function(res){

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

      return config;
    }
  };
}])

.factory("HOTHelper", function(){
  //This is a collections of functions and
  //configurations used in Handsontable (HOT)
  // throughout this app.
   return{
     searchResultCounter : function (instance, row, col, value, result) {

         Handsontable.Search.DEFAULT_CALLBACK.apply(this, arguments);

        //  if (result) {
        //     searchResultCount++;
        //  }
     },
     config: function(addOns){
     // basic config
      var config = {};
      config.colHeaders = true;
      config.rowHeaders = true;
      config.autoColumnSize = false;
      config.manualColumnResize = true;
      config.currentRowClassName = "current-row";
      config.minSpareRows = 0;
      config.columnSorting = true;
      config.fixedRowsTop = false;
      config.autoWrapRow = true;
      config.search = true;
      config.contextMenu = ["row_above", "row_below", "remove_row"];

      if(typeof addOns != 'undefined'){
        for(var prop in addOns){
           config[prop] = addOns[prop];
        }
      }
      return config;
     },

     getFittedWidths : function(){
        var recordArr = arguments[0].slice();
        var maxColWidth = 800;
        var minColWidth = 100;
        var padding = 50; //accounts for arrow on dropdown fields
        var fittedColumnWidths = {};
        var longestPerField = {};
        var cols = arguments[1];
        var col;
        var sorter = function (property) {
            return function (a,b) {
              if(b[property] != null){bLength = b[property].length;}else{bLength = 0;}
              if(a[property] != null){aLength = a[property].length;}else{aLength = 0;}
              return bLength - aLength;
          };
        };

        for(var i = 0; i < cols.length; i++){
          longestPerField = recordArr.sort(sorter(cols[i].data))[0];
          col = cols[i].data;

          //no records in the record array, so column does not exits
          if(typeof longestPerField == 'undefined'){
            fittedColumnWidths[col] = minColWidth;
            continue;
          }

          // all values for the column are null; set minWidth
          if(longestPerField[col] == null){
            fittedColumnWidths[col] = minColWidth;
            continue;
          }

          if(typeof longestPerField[col] == "boolean"){
            fittedColumnWidths[col] = minColWidth;
            continue;
          }

          //visual field length greater than maxColWidth
          if (longestPerField[col].visualLength() > maxColWidth) {
            fittedColumnWidths[col] = maxColWidth;
            continue;
          }

          fittedColumnWidths[col] = longestPerField[col].visualLength() + padding;
        }

        return fittedColumnWidths;
    }
  };

})
;
})();
