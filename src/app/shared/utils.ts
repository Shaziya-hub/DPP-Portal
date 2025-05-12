import { DatePipe } from "@angular/common";
//import { removeSummaryDuplicates } from "@angular/compiler";
import { FormGroup } from "@angular/forms";
import * as _ from "lodash";
import { environment } from "src/environments/environment";
import { RowDetailsService } from "../services/row-details-service.service";
import { formatDate } from '@angular/common';
import { keyWords } from "./constant";
export enum ApiPaths {
  getMenuByUser = '/getMenuByUser',
  getPageConfig = '/getPageConfig',
  getBills = '/getBills',
  getSelectableColumns = '/getSelectableColumns',
  updateSelectableColumns = '/updateSelectableColumns',
  getNonSADADPmts = '/getNonSADADPmts',
  getAccounts = '/getAccounts',
  getRefunds = '/getRefunds',
  getPaymentBatches = '/getPaymentBatches',
  getPaymentTransactions = '/getPaymentTransactions',
  getPaymentTransactionDetails = '/getPaymentTransactionDetails',
  getPaymentTransactionExtRefs = '/getPaymentTransactionExtRefs',
  downloadFile = '/downloadFile?location=',
  getAccessControls = '/getAccessControls',
  updateAccessControls = '/updateAccessControls',
  getParameters = '/getParameters',
  createParameter = '/createParameter',
  updateParameters = '/updateParameters',
  getNonSADADPmtUploads = '/getNonSADADPmtUploads',
  getBillUploads = '/getBillUploads',
  getNonSADADPmtConfirmations = '/getNonSADADPmtConfirmations',
  getBillConfirmations = '/getBillConfirmations',
  getAccountConfirmations = '/getAccountConfirmations',
  getAccountUploads = '/getAccountUploads',
  getAccountConfirmation = '/getAccountConfirmations',
  getReport = '/getReport',
  getLimitAndLocks = '/getLimitAndLocks',
  updateLimitAndLocks = '/updateLimitsAndLocks',
  getProcessorConfig = '/getProcessorConfig',
  getProcessorConfigDetails = '/getProcessorConfigDetails',
  updateProcessorConfig = '/updateProcessorConfig',
  updateProcessorConfigDetails = '/updateProcessorConfigDetails',
  getReconciliationSummary = '/getReconciliationSummary',
  getReconciliationDetails = '/getReconciliationDetails',
  getEndPoints = '/getEndPoints',
  updateEndPoints = '/updateEndPoints',
  getAdvancedAccessControls = '/getAdvAccessControls',
  checkAdvAccessControls = '/checkAdvAccessControls',
  updateAdvAccessControls = '/updateAdvAccessControls',
  getMasterData = '/getMasterData',
  getUsers = '/getUsers',
  createUser = '/createUser',
  updateUser = '/updateUser',
  deleteUser = '/deleteUser',
  getRolesByUser = '/getRolesByUser',
  getRoles = '/getRoles',
  deleteRole = '/deleteRole',
  getResourcesByUser = '/getResourcesByUser',
  createRole = '/createRole',
  updateRole = '/updateRole',
  getPaymentGWBatch = '/getPaymentGWBatch',
  getReconPmtsRpt = '/getReconPmtsRpt',
  getUnreconPmtsRpt = '/getUnreconPmtsRpt',
  getSvcMappings = '/getSvcMappings',
  getPaymentGWBatchDetails = '/getPaymentGWBatchDetails',
  getPmtAddtnlStats = '/getPmtAddtnlStats',
  getPmtRatio = '/getPmtRatio',
  getPmtStats = '/getPmtStats',
  getLatestPmts = '/getLatestPmts',
  getBillAddtnlStats = '/getBillAddtnlStats',
  getBillFrequency = '/getBillFrequency',
  getBillRatio = '/getBillRatio',
  getBillStats = '/getBillStats',
  getLatestBills = '/getLatestBills',
  getPmtFrequency = '/getPmtFrequency',
  getLogDetails = '/getLogDetails',
  getPmtTrxCards = '/getPmtTrxCards',
  getBillCards = '/getBillCards',
  getUserDetails = '/getUserDetails',
  getEligibleTransactions = '/getEligibleTransactions',
  initiateManualRefund = '/initiateManualRefund',
  getManualRefunds = '/getManualRefunds',
  updateManualRefund = '/updateManualRefund',
  generateInvoices = '/generateInvoices',
  getBillExtRefs = '/getBillExtRefs',
  getBillDetails = 'getBillDetails',
  createPayment = 'createPayment',
  updatePayment = 'updatePayment',
  getEnterpriseBatch = '/getEnterpriseBatch',
  getEInvoices = '/getEInvoices',
  getEInvoiceDetails = '/getEInvoiceDetails',
  getEInvoiceSellerDetails = '/getEInvoiceSellerDetails',
  getEInvoiceBuyerDetails = '/getEInvoiceBuyerDetails',
  getEInvoiceTotalTax = '/getEInvoiceTotalTax',
  getPayouts = '/getPayouts',
  getPayoutExtRefs  = '/getPayoutExtRefs',
  getPayrolls = '/getPayrolls',
  getPayrollCards = '/getPayrollCards',
}
export enum constantField {
  dateRangeMsg = "You have selected more than "
}
export function deepClone(obj) {
  var _out = new obj.constructor;

  var getType = function (n) {
    return Object.prototype.toString.call(n).slice(8, -1);
  }

  for (var _key in obj) {
    if (obj.hasOwnProperty(_key)) {
      _out[_key] = getType(obj[_key]) === 'Object' || getType(obj[_key]) === 'Array' ? deepClone(obj[_key]) : obj[_key];
    }
  }
  return _out;
}

