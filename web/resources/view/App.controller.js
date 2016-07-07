sap.ui.controller("view.App", {
	tablesJSON : null,	
    onInit: function(){
    	 var view = this.getView();
         view.addStyleClass("sapUiSizeCompact"); // make everything inside this View appear in Compact mode
         view.byId("Schema").setFilterFunction(this.getView().getController().filterFunction);
         view.byId("Table").setFilterFunction(this.getView().getController().filterFunction);    	
    },

    filterFunction: function(sTerm, oItem) {
        if (sTerm === "*") {
            return true;
        } else {
            return jQuery.sap.startsWithIgnoreCase(oItem.getText(), sTerm);
        }
    },

    escapeHtml: function(string) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
           "\"": "&quot;",
            "'": "&#39;",
            "/": "&#x2F;",
            "{": "&#123;",
            "}": "&#125"
        };

        return String(string).replace(/[&<>"'\/{}]/g, function(s) {
            return entityMap[s];
        });
    }, 
    
	onConversionDisplay: function(){
		var oController = this.getView().getController();
		var oModel = sap.ui.getCore().getModel();
		var table = oModel.getProperty("/Table");
		var UrlHDBCDS = "/rest/hdbcds"; 

		
		for( var i = 0; i<oController.tablesJSON.length; i++){
			if(oController.tablesJSON[i].TABLE_NAME===table){
				UrlHDBCDS += "/" + escape(oController.tablesJSON[i].TABLE_OID);
			}
		}

		jQuery.ajax({
			url : UrlHDBCDS,
			method : "GET",
			dataType : "text",
			success : oController.onInsertHDBCDS,
			error : oController.onErrorCall	});
			
	},
	
	 onInsertHDBCDS: function(myTXT) {
			var oController = sap.ui.getCore().byId("app").getController();
			 var html = new sap.ui.core.HTML({
		            // static content
		            content: "<div id=\"content1\" class=\"wiki\"><div class=\"code\"><pre>" + oController.escapeHtml(myTXT) + "\n" + "</pre></div></div>",
		            preferDOM: false
		        });			
			 sap.ui.getCore().byId("app").byId("CDSTABLEPanelContent").removeAllContent();
			 sap.ui.getCore().byId("app").byId("CDSTABLEPanelContent").addContent(html);
		},
	
	 //Schema Filter
	 loadSchemaFilter: function(oEvent){
		   var oController = this.getView().getController();
		   var gSearchParam = oEvent.getParameter("suggestValue");
		   if( typeof (gSearchParam) !== "undefined"){
			   if(gSearchParam === "*"){gSearchParam="";}
		   }
		   else{ gSearchParam = "";}	
		    var aUrl = "/rest/schemas/" + escape(gSearchParam);
		    jQuery.ajax({
		       url: aUrl,
		       method: "GET",
		       dataType: "json",
		       success: oController.onLoadSchemaFilter,
		       error: oController.onErrorCall });
	 },	 
	 onLoadSchemaFilter: function(myJSON){
		  var oSearchControl = sap.ui.getCore().byId("app--Schema"); 
		  oSearchControl.destroySuggestionItems();
		  for( var i = 0; i<myJSON.length; i++)
		     {
			  oSearchControl.addSuggestionItem(new sap.ui.core.Item({
				  text: myJSON[i].SCHEMA_NAME
		     }));
	      }
	},
	 
		//Table Filter
		 loadTableFilter: function(oEvent){
			   var oController = this.getView().getController();
			   var oModel = sap.ui.getCore().getModel();			   
			   var gSearchParam = oEvent.getParameter("suggestValue");
			   if( typeof (gSearchParam) !== "undefined"){
				   if(gSearchParam === "*"){gSearchParam="";}
			   }
			   else{ gSearchParam = "";}
			   
			   var schemaName = oModel.getProperty("/Schema");
			   var aUrl = "/rest/tables/" +escape(schemaName) + "/" +gSearchParam;
			    jQuery.ajax({
			       url: aUrl,
			       method: "GET",
			       dataType: "json",
			       success: oController.onLoadTableFilter,
			       error: oController.onErrorCall });
		 },		 
		 onLoadTableFilter: function(myJSON){
			   var oController = sap.ui.getCore().byId("app").getController();
			   oController.tablesJSON = myJSON;
			  var oSearchControl = sap.ui.getCore().byId("app--Table");
			  oSearchControl.destroySuggestionItems();
			  for( var i = 0; i<myJSON.length; i++)
			     {
				  oSearchControl.addSuggestionItem(new sap.ui.core.Item({text: myJSON[i].TABLE_NAME}));

			     }
			},
			
	   onDownloadText: function(){
		   var oController = this.getView().getController();	
		   oController.onMassDownload("txt");		   
	   },
			   
	   onDownloadZip: function(){
		   var oController = this.getView().getController();
		   oController.onMassDownload("zip");
	   },
	   
	   onMassDownload: function(type){
		    var oModel = sap.ui.getCore().getModel();
			var table = oModel.getProperty("/Table");
			var schema = oModel.getProperty("/Schema");			
			var UrlDownload = "/rest/download/" + escape(schema)+ "/"  + escape(type)  + "/"; 
			if (!(typeof table === "undefined" || table === null || table === "")) { UrlDownload += escape(table); } 
			window.open(UrlDownload);
			return;	
	   },    
    onErrorCall: function(jqXHR) {
        if (jqXHR.responseText === "NaN") {
            sap.m.MessageBox.alert("Invalid Input Value");
        } else {
            sap.m.MessageBox.alert(escape(jqXHR.responseText) );
        }
        return;
    }    
});