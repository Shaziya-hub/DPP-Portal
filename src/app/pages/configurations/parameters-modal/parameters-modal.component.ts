import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from 'src/app/model/page-config';
import { dropdown } from 'src/app/shared/constant';
import { ApiPaths, deepClone, deleteFilters } from 'src/app/shared/utils';
import { ParametersModalService } from './parameters-modal.service';

@Component({
  selector: 'parameters-modal',
  templateUrl: './parameters-modal.component.html',
  styleUrls: ['parameters-modal.component.scss']
})
export class ParametersModalComponent implements OnInit {
  closeResult: string;
  parameter: any = {
    serviceId: { key: null, value: dropdown.selectBizService },
    name: null,
    value: null,
    description: null
  };
  pageConfig: PageConfig;
  formSubmitted: boolean;
  orgFlag: boolean;
  serviceFlag: boolean;


  isNew: boolean;
  constructor(private parametersModalService: ParametersModalService, public translate: TranslateService) { }

  ngOnInit(): void {
    if (this.parametersModalService.parameter) {
      this.parameter = this.parametersModalService.parameter;
    }
    this.pageConfig = this.parametersModalService.pageConfig;
    if (this.parameter && this.pageConfig) {
      this.isNew = this.parameter.id ? false : true;
    }
  }

  close() {
    this.parametersModalService.parameter = null;
    this.parametersModalService.close()
  }

  getBizServicesSetting = {
    text: this.translate.instant(dropdown.selectBizService)
  }
  onChange() {

    if (this.parameter.serviceId == null) {
      this.serviceFlag = true
      this.orgFlag = false

    }
    else {
      this.serviceFlag = false

    }

  }
  save() {
    this.formSubmitted = true;
    if (this.isNew && (this.parameter.serviceId == null || this.parameter.serviceId.length == 0) || (this.parameter.name == null || this.parameter.name == '')
      || (this.parameter.value == null || this.parameter.value == '') || (this.parameter.description == null || this.parameter.description == '')) {
      //console.log('parameter return')
      return

    }
    let filters = deepClone(this.parameter);
    filters.serviceId = filters.serviceId?.key ? filters.serviceId.key : filters.serviceId
    let body = {
      ParameterDetails: filters
    }
    // let filters = deleteFilters(body)
    body.ParameterDetails.directory == null || body.ParameterDetails.directory == '' || body.ParameterDetails.directory == undefined ? delete body.ParameterDetails.directory : '';
    body.ParameterDetails.serviceId == null || body.ParameterDetails.serviceId == '' || body.ParameterDetails.serviceId == undefined ? delete body.ParameterDetails.serviceId : '';
    body.ParameterDetails.name == null || body.ParameterDetails.name == '' || body.ParameterDetails.name == undefined ? delete body.ParameterDetails.name : '';
    body.ParameterDetails.value == null || body.ParameterDetails.value == '' || body.ParameterDetails.value == undefined ? delete body.ParameterDetails.value : '';
    body.ParameterDetails.organizationId == null || body.ParameterDetails.organizationId == '' || body.ParameterDetails.organizationId == undefined ? delete body.ParameterDetails.organizationId : '';
    body.ParameterDetails.organizationName == null || body.ParameterDetails.organizationName == '' || body.ParameterDetails.organizationName == undefined ? delete body.ParameterDetails.organizationName : '';
    this.parametersModalService.save(this.isNew ? ApiPaths.createParameter : ApiPaths.updateParameters, body);
  }

  onServiceChange(e, selectedValue) {
    this.parameter.serviceId = { key: selectedValue, value: e?.target?.innerHTML }
  }
}