export function mobileCheck() {
  let check = false;
  ((a) => { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window['opera']);
  return check;
};

//Used to check the browser session space for saving the downloaded files and show alert on maximum saved
export function haveEnoughSessionStorageSpace() {
  var data = '';
  for (var key in window.sessionStorage) {
    if (window.sessionStorage.hasOwnProperty(key)) {
      data += window.sessionStorage[key];
    }
  }

  //Values are in KBs
  let totalSpaceUsed: any = ((data.length * 16) / (8 * 1024)).toFixed(2);
  let spaceRemaining: any = (5120 - (data.length * 16) / (8 * 1024)).toFixed(2);

  //console.log('Total space used: ' + totalSpaceUsed)
  // console.log('Space remaining: ' + spaceRemaining)

  let hasEnoughtStorage = spaceRemaining > environment.minimumSpaceAlertThresholdValue;

  return hasEnoughtStorage;
}

export function dateModalPosition() {
  let lang = localStorage.getItem('selectedLang');
  if (lang && lang == 'ar') {
    let elements = document.getElementsByClassName('cdk-overlay-pane owl-dt-popup')
    for (let index = 0; index < elements.length; index++) {
      setTimeout(() => {
        const element = <any>elements[index];
        element.style.right = element.style.left;
        element.style.left = 'auto';
      }, 50);
    }
  }
}

export function getUniqueData(data: any, attributeName: any) {
  return _.uniqBy(data, attributeName);
}

export enum TimeOutDetails {
  getPaymentTransactionsTimeout = 60000,
  getPaymentTransactionExtRefsTimeOut = 20000,
  getSelectableColumnsTimeout = 20000,
  updateSelectableColumnsTimeout = 60000,
  getOrUpdateDataTimeOut = 60000,
  downloadFileTimeOut = 60000,
  downloadTableDataTimeout = 60000,
  getSummaryTableDataTimeout = 60000,
  getPageConfigTimeout = 60000,
  getMenuByUserTimeout = 60000,
  getSvcMappingsTimeout = 60000


}
export function isUserHasAccess(permissions: any) {
  let hasPermission = {
    view: false,
    add: false,
    edit: false,
    delete: false,
    download: false
  }
  for (let permisson of permissions) {
    if (permisson?.flag == 'true' && permisson.type.toLowerCase() == "view") {
      hasPermission.view = true;
    } else if (permisson?.flag == 'true' && permisson?.type.toLowerCase() == 'add') {
      hasPermission.add = true
    } else if (permisson?.flag == 'true' && permisson?.type.toLowerCase() == 'edit') {
      hasPermission.edit = true
    } else if (permisson?.flag == 'true' && permisson?.type.toLowerCase() == 'delete') {
      hasPermission.delete = true
    } else if (permisson?.flag == 'true' && permisson?.type.toLowerCase() == 'download') {
      hasPermission.download = true;
    }
  }
  return hasPermission;
}
var clicks = 0, timeout;
export function doubleClick(doubleClickCallback) {
  clicks++;
  if (clicks == 2) {
    timeout && clearTimeout(timeout);
    doubleClickCallback(true);
    clicks = 0;
  }
  setTimeout(() => {
    timeout && clearTimeout(timeout);
    clicks = 0;
  }, 300);

}

export function validateDate(filters: any, fromDate: Date, dateTo: Date, datepipe: DatePipe) {
  //console.log("filters is =>",filters);
  if (filters?.SearchFilters?.fromDate != null && filters?.SearchFilters?.toDate != null) {
    //console.log("util fromDate",filters?.SearchFilters?.fromDate);
    //console.log("utiltoDate",filters?.SearchFilters?.toDate);
    fromDate = new Date(filters?.SearchFilters?.fromDate);
    dateTo = new Date(filters?.SearchFilters?.toDate);


    let fDate = datepipe.transform(fromDate, 'MM-dd-yyyy');
    let toDate = datepipe.transform(dateTo, 'MM-dd-yyyy');
    fromDate = new Date(fDate);
    dateTo = new Date(toDate);

    //console.log(fromDate,"And toDate",dateTo);

    let Time = dateTo.getTime() - fromDate.getTime();
    let Days = Time / (1000 * 3600 * 24);
    //console.log("Days in Number",Days);
    return Days
  }
  return null;
}

export function getParenId(iniData: any, checkedData: any, pagentId: string, id: string, type: string) {
  //console.log("---",iniData,checkedData,pagentId,id,type);
  let c = iniData.filter(s => s.pageId == id && s.parentId == pagentId && s.type == type).length;
  //parentId:sub.id,type:data?.type, pageId:suofSu.id, flag:data.flag
  //{parentId:parentPageId,type:type, pageId:id, flag:el.permissions.viewPermission.flag}
  //  console.log(c,"---");
  let d = checkedData.filter(s => s.pageId == id && s.parentId == pagentId && s.type == type).length;
  // console.log(d,"---",c);
  //  return   _.uniqBy (data, attributeName);
  return c == d
}
export function removeDuplicateFromListOfObject(listtoRempveDuplicate: any) {
  const expected = new Set();
  const unique = listtoRempveDuplicate.filter(item => !expected.has(JSON.stringify(item)) ? expected.add(JSON.stringify(item)) : false);
  return unique
}


/* Issue
     On the "Manage Resources" page, the system throws a "Please select mandatory field" error 
     even when previously saved values exist and no changes are made
  */
export function getSelectedOrUnselectedList2(menu: any, parentId: string, pageId: string, roledtailsSerices: RowDetailsService) {
  //console.log("menu.id ",menu,'----','parentId',parentId,'----','pageId',pageId);
  let subscribeObj: any = [];

  if (menu.id == parentId) {
    menu.subMenu.find(find => find.id == pageId).permissions.forEach(setFlag => {
      // if (setFlag.flag != 'na') {
      //   setFlag.flag = 'true';
      // } else {
      //   setFlag.flag = 'false';
      // }
    })

    if (subscribeObj != null && subscribeObj != undefined && subscribeObj.length > 0) {
      let existRole = subscribeObj.find(find => find.parentId == parentId);
      if (existRole && existRole != null) {
        let index = subscribeObj.findIndex(f => f.parentId == parentId)
        index > -1 ? subscribeObj.splice(index, 1) : ''
        subscribeObj.push({ parentId: parentId, customMenu: menu });
        roledtailsSerices.setlistOfTempRole(subscribeObj)

      }
      /* Issue
       While updating getROles API when we uncheck for the first time it was not getting updated ,
       if we do check and then uncheck again for the check box then only it was getting updated 
      */
      else {
        subscribeObj.push({ parentId: parentId, customMenu: menu })
        roledtailsSerices.setlistOfTempRole(subscribeObj)
      }
    } else {
      roledtailsSerices.setlistOfTempRole([{ parentId: parentId, customMenu: menu }])
    }

  }

}



export function getSelectedOrUnselectedList(event: any, menu: any, parentId: string, pageId: string, type: string, roledtailsSerices: RowDetailsService) {
  let subscribeObj: any = [];
  roledtailsSerices.tempSelectedList$.subscribe(getExitMenu => {
    // getExitMenu  !=null?subscribeObj=getExitMenu:''
    if (getExitMenu != null) {
      let uniqueData = getUniqueData(getExitMenu, 'parentId')
      subscribeObj = uniqueData
    }
  })
  if (event.target.checked) {
    if (menu.id == parentId) {
      menu.subMenu.find(find => find.id == pageId).permissions.forEach(setFlag => {
        if (setFlag.type == type && setFlag.flag != 'na') {
          setFlag.flag = 'true';
        }
      })
      //  console.log("countPer is ",countPer);

      if (subscribeObj != null && subscribeObj != undefined && subscribeObj.length > 0) {
        let existRole = subscribeObj.find(find => find.parentId == parentId);
        if (existRole && existRole != null) {
          let index = subscribeObj.findIndex(f => f.parentId == parentId)
          index > -1 ? subscribeObj.splice(index, 1) : ''
          subscribeObj.push({ parentId: parentId, customMenu: menu });
          roledtailsSerices.setlistOfTempRole(subscribeObj)

        }
        /* Issue
         While updating getROles API when we uncheck for the first time it was not getting updated ,
         if we do check and then uncheck again for the check box then only it was getting updated 
        */
        else {
          subscribeObj.push({ parentId: parentId, customMenu: menu })
          roledtailsSerices.setlistOfTempRole(subscribeObj)
        }
      } else {
        roledtailsSerices.setlistOfTempRole([{ parentId: parentId, customMenu: menu }])
      }

    }
    //  console.log(menu.find(parentId))
  }
  if (!event.target.checked) {
    if (menu.id == parentId) {
      //console.log( menu.subMenu.find(find=>find.id==pageId))
      menu.subMenu.find(find => find.id == pageId).permissions.forEach(setFlag => {
        setFlag.type == type ? setFlag.flag = 'false' : setFlag.flag = setFlag.flag
      })
    }

    if (subscribeObj != null && subscribeObj != undefined && subscribeObj.length > 0) {
      let existRole = subscribeObj.find(find => find.parentId == parentId);
      if (existRole && existRole != null) {
        let index = subscribeObj.findIndex(f => f.parentId == parentId)
        index > -1 ? subscribeObj.splice(index, 1) : ''
        subscribeObj.push({ parentId: parentId, customMenu: menu });
        roledtailsSerices.setlistOfTempRole(subscribeObj)
      } else {
        subscribeObj.push({ parentId: parentId, customMenu: menu })
        roledtailsSerices.setlistOfTempRole(subscribeObj)
      }
    } else {
      roledtailsSerices.setlistOfTempRole([{ parentId: parentId, customMenu: menu }])
    }
  }



}
export function selectAllOrDeselectAll(event, menu, parentId, roledtailsSerices) {
  let subscribeObj: any = [];
  roledtailsSerices.tempSelectedList$.subscribe(getExitMenu => {
    //  getExitMenu  !=null?subscribeObj=getExitMenu:''
    if (getExitMenu != null) {
      let uniqueData = getUniqueData(getExitMenu, 'parentId')
      subscribeObj = uniqueData
    }

  })
  // subscribeObj = getTempSelectedList(roledtailsSerices)
  if (event.target.checked) {
    if (menu.id == parentId) {
      menu.subMenu.forEach(submenu => {
        submenu.permissions.forEach(perm => {
          perm.flag != 'na' ? perm.flag = 'true' : perm.flag
        })
      })


      if (subscribeObj != null && subscribeObj != undefined && subscribeObj.length > 0) {
        let existRole = subscribeObj.find(find => find.parentId == parentId);
        if (existRole && existRole != null) {
          let index = subscribeObj.findIndex(f => f.parentId == parentId)
          index > -1 ? subscribeObj.splice(index, 1) : ''
          subscribeObj.push({ parentId: parentId, customMenu: menu });
          roledtailsSerices.setlistOfTempRole(subscribeObj)
        }
        else {
          subscribeObj.push({ parentId: parentId, customMenu: menu })
          roledtailsSerices.setlistOfTempRole(subscribeObj)
        }
      }

      else {
        roledtailsSerices.setlistOfTempRole([{ parentId: parentId, customMenu: menu }])
      }
    }
  }

  if (!event.target.checked) {
    if (menu.id == parentId) {
      menu.subMenu.forEach(submenu => {
        submenu.permissions.forEach(permission => {
          permission.flag != 'na' ? permission.flag = 'false' : permission.flag
        })
      })
    }
    if (subscribeObj != null && subscribeObj != undefined && subscribeObj.length > 0) {
      let existRole = subscribeObj.find(find => find.parentId == parentId);
      if (existRole && existRole != null) {
        let index = subscribeObj.findIndex(f => f.parentId == parentId)
        index > -1 ? subscribeObj.splice(index, 1) : ''
        subscribeObj.push({ parentId: parentId, customMenu: menu });
        roledtailsSerices.setlistOfTempRole(subscribeObj)
      }
      else {
        subscribeObj.push({ parentId: parentId, customMenu: menu })
        roledtailsSerices.setlistOfTempRole(subscribeObj)
      }
      //console.log("men",subscribeObj)
    }
  }
}

export function getTempSelectedList(rowDetailService: RowDetailsService) {
  let tempList = null
  let unique = null
  rowDetailService.tempSelectedList$.subscribe(subscripb => {
    tempList = subscripb

    unique = getUniqueData(tempList, 'parentId');

  })
  //console.log("subscripb is ",unique)
  return unique;
}
export function countOfSelectedList(rowDetailService) {
  let temp = getTempSelectedList(rowDetailService)
  let getselectedCount: any = []
  // this.searchFilters.resourceDetails.menu=[]
  temp?.forEach(f => {
    let count = 0
    f.customMenu.subMenu.forEach(submenu => {
      submenu.permissions.forEach(per => {
        per.flag != 'na' && per.flag == 'true' ? count++ : count
      })
    })
    count > 0 ? getselectedCount.push(f.customMenu) : '';
    // flag>0? this.searchFilters.resourceDetails.menu.push(f.customMenu) :''
  })
  return getselectedCount;
}

export function selectAllColumn(event, menu, parentId, roledtailsSerices, type) {
  let subscribeObj: any = [];
  roledtailsSerices.tempSelectedList$.subscribe(getExitMenu => {
    //  getExitMenu  !=null?subscribeObj=getExitMenu:''
    if (getExitMenu != null) {
      let uniqueData = getUniqueData(getExitMenu, 'parentId')
      subscribeObj = uniqueData
    }

  })
  // subscribeObj = getTempSelectedList(roledtailsSerices)
  if (event.target.checked) {
    if (menu.id == parentId) {
      menu.subMenu.forEach(submenu => {
        submenu.permissions.forEach(perm => {
          perm.flag != 'na' && perm.type == type ? perm.flag = 'true' : perm.flag
        })
      })


      if (subscribeObj != null && subscribeObj != undefined && subscribeObj.length > 0) {
        // console.log("subscribeObj",subscribeObj)
        let existRole = subscribeObj.find(find => find.parentId == parentId);
        if (existRole && existRole != null) {
          let index = subscribeObj.findIndex(f => f.parentId == parentId)
          index > -1 ? subscribeObj.splice(index, 1) : ''
          subscribeObj.push({ parentId: parentId, customMenu: menu });
          roledtailsSerices.setlistOfTempRole(subscribeObj)
        }
        else {
          subscribeObj.push({ parentId: parentId, customMenu: menu })
          roledtailsSerices.setlistOfTempRole(subscribeObj)
        }
        // console.log("men",subscribeObj)
      }

      else {
        roledtailsSerices.setlistOfTempRole([{ parentId: parentId, customMenu: menu }])
      }
    }
  }

  if (!event.target.checked) {
    if (menu.id == parentId) {
      menu.subMenu.forEach(submenu => {
        submenu.permissions.forEach(permission => {
          permission.flag != 'na' && permission.type == type ? permission.flag = 'false' : permission.flag
        })
      })
    }
    if (subscribeObj != null && subscribeObj != undefined && subscribeObj.length > 0) {
      // console.log("uncheck subscribeObj",subscribeObj)
      let existRole = subscribeObj.find(find => find.parentId == parentId);
      if (existRole && existRole != null) {
        let index = subscribeObj.findIndex(f => f.parentId == parentId)
        index > -1 ? subscribeObj.splice(index, 1) : ''
        //console.log('subscribeObj',existRole,subscribeObj)
        subscribeObj.push({ parentId: parentId, customMenu: menu });
        roledtailsSerices.setlistOfTempRole(subscribeObj)
      }
      else {
        subscribeObj.push({ parentId: parentId, customMenu: menu })
        roledtailsSerices.setlistOfTempRole(subscribeObj)
      }
      //console.log("men",subscribeObj)
    }
    // console.log("Unchecked in selectall util",menu)
  }
}
export default class Validation {
  static match(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[password];
      const checkControl = formGroup.controls[confirmPassword];
      if (checkControl?.errors && !checkControl.errors['matching']) {
        return null;
      }
      if (control?.value !== checkControl?.value) {
        checkControl?.setErrors({ matching: true });
        return { matching: true };
      } else {
        checkControl?.setErrors(null);
        return null;
      }
    };
  }
}

