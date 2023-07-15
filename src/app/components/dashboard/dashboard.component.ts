import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { map } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  dataUser: any;

  constructor(private afAuth: AngularFireAuth,
      private router: Router,
      ) {
        this.afAuth.authState.subscribe((usuario) => {
          this.usuarioActual = usuario;
          this.actualizarVisibilidadDiv();
        });

      }

 
ngOnInit(): void {
  this.actualizarVisibilidadDiv();
  this.afAuth.onAuthStateChanged((user) => {
    if (user) {
      this.dataUser = user;
      console.log(user);
    } else {
      this.router.navigate(['/login']);
    }
  });
}
  
  usuarioActual: any;
mostrarDiv: boolean = false;

  actualizarVisibilidadDiv(): void {
    const usuarioPermitidoUID = 'H1vrgH7AJ3aAVZbpQ3lNf75qqbb2';
    this.mostrarDiv = this.usuarioActual?.uid === usuarioPermitidoUID;
  }

  logOut() {
    this.afAuth.signOut().then(() => this.router.navigate(['/login']));
  }


  

}
