import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';

import { CrudComponent } from './components/crud/crud.component';
import { RegistrarUsuarioComponent } from './components/registrar-usuario/registrar-usuario.component';
import { AgregarHorasComponent } from './components/agregar-horas/agregar-horas.component';
import { ActividadesComponent } from './components/actividades/actividades.component';
import { ListasComponent } from './components/listas/listas.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registrar-usuario', component: RegistrarUsuarioComponent },


  { path: 'crud', component: CrudComponent },
  { path: 'listas', component: ListasComponent },
  { path: 'actividad', component: ActividadesComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'agregar', component: AgregarHorasComponent },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