//for decimal thousand seperator
export function commify(n) {
  var parts = n.toString().split(".");
  const numberPart = parts[0];
  const decimalPart = parts[1];
  const thousands = /\B(?=(\d{3})+(?!\d))/g;
  return numberPart.replace(thousands, ",") + (decimalPart ? "." + decimalPart : "");
}

export function deleteFilters(filters) {
  if (filters) {

    filters?.SearchFilters?.serviceId?.length == 0 || filters?.SearchFilters?.serviceId == null || filters?.SearchFilters?.serviceId == undefined || filters?.SearchFilters?.serviceId == "" ? delete filters.SearchFilters.serviceId : '';
    filters?.SearchFilters?.methodId?.length == 0 || filters?.SearchFilters?.methodId == null || filters?.SearchFilters?.methodId == undefined || filters?.SearchFilters?.methodId == "" ? delete filters.SearchFilters.methodId : '';
    filters?.SearchFilters?.channelId?.length == 0 || filters?.SearchFilters?.channelId == null || filters?.SearchFilters?.channelId?.length == '' || filters?.SearchFilters?.channelId?.length == undefined ? delete filters.SearchFilters.channelId : '';
    filters?.SearchFilters?.serviceTypeId?.length == 0 || filters?.SearchFilters?.serviceTypeId == null || filters?.SearchFilters?.serviceTypeId == undefined || filters?.SearchFilters?.serviceTypeId == "" ? delete filters.SearchFilters.serviceTypeId : '';
    filters?.SearchFilters?.processStatus?.length == 0 || filters?.SearchFilters?.processStatus == null || filters?.SearchFilters?.processStatus == '' || filters?.SearchFilters?.processStatus == undefined ? delete filters.SearchFilters.processStatus : '';
    filters?.SearchFilters?.bankId?.length == 0 || filters?.SearchFilters?.bankId == null || filters?.SearchFilters?.bankId == '' || filters?.SearchFilters?.bankId == undefined ? delete filters.SearchFilters.bankId : '';
    filters?.SearchFilters?.backendStatus?.length == 0 || filters?.SearchFilters?.backendStatus == null || filters?.SearchFilters?.backendStatus == '' || filters?.SearchFilters?.backendStatus == undefined ? delete filters.SearchFilters.backendStatus : '';
    filters?.SearchFilters?.accountNumber == null || filters?.SearchFilters?.accountNumber == undefined || filters?.SearchFilters?.accountNumber == "" ? delete filters.SearchFilters.accountNumber : '';
    filters?.SearchFilters?.paymentRef == null || filters?.SearchFilters?.paymentRef == undefined || filters?.SearchFilters?.paymentRef == "" ? delete filters.SearchFilters.paymentRef : '';
    filters?.SearchFilters?.transId == null || filters?.SearchFilters?.transId == undefined || filters?.SearchFilters?.transId == "" ? delete filters.SearchFilters.transId : '';
    filters?.SearchFilters?.amount == null || filters?.SearchFilters?.amount == undefined || filters?.SearchFilters?.amount == "" ? delete filters.SearchFilters.amount : '';
    filters?.SearchFilters?.batchId == null || filters?.SearchFilters?.batchId == undefined || filters?.SearchFilters?.batchId == "" ? delete filters.SearchFilters.batchId : '';
    filters?.SearchFilters?.profileId == null || filters?.SearchFilters?.profileId == undefined || filters?.SearchFilters?.profileId == "" ? delete filters.SearchFilters.profileId : '';
    filters?.SearchFilters?.extSysRefId == null || filters?.SearchFilters?.extSysRefId == undefined || filters?.SearchFilters?.extSysRefId == "" ? delete filters.SearchFilters.extSysRefId : '';
    filters?.SearchFilters?.productId == null || filters?.SearchFilters?.productId == undefined || filters?.SearchFilters?.productId == "" ? delete filters.SearchFilters.productId : '';
    filters?.SearchFilters?.billNumber == null || filters?.SearchFilters?.billNumber == undefined || filters?.SearchFilters?.billNumber == "" ? delete filters.SearchFilters.billNumber : '';
    filters?.SearchFilters?.serviceNumber == null || filters?.SearchFilters?.serviceNumber == undefined || filters?.SearchFilters?.serviceNumber == "" ? delete filters.SearchFilters.serviceNumber : '';


    filters?.SearchFilters?.billStatus?.length == 0 || filters?.SearchFilters?.billStatus == null || filters?.SearchFilters?.billStatus == '' || filters?.SearchFilters?.billStatus == undefined ? delete filters.SearchFilters.billStatus : '';
    filters?.SearchFilters?.billType?.length == 0 || filters?.SearchFilters?.billType == null || filters?.SearchFilters?.billType == '' || filters?.SearchFilters?.billType == undefined ? delete filters.SearchFilters.billType : '';
    filters?.SearchFilters?.amount == null || filters?.SearchFilters?.amount == undefined || filters?.SearchFilters?.amount == "" ? delete filters.SearchFilters.amount : '';

    filters?.SearchFilters?.accountTransType?.length == 0 || filters?.SearchFilters?.accountTransType == null || filters?.SearchFilters?.accountTransType == '' || filters?.SearchFilters?.accountTransType == undefined ? delete filters.SearchFilters.accountTransType : '';
    filters?.SearchFilters?.accountStatus?.length == 0 || filters?.SearchFilters?.accountStatus == null || filters?.SearchFilters?.accountStatus == '' || filters?.SearchFilters?.accountStatus == undefined ? delete filters.SearchFilters.accountStatus : '';

    filters?.SearchFilters?.nonSADADPmtStatus?.length == 0 || filters?.SearchFilters?.nonSADADPmtStatus == null || filters?.SearchFilters?.nonSADADPmtStatus == '' || filters?.SearchFilters?.nonSADADPmtStatus == undefined ? delete filters.SearchFilters.nonSADADPmtStatus : '';
    filters?.SearchFilters?.amount == null || filters?.SearchFilters?.amount == undefined || filters?.SearchFilters?.amount == "" ? delete filters.SearchFilters.amount : '';
    filters?.SearchFilters?.approvalStatus?.length == 0 || filters?.SearchFilters?.approvalStatus == null || filters?.SearchFilters?.approvalStatus == undefined || filters?.SearchFilters?.approvalStatus == '' ? delete filters.SearchFilters.approvalStatus : '';
    filters?.SearchFilters?.refundId?.length == 0 || filters?.SearchFilters?.refundId == null || filters?.SearchFilters?.refundId == undefined || filters?.SearchFilters?.refundId == '' ? delete filters.SearchFilters.refundId : '';
    filters?.SearchFilters?.iban == null || filters?.SearchFilters?.iban == undefined || filters?.SearchFilters?.iban == "" ? delete filters.SearchFilters.iban : '';
    filters?.SearchFilters?.search == null || filters?.SearchFilters?.search == undefined || filters?.SearchFilters?.search == "" ? delete filters.SearchFilters.search : '';
    filters?.SearchFilters?.refundAmount == null || filters?.SearchFilters?.refundAmount == undefined || filters?.SearchFilters?.refundAmount == "" ? delete filters.SearchFilters.refundAmount : '';
    filters?.SearchFilters?.merchantId == null || filters?.SearchFilters?.merchantId == undefined || filters?.SearchFilters?.merchantId == "" ? delete filters.SearchFilters.merchantId : '';
    filters?.SearchFilters?.merchantId?.length == 0 || filters?.SearchFilters?.merchantId == null || filters?.SearchFilters?.merchantId == '' || filters?.SearchFilters?.merchantId == undefined ? delete filters.SearchFilters.merchantId : '';
    filters?.SearchFilters?.date1 == null || filters?.SearchFilters?.date1 == undefined || filters?.SearchFilters?.date1 == "" ? delete filters.SearchFilters.date1 : '';
    filters?.SearchFilters?.monthly == null || filters?.SearchFilters?.monthly == undefined || filters?.SearchFilters?.monthly == "" ? delete filters.SearchFilters.monthly : '';
    filters?.SearchFilters?.fromDate == null || filters?.SearchFilters?.fromDate == undefined || filters?.SearchFilters?.fromDate == "" ? delete filters.SearchFilters.fromDate : '';
    filters?.SearchFilters?.toDate == null || filters?.SearchFilters?.toDate == undefined || filters?.SearchFilters?.toDate == "" ? delete filters.SearchFilters.toDate : '';
    filters?.SearchFilters?.reconStatus == null || filters?.SearchFilters?.reconStatus == undefined || filters?.SearchFilters?.reconStatus == "" ? delete filters.SearchFilters.reconStatus : '';
    filters?.SearchFilters?.logType == null || filters?.SearchFilters?.logType == undefined || filters?.SearchFilters?.logType == "" ? delete filters.SearchFilters.logType : '';
    filters?.SearchFilters?.pmtGatewayType == null || filters?.SearchFilters?.pmtGatewayType == undefined || filters?.SearchFilters?.pmtGatewayType == "" ? delete filters.SearchFilters.pmtGatewayType : '';
    filters?.SearchFilters?.pmtGatewayId == null || filters?.SearchFilters?.pmtGatewayId == undefined || filters?.SearchFilters?.pmtGatewayId == "" ? delete filters.SearchFilters.pmtGatewayId : '';
    filters?.SearchFilters?.reasonCode == null || filters?.SearchFilters?.reasonCode == undefined || filters?.SearchFilters?.reasonCode == "" ? delete filters.SearchFilters.reasonCode : '';
    filters?.SearchFilters?.notificationStatus == null || filters?.SearchFilters?.notificationStatus == undefined || filters?.SearchFilters?.notificationStatus == "" ? delete filters.SearchFilters.notificationStatus : '';
    filters?.SearchFilters?.extSysRefId == null || filters?.SearchFilters?.extSysRefId == undefined || filters?.SearchFilters?.extSysRefId == "" ? delete filters.SearchFilters.extSysRefId : '';
    filters?.SearchFilters?.configId == null || filters?.SearchFilters?.configId == undefined || filters?.SearchFilters?.configId == "" ? delete filters.SearchFilters.configId : '';
    filters?.SearchFilters?.pmtMethodId?.length == 0 || filters?.SearchFilters?.pmtMethodId == null || filters?.SearchFilters?.pmtMethodId == '' || filters?.SearchFilters?.pmtMethodId == undefined ? delete filters.SearchFilters.pmtMethodId : '';

    filters?.ProcessorConfig?.pmtMethodId == null || filters?.ProcessorConfig?.pmtMethodId == '' || filters?.ProcessorConfig?.pmtMethodId == undefined ? delete filters?.ProcessorConfig?.pmtMethodId : '';
    filters?.ProcessorConfig?.serviceTypeId == null || filters?.ProcessorConfig?.serviceTypeId == '' || filters?.ProcessorConfig?.serviceTypeId == undefined ? delete filters?.ProcessorConfig?.serviceTypeId : '';
    filters?.ProcessorConfig?.processorUrl == null || filters?.ProcessorConfig?.processorUrl == '' || filters?.ProcessorConfig?.processorUrl == undefined ? delete filters?.ProcessorConfig?.processorUrl : '';
    filters?.ProcessorConfig?.merchantName == null || filters?.ProcessorConfig?.merchantName == '' || filters?.ProcessorConfig?.merchantName == undefined ? delete filters?.ProcessorConfig?.merchantName : '';

    filters?.SearchFilters?.billCategory == null || filters?.SearchFilters?.billCategory == '' || filters?.SearchFilters?.billCategory == undefined ? delete filters?.SearchFilters?.billCategory : '';
    filters?.SearchFilters?.instanceId == null || filters?.SearchFilters?.instanceId == '' || filters?.SearchFilters?.instanceId == undefined ? delete filters?.SearchFilters?.instanceId : '';
    filters?.SearchFilters?.transId == null || filters?.SearchFilters?.transId == '' || filters?.SearchFilters?.transId == undefined ? delete filters?.SearchFilters?.transId : '';
    filters?.SearchFilters?.customReportSummaryType == null || filters?.SearchFilters?.customReportSummaryType == '' || filters?.SearchFilters?.customReportSummaryType == undefined ? delete filters?.SearchFilters?.customReportSummaryType : '';
    filters?.SearchFilters?.backendSystem == null || filters?.SearchFilters?.backendSystem == '' || filters?.SearchFilters?.backendSystem == undefined || filters?.SearchFilters?.backendSystem.length == 0 ? delete filters?.SearchFilters?.backendSystem : '';
    filters?.SearchFilters?.invoiceType == null || filters?.SearchFilters?.invoiceType == '' || filters?.SearchFilters?.invoiceType == undefined || filters?.SearchFilters?.invoiceType.length == 0 ? delete filters?.SearchFilters?.invoiceType : '';
    filters?.SearchFilters?.invoiceNo == null || filters?.SearchFilters?.invoiceNo == '' || filters?.SearchFilters?.invoiceNo == undefined || filters?.SearchFilters?.invoiceNo.length == 0 ? delete filters?.SearchFilters?.invoiceNo : '';
    // filters?.SearchFilters?.processStatus == null ||  filters?.SearchFilters?.processStatus == '' ||  filters?.SearchFilters?.processStatus == undefined ? delete  filters?.SearchFilters?.processStatus:'';
    filters?.SearchFilters?.epayTransId == null || filters?.SearchFilters?.epayTransId == '' || filters?.SearchFilters?.epayTransId == undefined || filters?.SearchFilters?.epayTransId.length == 0 ? delete filters?.SearchFilters?.epayTransId : '';
    filters?.SearchFilters?.internalBillCategory == null || filters?.SearchFilters?.internalBillCategory == '' || filters?.SearchFilters?.internalBillCategory == undefined || filters?.SearchFilters?.internalBillCategory.length == 0 ? delete filters?.SearchFilters?.internalBillCategory : '';
    filters?.SearchFilters?.rrn == null || filters?.SearchFilters?.rrn == '' || filters?.SearchFilters?.rrn == undefined || filters?.SearchFilters?.rrn.length == 0 ? delete filters?.SearchFilters?.rrn : '';
    filters?.SearchFilters?.refundSystem == null || filters?.SearchFilters?.refundSystem == '' || filters?.SearchFilters?.refundSystem == undefined || filters?.SearchFilters?.refundSystem.length == 0 ? delete filters?.SearchFilters?.refundSystem : '';
    filters?.SearchFilters?.invoiceStatus == null || filters?.SearchFilters?.invoiceStatus == '' || filters?.SearchFilters?.invoiceStatus == undefined || filters?.SearchFilters?.invoiceStatus.length == 0 ? delete filters?.SearchFilters?.invoiceStatus : '';

    filters?.SearchFilters?.payerId == null || filters?.SearchFilters?.payerId == '' || filters?.SearchFilters?.payerId == undefined || filters?.SearchFilters?.payerId.length == 0 ? delete filters?.SearchFilters?.payerId : '';
    filters?.SearchFilters?.payoutStatus == null || filters?.SearchFilters?.payoutStatus == '' || filters?.SearchFilters?.payoutStatus == undefined || filters?.SearchFilters?.payoutStatus.length == 0 ? delete filters?.SearchFilters?.payoutStatus : '';
    filters?.SearchFilters?.extPrimaryId == null || filters?.SearchFilters?.extPrimaryId == '' || filters?.SearchFilters?.extPrimaryId == undefined || filters?.SearchFilters?.extPrimaryId.length == 0 ? delete filters?.SearchFilters?.extPrimaryId : '';
    filters?.SearchFilters?.payeeAccountNum == null || filters?.SearchFilters?.payeeAccountNum == '' || filters?.SearchFilters?.payeeAccountNum == undefined || filters?.SearchFilters?.payeeAccountNum.length == 0 ? delete filters?.SearchFilters?.payeeAccountNum : '';
    filters?.SearchFilters?.roleStatus == null || filters?.SearchFilters?.roleStatus == '' || filters?.SearchFilters?.roleStatus == undefined || filters?.SearchFilters?.roleStatus.length == 0 ? delete filters?.SearchFilters?.roleStatus : '';
     filters?.SearchFilters?.roleId == null || filters?.SearchFilters?.roleId == '' || filters?.SearchFilters?.roleId == undefined || filters?.SearchFilters?.roleId.length == 0 ? delete filters?.SearchFilters?.roleId : '';
    filters?.SearchFilters?.extRefKey == null || filters?.SearchFilters?.extRefKey == '' || filters?.SearchFilters?.extRefKey == undefined || filters?.SearchFilters?.extRefKey.length == 0 ? delete filters?.SearchFilters?.extRefKey : '';
    filters?.SearchFilters?.refundReason == null || filters?.SearchFilters?.refundReason == '' || filters?.SearchFilters?.refundReason == undefined || filters?.SearchFilters?.refundReason.length == 0 ? delete filters?.SearchFilters?.refundReason : '';
     filters?.SearchFilters?.accrualMonth == null || filters?.SearchFilters?.accrualMonth == '' || filters?.SearchFilters?.accrualMonth == undefined || filters?.SearchFilters?.accrualMonth.length == 0 ? delete filters?.SearchFilters?.accrualMonth : '';
    filters?.SearchFilters?.payrollSrcAccount == null || filters?.SearchFilters?.payrollSrcAccount == '' || filters?.SearchFilters?.payrollSrcAccount == undefined || filters?.SearchFilters?.payrollSrcAccount.length == 0 ? delete filters?.SearchFilters?.payrollSrcAccount : '';

    filters?.SearchFilters?.beneficiaryAccountNumber == null || filters?.SearchFilters?.beneficiaryAccountNumber == '' || filters?.SearchFilters?.beneficiaryAccountNumber == undefined || filters?.SearchFilters?.beneficiaryAccountNumber.length == 0 ? delete filters?.SearchFilters?.beneficiaryAccountNumber : '';
    filters?.SearchFilters?.extSysRefId == null || filters?.SearchFilters?.extSysRefId == '' || filters?.SearchFilters?.extSysRefId == undefined || filters?.SearchFilters?.extSysRefId.length == 0 ? delete filters?.SearchFilters?.extSysRefId : '';
    filters?.SearchFilters?.payrollTransId == null || filters?.SearchFilters?.payrollTransId == '' || filters?.SearchFilters?.payrollTransId == undefined || filters?.SearchFilters?.payrollTransId.length == 0 ? delete filters?.SearchFilters?.payrollTransId : '';
    
  }
  return filters;
}

