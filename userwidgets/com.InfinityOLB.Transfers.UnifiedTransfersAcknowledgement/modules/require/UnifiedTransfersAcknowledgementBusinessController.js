define(['DataFormattingUtils/FormatUtils', 'DataValidationFramework/DataValidationHandler', 'InvokeServiceUtils'], function (FormatUtils, DataValidationHandler, InvokeServiceUtils) {

  function BusinessController() {
    this.store = {};
    this.objectMetadata = {};
    this.context = {};
    this.serviceParameters = {};
    this.dataMapping = {};
    this.formatUtils = new FormatUtils();
    this.dataValidationHandler = new DataValidationHandler();
    this.invokeServiceUtils = new InvokeServiceUtils();
    this.error = [];
  }
  /**
  * @api : setPropertiesFromComponent
  * set properties from component
  * @return : NA
  */
  BusinessController.prototype.setProperties = function (serviceParameters, dataMapping, dataFormatJSON) {
    this.serviceParameters = serviceParameters;
    this.dataMapping = dataMapping;
    this.formatUtils.updateFormatJSON(dataFormatJSON);
  };

  BusinessController.prototype.setContextDataInStore = function (context) {
    this.store.dispatch({
      type: "UPDATE_COLLECTION",
      data: context
    });
  };

  /**
   * @api : getDataBasedOnDataMapping
   * gets the corresponding data of each widget from collection
   * @return : NA
   */
   BusinessController.prototype.getDataBasedOnDataMapping = function (widget) {
     var collectionObj = this.store.getState();
     var dataMapping = this.dataMapping;
     if (!(widget in dataMapping)) return "";
     var fieldValue = dataMapping[widget];
     if (!fieldValue.indexOf("${Collection")) {
       var group = fieldValue.split(".")[1];
       var fieldType = fieldValue.split(".")[2].replace("}", "");
       if (!kony.sdk.isNullOrUndefined(collectionObj.Collection[group])) {
         if (!kony.sdk.isNullOrUndefined(collectionObj.Collection[group][fieldType])) return collectionObj.Collection[group][fieldType];
       }
     } else if (!fieldValue.indexOf("${i18n")) {
        var data = kony.i18n.getLocalizedString(fieldValue.substring(fieldValue.indexOf("${i18n{") + 7, fieldValue.length - 2));
        if(data.charAt(data.length - 1) === ":") data = data.slice(0, -1);
        return data;
     }
     return "";
   };
  
  /**
     * @api : getReferenceId
     * @description :  method to invoke save this Payee service
     * @param : objServiceName{String} -object service name
     * @param : objName{String} -object name
     * @param : operationname{String} -operation name
     * @param : criteria{JSON} -criteria
     * @param : onSuccess{function} -function to be invoekd on success
     * @param : unicode{String} -service response
     */
  BusinessController.prototype.getReferenceId = function(objServiceName,objName,operationName,criteria,onSuccess,unicode,onError) {
    kony.application.showLoadingScreen("loadingskin","Data is still Loading");
    var objSvc = this.client.getObjectService(objServiceName, {
      "access": "online"
    });
    var dataObject = new kony.sdk.dto.DataObject(objName);
    for(var key in criteria){
      dataObject.addField(key,criteria[key]);
    }
    var options1 = {
      "dataObject": dataObject
    };
    objSvc.customVerb(operationName, options1,
                      function(response1) {
      onSuccess(response1,unicode);
      kony.print("Fetch Performed Successfully: " + JSON.stringify(response1));
    },
                      function(error) {

      var errObj = {
        "errorInfo" : "Error in save this payee method of the component.",
        "error": error
      };
      onError(errObj);
    });
  }; 
   /**
     * @api : getDateObjectFromCalendarString
     * returns date object from given date string
     * @param {String} dateString - a date string
     * @param {String} format - format of date
     * @returns {Date} - date object
     */
   BusinessController.prototype.getDateObjectFromCalendarString = function(dateString, format) {
    try {
        var finalDateTime = null;
        if (dateString) {
            var formattype = format.toUpperCase();
            var yyyyIndex = formattype.indexOf("YYYY");
            var mmIndex = formattype.indexOf("MM");
            var ddIndex = formattype.indexOf("DD");
            var hhIndex = formattype.indexOf("HH");
            var minIndex = formattype.indexOf("MM", mmIndex + 1);
            var ssIndex = formattype.indexOf("SS");
            if (yyyyIndex > -1 && mmIndex > -1 && ddIndex > -1) {
                var newdd = parseInt(dateString.substr(ddIndex, 2), 10);
                var newmm = parseInt(dateString.substr(mmIndex, 2), 10);
                var newyyyy = parseInt(dateString.substr(yyyyIndex, 4), 10);
                if (newdd && (0 < newdd && newdd <= 31) && (newmm && (0 < newmm && newmm <= 12)) && (newyyyy && 0 <= newyyyy)) {
                    finalDateTime = new Date();
                    finalDateTime.setYear(newyyyy);
                    finalDateTime.setMonth(newmm - 1);
                    finalDateTime.setDate(newdd);
                    //finalDateTime = new Date(Date.UTC(newyyyy, newmm - 1, newdd, 0, 0, 0, 0));
                }
                var newTime = hhIndex > -1 ? dateString.substr(hhIndex, 2) : null;
                newTime = newTime ? parseInt(newTime, 10) : null;
                if (newTime && newTime < 24) {
                    finalDateTime = finalDateTime ? finalDateTime.setHours(newTime, 0, 0) : null;
                    finalDateTime = new Date(finalDateTime);
                }
                var newmin = minIndex > -1 ? dateString.substr(minIndex, 2) : null;
                newmin = newmin ? parseInt(newmin, 10) : null;
                if (newmin) {
                    finalDateTime = finalDateTime ? finalDateTime.setMinutes(newmin) : null;
                    finalDateTime = new Date(finalDateTime);
                }
                var newss = ssIndex > -1 ? dateString.substr(ssIndex, 4) : null;
                newss = newss ? parseInt(newss, 10) : null;
                if (newss) {
                    finalDateTime = finalDateTime ? finalDateTime.setSeconds(newss) : null;
                    finalDateTime = new Date(finalDateTime);
                }
            }
            dateString = finalDateTime.toString();
            if (dateString.lastIndexOf(':') != -1) {
                dateString = dateString.substring(0, dateString.lastIndexOf(':') + 3);
            }
            return finalDateTime;
        }
    }catch (err) {
        kony.print("Error in ISO date formatting -->" + err);
    }
};
  return BusinessController;
});