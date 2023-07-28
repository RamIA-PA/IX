import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { map } from 'rxjs/operators';

import { ActividadService, NuevaActividad } from 'src/app/actividad.service';

export interface NuevaActividad1 {
  nombre: string;
  descripcion: string;
  horas: number;
  checkboxMarcado: boolean;
}

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
  selector: 'app-listas',
  templateUrl: './listas.component.html',
  styleUrls: ['./listas.component.css'],
})
export class ListasComponent implements OnInit {
  loading: boolean = false;
  items$: Observable<any[]>;
  usuarioActual: any;

  datosUsuarioForm!: FormGroup;
  dataUser: any;

  modalAbierto: boolean = false;
  usuarioAEliminarIdDocumento: string = '';

  actividadSeleccionada: string | null = null;
  participantes$: Observable<VoluntarioParaProtocolo[]> | undefined;
  checkboxMarcado: boolean = false;

  participantes: VoluntarioParaProtocolo[] = [];
  participantesConCheckboxActivo: VoluntarioParaProtocolo[] = []; 

  nuevaActividad: NuevaActividad = { nombre: '', descripcion: '', horas: 0 };

  constructor(
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore,
    private actividadesService: ActividadService
  ) {
    const collectionRef = this.firestore.collection('usuarios');
    this.items$ = collectionRef.valueChanges();

    this.afAuth.authState.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });

    this.route.queryParams.subscribe((params) => {
      this.actividadSeleccionada = params['actividad'];
      if (this.actividadSeleccionada) {
        this.participantes$ = this.obtenerParticipantesPorActividad(this.actividadSeleccionada);
      }
    });
  }

  ngOnInit(): void {
    console.log(this.actividadSeleccionada);


    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.dataUser = user;
        console.log(user);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  descargarListaComoPDF() {
    const doc = new jsPDF();
    const element = document.getElementById('lista-participantes') as HTMLElement;

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save('lista_participantes.pdf');
    });
  }

  obtenerParticipantesPorActividad(nombreColeccion: string): Observable<VoluntarioParaProtocolo[]> {
    return this.firestore
      .collection<VoluntarioParaProtocolo>(nombreColeccion)
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((action) => {
            const data = action.payload.doc.data() as VoluntarioParaProtocolo;
            const id = action.payload.doc.id;  
            return { id, ...data };
          });
        })
      );
  }

  nav() {
    this.router.navigate(['/actividad']);
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  abrirModal() {
    this.modalAbierto = true;
  }

  crearNuevaActividad() {
    this.actividadesService.agregarActividad(
      this.nuevaActividad.nombre,
      this.nuevaActividad.descripcion,
      this.nuevaActividad.horas
    );
    this.modalAbierto = false;
  }

  eliminarActividad() {
    if (this.actividadSeleccionada) {
      this.actividadesService.eliminarActividadPorNombre(this.actividadSeleccionada);
    } else {
      console.error('No se ha seleccionado ninguna actividad para eliminar.');
    }
  }
finalizarActividad(): void {
  if (this.participantesConCheckboxActivo.length === 0) {
    console.log('No hay registros con el checkbox activo para finalizar la actividad.');
    return;
  }

  this.actividadesService.agregarUsuario(this.participantesConCheckboxActivo[0])
    .then(() => {
    })
    .catch((error) => {
    });
}

  onCheckboxChange(voluntario: VoluntarioParaProtocolo): void {
    if (voluntario.checkboxMarcado) {
      this.participantesConCheckboxActivo.push(voluntario);
    } else {
      this.participantesConCheckboxActivo = this.participantesConCheckboxActivo.filter(v => v !== voluntario);
    }
  }
}