export function changeDateRange(rangedate, defultFromDate, defaultToDate, latestDateRange, latestTime, timeChange, datepipe: DatePipe) {
  let returnDate = [defultFromDate, defaultToDate];
  timeChange = false;
  let filterFromDate = datepipe.transform(rangedate[0], 'yyyy-MM-dd');
  let filterTodate = datepipe.transform(rangedate[1], 'yyyy-MM-dd');
  let curDate = datepipe.transform(new Date(), 'yyyy-MM-dd');
  let fromTime = datepipe.transform(rangedate[0], 'hh:mm');
  let toTime = datepipe.transform(rangedate[1], 'hh:mm');
  latestDateRange[0] = filterFromDate !== latestDateRange[0] ? filterFromDate : latestDateRange[0];
  latestDateRange[1] = filterTodate !== latestDateRange[1] ? filterTodate : latestDateRange[1];

  if (latestDateRange[0] == filterFromDate && latestDateRange[1] == filterTodate) {
    if (latestTime[0] == fromTime && latestTime[0] == toTime) {
      timeChange = false;
    }
    else if (fromTime == toTime) {
      timeChange = false
    }
    else if (latestTime[0] != fromTime || latestTime[0] != toTime) {
      timeChange = true;
      latestTime[0] = fromTime !== latestTime[0] ? fromTime : latestTime[0];
      latestTime[1] = toTime !== latestTime[1] ? toTime : latestTime[1];
    }
  }
  else {
    timeChange = false
  }

  if (defultFromDate == undefined) {
    defultFromDate = rangedate[0];
    defaultToDate = rangedate[1];
    latestDateRange = [datepipe.transform(rangedate[0], 'yyyy-MM-dd'), datepipe.transform(rangedate[1], 'yyyy-MM-dd')];
    //this.latestTime = [this.datepipe.transform(rangedate[0],'yyyy-MM-dd hh:mm'),this.datepipe.transform(rangedate[1],'yyyy-MM-dd hh:mm')];
    latestTime = [datepipe.transform(rangedate[0], 'hh:mm'), datepipe.transform(rangedate[1], 'hh:mm')]
    return returnDate = [defultFromDate, defaultToDate]
  }

  else if (timeChange == false) {
    if (filterFromDate < curDate && filterTodate < curDate) {
      defultFromDate = rangedate[0];
      defaultToDate = rangedate[1];
      defultFromDate.setHours(0, 0, 0, 0);
      defaultToDate.setHours(23, 59, 59, 59);
      returnDate = [defultFromDate, defaultToDate];
    }
    if (filterFromDate < curDate && filterTodate == curDate) {
      defultFromDate = rangedate[0];
      defaultToDate = rangedate[1];
      defaultToDate.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds(), new Date().getMilliseconds())
      defultFromDate.setHours(0, 0, 0, 0);
      returnDate = [defultFromDate, defaultToDate];
    }
    if (filterFromDate == curDate && filterTodate == curDate) {
      defultFromDate = rangedate[0];
      defaultToDate = rangedate[1];
      defultFromDate.setHours(0, 0, 0, 0);
      defaultToDate.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds(), new Date().getMilliseconds());
      returnDate = [defultFromDate, defaultToDate];
    }
    return returnDate
  }
  else {
    defultFromDate = rangedate[0];
    defaultToDate = rangedate[1];
    return returnDate = [defultFromDate, defaultToDate]
  }

}

