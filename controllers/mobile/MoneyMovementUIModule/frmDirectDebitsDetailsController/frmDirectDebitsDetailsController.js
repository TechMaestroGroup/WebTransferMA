define({
    init: function () {
        var scope = this;
        var navManager = applicationManager.getNavigationManager();
        var currentForm = navManager.getCurrentForm();
        applicationManager.getPresentationFormUtility().initCommonActions(this, "CALLBACK", currentForm, scope.navigateCustomBack);
    },
    preShow: function () {
        if (kony.os.deviceInfo().name === "iPhone") {
            this.view.flxHeader.isVisible = false;
        } else {
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

    onNavigate: function () {
        var navMan = applicationManager.getNavigationManager();
        var transactionData = navMan.getCustomInfo("frmDirectDebitsDetails");
        try {
            let configMgr = applicationManager.getConfigurationManager();
            // var isCombinedUser = configMgr.isCombinedUser;
            transactionData.entitlement = {};
            // transactionData.isBusinessPayee = isCombinedUser;
            transactionData.entitlement.features = configMgr.features;
            transactionData.entitlement.permissions = configMgr.userPermissions;
            this.view.DetailsMain.setContext(transactionData);
            this.view.DetailsMain.onSuccess = this.onCancelDirectDebitSuccess;
            this.view.DetailsMain.onButtonAction = this.onButtonAction;
            this.view.DetailsMain.onError = this.onError;
            this.view.DetailsMain.showLoading = function () {
                applicationManager.getPresentationUtility().showLoadingScreen();
            };
            this.view.DetailsMain.dismissLoading = function () {
                applicationManager.getPresentationUtility().dismissLoadingScreen();
            };
        } catch (e) {
            this.view.DetailsMain.setContext(transactionData);
            this.view.DetailsMain.onSuccess = this.onCancelDirectDebitSuccess;
            this.view.DetailsMain.onButtonAction = this.onButtonAction;
            this.view.DetailsMain.onError = this.onError;
        }
    },
    onCancelDirectDebitSuccess: function (response) {
        var navMan = applicationManager.getNavigationManager();
        navMan.setCustomInfo("frmTransferActivitiesDirectDebits", { DELETE: response });
        navMan.navigateTo("frmTransferActivitiesDirectDebits", response);
    },
    onButtonAction: function (buttonId, details) {
        //No actions in Direct Debits
    },
    onError: function (error) {
        var scopeObj = this;
        applicationManager.getDataProcessorUtility().showToastMessageError(scopeObj, error.dbpErrMsg);
    },
});
