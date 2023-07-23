import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FirebaseCodeErrorService } from 'src/app/services/firebase-code-error.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-registrar-usuario',
  templateUrl: './registrar-usuario.component.html',
  styleUrls: ['./registrar-usuario.component.css'],
})
export class RegistrarUsuarioComponent implements OnInit {
  registrarUsuario: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
    private router: Router,
    private firebaseError: FirebaseCodeErrorService,
    private firestore: AngularFirestore
  ) {
    this.registrarUsuario = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)]],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{1,2}-\d{1,4}-\d{1,6}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repetirPassword: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(2),  Validators.pattern(/^[A-Za-záéíóúÁÉÍÓÚñÑ]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2),  Validators.pattern(/^[A-Za-záéíóúÁÉÍÓÚñÑ]+$/)]],
      horas: [{ value: 0, disabled: true }, Validators.required],
      actividad: [{ value: 'creacion', disabled: true }, Validators.required],
      descripcion: [{ value: 'creacion de usuario', disabled: true }, Validators.required],
      UID: ['', Validators.required],
    });
  }
  dataUser: any;

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

  async registrar() {
    const email = this.registrarUsuario.value.email;
    const password = this.registrarUsuario.value.password;
    const repetirPassword = this.registrarUsuario.value.repetirPassword;

    if (password !== repetirPassword) {
      this.toastr.error(
        'Las contraseñas ingresadas deben ser las mismas',
        'Error'
      );
      return;
    }

    this.loading = true;

    try {
     
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      const uid = userCredential.user?.uid;


      let newUID = this.generateUID();
      while (await this.checkUIDExists(newUID)) {
        newUID = this.generateUID();
      }

    
      this.registrarUsuario.get('UID')?.setValue(newUID);

     
      const collectionRef = this.firestore.collection<any>('usuarios');
      const data = {
        email: this.registrarUsuario.value.email,
      
        nombre: this.registrarUsuario.value.nombre,
        apellido: this.registrarUsuario.value.apellido,
        horas: this.registrarUsuario.value.horas || 0,
        actividad: this.registrarUsuario.value.actividad || 'creacion',
        descripcion: this.registrarUsuario.value.descripcion || 'creacion de usuarios',
        UID: newUID,
        cedula: this.registrarUsuario.value.cedula,
      };

      await collectionRef.doc(uid).set(data);

      console.log('Registro exitoso');
      this.afAuth.signOut().then(() => this.router.navigate(['/login']));
      this.router.navigate(['/login']);

    } catch (error: any) {
      this.loading = false;
      this.toastr.error(
        this.firebaseError.codeError(error.code),
        'Error al registrar'
      );
    }
  }

  generateUID(): string {
   
    const uid = Math.floor(Math.random() * 1000000).toString();
    return uid;
  }

  async checkUIDExists(uid: string): Promise<boolean> {
    const collectionRef = this.firestore.collection<any>('usuarios');
    const query = collectionRef.ref.where('UID', '==', uid).limit(1);

    const snapshot = await query.get();
    return !snapshot.empty;
  }
}