export function addFilterHide(inputFilters, extraFilter, searchFilters, amountMax, amountMin) {
  extraFilter.filterhide = false
  //range=false

  if (inputFilters.transId != null) {
    inputFilters.transId = null
    extraFilter.addTransId = false
  }
  if (searchFilters.transId != null) {
    inputFilters.transId = searchFilters.transId;
    extraFilter.addTransId = false;
  }

  if (inputFilters.accountNumber != null) {
    inputFilters.accountNumber = null
    extraFilter.addAccountNo = false
  }
  if (searchFilters.accountNumber != null) {
    inputFilters.accountNumber = searchFilters.accountNumber;
    extraFilter.addAccountNo = false;
  }

  if (inputFilters.batchId != null) {
    inputFilters.batchId = null
    extraFilter.addBatchID = false
  }
  if (searchFilters.batchId != null) {
    inputFilters.batchId = searchFilters.batchId;
    extraFilter.addBatchID = false;
  }

  if (inputFilters.profileId != null) {
    inputFilters.profileId = null
    extraFilter.addProfileID = false
  }
  if (searchFilters.profileId != null) {
    inputFilters.profileId = searchFilters.profileId;
    extraFilter.addProfileID = false;
  }

  if (inputFilters.extSysRefId != null) {
    inputFilters.extSysRefId = null
    extraFilter.addExternalRef = false
  }
  if (searchFilters.extSysRefId != null) {
    inputFilters.extSysRefId = searchFilters.extSysRefId;
    extraFilter.addExternalRef = false;
  }

  if (inputFilters.productId != null) {
    inputFilters.productId = null
    extraFilter.addProductID = false
  }
  if (searchFilters.productId != null) {
    inputFilters.productId = searchFilters.productId;
    extraFilter.addProductID = false;
  }

  if (inputFilters.reasonCode != null) {
    inputFilters.reasonCode = null
    extraFilter.addReasonCode = false
  }
  if (searchFilters.reasonCode != null) {
    inputFilters.reasonCode = searchFilters.reasonCode;
    extraFilter.addReasonCode = false;
  }

  if (inputFilters.serviceNumber != null) {
    inputFilters.serviceNumber = null
    extraFilter.addServiceNo = false
  }
  if (searchFilters.serviceNumber != null) {
    inputFilters.serviceNumber = searchFilters.serviceNumber;
    extraFilter.addServiceNo = false;
  }

  if (inputFilters.notificationStatus != null) {
    inputFilters.notificationStatus = null
    extraFilter.addNotificationStatus = false
  }
  if (searchFilters.notificationStatus != null) {
    inputFilters.notificationStatus = searchFilters.notificationStatus;
    extraFilter.addNotificationStatus = false;
  }

  if (inputFilters.amount != null) {
    inputFilters.amount = null,
      extraFilter.addTransAmt = false
  }
  if (searchFilters.amount != null) {
    inputFilters.amount = searchFilters.amount;
    inputFilters.minMaxAmt = searchFilters.amount
    extraFilter.addTransAmt = false;
  }
  //bills filter
  if (inputFilters.accountNumber != null) {
    inputFilters.accountNumber = null
    extraFilter.addAccountno = false
  }
  if (searchFilters.accountNumber != null) {
    inputFilters.accountNumber = searchFilters.accountNumber;
    extraFilter.addAccountno = false;
  }
  if (inputFilters.amount != null) {
    inputFilters.amount = null
    extraFilter.addBillAmt = false
  }
  if (searchFilters.amount != null) {
    inputFilters.amount = searchFilters.amount;
    extraFilter.addBillAmt = false;
  }
  if (inputFilters.billCategory != null) {
    inputFilters.billCategory = null
    extraFilter.addBillCategory = false
  }
  if (searchFilters.billCategory != null) {
    inputFilters.billCategory = searchFilters.billCategory;
    extraFilter.addBillCategory = false;
  }
  //non sadad filter
  if (inputFilters.amount != null) {
    inputFilters.amount = null
    extraFilter.addAmount = false
  }
  if (searchFilters.amount != null) {
    inputFilters.amount = searchFilters.amount;
    extraFilter.addAmount = false;
  }
  if (inputFilters.billNumber != null) {
    inputFilters.billNumber = null
    extraFilter.addBillNo = false
  }
  if (searchFilters.billNumber != null) {
    inputFilters.billNumber = searchFilters.billNumber;
    extraFilter.addBillNo = false;
  }
  //refund filter
  if (inputFilters.iban != null) {
    inputFilters.iban = null
    extraFilter.addIBAN = false
  }
  if (searchFilters.iban != null) {
    inputFilters.iban = searchFilters.iban;
    extraFilter.addIBAN = false;
  }

  if (inputFilters.amount != null) {
    inputFilters.amount = null
    extraFilter.addRefundAmt = false
  }
  if (searchFilters.amount != null) {
    inputFilters.amount = searchFilters.amount;
    extraFilter.addRefundAmt = false;
  }
  if (extraFilter.range) {
    if (inputFilters.amountMin != null) {
      inputFilters.amountMin = null
      extraFilter.range = false

    }
    if (inputFilters.amountMax != null) {
      inputFilters.amountMax = null
      extraFilter.range = false

    }
    if (inputFilters.amountMin == null && inputFilters.amountMax == null) {
      extraFilter.range = false

    }

    if (searchFilters.amount != null || searchFilters.amount != null || searchFilters.amount != null) {
      inputFilters.amountMin = amountMin
      inputFilters.amountMax = amountMax
    }
  }

  if (inputFilters.amountMin != null && inputFilters.amountMax != null && (searchFilters.amount != null || searchFilters.amount != null || searchFilters.amount != null)) {
    extraFilter.range = true;
    inputFilters.amount = null;
    inputFilters.amount = null
    inputFilters.amount = null
  }
  if (inputFilters.amount != null && searchFilters.amount != null) {
    extraFilter.range = false;
    extraFilter.addTransAmt = false;
    searchFilters.amount = inputFilters.amount;

  }
  if (inputFilters.amount != null && searchFilters.amount != null) {
    extraFilter.range = false;
    extraFilter.addBillAmt = false;
    searchFilters.amount = inputFilters.amount;

  }
  if (inputFilters.amount != null && searchFilters.amount != null) {
    extraFilter.range = false;
    extraFilter.addRefundAmt = false;
    searchFilters.amount = inputFilters.amount;

  }

}

