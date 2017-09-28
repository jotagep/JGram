import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubirPage } from './subir';

import { PipesModule } from './../../pipes/pipes.module';

@NgModule({
  declarations: [
    SubirPage,
  ],
  imports: [
    IonicPageModule.forChild(SubirPage),
    PipesModule
  ],
})
export class SubirPageModule {}
