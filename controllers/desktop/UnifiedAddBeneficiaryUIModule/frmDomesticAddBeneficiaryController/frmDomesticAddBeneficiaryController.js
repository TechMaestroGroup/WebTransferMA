define(['FormControllerUtility','CommonUtilities'],function(FormControllerUtility,CommonUtilities){
  return {
    /**
	* @api : onNavigate
	* called when the application gets navigated to the respective form
	* @return : NA
	*/
    onNavigate: function(context) {
      var scope = this;
      this.context = context;
      this.view.unifiedAddBeneficiary.setContext(scope, this.context);
      this.view.SwiftLookup.setContext(scope);
      this.view.flxCloseError.onClick = this.closeErrorFlex;
    },  

    /**
	* @api : preshow
	* Reponsible to retain the data for custom properties for multiple entries into the component
	* @return : NA
	*/
  preshow: function() {
    var scope = this;
    scope.view.customheadernew.activateMenu("UNIFIEDTRANSFER", "");
    this.view.flxContent.enableScrolling = true;
    scope.view.SwiftLookup.removeSwiftLookup = function() {
        scope.removeSwiftLookup();
    };
    this.view.flxAddSameBankAccount.onTouchStart = function() {
        scope.addBeneficiary("Same Bank Transfer");
    };
    this.view.flxAddDomesticAccount.onTouchStart = function() {
        scope.addBeneficiary("Domestic Transfer");
    };
    this.view.flxAddInternationalAccount.onTouchStart = function() {
        scope.addBeneficiary("International Transfer");
    };
    this.view.flxAddPersonToPerson.onTouchStart = function() {
        scope.addBeneficiary("Pay a Person");
    };
    this.view.btnByPass.onClick = function () {
      scope.view.flxAddSameBankAccount.setActive(true);
    }
    this.view.unifiedAddBeneficiary.onError = this.onError;
    this.view.customheadernew.btnSkipNav.onClick = function() {
        scope.view.lblAddNewAccount.setActive(true);
    }
    this.view.flxSwiftLookup.isModalContainer=true;
    this.view.flxSwiftLookup.skin="ICSknScrlFlx000000OP40";
    this.view.flxSwiftLookup.onKeyPress= this.getAccessibility;
},
getAccessibility: function(eventObject, eventPayload) {
  if(eventPayload.keyCode===27 ){
  this.removeSwiftLookup();
  eventPayload.preventDefault();
  this.view.unifiedAddBeneficiary.setLookupFocus();
  }
},
    /**
	* @api : onBreakPointChange
	* Reponsible to retain the UI of the form
	* @return : NA
	*/
    onBreakPointChange: function(form,width) {
      FormControllerUtility.setupFormOnTouchEnd(width);
      this.view.flxContent.enableScrolling = true;
      this.view.flxContent.minHeight = kony.os.deviceInfo().screenHeight - 
      parseInt(this.view.flxHeader.height.slice(0, -2)) - parseInt(this.view.flxFooter.height.slice(0, -2)) + "dp";
      this.view.customheadernew.onBreakpointChangeComponent(width);
      if (kony.application.getCurrentBreakpoint() <= 640 && kony.application.getCurrentForm().verifyWarningPopup) {
        kony.application.getCurrentForm().verifyWarningPopup.height = "330dp";
        kony.application.getCurrentForm().verifyWarningPopup.flxSeperator2.bottom = "130dp";
    } else {
        if(kony.application.getCurrentForm().verifyWarningPopup)
            kony.application.getCurrentForm().verifyWarningPopup.flxSeperator2.bottom = "80dp";
    }
    },

    /**
	* @api : postShow
	* event called after ui rendered on the screen, is a component life cycle event.
	* @return : NA
	*/
    postShow: function(){
      var scope = this;
      this.view.flxContent.enableScrolling = true;
      this.view.flxContent.minHeight = kony.os.deviceInfo().screenHeight - 
      parseInt(this.view.flxHeader.height.slice(0, -2)) - parseInt(this.view.flxFooter.height.slice(0, -2)) + "dp";
      if(this.context.transferFail !== "" && (!kony.sdk.isNullOrUndefined(this.context.transferFail))){
        this.view.flxError.setVisibility(true);
        this.view.flxCloseError.setActive(true);
        this.view.lblError1.text = this.context.errorMessage;
        this.view.lblError2.text = this.context.transferFail;
      }
      else{
        this.view.flxError.setVisibility(false);
      }
      if(kony.application.getCurrentBreakpoint()<=1024){
        this.view.btnByPass.setVisibility(false);
      }
      this.view.CustomPopup.onKeyPress = this.onKeyPressCallBack;
      this.view.CustomPopup.doLayout = CommonUtilities.centerPopupFlex;
    },
    onKeyPressCallBack: function(eventObject, eventPayload) {
        var self = this;
        if (eventPayload.keyCode === 27) {
            if (self.view.flxLogout.isVisible === true) {
                self.view.flxLogout.isVisible = false;
                self.view.flxDialogs.isVisible = false;
                self.view.customheadernew.btnLogout.setFocus(true);
            }
            this.view.customheadernew.onKeyPressCallBack(eventObject, eventPayload);
        }
    },
    
        /**
	* @api : addBenificiary
	* navigate to particular add beneficiary form
	* @return : NA
	*/
    addBeneficiary: function(transferType){
      var frmName = "";
      var p2p = false;
      var TransfersMA = applicationManager.getConfigurationManager().isMicroAppPresent("TransfersMA");
      switch (transferType) {
        case "Same Bank Transfer":
          frmName = "frmSameBankAddBeneficiary";
          break;
        case "Domestic Transfer":
          frmName = "frmDomesticAddBeneficiary";
          break;
        case "International Transfer":
          frmName = "frmInternationalAddBeneficiary";
          break;
        case "Pay a Person":
          p2p = true;
          frmName = "frmPayaPersonAddBeneficiary";
          break;
      }
      var selectedTrasferType = { "transferType" : transferType,
                                 "clickedButton" : "AddNewAccount",
                                 "flowType" : "add",
                                 "payeeType" : "New Payee"
                                };
      var navManager = kony.mvc.getNavigationManager();
      var obj = {
        context: this,
        params: selectedTrasferType,
        callbackModelConfig:{"frm":frmName,"UIModule": "UnifiedAddBeneficiaryUIModule","appName": "TransfersMA" }
      };
      if(p2p){
        applicationManager.getNavigationManager().navigateTo({
          "appName": "TransfersMA",
          "friendlyName": frmName
        }, false, selectedTrasferType);
      }else{navManager.navigate(obj);}
        
    },

    /**
     * continueAddBeneficiary
     * @api : continueAddBeneficiary
     * Method to perform continue navigation action
     * @return : NA
     */
    continueAddBeneficiary: function(params) {
      var scope = this;
      var formName;
      if(params.contractListData.hasOwnProperty("isSingleProfile")) {
        params.isSingleCustomer = params.contractListData["isSingleProfile"].toString();          
        if(params.contractListData["isSingleProfile"] === false) {
          formName = "frmLinkPayee";
        } else {
          formName = "frmDomesticAddBeneficiaryConfirm";
        }}
      var navManager = kony.mvc.getNavigationManager();
      var obj = {
        context: this,
        params:params,
        callbackModelConfig:{"frm":formName,"UIModule":"UnifiedAddBeneficiaryUIModule","appName": "TransfersMA" }
      };    
      navManager.navigate(obj);
    },

    /**
     * @api : closeErrorFlex
     * closes the error flex										   
     * @return : NA
     */
    closeErrorFlex: function() {
      this.view.flxError.setVisibility(false);
    },

    /**
     * @api : showLookupPopup
     * sets the visibility of lookup as true									   
     * @return : NA
     */
    showLookupPopup: function(context) {
      // var scope = this;
      // this.view.flxContent.minHeight = "190%";
      // this.view.flxContent.enableScrolling = false;
      // this.view.flxDialogs.setVisibility(true);
      this.view.flxSwiftLookup.isVisible = true;
      this.view.SwiftLookup.initializePopup(context);
    },

    /**
     * @api : removeSwiftLookup
     * sets the visibility of lookup as false									   
     * @return : NA
     */
    removeSwiftLookup: function() {
      // this.view.flxContent.minHeight = kony.os.deviceInfo().screenHeight - 
      // parseInt(this.view.flxHeader.height.slice(0, -2)) - parseInt(this.view.flxFooter.height.slice(0, -2)) + "dp";
      // this.view.flxContent.enableScrolling = true;
      this.view.flxSwiftLookup.isVisible = false;
      // this.view.flxDialogs.setVisibility(false);
    },

    /**
     * @api : getLookupData
     * gets the data from lookup popup									   
     * @return : NA
     */
    getLookupData: function(context) {
      this.view.flxContent.minHeight = kony.os.deviceInfo().screenHeight - 
      parseInt(this.view.flxHeader.height.slice(0, -2)) - parseInt(this.view.flxFooter.height.slice(0, -2)) + "dp";
      this.view.flxContent.enableScrolling = true;
      this.view.flxSwiftLookup.isVisible = false;
      this.view.flxDialogs.setVisibility(false);
      this.view.unifiedAddBeneficiary.setLookupData(context);
    },

    /**
     * @api : swiftLookupError
     * sets error if swift lookup service gets failed										   
     * @return : NA
     */
    swiftLookupError: function(context) {
      if(context !== ""){
        this.removeSwiftLookup();
        this.view.flxError.isVisible = true;
        this.view.lblError1.text =  kony.i18n.getLocalizedString("i18n.AccountsLanding.UnableToFetchData");
        this.view.lblError2.text = context; 
        this.view.lblError1.setActive(true);
        }
      else{
        this.view.flxError.isVisible = false;
      }
    },

    /**
     * @api : confirmCancel
     * navigates to landing screen										   
     * @return : NA
     */
    confirmCancel: function() {
     var navManager = kony.mvc.getNavigationManager();
      var obj = {
        context: this,
        callbackModelConfig:{"frm":"frmUTFLanding","UIModule":"UnifiedTransferFlowUIModule","appName": "TransfersMA" }
      };    
      navManager.navigate(obj);
    },

     updateFormUI: function(viewModel) {
      if (viewModel.isLoading === true) {
        FormControllerUtility.showProgressBar(this.view);
      } else if (viewModel.isLoading === false) {
        FormControllerUtility.hideProgressBar(this.view);
      }
    },
     
    onError: function(err){
     kony.print(JSON.stringify(err));
    }
  };
});