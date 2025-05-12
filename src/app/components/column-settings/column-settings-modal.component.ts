import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/services/notification.service';
import { ColumnSettingsModalService } from './column-settings-modal.service';

@Component({
  selector: 'column-settings-modal',
  templateUrl: './column-settings-modal.component.html',
  styleUrls: ['column-settings-modal.component.scss']
})
export class ColumnSettingsModalComponent implements OnInit {
  closeResult: string;

  constructor(public columnSettingsModalService: ColumnSettingsModalService, private notification: NotificationService, private translate: TranslateService) { }
  selectableColumns: any[] = [];
  selectableColumnsDetails: any[] = [];
  tabIndex: number = 0;

  ngOnInit(): void {
    this.selectableColumns = this.columnSettingsModalService.selectableColumns;
    //console.log('selec',this.selectableColumns)
    this.selectableColumnsDetails = this.columnSettingsModalService.selectableColumnsDetails;

  }

  close() {
    this.columnSettingsModalService.close()
  }

  onChange(event, col) {
    col.flag = event.target.checked.toString();
  }

  apply() {
    if (this.tabIndex == 0) {
      let allDeSelected = this.selectableColumns.filter(o => o.flag == "true").length == 0
      if (allDeSelected) {
        this.notification.showError(this.translate.instant("Minimum one column must be selected"));
        return;
      }
    } else {
      let allDeSelected = this.selectableColumnsDetails.filter(o => o.flag == "true").length == 0
      if (allDeSelected) {
        this.notification.showError(this.translate.instant("Minimum one column must be selected"));
        return;
      }
    }
    this.columnSettingsModalService.updateSelectableColumns(this.selectableColumns, this.selectableColumnsDetails);
  }

  tabClicked(index) {
    if (index == 1 && this.selectableColumnsDetails.length == 0) {
      return;
    }
    this.tabIndex = index;
  }
}
