define(function () {

 

  function ConfirmationDAO(){
    this.client=kony.sdk.getCurrentInstance();
  }

 

  /**
     * @api : createPayee
     * @description :  method to invoke save this Payee service
     * @param : objServiceName{String} -object service name
     * @param : objName{String} -object name
     * @param : operationname{String} -operation name
     * @param : criteria{JSON} -criteria
     * @param : onSuccess{function} -function to be invoekd on success
     * @param : unicode{String} -service response
     */
  ConfirmationDAO.prototype.createServiceLogic = function(objServiceName,objName,operationName,criteria,onSuccess,onError,unicode) {
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
      kony.application.dismissLoadingScreen();
      if(kony.application.getCurrentForm().verifyWarningPopup){
        kony.application.getCurrentForm().verifyWarningPopup.lblHeading.setActive(true);}

        if(kony.application.getCurrentForm().flxError) {
                kony.application.getCurrentForm().lblError1.setActive(true);
                
            }
    },
                      function(error) {
      
     var errObj = {
            "errorInfo" : "Error in the confirm transfer method of the component.",
            "error": error
          };
          onError(errObj);

 

    });
  }; 
  return ConfirmationDAO;
});