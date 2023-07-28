import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { ActividadService, NuevaActividad } from 'src/app/actividad.service';

interface VoluntarioParaProtocolo {
  nombre: string;
  apellido: string;
  actividad: string;
  cedula: string;
  descripcion: string;
  email: string;
  horas: number;
  checkboxMarcado: boolean;
}

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css'],
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
    private firestore: AngularFirestore,
    private actividadesService: ActividadService
  ) {
    this.afAuth.authState.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
  }

  ngOnInit(): void {
    this.obtenerNuevasActividades();
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
    const nombreColeccion = actividad.toLowerCase().replace(/\s/g, '');

    this.firestore
      .collection(nombreColeccion, (ref) => ref.where('email', '==', userEmail))
      .get()
      .subscribe((querySnapshot) => {
        if (!querySnapshot.empty) {
          console.log(`El usuario ya está registrado en la colección "${nombreColeccion}".`);
        } else {
          this.firestore
            .collection('usuarios', (ref) =>
              ref.where('email', '==', userEmail).where('actividad', '==', 'creacion')
            )
            .get()
            .subscribe((querySnapshot) => {
              if (!querySnapshot.empty) {
                const userData: any = querySnapshot.docs[0].data();

                if ('nombre' in userData && 'apellido' in userData && 'cedula' in userData) {
                  this.firestore
                    .collection(nombreColeccion)
                    .get()
                    .subscribe((snapshot) => {
                      if (snapshot.size < 10) {
                        this.firestore
                          .collection(nombreColeccion)
                          .add({
                            nombre: userData.nombre,
                            apellido: userData.apellido,
                            cedula: userData.cedula,
                            email: userEmail,
                            horas: horas,
                            actividad: actividad,
                            descripcion: descripcion,
                          })
                          .then(() => {
                            console.log(`Usuario unido a la colección "${nombreColeccion}".`);
                          })
                          .catch((error) => {
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

  nav() {
    this.router.navigate(['/listas']);
  }

  nuevasActividades: NuevaActividad[] = [];
  nuevaActividad: NuevaActividad = { nombre: '', descripcion: '', horas: 0 };

  obtenerNuevasActividades() {
    this.actividadesService.obtenerActividades().subscribe(
      (actividades) => {
        this.nuevasActividades = actividades;
      },
      (error) => {
        console.error('Error al obtener actividades:', error);
      }
    );
  }

  crearNuevaActividad() {
    this.actividadesService.agregarActividad(
      this.nuevaActividad.nombre,
      this.nuevaActividad.descripcion,
      this.nuevaActividad.horas
    );

    this.obtenerNuevasActividades();

    this.nuevaActividad = { nombre: '', descripcion: '', horas: 0 };
    this.modalAbierto = false;
  }

  mostrarDiv: boolean = false;

  actualizarVisibilidadDiv(): void {
    const usuarioPermitidoUID = 'H1vrgH7AJ3aAVZbpQ3lNf75qqbb2';
    this.mostrarDiv = this.usuarioActual?.uid === usuarioPermitidoUID;
  }
}
