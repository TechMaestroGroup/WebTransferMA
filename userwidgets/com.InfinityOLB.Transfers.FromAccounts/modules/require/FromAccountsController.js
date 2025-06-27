define(["CommonUtilities"], function (CommonUtilities) {
    /**
     * checks if data is null or undefined
     * @param {*} data
     * @returns boolean
     */
    let isNullUndefined = function (data) {
        if (data === null || data === undefined) {
            return true;
        }
        return false;
    };

    /**
     * checks if data is empty, null or undefined
     * @param {*} data
     * @returns boolean
     */
    let isEmptyNullUndefined = function (data) {
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
    };
    //used for grouping accounts
    let groupIdentifier = {
        internal: {
            identifier: "accountType",
        },
        segregation: {
            Checking: kony.i18n.getLocalizedString("kony.mb.common.AccountType.Checking"),
            CreditCard: kony.i18n.getLocalizedString("i18n.payments.CreditCardAccount"),
            Deposit: kony.i18n.getLocalizedString("kony.mb.common.AccountType.Deposit"),
            Loan: kony.i18n.getLocalizedString("kony.mb.common.AccountType.Loan"),
            Savings: kony.i18n.getLocalizedString("kony.mb.common.AccountType.Savings"),
            default: kony.i18n.getLocalizedString("kony.mb.Transfers.allpayees"),
            Favourite: kony.i18n.getLocalizedString("i18n.payments.FavouriteAccount"),
        },
    }; //To identify the Account type

    return {
        constructor: function (baseConfig, layoutConfig, pspConfig) {
            //this._variables are assigned in setContext method or constructor
            this._accountActions = [];
            this._defaultSelectedRowNo = null;
            this._defaultSelectedSectionNo = 0;
            this._keyToDisplay = "value";
            this._isBalanceVisible = false;
            this._isMandatory = false;
            this._maxDropdownHeight = 200;
            this._tbxA11YLabel = "Combobox";
            this._selectedCustomerID = null;
            this.configMgr = applicationManager.getConfigurationManager();
            this.userPreferencesMgr = applicationManager.getUserPreferencesManager();
            this.groupedFromRecords = [];
            this.validFromSegAccounts = [];
            this.isLargeAccUser = false;
            this.isInitialized = false;
            this.hasSections = false;
            this.selectedAccount = null;
            this.view.tbxSearch.placeholder = "Search";
            this.view.flxNoResultsFound.height = this._maxDropdownHeight + "px";
            this.view.segDropdown.sectionHeaderTemplate = "flxAccountsDropdownHeader";
            this.view.segDropdown.rowTemplate = "flxAccountsDropdownList";
            this.view.segDropdown.widgetDataMap = {
                flxAccountRecordField: "flxAccountRecordField",
                flxAccountsDropdownHeader: "flxAccountsDropdownHeader",
                flxAccountsDropdownList: "flxAccountsDropdownList",
                flxBottomSeparator: "flxBottomSeparator",
                flxDropdownIcon: "flxDropdownIcon",
                flxRecordFieldType: "flxRecordFieldType",
                flxRecordFieldTypeIcon1: "flxRecordFieldTypeIcon1",
                flxRecordFieldTypeIcon2: "flxRecordFieldTypeIcon2",
                flxRecordType: "flxRecordType",
                flxTopSeparator: "flxTopSeparator",
                imgRecordFieldTypeIcon2: "imgRecordFieldTypeIcon2",
                lblDropdownIcon: "lblDropdownIcon",
                lblRecordField1: "lblRecordField1",
                lblRecordField2: "lblRecordField2",
                lblRecordField3: "lblRecordField3",
                lblRecordField4: "lblRecordField4",
                lblRecordFieldTypeIcon1: "lblRecordFieldTypeIcon1",
                lblRecordType: "lblRecordType",
            };
            this.view.segDropdown.enableLazyLoad = true;
            this.view.lblSelectedValue.setVisibility(false);
            this.view.lblPlaceholder.setVisibility(true);
            this.view.flxContainer.onClick = this.toggleDropdownVisibility;
            this.view.flxContainer.onKeyPress = this.onDropdownKeyPress;
            this.view.segDropdown.onRowClick = this.rowClickHandler;
            this.view.segDropdown.onKeyPress = this.onDropdownKeyPress;
            this.view.segDropdown.doLayout = this.setHeightInInfo;
            this.view.tbxSearch.onTouchEnd = this.tbxOnTouchEndHandler;
            this.view.tbxSearch.onKeyPress = this.textboxKeyPressHandler;
            this.view.tbxSearch.onTextChange = this.textboxTextChangeHandler;
            this.view.flxClearText.onClick = this.clearTextboxText;
            this.view.postShow = this.compPostShow;
        },
        //Logic for getters/setters of custom properties
        initGettersSetters: function () {
            defineGetter(this, "dataMapping", () => {
                return this._dataMapping;
            });
            defineSetter(this, "dataMapping", (value) => {
                this._dataMapping = value;
                this.setContext(value);
            });
        },

        /**
         * This method is triggered in the post show lifecycle event of the component
         */
        compPostShow: function () {
            this.subscriberID = this.view.id + Math.random() * 1000;
            if (this.subscribeToTouchEnd) {
                this.subscribeToTouchEnd(this.subscriberID, {
                    widget: this.view.flxDropdownSegment,
                    hideFunction: this.hideDropdown,
                    shouldBeVisible: false,
                });
            }
            this.view.flxTextbox.accessibilityConfig = {
                a11yLabel: "Search or select from dropdown",
                a11yARIA: {
                    tabindex: 0,
                },
            };
        },

        /**
         * @function : initialize
         * @description : Sets the from account list
         */
        initialize: function () {
            try {
                this.isInitialized = true;
                let segData = this.fetchFromAccounts();
                let accountCount = segData.length;
                let accountsCountConfig = applicationManager.getConfigurationManager().getConfigurationValue("accsCountCompactDashboard");
                this.isLargeAccUser = accountCount > parseInt(accountsCountConfig);
                let isIconVisible = this.hasMixAccounts(segData);
                segData.forEach((row) => {
                    row["lblRecordField1"] = {
                        text:
                            row.accountID || row.Account_id
                                ? CommonUtilities.truncateStringWithGivenLength(row.accountName + "....", 26) +
                                  CommonUtilities.getLastFourDigit(row.accountID)
                                : CommonUtilities.getAccountDisplayName(row),
                    };
                    row["displayLabel"] = row["lblRecordField1"].text;
                    if (this.isLargeAccUser || !this._isBalanceVisible) {
                        row["lblRecordField2"] = {
                            isVisible: false,
                            text: "",
                        };
                    } else {
                        row["lblRecordField2"] = {
                            isVisible: true,
                            text:
                                row.accountType !== "CreditCard" && row.accountType !== "Loan"
                                    ? row.availableBalance
                                        ? CommonUtilities.formatCurrencyWithCommas(row.availableBalance, false, row.currencyCode)
                                        : row.bankName || row.phone || row.email
                                    : CommonUtilities.formatCurrencyWithCommas(row.outstandingBalance, false, row.currencyCode),
                        };
                    }
                    row["lblRecordField3"] = {
                        text: row.accountType,
                    };
                    row["flxRecordFieldTypeIcon1"] = {
                        isVisible: isIconVisible,
                    };
                    row["flxRecordFieldTypeIcon2"] = {
                        isVisible: false,
                    };
                    row["lblRecordFieldTypeIcon1"] = {
                        text: row.isBusinessAccount === "true" || row.isBusinessPayee === "1" ? "r" : "s",
                    };
                    row["imgRecordFieldTypeIcon2"] = {
                        src: "",
                    };
                    if (!this.userPreferencesMgr.isSingleCustomerProfile) {
                        row.lblRecordField4 = {
                            isVisible: true,
                            text: row.MembershipName + " - " + row.Membership_id,
                            skin: "ICSknLbl72727213PX",
                            left: "10dp",
                        };
                    } else {
                        row.lblRecordField4 = {
                            isVisible: false,
                            text: "",
                        };
                    }
                    let a11yLabel = "Account Name " + row.lblRecordField1.text + ", Account Type " + row.lblRecordField3.text;
                    if (row.lblRecordField4.isVisible) {
                        a11yLabel = a11yLabel + ", Membership Name " + row.lblRecordField4.text;
                    }
                    if (row.lblRecordField2.isVisible) {
                        a11yLabel = a11yLabel + ", Amount " + row.lblRecordField2.text;
                    }
                    row["flxAccountsDropdownList"] = {
                        accessibilityConfig: {
                            a11yLabel: a11yLabel,
                            a11yARIA: {
                                tabindex: 0,
                                role: "button",
                            },
                        },
                        height: this.isLargeAccUser ? "0dp" : "60dp",
                        isVisible: this.isLargeAccUser ? false : true,
                    };
                });
                this.validFromSegAccounts = segData;
                this.groupedFromRecords = this.groupAccounts(segData);
                this.setDropdownData(this.groupedFromRecords);
                if (!isEmptyNullUndefined(this._selectedAccountID)) {
                    //set selected account
                    this.setSelectedAccount(this._selectedAccountID);
                    this._selectedAccountID = null;
                }
            } catch (err) {
                kony.print("ERROR :" + err);
            }
        },

        /**
         * Filtering the accounts based on permissions and selected customer
         * @returns fromAccountsGroup array of jsons where each json is segment row for an account
         */
        fetchFromAccounts: function () {
            let fromAccountsGroup = [];
            let scope = this;
            let accounts = this.configMgr.userAccounts;
            if (!kony.sdk.isNullOrUndefined(accounts)) {
                accounts.forEach(function (account) {
                    let isValidAccount = false;
                    if (scope._selectedCustomerID !== null && scope._selectedCustomerID !== account.coreCustomerId) {
                        return;
                    }
                    if (scope._accountActions.length === 0) {
                        fromAccountsGroup.push(account);
                        return;
                    }
                    for (let i = 0; i < scope._accountActions.length; i++) {
                        const action = scope._accountActions[i];
                        if (scope.configMgr.checkAccountAction(account.accountID, action)) {
                            isValidAccount = true;
                            break;
                        }
                    }
                    if (isValidAccount) {
                        fromAccountsGroup.push(account);
                    }
                });
            }
            return fromAccountsGroup;
        },

        /**
         * returns if the user has mix accounts or not
         * @param {*} accounts all accounts of the user
         * @returns boolean
         */
        hasMixAccounts: function (accounts) {
            try {
                let businessAccountFlag = false;
                let personalAccountFlag = false;
                for (let i = 0; i < accounts.length; i++) {
                    if (!isEmptyNullUndefined(accounts[i]["isBusinessAccount"])) {
                        if (accounts[i]["isBusinessAccount"] == "true") {
                            businessAccountFlag = true;
                        } else {
                            personalAccountFlag = true;
                        }
                    }
                }
                return businessAccountFlag && personalAccountFlag;
            } catch (err) {
                kony.print("ERROR :" + err);
            }
        },

        /**
         * groups segment rows by customer or account type and returns the group
         * @param {Object} segData array of jsons which are segment rows
         * @returns Object
         */
        groupAccounts: function (segData) {
            try {
                let data = [];
                let groupedRecordsList = [];
                let interalKey = groupIdentifier.internal.identifier;
                if (segData !== undefined) {
                    if (this._selectedCustomerID !== null || this.userPreferencesMgr.isSingleCustomerProfile) {
                        groupedRecordsList = segData.reduce(function (value, obj) {
                            if (!(interalKey === null || interalKey === undefined || interalKey === "")) {
                                if (obj.favouriteStatus === "1") {
                                    (value["Favourite"] = value["Favourite"] || []).push(obj);
                                }
                                (value[obj[interalKey]] = value[obj[interalKey]] || []).push(obj);
                                return value;
                            } else {
                                (value["Select Account"] = value["Select Account"] || []).push(obj);
                                return value;
                            }
                        }, {});
                    } else {
                        groupedRecordsList = segData.reduce(function (value, obj) {
                            if (obj.favouriteStatus === "1") {
                                (value["Favourite"] = value["Favourite"] || []).push(obj);
                            }
                            if (obj.MembershipName) {
                                (value[obj["MembershipName"] + " - " + obj["Membership_id"]] =
                                    value[obj["MembershipName"] + " - " + obj["Membership_id"]] || []).push(obj);
                            } else if (!kony.sdk.isNullOrUndefined(interalKey) || interalKey === "") {
                                (value[obj[interalKey]] = value[obj[interalKey]] || []).push(obj);
                            } else {
                                (value["Select Account"] = value["Select Account"] || []).push(obj);
                            }
                            return value;
                        }, {});
                    }
                } else groupedRecordsList = {};
                let types = [];
                types = this.moveToFirst(Object.keys(groupedRecordsList), "Favourite");

                if (types.length != 0) {
                    for (let i = 0; i < types.length; i++) {
                        let displayText;
                        if (types[i] != "undefined") {
                            displayText = groupIdentifier["segregation"][types[i]];
                        } else {
                            displayText = groupIdentifier["segregation"]["default"];
                        }
                        if (isEmptyNullUndefined(displayText)) {
                            displayText = types[i];
                        }
                        if (i === 0 && this.isLargeAccUser) {
                            groupedRecordsList[types[i]].forEach((row) => {
                                row.flxAccountsDropdownList.isVisible = true;
                                row.flxAccountsDropdownList.height = "60dp";
                            });
                        }
                        data[i] = [
                            {
                                lblRecordType: {
                                    text: displayText + " (" + groupedRecordsList[types[i]].length + ")",
                                },
                                lblDropdownIcon: {
                                    text: this.isLargeAccUser && i !== 0 ? "O" : "P",
                                    accessibilityConfig: {
                                        a11yHidden: true,
                                    },
                                },
                                flxDropdownIcon: {
                                    accessibilityConfig: {
                                        a11yLabel: displayText + " (" + groupedRecordsList[types[i]].length + ")",
                                        a11yARIA: {
                                            "aria-expanded": this.isLargeAccUser && i !== 0 ? false : true,
                                            role: "button",
                                            tabindex: 0,
                                        },
                                    },
                                    onClick: this.showOrHideAccountSection.bind(this),
                                },
                            },
                            groupedRecordsList[types[i]],
                        ];
                    }
                }
                return data;
            } catch (err) {
                kony.print("ERROR :" + err);
            }
        },

        /**
         * moveToFirst
         * Method to move the item to 0th index
         * @return : data
         */
        moveToFirst: function (data, item) {
            index = data.indexOf(item);
            if (index > -1) {
                data.splice(index, 1);
                data.unshift(item);
            }
            return data;
        },

        /**
         * toggle the account section rows visibility
         */
        showOrHideAccountSection: function () {
            if (this.updateTouchEndSubscriber) {
                this.updateTouchEndSubscriber(this.subscriberID, {
                    shouldBeVisible: true,
                });
            }
            let sectionIndex = this.view.segDropdown.selectedRowIndex[0];
            let segData = this.view.segDropdown.data;
            let isRowVisible = true;
            if (segData[sectionIndex][0].lblDropdownIcon["text"] === "P") {
                segData[sectionIndex][0].flxDropdownIcon.accessibilityConfig = {
                    a11yLabel: segData[sectionIndex][0].lblRecordType.text,
                    a11yARIA: {
                        "aria-expanded": false,
                        role: "button",
                        tabindex: 0,
                    },
                };
                segData[sectionIndex][0].lblDropdownIcon["text"] = "O";
                isRowVisible = false;
            } else {
                segData[sectionIndex][0].flxDropdownIcon.accessibilityConfig = {
                    a11yLabel: segData[sectionIndex][0].lblRecordType.text,
                    a11yARIA: {
                        "aria-expanded": true,
                        role: "button",
                        tabindex: 0,
                    },
                };
                segData[sectionIndex][0].lblDropdownIcon["text"] = "P";
                isRowVisible = true;
            }
            let rowFlex = "flxAccountsDropdownList";
            for (let i = 0; i < segData[sectionIndex][1].length; i++) {
                let rowDataTobeUpdated = JSON.parse(JSON.stringify(segData[sectionIndex][1][i][rowFlex]));
                rowDataTobeUpdated.height = isRowVisible ? "60dp" : "0dp";
                rowDataTobeUpdated.isVisible = isRowVisible;
                this.updateKeyAt(rowFlex, rowDataTobeUpdated, i, sectionIndex);
            }
            this.view.segDropdown.setSectionAt(segData[sectionIndex], sectionIndex);
            this.view.segDropdown.setActive(-1, sectionIndex, "flxAccountsDropdownHeader.flxRecordType.flxDropdownIcon");
        },

        /**
         * updates data of a row and sets it to the segment
         * @param {String} widgetName row flex name
         * @param {*} value new value assigned to widget
         * @param {*} row row number in segment
         * @param {*} section section number in segment
         */
        updateKeyAt: function (widgetName, value, row, section) {
            let data = this.view.segDropdown.data;
            let rowDataTobeUpdated = JSON.parse(JSON.stringify(data[section][1][row]));
            rowDataTobeUpdated[widgetName] = value;
            this.view.segDropdown.setDataAt(rowDataTobeUpdated, row, section);
        },

        /**
         * filters from account dropdown segment and returns the sections
         * @param {*} searchText text entered in the search textbox
         * @returns Object
         */
        filterFromAccounts: function (searchText) {
            try {
                searchText = searchText.toLowerCase();
                if (searchText === "") {
                    this.view.flxClearText.setVisibility(false);
                    this.hasSections = true;
                    return this.groupedFromRecords;
                }
                this.view.flxClearText.setVisibility(true);
                let data = this.validFromSegAccounts;
                if (searchText.includes("..")) {
                    let splitText = searchText.split("....");
                    searchText = splitText.length === 2 ? splitText[1] : splitText[0];
                }
                let searchCriteria = [{ field: "accountID" }, { field: "accountName" }];
                let result = data.filter(function (record) {
                    for (let i = 0; i < searchCriteria.length; i++) {
                        try {
                            if (record[searchCriteria[i].field] && record[searchCriteria[i].field].toLowerCase().includes(searchText)) {
                                record["flxAccountsDropdownList"].height = "60dp";
                                record["flxAccountsDropdownList"].isVisible = true;
                                return true;
                            }
                        } catch (err) {
                            //implicit non-match, skip to next field or record
                        }
                    }
                    return false;
                });
                this.hasSections = false;
                return result;
            } catch (err) {
                kony.print("ERROR :" + err);
            }
        },

        /**
         * This method is used to set the context to the component
         * @param {Object} context data sent from parent
         * @param {number} context.maxDropdownHeight - maximum height of the dropdown
         * @param {string} context.tbxA11YLabel - a11y label which will be assigned to textbox
         * @param {string} context.searchPlaceholderText - label which will be assigned to textbox
         * @param {string} context.dropdownPlaceholderText - label which will be assigned to dropdown as placeholder
         * @param {Object} context.accountActions - actions that the account should have to be displayed in the dropdown
         * @param {string} context.selectedCustomerID - customer id to filter accounts from
         * @param {string} context.selectedAccountID - account id to preselect
         * @param {string} context.clearSelection - account id to preselect
         * @param {boolean} context.isBalanceVisible - account id to preselect
         * @param {boolean} context.isMandatory - is the field mandatody
         * @returns null
         */
        setContext: function (context) {
            if (isEmptyNullUndefined(context)) {
                //return as no context is sent
                return;
            }
            if (!isEmptyNullUndefined(context.accountActions)) {
                this._accountActions = context.accountActions;
            }
            if (!isEmptyNullUndefined(context.selectedCustomerID) && context.selectedCustomerID !== -1) {
                if (this._selectedCustomerID !== context.selectedCustomerID) {
                    //reinitilize when customer id is updated
                    this.isInitialized = false;
                    this._selectedCustomerID = context.selectedCustomerID;
                }
            } else if (this._selectedCustomerID !== null) {
                this.isInitialized = false;
                this._selectedCustomerID = null;
            }
            if (!this.isInitialized) {
                this.initialize();
            }
            if (!isEmptyNullUndefined(context.clearSelection)) {
                this.view.lblSelectedValue.setVisibility(false);
                this.view.lblPlaceholder.setVisibility(true);
                this.selectedAccount = null;
            }
            if (!isEmptyNullUndefined(context.selectedAccountID)) {
                this._selectedAccountID = context.selectedAccountID;
                if (this.isInitialized) {
                    this.setSelectedAccount(context.selectedAccountID);
                    this._selectedAccountID = null;
                }
            }
            if (!isEmptyNullUndefined(context.maxDropdownHeight)) {
                this._maxDropdownHeight = context.maxDropdownHeight;
                this.view.flxNoResultsFound.height = this._maxDropdownHeight + "px";
                this.setDropdownHeight();
            }
            if (!isEmptyNullUndefined(context.tbxA11YLabel)) {
                this._tbxA11YLabel = context.tbxA11YLabel;
            }
            if (!isEmptyNullUndefined(context.searchPlaceholderText)) {
                this.view.tbxSearch.placeholder = context.searchPlaceholderText;
            }
            if (!isEmptyNullUndefined(context.dropdownPlaceholderText)) {
                this.view.lblPlaceholder.text = context.dropdownPlaceholderText;
            }
            if (!isEmptyNullUndefined(context.isBalanceVisible)) {
                this._isBalanceVisible = context.isBalanceVisible;
            }
            if (!isEmptyNullUndefined(context.isMandatory)) {
                this._isMandatory = context.isMandatory;
            }
        },

        /**
         * sets the default value in the dropdown
         * @param {number} sectionNo
         * @param {number} rowNo
         * @returns null
         */
        setSelectedAccount: function (accountID) {
            if (isEmptyNullUndefined(accountID)) {
                //accountID is not passed as an argument to set
                return;
            }
            if (!isEmptyNullUndefined(this.selectedAccount) && this.selectedAccount.accountID === accountID) {
                //return as the current selected account id is the same as the one passed to function.
                return;
            }
            let filteredAccs = this.validFromSegAccounts.filter((acc) => {
                if (acc.accountID === accountID) {
                    return true;
                }
                return false;
            });
            if (filteredAccs.length > 0) {
                this.selectedAccount = filteredAccs[0];
                this.view.lblSelectedValue.text = this.selectedAccount.displayLabel;
                this.view.lblSelectedValue.setVisibility(true);
                this.view.lblPlaceholder.setVisibility(false);
                return this.selectedAccount;
            }
            return {};
        },

        /**
         * sets data to segment widget or shows no results found if data is empty
         * @param {object} segData
         */
        setDropdownData: function (segData) {
            if (segData.length > 0) {
                this.view.segDropdown.setData(segData);
                this.view.flxNoResultsFound.isVisible = false;
                this.view.segDropdown.isVisible = true;
            } else {
                //show no results found
                this.view.flxNoResultsFound.isVisible = true;
                this.view.segDropdown.isVisible = false;
            }
            this.setDropdownHeight();
        },

        /**
         * is triggered by row click of the segment
         * @fires onSelection event to parent
         */
        rowClickHandler: function () {
            let selectedAccount = this.setAndReturnSelectedAccount();
            this.setAccessibilityValues("Currently selected account "+selectedAccount.displayLabel+". Click to search or select from list of accounts");
            if (this.onSelection) {
                this.onSelection(selectedAccount);
            }
        },

        /**
         * sets selected data to label and returns the data
         * @returns selected account
         */
        setAndReturnSelectedAccount: function () {
            let selectedRowData = this.view.segDropdown.selectedRowItems[0];
            this.view.lblSelectedValue.text = selectedRowData.displayLabel;
            this.view.lblSelectedValue.setVisibility(true);
            this.view.lblPlaceholder.setVisibility(false);
            this.hideDropdown();
            this.selectedAccount = selectedRowData;
            return this.selectedAccount;
        },

        /**
         * returns selected data
         * @returns selected account
         */
        getSelectedAccount: function () {
            return this.selectedAccount;
        },

        /**
         * toggles dropdown visibility
         */
        toggleDropdownVisibility: function () {
            if (this.view.flxDropdownSegment.isVisible) {
                this.hideDropdown();
            } else {
                this.showDropdown();
            }
        },

        /**
         * sets segment's frame value in info property
         */
        setHeightInInfo: function () {
            //this is the doLayout handler, widget.frame values are only accessibile in the handler
            this.view.segDropdown.info.frame = this.view.segDropdown.frame;
            this.setDropdownHeight();
        },

        /**
         * sets dropdown height based on segment height
         */
        setDropdownHeight: function () {
            let segHeight = this._maxDropdownHeight;
            if (!isEmptyNullUndefined(this.view.segDropdown.info.frame)) {
                segHeight = this.view.segDropdown.info.frame.height;
            }
            if (this.view.segDropdown.isVisible && segHeight !== 0 && segHeight < this._maxDropdownHeight) {
                this.view.flxDropdownSegment.height = segHeight + "px";
            } else {
                this.view.flxDropdownSegment.height = this._maxDropdownHeight + "px";
            }
        },

        /**
         * shows the dropdown
         */
        showDropdown: function () {
            if (this.updateTouchEndSubscriber) {
                this.updateTouchEndSubscriber(this.subscriberID, {
                    shouldBeVisible: true,
                });
            }
            this.view.lblArrow.text = "P";
            this.view.flxDropdownSegment.setVisibility(true);
            this.view.flxLabels.setVisibility(false);
            this.view.flxTextbox.setVisibility(true);
            let containerA11yData = this.view.flxContainer.accessibilityConfig || {};
            containerA11yData.a11yARIA = {
                "aria-expanded": true,
                role: "combobox",
                "aria-required": this._isMandatory,
                "aria-controls": "flxDropdownSegment",
            };
            this.view.flxContainer.accessibilityConfig = containerA11yData;
            this.view.tbxSearch.accessibilityConfig = {
                a11yLabel: this._tbxA11YLabel,
                a11yARIA: {
                    "aria-autocomplete": "both",
                    "aria-expanded": true,
                    role: "combobox",
                    "aria-required": true,
                    "aria-controls": "flxDropdownSegment",
                },
            };
            this.clearTextboxText();
        },

        /**
         * hides the dropdown
         */
        hideDropdown: function () {
            this.view.lblArrow.text = "O";
            this.view.flxDropdownSegment.setVisibility(false);
            this.view.flxLabels.setVisibility(true);
            this.view.flxTextbox.setVisibility(false);
            let containerA11yData = this.view.flxContainer.accessibilityConfig || {};
            containerA11yData.a11yARIA = {
                "aria-expanded": false,
                role: "combobox",
                "aria-required": this._isMandatory,
                "aria-controls": "flxDropdownSegment",
            };
            this.view.flxContainer.accessibilityConfig = containerA11yData;
            this.view.tbxSearch.accessibilityConfig = {
                a11yLabel: this._tbxA11YLabel,
                a11yARIA: {
                    "aria-autocomplete": "both",
                    "aria-expanded": false,
                    role: "combobox",
                    "aria-required": this._isMandatory,
                    "aria-controls": "flxDropdownSegment",
                },
            };
            this.view.flxContainer.setActive(true);
        },

        /**
         * updates touchend handler so that the dropdown doesn't dismiss
         */
        tbxOnTouchEndHandler: function () {
            if (this.updateTouchEndSubscriber) {
                this.updateTouchEndSubscriber(this.subscriberID, {
                    shouldBeVisible: true,
                });
            }
        },
        /**
         * clears the textbox text
         */
        clearTextboxText: function () {
            if (this.updateTouchEndSubscriber) {
                this.updateTouchEndSubscriber(this.subscriberID, {
                    shouldBeVisible: true,
                });
            }
            this.view.tbxSearch.text = "";
            this.textboxTextChangeHandler();
            this.view.tbxSearch.setActive(true);
        },

        /**
         * hides dropdown if esc key is pressed
         * @param {object} eventObject - textbox widget
         * @param {object} eventPayload - keyboard event object
         * @returns
         */
        textboxKeyPressHandler: function (eventObject, eventPayload) {
            if (eventPayload.keyCode === 27) {
                eventPayload.preventDefault();
                this.hideDropdown();
                return;
            }
        },

        /**
         * filters dropdown data based on search text
         */
        textboxTextChangeHandler: function () {
            let data = this.filterFromAccounts(this.view.tbxSearch.text);
            if (!isNullUndefined(data)) {
                this.setDropdownData(data);
            }
        },

        /**
         * hides keyboard if esc is pressed
         * @param {object} eventObject widget object which has fired the keyboard event
         * @param {object} eventPayload keyboard event object
         */
        onDropdownKeyPress: function (eventObject, eventPayload) {
            if (eventPayload.keyCode === 27) {
                eventPayload.preventDefault();
                this.hideDropdown();
            }
        },

        /**
         * this method is triggered from combobox segment template's controller on a key press event
         * @param {object} param is an array of 3 objects
         * @param {object} param.eventObject has widget data
         * @param {object} param.eventPayload has keyboard event data
         * @param {object} param.context has row, segement and widget data
         * @returns null
         */
        segTabKeyPress: function ([eventObject, eventPayload, context]) {
            if (eventPayload.keyCode === 27) {
                //escape key is pressed so hide the dropdown
                eventPayload.preventDefault();
                this.hideDropdown();
                return;
            }
            let segData = this.view.segDropdown.data;
            if (this.hasSections) {
                if (context.sectionIndex === segData.length - 1 && context.rowIndex === segData[context.sectionIndex][1].length - 1) {
                    if (eventPayload.keyCode === 9 && !eventPayload.shiftKey) {
                        //tab key is pressed on the last row so hide the dropdown
                        eventPayload.preventDefault();
                        this.hideDropdown();
                        return;
                    }
                }
            } else {
                if (context.rowIndex === segData.length - 1) {
                    if (eventPayload.keyCode === 9 && !eventPayload.shiftKey) {
                        //tab key is pressed on the last row so hide the dropdown
                        eventPayload.preventDefault();
                        this.hideDropdown();
                        return;
                    }
                }
            }
        },
        setAccessibilityValues: function (value) {
            if (!isEmptyNullUndefined(value)) {
                let containerA11yData = this.view.flxContainer.accessibilityConfig || {};
                containerA11yData.a11yLabel = value;
                this.view.flxContainer.accessibilityConfig = containerA11yData;
            }
        },
    };
});
