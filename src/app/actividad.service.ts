import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export interface NuevaActividad {
  nombre: string;
  descripcion: string;
  horas: number;
}

export interface NuevaActividad1 {
  nombre: string;
  descripcion: string;
  horas: number;
  checkboxMarcado: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ActividadService {
  private actividadesCollection: AngularFirestoreCollection<NuevaActividad>;

  constructor(private firestore: AngularFirestore) {
    this.actividadesCollection = this.firestore.collection<NuevaActividad>('actividades');
    


  }

  obtenerActividades(): Observable<NuevaActividad[]> {
    return this.actividadesCollection.valueChanges();
  }

  
  
  agregarActividad(nombre: string, descripcion: string, horas: number): void {
    const nombreminuscula: string = nombre.toLowerCase().replace(/\s/g, '');
    const nuevaActividad: NuevaActividad = { nombre: nombreminuscula, descripcion, horas };
    this.actividadesCollection.add(nuevaActividad);
  }

  eliminarActividadPorNombre(actividadNombre: string): void {
    const actividadRef = this.actividadesCollection.ref.where('nombre', '==', actividadNombre).limit(1);
  
    actividadRef.get().then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const actividadDocument = querySnapshot.docs[0];
        actividadDocument.ref.delete().then(() => {
          console.log('Actividad eliminada correctamente');
        }).catch((error) => {
          console.error('Error al eliminar la actividad:', error);
        });
      } else {
        console.error('No se encontró la actividad a eliminar');
      }
    }).catch((error) => {
      console.error('Error al obtener la actividad:', error);
    });
  }

  agregarUsuario(registro: NuevaActividad1): Promise<void> {
    const { checkboxMarcado, ...registroSinCheckbox } = registro;

    return this.firestore.collection('usuarios').add(registroSinCheckbox)
      .then(() => {
        console.log('Registro agregado a la colección de usuarios correctamente');
      })
      .catch((error) => {
        console.error('Error al agregar registro a la colección de usuarios:', error);
      });
  }
}
