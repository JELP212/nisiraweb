import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario: string = '';
  clave: string = '';
  error: string = '';

  constructor(private router: Router,private apiService: ApiService) { }

  iniciarSesion() {
    this.apiService.iniciarSesion(this.usuario, this.clave).subscribe(
      (res) => {
        if (res.success) {
          const id = res.data.id;
          localStorage.setItem('usuarioId', id.toString());
          this.router.navigate(['/home']);
        } else {
          alert('Credenciales incorrectas');
        }
      },
      (err) => {
        alert('Error al conectar con el servidor');
        console.error(err);
      }
    );
  }
}
