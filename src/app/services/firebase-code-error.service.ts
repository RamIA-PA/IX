import { Injectable } from '@angular/core';
import { FirebaseCodeErrorEnum } from '../utils/firebase-code-error';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { deleteDoc, doc } from 'firebase/firestore';
@Injectable({
  providedIn: 'root',
})
export class FirebaseCodeErrorService {
  constructor(private firestore: AngularFirestore) {}

  codeError(code: string) {
    switch (code) {
      // El correo ya existe
      case FirebaseCodeErrorEnum.EmailAlreadyInUse:
        return 'El usuario ya existe';

      // Contraseña debil
      case FirebaseCodeErrorEnum.WeakPassword:
        return 'La contraseña es muy debil';

      // Correo invalido
      case FirebaseCodeErrorEnum.InvalidEmail:
        return 'Correo invalido';

      // Contraseña incorrecta
      case FirebaseCodeErrorEnum.WrongPassword:
        return 'Contraseña incorrecta';

      // El usuario no existe
      case FirebaseCodeErrorEnum.UserNotFound:
        return 'El usuario no existe';
      default:
        return 'Error desconocido';
    }
  }

  agregarusuarios(usuarios: any): Promise<any> {
    return this.firestore.collection('usuarios').add(usuarios);
  }

  getusuarios(): Observable<any> {
    return this.firestore.collection('usuarios', ref => ref.orderBy('fechaCreacion', 'asc')).snapshotChanges();
  }



}
