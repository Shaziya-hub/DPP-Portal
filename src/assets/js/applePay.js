/*
 Copyright (C) 2016 Apple Inc. All Rights Reserved.
 See LICENSE.txt for this sample’s licensing information

 Abstract:
 The main client-side JS. Handles displaying the Apple Pay button and requesting a payment.
 */

/**
 * This method is called when the page is loaded.
 * We use it to show the Apple Pay button as appropriate.
 * Here we're using the ApplePaySession.canMakePayments() method,
 * which performs a basic hardware check.
 *
 * If we wanted more fine-grained control, we could use
 * ApplePaySession.canMakePaymentsWithActiveCards() instead.
 */
 

/**
 * Apple Pay Logic
 * Our entry point for Apple Pay interactions.
 * Triggered when the Apple Pay button is pressed
 */
 console.log("our js file called on each component");
window.addEventListener('message', function(event) {
    console.log("In addEventListner:",event);
    if(event && event.data){
    console.log(event.data);
    var amount=event.data.ammount;
    var contactPath=event.data.contactPath;
    var currentUrl=event.data.currentUrl;
    var methodName=event.data.method;
    applePayButtonClicked(amount,contactPath,currentUrl,methodName);
   // console.log("event is here ",event);
    // event.data == "hello world"
   }
}, false );
 
function applePayButtonClicked(ammount,contextPath,currentUrl,methodName) {
    console.log("apple pay button clicked and selected method is :",ammount);

 
    const request = {
  countryCode: 'SA',
  currencyCode: 'SAR',
  supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
  merchantCapabilities: ['supports3DS'],
  total: { label: 'To Gowtham Account', amount: ammount, pending: false, },
}
const session = new ApplePaySession(1, request); 
 session.begin();
      console.log("session recieved ",session)
   session.onvalidatemerchant = function(event) {
          console.log("validate merchant",event);
        const validationURL = event.validationURL;
      
        console.log("validation url=" + validationURL);
        getApplePaySession(validationURL,contextPath,currentUrl).then(function(response) {
            console.log("response from server:",response);
            try{
 				 session.completeMerchantValidation(response);
 				  console.log("before calling onpaymentauthorized"); 
      
  				}
  			catch(err){console.log("error while completing merchant validation : "+err);}
           
             console.log("response completeMerchantValidation");
        });
    };
    /**
     * Payment Authorization
     * Here you receive the encrypted payment data. You would then send itfauthorize
     * on to your payment provider for processing, and return an appropriate
     * status in session.completePayment()
     */
     

    // All our handlers are setup - start the Apple Pay payment
 
  
 
    session.onpaymentauthorized = (event) => {
        console.log("inside onpaymentauthorized");
        // Send payment for processing...
       // const payment = event.payment;
         const payment = event.payment;
        console.log(JSON.stringify(payment.token));
        var tokenData=JSON.stringify(payment.token);
        var paymentDataasArray=JSON.parse(tokenData);
        console.log("here is payment data",paymentDataasArray.paymentData);
        
        authorize(paymentDataasArray.paymentData,contextPath,currentUrl,methodName).then(function(response) {
           // console.log("response from datatrans received");
            console.log("response fpund in authorize:",response);
			 var responseParse=JSON.parse(response);
			 console.log("response fpund in authorize:",responseParse.status);
            if(responseParse.status == "ERROR") {
                console.log("an error occured!");
                
                session.abort(); 
                setTimeout(() => {
				 top.location=responseParse.clientSuccessRedirectchUrl+"?status="+responseParse.status+"&&reasonCode="+responseParse.reasonCode+"&&message="+responseParse.message;
			}, 3000)
            } else if(responseParse.status == "SUCCESS"){
				  session.completePayment(ApplePaySession.STATUS_SUCCESS);
				 setTimeout(() => {
				 top.location=responseParse.clientSuccessRedirectchUrl+"?status="+responseParse.status+"&&reasonCode="+responseParse.reasonCode+"&&message="+responseParse.message +"&&pmtRef="+responseParse.pmtRef;
			}, 3000)
			}else{
				 top.location=responseParse.clientSuccessRedirectchUrl+"?status="+responseParse.status+"&&reasonCode="+responseParse.reasonCode+"&&message="+responseParse.message;
			}
				
            //"{\"status\":\"ERROR\",\"reasonCode\":\"INVALID_REQUEST\",\"reasonDesc\":\"Invalid Request\",\"nativeReasonDesc\":\"INVALID_REQUEST\",\"message\":\"The reques…" (index.js, line 131) "{\"status\":\"ERROR\",\"reasonCode\":\"INVALID_REQUEST\",\"reasonDesc\":\"Invalid Request\",\"nativeReasonDesc\":\"INVALID_REQUEST\",\"message\":\"The request was rejected because it did not conform to the API protocol.\",\"clientSuccessRedirectchUrl\":\"http://122.170.2.166:9071/DPP/#/payment-status\",\"errorCode\":null}"
//top.location=data.clientRedirectchUrl+"?status="+data.status+"&&reasonCode="+data.reasonCode+"&&message="+data.nativeReasonDesc; 
//top.location=clientRedirectchUrl+"?status=ERROR"+"&&reasonCode=GENERAL_ERROR"+"&&message=Unknown error occured, please retry"
//top.location="${clientRedirectchUrl}"+"?status="+"${status}"+"&&reasonCode="+"${reasonCode}"+"&&pmtRef="+"${pmtRef}"+"&&message="+"${message}";
          
           // window.location.href = "/success.html";
        });

    };  
    
}
