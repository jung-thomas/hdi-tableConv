jQuery.sap.declare("sap.xsopen.tableConv.Component");


sap.ui.core.UIComponent.extend("sap.xsopen.tableConv.Component", {
	init: function(){
		jQuery.sap.require("sap.m.MessageBox");
		jQuery.sap.require("sap.m.MessageToast");		
		
		//Configuration Model
	     var oConfig = new sap.ui.model.json.JSONModel({});
        sap.ui.getCore().setModel(oConfig, "config"); 
        this.getSessionInfo();
        
        //Main Model
		  var model = new sap.ui.model.json.JSONModel({});
        model.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);		
        sap.ui.getCore().setModel(model);  
      
        // set i18n model
  		var i18nModel = new sap.ui.model.resource.ResourceModel({
  			bundleUrl : "./i18n/messagebundle.properties"
  		}); 
  		sap.ui.getCore().setModel(i18nModel, "i18n");  
	          
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
	},
	
	createContent: function() {
     
		var settings = {
				ID: "tableConv",
				title: "Catalog Table Converter",
				description: "Catalog Table Converter"
			};
		
		var oView = sap.ui.view({
			id: "app",
			viewName: "view.App",
			type: "XML",
			viewData: settings
		});
		
		 oView.setModel(sap.ui.getCore().getModel("i18n"), "i18n");
		 oView.setModel(sap.ui.getCore().getModel("config"), "config");		 
		 oView.setModel(sap.ui.getCore().getModel()); 		 
		return oView;
	},
	
	getSessionInfo: function(){
		var aUrl = "/rest/sessionInfo";
	    this.onLoadSession(
	    		JSON.parse(jQuery.ajax({
	    		       url: aUrl,
	    		       method: "GET",
	    		       dataType: "json",
	    		       async: false}).responseText));	    
	 
	},
	
	onLoadSession: function(myJSON){
		for( var i = 0; i<myJSON.session.length; i++)
	     {
		   var config =  sap.ui.getCore().getModel("config");
		   config.setProperty("/UserName",myJSON.session[i].UserName);
	     }
	}
});