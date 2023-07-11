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
  dataUser: any;




  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
    private router: Router,
    private firebaseError: FirebaseCodeErrorService,
    private firestore: AngularFirestore
  ) {
    this.registrarUsuario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repetirPassword: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      horas: [{ value: 0, disabled: true }, Validators.required],
      UID: [{ value:this.uid, disabled: true }, Validators.required],
    });

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.uid = user.uid;
        this.registrarUsuario?.get('UID')?.setValue(this.uid);
      } else {
        this.uid = null;
        this.registrarUsuario?.get('UID')?.setValue('null');
      }
    });

  }
  uid: any;

  ngOnInit(): void {}





  registrar() {



    const email = this.registrarUsuario.value.email;
    const password = this.registrarUsuario.value.password;
    const repetirPassowrd = this.registrarUsuario.value.repetirPassword;

    console.log(this.registrarUsuario);
    if (password !== repetirPassowrd) {
      this.toastr.error(
        'Las contraseñas ingresadas deben ser las mismas',
        'Error'
      );
      return;
    }

    this.loading = true;
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.verificarCorreo();
      })
      .catch((error) => {
        this.loading = false;
        this.toastr.error(this.firebaseError.codeError(error.code), 'Error');
      });
  }

  verificarCorreo() {
    this.afAuth.currentUser
      .then((user) => user?.sendEmailVerification())
      .then(() => {
        this.toastr.info(
          'Le enviamos un correo electronico para su verificacion',
          'Verificar correo'
        );
        this.router.navigate(['/login']);
      });
  }



  agregarDato() {
    // Obtén una referencia a la colección en Firestore donde deseas escribir los datos
    const collectionRef = this.firestore.collection('usuarios');

    // Crea un objeto con los valores del formulario
    const data = {
      email: this.registrarUsuario.value.email,
      password: this.registrarUsuario.value.password,
      repetirPassword: this.registrarUsuario.value.repetirPassword,
      nombre: this.registrarUsuario.value.nombre,
      apellido: this.registrarUsuario.value.apellido,
      horas: this.registrarUsuario.value.horas || 0, // Establece un valor predeterminado de 0 si el campo es undefined
      UID: this.registrarUsuario.value.UID || this.uid
    };

    // Agrega los datos a la colección en Firestore
    collectionRef.add(data)
      .then(() => {
        console.log('Datos agregados exitosamente.');
      })
      .catch((error) => {
        console.error('Error al agregar datos:', error);
      });
  }



}
