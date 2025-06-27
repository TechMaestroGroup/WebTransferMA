define({ 
   // Global Parameters.
  flxStack : [],
  nativeTitle: "",
  
  onNavigate: function(params){
    var scope = this;
    var navMan = applicationManager.getNavigationManager();
    var transactionManager = applicationManager.getTransactionManager();
    var transactionObject = transactionManager.getTransactionObject();
    params = navMan.getCustomInfo("frmSameBank");
    if(params === null || params === undefined || params === "")
      params = {};
    if(transactionObject.transactionId && transactionObject.frequencyType !=="Once"){
      params.editData = transactionObject;
    }
    else{
      params.repeatData = transactionObject;
    }
    params.transferType = "Within Same Bank";
    if(kony.os.deviceInfo().name === "iPhone") {
      var titleBarAttributes = this.view.titleBarAttributes;
      titleBarAttributes["shadowImage"] = "transparentbox.png";
      this.view.titleBarAttributes = titleBarAttributes;
      this.view.setBackgroundImageForNavbar({
        "image": "transparentbox.png",
        "barMetrics": constants.BAR_METRICS_DEFAULT
      });
    }
    if(params !== "" && params !== null && params !== undefined) {
    scope.view.MakeATransferUTF.setContext(params);
    }
    scope.initActions();
  },

  initActions: function() {
    var scope = this;
    var navMan = applicationManager.getNavigationManager();
    scope.view.flxSameBankMain.onScrolling = function() {
      scope.iPhoneHeaderHandler();
    };
    scope.view.MakeATransferUTF.onRequestStart = function() {
      scope.requestStart();
    };
    scope.view.MakeATransferUTF.onRequestEnd = function() {
     scope.requestEnd();
    };
    scope.view.MakeATransferUTF.onBackButtonClick = function() {
      scope.backNavigate();
    };
    scope.view.MakeATransferUTF.createTransSuccessCallback = function(response) {
      if(!response["MFAAttributes"])
      {
//         var ntf = new kony.mvc.Navigation("flxSameBankAcknowledgement");
//         ntf.navigate(response);    
        navMan.setCustomInfo("flxSameBankAcknowledgementNew", response);
        navMan.navigateTo("UnifiedTransferFlowUIModule/flxSameBankAcknowledgementNew");
        
      }
      else
      {
//         var ntf = new kony.mvc.Navigation("frmMFAValidation");
//         ntf.navigate(response);     
        navMan.setCustomInfo("frmMFAValidation", response);
        navMan.navigateTo("UnifiedTransferFlow/frmMFAValidation");
          
      }
    };
    scope.view.MakeATransferUTF.iPhoneHeaderProps = function(headerProperties) {
      scope.setiPhoneHeaderProps(headerProperties);
    };
  },

  requestStart: function() {
    kony.application.showLoadingScreen(null, "", constants.LOADING_SCREEN_POSITION_ONLY_CENTER, true, true, null);
  },

  requestEnd: function() {
    kony.application.dismissLoadingScreen();
  },

  backNavigate: function() {
    var navMan = applicationManager.getNavigationManager();
    try {
       var navManager = applicationManager.getNavigationManager();
       navManager.goBack(this);
    }
    catch(err) {
      navMan.navigateTo(previousForm.id);
    }
  },

   iPhoneHeaderHandler: function(){
    var scope = this;
    if(this.view.flxSameBankMain.contentOffsetMeasured.y > 50){
      scope.view.title = this.nativeTitle;
    }
    else if(this.view.flxSameBankMain.contentOffsetMeasured.y < 45){
      scope.view.title = "";
    }
  },

  iPhoneBackNavigation: function() {
    var scope = this;
    var stackLength = scope.flxStack.length;
    var currentScreen = scope.flxStack[stackLength - 1];
    if(this.flxStack.length > 1 && currentScreen !== "flxVerifyDetails" && currentScreen !== "flxDate") {
      scope.view.MakeATransferUTF.goBack();
    } else if(currentScreen === "flxVerifyDetails") {
      scope.view.MakeATransferUTF.onVerifyDetailsBack();
    } else if(currentScreen === "flxDate") {
      scope.view.MakeATransferUTF.dateBackNavigation();
    } else {
      scope.backNavigate();
    }
  },

 showRightBar: function(cancelTitle) {
    var itemArray = new kony.ui.BarButtonItem({
      "type": constants.BAR_BUTTON_TITLE,
      "tintColor": "#ffffff",
      "style": constants.BAR_ITEM_STYLE_PLAIN,
      "enabled": true,
      "action": this.backNavigate,
      "metaData": {
        "title": cancelTitle
      }
    });
    this.view.setRightBarButtonItems({
      "items": [itemArray],
      "animated": false
    });
  },

  hideRightBar: function(){
    this.view.setRightBarButtonItems({
      "items": [],
      "animated": false
    });
  },

  setiPhoneHeaderProps: function(headerProperties) {
    var scope = this;
    this.flxStack = headerProperties["stack"];
    this.nativeTitle = headerProperties["headerTitle"];
    var cancelTitle = headerProperties["cancelText"];
    var stackLength = scope.flxStack.length;
    var currentScreen = scope.flxStack[stackLength - 1];
    var screenList = ["flxFrequencySelection","flxCurrencySelection","flxAddAddress","flxFeesPaidBy","flxDate","flxPaymentMethod","flxSwiftBICSearch","flxSwiftBICSearchList"];
    if(screenList.includes(currentScreen) || cancelTitle === "") {
      this.hideRightBar();
    } else {
      this.showRightBar(cancelTitle);
    } 
  },
});