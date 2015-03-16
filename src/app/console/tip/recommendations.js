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

.controller( 'tipCtrl', function tipCtrl( $rootScope, Schedule, Template,
  tipFunctionsEdit, tipConfigEdit, tipFunctionsPicker,
  tipConfigPicker) {
  var self = this;
  var rec_Handsontable;

  self.draft_dept = $rootScope.selected_draft_dept;
  self.rec_edit = document.getElementById('rec-edit');
  //console.log(Schedule);

    //Handsontable.Dom.addEvent(rec_search, 'keyup', function (event) {
    //  searchResultCount = 0;
    //  self.selSearchResults = 0;
      //var queryResult = thisHandsontable.search.query(this.value);
      //resultCount.innerText = searchResultCount.toString();
      //self.searchResults = queryResult;
      //thisHandsontable.render();
    //});


    if (Schedule.draft != null){
      Template.getByDeptId(Schedule.draft._id)
        .then(function (data){
          var template = Template.for_dept;
          console.log(tipFunctionsPicker);
          var l = tipFunctionsPicker.getFittedColumnWidths.call(rec_Handsontable, template, tipConfigPicker.columns);

          tipConfigPicker.afterChange = tipFunctionsPicker.autoSave;
          tipConfigPicker.beforeRemoveRow = tipFunctionsPicker.beforeRemoveRow;
          tipConfigPicker.search = {callback: tipFunctionsPicker.searchResultCounter};
          tipConfigPicker.columns[1].source = tipFunctionsPicker.categoryAutoComplete;

          tipConfigPicker.manualColumnResize = [1, l.selected, l.category, l.title, l.link, l.retention, l.on_site, l.off_site, l.total, l.remarks ];
          tipConfigPicker.data = template;
          self.rec_edit.style.visibility = 'hidden';
          if(typeof rec_Handsontable == 'undefined'){
            console.log("new");
            rec_Handsontable = new Handsontable(self.rec_edit, tipConfigPicker);
          }
          else{
            console.log("existing");
            rec_handsontable.updateSettings(tipConfigPicker);
          }
          self.rec_edit.style.visibility = 'visible';
        });
    }

    if(Schedule.draft == null){
      Template.get()
        .then(function (data){
          var template = Template.all;
          var l = tipFunctionsEdit.getFittedColumnWidths.call(rec_Handsontable, template, tipConfigEdit.columns);

          tipConfigEdit.afterChange = tipFunctionsEdit.autoSave;
          tipConfigEdit.beforeRemoveRow = tipFunctionsEdit.beforeRemoveRow;
          tipConfigEdit.search = {callback: tipFunctionsEdit.searchResultCounter};
          tipConfigEdit.columns[1].source = tipFunctionsEdit.categoryAutoComplete;

          tipConfigEdit.manualColumnResize = [1, l.category, l.title, l.link, l.retention, l.on_site, l.off_site, l.total, l.remarks ];
          tipConfigEdit.data = template;
          self.rec_edit.style.visibility = 'hidden';
          if(typeof rec_Handsontable == 'undefined'){
            rec_Handsontable = new Handsontable(self.rec_edit, tipConfigEdit);
          }
          self.rec_edit.style.visibility = 'visible';
        });
    }
})


.factory('tipFunctionsEdit',["Template", function(Template){
  return {
    searchResultCounter : function (instance, row, col, value, result) {

        Handsontable.Search.DEFAULT_CALLBACK.apply(this, arguments);

        if (result) {
           searchResultCount++;
        }
    },

    //Use the longest string for each field to calculate the initial
    //length of each column
    getFittedColumnWidths : function(){
      var recordArr = arguments[0];
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

      //cols = this.getSettings().columns;

      for(var i = 0; i < cols.length; i++){
        longestPerField = recordArr.sort(sorter(cols[i].data))[0];
        col = cols[i].data;

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
    },


    //Autosave function
    autoSave : function(change,source){

      var self = this;

      if (source === 'loadData') {return;} //dont' save this change
      if (source === 'insertId') {return;} // stops an endless loop when the new record id is added after an insert

      var data = change[0];

      // transform sorted row to original row
      var rowNumber = this.sortIndex[data[0]] ? this.sortIndex[data[0]][0] : data[0];
      var row = this.getSourceDataAtRow(rowNumber);

      Template.upsert(row).then(function(res){
         self.setDataAtCell(rowNumber,0, res.data._id, "insertId");
       });
    },

    // Division Autocomplete Function
    categoryAutoComplete : function(query, process){
      var vals = this.instance.getDataAtCol(1);
      var uniqueVals = vals.unique().sort().nulless();

      process(uniqueVals);
    },


    //remove one record from the database
    beforeRemoveRow : function(index, amount){

        var rowNumber = this.sortIndex[index] ? this.sortIndex[index][0] : index;
        var row = this.getSourceDataAtRow(rowNumber);

        Template.del(row)
        .success(function(res){

        })
        .error(function(err){
          console.log(err);
        });
    }
  };
}])

.factory('tipConfigEdit', function (RetentionCategories) {

    // basic config
    var config = {};
    config.colHeaders = true;
    config.rowHeaders = true;
    config.autoColumnSize = false;
    config.manualColumnResize = true;
    config.currentRowClassName = "current-row";
    config.minSpareRows = 1;
    config.columnSorting = {column:1};
    config.fixedRowsTop = false;
    config.columns = [];
    config.autoWrapRow = true;
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

    return config;
})

.factory('tipConfigPicker', function (RetentionCategories) {

    // basic config
    var config = {};
    config.colHeaders = true;
    config.rowHeaders = true;
    config.autoColumnSize = false;
    config.manualColumnResize = true;
    config.currentRowClassName = "current-row";
    config.minSpareRows = 0;
    config.columnSorting = {column:1};
    config.fixedRowsTop = false;
    config.columns = [];
    config.autoWrapRow = true;
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
    config.columns.push({"data":"category"});

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

    return config;
})

.factory('tipFunctionsPicker',["Template", function(Template){
  return {
    searchResultCounter : function (instance, row, col, value, result) {

        Handsontable.Search.DEFAULT_CALLBACK.apply(this, arguments);

        if (result) {
           searchResultCount++;
        }
    },

    //Use the longest string for each field to calculate the initial
    //length of each column
    getFittedColumnWidths : function(){
      var recordArr = arguments[0];
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

      //cols = this.getSettings().columns;

      for(var i = 0; i < cols.length; i++){
        longestPerField = recordArr.sort(sorter(cols[i].data))[0];
        col = cols[i].data;

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
    },


    //Autosave function
    autoSave : function(change,source){

      // var self = this;
      //
      // if (source === 'loadData') {return;} //dont' save this change
      // if (source === 'insertId') {return;} // stops an endless loop when the new record id is added after an insert
      //
      // var data = change[0];
      //
      // // transform sorted row to original row
      // var rowNumber = this.sortIndex[data[0]] ? this.sortIndex[data[0]][0] : data[0];
      // var row = this.getSourceDataAtRow(rowNumber);
      //
      // Template.upsert(row).then(function(res){
      //    self.setDataAtCell(rowNumber,0, res.data._id, "insertId");
      //  });
    },


    //remove one record from the database
    beforeRemoveRow : function(index, amount){

        // var rowNumber = this.sortIndex[index] ? this.sortIndex[index][0] : index;
        // var row = this.getSourceDataAtRow(rowNumber);
        //
        // Template.del(row)
        // .success(function(res){
        //
        // })
        // .error(function(err){
        //   console.log(err);
        // });
    }
  };
}])
;
