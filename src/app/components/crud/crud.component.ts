import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent implements OnInit {

  loading: boolean = false;
  items$: Observable<any[]>;
  usuarioActual: any;
  editarIdDocumento: string = "";
  datosUsuarioForm!: FormGroup;
  dataUser: any;

  modalAbierto: boolean = false;
  modalEliminarAbierto: boolean = false;
  usuarioAEliminarIdDocumento: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {
    const collectionRef = this.firestore.collection('usuarios');
    this.items$ = collectionRef.valueChanges();

    this.afAuth.authState.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
  }

  ngOnInit(): void {
    this.datosUsuarioForm = new FormGroup({
      nombre: new FormControl(''),
      apellido: new FormControl(''),
      email: new FormControl(''),
      horas: new FormControl('')
    });

    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.dataUser = user;
        console.log(user);
        if(user.uid == "H1vrgH7AJ3aAVZbpQ3lNf75qqbb2"){
          console.log("todo bem")
        }else{
          this.router.navigate(['/login']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });





  }



  logOut() {
    this.afAuth.signOut().then(() => this.router.navigate(['/login']));
  }

  abrirModalEdicion(uid: string, usuario: any) {
    const usuariosCollectionRef = this.firestore.collection('usuarios');
    const queryRef = usuariosCollectionRef.ref.where('UID', '==', uid);

    queryRef.get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const id = doc.id;
            console.log('ID del documento:', id);
            this.editarIdDocumento = id;
            this.datosUsuarioForm.patchValue(usuario);
            this.modalAbierto = true;
          });
        } else {
          console.error('No se encontró el documento con el UID:', uid);
        }
      })
      .catch((error) => {
        console.error('Error al obtener el documento:', error);
      });
  }

  cerrarModal() {
    this.modalAbierto = false;
  }


idDocumentoAEliminar: string = "";


abrirModalConfirmacionEliminar(uid: string) {
  const usuariosCollectionRef = this.firestore.collection('usuarios');
  const queryRef = usuariosCollectionRef.ref.where('UID', '==', uid);

  queryRef.get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const id = doc.id;
          console.log('ID del documento:', id);
          this.idDocumentoAEliminar = id;
          this.modalEliminarAbierto = true;

        });
      } else {
        console.error('No se encontró el documento con el UID:', uid);
      }
    })
    .catch((error) => {
      console.error('Error al obtener el documento:', error);
    });
}


  cerrarModalEliminar() {
    this.modalEliminarAbierto = false;
  }

  eliminarUsuario() {
    const idDocumento = this.idDocumentoAEliminar;
    console.log('ID del documento a eliminar:', idDocumento);


    if (!idDocumento) {
      console.error('ID del documento a eliminar no especificado.');
      return;
    }


    this.firestore.collection('usuarios').doc(idDocumento).delete()
      .then(() => {
        this.modalEliminarAbierto = false;

        console.log('Usuario eliminado correctamente.');

      })
      .catch((error) => {
        console.error('Error al eliminar el usuario:', error);
      });
  }




  guardarCambios() {
    const documentoRef = this.firestore.collection('usuarios').doc(this.editarIdDocumento);
    const datosUsuario = this.datosUsuarioForm.value;

    documentoRef.update(datosUsuario)
      .then(() => {
        console.log('Datos de usuario actualizados correctamente.');
        this.cerrarModal();
      })
      .catch((error) => {
        console.error('Error al actualizar los datos del usuario:', error);
      });
  }
}
