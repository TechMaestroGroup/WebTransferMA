define(['FormControllerUtility', 'CommonUtilities'], function (FormControllerUtility, CommonUtilities) {
  var userObj = {};
  var isP2PTransferTileVisible = true;
  return {
    init: function () {
      this.view.preShow = this.preShow;
      this.view.postShow = this.postShow;
      this.view.onDeviceBack = function () { };
      this.view.onBreakpointChange = this.onBreakpointChange;
    },
    onBreakpointChange: function (form, width) {
      FormControllerUtility.setupFormOnTouchEnd(width);
      this.view.customheadernew.onBreakpointChangeComponent(width);
      this.view.customfooternew.onBreakpointChangeComponent(width);
      if (this.view.flxPopup && this.view.flxMainContainer) {
        if (width === 640) {
          this.view.flxMainContainer.width = "97%";
        } else if (width === 1024) {
          this.view.flxMainContainer.width = "75%";
        } else {
          this.view.flxMainContainer.width = "660px";
        }
      }
    },
    preShow: function() {
            var scope = this;
            this.view.flxFormContent.doLayout = function() {
                if (this.view.flxFooter.info.height !== undefined) {
                    this.view.flxMain.minHeight = this.view.flxFormContent.frame.height - this.view.flxFooter.info.height + "dp";
                }
            }.bind(this);
            FormControllerUtility.updateWidgetsHeightInInfo(this.view, ['flxHeader', 'flxFooter']);
            this.view.customheadernew.activateMenu("RETAIL TRANSFERS", "");
            this.view.GenericMessageNew.closepopup = function() {
                this.view.flxError.setVisibility(false);
            }
            this.view.RetailTransferSelection1.setAccessibility({
                "rtLearnMore": "Learn more about within same bank transfer",
                "btnAction1": "Make Transfer to Same Bank",
                "btnAction2": "Add account to same bank"
            });
            this.view.RetailTransferSelection2.setAccessibility({
                "rtLearnMore": "Learn more about other bank transfer",
                "btnAction1": "Make transfer to other bank account",
                "btnAction2": "Add Account in other Bank"
            });
            this.view.RetailTransferSelection3.setAccessibility({
                "rtLearnMore": "Learn more about international transfer",
                "btnAction1": "Make transfer to international account",
                "btnAction2": "Add Account in International Bank"
            });
           /*  this.view.UnifiedTransferSelection4.setAccessibility({
                "rtLearnMore": "Learn more about local money transfer",
                "btnAction1": "Make a local money transfer",
                "btnAction2": "Add Account to make local transfer"
            }); */
            this.view.RetailTransferSelection5.setAccessibility({
                "rtLearnMore": "Learn more about tele-birr wallet",
                "btnAction1": "Make Transfer to a tele-birr wallet",
                "btnAction2": "Add Account to transfer to tele-birr wallet"
            });
        //     this.view.UnifiedTransferSelectionP2P.setAccessibility({
        //       "rtLearnMore": "Learn more about pay a person",
        //       "btnAction1": " Activate Person to Person transfer",
        //       "btnAction2": "Add Account to Pay a Person Account"
        //   });
            this.view.CustomPopup.onKeyPress = this.onKeyPressCallBack;
            this.view.onKeyPress = this.onKeyPressCallBack;
            this.view.customheadernew.btnSkipNav.onClick = function() {
                scope.view.lblTransfersHead.setActive(true);
            }
        },
    // postShow: function () {
    //   this.view.flxMain.minHeight = kony.os.deviceInfo().screenHeight - this.view.flxHeader.info.frame.height - this.view.flxFooter.info.frame.height + "dp"; 
    //   if(applicationManager.getConfigurationManager().isMicroAppPresent("TransfersMA")){
    //     if ((!this.isEmptyNullOrUndefined(userObj) && !this.isEmptyNullOrUndefined(userObj["UpdatePreferredP2PAccounts"])) || (!this.isEmptyNullOrUndefined(userObj) && !this.isEmptyNullOrUndefined(userObj["DeactivateP2P"]))) {
    //       this.view.flxError.setVisibility(true);
    //       this.view.GenericMessageNew.setContext({errorDetails:["Activation Failed","Transfer failed beacuse of  server error."]});
    //       if (!this.isEmptyNullOrUndefined(userObj["DeactivateP2P"])) {
    //         delete userObj["DeactivateP2P"];
    //       } else {
    //         delete userObj["UpdatePreferredP2PAccounts"];
    //       }
    //     } else if (!this.isEmptyNullOrUndefined(userObj) && userObj["isP2PActivated"] === "true") {
    //       this.view.flxError.setVisibility(false);
    //       this.view.UnifiedTransferSelection4.setVisibility(true);
    //       this.view.UnifiedTransferSelectionP2P.setVisibility(false);
    //     } else if (!this.isEmptyNullOrUndefined(userObj) && userObj["isP2PActivated"] === "false") {
    //       this.view.flxError.setVisibility(false);
    //       this.view.UnifiedTransferSelection4.setVisibility(false);
    //       this.view.UnifiedTransferSelectionP2P.setVisibility(true);
    //     } else {
    //       this.view.flxError.setVisibility(false);
    //       this.view.UnifiedTransferSelection4.setVisibility(false);
    //       this.view.UnifiedTransferSelectionP2P.setVisibility(false);
    //     }
    //   }else{
    //     this.view.flxError.setVisibility(false);
    //     this.view.UnifiedTransferSelection4.setVisibility(false);
    //     this.view.UnifiedTransferSelectionP2P.setVisibility(false);
    //   }
    //   this.view.flxMain.forceLayout();
    //   this.view.CustomPopup.doLayout = CommonUtilities.centerPopupFlex;
    // },
//  sammie-->
    postShow: function () {
    this.view.flxMain.minHeight = kony.os.deviceInfo().screenHeight - this.view.flxHeader.info.frame.height - this.view.flxFooter.info.frame.height + "dp"; 
     if(applicationManager.getConfigurationManager().isMicroAppPresent("TransfersMA")){
        this.view.flxError.setVisibility(false);
        this.view.RetailTransferSelection5.setVisibility(true);
        this.view.RetailTransferSelection1.setVisibility(true);
        this.view.RetailTransferSelection2.setVisibility(true);
        this.view.RetailTransferSelection3.setVisibility(true);
    } else {
         this.view.flxError.setVisibility(false);
         this.view.RetailTransferSelection5.setVisibility(false);
          this.view.RetailTransferSelection1.setVisibility(false);
        this.view.RetailTransferSelection2.setVisibility(false);
        this.view.RetailTransferSelection3.setVisibility(false);
     }
    this.view.flxMain.forceLayout();
    this.view.CustomPopup.doLayout = CommonUtilities.centerPopupFlex;
    },
    // sammie--->
    // onNavigate: function(data){ 
    //   var scope = this;
    //   isP2PTransferTileVisible = true;
    //   userObj = this.isEmptyNullOrUndefined(data) ? applicationManager.getUserPreferencesManager().getUserObj() : data;    
    //   if (!this.isEmptyNullOrUndefined(userObj)) {
    //     userObj.name = userObj.userfirstname + " " + userObj.userlastname;
    //     if (this.isEmptyNullOrUndefined(userObj.default_to_account_p2p)) {
    //       userObj.formattedDepositAccount = "";
    //       userObj.default_to_account_p2p = "";
    //     } else {
    //       userObj.formattedDepositAccount = userObj.name + "...." + (userObj.default_to_account_p2p).slice(-4);
    //     }
    //   }
    //   var params = {};
    //   let configMgr = applicationManager.getConfigurationManager();
    //   // var isCombinedUser = configMgr.isCombinedUser;
    //   params.entitlement = {};
    //   params.entitlement.features = configMgr.features;
    //   params.entitlement.permissions = configMgr.userPermissions;
    //   this.view.UnifiedTransferSelection1.setContext(params);
    //   this.view.RetailTransferSelection2.setContext(params);
    //   this.view.RetailTransferSelection3.setContext(params);
    //   this.view.UnifiedTransferSelection4.setContext(params);
    //   this.view.RetailTransferSelection5.setContext(params);
    //   this.view.UnifiedTransferSelection1.transferTypeDetails = function(trannsferTypeDetails){
    //     scope.flowType(trannsferTypeDetails);
    //   };
    //   this.view.RetailTransferSelection2.transferTypeDetails = function(trannsferTypeDetails){
    //     scope.flowType(trannsferTypeDetails);
    //   };
    //   this.view.RetailTransferSelection3.transferTypeDetails = function(trannsferTypeDetails){
    //     scope.flowType(trannsferTypeDetails);
    //   };
    //   this.view.UnifiedTransferSelection4.transferTypeDetails = function(trannsferTypeDetails){
    //     scope.flowType(trannsferTypeDetails);
    //   };
    //   this.view.RetailTransferSelection5.transferTypeDetails = function(trannsferTypeDetails){
    //     scope.flowType(trannsferTypeDetails);
    //   };
    //   this.view.UnifiedTransferSelection1.hideTile = function() {
    //     scope.view.UnifiedTransferSelection1.setVisibility(false);
    //   };
    //   this.view.RetailTransferSelection2.hideTile = function() {
    //     scope.view.RetailTransferSelection2.setVisibility(false);
    //   };
    //   this.view.RetailTransferSelection3.hideTile = function() {
    //     scope.view.RetailTransferSelection3.setVisibility(false);
    //   };
    //   this.view.RetailTransferSelection5.hideTile = function() {
    //     scope.view.RetailTransferSelection3.setVisibility(false);
    //   };
    //   this.view.UnifiedTransferSelection4.hideTile = function() {
    //     isP2PTransferTileVisible = false;
    //     scope.view.UnifiedTransferSelection4.setVisibility(false);
    //   };
    //   this.view.UnifiedTransferSelectionP2P.setContext(userObj);  
    //   this.view.UnifiedTransferSelectionP2P.transferTypeDetails = function (trannsferTypeDetails) {
    //     scope.payaPersonFlow(trannsferTypeDetails, userObj);
    //   };
    //   this.view.UnifiedTransferSelectionP2P.hideTile = function () { };
    // },
// sammie --->
    onNavigate: function(data){ 
    var scope = this;
    userObj = this.isEmptyNullOrUndefined(data) ? applicationManager.getUserPreferencesManager().getUserObj() : data;    
    if (!this.isEmptyNullOrUndefined(userObj)) {
        userObj.name = userObj.userfirstname + " " + userObj.userlastname;
        if (this.isEmptyNullOrUndefined(userObj.default_to_account)) {
            userObj.formattedDepositAccount = "";
            userObj.default_to_account = "";
        } else {
            userObj.formattedDepositAccount = userObj.name + "...." + (userObj.default_to_account).slice(-4);
        }
    }
    var params = {};
    let configMgr = applicationManager.getConfigurationManager();
    params.entitlement = {};
    params.entitlement.features = configMgr.features;
    params.entitlement.permissions = configMgr.userPermissions;
    this.view.RetailTransferSelection1.setContext(params);
    this.view.RetailTransferSelection2.setContext(params);
    this.view.RetailTransferSelection3.setContext(params);
    /* this.view.UnifiedTransferSelection4.setContext(params); */
    this.view.RetailTransferSelection5.setContext(params);
    
    this.view.RetailTransferSelection1.transferTypeDetails = function(transferTypeDetails){
        scope.flowType(transferTypeDetails);
    };
    this.view.RetailTransferSelection2.transferTypeDetails = function(transferTypeDetails){
        scope.flowType(transferTypeDetails);
    };
    this.view.RetailTransferSelection3.transferTypeDetails = function(transferTypeDetails){
        scope.flowType(transferTypeDetails);
    };
   /*  this.view.UnifiedTransferSelection4.transferTypeDetails = function(transferTypeDetails){
        scope.flowType(transferTypeDetails);
    }; */
    this.view.RetailTransferSelection5.transferTypeDetails = function(transferTypeDetails){
        scope.flowType(transferTypeDetails);
    };
    
    this.view.RetailTransferSelection1.hideTile = function() {
        scope.view.RetailTransferSelection1.setVisibility(false);
    };
    this.view.RetailTransferSelection2.hideTile = function() {
        scope.view.RetailTransferSelection2.setVisibility(false);
    };
    this.view.RetailTransferSelection3.hideTile = function() {
        scope.view.RetailTransferSelection3.setVisibility(false);
    };
    /* this.view.UnifiedTransferSelection4.hideTile = function() {
        scope.view.UnifiedTransferSelection4.setVisibility(false);
    }; */
    this.view.RetailTransferSelection5.hideTile = function() {
        scope.view.RetailTransferSelection5.setVisibility(false);
    };
},
// sammie --->

    onKeyPressCallBack: function (eventObject, eventPayload) {
      var self = this;
      if (eventPayload.keyCode === 27) {
        if (self.view.flxDialogs.isVisible === true) {
          self.view.flxDialogs.setVisibility(false);
          self.view.customheadernew.btnLogout.setFocus(true);
        }
      }
      self.view.customheadernew.onKeyPressCallBack(eventObject,eventPayload);
    },

    /**
         * PayaPersonFlow
         * @api : PayaPersonFlow
         * navigates to input component pay a person flow
         * @return : NA
         */
    payaPersonFlow: function(param, response) {
      if (param.clickedButton === kony.i18n.getLocalizedString("i18n.P2P.ActivatePersontoPerson")) {
        response["flowType"] = "Activation";
        } else {
        response["flowType"] = "Deactivation";
      }
      kony.mvc.getNavigationManager().navigate({
                    context: this,
                    params : response,
                    callbackModelConfig: {
                        "frm": "frmActivateP2P",
                        "appName": "TransfersMA"
                    }}); 
      
    },

    flowType: function (transferTypeDetails) {
      if (transferTypeDetails.clickedButton === "MakeTransfer") {
        var frmName = "", transferType = transferTypeDetails.transferType;
        switch (transferType) {
          case "Tele-birr Wallet":
            frmName = "frmTelebirrTransfer";
            break;
          case "Awach Account":
            frmName = "frmAwachTransfer";
            break;
          case "Cardless Withdrawal":
            frmName = "frmCardlessWithdrawal";
            break;
          case "M-PESA Wallet":
            frmName = "frmMPesaTransfer";
            break;
        }        
 
        kony.mvc.getNavigationManager().navigate({
                    context: this,
                    params : {
          				"transferType": transferType
        			},
                    callbackModelConfig: {
                        "frm": frmName,
                        "appName": "TransfersMA"
                    }}); 
         
      } 
      else if (transferTypeDetails.clickedButton === "AddNewAccount"){
        var form = "", transfer = transferTypeDetails.transferType;
        switch (transfer) {
          case "Same Bank":
            form = "frmSameBankAddBeneficiary";
            break;
          case "Other Bank Transfer":
            form = "frmDomesticAddBeneficiary";
            break;
          case "International Transfer":
            form = "frmInternationalAddBeneficiary";
            break;
          case "Local Money Transfer":
            form = "frmPayaPersonAddBeneficiary";
            break;
         /*  case "Tele-Birr Wallet":
            form = "frmPayaPersonAddBeneficiary";
            break; */
        }
        var params = {
          "transferType": transfer,
          "payeeType":"New Payee"
        };
        kony.mvc.getNavigationManager().navigate({
          context: this,
          params: params,
          callbackModelConfig:{"frm":form,
          "appName": "TransfersMA"  }
        });
      } 
    },
    
    /**
     * updateFormUI - the entry point method for the form controller.
     * @param {Object} viewModel - it contains the set of view properties and keys.
     */
    updateFormUI: function (viewModel) {
      if (viewModel.isLoading === true) {
        FormControllerUtility.showProgressBar(this.view);
      } else if (viewModel.isLoading === false) {
        FormControllerUtility.hideProgressBar(this.view);
      }
    },
    /**
      * @api : isEmptyNullOrUndefined
      * Verifies if the value is empty, null or undefined
      * data {any} - value to be verified
      * @return : {boolean} - validity of the value passed
      */
    isEmptyNullOrUndefined: function (data) {
      if (data === null || data === undefined || data === "") return true;
      if (typeof data === "object") {
        if (Array.isArray(data)) return data.length === 0;
        return Object.keys(data).length === 0;
      }
      return false;
    },
  };
});