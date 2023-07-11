import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

import { FirebaseCodeErrorService } from 'src/app/services/firebase-code-error.service';
import { ToastrService } from 'ngx-toastr';


import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent implements OnInit {

  loading: boolean = false;
  items$: Observable<any[]>;


  constructor(
    private afAuth: AngularFireAuth,
      private router: Router,
      private firestore: AngularFirestore,
      private service: FirebaseCodeErrorService,
      private toastr: ToastrService

  ) {

    const collectionRef = this.firestore.collection('usuarios');

    // Realiza la consulta y asigna el resultado a la propiedad items$
    this.items$ = collectionRef.valueChanges();

   }





  dataUser: any;



  ngOnInit(): void {
    this.afAuth.currentUser.then(user => {
      if(user && user.emailVerified) {
        this.dataUser = user;
        console.log(user)
      } else {
        this.router.navigate(['/login']);
      }
    })
  }

  logOut() {
    this.afAuth.signOut().then(() => this.router.navigate(['/login']));
  }

  eliminarUsuario(usuario: any) {
    const documentRef = this.firestore.collection('usuarios').doc(usuario.id);

    documentRef.delete()
      .then(() => {
        console.log('Usuario eliminado exitosamente.');
      })
      .catch((error) => {
        console.error('Error al eliminar el usuario:', error);
      });
  }




  eliminar(UID: string) {
    console.log('ID del usuario a eliminar:', UID);
    this.service.eliminarUser(UID).then(() => {
      console.log('Usuario eliminado con éxito');
      this.toastr.error('El usuario fue eliminado con éxito', 'Registro eliminado!', {
        positionClass: 'toast-bottom-right'
      });
    }).catch(error => {
      console.log('Error al eliminar el usuario:', error);
    });
  }


}
