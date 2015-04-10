(function(){
angular.module( 'sunshine.tip', [
        'ui.router',
        'ui.bootstrap'
    ])

.config(function config( $stateProvider ) {

    $stateProvider.state( 'tip', {
        url: '/tip',
        ncyBreadcrumb: {
          label: 'Recommendations'
        },
        views: {
            "admin": {
                //controller: 'DashBoardCtrl',
                templateUrl: 'tip/tip.tpl.html'
            }
        },
        data:{ pageTitle: 'Administration - Dashboard',
        authorizedRoles: ['Administrator', 'Publisher'],
        footer:false}
    });
})

.controller('TipCtrl', function tipCtrl( $rootScope, Schedule, Template,
 TipEdit, HOTHelper) {
  var self = this;
  var tip_Handsontable;
  self.draft_dept = $rootScope.selected_draft_dept;
  self.tip_grid = document.getElementById('tip-grid');
  self.tip_count = document.getElementById("tip-count");
  self.searchResults = [];
  self.selSearchResult = -1;
  self.status = "saved";


    Template.get()
      .then(function (data){
        var template = Template.all;

        //Add runtime settings
          var settings = HOTHelper.config(TipEdit.config());
         var l = HOTHelper.getFittedWidths.call(tip_Handsontable, template, settings.columns);
         settings.search = {callback: HOTHelper.searchResultCounter};
         settings.manualColumnResize = [1, l.category, l.title, l.link, l.retention, l.on_site, l.off_site, l.total, l.remarks, l.is_visible ];
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

.factory('TipEdit', ["Template", "RetentionCategories", "HOTHelper",
  function (Template, RetentionCategories, HOTHelper) {

    // Division Autocomplete Function
    var categoryAutoComplete = function(query, process){
       var vals = this.instance.getDataAtCol(1);
       var uniqueVals = vals.unique().sort().nulless();

       process(uniqueVals);
     };

    //Before Save
    var beforeSave = function(change, source){
      var tip_status = document.getElementById("tip-status");
      tip_status.innerHTML = "saving";
    };

    var setStatus = function(str){
      var tip_status = document.getElementById("tip-status");
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
      var colCount = this.countCols();

      //set visibility
      row.is_visible = "Visible";
      for(var i = 0; i< colCount; i++){
        if(!this.getCellMeta(rowNumber, i).valid){
          row.is_visible = "Hidden";
          break;
        }

        if(row.title == null){
          row.is_visible = "Hidden";
          break;
        }
      }

      Template.upsert(row).then(function(res){
        if(row._id == null){
          self.setDataAtCell(rowNumber,8, res.data.is_visible, "fixValidationOfNewRow");
        }
         self.setDataAtCell(rowNumber,0, res.data._id, "insertId");
         setStatus("saved");
       });
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

    var afterRender = function(){
      this.validateCells(function(){});
    };

    return {
      config : function(){
        var config = {};
        config.columns = [];
        config.minSpareRows = 1;
        //config.contextMenu = false;
        config.contextMenu = ["row_above", "row_below", "remove_row"];
        config.colHeaders = ["_id","Category", "Title", "Link", "Retention", "On-site", "Off-site", "Total", "Remarks", "Visibility"];

        //schema for empty row
        config.dataSchema={_id:null, category:null, title:null, link:null, retention:null, on_site:null, off_site:null, total:null, remarks:null, is_visible: null};

        //_id Column (hidden)
        config.columns.push({"data":"_id"});

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

        // Retention Column
        var retentionConfig = {};
        retentionConfig.data = "retention";
        retentionConfig.type = "autocomplete";
        retentionConfig.source = RetentionCategories;
        retentionConfig.allowInvalid = true;
        retentionConfig.validator = HOTHelper.retentionValidator;
        config.columns.push(retentionConfig);

        // On-site Column
        var onSiteConfig = {};
        onSiteConfig.data = "on_site";
        config.columns.push(onSiteConfig);

        // Off-site Column
        var offSiteConfig = {};
        offSiteConfig.data = "off_site";
        config.columns.push(offSiteConfig);
        // Total Column
        config.columns.push({"data":"total"});

        // Remarks Column
        config.columns.push({"data":"remarks"});

        // Visibility Column
        var isVisibleConfig = {};
        isVisibleConfig.data = "is_visible";
        isVisibleConfig.readOnly = true;
        config.columns.push(isVisibleConfig);

        //Add Event Functions
        config.afterChange = autoSave;
        config.beforeRemoveRow = beforeRemoveRow;
        config.beforeChange = beforeSave;
        config.afterRender = afterRender;


        return config;
      }
    };
}])

.factory("HOTHelper", ["RetentionCategories", function(RetentionCategories){
  //This is a collections of functions and
  //configurations used in Handsontable (HOT)
  // throughout this app.
   return{

      retentionValidator : function(value, callback){
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
      },
     isRequired : function(value, callback){
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
     },
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
      //config.fixedRowsTop = false;
      config.autoWrapRow = true;
      config.search = true;
      config.contextMenu = ["row_above", "row_below", "remove_row"];
      //config.contextMenu = true;

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
        var minColWidth = 120;
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

}])
;
})();
