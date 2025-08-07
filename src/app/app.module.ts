import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MappingTreeComponent } from './mapping-tree.component';
import { DataSourceManagerComponent } from './data-source-manager.component';
import { TokenImportComponent } from './token-import.component';

@NgModule({
  declarations: [
    AppComponent,
    MappingTreeComponent,
    DataSourceManagerComponent,
    TokenImportComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    NzTreeModule,
    NzSelectModule,
    NzIconModule,
    NzModalModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
