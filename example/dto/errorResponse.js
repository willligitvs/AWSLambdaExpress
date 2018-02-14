/**
 * Created by willli on 9/2/18.
 */
/*
 Field Name       Description
 apiMnemonic
 Micro service short error code
 apiMessage
 General error message from micro service
 apiSubIssues
 Array of detailed issues returned from micro service
 rawCode
 Code returned from backend service
 rawMessage
 Message returned from backend service
 */

module.exports = class ErrorResponse{

    constructor(apiMessage,
                apiSubIssues,
                apiMnemonic,
                rawCode,
                rawMessage){
        this.apiMnemonic = apiMnemonic;
        this.apiMessage = apiMessage;
        this.apiSubIssues = apiSubIssues;
        this.rawCode = rawCode;
        this.rawMessage = rawMessage;
    }

};