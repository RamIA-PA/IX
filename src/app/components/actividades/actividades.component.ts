import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css']
})
export class ActividadesComponent implements OnInit {

  loading: boolean = false;

  usuarioActual: any;

  datosUsuarioForm!: FormGroup;
  dataUser: any;

  modalAbierto: boolean = false;
  modalEliminarAbierto: boolean = false;
  usuarioAEliminarIdDocumento: string = '';

  mostrarcontenido: boolean = false;


  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {
    const collectionRef = this.firestore.collection('usuarios');


    this.afAuth.authState.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
  }

  ngOnInit(): void {


    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.dataUser = user;
        console.log(user);
      } else {
        this.router.navigate(['/login']);
      }
    });


  }



  actividadSeleccionada: string = '';
  descripcionSeleccionada: string = '';
  horasSeleccionadas: number = 0;



  verListado(actividad: string) {
    const nombreColeccion = actividad.toLowerCase().replace(/\s/g, '');
    this.router.navigate(['/listas'], { queryParams: { actividad: nombreColeccion } });
  }


  unirseAColeccionActividad(actividad: string, descripcion: string, horas: number) {
    const userEmail = this.dataUser.email;

    // Verificar si el usuario ya se unió a la colección correspondiente
    const nombreColeccion = actividad.toLowerCase().replace(/\s/g, ''); // Generar el nombre de la colección a partir de la actividad
    this.firestore.collection(nombreColeccion, ref => ref.where('email', '==', userEmail))
      .get()
      .subscribe(querySnapshot => {
        if (!querySnapshot.empty) {
          console.log(`El usuario ya está registrado en la colección "${nombreColeccion}".`);
        } else {
          // Si el usuario no está registrado, procedemos a agregarlo
          this.firestore.collection('usuarios', ref => ref.where('email', '==', userEmail).where('actividad', '==', 'creacion'))
            .get()
            .subscribe(querySnapshot => {
              if (!querySnapshot.empty) {
                // Debe haber solo un documento coincidente, ya que los correos electrónicos son únicos
                const userData: any = querySnapshot.docs[0].data();

                // Verificar si el documento tiene las propiedades necesarias
                if ('nombre' in userData && 'apellido' in userData && 'cedula' in userData) {
                  // Verificar si el límite de 10 usuarios ya se ha alcanzado en la colección correspondiente
                  this.firestore.collection(nombreColeccion)
                    .get()
                    .subscribe(snapshot => {
                      if (snapshot.size < 10) {
                        // Agregar los datos del usuario a la colección correspondiente
                        this.firestore.collection(nombreColeccion)
                          .add({
                            nombre: userData.nombre,
                            apellido: userData.apellido,
                            cedula: userData.cedula,
                            email: userEmail,
                            horas: horas,
                            actividad: actividad, // Utilizar el valor del parámetro actividad
                            descripcion: descripcion
                          })
                          .then(() => {
                            console.log(`Usuario unido a la colección "${nombreColeccion}".`);
                          })
                          .catch(error => {
                            console.error(`Error al unirse a la colección "${nombreColeccion}":`, error);
                          });
                      } else {
                        console.log(`Se alcanzó el límite de 10 usuarios en la colección "${nombreColeccion}".`);
                      }
                    });
                } else {
                  console.error('El documento de usuario no tiene las propiedades necesarias (nombre, apellido y cedula).');
                }
              } else {
                console.log(`El usuario no tiene actividad igual a "creacion" en la colección "usuarios".`);
              }
            });
        }
      });
  }












  nav(){
    this.router.navigate(["/listas"])
  }






}