export function additionalFIlters(extraFilter, inputFilters, amountMax, amountMin, searchFilters) {

  extraFilter.filterhide = false

  if (inputFilters.transId != null) {
    extraFilter.addTransId = false;
    searchFilters.transId = inputFilters.transId
  }
  if (inputFilters.accountNumber != null) {
    extraFilter.addAccountNo = false;
    searchFilters.accountNumber = inputFilters.accountNumber
  }
  if (inputFilters.batchId != null) {
    extraFilter.addBatchID = false;
    searchFilters.batchId = inputFilters.batchId
  }
  if (inputFilters.profileId != null) {
    extraFilter.addProfileID = false;
    searchFilters.profileId = inputFilters.profileId
  }
  if (inputFilters.extSysRefId != null) {
    extraFilter.addExternalRef = false;
    searchFilters.extSysRefId = inputFilters.extSysRefId
  }
  if (inputFilters.productId != null) {
    extraFilter.addProductID = false;
    searchFilters.productId = inputFilters.productId
  }

  if (inputFilters.reasonCode != null) {
    extraFilter.addReasonCode = false;
    searchFilters.reasonCode = inputFilters.reasonCode
  }

  if (inputFilters.serviceNumber != null) {
    extraFilter.addServiceNo = false;
    searchFilters.serviceNumber = inputFilters.serviceNumber
  }

  if (inputFilters.notificationStatus != null) {
    extraFilter.addNotificationStatus = false;
    searchFilters.notificationStatus = inputFilters.notificationStatus
  }

  if (inputFilters.buyerId != null) {
    extraFilter.addBuyerId = false;
    searchFilters.buyerId = inputFilters.buyerId
  }

  if (inputFilters.sellerId != null) {
    extraFilter.addSellerId = false;
    searchFilters.sellerId = inputFilters.sellerId
  }

  if (inputFilters.invoiceIdentifier != null) {
    extraFilter.addInvoiceIdentifier = false;
    searchFilters.invoiceIdentifier = inputFilters.invoiceIdentifier
  }

  if (inputFilters.orderRefId != null) {
    extraFilter.addOrderRefId = false;
    searchFilters.orderRefId = inputFilters.orderRefId
  }

  if (inputFilters.sourceSystem != null) {
    extraFilter.addSourceSystem = false;
    searchFilters.sourceSystem = inputFilters.sourceSystem
  }

  if (inputFilters.amount != null) {
    extraFilter.addTransAmt = false;
    searchFilters.amount = inputFilters.amount

  }

  if (inputFilters.amount != null && extraFilter.range == false) {
    inputFilters.amountMin = null
    inputFilters.amountMax = null
  }
  //bills filter
  if (inputFilters.accountNumber != null) {
    extraFilter.addAccountno = false;
    searchFilters.accountNumber = inputFilters.accountNumber
  }
  if (inputFilters.amount != null) {
    extraFilter.addBillAmt = false;
    searchFilters.amount = inputFilters.amount
  }
  if (inputFilters.billCategory != null) {
    extraFilter.addBillCategory = false;
    searchFilters.billCategory = inputFilters.billCategory
  }
  if (inputFilters.amount != null && extraFilter.range == false) {
    // inputFilters.amountMin = null
    //inputFilters.amountMax = null
    inputFilters.billAmountMax = null;
    inputFilters.billAmountMin = null;
  }
  //non - sadad filter
  if (inputFilters.billNumber != null) {
    extraFilter.addBillNo = false;
    searchFilters.billNumber = inputFilters.billNumber
  }
  if (inputFilters.amount != null) {
    extraFilter.addAmount = false;
    searchFilters.amount = inputFilters.amount
  }
  //refund filter
  if (inputFilters.iban != null) {
    extraFilter.addIBAN = false;
    searchFilters.iban = inputFilters.iban

  }

  if (inputFilters.amount != null) {
    extraFilter.addRefundAmt = false;
    searchFilters.amount = inputFilters.amount
  }
  if (inputFilters.amount != null && extraFilter.range == false) {
    inputFilters.amountMin = null
    inputFilters.amountMax = null
  }

  if (extraFilter.range) {
    extraFilter.addTransAmt = false;
    extraFilter.addBillAmt = false;
    extraFilter.addRefundAmt = false;
    inputFilters.amount = null;
    inputFilters.amount = null;
    inputFilters.amount = null;
    if (inputFilters.amountMin != null) {
      extraFilter.addTransAmt = false;
      extraFilter.addBillAmt = false;
      extraFilter.addRefundAmt = false;
      amountMin = inputFilters.amountMin

    }
    if (inputFilters.amountMax != null) {
      extraFilter.addTransAmt = false;
      extraFilter.addBillAmt = false;
      extraFilter.addRefundAmt = false;
      amountMax = inputFilters.amountMax
    }

    if (inputFilters.billAmountMin != null) {
      extraFilter.addTransAmt = false;
      extraFilter.addBillAmt = false;
      extraFilter.addRefundAmt = false;
      amountMin = inputFilters.billAmountMin

    }
    if (inputFilters.billAmountMax != null) {
      extraFilter.addTransAmt = false;
      extraFilter.addBillAmt = false;
      extraFilter.addRefundAmt = false;
      amountMax = inputFilters.billAmountMax
    }

    inputFilters.amount = null;
    inputFilters.amount = null;
    inputFilters.amount = null;
    searchFilters.amount = amountMin + ',' + amountMax;
    searchFilters.amount = amountMin + ',' + amountMax;
    searchFilters.amount = amountMin + ',' + amountMax;
    if (amountMin == null && amountMax == null) {
      searchFilters.amount = null
      extraFilter.range = false;
      searchFilters.amount = null;
      searchFilters.amount = null;
    }
  }
}


