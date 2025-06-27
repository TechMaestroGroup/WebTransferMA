define(['CampaignUtility','CommonUtilities'], function(CampaignUtility,CommonUtilities){
  return{
    ACCOUNTS_COUNT_CONFIG : parseInt(applicationManager.getConfigurationManager().getConfigurationValue('accsCountCompactDashboard')) || 10,
    searchApplied : false,
    isSingleCustomerProfile : applicationManager.getUserPreferencesManager().isSingleCustomerProfile,
    isBusinessAccountListValue : "",
    filterFromAccounts : "Loan,CreditCard",
    filterType : "accountType",
    segFromAccountsData : "",
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
      var self = this;
      if (kony.os.deviceInfo().name === "iPhone") {
        this.view.flxHeader.isVisible = false;
        this.view.flxMainContainer.top = "0dp";
      } else {
        this.view.flxMainContainer.top = "56dp";
      }
      this.initActions(); // Initialize the actions 
      applicationManager.getPresentationUtility().dismissLoadingScreen();
    },

    /**
      Initializing the Actions
    */
    initActions: function() {
      var scope = this;
      this.resetUI();
      this.view.customHeader.flxBack.onClick = this.backNavigation.bind(this);
      this.view.segAccountList.onRowClick = this.onAccountSelection.bind(this);
      this.view.tbxSearch.onTextChange = this.showSearch.bind(this);
      this.view.imgSearchClose.onTouchEnd = this.cancelSearch.bind(this);
    },

    /**
     * @function : cancelSearch
     * @description : Invoked to set the UI on click on search cancel
    */
    cancelSearch: function(){
      this.resetUI();
    },

    /**
     * @function : showSearch
     * @description : Invoked to filter the searched data and set in segmentUI
    */
    showSearch: function() {
      var self = this;
      try {
        this.view.imgSearchClose.setVisibility(true);
        var searchTxt = this.view.tbxSearch.text.toLowerCase();
        this.searchApplied = false;
        if (searchTxt !== "") {
          var result = [];
          var data = this.filteredFromAcc;
          for (var i = 0; i < data.length; i++) {
            if (data[i].accountName.toLowerCase().indexOf(searchTxt) !== -1 || 
                  data[i].accountID.toLowerCase().indexOf(searchTxt) !== -1) {
              result.push(data[i]);
            }
          }
          if (!(result.length > 0)) {
            this.view.segAccountList.setVisibility(false);
            this.view.flxNoBeneficiaries.setVisibility(true);
          } else {
            this.searchApplied = true;
            this.filteredFromAcc = result;
            this.setAccountSeg();
          }
        } else {
          this.resetUI();
        }
      } catch (err) {
        scope.onError(err);
      }
    },

    /**
     * @function : resetUI
     * @description : Reset the UI
    */
    resetUI: function() {
      this.searchApplied = false;
      this.view.segAccountList.setVisibility(true);
      this.view.segAccountList.removeAll();
      this.view.flxNoBeneficiaries.setVisibility(false);
      this.view.imgSearchClose.isVisible = false;
      this.view.tbxSearch.text = "";
      this.setAccountSeg(); // Account list Segment UI 
    },

    /**
     * @function : onAccountSelection
     * @description : Invoke on account row selected
    */
    onAccountSelection: function () {
      var navMan = applicationManager.getNavigationManager();
      var entryPoint = navMan.getEntryPoint("AccountSearch");
      if (!this.isEmptyNullUndefined(this.view.segAccountList.selectedRowItems[0])) {
        var selectedRowItem = this.view.segAccountList.selectedRowItems[0];
        if (entryPoint === "frmTransferActivitiesTransfersEurope") {
          this.ManageActivitiesPresenter.filterTransfersBasedOnAccount(selectedRowItem);
          var navManager = applicationManager.getNavigationManager();
          navManager.navigateTo({ "appName": "TransfersMA", "friendlyName": "ManageActivitiesUIModule/frmTransferActivitiesTransfersEurope" });
        } else {
          this.ManageActivitiesPresenter.setSelectedFromAccount(selectedRowItem);
          this.backNavigation();
        }
      }
    },

    /**
     * @function : setAccountSeg
     * @description : Setting the account list segment UI
    */
    setAccountSeg: function() {
      var scope = this;
      try {
        var navMan = applicationManager.getNavigationManager();
        let fromAccountList = navMan.getCustomInfo("frmAccountSearch");
        if(!this.isEmptyNullUndefined(fromAccountList)) {
          this.view.segAccountList.widgetDataMap = this.getWidgetDataMap();
          var segRecords = this.getFromAccountDataMapping(fromAccountList);
          this.view.segAccountList.setVisibility(true);
          this.view.flxNoBeneficiaries.setVisibility(false);
          var sectionalData = this.getFromAccountsByAccountType(segRecords);

          // Expand first section and collapse others if accounts length > accsCountCompactDashboard
          if (!(this.searchApplied) && (segRecords.length > this.ACCOUNTS_COUNT_CONFIG)) {
            this.collapseAllSectionsExceptFirst(sectionalData);
          } else {
            this.view.segAccountList.setData(sectionalData);
          }
        }
        else {
          this.view.segAccountList.setVisibility(false);
          this.view.flxNoBeneficiaries.setVisibility(true);
          this.view.lblNoResult.text = kony.i18n.getLocalizedString("kony.mb.OB.NoRecordsAvailable");
        }
      } catch (err) {
        scope.onError(err);
      }
    },

    /**
     * @function : collapseAllSectionsExceptFirst
     * @description : Invoke to collapse the first row if account list large
    */
    collapseAllSectionsExceptFirst: function (segmentData) {
      try {
        if (this.segFromAccountsData === '') {
          this.segFromAccountsData = JSON.parse(JSON.stringify(segmentData));
        }

        for (let sectionIndex = 1; sectionIndex < segmentData.length; sectionIndex++) {
          let currentHeaderData = segmentData[sectionIndex][0];
          if (currentHeaderData["imgChevron"] === "arrowup.png") {
            currentHeaderData["imgChevron"] = "arrowdown.png";
            segmentData[sectionIndex][1] = [];
            this.view.segAccountList.setData(segmentData);
          }
        }
      } catch (err) {
        scope.onError(err);
      }
    },

    /**
     * @function : rowExpandCollapse
     * @description : Invoke to collapse the customer group data
    */
    rowExpandCollapse : function(context){
      var scope = this;
      try{
        var sectionIndex = context.section;
        if (this.segFromAccountsData === '') {
          this.segFromAccountsData = JSON.parse(JSON.stringify(this.view.segAccountList.data));
        }
        var data = this.view.segAccountList.data;
        var selectedHeaderData = data[sectionIndex][0];
        if (!JSON.stringify(data).includes("flxNoRecords")) {
          if (selectedHeaderData["imgChevron"] === "arrowup.png") {
            selectedHeaderData["imgChevron"] = "arrowdown.png";
            data[sectionIndex][1] = [];
            this.view.segAccountList.setData(data);
          } else {
            selectedHeaderData["imgChevron"] = "arrowup.png";
            data[sectionIndex][1] = this.segFromAccountsData[sectionIndex][1];
            this.view.segAccountList.setData(data);
          }
        }
      }catch (err) {
        scope.onError(err);
      }
    },

    /**
     * @function : getFromAccountsByAccountType
     * @description : Invoke to filter accounts based on accountType
    */
    getFromAccountsByAccountType : function(accountsData){
      var scope = this;
      var fromAccountsData=[];
      fromAccountsData =scope.groupBusinessAndRetail(accountsData);
      if (scope.searchApplied) {
        // To hide segment header in search results
        return fromAccountsData;
      } else {
        var fromAccountsDataKeys = Object.keys(fromAccountsData);
        var sectionData = [];
        for (var i = 0; i < fromAccountsDataKeys.length; i++) {
          var fromData = {};
          if( this.isSingleCustomerProfile ) {
            if(fromAccountsDataKeys[i]=="Savings" ||fromAccountsDataKeys[i]=="Checking"||fromAccountsDataKeys[i]=="Deposit"
              ||fromAccountsDataKeys[i]=="Loan"||fromAccountsDataKeys[i]=="Credit Card" || fromAccountsDataKeys[i]=="Favourite")
            {
              fromData=[
                {"lblHeaderName":{
                  "text" :fromAccountsDataKeys[i]+" Accounts  ("+fromAccountsData[fromAccountsDataKeys[i]].length+")",
                  "skin":"sknLbl424242SSPReg33px"
                }, 
                 "imgChevron": "arrowup.png",                 
                 "flxUnifiedTransferHeader":{"skin":"ICSknFlxF6F6F6"},
                 "flxUpShadow":{"skin":"ICSknFlxShadow000fff"}                           
                },fromAccountsData[fromAccountsDataKeys[i]]
              ]
              sectionData.push(fromData);
            }
          }
          else {
            let headerText;
            let currentDataKey = fromAccountsDataKeys[i];
            // Display CustomerName - CustomerId for accounts grouped by customer
            if (currentDataKey !== "Favourite" && fromAccountsData[currentDataKey][0] &&
              fromAccountsData[currentDataKey][0].formattedMembershipName) {
              let membershipName = fromAccountsData[currentDataKey][0].formattedMembershipName;
              // Truncation logic if membership name exceeds 30 chars
              if (membershipName.length > 30 && membershipName.includes("-")) {
                let membershipNameParts = membershipName.split("-");
                membershipName = applicationManager.getPresentationUtility().formatText(membershipNameParts[0], 24, membershipNameParts[1], 4);
              }
              headerText = membershipName + "  (" + fromAccountsData[currentDataKey].length + ")";
            } else if (currentDataKey === "Favourite") {
              headerText = currentDataKey + " Accounts (" + fromAccountsData[currentDataKey].length + ")";
            } else {
              headerText = currentDataKey + "  (" + fromAccountsData[currentDataKey].length + ")";
            }

            fromData = [{
              "lblHeaderName": {
                "text": headerText,
                "skin": "sknLbl424242SSPReg33px"
              },
              "imgChevron": "arrowup.png",
              "flxUnifiedTransferHeader": {
                "skin": "ICSknFlxF6F6F6"
              },
              "flxUpShadow": {
                "skin": "ICSknFlxShadow000fff"
              }
            }, fromAccountsData[fromAccountsDataKeys[i]]];
            sectionData.push(fromData);
          }
        } 
        return  sectionData;
      }
    },

    /**     
    * Component groupBusinessAndRetail
    * To group business and retail accounts
    */
    groupBusinessAndRetail: function (accountsData) {
      var scope = this;
      try {
        var fromAccountsData = [];
        //accountsData = scope.filterDataBasedOnPermissions(accountsData, this.context.transferType);
        if (!this.isEmptyNullUndefined(accountsData)) {
          var businessAccountsList = [];
          var personalAccountsList = [],
            i = 0,
            k = 0;

          for (var j = 0; j < accountsData.length; j++) {
            if (accountsData[j]["isBusinessAccount"] == "true") {
              businessAccountsList[i] = accountsData[j];
              i++;
            } else {
              personalAccountsList[k] = accountsData[j];
              k++;
            }
          }

          if (businessAccountsList.length > 0 && !(scope.searchApplied)) {
            this.isBusinessAccountListValue = true;
            scope.filteredFromAcc = businessAccountsList;
            fromAccountsData = scope.groupResponseData(businessAccountsList, "fromMembershipName");
            if (personalAccountsList.length > 0) {
              scope.filteredFromAcc = businessAccountsList.concat(personalAccountsList);
              fromAccountsData["Personal Accounts"] = personalAccountsList;
            }
            fromAccountsData = this.groupFavouriteAccounts(fromAccountsData);
          } else if (personalAccountsList.length > 0 && this.isBusinessAccountListValue == true) {
            fromAccountsData["Personal Accounts"] = personalAccountsList;
          } else if (!(this.isSingleCustomerProfile) && !(scope.searchApplied)) {
            // For multi customer accounts, group accounts by customer
            scope.filteredFromAcc = this.filterRecordsList(accountsData);
            fromAccountsData = scope.groupResponseData(scope.filteredFromAcc, "fromMembershipName");
            fromAccountsData = this.groupFavouriteAccounts(fromAccountsData);
          }
        }

        if (this.isBusinessAccountListValue != true && (this.isSingleCustomerProfile) && !(scope.searchApplied)) {
          scope.filteredFromAcc = this.filterRecordsList(accountsData);
          fromAccountsData = this.groupResponseData(scope.filteredFromAcc, "accountType");
          fromAccountsData = this.groupFavouriteAccounts(fromAccountsData);
        }
        if (scope.searchApplied){
          fromAccountsData = JSON.parse(JSON.stringify(this.filteredFromAcc));
        }

        return fromAccountsData;
      } catch (err) {
        scope.onError(err);
      }
    },

    /**
     * @function : filterRecordsList
     * @description : Invoke to filter accounts based on Customer
    */
    filterRecordsList : function(data){
      var self = this;
      try{
          if(self.filterFromAccounts && self.filterType){
            var filterList = self.filterFromAccounts.split(",");
            var filterVariable = self.filterType;
            var filteredRecords =data.filter(function (record) {
              var removeRecord =  false;
              for(var i=0;i<filterList.length;i++){
                if(record[filterVariable] === filterList[i])
                {
                  removeRecord =  true;
                }
              }  
              return !removeRecord;
            });
            data = filteredRecords;
          }
          return data;
      }
      catch (err) {
        scope.onError(err);
      }
    },

    /**
     * @function : groupFavouriteAccounts
     * @description : Invoke to filter favourite accounts
    */
    groupFavouriteAccounts: function (accounts) {
      let responseAccounts = {};
      let favouriteAccounts = [];

      for (let accountType in accounts) {
        accounts[accountType].forEach(account => {
          if (account.favouriteStatus === "1") {
            favouriteAccounts.push(account);
          }
        });
      }

      if (favouriteAccounts.length > 0) {
        responseAccounts["Favourite"] = favouriteAccounts;
      }

      for (let accountType in accounts) {
        if (accounts[accountType].length > 0) {
          responseAccounts[accountType] = accounts[accountType];
        }
      }
      return responseAccounts;
    },

    /**
     * @function : groupResponseData
     * @description : Invoke to group based on membershipName
    */
    groupResponseData : function (data, key) {
      var self = this;
      try{
        if(data!==undefined && data!="" && data!=null)
          return data.reduce(function (value, obj) {
            (value[obj[key]] = value[obj[key]] || []).push(obj);
            return value;
          }, {});
        else return {};
      }catch (err) {
        scope.onError(err);
      }
    },

    /**
     * @function : getFromAccountDataMapping
     * @description : From account data mapping
    */
    getFromAccountDataMapping: function(accounts) {
      accounts.map(function(account){
        account["formattedAccountName"] = {
          text : account.accountID || account.Account_id ? CommonUtilities.truncateStringWithGivenLength(account.accountName + "....", 26) + CommonUtilities.getLastFourDigit(account.accountID) : CommonUtilities.getAccountDisplayName(account)
        };
        account["formattedMembershipName"] = account.coreCustomerName+ " - " + account.coreCustomerId;
        account["flxIcon3"] = {
          width : "0dp"
        }
        account["flxUnifiedTransferRowTemplate"] = {
          height: "69dp"
        }
        account["imgIcon31"] = {
          src: 'external.png', 
          isVisible: false
        }
        account["lblCustomerDetailsKA"] = {
          isVisible: true, 
          text: account.coreCustomerName+ " - " + account.coreCustomerId, 
          skin: 'sknLbla0a0a0SSPReg22px', 
          left: '5dp'
        }
        account["lblField1"] = account.formattedAccountName.text;
        account["lblField2"] = {
          text : ""
        } 
        account["lblField4"] = {
          isVisible : false
        }
        account["lblField3"] = {
          text : account.accountType,
          skin: 'sknlble3e3e3border12px'
        }
        account["fromMembershipName"] = account.coreCustomerName;
      });
      return accounts;
    },

    /**
     * @function : getWidgetDataMap
     * @description : Widget mapping for From account segment
    */
    getWidgetDataMap: function() {
      var scope = this;
      try {
        var dataMapping = {
          "flxUnifiedTransferHeader": "flxUnifiedTransferHeader",
          "flxTransactionsHeader": "flxTransactionsHeader",
          "flxUnifiedTransferRowTemplate": "flxUnifiedTransferRowTemplate",
          "flxUpShadow": "flxUpShadow",
          "flxIcon1": "flxIcon1",
          "flxIcon2": "flxIcon2",
          "flxIcon3": "flxIcon3",
          "flxIcon4": "flxIcon4",
          "imgIcon1": "imgIcon1",
          "imgIcon2": "imgIcon2",
          "imgIcon3": "imgIcon3",
          "imgIcon31": "imgIcon31",
          "imgIcon4": "imgIcon4",
          "lblHeaderName": "lblHeaderName",
          "lblField1": "lblField1",
          "lblField2": "lblField2",
          "lblField3": "lblField3",
          "lblCustomerDetailsKA": "lblCustomerDetailsKA",
          "lblField4": "lblField4",
          "flxGroup1": "flxGroup1",
          "flxGroup2": "flxGroup2",
          "flxGroup3": "flxGroup3",
          "flxGroup4": "flxGroup4",
          "lblCount": "lblCount",
          "flxSeparator": "flxSeparator",
          "transactionId": "transactionId",
          "flxNoRecords": "flxNoRecords",
          "imgChevron": "imgChevron",
          "lblNoRecords": "lblNoRecords",
          "imgIcon": "imgIcon",
          "flxRow": "flxRow"
        };
        return dataMapping;
      } catch (err) {
        scope.onError(err);
      }
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
     * @function : onBack
     * @description : Navigate to the previous screen
    */
    // onBack : function(){
    //   // var transMan = applicationManager.getTransactionManager();
    //   // transMan.clearTransferObject();
    //   var navManager = applicationManager.getNavigationManager();
    //   navManager.navigateTo({"appName" : "TransfersMA", "friendlyName" : "ManageActivitiesUIModule/frmTransfersAdvanceSearch"});
    // },

    /**
     * @function : backNavigation
     * @description : Invoked onclick on back icon
    */
    backNavigation: function() {
      var navManager = applicationManager.getNavigationManager();
      var entryPoint = navManager.getEntryPoint("AccountSearch");
      if (entryPoint === "frmTransferActivitiesTransfersEurope") {
        navManager.navigateTo({ "appName": "TransfersMA", "friendlyName": "ManageActivitiesUIModule/frmTransferActivitiesTransfersEurope" });
      } else {
        navManager.navigateTo({"appName" : "TransfersMA", "friendlyName" : "ManageActivitiesUIModule/frmTransfersAdvanceSearch"});
      }
    }
  };
});