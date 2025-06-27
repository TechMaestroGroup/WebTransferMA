define(['CampaignUtility','CommonUtilities'], function(CampaignUtility, CommonUtilities){
  return{
    advSearchDefaultValues : {},
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
      var scope = this;
      if (kony.os.deviceInfo().name === "iPhone") {
        this.view.flxHeader.isVisible = false;
        this.view.flxMainContainer.top = "0dp";
      } else {
        this.view.flxMainContainer.top = "56dp";
      }
      this.advSearchDefaultValues = {
        fromAccount: kony.i18n.getLocalizedString("i18n.konybb.Common.All"),
        payeeName:null,
        payeeAccNo:null,
        referenceNo:null,
        paymentRef:null,
        minAmount:null,
        maxAmount:null,
        status: ["All Transfers" , kony.i18n.getLocalizedString("i18n.Search.AllTransfers")],
        timePeriod:["6M" , kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last6months")],
        fromDate: null,
        toDate: null
      }
      this.setDefaultUI();
      this.initActions();
      // let selectedFromAccount = this.ManageActivitiesPresenter.getSelectedFromAccount();
      // if (!this.isEmptyNullUndefined(selectedFromAccount)) {
      //   this.view.lblFromValue.text = selectedFromAccount;
      // }
      this.view.flxTransferStatus.onClick = function(){
        scope.setDefaultContextToAdvSearch("Status");
        scope.showAdvSearchPopup();
      }
      this.view.flxTimePeriod.onClick = function(){
				scope.setDefaultContextToAdvSearch("TimePeriod");
        scope.showAdvSearchPopup();
      }
      this.view.BottomSheet.onDismissCallBack = this.hideAdvSearchPopup;
      this.view.txtSearchInput5.onEndEditing = this.validateAmount.bind(this);
      this.view.txtSearchInput6.onEndEditing = this.validateAmount.bind(this);
      this.view.txtSearchInput5.onDone = this.validateAmount.bind(this);
      this.view.txtSearchInput6.onDone = this.validateAmount.bind(this);
      applicationManager.getPresentationUtility().dismissLoadingScreen();
    },

    /**
      Initializing the Actions
    */
    initActions: function() {
      var scope = this;
      this.view.flxBottomSheet.isVisible = false;
      this.view.flxFromAccount.onClick = this.navigateFromAccount.bind(this);
      this.restrictSpecialCharacters();
      this.view.txtSearchInput1.onEndEditing = this.setInputValue.bind(this);
      this.view.txtSearchInput1.onDone = this.setInputValue.bind(this);
      this.view.txtSearchInput2.onEndEditing = this.setInputValue.bind(this);
      this.view.txtSearchInput2.onDone = this.setInputValue.bind(this);
      this.view.txtSearchInput3.onEndEditing = this.setInputValue.bind(this);
      this.view.txtSearchInput3.onDone = this.setInputValue.bind(this);
      this.view.txtSearchInput4.onEndEditing = this.setInputValue.bind(this);
      this.view.txtSearchInput4.onDone = this.setInputValue.bind(this); 
      this.view.customAdvanceSearchHeader.flxBack.onClick = this.backNavigation.bind(this);
      this.view.customAdvanceSearchHeader.btnSearchReset.onClick = this.resetSearchUI.bind(this);  
      this.view.btnApply.onClick = this.advSearchBtn.bind(this);
    },

    /**
      Initializing the Amount widget UI
    */
    initAmountTextBox: function(){
      this.view.flxError.setVisibility(false);
      this.view.flxSearchInput5.top = "10dp";
      this.view.txtSearchInput5.skin = "sknTbxCustomerSearch";
      this.view.txtSearchInput6.skin = "sknTbxCustomerSearch";
      this.view.btnApply.setEnabled(true);
      this.view.btnApply.skin = "sknBtn0095e4RoundedffffffSSP26px";
    },

    /**
      Setting default widget UI
    */
    setDefaultUI: function(){
      let widgetData = this.ManageActivitiesPresenter.getAdvSearchOptions();
      let searchData = this.ManageActivitiesPresenter.getAdvSearchBtnData();
      let selectedAccountName = this.ManageActivitiesPresenter.getSelectedAccountName(); //Get the viewBy selected AccountName
      if(this.isEmptyNullUndefined(widgetData.fromAccountName) && !this.isEmptyNullUndefined(selectedAccountName.text)) {
        this.view.lblFromValue.text = selectedAccountName.text; // Show the viewBy selected AccountName
      } else if(!this.isEmptyNullUndefined(widgetData.fromAccountName)) {
        this.view.lblFromValue.text = widgetData.fromAccountName;
      } else if(!this.isEmptyNullUndefined(searchData.fromAccountName)){
        this.view.lblFromValue.text = searchData.fromAccountName;
      } else {
        this.view.lblFromValue.text = this.advSearchDefaultValues.fromAccount;
      }
      if(!this.isEmptyNullUndefined(widgetData.status)) {
        this.view.lblValue1.text = widgetData.status[1];
      } else if(!this.isEmptyNullUndefined(searchData.status)) {
        this.view.lblValue1.text = searchData.status[1];
      } else {
        this.view.lblValue1.text = this.advSearchDefaultValues.status[1];
      }
      if(!this.isEmptyNullUndefined(widgetData.timePeriod)) {
        this.view.lblValue2.text = widgetData.timePeriod[1];
      } else if(!this.isEmptyNullUndefined(searchData.timePeriod)) {
        this.view.lblValue2.text = searchData.timePeriod[1];
      } else {
        this.view.lblValue2.text = this.advSearchDefaultValues.timePeriod[1];
      }
      if(!this.isEmptyNullUndefined(widgetData.payeeName)) {
        this.view.txtSearchInput1.text = widgetData.payeeName;
      } else if(!this.isEmptyNullUndefined(searchData.payeeName)) {
        this.view.txtSearchInput1.text = searchData.payeeName;
      } else {
        this.view.txtSearchInput1.text = this.advSearchDefaultValues.payeeName;
      }
      if(!this.isEmptyNullUndefined(widgetData.payeeAccNo)) {
        this.view.txtSearchInput2.text = widgetData.payeeAccNo;
      } else if(!this.isEmptyNullUndefined(searchData.payeeAccNo)) {
        this.view.txtSearchInput2.text = searchData.payeeAccNo;
      } else {
        this.view.txtSearchInput2.text = this.advSearchDefaultValues.payeeAccNo;
      }
      if(!this.isEmptyNullUndefined(widgetData.referenceNo)) {
        this.view.txtSearchInput3.text = widgetData.referenceNo;
      } else if(!this.isEmptyNullUndefined(searchData.referenceNo)) {
        this.view.txtSearchInput3.text = searchData.referenceNo;
      } else {
        this.view.txtSearchInput3.text = this.advSearchDefaultValues.referenceNo;
      }
      if(!this.isEmptyNullUndefined(widgetData.paymentRef)) {
        this.view.txtSearchInput4.text = widgetData.paymentRef;
      } else if(!this.isEmptyNullUndefined(searchData.paymentRef)) {
        this.view.txtSearchInput4.text = searchData.paymentRef;
      } else {
        this.view.txtSearchInput4.text = this.advSearchDefaultValues.paymentRef;
      }
      if(!this.isEmptyNullUndefined(widgetData.minAmount)) {
        this.view.txtSearchInput5.text = widgetData.minAmount;
      } else if(!this.isEmptyNullUndefined(searchData.minAmount)) {
        this.view.txtSearchInput5.text = searchData.minAmount;
      } else {
        this.view.txtSearchInput5.text = this.advSearchDefaultValues.minAmount;
      }
      if(!this.isEmptyNullUndefined(widgetData.maxAmount)) {
        this.view.txtSearchInput6.text = widgetData.maxAmount;
      } else if(!this.isEmptyNullUndefined(searchData.maxAmount)) {
        this.view.txtSearchInput6.text = searchData.maxAmount;
      } else {
        this.view.txtSearchInput6.text = this.advSearchDefaultValues.maxAmount;
      }
    },

    /**
      Invoke to store globally onEnd Editing
    */
    setInputValue: function(widgetDetails){
      this.ManageActivitiesPresenter.setAdvSearchOptions(widgetDetails);
    },

    /**
      Invoke to capture all the edited data on Search Click
    */
    advSearchBtn: function(){
      let advSearchBtn = {
        fromAccountName: this.view.lblFromValue.text,
        payeeName: this.view.txtSearchInput1.text,
        payeeAccNo: this.view.txtSearchInput2.text,
        referenceNo: this.view.txtSearchInput3.text,
        paymentRef: this.view.txtSearchInput4.text,
        minAmount: this.view.txtSearchInput5.text,
        maxAmount: this.view.txtSearchInput6.text,
        status: this.view.lblValue1.text,
        timePeriod: this.view.lblValue2.text,
      }
      this.ManageActivitiesPresenter.setAdvSearchBtnData(advSearchBtn);
    },

    /**
      OnClick of Reset, resetting the UI
    */
    resetSearchUI: function(){
      this.ManageActivitiesPresenter.clearAdvSearchOptions();
      this.ManageActivitiesPresenter.clearAdvSearchBtnData();
      this.setDefaultUI();
      this.initAmountTextBox();
    },

     /**
     * displays advance search popup
     */
    showAdvSearchPopup : function(){
      this.view.flxBottomSheet.setVisibility(true);
      this.view.BottomSheet.showPopup();
    },

    /**
    * hides advance search popup
    */
    hideAdvSearchPopup : function(selectedRowItem){
      this.ManageActivitiesPresenter.setSelectedStatusRow(selectedRowItem);
      this.view.flxBottomSheet.setVisibility(false);
      if(selectedRowItem.lblBottomSheetHeader === "Status"){
        this.view.lblValue1.text = selectedRowItem.lblBottomSheet;
      } else if(selectedRowItem.lblBottomSheetHeader === "TimePeriod") {
        if(selectedRowItem.lblBottomSheet === kony.i18n.getLocalizedString("kony.mb.PFM.CustomDateRange")) {
          this.view.lblValue2.text = selectedRowItem.dateToDisplay;
        } else {
          this.view.lblValue2.text = selectedRowItem.lblBottomSheet;
        }
      } else {
        //No Change
      }
    },

    /**
     * method to validate amount fields
    */
    validateAmount: function (widgetData) {
      this.view.txtSearchInput5.text = this.formatAmount(this.view.txtSearchInput5.text);
      this.view.txtSearchInput6.text = this.formatAmount(this.view.txtSearchInput6.text);
      let minAmount = parseFloat(this.view.txtSearchInput5.text);
      minAmount = isNaN(minAmount) ? "" : minAmount;
      let maxAmount = parseFloat(this.view.txtSearchInput6.text);
      maxAmount = isNaN(maxAmount) ? "" : maxAmount;
      if (minAmount !== "" && maxAmount !== "" && minAmount > maxAmount) {
        this.view.flxError.setVisibility(true);
        this.view.flxSearchInput5.top = "0dp";
        this.view.txtSearchInput5.skin = "sknTbxErrorMaxRange";
        this.view.txtSearchInput6.skin = "sknTbxErrorMaxRange";
        this.view.btnApply.setEnabled(false);
        this.view.btnApply.skin = "sknBtnOnBoardingInactive";
      }
      else {
        this.initAmountTextBox();
      }
      this.setInputValue(widgetData);
    },

    /**
     * formats number to x.xx format
     * @param {String} text
     */
    formatAmount: function (text) {
        if (this.isEmptyNullUndefined(text)) {
            return "";
        }
        if (text.indexOf(".") === -1) {
            return text.substring(0, 12) + ".00";
        }
        dotIndex = text.indexOf(".");
        let preDot = text.substring(0, dotIndex);
        let postDot = text.substring(dotIndex + 1, text.length);
        postDot = postDot.replaceAll(".", "");
        let finalAmount = preDot;
        if (postDot.length === 0) {
            finalAmount = finalAmount + ".00";
        } else if (postDot.length === 1) {
            finalAmount = finalAmount + "." + postDot + "0";
        } else {
            finalAmount = finalAmount + "." + postDot.substring(0,2);
        }
        return finalAmount;
    },


    /**
     * @function : restrictSpecialCharacters
     * @description : Invoked to restrict the input fields
    */
    restrictSpecialCharacters: function(){
      var specialCharactersSet = "~#^|$%&*!@()_-+=}{][/|?,.><`':;\"\\";
      var alphabetsSet = "abcdefghijklmnopqrstuvwxyz";
      var numbersSet = "0123456789";
      var space = "";
      this.view.txtSearchInput1.restrictCharactersSet = specialCharactersSet.replace("!@#&*_'-.,", "");
      this.view.txtSearchInput2.restrictCharactersSet = specialCharactersSet + space;
      this.view.txtSearchInput3.restrictCharactersSet = specialCharactersSet;
      this.view.txtSearchInput5.restrictCharactersSet = specialCharactersSet.replace(".", "") + alphabetsSet + alphabetsSet.toUpperCase() + space;
      this.view.txtSearchInput6.restrictCharactersSet = specialCharactersSet.replace(".", "") + alphabetsSet + alphabetsSet.toUpperCase() + space;
    },

    /**
     * Set default context to bottom sheet
    */
    setDefaultContextToAdvSearch : function(selectedField){
      let context = {};
      let selectedRow = this.ManageActivitiesPresenter.getSelectedStatusRow(selectedField);
      context.selectedField = selectedField;
      context.statusContext = {
        masterData:[
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("i18n.Search.AllTransfers"),
            "lblBottomSheetHeader" : "Status",
            "keyName" : "All Transfers",
            "key" : 1,
            "imgSelect" : {
              "isVisible": true,
              "src" : "new_tickmark.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("i18n.Search.Pending"),
            "lblBottomSheetHeader" : "Status",
            "keyName" : "Pending",
            "key" : 2,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("i18n.Search.AwaitingFunds"),
            "lblBottomSheetHeader" : "Status",
            "keyName" : "AwaitingFunds",
            "key" : 3,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("i18n.Search.Failed"),
            "lblBottomSheetHeader" : "Status",
            "keyName" : "Failed",
            "key" : 4,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("i18n.Search.Scheduled"),
            "lblBottomSheetHeader" : "Status",
            "keyName" : "Scheduled",
            "key" : 5,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("i18n.Search.Completed"),
            "lblBottomSheetHeader" : "Status",
            "keyName" : "Completed",
            "key" : 6,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("i18n.Search.Cancelled"),
            "lblBottomSheetHeader" : "Status",
            "keyName" : "Cancelled",
            "key" : 7,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
          },
        ],
        headerContext : kony.i18n.getLocalizedString("i18n.common.status"),
        selectedRow : selectedRow
      };
      context.timePeriodContext = {
        masterData:[
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.Last7days"),
            "lblBottomSheetHeader" : "TimePeriod",
            "shortName" : "7D",
            "key" : 1,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last1month"),
            "lblBottomSheetHeader" : "TimePeriod",
            "shortName" : "1M",
            "key" : 2,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last3months"),
            "lblBottomSheetHeader" : "TimePeriod",
            "shortName" : "3M",
            "key" : 3,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last6months"),
            "lblBottomSheetHeader" : "TimePeriod",
            "shortName" : "6M",
            "key" : 4,
            "imgSelect" : {
              "isVisible": true,
              "src" : "new_tickmark.png",
            },
          },
          {
            "lblBottomSheet" : kony.i18n.getLocalizedString("kony.mb.PFM.CustomDateRange"),
            "lblBottomSheetHeader" : "TimePeriod",
            "shortName" : "Custom",
            "key" : 5,
            "imgSelect" : {
              "isVisible": false,
              "src" : "transparent.png",
            },
            "startDate" : {
              "startDateComp" : "",
              "formattedStartDate" : "",
            },
            "endDate" : {
              "endDateComp" : "",
              "formattedEndDate" : "",
            },
            "dateToDisplay" : "",
          },
        ],
        headerContext : kony.i18n.getLocalizedString("i18n.TradeFinance.TimePeriod"),
        selectedRow : selectedRow
      };
      let toDate = new Date();
      let fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 1);
      context.dateRangeContext = {
        fromDate : {
            dateComponents : [fromDate.getDate(), fromDate.getMonth() + 1, fromDate.getFullYear(), 0, 0, 0],
        },
        toDate : {
            dateComponents : [toDate.getDate(), toDate.getMonth() + 1, toDate.getFullYear(), 0, 0, 0],
        }
      }
      this.view.BottomSheet.setContext(context);
    },

    /**
     * @function : navigateFromAccount
     * @description : Invoked onClick of From account flex
    */
    navigateFromAccount: function() {
      this.ManageActivitiesPresenter.getFromAccountsList(); 
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
      let advSearchedData = this.ManageActivitiesPresenter.getAdvSearchBtnData();
      if(advSearchedData.isSearch === false) {
        this.ManageActivitiesPresenter.filterTransfersAdvSearch(advSearchedData);
      } else {
        this.ManageActivitiesPresenter.clearAdvSearchOptions();
        this.initAmountTextBox();
        var navManager = applicationManager.getNavigationManager();
        navManager.navigateTo({"appName":"TransfersMA","friendlyName":"ManageActivitiesUIModule/frmTransferActivitiesTransfersEurope"});     
      }
    }
  };
});