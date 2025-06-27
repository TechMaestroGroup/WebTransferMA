define(function () {
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
    // error code to message maps
    let errorCodeMap = new Map([
        ["ERR_AMOUNT_1", kony.i18n.getLocalizedString("i18n.transfers.minMaxAmountError")],
        ["ERR_DATE_1", kony.i18n.getLocalizedString("i18n.transfers.enterValidStartDate")],
        ["ERR_DATE_2", kony.i18n.getLocalizedString("i18n.transfers.enterValidEndDate")],
        ["ERR_DATE_3", kony.i18n.getLocalizedString("i18n.Calendar.startDateGreater")],
    ]);
    const specialCharactersSet = "~#^|$%&*!@()_-+=}{][/|?,.><`':;\"\\";
    const alphabetsSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numericSet = "0123456789";
    return {
        nameRestrictCharactersSet: specialCharactersSet.replace("!@#&*_'-.,", ""),
        AccNoRestrictCharactersSet: specialCharactersSet,
        refNoRestrictCharactersSet: specialCharactersSet,
        payRefRestrictCharactersSet: "",
        minAmtRestrictCharactersSet: alphabetsSet + specialCharactersSet.replace(".", ""),
        maxAmtRestrictCharactersSet: alphabetsSet + specialCharactersSet.replace(".", ""),
        errorCodes: new Set(),
        /**
         * component's constructor function
         * @param {object} baseConfig
         * @param {object} layoutConfig
         * @param {object} pspConfig
         */
        constructor: function (baseConfig, layoutConfig, pspConfig) {
            let scope = this;
            this.view.onKeyPress = this.viewKeyPressHandler;
            this.view.calStartDate.info.isValid = true;
            this.view.calEndDate.info.isValid = true;
            this.view.btnClose.onClick = this.hidePopup;
            this.view.btnCancel.onClick = this.hidePopup;
            this.view.btnSearch.onClick = this.searchClickHandler;
            this.view.tbxMinAmount.onEndEditing = this.validateAmount;
            this.view.tbxMaxAmount.onEndEditing = this.validateAmount;
            this.view.tbxMinAmount.onDone = this.validateAmount;
            this.view.tbxMaxAmount.onDone = this.validateAmount;
            this.view.calStartDate.onSelection = this.validateDate;
            this.view.calStartDate.onDone = this.validateDate;
            this.view.calEndDate.onSelection = this.validateDate;
            this.view.calEndDate.onDone = this.validateDate;
            this.view.calEndDate.info.isValid = true;
            this.view.calStartDate.info.isValid = true;
            this.view.lbxTimePeriod.onSelection = this.showOrHideDateRange;
            this.view.lbxStatus.onSelection = this.setStatusA11y;
            this.view.tbxPayeeName.restrictCharactersSet = this.nameRestrictCharactersSet;
            this.view.tbxAccountNumber.restrictCharactersSet = this.AccNoRestrictCharactersSet;
            this.view.tbxReferenceNumber.restrictCharactersSet = this.refNoRestrictCharactersSet;
            this.view.tbxPaymentReference.restrictCharactersSet = this.payRefRestrictCharactersSet;
            this.view.tbxMinAmount.restrictCharactersSet = this.minAmtRestrictCharactersSet;
            this.view.tbxMaxAmount.restrictCharactersSet = this.maxAmtRestrictCharactersSet;
            this.view.flxGrid.doLayout = this.setHeightToPopup;
            this.view.fromAccComboBox.subscribeToTouchEnd = this.subscribeToTouchEnd;
            this.view.fromAccComboBox.updateTouchEndSubscriber = this.updateTouchEndSubscriber;
            this.view.onTouchEnd = this.formOnTouchEndHandler;
            this.showOrHideDateRange();
            this.isAmountRangeValid = true;
            this.isDateRangeValid = true;
            this.widgetToFocus = null;
            this.errorCodes = new Set();
            this.validatePopup();
            this.setAccessibilityValues();
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
         * sets height and top to popup based on content's height
         */
        setHeightToPopup: function () {
            this.view.flxGrid.info.frame = this.view.flxGrid.frame;
            let buttonsHeight = kony.application.getCurrentBreakpoint() === 640 ? 140 : 80;
            // total height = title + seperator + grid + buttons
            let popupHeight = 50 + 1 + this.view.flxGrid.frame.height + buttonsHeight;
            this.view.flxPopup.height = popupHeight + "px";
            if (popupHeight >= kony.os.deviceInfo().screenHeight) {
                this.view.flxPopup.top = "20px";
                this.view.flxPopup.centerY = "";
            } else {
                this.view.flxPopup.centerY = "50%";
                this.view.flxPopup.top = "";
            }
        },

        /**
         * hides popup if esc is pressed
         * @param {object} eventObject widget object which has fired the keyboard event
         * @param {object} eventPayload keyboard event object
         */
        viewKeyPressHandler: function (eventObject, eventPayload) {
            if (eventPayload.keyCode === 27) {
                // hide popup when esc is pressed
                eventPayload.preventDefault();
                this.hidePopup();
            }
        },

        /**
         * shows the popup and sets focus to title
         */
        showPopup: function () {
            //set default values for the component
            this.view.isVisible = true;
            this.view.lblTitle.setActive(true);
        },

        /**
         * hides the popup
         * @fires onHideCallBack event to the parent
         */
        hidePopup: function () {
            this.view.setVisibility(false);
            if (!isNullUndefined(this.onHideCallBack)) {
                this.onHideCallBack();
            }
        },

        /**
         * context object which will be passed to datamapping or to setContext method
         * @typedef {Object} Context
         * @property {Object} fromAccountContext - from account combobox context
         * @property {Object} payeeNameContext - payee name textbox context
         * @property {Object} payeeAccNoContext - payee account number textbox context
         * @property {Object} referenceNoContext - reference number textbox context
         * @property {Object} paymentReferenceContext - payment reference textbox context
         * @property {Object} amountContext - min and max amount textbox context
         * @property {Object} statusContext - status dropdown context
         * @property {Object} timePeriodContext - timeperiod dropdown context
         * @property {Object} dateRangeContext - from and to calendar context
         */

        /**
         * This method is used to set the context to the component
         * @param {Context} context
         * @returns null
         */
        setContext: function (context) {
            if (isEmptyNullUndefined(context)) {
                return;
            }
            if (!isEmptyNullUndefined(context.fromAccountContext)) {
                this.setFromAccContext(context.fromAccountContext);
            }
            if (!isEmptyNullUndefined(context.payeeNameContext)) {
                this.setPayeeNameContext(context.payeeNameContext);
            }
            if (!isEmptyNullUndefined(context.payeeAccNoContext)) {
                this.setPayeeAccNoContext(context.payeeAccNoContext);
            }
            if (!isEmptyNullUndefined(context.referenceNoContext)) {
                this.setReferenceNoContext(context.referenceNoContext);
            }
            if (!isEmptyNullUndefined(context.paymentReferenceContext)) {
                this.setPaymentReferenceContext(context.paymentReferenceContext);
            }
            if (!isEmptyNullUndefined(context.amountContext)) {
                this.setAmountContext(context.amountContext);
            }
            if (!isEmptyNullUndefined(context.statusContext)) {
                this.setStatusContext(context.statusContext);
            }
            if (!isEmptyNullUndefined(context.timePeriodContext)) {
                this.setTimePeriodContext(context.timePeriodContext);
            }
            if (!isEmptyNullUndefined(context.dateRangeContext)) {
                this.setDateRangeContext(context.dateRangeContext);
            }
            this.isAmountRangeValid = true;
            this.isDateRangeValid = true;
            this.view.calStartDate.info.isValid = true;
            this.view.calEndDate.info.isValid = true;
            this.errorCodes = new Set();
            this.validateAmount();
            this.validateDate();
        },

        /**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
         */
        setFromAccContext: function (context) {
            this.view.fromAccComboBox.setContext(context);
        },

        /**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
         */
        setPayeeNameContext: function (context) {
            if (!isEmptyNullUndefined(context.maxTextLength)) {
                this.view.tbxPayeeName.maxTextLength = context.maxTextLength;
            }
            if (!isEmptyNullUndefined(context.restrictCharactersSet)) {
                this.nameRestrictCharactersSet = context.restrictCharactersSet;
                this.view.tbxPayeeName.restrictCharactersSet = context.restrictCharactersSet;
            }
            if (!isNullUndefined(context.text)) {
                this.view.tbxPayeeName.text = context.text;
            }
        },

        /**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
         */
        setPayeeAccNoContext: function (context) {
            if (!isEmptyNullUndefined(context.maxTextLength)) {
                this.view.tbxAccountNumber.maxTextLength = context.maxTextLength;
            }
            if (!isEmptyNullUndefined(context.restrictCharactersSet)) {
                this.AccNoRestrictCharactersSet = context.restrictCharactersSet;
                this.view.tbxAccountNumber.restrictCharactersSet = context.restrictCharactersSet;
            }
            if (!isNullUndefined(context.text)) {
                this.view.tbxAccountNumber.text = context.text;
            }
        },

        /**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
         */
        setReferenceNoContext: function (context) {
            if (!isEmptyNullUndefined(context.maxTextLength)) {
                this.view.tbxReferenceNumber.maxTextLength = context.maxTextLength;
            }
            if (!isEmptyNullUndefined(context.restrictCharactersSet)) {
                this.refNoRestrictCharactersSet = context.restrictCharactersSet;
                this.view.tbxReferenceNumber.restrictCharactersSet = context.restrictCharactersSet;
            }
            if (!isNullUndefined(context.text)) {
                this.view.tbxReferenceNumber.text = context.text;
            }
        },

        /**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
         */
        setPaymentReferenceContext: function (context) {
            if (!isEmptyNullUndefined(context.maxTextLength)) {
                this.view.tbxPaymentReference.maxTextLength = context.maxTextLength;
            }
            if (!isEmptyNullUndefined(context.restrictCharactersSet)) {
                this.payRefRestrictCharactersSet = context.restrictCharactersSet;
                this.view.tbxPaymentReference.restrictCharactersSet = context.restrictCharactersSet;
            }
            if (!isNullUndefined(context.text)) {
                this.view.tbxPaymentReference.text = context.text;
            }
        },

        /**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
         */
        setAmountContext: function (context) {
            if (!isNullUndefined(context.min)) {
                if (!isEmptyNullUndefined(context.min.maxTextLength)) {
                    this.view.tbxMinAmount.maxTextLength = context.min.MaxTextLength;
                }
                if (!isEmptyNullUndefined(context.min.restrictCharactersSet)) {
                    this.minAmtRestrictCharactersSet = context.min.restrictCharactersSet;
                    this.view.tbxMinAmount.restrictCharactersSet = context.min.restrictCharactersSet;
                }
                if (!isNullUndefined(context.min.text)) {
                    this.view.tbxMinAmount.text = context.min.text;
                }
            }
            if (!isNullUndefined(context.max)) {
                if (!isEmptyNullUndefined(context.max.maxTextLength)) {
                    this.view.tbxMaxAmount.maxTextLength = context.max.maxTextLength;
                }
                if (!isEmptyNullUndefined(context.max.restrictCharactersSet)) {
                    this.maxAmtRestrictCharactersSet = context.max.restrictCharactersSet;
                    this.view.tbxMaxAmount.restrictCharactersSet = context.max.restrictCharactersSet;
                }
                if (!isNullUndefined(context.max.text)) {
                    this.view.tbxMaxAmount.text = context.max.text;
                }
            }
        },

        /**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
         */
        setStatusContext: function (context) {
            if (!isEmptyNullUndefined(context.masterData)) {
                this.view.lbxStatus.masterData = context.masterData;
            }
            if (!isEmptyNullUndefined(context.selectedKey)) {
                this.view.lbxStatus.selectedKey = context.selectedKey;
                this.setStatusA11y();
            }
        },
        setStatusA11y: function () {
            let statusA11y = this.view.lbxStatus.accessibilityConfig || {};
            statusA11y.a11yLabel = "Currently selected " + this.view.lbxStatus.selectedKeyValue[1] + ". Click to show more status";
            this.view.lbxStatus.accessibilityConfig = statusA11y;
        },

        /**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
         */
        setTimePeriodContext: function (context) {
            if (!isEmptyNullUndefined(context.masterData)) {
                this.view.lbxTimePeriod.masterData = context.masterData;
            }
            if (!isEmptyNullUndefined(context.selectedKey)) {
                this.view.lbxTimePeriod.selectedKey = context.selectedKey;
                this.showOrHideDateRange();
            }
        },

        /**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
         */
        setDateRangeContext: function (context) {
            if (!isNullUndefined(context.fromDate)) {
                if (!isEmptyNullUndefined(context.fromDate.validStartDate)) {
                    this.view.calStartDate.validStartDate = context.fromDate.validStartDate;
                }
                if (!isEmptyNullUndefined(context.fromDate.validEndDate)) {
                    this.view.calStartDate.validEndDate = context.fromDate.validEndDate;
                }
                if (!isEmptyNullUndefined(context.fromDate.dateFormat)) {
                    this.view.calStartDate.dateFormat = context.fromDate.dateFormat;
                }
                if (!isEmptyNullUndefined(context.fromDate.dateComponents)) {
                    this.view.calStartDate.dateComponents = context.fromDate.dateComponents;
                }
            }
            if (!isNullUndefined(context.toDate)) {
                if (!isEmptyNullUndefined(context.toDate.validStartDate)) {
                    this.view.calEndDate.validStartDate = context.toDate.validStartDate;
                }
                if (!isEmptyNullUndefined(context.toDate.validEndDate)) {
                    this.view.calEndDate.validEndDate = context.toDate.validEndDate;
                }
                if (!isEmptyNullUndefined(context.toDate.dateFormat)) {
                    this.view.calEndDate.dateFormat = context.toDate.dateFormat;
                }
                if (!isEmptyNullUndefined(context.toDate.dateComponents)) {
                    this.view.calEndDate.dateComponents = context.toDate.dateComponents;
                }
            }
        },

        /**
         * is triggered when search is clicked
         * @fires searchClickCallBack event to the parent
         */
        searchClickHandler: function () {
            if (!isNullUndefined(this.searchClickCallBack)) {
                let options = this.getSearchOptions();
                this.searchClickCallBack(options);
            }
            this.hidePopup();
        },

        /**
         * sets error skin to textboxes
         * @param {object} widgetScope
         */
        setErrorTextBoxSkin: function (widgetScope) {
            widgetScope.skin = "ICSknTextBoxEE0005";
        },

        /**
         * reset the original skin of the textbox
         * @param {object} widgetScope
         */
        resetTextBoxSkin: function (widgetScope) {
            widgetScope.skin = "ICSknTxtE3E3E3Border1px424242SSPRegular15px";
        },
        /**
         * sets error skin to textboxes
         * @param {object} widgetScope
         */
        setErrorCalSkin: function (widgetScope) {
            widgetScope.skin = "sknCalError";
        },

        /**
         * reset the original skin of the calendar
         * @param {object} widgetScope
         */
        setRegularCalSkin: function (widgetScope) {
            widgetScope.skin = "sknCalNormal";
        },

        /**
         * method to validate amount fields
         */
        validateAmount: function () {
            this.view.tbxMinAmount.text = this.formatAmount(this.view.tbxMinAmount.text);
            this.view.tbxMaxAmount.text = this.formatAmount(this.view.tbxMaxAmount.text);
            let minAmount = parseFloat(this.view.tbxMinAmount.text);
            minAmount = isNaN(minAmount) ? "" : minAmount;
            let maxAmount = this.view.tbxMaxAmount.text;
            maxAmount = isNaN(maxAmount) ? "" : maxAmount;
            this.isAmountRangeValid = true;
            if (minAmount !== "" && maxAmount !== "" && minAmount > maxAmount) {
                this.isAmountRangeValid = false;
                this.errorCodes.add("ERR_AMOUNT_1");
                this.setErrorTextBoxSkin(this.view.tbxMinAmount);
                this.setErrorTextBoxSkin(this.view.tbxMaxAmount);
                if (this.widgetToFocus === null) {
                    this.widgetToFocus = this.view.tbxMinAmount;
                }
            } else {
                this.errorCodes.delete("ERR_AMOUNT_1");
                this.resetTextBoxSkin(this.view.tbxMinAmount);
                this.resetTextBoxSkin(this.view.tbxMaxAmount);
                if (this.widgetToFocus !== null && this.widgetToFocus.id === "tbxMinAmount") {
                    this.widgetToFocus = null;
                }
            }
            this.validatePopup();
        },

        /**
         * formats number to x.xx format
         * @param {String} text
         */
        formatAmount: function (text) {
            if (isEmptyNullUndefined(text)) {
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
                finalAmount = finalAmount + "." + postDot.substring(0, 2);
            }
            return finalAmount;
        },

        /**
         * method to validate calendar range
         * @param {object} calendar
         * @param {*} isValid
         */
        validateDate: function (calendar, isValid) {
            if (!isEmptyNullUndefined(calendar)) {
                calendar.info.isValid = isValid;
            }
            if (!this.view.calStartDate.info.isValid) {
                this.errorCodes.add("ERR_DATE_1");
                this.setErrorCalSkin(this.view.calStartDate);
                if (this.widgetToFocus === null) {
                    this.widgetToFocus = this.view.calStartDate;
                }
            } else {
                this.errorCodes.delete("ERR_DATE_1");
                this.setRegularCalSkin(this.view.calStartDate);
                if (this.widgetToFocus !== null && this.widgetToFocus.id === "calStartDate") {
                    this.widgetToFocus = null;
                }
            }
            if (!this.view.calEndDate.info.isValid) {
                this.errorCodes.add("ERR_DATE_2");
                this.setErrorCalSkin(this.view.calEndDate);
                if (this.widgetToFocus === null) {
                    this.widgetToFocus = this.view.calEndDate;
                }
            } else {
                this.errorCodes.delete("ERR_DATE_2");
                this.setRegularCalSkin(this.view.calEndDate);
                if (this.widgetToFocus !== null && this.widgetToFocus.id === "calEndDate") {
                    this.widgetToFocus = null;
                }
            }
            if (
                this.view.calStartDate.info.isValid &&
                this.view.calStartDate.info.isValid &&
                !isNullUndefined(this.view.calStartDate.dateComponents) &&
                !isNullUndefined(this.view.calEndDate.dateComponents)
            ) {
                let startDate = this.getDateObjectFromWidget(this.view.calStartDate);
                let endDate = this.getDateObjectFromWidget(this.view.calEndDate);
                if (startDate > endDate) {
                    this.errorCodes.add("ERR_DATE_3");
                    this.setErrorCalSkin(this.view.calStartDate);
                    this.setErrorCalSkin(this.view.calEndDate);
                    if (this.widgetToFocus === null) {
                        this.widgetToFocus = this.view.calStartDate;
                    }
                } else {
                    this.errorCodes.delete("ERR_DATE_3");
                    this.setRegularCalSkin(this.view.calStartDate);
                    this.setRegularCalSkin(this.view.calEndDate);
                    if (this.widgetToFocus !== null && this.widgetToFocus.id === "calStartDate") {
                        this.widgetToFocus = null;
                    }
                }
            }
            this.validatePopup();
        },

        /**
         * validates the input elements to popup
         */
        validatePopup: function () {
            if (this.errorCodes.size === 0) {
                this.view.flxError.setVisibility(false);
                this.enableButton(this.view.btnSearch);
                this.widgetToFocus = null;
            } else {
                this.view.rtxError.text = this.getErrorMessage();
                this.view.flxError.setVisibility(true);
                this.disableButton(this.view.btnSearch);
                if (this.widgetToFocus !== null) {
                    // this.widgetToFocus.setActive(true);
                }
            }
        },

        /**
         * returns error messages for error codes
         * @returns string
         */
        getErrorMessage: function () {
            if (this.errorCodes.length === 0) {
                return "";
            }
            let errorMsgs = "<ul>";
            this.errorCodes.forEach((code) => {
                errorMsgs = errorMsgs + "<li>" + errorCodeMap.get(code) + "</li>";
            });
            errorMsgs = errorMsgs + "</ul>";
            return errorMsgs;
        },

        /**
         * returns search options entered by user in the popup
         * @returns object
         */
        getSearchOptions: function () {
            let searchOptions = {};
            searchOptions.fromAccount = this.view.fromAccComboBox.getSelectedAccount();
            searchOptions.payeeName = this.view.tbxPayeeName.text;
            searchOptions.payeeAccNo = this.view.tbxAccountNumber.text;
            searchOptions.referenceNo = this.view.tbxReferenceNumber.text;
            searchOptions.paymentRef = this.view.tbxPaymentReference.text;
            searchOptions.minAmount = this.view.tbxMinAmount.text;
            searchOptions.maxAmount = this.view.tbxMaxAmount.text;
            searchOptions.status = this.view.lbxStatus.selectedKeyValue;
            searchOptions.timePeriod = this.view.lbxTimePeriod.selectedKeyValue;
            searchOptions.fromDate = {
                dateComponents: this.view.calStartDate.dateComponents,
                dateObject: this.getDateObjectFromWidget(this.view.calStartDate),
                formattedDate: this.view.calStartDate.formattedDate,
            };
            searchOptions.toDate = {
                dateComponents: this.view.calEndDate.dateComponents,
                dateObject: this.getDateObjectFromWidget(this.view.calEndDate),
                formattedDate: this.view.calEndDate.formattedDate,
            };
            return searchOptions;
        },

        /**
         * returns date object when a calendar is sent as parameter
         * @param {object} calendar - calendar widget
         * @returns
         */
        getDateObjectFromWidget: function (calendar) {
            if (isEmptyNullUndefined(calendar)) {
                return;
            }
            let [day, month, year, hours, minutes, seconds] = calendar.dateComponents;
            return new Date(year, month, day, hours, minutes, seconds);
        },

        /**
         * displays date range if custom range is selected
         * or hides the range if anything else is selected
         */
        showOrHideDateRange: function () {
            this.setTimePeriodA11y();
            if (this.view.lbxTimePeriod.selectedKey === "Custom") {
                this.view.flxDateRange.setVisibility(true);
                this.validateDate();
            } else {
                this.view.flxDateRange.setVisibility(false);
                if (this.errorCodes) {
                    this.errorCodes.delete("ERR_DATE_1");
                    this.errorCodes.delete("ERR_DATE_2");
                    this.errorCodes.delete("ERR_DATE_3");
                    this.validatePopup();
                }
            }
        },
        setTimePeriodA11y: function () {
            let timePeriodA11y = this.view.lbxTimePeriod.accessibilityConfig || {};
            timePeriodA11y.a11yLabel = "Currently selected " + this.view.lbxTimePeriod.selectedKeyValue[1] + ". Click to show more time periods";
            this.view.lbxTimePeriod.accessibilityConfig = timePeriodA11y;
        },
        touchEndSubscribers: new Map(),

        /**
         * handles form on touch end event
         */
        formOnTouchEndHandler: function () {
            //when a user clicks on dropdown item onTouchEnd is triggered first and click is not registered
            //this delay postpones the onTouchEnd so that the click is registered
            kony.timer.schedule("touchEndTimer", this.hideSubscribedWidgetsIfVisible, 0.1, false);
        },

        /**
         * hides subscribed widgets if they are visible
         */
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

        /**
         * subscribe to form's on touch end
         * @param {String} subscriberKey
         * @param {Object} subscriberValue
         * @returns boolean
         */
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

        /**
         * this method is called when a subscriber wants to retain the visibility of the popup/dropdown
         * @param {String} subscriberKey
         * @param {Object} subscriberValue
         * @returns boolean
         */
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

        /**
         * enables the button
         */
        enableButton: function (btnWidget) {
            btnWidget.setEnabled(true);
            btnWidget.skin = "sknbtnSSPffffff0278ee15pxbr3px";
        },

        /**
         * disables the button
         */
        disableButton: function (btnWidget) {
            btnWidget.setEnabled(false);
            btnWidget.skin = "ICSknbtnDisablede2e9f036px";
        },

        /**
         * sets accessibility values to popup widgets
         */
        setAccessibilityValues: function () {
            this.view.btnClose.accessibilityConfig = {
                a11yARIA: {
                    "aria-label": kony.i18n.getLocalizedString("i18n.settings.closeDeletePopup"),
                },
            };
            this.view.tbxPayeeName.accessibilityConfig = {
                a11yARIA: {
                    "aria-labelledby": "lblPayeeName",
                },
            };
            this.view.tbxAccountNumber.accessibilityConfig = {
                a11yARIA: {
                    "aria-labelledby": "lblAccountNumber",
                },
            };
            this.view.tbxReferenceNumber.accessibilityConfig = {
                a11yARIA: {
                    "aria-labelledby": "lblReferenceNumber",
                },
            };
            this.view.tbxPaymentReference.accessibilityConfig = {
                a11yARIA: {
                    "aria-labelledby": "lblPaymentReference",
                },
            };
            this.view.tbxMinAmount.accessibilityConfig = {
                a11yARIA: {
                    "aria-label": "Enter the minimum amount",
                },
            };
            this.view.tbxMaxAmount.accessibilityConfig = {
                a11yARIA: {
                    "aria-label": "Enter the maximum amount",
                },
            };
            this.view.lbxStatus.accessibilityConfig = {
                a11yARIA: {
                    "aria-labelledby": "lblStatus",
                },
            };
            this.view.lbxTimePeriod.accessibilityConfig = {
                a11yARIA: {
                    "aria-labelledby": "lblTimePeriod",
                },
            };
            this.view.calStartDate.accessibilityConfig = {
                a11yARIA: {
                    "aria-label": "Enter the start Date",
                },
            };
            this.view.calEndDate.accessibilityConfig = {
                a11yARIA: {
                    "aria-label": "Enter the end Date",
                },
            };
            this.view.flxError.accessibilityConfig = {
                a11yARIA: {
                    role: "alert",
                },
            };
        },
    };
});
