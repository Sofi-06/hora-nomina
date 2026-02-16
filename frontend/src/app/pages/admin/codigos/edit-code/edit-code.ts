import { Component } from '@angular/core';
import { NavComponent } from '../../../../components/nav-component/nav-component';
import { Footer } from '../../../../components/footer/footer';

@Component({
  selector: 'app-edit-code',
  imports: [ NavComponent,Footer],
  templateUrl: './edit-code.html',
  styleUrl: './edit-code.css',
})
export class EditCode {

}
