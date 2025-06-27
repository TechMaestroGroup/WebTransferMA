define(["CommonUtilities"], function (CommonUtilities) {
	// This Component used to setting the data for the bottom menu
 
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

	return {
		constructor: function(baseConfig, layoutConfig, pspConfig) {
			this.segStatusList = [];
			this.selectedRowItem = [];
			this.view.flxImgClose.onClick = this.hidePopup;
			this.view.segBottomSheet.onRowClick = this.onStatusSelection;
			this.view.calStartDate.onSelection = this.fromDateChange;
			this.view.calEndDate.onSelection = this.toDateChange;
			this.view.calStartDate.onDone = this.fromDateChange;
			this.view.calEndDate.onDone = this.toDateChange;
		},
		//Logic for getters/setters of custom properties
		initGettersSetters: function() {
            defineGetter(this, 'dataMapping', () => {
                return this._dataMapping;
            });
            defineSetter(this, 'dataMapping', value => {
                this._dataMapping = value;
				this.setContext(value);
            });
        },

		/**
         * shows the popup and sets focus to title
         */
        showPopup: function () {
            //set default values for the component
            this.view.isVisible = true;
        },

		/**
         * hides the popup
         * @fires onDismissCallBack event to the parent
         */
        hidePopup: function (selectedRowItem) {
			if(this.selectedRowItem.lblBottomSheet === kony.i18n.getLocalizedString("kony.mb.PFM.CustomDateRange")){
				this.selectedRowItem.startDate.formattedStartDate = this.view.calStartDate.date;
				this.selectedRowItem.endDate.formattedStartDate = this.view.calEndDate.date;
				this.selectedRowItem.startDate.startDateComp = this.view.calStartDate.dateComponents;
				this.selectedRowItem.endDate.endDateComp = this.view.calEndDate.dateComponents;
				this.selectedRowItem.dateToDisplay = this.view.calStartDate.date + " - " + this.view.calEndDate.date;
			}
			selectedRowItem = this.selectedRowItem;
            this.view.setVisibility(false);
            if (!isNullUndefined(this.onDismissCallBack)) {
                this.onDismissCallBack(selectedRowItem);
            }
        },

		fromDateChange: function() {
			this.view.calEndDate.validStartDate = this.view.calStartDate.dateComponents;
		},

		toDateChange: function(){
			this.view.calStartDate.validEndDate = this.view.calEndDate.dateComponents;
		},

		/**
		* Method to Enable the date skin
		*/
		dateSkinEnable: function() {
			this.view.flxDateRange.setEnabled(true);
			this.view.calStartDate.skin = 'sknCal42424226px';
			this.view.calEndDate.skin = 'sknCal42424226px';	
		},

		/**
		* Method to Disable the date skin
		*/
		dateSkinDisable: function() {
			this.view.flxDateRange.setEnabled(false);
			this.view.calStartDate.skin = 'skncalendarDisabled';
			this.view.calEndDate.skin = 'skncalendarDisabled';
		},

		/**
		* Invoke on Selection of the status/Time period row
		*/
		onStatusSelection: function() {
			if(!isEmptyNullUndefined(this.view.segBottomSheet.selectedRowItems[0])) {
			  this.selectedRowItem = this.view.segBottomSheet.selectedRowItems[0];
			  let result = this.showGreenTickOnSelectedRow(this.selectedRowItem); // Function to show green tick for selected row
			  this.view.segBottomSheet.setData(result); // Setting the filteredData
			  if(this.selectedRowItem.lblBottomSheet === kony.i18n.getLocalizedString("kony.mb.PFM.CustomDateRange")){
				this.dateSkinEnable();
			  } else {
				this.dateSkinDisable();
				this.hidePopup(this.selectedRowItem);
			  }
			}
		  },

		/**
         * This method is used to set the context to the component
         * @param {Context} context
         * @returns null
        */
		setContext: function (context) {
			this.segStatusList = [];
			this.selectedRowItem = [];
			if (isEmptyNullUndefined(context)) {
				return;
			}
			if (!isEmptyNullUndefined(context.dateRangeContext)) {
                this.setDateRangeContext(context.dateRangeContext);
            }
			if(!isEmptyNullUndefined(context.selectedField)){
				if(context.selectedField === "Status"){
					this.setBottomContext(context.statusContext);
				} else if(context.selectedField === "ViewBy"){
					this.setBottomContext(context.viewBy);
				} else {
					this.setBottomContext(context.timePeriodContext);
				}
			}
		},

		setDateRangeContext: function(context) {
			if (!isNullUndefined(context.fromDate)) {
				this.view.calStartDate.validStartDate;
				this.view.calStartDate.validEndDate = new Date();
				this.view.calStartDate.dateComponents = context.fromDate.dateComponents;
            }
            if (!isNullUndefined(context.toDate)) {
                this.view.calEndDate.validStartDate = this.view.calStartDate.dateComponents;
                this.view.calEndDate.validEndDate = new Date();
                this.view.calEndDate.dateComponents = context.toDate.dateComponents;
            }
		},

		/**
         * sets context to input widget
         * @param {object} context - contains data to be set to the input widgets
        */
        setBottomContext: function (context) {
            if (!isEmptyNullUndefined(context.masterData)) {
				this.segStatusList = context.masterData;
				if (!isEmptyNullUndefined(context.headerContext)) {
					this.view.lblBottomSheetHeader.text = context.headerContext;
					if(context.headerContext === kony.i18n.getLocalizedString("i18n.common.status")){
						//this.view.segBottomSheet.height = "360dp";
						this.view.flxDateRange.isVisible = false;
					}else if(context.headerContext === kony.i18n.getLocalizedString("kony.mb.AlertSettings.ViewBy")){
						this.view.flxDateRange.isVisible = false;
					} else {
						//this.view.segBottomSheet.height = "250dp";
						this.view.flxDateRange.isVisible = true;
						this.view.flxDateRange.setEnabled(false);
					}
				}
            	this.view.segBottomSheet.widgetDataMap = this.getWidgetDataMap(); //Widget Mapping
				if (!isNullUndefined(context.selectedRow)) {
					let result = this.showGreenTickOnSelectedRow(context.selectedRow); // Function to show green tick for selected row
					if(context.selectedRow.lblBottomSheet === kony.i18n.getLocalizedString("kony.mb.PFM.CustomDateRange")){
						this.dateSkinEnable();										
						this.view.segBottomSheet.setData(result); // Setting the filteredData
						this.view.calStartDate.dateComponents = context.selectedRow.startDate.startDateComp;
						this.view.calEndDate.dateComponents = context.selectedRow.endDate.endDateComp;
					} else {
						this.dateSkinDisable();
						this.view.segBottomSheet.setData(result); // Setting the filteredData
					}
				} else {
					this.view.segBottomSheet.setData(this.segStatusList);
				}
            }
        },

		/**
		 * @function : showGreenTickOnSelectedRow
		 * @description : Invoke to show Tick Icon on selcted Status
		*/
		showGreenTickOnSelectedRow: function(selectedRowItem) {
			let filteredData = this.segStatusList; 
			if(!isEmptyNullUndefined(selectedRowItem)){
				filteredData.forEach((record) => {
				if (record.key === selectedRowItem.key) {
					record.imgSelect.isVisible = true;
					record.imgSelect.src = "new_tickmark.png";
				}   
				else {
					record.imgSelect.isVisible = false;
					record.imgSelect.src = "transparent.png";
				}
				});
			}
			else {
				return filteredData;
			}
			return filteredData;
		},

		/**
		 * @function : getWidgetDataMap
		 * @description : Get the widget datamappings 
		*/
		getWidgetDataMap: function(){
			var scope = this;
			try {
				var dataMapping = {
				"flxTransfersBottomSheet" : "flxTransfersBottomSheet",
				"lblSeperator1" : "lblSeperator1",
				"flxImgSelect" : "flxImgSelect",
				"imgSelect" : "imgSelect",
				"lblBottomSheet" : "lblBottomSheet",
				};
				return dataMapping;
			} catch (err) {
				var errorObj = {
					"level": "ComponentController",
					"method": "getWidgetDataMap",
					"error": err
				};
				this.onError(errorObj);
			}
		},
	};
});