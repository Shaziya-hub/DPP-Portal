// signature.service.ts
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {

  private privateKey: string = ''; // This is a demonstration. Never expose your private key in production!



  // *Important:* In a real application, never hard-code secret keys.
  private secretKey: string = "ec5582d0fccd6o41" //"H5mFwjFHIQZ3QhVBYPvYbg==MTIzNDK1";//;

  // Method to sign the payload
  signPayload(payload: any): string {
    // Step 1: Serialize the payload to JSON with consistent key ordering 
    const stringifiedPayload = this.stringifyWithSortedKeys(payload); //JSON.stringify(payload);
    //console.log("stringifiedPayload ",stringifiedPayload)
    // Step 2: Generate SHA-256 hash of the payload
    const hash = CryptoJS.SHA256(stringifiedPayload).toString(CryptoJS.enc.Hex);

    //console.log("Hash ", hash);
    // Step 3: Generate HMAC-SHA256 signature
    const signature = CryptoJS.HmacSHA256(hash, this.secretKey).toString(CryptoJS.enc.Base64);

    return signature;
  }

  // Utility method to stringify JSON with sorted keys
  public stringifyWithSortedKeys(obj: any): string {
    if (typeof obj !== 'object' || obj === null) {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      return '[' + obj.map(item => this.stringifyWithSortedKeys(item)).join(',') + ']';
    }

    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: any = {};
    for (const key of sortedKeys) {
      sortedObj[key] = obj[key];
    }
    return JSON.stringify(sortedObj);
  }

}