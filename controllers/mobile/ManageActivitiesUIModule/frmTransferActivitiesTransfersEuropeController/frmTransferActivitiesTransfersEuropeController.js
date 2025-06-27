define(['CommonUtilities'],function(CommonUtilities){ 
  return{
  init: function () {
    var scope=this;
    var navManager = applicationManager.getNavigationManager();
    var currentForm = navManager.getCurrentForm();
    this.transferModPresentationController = applicationManager.getModulesPresentationController({"moduleName" : "ManageActivitiesUIModule", "appName" : "TransfersMA"});
    applicationManager.getPresentationFormUtility().initCommonActions(this, "CALLBACK", currentForm, scope.navigateCustomBack);
  },
  preShow: function () {
    if (kony.os.deviceInfo().name === "iPhone") {
      this.view.flxHeader.isVisible = false;
    }
    else {
      this.view.flxHeader.isVisible = true;
    }
    let userPreferencesManager = applicationManager.getUserPreferencesManager();
    if (userPreferencesManager.isSingleCustomerProfile) {
      this.view.flxSearchandFilters.isVisible = true;
      this.view.flxAdvanceSearch.isVisible = false;
      this.view.flxFilterWrap.isVisible = false;
      if (kony.os.deviceInfo().name === "iPhone") {
        this.view.flxTransfersList.top = "132dp"; 
      }
      else {
        this.view.flxTransfersList.top = "188dp"; 
      }
    } 
    else {
      this.view.flxSearchandFilters.isVisible = false;
      this.view.flxAdvanceSearch.isVisible = true;
      this.view.flxFilterWrap.isVisible = true;
      if (kony.os.deviceInfo().name === "iPhone") {
        this.view.flxTransfersList.top = "182dp"; 
      }
      else {
        this.view.flxTransfersList.top = "238dp"; 
      }
    }
    this.view.TransfersListMobileNative.isVisible = true;
    this.view.flxAdvanceSearchIcon.onClick = this.navigateToAdvanceSearch; //On Advance Search Onclick
    var config = applicationManager.getConfigurationManager();
    config.getDisputeConfigurations();
    var navManager = applicationManager.getNavigationManager();
    this.initActions();
    this.view.flxClearWrap.onClick = this.clearSearchData.bind(this); //OnClick of Clear Search
    var viewByLabel = this.transferModPresentationController.getSelectedViewBy();
    if(kony.sdk.isNullOrUndefined(viewByLabel)) {
      this.view.lblCustomerValue.text = viewByLabel;
    } else {
      if (this.view.lblViewByValue.text === "Customer") {
        let selectedCustomerName = this.transferModPresentationController.getSelectedCustomerName();
        if (!kony.sdk.isNullOrUndefined(selectedCustomerName)) {
          this.view.lblCustomerValue.text = selectedCustomerName;
        }
      } else if (this.view.lblViewByValue.text === "Account") {
        let selectedAccountName = this.transferModPresentationController.getSelectedAccountName();
        if (!kony.sdk.isNullOrUndefined(selectedAccountName.text)) {
          this.view.lblCustomerValue.text = selectedAccountName.text;
          this.view.flxSearchAccounts.isVisible = false;
          this.view.flxAdvanceSearch.isVisible = true;
          this.view.TransfersListMobileNative.isVisible = true; 
          this.view.lblCustomerValue.skin = "sknLbl424242SSP26px";
          this.view.flxTransfersList.skin = "slFboxmb";
        }
      }
    }
    if (navManager.getCustomInfo("frmTransferActivitiesTransfersEurope")) {
      var response = navManager.getCustomInfo("frmTransferActivitiesTransfersEurope").DELETE;
      if(response) {
        this.showToastMessage(response);
      }
      navManager.setCustomInfo("frmTransferActivitiesTransfersEurope", null);
    }
    
    var currentForm = navManager.getCurrentForm();
    applicationManager.getPresentationFormUtility().logFormName(currentForm);
    applicationManager.getPresentationUtility().dismissLoadingScreen();
  },

  /**
	 * checks if data is empty, null or undefined
	 * @param {*} data
	 * @returns boolean
	*/
	isEmptyNullUndefined: function (data) {
		if (data === null || data === undefined || data === "") {
			return true;
		}
		if (typeof data === "object") {
			if (Object.keys(data).length > 0) {
				return false;
			}
			return true;
		}
		return false;
	},

  /**
    Setting the search data count
  */
  setSearchDataCount: function(){
    let searchedDataCount = this.transferModPresentationController.getSearchedDataCount();
    if(searchedDataCount > 0){
      this.view.lblInfoLabel.isVisible = false;
      this.view.flxClearSearch.isVisible = true;
      this.view.flxNotification.isVisible = true;
      this.view.lblNotification.text = "" + searchedDataCount;
    } else {
      this.view.lblInfoLabel.isVisible = true;
      this.view.flxClearSearch.isVisible = false;
      this.view.flxNotification.isVisible = false;
    }
  },

  /**
    OnClick of Clear, clearing the search
  */
  clearSearchData: function(){
    this.view.lblInfoLabel.isVisible = true;
    this.view.flxClearSearch.isVisible = false;
    this.view.flxNotification.isVisible = false;
    this.transferModPresentationController.clearAdvSearchOptions();
    this.transferModPresentationController.clearAdvSearchBtnData();
    let advSearchedData = this.transferModPresentationController.getAdvSearchBtnData();
    if(advSearchedData.isSearch === false) {
      this.transferModPresentationController.filterTransfersAdvSearch(advSearchedData);
    }
  },

  /**
    Navigate to advance search
  */
  navigateToAdvanceSearch: function(){
    var navManager = applicationManager.getNavigationManager();
    navManager.navigateTo({"appName" : "TransfersMA", "friendlyName" : "ManageActivitiesUIModule/frmTransfersAdvanceSearch"});
  },
  
  showToastMessage: function(response) {
    var scope = this;
    var formattedText =  kony.i18n.getLocalizedString('i18n.kony.transfers.transactionCancelSuccess');
    response.formattedSuccessText = formattedText;
    response.isSuccess = true;
    this.view.CancelTransactionPopup.setContext(response);
    this.view.flxCancelPopup.setVisibility(true);
    this.view.CancelTransactionPopup.contextualActionButtonOnClick = function(btnAction){
      if(btnAction)
        scope.view.flxCancelPopup.setVisibility(false);
    };
  },
  
  showToastMessageErr: function(err) {
    var scope = this;
    var errorObject = {};
    if (err.serverErrorRes.errorDetails) {
      errorObject.messageDetails = err.serverErrorRes.errorDetails;
    } else {
      var formattedResponse = [];
      var errMsg = {};
      errMsg.message = err.errorMessage;
      errMsg.imgIcon = " ";
      formattedResponse.push(errMsg);
      errorObject.messageDetails = JSON.stringify(formattedResponse);
    }
    if(err.formattedText){
        errorObject.formattedFailedText = err.formattedText;
      }
    errorObject.isSuccess = false;
    this.view.CancelTransactionPopup.setContext(errorObject);
    this.view.flxCancelPopup.setVisibility(true);
    this.view.CancelTransactionPopup.contextualActionButtonOnClick = function(btnAction){
      if(btnAction)
        scope.view.flxCancelPopup.setVisibility(false);
    };
  },
  
  bindGenericError: function (error) {
    applicationManager.getPresentationUtility().dismissLoadingScreen();
    var scope = this;
    var formattedText = kony.i18n.getLocalizedString("i18n.payments.errorInFetchingAttachements");
    error.formattedText = formattedText;
    scope.showToastMessageErr(error);
  },
  
  initActions: function () {
    var scope = this;
    var navMan = applicationManager.getNavigationManager();
    this.view.customHeader.flxBack.onClick = this.navigateCustomBack;
    this.view.flxCustomerValue.onClick = this.navigateToSearch;
    this.view.flxViewBy.onClick = function () {
      scope.navigateToViewBy("ViewBy");
    };
    this.view.BottomSheet.onDismissCallBack = this.hideViewByPopup;

    this.view.TransfersListMobileNative.onRequestStart = function () {
      applicationManager.getPresentationUtility().showLoadingScreen();
    };
    this.view.TransfersListMobileNative.onRequestEnd = function () {
      applicationManager.getPresentationUtility().dismissLoadingScreen();
    };
    
    this.view.TransfersListMobileNative.getTransactionsData = function(){};
    this.view.TransfersListMobileNative.onSwipeButtonClick = function(rowData){
      if (rowData.id === "repeat") {
        scope.repeatTrans(rowData);
      }
      else if (rowData.id === "edit") {
        scope.editTrans(rowData)
      }
    };
    this.view.TransfersListMobileNative.onDeleteSuccess = function(response){
      scope.showToastMessage(response);
    };
    this.view.TransfersListMobileNative.onDeleteError = function(err){
      var formattedText = kony.i18n.getLocalizedString('i18n.kony.transfers.transactionCancelFailed');
      err.formattedText = formattedText;
      scope.errorMessage(err);
    };
    this.view.TransfersListMobileNative.onRowClick = function(data) {
      applicationManager.getPresentationUtility().showLoadingScreen();
      var transferModPresentationController = applicationManager.getModulesPresentationController({"moduleName" : "ManageActivitiesUIModule", "appName" : "TransfersMA"});
      transferModPresentationController.retriveAttachments(data, scope.attachmentsSuccessCallback.bind(this,data));
    };
    this.view.TransfersListMobileNative.onFetchError = function(err){
      if (err["isServerUnreachable"]) {
        applicationManager.getPresentationUtility().dismissLoadingScreen();
        applicationManager.getPresentationInterruptHandler().showErrorMessage("postLogin", err);
      } else { 
        applicationManager.getDataProcessorUtility().showToastMessageError(scope, err["errorMessage"]);
      }
      applicationManager.getPresentationUtility().dismissLoadingScreen();
    };
    
  },

  //Populate default customer 
  populateDefaultCustomer: function (){
    let userPreferencesManager = applicationManager.getUserPreferencesManager();
    let accessibleCustomerIds = userPreferencesManager.accessibleCustomerIds;
    const MAX_COMBINED_NAME_LENGTH = 22; // Set the max char limit to show in UI
    const SHORT_NAME_LENGTH = 16;
    let primaryCustomerId = userPreferencesManager.primaryCustomerId.id;
    let accounts = applicationManager.getConfigurationManager().userAccounts;
    let accountCount = accounts.length ? accounts.length : 0;
    let accountsCountConfig = applicationManager.getConfigurationManager().getConfigurationValue('accsCountCompactDashboard') ? applicationManager.getConfigurationManager().getConfigurationValue('accsCountCompactDashboard') : 10;
    let defaultIndex = 0;
    if(accountCount > accountsCountConfig){
    for (var i = 0; i < accessibleCustomerIds.length; i++) {
      if (accessibleCustomerIds[i].id === primaryCustomerId) {
        defaultIndex = i;
        break;
      }
    }
    let fullName = accessibleCustomerIds[defaultIndex].name + " - " + accessibleCustomerIds[defaultIndex].id;
    let custName = fullName;
      if (fullName.length > MAX_COMBINED_NAME_LENGTH) {
        let shortName = accessibleCustomerIds[defaultIndex].name.substring(0, SHORT_NAME_LENGTH);
        let shortID = accessibleCustomerIds[defaultIndex].id;
        if (accessibleCustomerIds[defaultIndex].id.length > 4) {
          shortID = accessibleCustomerIds[defaultIndex].id.substring(accessibleCustomerIds[defaultIndex].id.length - 4);
        }
        custName = shortName + "..." + shortID;
      }
    let customerDet = {};
    customerDet.customerID = accessibleCustomerIds[defaultIndex].id;
    customerDet.lblTitle = custName;
    var transferModPresentationController = applicationManager.getModulesPresentationController({"moduleName" : "ManageActivitiesUIModule", "appName" : "TransfersMA"});
    transferModPresentationController.setDefaultCustomerDetails(customerDet);
    }
  },

    //Navigate to customer search form  
    navigateToSearch: function () {
      var navMan = applicationManager.getNavigationManager();
      if (this.view.lblViewByValue.text === "Customer") {
        navMan.setEntryPoint("CustomerSearch", "frmTransferActivitiesTransfersEurope");
        this.transferModPresentationController.commonFunctionForNavigation({ "appName": "TransfersMA", "friendlyName": "ManageActivitiesUIModule/frmBeneficiaryCustomerSearch" });
      } else if(this.view.lblViewByValue.text === "Account") {
        this.transferModPresentationController.getFromAccountsSearchList(); 
      }
    },

  //To open Account search bottom sheet
  navigateToViewBy: function (selectedField) {
    let context = {};
    let selectedRow = this.transferModPresentationController.getSelectedStatusRow(selectedField);
    context.selectedField = "ViewBy";
    context.viewBy = {
      masterData: [{
        "lblBottomSheet": kony.i18n.getLocalizedString("kony.mb.FilterAccounts.Customer"),
        "lblBottomSheetHeader": "ViewBy",
        "keyName": "Customer",
        "key": 1,
        "imgSelect": {
          "isVisible": true,
          "src": "new_tickmark.png",
        },
      }, {
        "lblBottomSheet": kony.i18n.getLocalizedString("i18n.approvals.account"),
        "lblBottomSheetHeader": "ViewBy",
        "keyName": "Account",
        "key": 2,
        "imgSelect": {
          "isVisible": false,
          "src": "transparent.png",
        },
      }], 
      headerContext: kony.i18n.getLocalizedString("kony.mb.AlertSettings.ViewBy"),
      selectedRow: selectedRow
    };
    this.view.BottomSheet.setContext(context);
    this.view.flxBottomSheet.setVisibility(true);
    this.view.BottomSheet.showPopup();
  },

    /**
     * hides view by popup
     */
    hideViewByPopup: function (selectedRowItem) { 
      var navMan = applicationManager.getNavigationManager();        
      this.transferModPresentationController.setSelectedStatusRow(selectedRowItem);
      this.view.flxBottomSheet.setVisibility(false); 
      if(!this.isEmptyNullUndefined(selectedRowItem.lblBottomSheet)) {
        this.transferModPresentationController.setSelectedViewBy(selectedRowItem);
        this.view.lblViewByValue.text = selectedRowItem.lblBottomSheet;
      }
      if (this.view.lblViewByValue.text === kony.i18n.getLocalizedString("kony.mb.FilterAccounts.Customer")) {
        this.view.lblCustomerValue.text = applicationManager.getPresentationUtility().getStringFromi18n("i18n.AccountsDetails.ALL");
        this.view.flxAdvanceSearch.isVisible = true;
        this.view.TransfersListMobileNative.isVisible = true;
        this.view.flxSearchAccounts.isVisible = false;
        this.view.TransfersListMobileNative.isVisible = true; 
        this.view.lblCustomerValue.skin = "sknLbl424242SSP26px";
        this.view.flxTransfersList.skin = "slFboxmb";
        this.transferModPresentationController.clearSelectedAccount(); //Clearing the Selected Account
        navMan.navigateTo("ManageActivitiesUIModule/frmTransferActivitiesTransfersEurope");
      } else if (this.view.lblViewByValue.text === kony.i18n.getLocalizedString("i18n.approvals.account")) {
        this.view.lblCustomerValue.text = applicationManager.getPresentationUtility().getStringFromi18n("kony.mb.CM.selectAccount");
        this.transferModPresentationController.clearSelectedCustomer(); //Clearing Selected Customer
        this.view.flxSearchAccounts.isVisible = true;
        if(this.view.flxSearchAccounts.isVisible === true){
          this.view.flxAdvanceSearch.isVisible = false;
          this.view.TransfersListMobileNative.isVisible = false; 
          this.view.lblCustomerValue.skin = "sknMMLeftLabels";
          this.view.flxTransfersList.skin = "ICsknFlxffffff";
        } 
        if (kony.os.deviceInfo().name === "iPhone") {
          this.view.flxTransfersList.top = "82dp";
        }
        else {
          this.view.flxTransfersList.top = "158dp";
        }
      }
    },

  errorMessage: function(err) {
    var scope = this;
    if (err["isServerUnreachable"]) {
      applicationManager.getPresentationUtility().dismissLoadingScreen();
      applicationManager.getPresentationInterruptHandler().showErrorMessage("postLogin", err);
    } else { 
        scope.showToastMessageErr(err);
    } 
  },
	attachmentsSuccessCallback : function(data,response){
    if(response.fileNames){
    data.fileNames = response.fileNames;
    if("TPP" === data.orderInitiationType){
        data.repeatTransaction = [];
    }else{
        data.repeatTransaction = {"repeat": "false"};//dummy names added
    }
    var navMan = applicationManager.getNavigationManager();
    navMan.setCustomInfo("frmTransfersDetailsEurope", data);
    navMan.setEntryPoint("europeTransferFlow", "frmTransferActivitiesTransfersEurope");
    navMan.navigateTo("ManageActivitiesUIModule/frmTransfersDetailsEurope");
    }
  },
  navigateCustomBack: function () {
    var navManager = applicationManager.getNavigationManager();
    var entryPoint = navManager.getEntryPoint("acknowledgementform");
    var accountMod = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"HomepageMA","moduleName":"AccountsUIModule"});
    accountMod.presentationController.showDashboard();
  },
  //Updating the search deatils
  updateSearchOptions: function(navData){
    if (!this.isEmptyNullUndefined(navData.debitAccountId)) {
      this.searchedData.debitAccountId = navData.debitAccountId;
    }
    if (!this.isEmptyNullUndefined(navData.customerId)) {
      this.searchedData.customerId = navData.customerId;
    }
    if (!this.isEmptyNullUndefined(navData.paymentOrderId)) {
      this.searchedData.paymentOrderId = navData.paymentOrderId;
    }
    if (!this.isEmptyNullUndefined(navData.debitAccountId)) {
      this.searchedData.debitAccountId = navData.debitAccountId;
    }
    if (!this.isEmptyNullUndefined(navData.payeeAccountId)) {
      this.searchedData.payeeAccountId = navData.payeeAccountId;
    }
    if (!this.isEmptyNullUndefined(navData.statusDescription)) {
      this.searchedData.statusDescription = navData.statusDescription;
    }
    if (!this.isEmptyNullUndefined(navData.transactionPeriod)) {
      this.searchedData.transactionPeriod = navData.transactionPeriod;
    }
    if (!this.isEmptyNullUndefined(navData.searchStartDate)) {
      this.searchedData.searchStartDate = navData.searchStartDate;
    }
    if (!this.isEmptyNullUndefined(navData.searchEndDate)) {
      this.searchedData.searchEndDate = navData.searchEndDate;
    }
    if (!this.isEmptyNullUndefined(navData.searchMinAmount)) {
      this.searchedData.searchMinAmount = navData.searchMinAmount;
    }
    if (!this.isEmptyNullUndefined(navData.searchMaxAmount)) {
      this.searchedData.searchMaxAmount = navData.searchMaxAmount;
    }
    this.searchedData.isSearch = true;
  },
  onNavigate: function() {
    var navMan = applicationManager.getNavigationManager();
    this.searchedData = {};
    if(navMan.getCustomInfo("frmTransferActivitiesTransfersEuropeCriteria")){
      this.updateSearchOptions(navMan.getCustomInfo("frmTransferActivitiesTransfersEuropeCriteria"));
    } else{
      this.populateDefaultCustomer();
    }
    if(navMan.getCustomInfo("searchData")) {
      this.updateSearchOptions(navMan.getCustomInfo("searchData"));
      this.setSearchDataCount(); //To set Search Data Count
    } 
   applicationManager.getPresentationUtility().dismissLoadingScreen();
    var scope = this;
    var params = {};
    let configMgr = applicationManager.getConfigurationManager();
    //var isCombinedUser = configMgr.isCombinedUser;
    var accountManager = applicationManager.getAccountManager();
    var accountNumberBusinessAccountMap = this.getAccountMap(accountManager.getInternalAccounts());
    var isCombinedUser = this.getCombinedUserFlag(accountNumberBusinessAccountMap);
    params.entitlement = {};
    params.isCombinedUser = isCombinedUser;
    params.accountNumberBusinessAccountMap = accountNumberBusinessAccountMap;
    params.entitlement.features = configMgr.features;
    params.entitlement.permissions = configMgr.userPermissions;
    params.criteria = this.searchedData;
    this.view.tabs.setContext(params);
    var selectedTab = this.view.tabs.defaultTab;
    this.view.tabs.setSelectedTab(selectedTab);
    this.view.tabs.onError=this.onError;
    this.view.tabs.onTabClick=this.onTabClick;
    this.view.SearchAndFilter.onFilterSelect = this.setFilteredValues;
    this.view.SearchAndFilter.onSearchTextChange = this.setSearchedValues;
    this.view.SearchAndFilter.onError = this.onError;
    this.view.TransfersListMobileNative.setContext(params);
  },
  
  getCombinedUserFlag: function(accountMap) {
    let booleanSet = new Set();
    for (let key in accountMap) {
      booleanSet.add(accountMap[key]);
    }
    return booleanSet.size > 1;
  },

  getAccountMap: function(accountList) {
  	  var accountMap = {};
      accountList.forEach(function(account) {
        accountMap[account.accountID] = account.isBusinessAccount;
      });
      return accountMap;
  },
  
  onError: function(err){
    kony.application.dismissLoadingScreen();
   kony.print(JSON.stringify(err));
  },
  onTabClick: function(tabId){
    var navMan = applicationManager.getNavigationManager();
    if(tabId == "Recurring")
     {
       navMan.navigateTo("ManageActivitiesUIModule/frmTransferActivitiesRecurringEurope");
     } else if (tabId == "Direct Debits") {
       navMan.navigateTo("ManageActivitiesUIModule/frmTransferActivitiesDirectDebitsEurope");
     } else {
      navMan.navigateTo("ManageActivitiesUIModule/frmTransferActivitiesTransfersEurope");
     }
  },
  setFilteredValues: function(params,visibility,headerHeight) {
    if (kony.os.deviceInfo().name === "iPhone") {
      this.view.flxTransfersList.top = (visibility) ? 132 + Number(headerHeight)  + "dp": "132dp"; 
    }
    else {
      this.view.flxTransfersList.top = (visibility) ? 188 + Number(headerHeight)  + "dp": "188dp"; 
    }
    this.view.TransfersListMobileNative.onFilterSelect(params);
  },
  setSearchedValues: function(params) {
    this.view.TransfersListMobileNative.onSearch(params);
  },
  
  repeatTrans: function(transactionData) {
    var navMan = applicationManager.getNavigationManager();
    var transferModPresentationController;
    if(scope_configManager.TransferFlowType === "UTF"){
      transferModPresentationController = applicationManager.getModulesPresentationController({"moduleName": "ManageActivitiesUIModule","appName": "TransfersMA"});
    } else {
      transferModPresentationController = applicationManager.getModulesPresentationController({"moduleName": "TransferEuropeUIModule","appName": "TransfersMA"});
    }
    transferModPresentationController.initializeStateData(false, "");
    if (transactionData)
      transferModPresentationController.setTransactionMode(transactionData.serviceName);
    if (transferModPresentationController.transactionMode === applicationManager.getPresentationUtility().getStringFromi18n("kony.mb.transfer.MyKonyAccounts")) {
      transferModPresentationController.setEuropeFlowType("INTERNAL");
      transferModPresentationController.getFromAccounts(function(res) {
        transferModPresentationController.setFromAndToAccounts(res);
        transferModPresentationController.repeatTransfer(transactionData);
      });
    }
    else {
      transferModPresentationController.setEuropeFlowType("EXTERNAL");
      transferModPresentationController.getFromAndToAccounts(function(res) {
        transferModPresentationController.setFromAndToAccounts(res);
        transferModPresentationController.repeatTransfer(transactionData);
      });
    }  
  },

  editTrans: function(transactionData) {
    var navMan=applicationManager.getNavigationManager();
    var transferModPresentationController;
    if(scope_configManager.TransferFlowType === "UTF"){
      transferModPresentationController = applicationManager.getModulesPresentationController({"moduleName": "ManageActivitiesUIModule","appName": "TransfersMA"});
    } else {
      transferModPresentationController = applicationManager.getModulesPresentationController({"moduleName": "TransferEuropeUIModule","appName": "TransfersMA"});
    }
    transferModPresentationController.initializeStateData(false, "");
    if (transactionData) {
      transferModPresentationController.setTransactionMode(transactionData.serviceName);
      navMan.setCustomInfo("existingAttachments", transactionData.fileNames);
    }  
    if (transferModPresentationController.transactionMode === applicationManager.getPresentationUtility().getStringFromi18n("kony.mb.transfer.MyKonyAccounts")) {
      transferModPresentationController.setEuropeFlowType("INTERNAL");
      transferModPresentationController.getFromAccounts(function(res) {
        transferModPresentationController.setFromAndToAccounts(res);
        transferModPresentationController.setTransactionObject(transactionData);
      });
    }
    else {
      transferModPresentationController.setEuropeFlowType("EXTERNAL");
      transferModPresentationController.getFromAndToAccounts(function(res){
        transferModPresentationController.setFromAndToAccounts(res);
        transferModPresentationController.setTransactionObject(transactionData);
      });
    } 
  }
}
});