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
    navManager.setEntryPoint("acknowledgementform", "frmRecurringDetailsEurope");
    var currentForm = navManager.getCurrentForm();
    applicationManager.getPresentationFormUtility().logFormName(currentForm);
    applicationManager.getPresentationUtility().dismissLoadingScreen();
  },
  initActions: function () {
    // var transferModPresentationController = applicationManager.getModulesPresentationController({"moduleName" : "ManageActivitiesUIModule", "appName" : "TransfersMA"});
    var navMan = applicationManager.getNavigationManager();
    this.view.customHeader.flxBack.onClick = this.navigateCustomBack;
  },
  navigateCustomBack: function () {
    var navManager = applicationManager.getNavigationManager();
    navManager.goBack(this);
  },

  onNavigate : function(){
    var navMan = applicationManager.getNavigationManager();
    var transactionData =navMan.getCustomInfo("frmRecurringDetailsEurope");
    try{
      let configMgr = applicationManager.getConfigurationManager();
  //  var isCombinedUser = configMgr.isCombinedUser;
    transactionData.entitlement = {};
   // transactionData.isCombinedUser = isCombinedUser;
    transactionData.entitlement.features = configMgr.features;
    transactionData.entitlement.permissions = configMgr.userPermissions;
    this.view.DetailsMain.setContext(transactionData);
    this.view.DetailsMain.onSuccess = this.onCancelSeriesSuccess;
    this.view.DetailsMain.onButtonAction =this.onButtonAction;
    this.view.DetailsMain.onError = this.onError;
    this.view.DetailsMain.showLoading= function() {
      applicationManager.getPresentationUtility().showLoadingScreen();
    };
    this.view.DetailsMain.dismissLoading= function() {
       applicationManager.getPresentationUtility().dismissLoadingScreen();
    };
    }catch(e){
    this.view.DetailsMain.setContext(transactionData);
    this.view.DetailsMain.onSuccess = this.onCancelSeriesSuccess;
    this.view.DetailsMain.onButtonAction =this.onButtonAction;
    this.view.DetailsMain.onError = this.onError;
    }
  },
  onCancelSeriesSuccess : function(response){
    var scope = this;
    var navMan = applicationManager.getNavigationManager();
    navMan.setCustomInfo("frmTransferActivitiesRecurringEurope", {"DELETE" : response});
    navMan.navigateTo("ManageActivitiesUIModule/frmTransferActivitiesRecurringEurope",response);
//     var obj = {
//       "context": scope,
//       "params": {
//         "response": response
//       },
//       "callbackModelConfig": {
//         "btndata": "CancelSeriesSuccess",
//         "response": response
//       }
//     };
//     var navManager = kony.mvc.getNavigationManager();
//     navManager.navigate(obj);
  },
  onButtonAction : function(buttonId, details){
    switch (buttonId){
      case (kony.i18n.getLocalizedString("kony.mb.Transfers.viewAttachment")):
        var scope = this;
        var navMan = applicationManager.getNavigationManager();
        var transactionData =navMan.getCustomInfo("frmRecurringDetailsEurope");
        var downloadAttachments = transactionData.fileNames;
        var downloadAttachmentFileNames = [];
        if(downloadAttachments && downloadAttachments.length>0){
          for(var i=0; i<downloadAttachments.length;i++){
            downloadAttachmentFileNames.push(downloadAttachments[i].fileName);
          }
        }
                        navMan.setCustomInfo("downloadAttachments", downloadAttachments);
                  navMan.navigateTo({
                        "appName": "TransfersMA",
                        "friendlyName": "ManageActivitiesUIModule/frmAttachments"
                    });
//         var obj = {
//           "context": scope,
//           "params": {},
//           "callbackModelConfig": {
//             "btndata": "View Attachment",
//             "downloadAttachments": downloadAttachments
//           }
//         };
//         navMan.navigate(obj);
          break;
      case (kony.i18n.getLocalizedString("kony.tab.common.Edit")):
          var navMan = applicationManager.getNavigationManager();
          var transactionData =navMan.getCustomInfo("frmRecurringDetailsEurope");
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
          break;
       case (kony.i18n.getLocalizedString("kony.mb.transaction.repeatTransaction")):
          var navMan=applicationManager.getNavigationManager();
          var transactionData =navMan.getCustomInfo("frmRecurringDetailsEurope");
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

        }

    }, 
  showToastMessageErr : function(err){
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
      var formattedText =  kony.i18n.getLocalizedString('i18n.kony.transfers.transactionCancelFailed');
      errorObject.formattedFailedText = formattedText;
      errorObject.isSuccess = false;
      this.view.CancelTransactionPopup.setContext(errorObject);
      this.view.flxErrorPopup.setVisibility(true);
      this.view.CancelTransactionPopup.contextualActionButtonOnClick = function(btnAction){
        if(btnAction)
          scope.view.flxErrorPopup.setVisibility(false);
      };
  },
  
  onError : function(err){
    var scope = this;
    if (err["isServerUnreachable"]) {
      applicationManager.getPresentationUtility().dismissLoadingScreen();
      applicationManager.getPresentationInterruptHandler().showErrorMessage("postLogin", err);
    } else { 
       scope.showToastMessageErr(err);
    }  
  }
 }
});