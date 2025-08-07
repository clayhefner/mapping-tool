import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TokenImportComponent } from './token-import.component';
import { MappingTreeComponent } from './mapping-tree.component';

const routes: Routes = [
  { path: '', redirectTo: '/token-imports', pathMatch: 'full' },
  { path: 'token-imports', component: TokenImportComponent },
  { path: 'mapping', component: MappingTreeComponent },
  { path: '**', redirectTo: '/token-imports' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
