define(['FormControllerUtility', 'CommonUtilities', 'ViewConstants', 'OLBConstants'], function (FormControllerUtility, CommonUtilities, ViewConstants, OLBConstants) {
     
    var orientationHandler = new OrientationHandler();
    var pageNumber;
    var totalNoOfRecords;
    var noResults;
    var recordsPerPage;
    var records = [];
    var searchView;
    var searchKeyword;
    var international_flag;
    var inter_flag;
    var intra_flag;
    var payment_method;
    var bankName;
  	var payee_Status;
    var isPayeeStatusNotActive = true;
    this.beneficiaryRecords = "";
    var segLastRowClicked=null;
    return {
        init: function () {
            this.view.preShow = this.preShow;
            this.view.postShow = this.postShow;
            this.view.onDeviceBack = function () { };
            this.view.onBreakpointChange = this.onBreakpointChange;
            var scopeObj = this;
            this.ManageActivitiesPresenter = applicationManager.getModulesPresentationController({ "appName": "TransfersMA", "moduleName": "ManageActivitiesUIModule" });
            this.Europresenter = applicationManager.getModulesPresentationController({ "appName": "TransfersMA", "moduleName": "TransferEurUIModule" });
            this.view.txtSearch.onKeyUp = this.onTxtSearchKeyUp.bind(this);
            this.view.btnConfirm.onClick = this.onSearchBtnClick.bind(this);
            this.view.txtSearch.onDone = this.onSearchBtnClick.bind(this);
            var specialCharactersSet = "~#^|$%&*!@()_-+=}{][/|?,.><`':;\"\\";
            this.view.txtSearch.restrictCharactersSet = specialCharactersSet;
            this.view.flxClearBtn.onClick = this.onSearchClearBtnClick.bind(this);
            this.view.btnAddNewBeneficiary.onClick = this.navToAddBeneficiary;
            this.view.flxAddNewBeneficiary.onClick = this.navToAddBeneficiary;
            this.view.flxAddBeneficiary.onClick = this.navToAddBeneficiary;
            this.view.flxCross.onClick = function () {
                scopeObj.view.flxSuccessMessage.setVisibility(false);
            };
            scopeObj.setSorting();
        },
        navToAddBeneficiary: function(){
            let configMgr = applicationManager.getConfigurationManager();
            //TransferFlowType is configurable in spotlight system configurations under DBP.
            if (configMgr.TransferFlowType === "CTF") {
                //if the value is CTF we navigate to make euro add payee screen.
                this.Europresenter.showTransferScreen({
                    context: "AddBeneficiary"
                })
            } else {
                //if it is not CTF it will be UTF and we'll navigate to UTF landing screen
                var navMan = applicationManager.getNavigationManager();
                var data = applicationManager.getUserPreferencesManager().getUserObj();
                navMan.navigateTo({
                    "appName": "TransfersMA",
                    "friendlyName": "frmUTFLanding"
                }, false, data)
            }
        },
        /**
         * AdjustScreen - Method that sets the height of footer properly.
         */
        adjustScreen: function() {
            this.view.flxFooter.top ="40dp";
            this.view.forceLayout();
        },
        onBreakpointChange: function (form, width) {
            var scope = this;
            this.view.CustomPopup.onBreakpointChangeComponent(scope.view.CustomPopup, width);
            this.view.DeletePopup.onBreakpointChangeComponent(scope.view.DeletePopup, width);
            this.view.customheadernew.onBreakpointChangeComponent(width);
            this.view.customfooternew.onBreakpointChangeComponent(width);
            if (this.previousBreakpoint === 640) {
                this.changeTemplateOnBreakpoint("flxManageBeneficiariesSelected");
            }else if (width === 640) {
                this.changeTemplateOnBreakpoint("flxManageBeneficiariesSelectedMobile");
            }
            this.previousBreakpoint = width;
            this.adjustScreen();
        },

        /**
         * This method changes the template of Manage Benificieries segment when breakpoint is changed from any to 640 and 640 to any.
         * This is triggered from onBreakPointChange menthod.
         * @param {String} template - template which has to be assigned to the segment.
         */
        changeTemplateOnBreakpoint : function(template){
            var segData = this.view.segmentBillpay.data;
            if (segData === null || segData === undefined) {
                return;
            }
            segData.forEach(row => {
                row.template = template;
            });
            this.view.segmentBillpay.setData(segData);
        },

        preShow: function () {
            scopeObj=this;
            this.view.customheadernew.activateMenu("EUROTRANSFERS", "Manage Beneficiaries");
            FormControllerUtility.updateWidgetsHeightInInfo(this.view, ['flxHeader', 'flxMain', 'flxFooter', 'customheadernew','flxFormContent']);
            this.view.flxClearBtn.setVisibility(false);
            this.view.flxSuccessMessage.setVisibility(false);
            this.view.txtSearch.text = "";
            var offsetLimit = this.view.pagination.getDefaultOffsetAndLimit();
            this.offset = offsetLimit.offset;
            recordsPerPage = offsetLimit.limit;
            this.view.pagination.fetchPaginatedRecords = this.fetchPaginatedRecords;
            this.view.pagination.resetStartIndex();
            this.view.pagination.collapseDropDown();
            this.view.pagination.onError = this.onErrorHandler;
            this.view.CustomPopup.onKeyPress = this.onKeyPressCallBack;
            this.view.DeletePopup.onKeyPress = this.onKeyPressCallBack;
            this.view.onKeyPress = this.onKeyPressCallBack;
            this.view.customheadernew.btnSkipNav.onClick= function(){
              scopeObj.view.lblPayABill.setActive(true);
            };
            this.view.btnBypass.onClick= this.setFocusToAddPayee;
            this.view.onTouchEnd = this.formOnTouchEndHandler;
            this.setupCombobox();
        },
        setupCombobox:function(){
            let userPreferencesManager = applicationManager.getUserPreferencesManager();
            if (userPreferencesManager.isSingleCustomerProfile) {
                this.view.flxCustomerFilter.isVisible = false;
                return;
            }
            this.view.flxCustomerFilter.isVisible = true;
            let accessibleCustomerIds = userPreferencesManager.accessibleCustomerIds;
            this.view.ComboBox.subscribeToTouchEnd = this.subscribeToTouchEnd;
            this.view.ComboBox.updateTouchEndSubscriber = this.updateTouchEndSubscriber;
            this.view.ComboBox.onSelection = this.filterPayees;
            this.view.ComboBox.onTextBoxTextChange = this.onComboboxTextChange;
            const MAX_COMBINED_NAME_LENGTH = 30;
            const SHORT_NAME_LENGTH = 23;
            this.comboboxData = [{
                selectedValue : kony.i18n.getLocalizedString("i18n.AccountsDetails.ALL"),
                value : kony.i18n.getLocalizedString("i18n.AccountsDetails.ALL"),
                id:-1,
                contractId:-1,
                showAll: true,
                tbxA11YLabel: kony.i18n.getLocalizedString("i18n.TradeLending.selectCustomer")
            }];
            accessibleCustomerIds.forEach((customer)=>{
                let fullName = customer.name+ " - "+customer.id;
                let selectedName = fullName;
                if (fullName.length>MAX_COMBINED_NAME_LENGTH) {
                    let shortName = customer.name.substring(0,SHORT_NAME_LENGTH);
                    let shortID = customer.id;
                    if(customer.id.length>4){
                        shortID = customer.id.substring(customer.id.length-4);
                    }
                    selectedName = shortName+"..."+shortID;
                }
                this.comboboxData.push({
                    selectedValue : selectedName,
                    value : fullName,
                    id : customer.id,
                    contractId : customer.contractId,
                    showAll: false
                });
            })
            let context = {
                data: this.comboboxData,
                defaultSelectedRowNo: 0,
                maxDropdownHeight: 200,
                preAppendi18nKey: "kony.18n.approvalMatrix.customer",
                searchPlaceholderi18nKey: "kony.mb.common.search",
                keyToDisplay: "selectedValue",
            };
            this.view.ComboBox.setContext(context);
        },
        onComboboxTextChange:function(searchText){
            searchText = searchText.toLowerCase();
            let filteredData = [];
            if (searchText === "") {
                filteredData = this.comboboxData;
            } else {
                filteredData = this.comboboxData.filter((row) => {
                    if (row.value.toLowerCase().includes(searchText)) {
                        return true;
                    }
                    return false;
                });
            }
            return filteredData;
        },
        /**
         * method to handle the filter beneficiary functionality
         */
        filterPayees: function (selectedCustomer) {
            this.ManageActivitiesPresenter.filterPayees(selectedCustomer.selectedRowData);
        },
        touchEndSubscribers: new Map(),

        formOnTouchEndHandler: function () {
            //when a user clicks on dropdown item onTouchEnd is triggered first and click is not registered
            //this delay postpones the onTouchEnd so that the click is registered
            kony.timer.schedule("touchEndTimer", this.hideSubscribedWidgetsIfVisible, 0.1, false);
            FormControllerUtility.hidePopupsNew();
        },
    
        hideSubscribedWidgetsIfVisible: function () {
            this.touchEndSubscribers.forEach((value, key, map) => {
                if (value.shouldBeVisible) {
                    value.shouldBeVisible = false;
                    kony.print("**~~**" + key + " has shouldBeVisible is true, so set it up as false and not hiding it");
                    return;
                } else if (value.widget.isVisible) {
                    value.hideFunction();
                    kony.print("**~~**" + key + " hidden");
                    return;
                }
                kony.print("**~~**" + key + " is not visible");
            });
        },
    
        subscribeToTouchEnd: function (subscriberKey, subscriberValue) {
            if (this.touchEndSubscribers.has(subscriberKey)) {
                kony.print("same key exists");
                return false;
            }
            let value = {
                widget: subscriberValue.widget,
                hideFunction: subscriberValue.hideFunction,
                shouldBeVisible: subscriberValue.shouldBeVisible,
            };
            this.touchEndSubscribers.set(subscriberKey, value);
            return true;
        },
    
        updateTouchEndSubscriber: function (subscriberKey, subscriberValue) {
            if (!this.touchEndSubscribers.has(subscriberKey)) {
                kony.print("key doesn't exist");
                return false;
            }
            let value = this.touchEndSubscribers.get(subscriberKey);
            if (subscriberValue.shouldBeVisible !== undefined && subscriberValue.shouldBeVisible !== null) {
                value.shouldBeVisible = subscriberValue.shouldBeVisible;
                this.touchEndSubscribers.set(subscriberKey, value);
                return true;
            }
            kony.print("Can only update shouldBeVisible");
            return false;
        },
        setFocusToAddPayee: function() {     
            if (kony.application.getCurrentBreakpoint() === 1024 || kony.application.getCurrentBreakpoint() === 640) {
            scopeObj.view.flxAddBeneficiary.setActive(true);
            }
            scopeObj.view.flxAddNewBeneficiary.setActive(true);
        },
        onErrorHandler : function(err){
            kony.print("frmManageBeneficiaries Error: "+err);
        },
        onKeyPressCallBack: function (eventObject, eventPayload) {
            var self = this;
            if (eventPayload.keyCode === 27) {
                if (self.view.flxDeletePopup.isVisible === true) {
                    self.view.flxDialogs.isVisible = false;
                    self.view.flxDeletePopup.isVisible = false;
                    if(segLastRowClicked!==null){
                        self.view.segmentBillpay.setActive(segLastRowClicked, -1, "flxManageBeneficiariesSelectedMobile.flxMain.flxRowDetails.flxSelectedRowWrapper.flxDetail.flxActions.btnRemoveRecipient");

                    }
                }
                else if(self.view.flxLogout.isVisible === true){
                    self.view.flxDialogs.isVisible = false;
                    self.view.flxLogout.isVisible = false; 
                }
            }
            this.view.customheadernew.onKeyPressCallBack(eventObject,eventPayload);
        },
        postShow: function () {
            this.view.flxMain.minHeight = kony.os.deviceInfo().screenHeight - this.view.flxHeader.info.frame.height - this.view.flxFooter.info.frame.height + "dp";
            applicationManager.getNavigationManager().applyUpdates(this);
            applicationManager.executeAuthorizationFramework(this);
            this.accessibilityFocusSetup();
            this.view.CustomPopup.doLayout = CommonUtilities.centerPopupFlex;
            this.view.DeletePopup.doLayout = CommonUtilities.centerPopupFlex;
            this.view.flxPagination.left = "";
            this.view.flxPagination.right = "0%";
            this.adjustScreen();
        },
        showAddBeneficiaryFlx: function () {
            this.view.flxRight.setVisibility(true);
        },
        hideAddBeneficiaryFlx: function () {
            this.view.flxRight.setVisibility(false);
        },
        /**
         * Set foucs handlers for skin of parent flex on input focus 
         */
        accessibilityFocusSetup: function () {
            let widgets = [
                [this.view.txtSearch, this.view.flxtxtSearchandClearbtn]
            ]
            for (let i = 0; i < widgets.length; i++) {
                CommonUtilities.setA11yFoucsHandlers(widgets[i][0], widgets[i][1], this)
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
            if (viewModel.manageBeneficiary) {
                this.bindManagePayeeData(viewModel);
                this.beneficiaryRecords = viewModel;
                this.view.pagination.updatePaginationBar(0, viewModel.manageBeneficiary.length);
            }
            if (viewModel.deleteResponse) {
                this.showDeleteAck(viewModel.deleteResponse);
            }
            if (viewModel.serverError) {
                this.view.rtxDowntimeWarning.text = viewModel.serverError;
                this.view.flxDowntimeWarning.setVisibility(true);
                this.view.flxSuccessMessage.setVisibility(false);
                this.view.flxFormContent.forceLayout();
            } else {
                this.view.flxDowntimeWarning.setVisibility(false);
            }
            if (viewModel.noBeneficiaries) {
                this.showNoBeneficiaries({
                    noBeneficiariesMessageI18Key: "i18n.TransfersEur.YouHaveNoSavedBeneficiaries"
                });
            }
        },
        /**
         * Sorting Configurations for Manage Beneficiaries
         */
        setSorting: function () {
            var scopeObj = this;
            scopeObj.manageBeneficiarySortMap = [{
                name: 'beneficiaryName',
                imageFlx: scopeObj.view.imgBillerSort,
                clickContainer: scopeObj.view.flxBillerName
            },
            {
                name: 'bankName',
                imageFlx: scopeObj.view.imgSortLastPayment,
                clickContainer: scopeObj.view.flxLastPayment
            },
            {
                name: 'isVerified',
                imageFlx: scopeObj.view.imgNextBillSort,
                clickContainer: scopeObj.view.flxNextBill
            }
            ];
            FormControllerUtility.setSortingHandlers(scopeObj.manageBeneficiarySortMap, scopeObj.onManageBeneficiarySortClickHandler, scopeObj);
        },
        /**
         * Manage Beneficiaries sorting handler
         * @param {object} event
         * @param {object} data
         */
        onManageBeneficiarySortClickHandler: function (event, data) {
            var scopeObj = this;
            FormControllerUtility.showProgressBar(scopeObj.view);
            scopeObj.ManageActivitiesPresenter.fetchManageBeneficiary(data);
        },
        /**
         * used to bind the manage beneficiaries data
         * @param {object} data data
         * @param {object}  noofRecords no of records
         * @param {boolean} searchvisibility search visibulity
         */
        bindManagePayeeData: function (data) {
            this.setManageBeneficiariesSegmentData({
                "manageBeneficiary": data.manageBeneficiary ? data.manageBeneficiary : data,
                "noOfRecords": data.noOfRecords,
                "searchvisibility": data.searchvisibility,
                "noResults": data.noResults,
                "searchKeyword": data.searchKeyword

            });
            FormControllerUtility.updateSortFlex(this.manageBeneficiarySortMap, data.noOfRecords);
        },

        showDeleteAck: function (response) {
            if (response.dbpErrMsg) {
                this.view.flxDowntimeWarning.setVisibility(true);
                this.view.flxSuccessMessage.setVisibility(false);
                this.view.rtxDowntimeWarning.text = response.dbpErrMsg
            } else {
                this.view.flxSuccessMessage.setVisibility(true);
                this.view.flxDowntimeWarning.setVisibility(false);
            
            if(response.referenceId){
                this.view.lblRefrenceNumberValue.text = response.referenceId;
            }else{
                this.view.lblRefrenceNumberValue.text =  response.Id;
            }
              if(response.transactionStatus && response.transactionStatus.toUpperCase() === "PENDING"){
                this.view.lblSuccessAcknowledgement.text = (response.beneficiaryName || kony.i18n.getLocalizedString("i18n.TransfersEur.Beneficiary")) +" " + kony.i18n.getLocalizedString("i18n.TransfersEur.BeneficiaryRemovedApproval");
              }else{
                this.view.lblSuccessAcknowledgement.text = (response.beneficiaryName|| kony.i18n.getLocalizedString("i18n.TransfersEur.Beneficiary")) +" " + kony.i18n.getLocalizedString("i18n.TransfersEur.BeneficiaryRemoved");
              }
            if(response.transactionStatus && response.transactionStatus.toUpperCase() === "FAILED"){
                this.view.lblSuccessAcknowledgement.text = kony.i18n.getLocalizedString("i18n.TransfersEur.BeneficiaryRemoveFailed");
            }
        }
        },
        /**
         * Method to set data for Manage Beneficiary Segment
         * @param {object}  data list of beneficiaries
         */
        setManageBeneficiariesSegmentData: function (data) {
            var scopeObj = this;
            scopeObj.view.flxMainContainer.setVisibility(true);
            scopeObj.view.segmentBillpay.setVisibility(true);
            scopeObj.view.flxNoPayment.setVisibility(false);
            if (kony.application.getCurrentBreakpoint() == 640 || orientationHandler.isMobile) {
                scopeObj.view.flxManageHeader.setVisibility(false);
            } else {
                scopeObj.view.flxManageHeader.setVisibility(true);
            }
            pageNumber = 1;
            records = data.manageBeneficiary;
            totalNoOfRecords = data.manageBeneficiary.length;
            noResults = data.noResults
            searchView = data.searchvisibility;
            searchKeyword = data.searchKeyword
            scopeObj.setSegmentData(scopeObj.getDataOfPage());
        },
        /**
         * Method to get records of a particular page
         * @return {Array} Manage Beneficiaries of a particular page
         */
        getDataOfPage: function () {
            return records.slice((pageNumber - 1) * recordsPerPage, pageNumber * recordsPerPage);
        },
        showInternational: function () {
            international_flag = 1;
        },
        hideInternational: function () {
            international_flag = 0;
        },
        showInter: function () {
            inter_flag = 1;
        },
        hideInter: function () {
            inter_flag = 0;
        },
        showIntra: function () {
            intra_flag = 1;
        },
        hideIntra: function () {
            intra_flag = 0;
        },

        /**
         * Method to set records in segment
         * @param {Array} data -  Records Array of a particular page
         */
        setSegmentData: function (data) {
            var scopeObj = this;
            if (!searchView) {
                scopeObj.view.flxPagination.setVisibility(true);
            } else {
                scopeObj.view.flxPagination.setVisibility(false);
            }
            if (data.length === 0) {
                if (noResults) {
                    scopeObj.showNoBeneficiaries({
                        noBeneficiariesMessageI18Key: "i18n.TransferEur.noResultFound"
                    });
                } else {
                    scopeObj.showNoBeneficiaries({
                        noBeneficiariesMessageI18Key: "i18n.TransfersEur.YouHaveNoSavedBeneficiaries"
                    });
                }
                FormControllerUtility.hideProgressBar(this.view);
                return;
            }
            var dataMap = {
                "flxIdentifier": "flxIdentifier",
                "lblIdentifier": "lblIdentifier",
                "lblDropdown": "lblDropdown",
                "flxDetail":"flxDetail",
                "flxDropdown":"flxDropdown",
                "flxManageBeneficiariesSelected": "flxManageBeneficiariesSelected",
                "flxManageBeneficiariesSelectedMobile": "flxManageBeneficiariesSelectedMobile",
                "lblAccountName": "lblAccountName",
                "lblAccountName1": "lblAccountName1",
                "lblBankName": "lblBankName",
                "lblBankName1": "lblBankName1",
                "lblStatus": "lblStatus",
                "lblStatus1": "lblStatus1",
                "btnAction": "btnAction",
                "lblSeparator": "lblSeparator",
                "flxAccountNumberTitle": "flxAccountNumberTitle",
                "lblAccountNumberTitle": "lblAccountNumberTitle",
                "lblAccountNumberValueOld": "lblAccountNumberValueOld",
                "flxAddressTitle": "flxAddressTitle",
                "lblAddressTitle": "lblAddressTitle",
                "lblAddressValue": "lblAddressValue",
                "flxAddressValue": "flxAddressValue",
                "lblAddress1": "lblAddress1",
                "lblAddress2": "lblAddress2",
                "lblAddress3": "lblAddress3",
                "flxSwiftTitle": "flxSwiftTitle",
                "flxAddressTitle":"flxAddressTitle",
                "flxNickName":"flxNickName",
                "lblSwiftTitle": "lblSwiftTitle",
                "lblSwiftValue": "lblSwiftValue",
                "flxEmailTitle": "flxEmailTitle",
                "lblEmailTitle": "lblEmailTitle",
                "lblEmailValue": "lblEmailValue",
                "lblNickNameTitle": "lblNickNameTitle",
                "lblNickNameValue": "lblNickNameValue",
                "flxPhoneNumber": "flxPhoneNumber",
                "lblPhoneNumberTitle": "lblPhoneNumberTitle",
                "lblPhoneNumberValue": "lblPhoneNumberValue",
                "lblPaymentMethodTitle": "lblPaymentMethodTitle",
                "lblPaymentMethodValue": "lblPaymentMethodValue",
                "btnViewActivity": "btnViewActivity",
                "btnEdit": "btnEdit",
                "btnRemoveRecipient": "btnRemoveRecipient",
                "flxActions": "flxActions",
                "lblSeparatorLineAction1": "lblSeparatorLineAction1",
                "lblSeparatorLineAction2": "lblSeparatorLineAction2",
                "lblSeparatorLineAction3": "lblSeparatorLineAction3",
                "lblSeperatorone": "lblSeperatorone",
                "lblLinkedWithValue": "lblLinkedWithValue",
                "lblIconStatus" : "lblIconStatus",
                "btnStatusVal": "btnStatusVal",
				"flxRowDetails": "flxRowDetails",
                "lblPayeeVerificationTitle": "lblPayeeVerificationTitle",
                "imgTick": "imgTick",
                "lblPayeeVerificationValue": "lblPayeeVerificationValue",
                "flxPayeeVerifiedTime": "flxPayeeVerifiedTime",
                "lblPayeeVerifiedTimeTitle": "lblPayeeVerifiedTimeTitle",
                "lblPayeeVerifiedTimeValue": "lblPayeeVerifiedTimeValue",
                "flxRowFour":"flxRowfour"

            };
            if (data.length > 0) {
                var isEditVisible = false;
                var manageBeneficiariesData = data.map(function (dataItem) {
                    var strings = [dataItem.city, dataItem.country, dataItem.zipcode];
                    var adr = strings.filter(function (string) {
                        if (string) {
                            return true;
                        }
                        return false;
                    }).join(', ');
                    if (dataItem.isInternationalAccount === "false" && dataItem.isSameBankAccount === "false") {
                        payment_method = "Domestic";
                        if(scopeObj.checkForUserPermission("INTRA_BANK_FUND_TRANSFER_EDIT_RECEPIENT_LINKAGE") ||
                           scopeObj.checkForUserPermission("INTRA_BANK_FUND_TRANSFER_EDIT_RECEPIENT_OPTIONAL")){
                          isEditVisible = true;
                        }
                    } else if (dataItem.isInternationalAccount === "true") {
                        payment_method = "International";
                      if(scopeObj.checkForUserPermission("INTERNATIONAL_ACCOUNT_FUND_TRANSFER_EDIT_RECEPIENT_OPTIONAL") ||
                         scopeObj.checkForUserPermission("INTERNATIONAL_ACCOUNT_FUND_TRANSFER_EDIT_RECEPIENT_LINKAGE")){
                        isEditVisible = true;
                      }
                    } else if (dataItem.isInternationalAccount === "false" && dataItem.isSameBankAccount === "true") {
                        payment_method = "Within Bank";
                      if(scopeObj.checkForUserPermission("INTRA_BANK_FUND_TRANSFER_EDIT_RECEPIENT_LINKAGE") ||
                         scopeObj.checkForUserPermission("INTRA_BANK_FUND_TRANSFER_EDIT_RECEPIENT_OPTIONAL")){
                        isEditVisible = true;
                      }
                    }
                    bankName=kony.i18n.getLocalizedString("i18n.common.none");
                  if(dataItem.bankName){
                    if(dataItem.bankName.length > 105){
                      bankName = dataItem.bankName.substr(0,104) + "....";
                    } else {
                      bankName = dataItem.bankName;
                    }
				  }
                  if(dataItem.payeeStatus && dataItem.payeeStatus.toUpperCase()=== "PENDING"){
                    payee_Status =kony.i18n.getLocalizedString("i18n.accounts.pending");
                    isPayeeStatusNotActive = true;
                  }
                  if(dataItem.payeeStatus && dataItem.payeeStatus.toUpperCase()=== "ACTIVE"){
                    payee_Status =kony.i18n.getLocalizedString("i18n.CardManagement.ACTIVE"); 
                    isPayeeStatusNotActive = false;
                  }
                    var dataObject = {
                        "beneficiaryId": {
                            "text": dataItem.Id
                        },
                        "lblSeparator": {
                            "text": ""
                        },
                        "lblSeparator1": {
                            "text": " "
                        },
                        "lblSeperatorone": {
                            "text": ""
                        },
                        "flxIdentifier": {
                            "skin": "sknFlxIdentifier",
                        },
                        "lblIdentifier": {
                            "skin": "sknffffff15pxolbfonticons"
                        },
                        "lblDropdown": {
                            "text": "O",
                        },
                        "flxDropdown": {
                          "accessibilityConfig":{
                            "a11yLabel": "show more details for payee"+" "+dataItem.beneficiaryName,
                            "a11yARIA": {
                              "role":"button",
                               "aria-expanded":false
                            }
                          }
                        },
                        "flxDetail":{
                          "isVisible":false
                        },
                        "flxManageBeneficiariesSelected": {
                            "height": "50dp",
                            "skin": "sknflxffffffnoborder"
                        },
                        "flxManageBeneficiariesSelectedMobile": {
                            "height": "70dp",
                            "skin": "sknflxffffffnoborder"
                        },
                        "lblAccountName": {
                            "text": dataItem.beneficiaryName ? dataItem.beneficiaryName : dataItem.nickName ? dataItem.nickName : dataItem.accountNumber,
                            "skin": "sknLblSSP15pxtrucation",
                        },
                        "lblAccountName1": {
                            "text": "Payee Name " + (dataItem.beneficiaryName ? dataItem.beneficiaryName : dataItem.nickName ? dataItem.nickName : dataItem.accountNumber)
                        },
                        "lblBankName": {
                            "text": payment_method
                        },
                        "lblBankName1": {
                            "text": "Payment Method " + (payment_method)
                        },
                        "lblStatus": {
                            //"text": dataItem.isVerified ? kony.i18n.getLocalizedString("i18n.transfers.verified") : kony.i18n.getLocalizedString("i18n.accounts.pending"),
                           "text": payee_Status
                        },
                        "lblStatus1": {
                           "text": "Status " + (payee_Status)
                        },
                        "lblAccountNumberTitle": {
                            "text": kony.i18n.getLocalizedString("i18n.ProfileManagement.AccountNumber")
                        },
                        "lblAccountNumberValueOld": {
                            "text":  CommonUtilities.getMaskedAccountNumber(dataItem.accountNumber)
                        },
                        "lblAddressTitle": {
                            "text": kony.i18n.getLocalizedString("i18n.ProfileManagement.Address") + ":",
                            "left": (kony.application.getCurrentBreakpoint() === 640 || orientationHandler.isMobile) ? "23dp" : "0dp"
                        },
                        "lblAddressValue": {
                            "text": dataItem.addressLine1 ? dataItem.addressLine1 : kony.i18n.getLocalizedString("i18n.common.none")
                        },
                        "lblAddress1": {
                            "text": (!dataItem.addressLine1 && !dataItem.city && !dataItem.zipcode && !dataItem.country) ? kony.i18n.getLocalizedString("i18n.common.none") : dataItem.addressLine1,
                            "isVisible": (!dataItem.addressLine1 && !dataItem.city && !dataItem.zipcode && !dataItem.country) ? true : (dataItem.addressLine1) ? true : false
                        },
                        "lblAddress2": {
                            "isVisible": false
                        },
                        "lblAddress3": {
                            "isVisible": (!dataItem.city && !dataItem.zipcode && !dataItem.country) ? false : true,
                            "text": (!dataItem.city && !dataItem.postCode && !dataItem.country) ? kony.i18n.getLocalizedString("i18n.common.none") : adr
                        },
                        "flxSwiftTitle": {
                            "isVisible": dataItem.isSameBankAccount === "true" ? false : true
                        },
                        "flxNickName": {
                            "left": dataItem.isSameBankAccount === "true" ? "0%" : "11%"
                        },
                        "flxAddressTitle": {
                            "left": ((kony.application.getCurrentBreakpoint() != 640) && (dataItem.isSameBankAccount === "true")) ? "11%" : "7%"
                        },
                        "lblSwiftTitle": {
                            "text": kony.i18n.getLocalizedString("i18n.accounts.swiftCode") + ":"
                        },
                        "lblSwiftValue": {
                            "text": dataItem.swiftCode ? dataItem.swiftCode : kony.i18n.getLocalizedString("i18n.common.none")
                        },
                        "lblEmailTitle": {
                            "text": kony.i18n.getLocalizedString("i18n.konybb.manageUser.EmailID") + ":"
                        },
                        "lblEmailValue": {
                            "text": dataItem.email
                        },
                        "lblNickNameTitle": {
                            "text": kony.i18n.getLocalizedString("i18n.TransfersEur.Nickname") + ":"
                        },
                        "lblNickNameValue": {
                            "text": dataItem.nickName ? dataItem.nickName : kony.i18n.getLocalizedString("i18n.common.none"),
                            "skin": "sknSSPregular42424213Px",
                        },
                        "lblPhoneNumberTitle": {
                            "text": kony.i18n.getLocalizedString("i18n.ProfileManagement.PhoneNumbers") + ":"
                        },
                        "lblPhoneNumberValue": {
                            "text": dataItem.phoneNumber
                        },
                        "lblPaymentMethodTitle": {
                            "text": kony.i18n.getLocalizedString("i18n.transfers.bankName") + ":"
                        },
                        "lblPayeeVerificationTitle": {
                            "text": dataItem.payeeVerification?kony.i18n.getLocalizedString("i18n.UnifiedAddBeneficiary.ManageVerifylabel") + ":":" "
                        },
                        "imgTick": {
                            "src": dataItem.payeeVerification === "Success" ? "selectedtick.png" : "info.png"
                        },
                        "lblPayeeVerificationValue": {
                            "text": dataItem.payeeVerification ? dataItem.payeeVerification : ""
                        },
                        "lblPayeeVerifiedTimeTitle": {
                            "text": kony.i18n.getLocalizedString("i18n.UnifiedAddBeneficiary.ManageVerifiedTime") + ":"
                        },
                        "lblPayeeVerifiedTimeValue": {
                            "text": dataItem.payeeVerifiedOn ? CommonUtilities.getDateAndTime(dataItem.payeeVerifiedOn) : ""
                        },
                        "flxPayeeVerifiedTime": {
                            "isVisible":dataItem.payeeVerification === "Success" && dataItem.payeeVerifiedOn?true:false
                        },
                        "flxRowFour":{
                            "isVisible":dataItem.payeeVerification?true:false
                        },
                        "lblPaymentMethodValue": {
                            "text": bankName ? bankName : kony.i18n.getLocalizedString("i18n.common.none")
                        },
                       "btnStatusVal": {
                        "text": kony.i18n.getLocalizedString("i18n.payments.makePayment"),
                        "toolTip": "",
                        "accessibilityConfig":{
                            "a11yLabel":"Make payment to payee"+" "+ dataItem.beneficiaryName

                        },
                        "isVisible": !isPayeeStatusNotActive,
                        "onClick": (!isPayeeStatusNotActive) ? scopeObj.makePayment.bind(scopeObj, dataItem):function() {},
                       },
                        "btnAction": {
                            "accessibilityConfig":{
                                "a11yLabel": "make payment for payee"+" "+  dataItem.beneficiaryName,
                                "a11yARIA": {
                                  "role":"link",
                                }
                              },
                            "text": kony.i18n.getLocalizedString("i18n.payments.makePayment"),
                            "isVisible": (kony.application.getCurrentBreakpoint() === 640)?true:false,
                            "onClick": (!isPayeeStatusNotActive) ? scopeObj.makePayment.bind(scopeObj, dataItem):function() {},
                        },
                        "btnViewActivity": {
                            "accessibilityConfig":{
                                "a11yARIA": {
                                    "aria-hidden": true
                                }
                              },
                            "text": kony.i18n.getLocalizedString("i18n.transfers.viewActivity"),
                            "isVisible": false
                        },
                      "btnEdit": {
                        "text": kony.i18n.getLocalizedString("i18n.billPay.Edit"),
                        "accessibilityConfig":{
                            "a11yLabel": "edit details for payee"+" "+ dataItem.beneficiaryName,
                            "a11yARIA": {
                              "role":"link",
                            }
                          },
                        "isVisible": !isPayeeStatusNotActive && (isEditVisible === true),
                        "onClick": (!isPayeeStatusNotActive) ? function () {
                          scopeObj.Europresenter.showView("frmAddBeneficiaryEuro", {
                            "editDetails": dataItem
                          })} : function() {}
                        
                      },
                      "btnRemoveRecipient": {
                        "text": kony.i18n.getLocalizedString("i18n.bulkwires.Remove"),
                        "accessibilityConfig":{
                            "a11yLabel": "remove payee"+" "+dataItem.beneficiaryName,
                          },
                        "isVisible": dataItem.payeeStatus ? !isPayeeStatusNotActive : scopeObj.permissionVisibility(),
                        "onClick": (!isPayeeStatusNotActive) ? function (widgetInfo,segInfo) {
                          segLastRowClicked=segInfo.rowIndex;
                          scopeObj.removeBeneficiary(dataItem,widgetInfo,segInfo);
                        }: function() {}
                        // "isVisible": scopeObj.permissionVisibility()
                      },
                        "lblLinkedWithValue": {
                            "text": dataItem.noOfCustomersLinked ? dataItem.noOfCustomersLinked + " " + kony.i18n.getLocalizedString("konybb.userMgmt.Customers") : " - "
                        },
                        "lblIconStatus": {
                            "skin": (dataItem.payeeStatus && dataItem.payeeStatus.toUpperCase() === "ACTIVE") ? "sknStatusGreenBenficiary" : "lblsknStatusCircleED7014"
                        },                       
                        "flxAddressValue": {
                            "left": (kony.application.getCurrentBreakpoint() === 640 || orientationHandler.isMobile) ? "23dp" : "0dp"	
                        },
                        "template": (kony.application.getCurrentBreakpoint() === 640 || orientationHandler.isMobile) ? "flxManageBeneficiariesSelectedMobile" : "flxManageBeneficiariesSelected",
                    }
                    return dataObject;
                });
                this.view.segmentBillpay.widgetDataMap = dataMap;
                this.view.segmentBillpay.setData(manageBeneficiariesData);
                scopeObj.view.flxNoPayment.setVisibility(false);
            }
            FormControllerUtility.hideProgressBar(this.view);
            scopeObj.view.forceLayout();
        },
        /**
         * method used to enable or disable the clear button.
         * @param {object} event event
         */
        onTxtSearchKeyUp: function () {
            var scopeObj = this;
            var searchKeyword = scopeObj.view.txtSearch.text.trim();
            if (searchKeyword.length > 0) {
                scopeObj.view.flxClearBtn.setVisibility(true);
            } else {
                scopeObj.view.flxClearBtn.setVisibility(false);
            }
            var text = this.view.txtSearch.text;
            if(!(/^([a-zA-Z0-9]+)$/.test(this.view.txtSearch.text.trim())))
            {
                var text1 = text.replace(/[^A-Za-z0-9]/g, "");
                this.view.txtSearch.text = text1;
            }
            this.view.flxSearch.forceLayout();
        },
        /**
         * method to handle the search beneficiary functionality
         */
        onSearchBtnClick: function () {
            var searchKeyword = this.view.txtSearch.text.trim();
            this.searchView = true;
            this.ManageActivitiesPresenter.searchBeneficiaries({
                'searchKeyword': searchKeyword
            });
        },
        /**
         * method used to call the service.
         */
        onSearchClearBtnClick: function () {
            var scopeObj = this;
            scopeObj.view.txtSearch.text = "";
            scopeObj.view.flxClearBtn.setVisibility(false);
            scopeObj.view.txtSearch.setActive(true);
            this.ManageActivitiesPresenter.searchBeneficiaries({
                'searchKeyword': ""
            });
            this.searchView = false;
        },
        /**
         * used to show the no beneficiary flow.
         * @param {message} message used to show the no beneficiary message on the page
         */
        showNoBeneficiaries: function (message) {
            var scopeObj = this;
            if (message) {
                scopeObj.view.flxNoPayment.setVisibility(true);
                scopeObj.view.segmentBillpay.setVisibility(false);
                scopeObj.view.flxPagination.setVisibility(false);
                if (searchKeyword)
                    scopeObj.view.rtxNoPaymentMessage.text = kony.i18n.getLocalizedString(message.noBeneficiariesMessageI18Key) + ' ' + searchKeyword;
                else
                    scopeObj.view.rtxNoPaymentMessage.text = kony.i18n.getLocalizedString(message.noBeneficiariesMessageI18Key)
            }
        },

        /**
         * construct a make payment object and send to makePayment
         * @param {object} dataItem payee Payment object
         */
        makePayment: function (dataItem) {
            var scopeObj = this;
            var makePaymentData = {
                "beneficiaryName": dataItem.beneficiaryName,
                "accountNumber": dataItem.accountNumber,
                "swiftCode": dataItem.swiftCode,
                "countryName": dataItem.countryName,
                "phoneNumber": dataItem.phoneNumber,
            };
            if (scope_configManager.TransferFlowType === "CTF") {
                scopeObj.Europresenter.showTransferScreen({
                    context: "MakePayment",
                    accountTo: dataItem.Id
                });
            } else {
                var frmName = "",
                    transferType = "";
                dataItem["toAccountNumber"] = dataItem.accountNumber;
                dataItem["transactionType"] = "ExternalTransfer";
                if (dataItem.isInternationalAccount === "false" && dataItem.isSameBankAccount === "true") {
                    frmName = "frmUTFSameBankTransfer";
                    transferType = "Same Bank";
                } else if (dataItem.isSameBankAccount === "false" && dataItem.isInternationalAccount === "false") {
                    frmName = "frmUTFDomesticTransfer";
                    transferType = "Domestic Transfer";
                } else if (dataItem.isInternationalAccount === "true") {
                    frmName = "frmUTFInternationalTransfer";
                    transferType = "International Transfer";
                } else {
                    frmName = "frmUTFP2PTransfer";
                    transferType = "Pay a Person";
                }
                var context = {
                    "transferType": transferType,
                    "transferFlow": "PayBeneficiary",
                    "transactionObject": dataItem
                };
                var navManager = kony.mvc.getNavigationManager();
                var obj = {
                    context: this,
                    params: context,
                    callbackModelConfig: {
                        "frm": frmName,
                        "UIModule": "UnifiedTransferFlowUIModule",
                        "appName": "TransfersMA"
                    }
                };
                navManager.navigate(obj);
            }
        },
        /**
         * method to delete beneficiary on click of Remove button.
         * @param {number} offsetVal offset value
         */
        removeBeneficiary: function (param,widgetInfo,segInfo) {
            var scopeObj = this;
            var data = this.view.segmentBillpay.data;
            //var index = this.view.segmentBillpay.selectedRowIndex[1];
            var index = param.rowIndex;
            var deleteData = {
                "accountNumber": param.accountNumber,
                "payeeId": param.Id,
                "isSameBankAccount": param.isSameBankAccount,
                "isInternationalAccount": param.isInternationalAccount
            };
            scopeObj.view.flxDialogs.setVisibility(true);
            scopeObj.view.flxDeletePopup.setVisibility(true);
            scopeObj.view.DeletePopup.flxCross.setActive(true);
            var beneficiaryName = param.beneficiaryName || param.nickName || param.accountNumber;
            scopeObj.view.DeletePopup.flxCross.accessibilityConfig = {
                a11yLabel: "Close this remove payee dialog",
                a11yARIA: {
                  tabindex: 0,
                  role: "button"
                }
              };
             scopeObj.view.DeletePopup.btnNo.accessibilityConfig = {
                a11yLabel: "No, don't remove this payee",
                a11yARIA: {
                  tabindex: 0,
                  role: "button"
                }
              };
             scopeObj.view.DeletePopup.btnYes.accessibilityConfig = {
                a11yLabel: "yes, remove this payee",
                a11yARIA: {
                  tabindex: 0,
                  role: "button"
                }
              };
            scopeObj.view.DeletePopup.lblPopupMessage.text=kony.i18n.getLocalizedString("i18n.TransfersEur.RemoveBeneficiaryMessage") + " " + beneficiaryName + "?";
            scopeObj.view.DeletePopup.btnYes.onClick = function () {
                scopeObj.view.flxDialogs.setVisibility(false);
                scopeObj.view.flxDeletePopup.setVisibility(false);
                if (deleteData !== null || deleteData.accountNumber !== null || deleteData.accountNumber !== "") {
                    scopeObj.ManageActivitiesPresenter.deleteBeneficiary(deleteData, beneficiaryName);
                }
            };
            scopeObj.view.DeletePopup.btnNo.onClick = function () {
                scopeObj.view.flxDeletePopup.setVisibility(false);
                scopeObj.view.flxDialogs.setVisibility(false);
				if(kony.application.getCurrentBreakpoint() === 640 || orientationHandler.isMobile){
					scopeObj.view.segmentBillpay.rowTemplate = "flxManageBeneficiariesSelectedMobile";
                scopeObj.view.segmentBillpay.setActive(segInfo.rowIndex, -1, "flxManageBeneficiariesSelectedMobile.flxMain.flxRowDetails.flxSelectedRowWrapper.flxDetail.flxActions.btnRemoveRecipient");
				}
				else{
				scopeObj.view.segmentBillpay.rowTemplate = "flxManageBeneficiariesSelected";
                scopeObj.view.segmentBillpay.setActive(segInfo.rowIndex, -1, "flxManageBeneficiariesSelected.flxMain.flxRowDetails.flxSelectedRowWrapper.flxDetail.flxRow.flxActions.btnRemoveRecipient");
				}
            };
            scopeObj.view.DeletePopup.flxCross.onClick = function () {
                scopeObj.view.flxDeletePopup.setVisibility(false);
                scopeObj.view.flxDialogs.setVisibility(false);
                if(kony.application.getCurrentBreakpoint() === 640 || orientationHandler.isMobile){
					scopeObj.view.segmentBillpay.rowTemplate = "flxManageBeneficiariesSelectedMobile";
                scopeObj.view.segmentBillpay.setActive(segInfo.rowIndex, -1, "flxManageBeneficiariesSelectedMobile.flxMain.flxRowDetails.flxSelectedRowWrapper.flxDetail.flxActions.btnRemoveRecipient");
				}
				else{
				scopeObj.view.segmentBillpay.rowTemplate = "flxManageBeneficiariesSelected";
                scopeObj.view.segmentBillpay.setActive(segInfo.rowIndex, -1, "flxManageBeneficiariesSelected.flxMain.flxRowDetails.flxSelectedRowWrapper.flxDetail.flxRow.flxActions.btnRemoveRecipient");
				}
            };
            scopeObj.view.DeletePopup.lblHeading.setActive(true);
        },
        permissionVisibility: function () {
            if (payment_method == "International") {
                if (international_flag == 1) {
                    return true;
                } else {
                    return false
                }
            } else if (payment_method == "Within Bank") {
                if (intra_flag == 1) {
                    return true;
                } else {
                    return false
                }
            } else if (payment_method == "Domestic") {
                if (inter_flag == 1) {
                    return true;
                } else {
                    return false
                }
            }
        },
        /**
         * @function fetchPaginatedRecords
         * updates the segment based on the number of records per page selected or next/previous buttons are clicked
         * @input_arguement offset: offset of the record to be rendered in UI
         * @input_arguement noOfRecords: total number of beneficiary records
         * @return NA
         */
        fetchPaginatedRecords: function (offset, noOfRecords) {
            this.view.flxFormContent.setContentOffset({
                x: "0%",
                y: "0%"
            }, true);
            recordsPerPage = noOfRecords;
            this.offset = offset;
            if (offset === 0) {
                this.setManageBeneficiariesSegmentData(this.beneficiaryRecords);
                this.offsetFlag = offset;
            } else {
                this.setSegmentData(records.slice(offset, offset + noOfRecords));
            }
            this.view.pagination.updatePaginationBar(noOfRecords, records.length);
        },
       checkForUserPermission : function(permission){
         return applicationManager.getConfigurationManager().checkUserPermission(permission);
       }
    };
});