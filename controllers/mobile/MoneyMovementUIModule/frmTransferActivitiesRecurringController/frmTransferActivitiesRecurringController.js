define(['CommonUtilities'],function(CommonUtilities){ 
  return{
  init: function () {
    var scope=this;
    var navManager = applicationManager.getNavigationManager();
    var currentForm = navManager.getCurrentForm();
    applicationManager.getPresentationFormUtility().initCommonActions(this, "CALLBACK", currentForm, scope.navigateCustomBack);
  },
  preShow: function () {
    if (kony.os.deviceInfo().name === "iPhone") {
      this.view.flxHeader.isVisible = false;
	   this.view.flxTransfersList.top = "132dp"; 
    }
    else {
      this.view.flxHeader.isVisible = true;
	  this.view.flxTransfersList.top = "188dp";
    }
    this.initActions();
    var navManager = applicationManager.getNavigationManager();
    if (navManager.getCustomInfo("frmTransferActivitiesRecurring")) {
      var response = navManager.getCustomInfo("frmTransferActivitiesRecurring").DELETE;
      this.showToastMessage(response);
      navManager.setCustomInfo("frmTransferActivitiesRecurring", null);
    }
    
    var currentForm = navManager.getCurrentForm();
    applicationManager.getPresentationFormUtility().logFormName(currentForm);
    applicationManager.getPresentationUtility().dismissLoadingScreen();
  },
  
  showToastMessage: function(response) {
    var msg = kony.i18n.getLocalizedString('kony.mb.transfers.transferCancelToast') + (response.transactionId || response.referenceId);
    applicationManager.getDataProcessorUtility().showToastMessageSuccess(this, msg);
  },
  initActions: function () {
    var scope = this;
    var transferModPresentationController = applicationManager.getModulesPresentationController("MoneyMovementUIModule");
    var navMan = applicationManager.getNavigationManager();
    this.view.customHeader.flxBack.onClick = this.navigateCustomBack;
    this.view.TransfersListMobileNative.onRequestStart = function() {
      applicationManager.getPresentationUtility().showLoadingScreen();
    };
    this.view.TransfersListMobileNative.onRequestEnd = function() {
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
      if (err["isServerUnreachable"]) {
        applicationManager.getPresentationUtility().dismissLoadingScreen();
        applicationManager.getPresentationInterruptHandler().showErrorMessage("postLogin", err);
      } else { 
        if (err["errorMessage"])
          applicationManager.getDataProcessorUtility().showToastMessageError(scope, err["errorMessage"]);
        else
          applicationManager.getDataProcessorUtility().showToastMessageError(scope, JSON.stringify(err));
      }
    };
    this.view.TransfersListMobileNative.onRowClick = function(data) {
      navMan.setCustomInfo("frmRecurringDetails", data);
      navMan.setEntryPoint("centralmoneymovement", "frmTransferActivitiesRecurring");
      navMan.navigateTo("frmRecurringDetails");
    }
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
   
  navigateCustomBack: function () {
    var accountMod = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"HomepageMA","moduleName":"AccountsUIModule"});
    accountMod.presentationController.showDashboard();
  },
  onNavigate: function() {
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
       navMan.navigateTo("frmTransferActivitiesRecurring");
     } else if (tabId == "Direct Debits") {
       navMan.navigateTo("frmTransferActivitiesDirectDebits");
     } else {
       navMan.navigateTo("frmTransferActivitiesTransfers");
     }
  },
  setFilteredValues: function(params,visibility,headerHeight) {
    if (kony.os.deviceInfo().name === "iPhone") {
      if(params === "All") {
      this.view.flxTransfersList.top = "132dp";
      } else{
      this.view.flxTransfersList.top = (visibility) ? 132 + Number(headerHeight)  + "dp": "132dp";
      }
    }
    else {
      if(params === "All") {
      this.view.flxTransfersList.top = "188dp";
      } else{
      this.view.flxTransfersList.top = (visibility) ? 188 + Number(headerHeight)  + "dp": "188dp";
        }
       }
    this.view.TransfersListMobileNative.onFilterSelect(params);
  },
  setSearchedValues: function(params) {
    this.view.TransfersListMobileNative.onSearch(params);
  },
  
   repeatTrans: function(transactionData) {
        var navMan = applicationManager.getNavigationManager();
        var mmModulePresentationController = applicationManager.getModulesPresentationController("MoneyMovementUIModule");
        mmModulePresentationController.initializeStateData(false, "");
        if (transactionData)
            mmModulePresentationController.setTransactionMode(transactionData.serviceName);
            mmModulePresentationController.getFromAndToAccounts(function(res){
            mmModulePresentationController.setFromAndToAccounts(res);
            mmModulePresentationController.repeatTransfer(transactionData);});
  },

  editTrans: function(transactionData) {
    var navMan=applicationManager.getNavigationManager();
    var mmModulePresentationController = applicationManager.getModulesPresentationController("MoneyMovementUIModule");
    mmModulePresentationController.initializeStateData(false, "");
    if (transactionData) {
      mmModulePresentationController.setTransactionMode(transactionData.serviceName);
      navMan.setCustomInfo("existingAttachments", transactionData.fileNames);
         mmModulePresentationController.setTransactionMode(transactionData.serviceName);
         mmModulePresentationController.getFromAndToAccounts(function(res){
         mmModulePresentationController.setFromAndToAccounts(res);
         mmModulePresentationController.setTransactionObject(transactionData);});
    }  
    }
  }
});