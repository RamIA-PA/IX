import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';


interface Usuario {
  horas: number;
  actividad: string;
  descripcion: string;

}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  dataUser: any;
  usuarioActual: any;
  mostrarDiv: boolean = false;
  horasAcumuladas: number = 0;
  porcentaje: number = 0;
  usuarios: Usuario[] = [];
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe((usuario) => {
      this.usuarioActual = usuario;
      this.actualizarVisibilidadDiv();

      if (usuario) {
        this.dataUser = usuario;
        console.log(usuario);


        this.firestore.collection<Usuario>('usuarios', ref => ref.where('email', '==', usuario.email))
          .get().subscribe((querySnapshot) => {
            let totalHoras = 0;
            const usuarios: Usuario[] = [];

            querySnapshot.forEach((doc) => {
              const data = doc.data() as Usuario;
              usuarios.push(data);
              totalHoras += data.horas || 0;
            });

            this.usuarios = usuarios;
            this.horasAcumuladas = totalHoras;
            this.porcentaje = Number(((this.horasAcumuladas / 120) * 100).toFixed(2));
          });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  actualizarVisibilidadDiv(): void {
    const usuarioPermitidoUID = 'H1vrgH7AJ3aAVZbpQ3lNf75qqbb2';
    this.mostrarDiv = this.usuarioActual?.uid === usuarioPermitidoUID;
  }

  logOut() {
    this.afAuth.signOut().then(() => this.router.navigate(['/login']));
  }

  nav(){
    this.router.navigate(["/actividad"])
  }
}
