define({ 
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
    var currentForm = navManager.getCurrentForm();
    applicationManager.getPresentationFormUtility().logFormName(currentForm);
    applicationManager.getPresentationUtility().dismissLoadingScreen();
  },
  initActions: function () {
    // var transferModPresentationController = applicationManager.getModulesPresentationController("TransferModule");
    var navMan = applicationManager.getNavigationManager();
    this.view.customHeader.flxBack.onClick = this.navigateCustomBack;
  },
  navigateCustomBack: function () {
    var navManager = applicationManager.getNavigationManager();
    navManager.goBack();
  },

  onNavigate : function(){
    var navMan = applicationManager.getNavigationManager();
    var transactionData =navMan.getCustomInfo("frmTransfersDetails");
    try{
    let configMgr = applicationManager.getConfigurationManager();
  //  var isCombinedUser = configMgr.isCombinedUser;
    transactionData.entitlement = {};
   // transactionData.isCombinedUser = isCombinedUser;
    transactionData.entitlement.features = configMgr.features;
    transactionData.entitlement.permissions = configMgr.userPermissions;
    this.view.DetailsMain.setContext(transactionData);
    this.view.DetailsMain.onSuccess = this.onCancelTransferSuccess;
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
    this.view.DetailsMain.onSuccess = this.onCancelTransferSuccess;
    this.view.DetailsMain.onButtonAction =this.onButtonAction;
    this.view.DetailsMain.onError = this.onError;
    }
  },
  onCancelTransferSuccess : function(response){
    var navMan = applicationManager.getNavigationManager();
    navMan.setCustomInfo("frmTransferActivitiesTransfers", {"DELETE" : response});
    navMan.navigateTo("frmTransferActivitiesTransfers",response);
  },
  onButtonAction : function(buttonId, details){
    switch (buttonId){
      case "View Attachment":
        var navMan = applicationManager.getNavigationManager();
        var transactionData =navMan.getCustomInfo("frmTransfersDetails");
        var downloadAttachments = transactionData.fileNames;
        var downloadAttachmentFileNames = [];
        if(downloadAttachments && downloadAttachments.length>0){
          for(var i=0; i<downloadAttachments.length;i++){
            downloadAttachmentFileNames.push(downloadAttachments[i].fileName);
          }}
         navMan.setCustomInfo("downloadAttachments", downloadAttachmentFileNames);
          navMan.navigateTo("frmAttachments");
          break;
      case "Edit":
          var navMan=applicationManager.getNavigationManager();
          applicationManager.getPresentationUtility().showLoadingScreen();
          var transactionData =navMan.getCustomInfo("frmTransfersDetails");
          var mmModulePresentationController = applicationManager.getModulesPresentationController("MoneyMovementUIModule");
          mmModulePresentationController.haveLimitsBeenFetched = false;
          mmModulePresentationController.initializeStateData(false, "");
          if (transactionData)
            mmModulePresentationController.setTransactionMode(transactionData.serviceName);
            mmModulePresentationController.getFromAndToAccounts(function(res){
            mmModulePresentationController.setFromAndToAccounts(res);
            mmModulePresentationController.setTransactionObject(transactionData);});
          break;
      case "Download Report":
        var scope = this;
        scope.showToastWarningMsg();
        break;
       case "Repeat Transaction":
          var navMan=applicationManager.getNavigationManager();
          var transactionData =navMan.getCustomInfo("frmTransfersDetails");
          var mmModulePresentationController = applicationManager.getModulesPresentationController("MoneyMovementUIModule");
          mmModulePresentationController.haveLimitsBeenFetched = false;
          mmModulePresentationController.initializeStateData(false, "");
          if (transactionData)
            mmModulePresentationController.setTransactionMode(transactionData.serviceName);
            mmModulePresentationController.getFromAndToAccounts(function(res){
            mmModulePresentationController.setFromAndToAccounts(res);
            mmModulePresentationController.repeatTransfer(transactionData);});

        }

    }, 
  showToastWarningMsg: function(){
    var scope = this;
    var navMan = applicationManager.getNavigationManager();
    var transactionData =navMan.getCustomInfo("frmTransfersDetails");
    var warnObject = {};
    warnObject.messageDetails = warnObject.messageDetails = kony.i18n.getLocalizedString('i18n.payments.personalInformation');
    warnObject.formattedWarnText = kony.i18n.getLocalizedString('i18n.payments.keepYourInformationSafe');
    warnObject.isSuccess = kony.i18n.getLocalizedString('i18n.payments.warning');
    this.view.CancelTransactionPopup.setContext(warnObject);
    this.view.flxErrorPopup.setVisibility(true);
    this.view.CancelTransactionPopup.contextualActionButtonOnClick = function(btnAction){
      if(btnAction === kony.i18n.getLocalizedString('i18n.transfers.Cancel')) {
        scope.view.flxErrorPopup.setVisibility(false);
      } else {
       var mmModulePresentationController = applicationManager.getModulesPresentationController("MoneyMovementUIModule");
        var requestParams = {
          "transactionId": transactionData.transactionId,
          "transactionType": transactionData.frequencyType,
          "contentType": "pdf"
        };
        mmModulePresentationController.downloadTransactionReport(requestParams);
        scope.view.flxErrorPopup.setVisibility(false);
      }
    };
  },
      onError : function(error){
        var scopeObj = this;
        applicationManager.getDataProcessorUtility().showToastMessageError(scopeObj, error.dbpErrMsg); 
      }
  });