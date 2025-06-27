define(['FormControllerUtility','./UnifiedTransfersAcknowledgementBusinessController','./UnifiedTransfersAcknowledgementStore', 'DataValidationFramework/DataValidationHandler'], function(FormControllerUtility, BusinessController, UnifiedTransfersAckStore, DataValidationHandler) {
	return {
		constructor: function(baseConfig, layoutConfig, pspConfig) {
			this._serviceParameters = {};
      this._dataFormatting = {};
      this._dataMapping = {};
      this.context = {};
      this.businessController = new BusinessController();
      this.store = UnifiedTransfersAckStore;
      this.businessController.store = this.store;
      this.collectionObj = UnifiedTransfersAckStore.getState();
	    this.dataValidationHandler = new DataValidationHandler();
		},
		//Logic for getters/setters of custom properties
		initGettersSetters: function() {
      defineGetter(this, 'serviceParameters', () => {
        return this._serviceParameters;
      });
      defineSetter(this, 'serviceParameters', value => {
        this._serviceParameters = value;
      });
      defineGetter(this, 'dataMapping', () => {
        return this._dataMapping;
      });
      defineSetter(this, 'dataMapping', value => {
        this._dataMapping = value;
      });
      defineGetter(this, 'dataFormatting', () => {
        return this._dataFormatting;
      });
      defineSetter(this, 'dataFormatting', value => {
        this._dataFormatting = value;
      });
    },
    /**
    * @api : preShow
    * Gets invoked initially before rendering of UI
    * @return : NA
    */
    preShow: function () {
      var scope = this;
      try {
        this.view.flxSupportingDocuments.setVisibility(false);
        this.view.flxVerifyPayee.setVisibility(false);
        this.businessController.setProperties(this.serviceParameters, this.dataMapping, this.dataFormatting);
      } catch (err) {
        var errorObj = {
          "level": "ComponentController",
          "method": "preShow",
          "error": err
        };
        scope.onError(errorObj);
      }
    },
     /**
    * @api : setFocus
    * Gets invoked when click on skip to main content
    * @return : NA
    */
    setbtnFocus: function(){
      var scope = this;
      try {
        this.view.button1.setFocus(true);  
      } catch (err) {
        var errorObj = {
          "level": "ComponentController",
          "method": "setFocus",
          "error": err
        };
        scope.onError(errorObj);
      }    
    },      
    /**
    * @api : postShow
    * Performs the actions required before rendering component
    * @return : NA
    */
    postShow: function () {
      var scope = this;
      try {
        this.view.flxSupportingDocuments.setVisibility(false);
        this.setFlexHeight();
        this.setData();
        this.enableSavePayeeButton();
        this.bindUIToButtons();
        this.view.button3.onClick = this.actionHandler.bind(this, this.context, 3);
        this.view.button2.onClick = this.actionHandler.bind(this, this.context, 2);
        this.view.button1.onClick = this.actionHandler.bind(this, this.context, 1);
        this.view.button2.accessibilityConfig = {
            a11yLabel: "Save Payee " + this.view.lblField2Value.text
        };
        
      } catch (err) {
        var errorObj = {
          "level": "ComponentController",
          "method": "postShow",
          "error": err
        };
        scope.onError(errorObj);
      }
    },
      /**
     * @api : setContext
     * Method to set the context value 
     * @return : NA
     */
      setContext: function (context) {
        var scope = this;
      try {
        this.context = context;
        this.unsubscribe = UnifiedTransfersAckStore.subscribe(this.render.bind(this));
        this.businessController.setContextDataInStore(context);
      } catch (err) {
        var errorObj = {
          "level": "ComponentController",
          "method": "SetContext",
          "error": err
        };
        scope.onError(errorObj);
      }
    },
    /**
     * @api : onBreakpointChange
     * Method invoked on chaning break points
     * @return : NA
     */
    onBreakpointChange: function () {
      var scope = this;
      FormControllerUtility.updateWidgetsHeightInInfo(this.view, ['flxSection2', 'flxSection1']);
      try {
        this.setData();
        // this.populateButtonTexts();
        this.enableSavePayeeButton();
        this.bindUIToButtons();
        this.view.forceLayout();
      } catch (err) {
        var errorObj = {
          "level": "ComponentController",
          "method": "onBreakpointChange",
          "error": err
        };
        scope.onError(errorObj);
      }
    },
    /**
    * @api : unsubscribeStore
    * Method to unsubscribe the store's listener
    * @return : NA
    */
    unsubscribeStore: function () {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    },
    /**
     * setData
     * @api : setData
     * sets data in UI based on contract configurations
     * @return : NA
     */
    setData: function () {
      var scope = this;
      scope.setComponentUILabelText();
      scope.setComponentUILabelValues();
      scope.setBankNameDetails();
      scope.setEndDate();
      scope.showOrHideUIFlex();
      scope.populateDocumentsName();
      scope.populateChargesBreakdown();
      scope.populateAddressDetails();
      if(scope.collectionObj.Collection.transactionType === "MpesaTransfer" || scope.collectionObj.Collection.transactionType === "ATMTransfer" || scope.collectionObj.Collection.transactionType === "TelebirrTransfer" || scope.collectionObj.Collection.transactionType === "MpesaTrustTransfer" ){
        for (let i = 9; i <= 30; i++) {
          var flexWidget = "flxField" + i;
          if (scope.view[flexWidget]) {
              scope.view[flexWidget].setVisibility(false);
          }
      }
      }
    },
    /**
    * @api : render
    * This method will be invoked when collection is updated to refresh UI
    * @return : NA
    */
    render: function() {
      this.collectionObj = UnifiedTransfersAckStore.getState();
    },
    setComponentUILabelText: function () {
      var scope = this;
      this.view.lblSection1Message.text = this.businessController.getDataBasedOnDataMapping("lblSection1Message");
      this.view.lblSection1Header.text = this.businessController.getDataBasedOnDataMapping("lblSection1Header");
      this.view.lblSection2Header.text = this.businessController.getDataBasedOnDataMapping("lblSection2Header");
      if(scope.collectionObj.Collection.transactionType === "MpesaTransfer"){
        scope.view.flxSection2.setVisibility(true);
        scope.view.lblField1Key.text = "From:";
        scope.view.lblField2Key.text = "Amount:";
        scope.view.lblField3Key.text = "Phone Number:";
        scope.view.lblField4Key.text = "Reason:";
        scope.view.lblField5Key.text = "Transaction Type:";
        scope.view.lblField6Key.text = "Transaction Date:";
        scope.view.lblField8Key.text = "Reciever Name:";
        
      } else if(scope.collectionObj.Collection.transactionType === "MpesaTrustTransfer"){
        scope.view.flxSection2.setVisibility(true);
        scope.view.lblField1Key.text = "From:";
        scope.view.lblField2Key.text = "Amount:";
        scope.view.lblField3Key.text = "Agent Phone Number:";
        scope.view.lblField4Key.text = "Reason:";
        scope.view.lblField5Key.text = "Transaction Type:";
        scope.view.lblField6Key.text = "Transaction Date:";
        scope.view.lblField8Key.text = "Reciever Name:";
        
      }
       else if(scope.collectionObj.Collection.transactionType === "ATMTransfer"){
        scope.view.flxSection2.setVisibility(true);
        scope.view.lblField1Key.text = "From:";
        scope.view.lblField2Key.text = "Amount:";
        scope.view.lblField3Key.text = "Phone Number:";
        scope.view.lblField4Key.text = "Currency:";
        scope.view.lblField5Key.text = "Transaction Type:";
        scope.view.lblField6Key.text = "Transaction Date:";
        scope.view.lblField8Key.setVisibility(false)
        
      } else if(scope.collectionObj.Collection.transactionType === "TelebirrTransfer"){
        scope.view.flxSection2.setVisibility(true);
        scope.view.lblField1Key.text = "From:";
        scope.view.lblField2Key.text = "Amount:";
        scope.view.lblField3Key.text = "Phone Number:";
        scope.view.lblField4Key.text = "Reason:";
        scope.view.lblField5Key.text = "Transaction Type:";
        scope.view.lblField6Key.text = "Transaction Date:";
        scope.view.lblField8Key.text = "Reciever Name:";
        
      } 
      // else if(this.collectionObj.Collection.MpesaTransaction.transactionType === "MpesaTransfer"){
      //   this.view.flxSection2.setVisibility(true);
      //   this.view.lblField1Key.text = "From:";
      //   this.view.lblField2Key.text = "Amount:";
      //   this.view.lblField3Key.text = "Phone Number:";
      //   this.view.lblField4Key.text = "Reason:";
      //   this.view.lblField5Key.text = "Transaction Type:";
      //   this.view.lblField6Key.text = "Transaction Date:";
      //   this.view.lblField8Key.text = "Reciever Name:";
        
      // }
      else{
      for (let i = 1; i <= 30; i++) {
        var widget = "lblField" + i + "Key";
        this.view[widget].text = this.businessController.getDataBasedOnDataMapping(widget) + ":";
        this.view[widget].text.accessibilityConfig = {
          "a11yARIA": {
            "tabindex": -1
          }
        }; 
        
      }
    }
      this.view.lblChargesBreakdownKey.text = this.businessController.getDataBasedOnDataMapping("lblChargesBreakdownKey") + ":";
      this.view.lblSupportingDocuments.text = this.businessController.getDataBasedOnDataMapping("lblSupportingDocuments") + ":";
      this.view.imgSuccess.src = "success_green.png";
      this.view.lblReferenceNumber.text = this.businessController.getDataBasedOnDataMapping("lblReferenceNumber");
    },
    setComponentUILabelValues: function () {
      var scope = this;
      if(scope.collectionObj.Collection.transactionType === "MpesaTransfer"){
        scope.view.flxSection2.setVisibility(true);
        scope.view.lblField1Value.text = scope.collectionObj.Collection.Transaction.formattedFromAccount;
        scope.view.lblField2Value.text = scope.collectionObj.Collection.MpesaTransaction.body.debitAmount;
        scope.view.lblField3Value.text = scope.collectionObj.Collection.MpesaTransaction.body.phone;
        scope.view.lblField4Value.text = scope.collectionObj.Collection.MpesaTransaction.body.reason;
        scope.view.lblField5Value.text = scope.collectionObj.Collection.MpesaTransaction.body.transactionType;
        scope.view.lblField6Value.text = scope.collectionObj.Collection.MpesaTransaction.body.transactionDate;
        scope.view.lblField8Value.text = scope.collectionObj.Collection.Recipients.payeeName;
        
        
      } else if(scope.collectionObj.Collection.transactionType === "MpesaTrustTransfer"){
        scope.view.flxSection2.setVisibility(true);
        scope.view.lblField1Value.text = scope.collectionObj.Collection.Transaction.formattedFromAccount;
        scope.view.lblField2Value.text = scope.collectionObj.Collection.MpesaTrustTransaction.body.debitAmount;
        scope.view.lblField3Value.text = scope.collectionObj.Collection.MpesaTrustTransaction.body.phone;
        scope.view.lblField4Value.text = scope.collectionObj.Collection.MpesaTrustTransaction.body.reason;
        scope.view.lblField5Value.text = scope.collectionObj.Collection.MpesaTrustTransaction.body.transactionType;
        scope.view.lblField6Value.text = scope.collectionObj.Collection.MpesaTrustTransaction.body.transactionDate;
        scope.view.lblField8Value.text = scope.collectionObj.Collection.Recipients.payeeName;
        
        
      }
       else if(scope.collectionObj.Collection.transactionType === "TelebirrTransfer"){
        scope.view.flxSection2.setVisibility(true);
        scope.view.lblField1Value.text = scope.collectionObj.Collection.Transaction.formattedFromAccount;
        scope.view.lblField2Value.text = scope.collectionObj.Collection.TelebirrTransaction.body.debitAmount;
        scope.view.lblField3Value.text = scope.collectionObj.Collection.TelebirrTransaction.body.phone;
        scope.view.lblField4Value.text = scope.collectionObj.Collection.TelebirrTransaction.body.debitCurrency;
        scope.view.lblField5Value.text = scope.collectionObj.Collection.TelebirrTransaction.body.transactionType || "Telebirr Transfer";
        scope.view.lblField6Value.text = scope.collectionObj.Collection.TelebirrTransaction.body.transactionDate || scope.collectionObj.Collection.Transaction.formattedSendOnDate;
        scope.view.lblField8Value.text = scope.collectionObj.Collection.Recipients.payeeName;
        
        
      }
      else if(scope.collectionObj.Collection.transactionType === "ATMTransfer"){
        scope.view.flxSection2.setVisibility(true);
        scope.view.lblField1Value.text = scope.collectionObj.Collection.Transaction.formattedFromAccount;
        scope.view.lblField2Value.text = scope.collectionObj.Collection.ATMTransaction.body.debitAmount;
        scope.view.lblField3Value.text = scope.collectionObj.Collection.ATMTransaction.body.beneficiaryTel;
        scope.view.lblField4Value.text = scope.collectionObj.Collection.ATMTransaction.body.debitCurrency;
        scope.view.lblField5Value.text = scope.collectionObj.Collection.ATMTransaction.body.transactionType || "ATMTransfer";
        scope.view.lblField6Value.text = scope.collectionObj.Collection.ATMTransaction.body.debitValueDate;
        scope.view.lblField8Value.text = scope.collectionObj.Collection.Recipients.payeeName;
        
        
      }
      else{
        for (let i = 1; i <= 30; i++) {
          var widget = "lblField" + i + "Value";
          this.view[widget].text = this.businessController.getDataBasedOnDataMapping(widget);
           this.view[widget].text.accessibilityConfig = {
            "a11yARIA": {
              "tabindex": -1
            }
          }; 
        }
      }
      
      this.payeeTypeContext = this.businessController.getDataBasedOnDataMapping("payeeTypeContext");
      if (this.payeeTypeContext === "New Payee") { 
        this.view.lblField2Value.text = this.context.Recipients.payeeName;
        this.view.lblField10Value.text = this.context.Recipients.accountNumber;
      }
      this.view.flxAckDetailsView.top = "80dp";
      
      if(scope.collectionObj.Collection.transactionType === "MpesaTransfer"){
        this.view.lblReferenceNumberValue.text = this.collectionObj.Collection.MpesaTransaction.header.id;
      } else if (scope.collectionObj.Collection.transactionType === "TelebirrTransfer"){
        this.view.lblReferenceNumberValue.text = this.collectionObj.Collection.TelebirrTransaction.header.id;
      } else if (scope.collectionObj.Collection.transactionType === "MpesaTrustTransfer"){
        this.view.lblReferenceNumberValue.text = this.collectionObj.Collection.MpesaTrustTransaction.header.id;
      } else if (scope.collectionObj.Collection.transactionType === "ATMTransfer"){
        this.view.lblReferenceNumberValue.text = this.collectionObj.Collection.ATMTransaction.header.id;
      }
       else {
        this.view.lblReferenceNumberValue.text = this.businessController.getDataBasedOnDataMapping("lblReferenceNumberValue");
      }
      this.view.lblSection1Message.text = this.businessController.getDataBasedOnDataMapping("lblSection1Message") || "Successful";
      this.view.flxWarningBorder.setVisibility(false);
      if (this.collectionObj.Collection.Transaction && this.collectionObj.Collection.Transaction.messageDetails) {
        this.view.flxAckDetailsView.top = "25dp";
        let data = JSON.parse(this.businessController.getDataBasedOnDataMapping("messageDetails"));
        if (data.length > this.dataMapping.maxLength) {
          data = data.slice(0, this.dataMapping.maxLength);
        };
        let parsedData = "";
        this.view.lblSuccess.setVisibility(false);
        this.view.RichTextMsg1.setVisibility(false);
        this.view.RichTextGenMsg.setVisibility(false);
        this.view.imgErrorMessage.src = "error_yellow.png" ;
        this.view.flxMessageList.setVisibility(false);
        if (!data) return;
        if (typeof (data) !== "string") {
          if (data.length > 1) {
            this.view.flxMessageList.setVisibility(true);
            this.view.RichTextGenMsg.text = kony.i18n.getLocalizedString("i18n.common.PleaseFollow")
          } else {
            this.view.RichTextGenMsg.text = data[0].message;
          }
        } else {
          this.view.RichTextGenMsg.text = data;
        }
        for (var i = 0; i < data.length; i++) {
          parsedData += "<span style='color:#E3E3E3; font-size:2mm;position:relative;top:-3px;'>&#11044;&nbsp;&nbsp;&nbsp;</span>" + data[i].message + "<br>" + "<br aria-hidden = true>";
        }
        this.view.RichTextMsg1.text = parsedData;
        this.view.RichTextMsg1.setVisibility(true);
        this.view.RichTextGenMsg.setVisibility(true);
        this.view.flxWarningBorder.setVisibility(true);
      }
      this.setCustomerNameAndVisibility();
    },
    setEndDate: function () {
      var scope = this;
      try {
        var noOfRecurrence = this.context.Transaction.numberOfRecurrences;
        var startDate = this.businessController.getDataBasedOnDataMapping("lblField8Value"); //Start Date
        var frequency = this.businessController.getDataBasedOnDataMapping("lblField6Value"); //Frequency
        var noofDays = 0;
        if (!scope.isEmptyNullOrUndefined(noOfRecurrence) && !scope.isEmptyNullOrUndefined(frequency)) {
          if (noOfRecurrence !== "") {
            noOfRecurrence = noOfRecurrence - 1;
            switch (frequency) {
              case "Daily":
                noofDays = noOfRecurrence * 1;
                break;
              case "Weekly":
                noofDays = noOfRecurrence * 7;
                break;
              case "BiWeekly":
                noofDays = noOfRecurrence * 14;
                break;
              case "Monthly":
                noofDays = noOfRecurrence * 30;
                break;
              case "Quarterly":
                noofDays = noOfRecurrence * 91;
                break;
              case "Half Yearly":
                noofDays = noOfRecurrence * 182;
                break;
              case "Yearly":
                noofDays = noOfRecurrence * 365;
                break;
            }
              var formattedStartDate = scope.businessController.getDateObjectFromCalendarString(startDate, "DD/MM/YYYY");
              var dateObject = new Date(formattedStartDate);
              dateObject.setDate(dateObject.getDate() + noofDays);
              var formattedEndDate = (dateObject.getDate() < 10 ? '0' : '') + dateObject.getDate() + "/" + (((dateObject.getMonth()+1) < 10 ? '0' : '') + (dateObject.getMonth()+1)) + "/" + dateObject.getFullYear();
              this.view.lblField9Value.text = formattedEndDate; //End date
            }
        }
    } catch (err) {
        var errorObj = {
          "level": "ComponentController",
          "method": "setEndDate",
          "error": err
        };
        scope.onError(errorObj);
      }
    },
    showOrHideUIFlex: function () {
      var scope = this;
      try {
        for (var j = 1; j <= 30; j++) {
          fieldValue = "lblField" + j + "Value";
          if (!scope.isEmptyNullOrUndefined(this.view[fieldValue].text)) {
            this.view["flxField" + j].isVisible = true;
          } else
            this.view["flxField" + j].isVisible = false;
        }
        if (!scope.isEmptyNullOrUndefined(this.view.lblField7Value.text)) {
          if (this.view.lblField6Value.text === kony.i18n.getLocalizedString("i18n.transfers.frequency.once")) {
            this.view.flxField7.isVisible = true;
            this.view.flxField8.isVisible = false;
            this.view.flxField9.isVisible = false;
            this.view.flxField26.isVisible = false;
          } else {
            if (this.context.Transaction.numberOfRecurrences !== "") { 
            //frequency is not once and has number of recurrences
            this.view.flxField7.isVisible = false; //Send on
            this.view.flxField8.isVisible = true; //Start date
            this.view.flxField9.isVisible = true; //End date
            this.view.flxField26.isVisible = true; //No.of recurrences
          }else { //frequency is not once and has an end date
            this.view.flxField7.isVisible = false;
            this.view.flxField8.isVisible = true;
            this.view.flxField9.isVisible = true;
            this.view.flxField26.isVisible =false;
        }
      }
    }

        if (scope.isEmptyNullOrUndefined(scope.view.lblReferenceNumberValue.text)) {
          scope.view.flxReferenceNumber.setVisibility(false);
        } else {
          scope.view.flxReferenceNumber.setVisibility(true);
        }
        //adding payee verify code.
        //var payeeVerifyStatus = this.businessController.getDataBasedOnDataMapping("payeeVerificationStatus");
        if(scope.collectionObj.Collection.Transaction["payeeVerificationStatus"] === "Success"){
          this.view.flxVerifyPayee.setVisibility(true);
        }else {
          this.view.flxVerifyPayee.setVisibility(false);
        }
      //var payeeVerifyErrCode = this.businessController.getDataBasedOnDataMapping("payeeVerificationErrCode");
      } catch (err) {
        var errorObj = {
          "level": "ComponentController",
          "method": "showOrHideUIFlex",
          "error": err
        };
        scope.onError(errorObj);
      }
    },
    /**
    * @api : bindUIToButtons
    * Helper method bind skin and text to the UI widgets
    * @return : NA
    */
    bindUIToButtons: function () {
      var scope = this;
      try {
        for (let i = 1; i <= 4; i++) {
          let widgetId = "button" + i;
          let text = this.businessController.getDataBasedOnDataMapping(widgetId);
          if (!this.isEmptyNullOrUndefined(text)) {
            scope.view[widgetId].text = text;
            //scope.view[widgetId].toolTip = text;
          } else {
            scope.view[widgetId].setVisibility(false);
          }
        }
      } catch (err) {
        var errorObj = {
          "level": "ComponentController",
          "method": "bindUIToButtons",
          "error": err
        };
        scope.onError(errorObj);
      }
    },
    /**
     * setFlexHeight
     * @api : setFlexHeight
     * event called to get and set the height of flexes dynamically
     * @return : NA
     */
    setFlexHeight: function () {
      var scope = this;
      var breakPointValue = kony.application.getCurrentBreakpoint();
      if (breakPointValue <= 1024) {
        this.view.flxSection2.doLayout = null;
        scope.view.flxSection1.height = undefined;
        this.view.flxMiddleContent.forceLayout();
      } else if (breakPointValue > 1024) {
        (this.view.flxSection2.info.frame.height > this.view.flxSection1.info.frame.height)? this.view.flxSection1.height = this.view.flxSection2.info.frame.height + "dp" : this.view.flxSection2.height = this.view.flxSection1.info.frame.height + "dp";
		//this.view.flxSection1.height = this.view.flxSection2.info.frame.height+"dp";
      }
    },
   /**
     * enableSavePayeeButton
     * @api : enableSavePayeeButton
     * enables Save this Payee button based on the type of payee 
     * @return : NA
     */
   enableSavePayeeButton: function () {
    this.payeeTypeContext = this.businessController.getDataBasedOnDataMapping("payeeTypeContext");
    if (this.payeeTypeContext === "New Payee") {       //how to get payee type context
      var parsedValue2 = this.businessController.getDataBasedOnDataMapping("button2");
      if (parsedValue2) {
        var transferType = this.context.Transaction.transferType;
        if (this.checkUserPermissionForTransferType(transferType))
          this.view.button2.setVisibility(true);
        else
          this.view.button2.setVisibility(false);
      } else {
        this.view.button2.setVisibility(false);
      }
    } else {
      this.view.button2.setVisibility(false);
    }
  },

  checkUserPermissionForTransferType: function (transferType) {
    switch (transferType) {
      case kony.i18n.getLocalizedString("i18n.payments.domesticTransfer"):
        return applicationManager.getConfigurationManager().checkUserPermission("INTER_BANK_ACCOUNT_FUND_TRANSFER_CREATE_RECEPIENT");
      case kony.i18n.getLocalizedString("i18n.payments.internationalTransfer"):
        return applicationManager.getConfigurationManager().checkUserPermission("INTERNATIONAL_ACCOUNT_FUND_TRANSFER_CREATE_RECEPIENT");
      case kony.i18n.getLocalizedString("kony.mb.approvalsAndRequest.filter.sameBank"):
        return applicationManager.getConfigurationManager().checkUserPermission("INTRA_BANK_FUND_TRANSFER_CREATE_RECEPIENT");
      case kony.i18n.getLocalizedString("i18n.payments.payAPerson"):
        return applicationManager.getConfigurationManager().checkUserPermission("P2P_CREATE_RECEPIENT");
      default:
        return false;
    }
  },

  
    actionHandler: function (context, buttonNumber) {
      var functionToCall = "button" + buttonNumber + "Click";
      this[functionToCall](context);
    },
    /**
     * @api : populateDocumentsName
     * To set the visibility of the flex for supporting documents  based on the input documents
     * @return : NA
     */
    populateDocumentsName: function () {
      var containDocument = false;
      var documentList = this.businessController.getDataBasedOnDataMapping("attachedFileList");
      // set all files to visibility false.
      for (var val = 1; val <= 5; val++) {
        this.view["flxDoc" + val].isVisible = false;
      }
      if (documentList) {
        for (var i = 0; i < documentList.length; i++) {
          var j = i + 1;
          this.view["lblDoc" + j].text = documentList[i][0];
          this.view["imgDoc" + j].src = documentList[i][1];
          containDocument = true;
          this.view["lblDoc" + j].isVisible = true;
          this.view["imgDoc" + j].isVisible = true;
          this.view["flxDoc" + j].isVisible = true;
        }
        this.view.flxSupportingDocuments.setVisibility(false);
      }
      if (containDocument === false) {
        this.view.flxSupportingDocuments.setVisibility(false);
      }
    },
    /**
      * @api : populateChargesBreakdown
      * To set the visibility of the flex for charges breakdown based on the input charges
      * @return : NA
      */
    populateChargesBreakdown: function () {
      var scope = this;
      try {
        // this.view.lblChargesBreakdown.text = this.getLabelText(this._chargesLabel);
        const chargesList = this.businessController.getDataBasedOnDataMapping("lblChargesBreakdownValue");
        if (!scope.isEmptyNullOrUndefined(chargesList)) {
          this.view.flxChargesBreakdown.setVisibility(true);
          for (var i = 0, j = 1; j <= chargesList.length / 2; i += 2, j++) {
            const chargeLabel = chargesList[i];
            const chargeValue = chargesList[i + 1];
            if (chargeValue) {
              this.view["lblCharge" + j].text = chargeLabel;
              this.view["lblChargeValue" + j].text = chargeValue;
              this.view["flxCharge" + j].isVisible = true;
            }
            else {
              this.view["flxCharge" + j].isVisible = false;
            }
          }
        } else {
          this.view.flxChargesBreakdown.setVisibility(false);
        }
      } catch (err) {
        var errorObj = {
          "level": "ComponentController",
          "method": "populateChargesBreakdown",
          "error": err
        };
        scope.onError(errorObj);
      }
    },
    /**
     * populateAddressDetails
     * @api : populateAddressDetails
     * populates address details based on contracts
     * @return : NA
     */
    populateAddressDetails: function () {
      var scope = this;
      var address = "";
      var phoneNumber = this.businessController.getDataBasedOnDataMapping("lblField20Value");
      var emailId = this.businessController.getDataBasedOnDataMapping("lblField21Value");
      var addressLine1 = this.businessController.getDataBasedOnDataMapping("addressLine1");
      var addressLine2 = this.businessController.getDataBasedOnDataMapping("addressLine2");
      var city = this.businessController.getDataBasedOnDataMapping("city");
      var state = this.businessController.getDataBasedOnDataMapping("state");
      var country = this.businessController.getDataBasedOnDataMapping("country");
      var zipCode = this.businessController.getDataBasedOnDataMapping("zipCode");
      address = [addressLine1, addressLine2, city, state, country, zipCode].join(",");
      address = address.replace(/^,+|,+$/g, '').replace(/,+/g, ', ');
      if (address === "") {
        this.view.flxField22.setVisibility(false);
      } else {
        this.view.lblField22Value.text = address;
        this.view.flxField22.setVisibility(true);
      }
      if (phoneNumber) {
        this.view.lblField20Value.text = phoneNumber;
        this.view.flxField20.setVisibility(true);
      } else {
        this.view.flxField20.setVisibility(false);
      }
      if (emailId) {
        this.view.lblField21Value.text = emailId;
        this.view.flxField21.setVisibility(true);
      } else {
        this.view.flxField21.setVisibility(false);
      }
      var transferTypeContext = this.businessController.getDataBasedOnDataMapping("transactionType");
      if (transferTypeContext !== "P2P") {
        if (scope.isEmptyNullOrUndefined(address) && scope.isEmptyNullOrUndefined(phoneNumber) && scope.isEmptyNullOrUndefined(emailId))
          this.view.flxAddressHeader.setVisibility(false);
      } else {
        this.view.flxAddressHeader.setVisibility(false);
      }
    },
    /**
     * @api : setBankNameDetails
     * Method to hide/Show bank name details if available
     * @return : NA
     */
    setBankNameDetails: function () {
      var transferTypeContext = this.businessController.getDataBasedOnDataMapping("transactionType");
      if (transferTypeContext === "Domestic Transfer" || transferTypeContext === "International Transfer") {
        this.view.flxField23.isVisible = true;
      } else this.view.flxField23.isVisible = false;
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

   /**
    * @function : setCustomerNameAndVisibility
    * @description : Invoked to set and manage the visibility of truncated customer names and Id based on single or multi customer
    * @private
    */ 
    setCustomerNameAndVisibility: function () {
      let isSingleCustomerProfile = applicationManager.getUserPreferencesManager().isSingleCustomerProfile;
      if (!isSingleCustomerProfile) {
        let transaction = this.context.Transaction && this.context.Transaction ? this.context.Transaction : "";
        let accountType = transaction && transaction.accountType ? transaction.accountType : "";
        this.view.lblFromCusName.text = "(" + this.businessController.getDataBasedOnDataMapping("lblFromCusName") + ")";
        if (accountType === "CreditCard" || accountType === "External") {
          this.view.lblFromCusName.setVisibility(true);
          this.view.lblToCusName.setVisibility(false);
        } else if (accountType !== "") {
          this.view.lblToCusName.text = "(" + this.businessController.getDataBasedOnDataMapping("lblToCusName") + ")";
          this.view.lblFromCusName.setVisibility(true);
          this.view.lblToCusName.setVisibility(true);
        } else {
          this.view.lblFromCusName.setVisibility(false);
          this.view.lblToCusName.setVisibility(false);
        }
      } else {
        this.view.lblFromCusName.setVisibility(false);
        this.view.lblToCusName.setVisibility(false);
      }
    }
	};
});