export function filterAssign(extraFilter, filterName: string, labelName: string) {

  Object.entries(extraFilter).forEach((value) => {
    if (value[0] == 'filterhide') {
      extraFilter[value[0]] = true
    }
    if (value[0] == 'labelName') {
      extraFilter['labelName'] = labelName
    }
    if (value[0] == filterName) {
      extraFilter[filterName] = true
    }
    else {
      let name = value[0] != 'filterhide' && value[0] != 'labelName' && value[0] != filterName ? value[0] : null;
      name != null ? extraFilter[name] = false : '';
    }
  })
}
export function addFiltertransAmt(extraFilter, searchFilters, inputFilters) {
  extraFilter.filterhide = true
  extraFilter.addTransAmt = true
  extraFilter.addTransId = false
  extraFilter.addAccountNo = false
  extraFilter.addBatchID = false
  extraFilter.addProfileID = false
  extraFilter.addExternalRef = false
  extraFilter.addProductID = false
  extraFilter.addReasonCode = false
  extraFilter.addServiceNo = false
  extraFilter.addNotificationStatus = false
  extraFilter.labelName = keyWords.transAmount
  let split = searchFilters?.amount?.split(",");
  if (split != undefined && split != null && split[1] != undefined) {
    inputFilters.amountMin = split[0];
    inputFilters.amountMax = split[1];
    extraFilter.range = true;
    inputFilters.amount = null

  }
}

