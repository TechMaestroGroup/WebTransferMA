define(['CampaignUtility'], function(CampaignUtility){
  return{
    customerSegData : [],
    init: function() {
      var scope = this;
      var currentFormObject = kony.application.getCurrentForm();
      var currentForm=currentFormObject.id;
      applicationManager.getPresentationFormUtility().initCommonActions(this, "CALLBACK", currentForm, scope.backNavigation);
      this.ManageActivitiesPresenter = applicationManager.getModulesPresentationController({ "appName": "TransfersMA", "moduleName": "ManageActivitiesUIModule" });
    },
    
    /**
    * @api : preShow
    * Gets invoked initially before rendering of UI
    * @return : NA
    */
    preShow: function() {
      var self = this;
      if (kony.os.deviceInfo().name === "iPhone") {
        this.view.flxHeader.isVisible = false;
        this.view.flxMainContainer.top = "0dp";
      } else {
        this.view.flxMainContainer.top = "56dp";
      }
      this.view.flxSearch.top="0dp";
      this.initActions();
      this.setCustomerSeg(); // Customer list Segment UI

      applicationManager.getPresentationUtility().dismissLoadingScreen();
	    var config = applicationManager.getConfigurationManager();
      config.getDisputeConfigurations();
      var navManager = applicationManager.getNavigationManager();
      var currentForm = navManager.getCurrentForm();
      applicationManager.getPresentationFormUtility().logFormName(currentForm);
      let scopeObj = this;
      function campaignPopUpSuccess(response) {
        CampaignUtility.showCampaign(response, scopeObj.view);
      }

      function campaignPopUpError(response) {
        kony.print(response, "Campaign Not Found!");
      }
      CampaignUtility.fetchPopupCampaigns(campaignPopUpSuccess, campaignPopUpError);
    },

    /**
      Initializing the Actions
    */
    initActions: function() {
      var scope = this;
      this.view.customHeader.imgBack.src = "backbutton.png";
      this.resetUI();
      this.view.segCustomerList.onRowClick = this.onCustomerSelection.bind(this);
      this.view.customHeader.flxBack.onClick = this.backNavigation.bind(this);
      this.view.tbxSearch.onTextChange = this.showSearch.bind(this);
      this.view.imgSearchClose.onTouchEnd = this.cancelSearch.bind(this);
    },

    /**
     * @function : cancelSearch
     * @description : Invoked to set the UI on click on search cancel
    */
    cancelSearch: function(){
      this.resetUI();
    },

    /**
     * @function : showSearch
     * @description : Invoked to filter the searched data and set in segmentUI
    */
    showSearch: function() {
      this.view.imgSearchClose.isVisible = true;
      var searchText = this.view.tbxSearch.text.toLowerCase();
      if(searchText != "") {
        if(searchText.includes("..")) {
          let splitText = searchText.split("....");
          searchText = splitText.length === 2 ? splitText[0] : splitText[1];
        }
        var data = this.customerSegData;
        let result = this.filterData(data, searchText, "customerFullName"); //Filter the data based on search
        if (!(result.length > 0)) {      
          this.view.flxNoBeneficiaries.setVisibility(true);
          this.view.segCustomerList.setVisibility(false);
        } else {
          this.view.segCustomerList.setVisibility(true);
          this.view.segCustomerList.removeAll();
          this.view.segCustomerList.setData(result);
          this.view.flxNoBeneficiaries.setVisibility(false);
        }
      } else{
        this.resetUI();
      }
    },

    /**
     * @function : resetUI
     * @description : Reset the UI
    */
    resetUI: function() {
      this.view.segCustomerList.setVisibility(true);
      this.view.segCustomerList.removeAll();
      this.view.segCustomerList.setData(this.customerSegData);
      this.view.flxNoBeneficiaries.setVisibility(false);
      this.view.imgSearchClose.isVisible = false;
      this.view.tbxSearch.text = "";
    },

    /**
     * @function : filterData
     * @description : Filter the customer list
    */
    filterData: function(data, searchText, searchCriteria){
      let filteredData = [];
      filteredData = data.filter(function (record) {
        try {
          if (record[searchCriteria] && record[searchCriteria].toUpperCase().includes(searchText.toUpperCase())) {
            return true;
          }   
        } catch (err) {
            //implicit non-match, skip to next field or record
        }
      });
      return filteredData;
    },

    /**
     * @function : onCustomerSelection
     * @description : Invoke on customer row selected
    */
    onCustomerSelection: function () {
      if (!kony.sdk.isNullOrUndefined(this.view.segCustomerList.selectedRowItems[0])) {
        var selectedRowItem = this.view.segCustomerList.selectedRowItems[0];
        let result = this.showTick(selectedRowItem); // Function to show green tick for selected row
        this.view.segCustomerList.setData(result); // Setting the filteredData
        var navMan = applicationManager.getNavigationManager();
        var entryPoint = navMan.getEntryPoint("CustomerSearch");
        if (entryPoint === "frmEuropeManageBeneficiaries") {
          this.ManageActivitiesPresenter.filterPayees(selectedRowItem);
        } else if (entryPoint === "frmTransferActivitiesTransfersEurope") {
          this.ManageActivitiesPresenter.filterTransfersBasedOnCustomer(selectedRowItem);
        }
      }
    },

    /**
     * @function : showTick
     * @description : Invoke to show Tick Icon on selcted customer
    */
    showTick: function(selectedRowItem) {
      let filteredData = this.customerSegData; 
      if(!this.isEmptyNullUndefined(selectedRowItem)){
        filteredData.filter(function (record) {
          if (record.customerID === selectedRowItem.customerID) {
            record.imgSelectedTick.isVisible = true;
            record.imgSelectedTick.src = "new_tickmark.png";
            return;
          }   
          else {
            record.imgSelectedTick.isVisible = false;
            record.imgSelectedTick.src = "transparent.png";
            return;
          }
        });
      }
      else {
        return filteredData;
      }
      return filteredData;
    },

    /**
     * @function : setCustomerSeg
     * @description : Setting the customer list segment UI
    */
    setCustomerSeg: function() {
      var scope = this;
      try {
        let userPreferencesManager = applicationManager.getUserPreferencesManager();
        let accessibleCustomerIds = userPreferencesManager.accessibleCustomerIds;
        this.getWidgetDataMap(this.view.segCustomerList);
        const MAX_COMBINED_NAME_LENGTH = 22; // Set the max char limit to show in UI
        const SHORT_NAME_LENGTH = 16;
        this.customerSegData = [{
          "lblTitle" : kony.i18n.getLocalizedString("i18n.AccountsDetails.ALL"),
          "imgSelectedTick": {
            "isVisible": true,
            "src" : "new_tickmark.png",
          },
          "isAll" : true,
          "key" : 0,
          "customerID" : -1,
          "customerFullName" : kony.i18n.getLocalizedString("i18n.AccountsDetails.ALL"),
        }];
        
        for(var i = 0; i < accessibleCustomerIds.length; i++) {
          let fullName = accessibleCustomerIds[i].name+ " - "+accessibleCustomerIds[i].id;
          let selectedName = fullName;
          if (fullName.length>MAX_COMBINED_NAME_LENGTH) {
              let shortName = accessibleCustomerIds[i].name.substring(0,SHORT_NAME_LENGTH);
              let shortID = accessibleCustomerIds[i].id;
              if(accessibleCustomerIds[i].id.length>4){
                  shortID = accessibleCustomerIds[i].id.substring(accessibleCustomerIds[i].id.length-4);
              }
              selectedName = shortName+"..."+shortID;
          }
          this.customerSegData.push({
              "lblTitle" : selectedName,
              "imgSelectedTick": {
                "isVisible": false,
                "src" : "transparent.png",
              },
              "isAll" : false,
              "key" : i + 1,
              "customerID" : accessibleCustomerIds[i].id,
              "customerFullName" : fullName,
          });
        };
        var customerSelectedRow = this.ManageActivitiesPresenter.getSelectedRow();
        if (!this.isEmptyNullUndefined(customerSelectedRow)) {
          let result = this.showTick(customerSelectedRow); // Function to show green tick for selected row
          this.view.segCustomerList.setData(result); // Setting the filteredData
        } else {
          this.view.segCustomerList.setData(this.customerSegData);
        }
      } catch (err) {
        scope.onError(err);
      }
    },

    /**
     * @function : getWidgetDataMap
     * @description : Widget mapping for Customer segment
    */
    getWidgetDataMap: function(segWidget) {
      var scope = this;
      try {
          segWidget.widgetDataMap = {
            "flxCustomerSearchList": "flxCustomerSearchList",
            "flxTitleAndTickWrap": "flxTitleAndTickWrap",
            "lblTitle": "lblTitle",
            "imgSelectedTick": "imgSelectedTick"
          };
      } catch (err) {
        scope.onError(err);
      }
    },

    /**
     * @function : isEmptyNullUndefined
     * @description : Checking the data is empty, null, or undefined
    */
    isEmptyNullUndefined : function (data) {
      if (data === null || data === undefined || data === "") 
        return true;

      return false;
    },

    /**
     * @function : backNavigation
     * @description : Invoked onclick on back icon
    */
    backNavigation: function() {
      var navManager = applicationManager.getNavigationManager();
      var entryPoint = navManager.getEntryPoint("CustomerSearch");
      if(entryPoint === "frmEuropeManageBeneficiaries"){
        navManager.navigateTo({"appName":"TransfersMA","friendlyName":"ManageActivitiesUIModule/frmEuropeManageBeneficiaries"});
      }
      else if(entryPoint === "frmTransferActivitiesTransfersEurope"){
        navManager.navigateTo({"appName":"TransfersMA","friendlyName":"ManageActivitiesUIModule/frmTransferActivitiesTransfersEurope"});
      }     
    }
  };
});