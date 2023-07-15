import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Modulos
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

// Componentes
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegistrarUsuarioComponent } from './components/registrar-usuario/registrar-usuario.component';

import { SpinnerComponent } from './shared/spinner/spinner.component';

import { CrudComponent } from './components/crud/crud.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { AgregarHorasComponent } from './components/agregar-horas/agregar-horas.component';

import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    RegistrarUsuarioComponent,

    SpinnerComponent,
    CrudComponent,
    AgregarHorasComponent,
    

  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(), provideFirebaseApp(() => initializeApp(environment.firebase)), provideFirestore(() => getFirestore()), // ToastrModule added
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
