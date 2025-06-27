define(['FormControllerUtility', 'CommonUtilities', 'ViewConstants', 'OLBConstants'], function(FormControllerUtility, CommonUtilities, ViewConstants, OLBConstants) {
    return {
        init: function() {
            this.userPreferencesManager = applicationManager.getUserPreferencesManager();
            this.view.preShow = this.preShow;
            this.view.postShow = this.postShow;
            this.view.onTouchEnd = this.formOnTouchEndHandler;
            this.view.onDeviceBack = function() {};
            this.view.onBreakpointChange = this.onBreakpointChange;
            this.ManageActivitiesPresenter = applicationManager.getModulesPresentationController({"appName" : "TransfersMA", "moduleName" : "ManageActivitiesUIModule"});
            this.Europresenter = applicationManager.getModulesPresentationController({"appName" : "TransfersMA", "moduleName" : "TransferEurUIModule"});
            this.initActions();
        },
        onBreakpointChange: function(form, width) {
            var scope = this;
            this.view.CustomPopup.onBreakpointChangeComponent(scope.view.CustomPopup, width);
            this.view.DeletePopup.onBreakpointChangeComponent(scope.view.DeletePopup, width);
            this.view.customheadernew.onBreakpointChangeComponent(width);
            this.view.customfooternew.onBreakpointChangeComponent(width);
            if (width === 640) {
                if (this.userPreferencesManager.isSingleCustomerProfile) {
                    this.view.flxCustomerFilter.setVisibility(false);
                } else{
                    this.view.flxCustomerFilter.setVisibility(true);
                    this.view.flxCustomerFilter.height = "100dp";
                }
                this.setupMobileTags(this.searchOptions);
            } else{
                this.view.flxCustomerFilter.height = "40dp";
                this.setupDesktopTags(this.searchOptions);
            }
        },
        onNavigate: function() {
            var scope = this;
            if (this.userPreferencesManager === undefined) {
                this.userPreferencesManager = applicationManager.getUserPreferencesManager();
            }
            var params = {};
             let configMgr = applicationManager.getConfigurationManager();
            let accounts = this.getAccountMap(applicationManager.getAccountManager().getInternalAccounts());
			let isCombinedUser = this.getCombinedUserFlag(accounts);
            params.entitlement = {};
            params.accounts = accounts;
            params.isCombinedUser = isCombinedUser;
            params.entitlement.features = configMgr.features;
            params.entitlement.permissions = configMgr.userPermissions;
            this.view.tabs.setContext(params);
            var selectedTab = this.view.tabs.tabDefaultSelected;
            this.view.tabs.setSelectedTab(selectedTab);
            var paginationDetails = this.view.pagination.getDefaultOffsetAndLimit();
            this.view.tabs.onError = this.onError;
            this.view.tabs.onTabClick = this.onTabClick;
            this.view.SearchAndFilter.onError = this.onError;
            this.view.SearchAndFilter.onSearchDone = this.onSearchDone;
            this.view.SearchAndFilter.onFilterSelect = this.onFilterSelect;
            this.view.pagination.fetchPaginatedRecords = this.fetchPaginatedRecords;
            this.view.pagination.onError = this.onError;
            params.tabSelected = selectedTab;
            // params.defaultFilter = "All";
            params.offset = paginationDetails.offset;
            params.limit = paginationDetails.limit;
            this.view.List.updatePaginationBar = this.updatePaginationBar;
            this.view.List.onResetPagination = this.onResetPagination;
            this.view.List.showCancelPopup = this.showCancelPopup;
            this.view.List.showPagination = this.showPagination;
            this.view.List.hidePagination = this.hidePagination;
            this.view.List.onError = this.onError;
            this.view.List.setFormScope(scope);
            this.view.List.setFormContext(params);
            this.view.List.onButtonAction = this.onButtonAction;
            this.view.List.viewAttachment = this.viewAttachment;
            this.view.paginatedList.updatePaginationBar = this.updatePaginationBar;
            this.view.paginatedList.onResetPagination = this.onResetPagination;
            this.view.paginatedList.showCancelPopup = this.showCancelPopup;
            this.view.paginatedList.showPagination = this.showPagination;
            this.view.paginatedList.hidePagination = this.hidePagination;
            this.view.paginatedList.onError = this.onError;
            this.view.paginatedList.setFormScope(scope);
            this.view.paginatedList.setFormContext(params);
            this.view.paginatedList.onButtonAction = this.onButtonAction;
            this.view.paginatedList.viewAttachment = this.viewAttachment;
            if (this.userPreferencesManager.isSingleCustomerProfile) {
                this.view.paginatedList.setVisibility(false);
                this.view.List.setVisibility(true);
            } else {
                this.view.paginatedList.setVisibility(true);
                this.view.List.setVisibility(false);
            }
            this.view.GenericMessageNew.closepopup = this.closepopup;
            this.view.flxSuccessMessage.setVisibility(false);
            this.view.flxDowntimeWarning.setVisibility(false);
        },
		getAccountMap: function(accounts){
			var accountMap = {};
            accounts.forEach(function(account) {
            accountMap[account.accountID] = account.isBusinessAccount;
            });
            return accountMap;
        },
      
		getCombinedUserFlag: function(accountMap) {
			let booleanSet = new Set();
			for (let key in accountMap) {
				booleanSet.add(accountMap[key]);
			}
        return (booleanSet.size > 1) ? "true" : "false";
       },
        preShow: function () {
            let scopeObj = this;
            this.view.flxSelectFromAccountError.setVisibility(false);
            this.defaultValues = {
                customer:{},
                fromAccount:{},
                payeeName:"",
                payeeAccNo:"",
                referenceNo:"",
                paymentRef:"",
                minAmount:"",
                maxAmount:"",
                status: ["All Transfers" , kony.i18n.getLocalizedString("i18n.Search.AllTransfers")],
                timePeriod:["6M" , kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last6months")],
                fromDate: {},
                toDate: {}
            }
            this.searchOptions = this.searchOptions = {
                customer:{},
                fromAccount:{},
                payeeName:"",
                payeeAccNo:"",
                referenceNo:"",
                paymentRef:"",
                minAmount:"",
                maxAmount:"",
                status: ["All Transfers" , kony.i18n.getLocalizedString("i18n.Search.AllTransfers")],
                timePeriod:["6M" , kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last6months")],
                fromDate: {},
                toDate: {}
            };
            this.touchEndSubscribers.clear();
            this.view.customheadernew.activateMenu("EUROTRANSFERS", "Manage Payments");
            FormControllerUtility.updateWidgetsHeightInInfo(this.view, ['flxHeader', 'flxFooter']);
            this.view.btnByPass.onClick = this.byPassFun;
            this.view.btnAdvSearch.onClick = function(){
                scopeObj.setDefaultContextToAdvSearch();
                scopeObj.view.flxDialogs.accessibilityConfig.a11yARIA["aria-labelledby"] = "btnAdvSearch";
                scopeObj.showAdvSearchPopup();
            };
            this.view.btnClearSearch.onClick = this.clearSearchFilters;
            this.view.btnModifySearch.onClick = function(){
                scopeObj.setExistingContextToAdvSearch();
                scopeObj.view.flxDialogs.accessibilityConfig.a11yARIA["aria-labelledby"] = "btnModifySearch";
                scopeObj.showAdvSearchPopup();
            };
            this.view.AdvancedSearchPopup.onHideCallBack = this.hideAdvSearchPopup;
            this.view.AdvancedSearchPopup.searchClickCallBack = function(searchOptions){
                scopeObj.updateSearchOptions(searchOptions);
                scopeObj.setupSearchTagsAndFilterTransactions();
            };
            this.view.AdvancedSearchPopup.accessibilityConfig ={
                a11yARIA: {
                    "aria-haspopup": "true",
                }
            };
            this.view.flxAdvSearchBtn.setVisibility(true);
            this.view.flxSearchItemsWrapper.setVisibility(false);
            this.view.lblRecentLabel.text = kony.i18n.getLocalizedString("i18n.accounts.showingLatestTransactions");
            this.setupViewBy();
        },
        clearSearchFilters:function(){
            if (this.viewBy !== "Account") {
                this.searchOptions.fromAccount = this.defaultValues.fromAccount;
            }
            this.searchOptions.payeeName = this.defaultValues.payeeName;
            this.searchOptions.payeeAccNo = this.defaultValues.payeeAccNo;
            this.searchOptions.referenceNo = this.defaultValues.referenceNo;
            this.searchOptions.paymentRef = this.defaultValues.paymentRef;
            this.searchOptions.minAmount = this.defaultValues.minAmount;
            this.searchOptions.maxAmount = this.defaultValues.maxAmount;
            this.searchOptions.status = this.defaultValues.status;
            this.searchOptions.timePeriod = this.defaultValues.timePeriod;
            this.searchOptions.fromDate = this.defaultValues.fromDate;
            this.searchOptions.toDate = this.defaultValues.toDate;
            this.view.flxSearchItemsWrapper.setVisibility(false);
            this.view.flxAdvSearchBtn.setVisibility(true);
            this.view.lblRecentLabel.text = kony.i18n.getLocalizedString("i18n.accounts.showingLatestTransactions");
            this.setupSearchTagsAndFilterTransactions();
        },

        // {
        //   widget:"",
        //   hideFunction : "",
        //   shouldBeVisible: false
        // },
        touchEndSubscribers : new Map(),

        /**
         * handles form on touch end event
         */
        formOnTouchEndHandler: function(){
            //when a user clicks on dropdown item onTouchEnd is triggered first and click is not registered
            //this delay postpones the onTouchEnd so that the click is registered
            kony.timer.schedule("touchEndTimer", this.hideSubscribedWidgetsIfVisible, 0.1, false);
            FormControllerUtility.hidePopupsNew();
        },

        /**
         * hides subscribed widgets if they are visible
         */
        hideSubscribedWidgetsIfVisible: function() {
            this.touchEndSubscribers.forEach((value, key, map) =>{
                if (value.shouldBeVisible) {
                    value.shouldBeVisible = false;
                    kony.print("**~~**"+key+" has shouldBeVisible is true, so set it up as false and not hiding it");
                    return;
                }
                else if (value.widget.isVisible) {
                    value.hideFunction();
                    kony.print("**~~**"+key+" hidden");
                    return;
                }
                kony.print("**~~**"+key+" is not visible");
            })
        },
        /**
         * subscribe to form's on touch end
         * @param {String} subscriberKey
         * @param {Object} subscriberValue
         * @returns boolean
         */
        subscribeToTouchEnd : function(subscriberKey,subscriberValue){
            if (this.touchEndSubscribers.has(subscriberKey)) {
            kony.print("same key exists");
            return false;
            }
            let value = {
            widget : subscriberValue.widget,
            hideFunction : subscriberValue.hideFunction,
            shouldBeVisible : subscriberValue.shouldBeVisible
            }
            this.touchEndSubscribers.set(subscriberKey,value);
            return true;
        },

        /**
         * this method is called when a subscriber wants to retain the visibility of the popup/dropdown
         * @param {String} subscriberKey
         * @param {Object} subscriberValue
         * @returns boolean
         */
        updateTouchEndSubscriber:function(subscriberKey,subscriberValue){
            if (!this.touchEndSubscribers.has(subscriberKey)) {
            kony.print("key doesn't exist");
            return false;
            }
            let value = this.touchEndSubscribers.get(subscriberKey);
            if (subscriberValue.shouldBeVisible !== undefined && subscriberValue.shouldBeVisible !== null) {
            value.shouldBeVisible = subscriberValue.shouldBeVisible;
            this.touchEndSubscribers.set(subscriberKey,value);
            return true;
            }
            kony.print("Can only update shouldBeVisible");
            return false;
        },
        byPassFun: function () {
            this.view.flxNewPayment.setActive(true);
        },
        postShow: function () {
            var scopeObj = this;
            this.view.flxMain.minHeight = kony.os.deviceInfo().screenHeight - this.view.flxHeader.info.frame.height - this.view.flxFooter.info.frame.height + "dp";
            applicationManager.getNavigationManager().applyUpdates(this);
            applicationManager.executeAuthorizationFramework(this);
            this.view.CustomPopup.onKeyPress = this.popUpDismiss;
            this.view.CustomPopup1.onKeyPress = this.popUpDismiss;
            this.view.CustomPopup1.doLayout = CommonUtilities.centerPopupFlex;
            this.view.customheadernew.btnSkipNav.onClick = function () {
                scopeObj.view.lblManagePayments.setActive(true);
            };
          	this.view.CustomPopup.doLayout = CommonUtilities.centerPopupFlex;
            // this.view.flxDialogs.isVisible = false;
            this.view.flxMain.accessibilityConfig = {
                a11yARIA:{
                    "tabindex": -1,
                    "role":"main"
                }
            }
            this.view.flxFormContent.accessibilityConfig = {
                a11yARIA:{
                    "tabindex": -1,
                }
            }
            this.view.flxMainContainer.accessibilityConfig = {
                a11yARIA:{
                    "tabindex": -1,
                }
            }
        },
        popUpDismiss: function(a, b) {
            if (b.keyCode === 27) {
                this.view.customheadernew.onKeyPressCallBack(a, b);
                if (this.view.flxLogout.isVisible === true) {
                    this.view.flxDialogs.setVisibility(false);
                    this.view.flxLogout.setVisibility(false);
                    this.view.customheadernew.btnLogout.setFocus(true);
                }
                if(this.view.flxDownloadReportPopup.isVisible === true){
                    this.toggleDownloadReportPopup(false);
                }
            }
        },
        initActions: function() {
            var scopeObj = this;
            let configMgr = applicationManager.getConfigurationManager();
            this.view.flxNewPayment.onClick = function() {
                if (configMgr.TransferFlowType === "CTF") {
                    scopeObj.Europresenter.showTransferScreen({
                        context: "MakePayment"
                    });
                } else {
                    var navMan = applicationManager.getNavigationManager();
                    var data = this.userPreferencesManager.getUserObj();
                    navMan.navigateTo({
                        "appName": "TransfersMA",
                        "friendlyName": "frmUTFLanding"
                    }, false, data)
                }
            };
            this.view.flxPaymentActivities.onClick = function() {
                scopeObj.ManageActivitiesPresenter.showTransferScreen({
                    context: ""
                })
            };
            this.view.flxManageBeneficiaries.onClick = function() {
                scopeObj.ManageActivitiesPresenter.showTransferScreen({
                    context: "ManageBeneficiaries"
                })
            };
            this.view.SearchAndFilter.subscribeToTouchEnd = this.subscribeToTouchEnd;
            this.view.SearchAndFilter.updateTouchEndSubscriber = this.updateTouchEndSubscriber;
            this.view.FromAccounts.subscribeToTouchEnd = this.subscribeToTouchEnd;
            this.view.FromAccounts.updateTouchEndSubscriber = this.updateTouchEndSubscriber;
        },
        /**
         * checks if data is empty, null or undefined
         * @param {*} data
         * @returns boolean
         */
        isEmptyNullUndefined : function (data) {
            if (data === null || data === undefined || data === "") {
                return true;
            }
            if (typeof data === "object") {
                if (Object.keys(data).length > 0) {
                    return false;
                }
                return true;
            }
            return false;
        },

        /**
         * filters the transactions based on the search criteria
         * @param {Object} searchOptions 
         * @returns null
         */
        setupSearchTagsAndFilterTransactions:function(){
            if (kony.application.getCurrentBreakpoint() === 640) {
                this.view.flxSearchItemMobile.setVisibility(true);
                this.view.flxSearchItemResponsive.setVisibility(false);
                this.setupMobileTags(this.searchOptions);
            } else {
                this.view.flxSearchItemMobile.setVisibility(false);
                this.view.flxSearchItemResponsive.setVisibility(true);
                this.setupDesktopTags(this.searchOptions);
            }
            this.filterTransactions();
        },
        updateSearchOptions : function(searchOptions){
            if (!this.isEmptyNullUndefined(searchOptions.fromAccount)) {
                this.searchOptions.fromAccount = searchOptions.fromAccount;
                if (this.viewBy === "Account") {
                    this.view.FromAccounts.setSelectedAccount(this.searchOptions.fromAccount.accountID);
                }
            }
            if (!kony.sdk.isNullOrUndefined(searchOptions.payeeName)) {
                this.searchOptions.payeeName = searchOptions.payeeName;
            }
            if (!kony.sdk.isNullOrUndefined(searchOptions.payeeAccNo)) {
                this.searchOptions.payeeAccNo = searchOptions.payeeAccNo;
            }
            if (!kony.sdk.isNullOrUndefined(searchOptions.referenceNo)) {
                this.searchOptions.referenceNo = searchOptions.referenceNo;
            }
            if (!kony.sdk.isNullOrUndefined(searchOptions.paymentRef)) {
                this.searchOptions.paymentRef = searchOptions.paymentRef;
            }
            if (!kony.sdk.isNullOrUndefined(searchOptions.minAmount)) {
                this.searchOptions.minAmount = searchOptions.minAmount;
            }
            if (!kony.sdk.isNullOrUndefined(searchOptions.maxAmount)) {
                this.searchOptions.maxAmount = searchOptions.maxAmount;
            }
            if (!this.isEmptyNullUndefined(searchOptions.status)) {
                this.searchOptions.status = searchOptions.status;
            }
            if (!this.isEmptyNullUndefined(searchOptions.timePeriod)) {
                this.searchOptions.timePeriod = searchOptions.timePeriod;
            }
            if (!kony.sdk.isNullOrUndefined(searchOptions.fromDate)) {
                this.searchOptions.fromDate = searchOptions.fromDate;
            }
            if (!kony.sdk.isNullOrUndefined(searchOptions.toDate)) {
                this.searchOptions.toDate = searchOptions.toDate;
            }
        },

        /**
         * displays tags based on the search options
         * @param {Object} searchOptions 
         */
        setupMobileTags:function(searchOptions){//! rename to setupAdvanceSearchTagsForMobileResponsive
            let tagNo = 1;
            if (!this.isEmptyNullUndefined(searchOptions.fromAccount) && this.viewBy === "Customer") {
                this.view["lblSearchTitleMob" + tagNo].text = kony.i18n.getLocalizedString("i18n.accounts.FromAccount") + " ";
                this.view["lblSearchValueMob" + tagNo].text = searchOptions.fromAccount;
                this.view["flxSearchTag" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].onClick = function () {
                    this.searchOptions.fromAccount = {};
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.payeeName)) {
                this.view["lblSearchTitleMob" + tagNo].text = kony.i18n.getLocalizedString("kony.mb.TransferEurope.beneficairyNameColon") + " ";
                this.view["lblSearchValueMob" + tagNo].text = searchOptions.payeeName;
                this.view["flxSearchTag" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].onClick = function () {
                    this.searchOptions.payeeName = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.payeeAccNo)) {
                this.view["lblSearchTitleMob" + tagNo].text = kony.i18n.getLocalizedString("i18n.payments.payeeAccountNumberWithColon") + " ";
                this.view["lblSearchValueMob" + tagNo].text = searchOptions.payeeAccNo;
                this.view["flxSearchTag" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].onClick = function () {
                    this.searchOptions.payeeAccNo = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.referenceNo)) {
                let textToDisplay = searchOptions.referenceNo;
                if (textToDisplay.length > 15) {
                    textToDisplay = textToDisplay.substring(0,12)+"...";
                }
                this.view["lblSearchTitleMob" + tagNo].text = kony.i18n.getLocalizedString("i18n.serviceRequests.ReferenceNo") + " ";
                this.view["lblSearchValueMob" + tagNo].text = textToDisplay;
                this.view["flxSearchTag" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].onClick = function () {
                    this.searchOptions.referenceNo = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.paymentRef)) {
                let textToDisplay = searchOptions.paymentRef;
                if (textToDisplay.length > 15) {
                    textToDisplay = textToDisplay.substring(0,12)+"...";
                }
                this.view["lblSearchTitleMob" + tagNo].text = kony.i18n.getLocalizedString("kony.mb.transfersEurope.referenceColon") + " ";
                this.view["lblSearchValueMob" + tagNo].text = textToDisplay;
                this.view["flxSearchTag" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].onClick = function () {
                    this.searchOptions.paymentRef = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.minAmount) || !this.isEmptyNullUndefined(searchOptions.maxAmount)) {
                let minAmount = !this.isEmptyNullUndefined(searchOptions.minAmount) ? searchOptions.minAmount : "";
                let maxAmount = !this.isEmptyNullUndefined(searchOptions.maxAmount) ? searchOptions.maxAmount : "";
                if (minAmount !== "" && maxAmount !== "") {
                    this.view["lblSearchTitleMob" + tagNo].text = kony.i18n.getLocalizedString("i18n.AccountsDetails.AmountRange") + " ";
                    this.view["lblSearchValueMob" + tagNo].text = minAmount + " " + kony.i18n.getLocalizedString("i18n.common.To") + " " + maxAmount;
                } else if (minAmount !== "") {
                    this.view["lblSearchTitleMob" + tagNo].text = "Minimum Amount: ";
                    this.view["lblSearchValueMob" + tagNo].text = minAmount;
                } else {
                    this.view["lblSearchTitleMob" + tagNo].text = "Maximum Amount: ";
                    this.view["lblSearchValueMob" + tagNo].text = maxAmount;
                }
                this.view["flxSearchTag" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].onClick = function () {
                    this.searchOptions.minAmount = "";
                    this.searchOptions.maxAmount = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.status) && searchOptions.status[0] !== this.defaultValues.status[0]) {
                this.view["lblSearchTitleMob" + tagNo].text = kony.i18n.getLocalizedString("i18n.wealth.statuswithColon") + " "; //change these to i18n and get text from UX
                this.view["lblSearchValueMob" + tagNo].text = searchOptions.status[1];
                this.view["flxSearchTag" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].onClick = function () {
                    this.searchOptions.status = this.defaultValues.status;
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.timePeriod) && searchOptions.timePeriod[0] !== this.defaultValues.timePeriod[0]) {
                this.view["lblSearchTitleMob" + tagNo].text = kony.i18n.getLocalizedString("i18n.wealth.timePeriodwithcolon") + " "; //change these to i18n and get text from UX
                if (searchOptions.timePeriod[0] !== "Custom") {
                    this.view["lblSearchValueMob" + tagNo].text = searchOptions.timePeriod[1];
                } else {
                    this.view["lblSearchValueMob" + tagNo].text =
                        searchOptions.fromDate.formattedDate + " " + kony.i18n.getLocalizedString("i18n.common.To") + " " + searchOptions.toDate.formattedDate;
                }
                this.view["flxSearchTag" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].setVisibility(true);
                this.view["lblSearchCancelMob" + tagNo].onClick = function () {
                    this.searchOptions.timePeriod = this.defaultValues.timePeriod;
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            for (let i = tagNo; i <= 8; i++) {
                this.view["flxSearchTag" + i].setVisibility(false);
            }
            if (tagNo>1) {
                this.view.flxSearchItemsWrapper.setVisibility(true);
                this.view.flxSearchItemResponsive.setVisibility(false);
                this.view.flxSearchItemMobile.setVisibility(true);
                this.view.flxAdvSearchBtn.setVisibility(false);
                this.view.lblRecentLabel.text = kony.i18n.getLocalizedString("i18n.transfers.MatchedTransactions");
            } else {
                //reset data
                this.view.flxSearchItemsWrapper.setVisibility(false);
                this.view.flxAdvSearchBtn.setVisibility(true);
                this.view.lblRecentLabel.text = kony.i18n.getLocalizedString("i18n.accounts.showingLatestTransactions");
                return;
            }
        },
        /**
         * displays tags based on the search options
         * @param {Object} searchOptions 
         */
        setupDesktopTags:function(searchOptions){//! rename this method
            let tagNo = 1;
            if (!this.isEmptyNullUndefined(searchOptions.fromAccount.displayLabel) && this.viewBy === "Customer") {
                this.view["lblSearchTitle"+tagNo].text = kony.i18n.getLocalizedString("i18n.accounts.FromAccount") + " ";
                this.view["lblSearchValue"+tagNo].text = searchOptions.fromAccount.displayLabel;
                this.view["lblSearchTitle"+tagNo].setVisibility(true);
                this.view["lblSearchValue"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].onClick = function(){
                    this.searchOptions.fromAccount = {};
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.payeeName)) {
                this.view["lblSearchTitle"+tagNo].text = kony.i18n.getLocalizedString("kony.mb.TransferEurope.beneficairyNameColon") + " ";
                this.view["lblSearchValue"+tagNo].text = searchOptions.payeeName;
                this.view["lblSearchTitle"+tagNo].setVisibility(true);
                this.view["lblSearchValue"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].onClick = function(){
                    this.searchOptions.payeeName = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.payeeAccNo)) {
                this.view["lblSearchTitle"+tagNo].text = kony.i18n.getLocalizedString("i18n.payments.payeeAccountNumberWithColon") + " ";
                this.view["lblSearchValue"+tagNo].text = searchOptions.payeeAccNo;
                this.view["lblSearchTitle"+tagNo].setVisibility(true);
                this.view["lblSearchValue"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].onClick = function(){
                    this.searchOptions.payeeAccNo = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.referenceNo)) {
                let textToDisplay = searchOptions.referenceNo;
                if (textToDisplay.length > 15) {
                    textToDisplay = textToDisplay.substring(0,12)+"...";
                }
                this.view["lblSearchValue" + tagNo].text = textToDisplay;
                this.view["lblSearchTitle"+tagNo].text = kony.i18n.getLocalizedString("i18n.serviceRequests.ReferenceNo") + " ";
                this.view["lblSearchTitle"+tagNo].setVisibility(true);
                this.view["lblSearchValue"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].onClick = function(){
                    this.searchOptions.referenceNo = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.paymentRef)) {
                let textToDisplay = searchOptions.paymentRef;
                if (textToDisplay.length > 15) {
                    textToDisplay = textToDisplay.substring(0,12)+"...";
                }
                this.view["lblSearchValue" + tagNo].text = textToDisplay;
                this.view["lblSearchTitle"+tagNo].text = kony.i18n.getLocalizedString("kony.mb.transfersEurope.referenceColon") + " ";
                this.view["lblSearchTitle"+tagNo].setVisibility(true);
                this.view["lblSearchValue"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].onClick = function(){
                    this.searchOptions.paymentRef = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.minAmount) || !this.isEmptyNullUndefined(searchOptions.maxAmount)) {
                let minAmount = !this.isEmptyNullUndefined(searchOptions.minAmount) ? searchOptions.minAmount : "";
                let maxAmount = !this.isEmptyNullUndefined(searchOptions.maxAmount) ? searchOptions.maxAmount : "";
                if (minAmount !== "" && maxAmount !== "") {
                    this.view["lblSearchTitle"+tagNo].text = kony.i18n.getLocalizedString("i18n.AccountsDetails.AmountRange") + " ";
                    this.view["lblSearchValue"+tagNo].text = minAmount + " "+kony.i18n.getLocalizedString("i18n.common.To")+" "+maxAmount;
                } else if (minAmount !== "") {
                    this.view["lblSearchTitle"+tagNo].text = "Minimum Amount: ";
                    this.view["lblSearchValue"+tagNo].text = minAmount;
                } else {
                    this.view["lblSearchTitle"+tagNo].text = "Maximum Amount: ";
                    this.view["lblSearchValue"+tagNo].text = maxAmount;
                }
                this.view["lblSearchTitle"+tagNo].setVisibility(true);
                this.view["lblSearchValue"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].onClick = function(){
                    this.searchOptions.minAmount = "";
                    this.searchOptions.maxAmount = "";
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.status) && searchOptions.status[0] !== this.defaultValues.status[0]) {
                this.view["lblSearchTitle"+tagNo].text = kony.i18n.getLocalizedString("i18n.wealth.statuswithColon") + " ";//change these to i18n and get text from UX
                this.view["lblSearchValue"+tagNo].text = searchOptions.status[1];
                this.view["lblSearchTitle"+tagNo].setVisibility(true);
                this.view["lblSearchValue"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);this.view["lblSearchCancel"+tagNo].onClick = function(){
                    this.searchOptions.status = this.defaultValues.status;
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            if (!this.isEmptyNullUndefined(searchOptions.timePeriod) && searchOptions.timePeriod[0] !== this.defaultValues.timePeriod[0]) {
                this.view["lblSearchTitle"+tagNo].text = kony.i18n.getLocalizedString("i18n.wealth.timePeriodwithcolon") + " ";//change these to i18n and get text from UX
                if (searchOptions.timePeriod[0] !== "Custom") {
                    this.view["lblSearchValue"+tagNo].text = searchOptions.timePeriod[1];
                } else {
                    this.view["lblSearchValue"+tagNo].text = searchOptions.fromDate.formattedDate + " "+kony.i18n.getLocalizedString("i18n.common.To")+" "+searchOptions.toDate.formattedDate;
                }
                this.view["lblSearchTitle"+tagNo].setVisibility(true);
                this.view["lblSearchValue"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);
                this.view["lblSearchCancel"+tagNo].setVisibility(true);this.view["lblSearchCancel"+tagNo].onClick = function(){
                    this.searchOptions.timePeriod = this.defaultValues.timePeriod;
                    this.setupSearchTagsAndFilterTransactions();
                }.bind(this);
                tagNo++;
            }
            for (let i = tagNo; i <= 8; i++) {
                this.view["lblSearchTitle"+i].setVisibility(false);
                this.view["lblSearchValue"+i].setVisibility(false);
                this.view["lblSearchCancel"+i].setVisibility(false);
            }
            if (tagNo>1) {
                this.view.flxSearchItemsWrapper.setVisibility(true);
                this.view.flxSearchItemResponsive.setVisibility(true);
                this.view.flxSearchItemMobile.setVisibility(false);
                this.view.flxAdvSearchBtn.setVisibility(false);
                this.view.lblRecentLabel.text = kony.i18n.getLocalizedString("i18n.transfers.MatchedTransactions");
            } else {
                //reset data
                this.view.flxSearchItemsWrapper.setVisibility(false);
                this.view.flxAdvSearchBtn.setVisibility(true);
                this.view.lblRecentLabel.text = kony.i18n.getLocalizedString("i18n.accounts.showingLatestTransactions");
                return;
            }
            this.view.flxSearchItemsRow1.setVisibility(true);
            if (tagNo<=4) {
                this.view.flxSearchItemsRow2.setVisibility(false);
                this.view.flxSearchItemsRow3.setVisibility(false);
            } else if (tagNo<=7) {
                this.view.flxSearchItemsRow2.setVisibility(true);
                this.view.flxSearchItemsRow3.setVisibility(false);
            } else{
                this.view.flxSearchItemsRow2.setVisibility(true);
                this.view.flxSearchItemsRow3.setVisibility(true);
            }
        },

        /**
         * displays advance search popup
         */
        showAdvSearchPopup : function(){
            this.view.flxDialogs.setVisibility(true);
            this.view.AdvancedSearchPopup.showPopup();
        },

        /**
         * sets default context to advance search popup
         */
        setDefaultContextToAdvSearch : function(){
            let context = {};
            context.fromAccountContext = {
                maxDropdownHeight: 300,
                dropdownPlaceholderText: kony.i18n.getLocalizedString("i18n.Alerts.SearchOrSelectAccount"),
                searchPlaceholderText: kony.i18n.getLocalizedString("i18n.Alerts.SearchOrSelectAccount"),
                tbxA11YLabel: kony.i18n.getLocalizedString("kony.mb.CM.selectAccount"),
                clearSelection:true,
                isBalanceVisible:false,
                selectedAccountID : this.viewBy === "Account" ? this.searchOptions.fromAccount.accountID : "",
                selectedCustomerID : this.searchOptions.customer.id
            }
            context.payeeNameContext = {
                text:""
            }
            context.payeeAccNoContext = {
                text:""
            }
            context.referenceNoContext = {
                text:""
            }
            context.paymentReferenceContext = {
                text:""
            }
            context.amountContext = {
                min:{text:""},
                max:{text:""},
            }
            context.statusContext = {
                masterData:[
                    ["All Transfers" , kony.i18n.getLocalizedString("i18n.Search.AllTransfers")],
                    ["Pending" , kony.i18n.getLocalizedString("i18n.Search.Pending")],
                    ["AwaitingFunds" , kony.i18n.getLocalizedString("i18n.Search.AwaitingFunds")],
                    ["Failed" , kony.i18n.getLocalizedString("i18n.Search.Failed")],
                    ["Scheduled" , kony.i18n.getLocalizedString("i18n.Search.Scheduled")],
                    ["Completed" , kony.i18n.getLocalizedString("i18n.Search.Completed")],
                    ["Cancelled" , kony.i18n.getLocalizedString("i18n.Search.Cancelled")],
                ],
                selectedKey : "All Transfers"
            };
            context.timePeriodContext = {
                masterData:[
                    ["7D" , kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.Last7days")],
                    ["14D" , kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last14days")],
                    ["1M" , kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last1month")],
                    ["2M" , kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last2months")],
                    ["6M" , kony.i18n.getLocalizedString("kony.mb.AdvanceSearch.last6months")],
                    ["12M" , kony.i18n.getLocalizedString("i18n.accounts.lastTwelveMonths")],
                    ["Custom" , kony.i18n.getLocalizedString("i18n.accounts.customDateRange")],
                ],
                selectedKey : "6M"
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
            this.view.AdvancedSearchPopup.setContext(context);
        },

        /**
         * sets existing context to advance search from search options
         */
        setExistingContextToAdvSearch : function(){
            let context = {};
            context.fromAccountContext = {
                maxDropdownHeight: 300,
                dropdownPlaceholderText: kony.i18n.getLocalizedString("i18n.Alerts.SearchOrSelectAccount"),
                searchPlaceholderText: kony.i18n.getLocalizedString("i18n.Alerts.SearchOrSelectAccount"),
                tbxA11YLabel: kony.i18n.getLocalizedString("kony.mb.CM.selectAccount"),
                isBalanceVisible:false,
                selectedAccountID : this.searchOptions.fromAccount.accountID,
                selectedCustomerID : this.searchOptions.customer.id
            }
            context.payeeNameContext = {
                text : this.searchOptions.payeeName
            }
            context.payeeAccNoContext = {
                text:this.searchOptions.payeeAccNo
            }
            context.referenceNoContext = {
                text:this.searchOptions.referenceNo
            }
            context.paymentReferenceContext = {
                text:this.searchOptions.paymentRef
            }
            context.amountContext = {
                min:{text:this.searchOptions.minAmount},
                max:{text:this.searchOptions.maxAmount},
            }
            context.statusContext = {
                selectedKey : this.searchOptions.status[0]
            };
            context.timePeriodContext = {
                selectedKey : this.searchOptions.timePeriod[0]
            };
            context.dateRangeContext = {
                fromDate : {
                    dateComponents : this.searchOptions.fromDate.dateComponents,
                },
                toDate : {
                    dateComponents : this.searchOptions.toDate.dateComponents,
                }
            }
            this.view.AdvancedSearchPopup.setContext(context);
        },

        /**
         * hides advance search popup
         */
        hideAdvSearchPopup : function(){
            this.view.flxDialogs.setVisibility(false);
            if(this.view.btnAdvSearch.isVisible){
                this.view.btnAdvSearch.setActive(true);
            } else{
                this.view.btnModifySearch.setActive(true);
            }
        },

        /**
         * sets context to view by dropdown
         * @returns null
         */
        setupViewBy : function(){
            if (this.userPreferencesManager.isSingleCustomerProfile) {
                this.view.flxAdvSearchBar.setVisibility(false);
                this.view.flxCustomerFilter.setVisibility(false);
                this.view.SearchAndFilter.setVisibility(true);
                //return as for single customer the dropdowns shouldn't be visible
                return;
            }
            this.view.flxAdvSearchBar.setVisibility(true);
            this.view.flxCustomerFilter.setVisibility(true);
            this.view.SearchAndFilter.setVisibility(false);
            let dropdownData = [
                {
                    selectedValue : kony.i18n.getLocalizedString("kony.mb.AlertSettings.ViewBy") +" "+ kony.i18n.getLocalizedString("kony.mb.FilterAccounts.Customer"),
                    value : kony.i18n.getLocalizedString("kony.mb.FilterAccounts.Customer"),
                    key : "Customer"//used only in code
                },
                {
                    selectedValue : kony.i18n.getLocalizedString("kony.mb.AlertSettings.ViewBy") +" "+ kony.i18n.getLocalizedString("kony.mb.mm.account"),
                    value : kony.i18n.getLocalizedString("kony.mb.mm.account"),
                    key : "Account"//used only in code
                },
            ];
            let context = {
                data: dropdownData,
                defaultSelectedRowNo: 0,
                maxDropdownHeight: 200,
                keyToDisplay: "selectedValue",
                tbxA11YLabel: kony.i18n.getLocalizedString("kony.mb.AlertSettings.ViewBy"),
                isMandatory: true
            };
            this.view.viewByDropdown.subscribeToTouchEnd = this.subscribeToTouchEnd;
            this.view.viewByDropdown.updateTouchEndSubscriber = this.updateTouchEndSubscriber;
            this.view.viewByDropdown.onSelection = this.setupCombobox;
            this.view.viewByDropdown.setContext(context)
            this.setupCustomerCombobox();
        },

        /**
         * sets up combobox based on what is selected in view by dropdown
         * @param {Object} sel 
         */
        setupCombobox:function(sel){
            if (sel.selectedRowData.key === "Customer") {
                this.setupCustomerCombobox();
            } else {
                this.setupAccountCombobox();
            }
            this.view.viewByDropdown.setActive(true);
        },

        /**
         * sets account context to combobox
         */
        setupAccountCombobox:function(){
            this.searchOptions.customer = this.defaultValues.customer;
            this.view.viewByDropdown.setAccessibilityValues("Currently selected Accounts. Click to show more views");
            this.viewBy = "Account";
            let scope = this;
            let fromAccountContext = {
                maxDropdownHeight: 300,
                dropdownPlaceholderText: kony.i18n.getLocalizedString("i18n.Alerts.SearchOrSelectAccount"),
                searchPlaceholderText: kony.i18n.getLocalizedString("i18n.Alerts.SearchOrSelectAccount"),
                tbxA11YLabel: kony.i18n.getLocalizedString("kony.mb.CM.selectAccount"),
                clearSelection:true,
                isBalanceVisible:false,
                selectedAccountID : "",
                selectedCustomerID : this.searchOptions.customer.id,
                isMandatory: true
            }
            this.view.FromAccounts.setContext(fromAccountContext);
            scope.view.FromAccounts.setAccessibilityValues(fromAccountContext.dropdownPlaceholderText);
            this.view.FromAccounts.onSelection = function(data){
                // scope.view.FromAccounts.setAccessibilityValues("Currently selected account "+data.displayLabel+". Click to search or select from list of accounts");
                scope.searchOptions.fromAccount = data;
                scope.view.paginatedList.setVisibility(true);
                scope.view.flxSelectFromAccountError.setVisibility(false);
                scope.view.flxAdvSearchBar.setVisibility(true);
                scope.view.flxPagination.setVisibility(true);
                scope.setupSearchTagsAndFilterTransactions();
            };
            this.view.flxAccountsDropdown.setVisibility(true);
            this.view.flxCustomerDropdown.setVisibility(false);
            if (this.isEmptyNullUndefined(this.searchOptions.fromAccount.accountID)) {
                this.view.paginatedList.setVisibility(false);
                this.view.flxSelectFromAccountError.setVisibility(true);
                this.view.flxAdvSearchBar.setVisibility(false);
                this.view.flxPagination.setVisibility(false);
            } else {
                this.view.paginatedList.setVisibility(true);
                this.view.flxSelectFromAccountError.setVisibility(false);
                this.view.flxAdvSearchBar.setVisibility(true);
                this.view.flxPagination.setVisibility(true);
                this.setupSearchTagsAndFilterTransactions();
            }
        },

        /**
         * sets customer context to combobox
         * @returns null
         */
        setupCustomerCombobox:function(){
            let scope = this;
            this.view.viewByDropdown.setAccessibilityValues("Currently selected Customer. Click to show more views");
            this.searchOptions.fromAccount = this.defaultValues.fromAccount;
            this.viewBy = "Customer";
            this.view.flxAccountsDropdown.setVisibility(false);
            this.view.flxCustomerDropdown.setVisibility(true);
            this.view.paginatedList.setVisibility(true);
            this.view.flxSelectFromAccountError.setVisibility(false);
            this.view.flxPagination.setVisibility(true);
            this.view.flxAdvSearchBar.setVisibility(true);
            let accessibleCustomerIds = this.userPreferencesManager.accessibleCustomerIds;
            let primaryCustomerId = this.userPreferencesManager.primaryCustomerId.id;
            let primaryIndex = 1;
            let defaultCustRowNo = 0;
            const MAX_COMBINED_NAME_LENGTH = 30;
            const SHORT_NAME_LENGTH = 23;
            this.customerComboboxData = [{
                selectedValue : kony.i18n.getLocalizedString("i18n.AccountsDetails.ALL"),
                value : kony.i18n.getLocalizedString("i18n.AccountsDetails.ALL"),
                id:-1,
                name: "",
                contractId:-1,
                showAll: true,
                tbxA11YLabel: kony.i18n.getLocalizedString("i18n.TradeLending.selectCustomer"),
                isMandatory: true
            }];
            for (let i = 0; i < accessibleCustomerIds.length; i++) {
                const customer = accessibleCustomerIds[i];
                if (customer.id === primaryCustomerId) {
                    primaryIndex = i + 1;
                }
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
                this.customerComboboxData.push({
                    selectedValue : selectedName,
                    value : fullName,
                    id : customer.id,
                    name : customer.name,
                    contractId : customer.contractId,
                    showAll: false
                });
            }
            let accounts = applicationManager.getConfigurationManager().userAccounts;
            let accountCount = accounts.length ? accounts.length : 0;
            let accountsCountConfig = applicationManager.getConfigurationManager().getConfigurationValue('accsCountCompactDashboard');
            defaultCustRowNo = accountCount < accountsCountConfig ? 0 : primaryIndex;
            let context = {
                data: this.customerComboboxData,
                defaultSelectedRowNo: defaultCustRowNo,
                maxDropdownHeight: 200,
                searchPlaceholderi18nKey: "i18n.transfers.SearchOrSelectCustomer",
                keyToDisplay: "selectedValue",
                isMandatory: true
            };
            this.searchOptions.customer = this.customerComboboxData[defaultCustRowNo];
            this.view.ComboBox.setContext(context);
            if (defaultCustRowNo === 0) {
                this.view.ComboBox.setAccessibilityValues("Currently selected All Customers. Click to search or select from list of customers");
            } else {
                this.view.ComboBox.setAccessibilityValues("Currently selected customer name and customer ID "+this.searchOptions.customer.value+". Click to search or select from list of customers");
            }
            this.view.ComboBox.subscribeToTouchEnd = this.subscribeToTouchEnd;
            this.view.ComboBox.updateTouchEndSubscriber = this.updateTouchEndSubscriber;
            this.view.ComboBox.onSelection = function(data){
                scope.searchOptions.customer = data.selectedRowData;
                scope.setupSearchTagsAndFilterTransactions();
                scope.view.ComboBox.setAccessibilityValues("Currently selected customer name and customer ID "+data.selectedRowData.value+". Click to search or select from list of customers");
            };
            this.view.ComboBox.onTextBoxTextChange = this.onCustomerComboboxTextChange;
            this.setupSearchTagsAndFilterTransactions();
        },

        filterTransactions: function(){
            let requestParam = {
                "transactionPeriod": this.defaultValues.timePeriod[0],
                "firstRecordNumber":1,
                "lastRecordNumber":20,
                "isSearch" : false,
            };
            if (!isEmptyNullUndefined(this.searchOptions.customer) && this.searchOptions.customer.id !== -1) {
                requestParam.customerId = this.searchOptions.customer.id;
                requestParam.isSearch = true;
            }
            if (!isEmptyNullUndefined(this.searchOptions.fromAccount) && !isEmptyNullUndefined(this.searchOptions.fromAccount.accountID)) {
                requestParam.debitAccountId = this.searchOptions.fromAccount.accountID;
                requestParam.isSearch = true;
            }
            if (!isEmptyNullUndefined(this.searchOptions.referenceNo)) {
                requestParam.paymentOrderId = this.searchOptions.referenceNo;
                requestParam.isSearch = true;
            }
            if (!isEmptyNullUndefined(this.searchOptions.payeeAccNo)) {
                requestParam.paymentAccountId = this.searchOptions.payeeAccNo;
                requestParam.isSearch = true;
            }
            if (!isEmptyNullUndefined(this.searchOptions.status) && this.searchOptions.status[0] !== this.defaultValues.status[0]) {
                requestParam.statusDescription = this.searchOptions.status[0];
                requestParam.isSearch = true;
            }
            if (!isEmptyNullUndefined(this.searchOptions.timePeriod) &&
                this.searchOptions.timePeriod[0] !== this.defaultValues.timePeriod[0] &&
                this.searchOptions.timePeriod[0] !== "Custom") {
                requestParam.transactionPeriod = this.searchOptions.timePeriod[0];
                requestParam.isSearch = true;
            }
            this.view.paginatedList.tabOnClick(requestParam);
        },

        /**
         * is triggered when combobox text is changed
         * filters the data based on search text and returns segment data
         * @param {String} searchText 
         * @returns Object
         */
        onCustomerComboboxTextChange:function(searchText){
            searchText = searchText.toLowerCase();
            let filteredData = [];
            if (searchText === "") {
                filteredData = this.customerComboboxData;
            } else {
                filteredData = this.customerComboboxData.filter((row) => {
                    if (row.value.toLowerCase().includes(searchText)) {
                        return true;
                    }
                    return false;
                });
            }
            return filteredData;
        },
        /**
         * updateFormUI - the entry point method for the form controller.
         * @param {Object} viewModel - it contains the set of view properties and keys.
         */
        updateFormUI: function(viewModel) {
            if (viewModel.isLoading === true) {
                FormControllerUtility.showProgressBar(this.view);
            } else if (viewModel.isLoading === false) {
                FormControllerUtility.hideProgressBar(this.view);
            }
            if (viewModel.transactionDownloadFile) {
                this.downloadAttachmentsFile(viewModel.transactionDownloadFile);
            }
            if (viewModel.downloadError) {
                this.showDownloadError(viewModel.downloadError);
            }
        },
        /***
         * onError event - Tabs component
         * @params {Object} err 
         ***/
        onError: function(err) {
            kony.application.dismissLoadingScreen();
            this.view.flxDowntimeWarning.setVisibility(true);
			this.view.flxSuccessMessage.setVisibility(false);
			this.view.rtxDowntimeWarning.text = err.dbpErrMsg;
        },
        /**
         * onTabClick event - Tabs component
         * @params {String} tabId - Id of the tabs that is clicked
         **/
        onTabClick: function(tabId) {
            console.log(tabId);
            var scopeObj = this;
            if (tabId === "transfersTab") {
                scopeObj.ManageActivitiesPresenter.showTransferScreen({
                    context: "PastPayments"
                });
            } else if (tabId === "recurringTab") {
                scopeObj.ManageActivitiesPresenter.showTransferScreen({
                    context: "ScheduledPayments"
                });
            } else if (tabId === "directDebitsTab") {
                scopeObj.ManageActivitiesPresenter.showTransferScreen({
                    context: "DirectDebits"
                });
            }
        },
        /**
         * Method to handle onDone event of Search Textbox
         * @param {String} searchKeyword - contains entered text in Search Textbox
         */
        onSearchDone: function(searchKeyword) {
            FormControllerUtility.showProgressBar(this.view);
            if (this.userPreferencesManager.isSingleCustomerProfile) {
                this.view.List.onSearch(searchKeyword);
            }
        },
        /**
         * Method to handle onRowClick event of Filter Dropdown
         * @param {String} selectedFilter - contains selected filter info
         */
        onFilterSelect: function(selectedFilter) {
          	FormControllerUtility.showProgressBar(this.view);
            if (this.userPreferencesManager.isSingleCustomerProfile) {
                this.view.List.onFilter(selectedFilter);
            }
        },
        fetchPaginatedRecords: function(offset, limit) {
            if (this.userPreferencesManager.isSingleCustomerProfile) {
                this.view.List.onPagination(offset, limit);
            } else{
                this.view.paginatedList.onPagination(offset, limit);
            }
        },
        onResetPagination: function() {
            this.view.pagination.resetStartIndex();
        },
        updatePaginationBar: function(paginatedRecordsLength, totalNoOfRecords) {
            this.view.flxFormContent.setContentOffset({ x: "0%", y: "0%" }, true);
            FormControllerUtility.hideProgressBar(this.view);
            this.view.pagination.updatePaginationBar(paginatedRecordsLength, totalNoOfRecords);
        },
        showPagination: function() {
            this.view.pagination.setVisibility(true);
        },
        hidePagination: function() {
            this.view.pagination.setVisibility(false);
        },
        showCancelPopup: function(response) {
            if (kony.sdk.isNullOrUndefined(response.dbpErrMsg)) {
                 response.i18n = (response.status === "Pending" ? kony.i18n.getLocalizedString("i18n.Transfers.CancelTransactionApprovalMessage") : kony.i18n.getLocalizedString("i18n.Transfers.CancelTransactionSuccessMessage")) + " " + kony.i18n.getLocalizedString("i18n.ChequeManagement.ReferenceNumber:") + " " + response.referenceId || response.transactionId;
            }else{
                response.i18n = kony.i18n.getLocalizedString("i18n.Transfers.CancelTransactionFailureMessage");
            }
            this.view.flxSuccessMessage.setVisibility(true);
            this.view.GenericMessageNew.setContext(response);
            this.view.SearchAndFilter.resetComponent();
        },
        closepopup: function() {
            this.view.flxSuccessMessage.setVisibility(false);
        },
        /**
         * Method to handle button onClick event
         * @param {String} buttonId - contains clicked button id
         * @param {Object} data - contains service response data
         */
        onButtonAction: function(buttonId, data) {
            switch (buttonId) {
                case "Edit":
                    this.executeEdit(data);
                    break;
                case "Repeat":
                    this.executeRepeat(data);
                    break;
                case "View Attachment":
                    this.executeViewAttachment(data);
                    break;
                case "Download Report":
					this.downloadReport(data);
                    break;
            }
        },
        executeEdit: function(dataItem) {
            var scopeObj = this;
            if (dataItem.transactionType === "InternalTransfer") {
                scopeObj.Europresenter.showTransferScreen({
                    "context": "MakePaymentOwnAccounts",
                    "editTransaction": dataItem
                });
            } else {
                scopeObj.Europresenter.showTransferScreen({
                    "context": "MakePayment",
                    "editTransaction": dataItem
                });
            }

        },
        executeRepeat: function(dataItem) {
            var scopeObj = this;
            if (scope_configManager.TransferFlowType === "CTF") {
                if (dataItem.transactionType === "InternalTransfer") {
                    scopeObj.Europresenter.showTransferScreen({
                        "context": "MakePaymentOwnAccounts",
                        "editTransaction": dataItem
                    });
                } else {
                    scopeObj.Europresenter.showTransferScreen({
                        "context": "MakePayment",
                        "editTransaction": dataItem
                    });
                }
            } else {
                var frmName = "", transferType = "", isP2PFlow = false;
                if (dataItem.serviceName === "INTRA_BANK_FUND_TRANSFER_CREATE" || dataItem.serviceName === "TRANSFER_BETWEEN_OWN_ACCOUNT_CREATE") {
                    frmName = "frmUTFSameBankTransfer";
                    transferType = "Same Bank";
                } else if (dataItem.serviceName === "INTER_BANK_ACCOUNT_FUND_TRANSFER_CREATE") {
                    frmName = "frmUTFDomesticTransfer";
                    transferType = "Domestic Transfer";
                } else if (dataItem.serviceName === "INTERNATIONAL_ACCOUNT_FUND_TRANSFER_CREATE") {
                    frmName = "frmUTFInternationalTransfer";
                    transferType = "International Transfer";
                } else {
                    isP2PFlow = true;
                    frmName = { appName: "TransfersMA", friendlyName: "frmUTFP2PTransfer" };
                    transferType = "Pay a Person";
                }
                const context = {
                    "transferType": transferType,
                    "transferFlow": "Repeat",
                    "transactionObject": dataItem
                };
                if (isP2PFlow) {
                    if (applicationManager.getConfigurationManager().isMicroAppPresent("TransfersMA")) {
                        applicationManager.getNavigationManager().navigateTo(frmName, false, context);
                    }
                } else {
                    const navObj = {
                        context: this,
                        params: context,
                        callbackModelConfig: {
                        "frm": frmName,
                        "UIModule": "UnifiedTransferFlowUIModule",
                        "appName": "TransfersMA"
                        }
                    };
                    kony.mvc.getNavigationManager().navigate(navObj);
                }
            }
        },
        executeViewAttachment: function(fileNames) {
            var scopeObj = this;
            this.view.setContentOffset({
                x: "0%",
                y: "0%"
            }, true);
            scopeObj.view.flxDialogs.setVisibility(true);
            this.attachments = fileNames;
            scopeObj.view.flxDownloadsPopup.setVisibility(true);
            scopeObj.view.btnDownload.text = (fileNames.length === 1) ? kony.i18n.getLocalizedString("i18n.common.Download") : kony.i18n.getLocalizedString("i18n.common.DownloadAll");
            scopeObj.view.btnDownload.toolTip = scopeObj.view.btnDownload.text;
            scopeObj.view.flxButtons.btnCancel.onClick = function() {
                scopeObj.view.flxDialogs.setVisibility(false);
                scopeObj.view.flxDownloadsPopup.setVisibility(false);
            };
            scopeObj.view.flxButtons.btnDownload.onClick = function() {
                if (fileNames.length > 0) {
                    var count = 0;
                    FormControllerUtility.showProgressBar(this.view);
                    for (var i = 0; i < fileNames.length; i++) {
                        setTimeout(scopeObj.ManageActivitiesPresenter.downloadAttachments.bind(this, false, fileNames, i, "frmPastPaymentsEurNew"), count);
                        count += 1000;
                    }
                    FormControllerUtility.hideProgressBar(this.view);
                }
            };
            this.setDownloadSegmentData(fileNames);
        },
        downloadSingleFile: function(dataItem) {
            var scopeObj = this;
            scopeObj.ManageActivitiesPresenter.downloadAttachments(true, dataItem, 0, "frmPastPaymentsEurNew");
        },
        setDownloadSegmentData: function(filesList) {
            var scopeObj = this;
            var downloadAttachmentsData = [];
            for (var i = 0; i < filesList.length; i++) {
                downloadAttachmentsData[i] = {};
                downloadAttachmentsData[i].filename = filesList[i].fileName;
                downloadAttachmentsData[i]["imgDownloadAttachment"] = {
                    src: "download_blue.png",
                    cursorType: 'pointer',
                    toolTip: kony.i18n.getLocalizedString("i18n.common.Download"),
                    onTouchEnd: scopeObj.downloadSingleFile.bind(scopeObj, filesList[i])
                };
            }
            scopeObj.view.segDownloadItems.widgetDataMap = {
                "lblDownloadAttachment": "filename",
                "imgDownloadAttachment": "imgDownloadAttachment",
            };
            scopeObj.view.segDownloadItems.setData(downloadAttachmentsData);
        },
        downloadAttachmentsFile: function(fileUrl) {
            FormControllerUtility.showProgressBar(this.view);
            var data = {
                "url": fileUrl
            };
            CommonUtilities.downloadFile(data);
            FormControllerUtility.hideProgressBar(this.view);
        },
		showDownloadError: function(response){
           this.view.flxSuccessMessage.setVisibility(true);
           this.view.GenericMessageNew.setContext(response.serverErrorRes);
        },
        viewAttachment: function(transactionId, viewAttachmentCallback) {
            this.ManageActivitiesPresenter.retrieveAttachments(transactionId, viewAttachmentCallback);
        },
      toggleDownloadReportPopup: function(flag) {
        this.view.flxDialogs.setVisibility(flag);
        this.view.flxDownloadReportPopup.setVisibility(flag);
        if(flag === false){
            if (this.userPreferencesManager.isSingleCustomerProfile) {
                this.view.List.setbackPopupFocus();
            } else{
                this.view.paginatedList.setbackPopupFocus();
            }
        }   
        if(this.view.flxDownloadReportPopup.isVisible === true){
            this.view.CustomPopup1.lblHeading.setActive(true);
            this.view.CustomPopup1.isModalContainer = true;
        }
      },
      downloadReport: function(data) {
        var scope = this;
        this.view.CustomPopup1.lblHeading.text = kony.i18n.getLocalizedString("i18n.transfers.downloadReport");
        this.toggleDownloadReportPopup(true);
        this.view.CustomPopup1.flxCross.accessibilityConfig = {
            a11yLabel: "Close this download Report dialog",
            a11yARIA: {
              tabindex: 0,
              role: "button"
            }
          };
         this.view.CustomPopup1.btnNo.accessibilityConfig = {
            a11yLabel: "No, don't download this report ",
            a11yARIA: {
              tabindex: 0,
              role: "button"
            }
          };
         this.view.CustomPopup1.btnYes.accessibilityConfig = {
            a11yLabel: "yes, download this report",
            a11yARIA: {
              tabindex: 0,
              role: "button"
            }
          };
        this.view.CustomPopup1.flxCross.onClick = this.toggleDownloadReportPopup.bind(scope,false);
        this.view.CustomPopup1.btnNo.onClick = this.toggleDownloadReportPopup.bind(scope,false);
        this.view.CustomPopup1.btnYes.onClick = function() {
          scope.toggleDownloadReportPopup(false);
          scope.ManageActivitiesPresenter.downloadReport(data, scope.view.id);
        };
      }
    };
});