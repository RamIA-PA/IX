import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { map } from 'rxjs/operators';



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
  styleUrls: ['./listas.component.css']
})
export class ListasComponent implements OnInit {

  loading: boolean = false;
  items$: Observable<any[]>;
  usuarioActual: any;

  datosUsuarioForm!: FormGroup;
  dataUser: any;

  modalAbierto: boolean = false;
  modalEliminarAbierto: boolean = false;
  usuarioAEliminarIdDocumento: string = '';

  actividadSeleccionada: string | null = null;
  participantes$: Observable<VoluntarioParaProtocolo[]> | undefined;
  checkboxMarcado: boolean = false;


  participantes: VoluntarioParaProtocolo[] = [];

  constructor(
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore,
  ) {
    const collectionRef = this.firestore.collection('usuarios');
    this.items$ = collectionRef.valueChanges();

    this.afAuth.authState.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });

    // Obtener el nombre de la actividad del query de navegación
    this.route.queryParams.subscribe(params => {
      this.actividadSeleccionada = params['actividad'];
      // Obtener la lista de participantes de la actividad seleccionada
      if (this.actividadSeleccionada) {
        this.participantes$ = this.obtenerParticipantesPorActividad(this.actividadSeleccionada);
      }
    });
  }

  ngOnInit(): void {
    console.log(this.actividadSeleccionada)
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
    return this.firestore.collection<VoluntarioParaProtocolo>(nombreColeccion).snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(action => {
            const data = action.payload.doc.data() as VoluntarioParaProtocolo;
            const id = data.cedula; // Usamos la cédula como identificador único (ID)
            return { id, ...data };
          });
        })
      );
  }




  nav(){
    this.router.navigate(["/actividad"])
  }



  finalizarActividad() {
    console.log("click");

    if (!this.actividadSeleccionada) {
      console.log('No hay actividad seleccionada.');
      return;
    }

    const participantesAEliminar = this.participantes.filter(participante => !participante.checkboxMarcado);

    console.log('Participantes a eliminar:', participantesAEliminar);

    participantesAEliminar.forEach(participante => {
      this.firestore.collection<VoluntarioParaProtocolo>(
        this.actividadSeleccionada ? this.actividadSeleccionada : '' // Comprobamos y asignamos un valor predeterminado en caso de ser null
      , ref => ref.where('cedula', '==', participante.cedula))
        .get()
        .subscribe(querySnapshot => {
          if (!querySnapshot) {
            console.error('No se pudo obtener el documento.');
            return;
          }

          querySnapshot.forEach(doc => {
            doc.ref.delete().then(() => {
              console.log('Documento eliminado:', doc.id);
            }).catch(error => {
              console.error('Error al eliminar el documento:', error);
            });
          });
        }, error => {
          console.error('Error al obtener el documento:', error);
        });
    });
  }







}
