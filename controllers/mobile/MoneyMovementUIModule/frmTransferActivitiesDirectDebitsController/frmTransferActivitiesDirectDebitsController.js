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
    }
    else {
      this.view.flxHeader.isVisible = true;
    }
    this.initActions();
    var navManager = applicationManager.getNavigationManager();
    if (navManager.getCustomInfo("frmTransferActivitiesDirectDebits")) {
      var response = navManager.getCustomInfo("frmTransferActivitiesDirectDebits").DELETE;
      this.showToastMessage(response);
      navManager.setCustomInfo("frmTransferActivitiesDirectDebits", null);
    }
    var currentForm = navManager.getCurrentForm();
    applicationManager.getPresentationFormUtility().logFormName(currentForm);
    applicationManager.getPresentationUtility().dismissLoadingScreen();
  },
  
  showToastMessage: function(response) {
    var msg = kony.i18n.getLocalizedString('knoy.mb.transfers.directDebitToast');
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
    this.view.TransfersListMobileNative.getTransactionsData = function() {};
    this.view.TransfersListMobileNative.onSwipeButtonClick = function(rowData) {};
    this.view.TransfersListMobileNative.onDeleteSuccess = function(response) {
      scope.showToastMessage(response);
    };
    this.view.TransfersListMobileNative.onDeleteError = function(err) {
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
      navMan.setCustomInfo("frmDirectDebitsDetails", data);
      navMan.navigateTo("frmDirectDebitsDetails");
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
    var isCombinedUser = configMgr.isCombinedUser;
    
    params.entitlement = {};
    params.isCombinedUser = isCombinedUser;
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
    this.view.TransfersListMobileNative.onFilterSelect(params);
  },
  setSearchedValues: function(params) {
    this.view.TransfersListMobileNative.onSearch(params);
  },
}
});