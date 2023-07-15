import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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

    
    this.afAuth.currentUser.then(user => {
      if(user) {
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


modalAbierto: boolean = false;
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



  eliminarDato(uid: string) {
    const firestore = getFirestore();
    const usuariosCollectionRef = collection(firestore, 'usuarios');
    const queryRef = query(usuariosCollectionRef, where('UID', '==', uid));

    getDocs(queryRef)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const id = doc.id;  
          console.log('ID del documento a eliminar:', id);  

          deleteDoc(doc.ref)
            .then(() => {
              console.log('Dato eliminado correctamente.');
            })
            .catch((error) => {
              console.error('Error al eliminar el dato:', error);
            });
        });
      })
      .catch((error) => {
        console.error('Error al obtener el dato:', error);
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

