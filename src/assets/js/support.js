/*
 Copyright (C) 2016 Apple Inc. All Rights Reserved.
 See LICENSE.txt for this sample’s licensing information

 Abstract:
 A helper function that requests an Apple Pay merchant session using a promise.
 */
 
 /*function getApplePaySession(url) {
	console.log("get applepay session url in support.js",url);
   	  
		jQuery.ajax({
			        type     : "POST",
			    	url      :  contactPath+"/api/session/create",
			    	data     : {"validationUrl": url},
			    	success  : function(data){ 
					console.log("response data is here",data);
				 
			 },
			 error: function (errormessage) {
				 
	            }
		  })
}*/

function getApplePaySession(url,contactPath,currentUrl) {
	console.log("get applepay session url in support.js",url);
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://testscheckout.com/DCH/apple/session/create');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({validationUrl: url,refToken:currentUrl}));
    });
}

function authorize(token,contactPath,currentUrl,methodName) {
	console.log(currentUrl,"<-Authorize is called",token);
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://testscheckout.com/DCH/apple/authorize');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({paymentData:token,currentUrl:currentUrl,methodName:methodName}));
    });
}