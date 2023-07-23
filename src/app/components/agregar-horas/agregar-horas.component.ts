import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseCodeErrorService } from 'src/app/services/firebase-code-error.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-agregar-horas',
  templateUrl: './agregar-horas.component.html',
  styleUrls: ['./agregar-horas.component.css']
})
export class AgregarHorasComponent implements OnInit {
  UID: string | null = null;
  agregar: FormGroup;
  usuarioActual: any;
  dataUser: any;
  cedulas: Observable<any[]> | undefined;
  cedulaSeleccionada: string = "";
  UIDSeleccionado: string = "";

  constructor(
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore,
    private service: FirebaseCodeErrorService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.agregar = this.fb.group({
      UID: [{ value: '', disabled: false }, Validators.required],
      email: [{ value: '', disabled: false }, Validators.required],
      cedula: [{ value: '', disabled: false }, Validators.required],
      nombre: [{ value: '', disabled: false }, Validators.required],
      apellido: [{ value: '', disabled: false }, Validators.required],
      horas: [{ value: 0, disabled: false }, Validators.required],
      actividad: [{ value: '', disabled: false }, Validators.required, ],
      descripcion: [{ value: '', disabled: false }, Validators.required, ],
    });

    this.afAuth.authState.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
  }

  ngOnInit(): void {
    this.cedulas = this.firestore.collection('usuarios').valueChanges();

    this.afAuth.currentUser.then(user => {
      if (user) {
        this.dataUser = user;
        console.log(user);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }




  seleccionarCedula(event: Event) {
    const cedula = (event.target as HTMLSelectElement).value;
  
    if (cedula) {
      this.firestore.collection('usuarios', ref => ref.where('cedula', '==', cedula))
        .valueChanges()
        .subscribe((resultados: any[]) => {
          if (resultados.length > 0) {
            const usuario = resultados[0];
            console.log('Usuario encontrado:', usuario);
  
            
            this.agregar.get('UID')?.setValue(usuario.UID);
            this.agregar.get('email')?.setValue(usuario.email);
            this.agregar.get('nombre')?.setValue(usuario.nombre);
            this.agregar.get('apellido')?.setValue(usuario.apellido);
  
            this.UIDSeleccionado = usuario.UID; 
          } else {
            console.log('Usuario no encontrado');
            this.agregar.get('UID')?.setValue('');
            this.agregar.get('email')?.setValue('a');
            this.agregar.get('nombre')?.setValue('a');
            this.agregar.get('apellido')?.setValue('a');
  
            this.UIDSeleccionado = '';  
          }
        });
    } else {
      this.agregar.get('UID')?.setValue('a');
      this.agregar.get('email')?.setValue('a');
      this.agregar.get('nombre')?.setValue('a');
      this.agregar.get('apellido')?.setValue('a');
  
      this.UIDSeleccionado = ''; 
    }
  }
  


  generateUID(): string {
    const uid = Math.floor(Math.random() * 1000000).toString();
    return uid;
  }

  agregarDatos() {
    if (this.agregar.valid) {
      console.log(this.agregar.value)
      const datos = this.agregar.value;
      this.firestore.collection('usuarios').add(datos)
        .then(() => {
          
          this.router.navigate(['/crud']);
        })
        .catch(error => {
          console.error('Error al agregar los datos:', error);
        });
    } else {
      console.error('Formulario inválido. Verifica los campos.');
    }
  }
  
}