//bill amount checkbox implementation
export function addFilterBillAmt(extraFilter, searchFilters, inputFilters) {
  extraFilter.filterhide = true
  extraFilter.addBillAmt = true
  extraFilter.addServiceNo = false
  extraFilter.addProfileID = false
  extraFilter.addAccountno = false
  extraFilter.addTransId = false
  extraFilter.addReasonCode = false
  extraFilter.addBillCategory = false
  extraFilter.labelName = keyWords.billAmt
  let split = searchFilters?.amount?.split(",");
  if (split != undefined && split != null && split[1] != undefined) {
    inputFilters.amountMin = split[0];
    inputFilters.amountMax = split[1];
    extraFilter.range = true;
    inputFilters.amount = null
  }
}
export function addFilterRefundAmt(extraFilter, searchFilters, inputFilters) {
  extraFilter.filterhide = true;
  extraFilter.addRefundAmt = true;
  extraFilter.addIBAN = false;
  extraFilter.labelName = "Refund Amount";
  let split = searchFilters?.amount?.split(",");
  //console.log("additionalFIlters", split, split[1])
  if (split != undefined && split != null && split[1] != undefined) {
    inputFilters.amountMin = split[0];
    inputFilters.amountMax = split[1];
    extraFilter.range = true;
    inputFilters.amount = null
  }
}
//funtion to hide and show sensitive data
export function customizeText(container, options) {
  var pixelWidth = require('string-pixel-width');
  let div = document.createElement('div');
  div.style.display = 'flex';
  let a = document.createElement('a');
  let span = document.createElement('div');
  span.classList.add('textDiv')
  let textNode = document.createTextNode('******');
  span.appendChild(textNode);
  span.style.paddingRight = '10px';
  a.classList.add('color-black')
  let html = '<i class="fa fa-eye-slash" ></i>'
  let showPswd = false;
  a.onclick = () => {
    showPswd = !showPswd;
    //this.showPswd = !this.showPswd;
    const spanText = container.querySelector('.textDiv');
    if (spanText != null && spanText != undefined) {
      options.displayValue == null && options.displayValue == undefined ? options.displayValue = "NULL" : options.displayValue;
      showPswd ? spanText.innerText = options.displayValue : spanText.innerText = "******";
      if (spanText.innerText != "******") {
        div.setAttribute("data-toggle", "tooltip");
        div.setAttribute("data-placement", "top");
        div.setAttribute("title", options?.displayValue);
        a.innerHTML = '<i class="fa fa-eye" ></i>'
      } else {
        div.removeAttribute("data-toggle");
        div.removeAttribute("data-placement");
        div.removeAttribute("title");
        a.innerHTML = '<i class="fa fa-eye-slash" ></i>'
      }
      const width = pixelWidth(options.column.caption, { size: 14, weight: 700 });
      const dataWidth = pixelWidth(options.displayValue, { size: 14, weight: 400 });
      if (Math.trunc(width) < Math.trunc(dataWidth)) {
        spanText.style.minWidth = width;
        spanText.style.maxWidth = width;
        spanText.style.width = width;
        spanText.style.whiteSpace = "nowrap";
        spanText.style.overflow = "hidden";
        spanText.style.textOverflow = "ellipsis";
      }
    }
    // options.cellElement.innerText= options.displayValue;
  }
  a.style.pointerEvents = "all"
  a.innerHTML = html;
  div.append(span);
  div.append(a)
  // return div;
  return div;
}

export function customizeText2(container, options) {
  let div = document.createElement('div');
  div.style.display = 'flex';
  let a = document.createElement('a');
  let span = document.createElement('div');
  span.classList.add('textDiv')
  let textNode = document.createTextNode('******');
  span.appendChild(textNode);
  span.style.paddingRight = '10px';
  a.classList.add('color-black');
  a.style.opacity = '0.5'
  let html = '<i class="fa fa-eye-slash" ></i>'
  let showPswd = false;

  a.style.pointerEvents = "none"
  a.innerHTML = html;
  div.append(span);
  div.append(a)
  // return div;
  return  div;
}
