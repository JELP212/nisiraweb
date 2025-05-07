import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../../component/topbar/topbar.component';
import { TitleComponent } from '../../component/title/title.component';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AfterViewInit,ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { ApiService } from '../../core/api.service';
interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  image?: string;
  rating?: number;
}

@Component({
  selector: 'app-billingpayment',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    TitleComponent,
    CalendarModule,
    FormsModule,
    TableModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    SelectModule,CardModule,FileUploadModule,DialogModule,
    FileUpload
  ],
  templateUrl: './billingpayment.component.html',
  styleUrl: './billingpayment.component.css'
})
export class BillingpaymentComponent implements AfterViewInit{
  @ViewChild('dt') table!: Table;
  @ViewChild('fileUploader') fileUploader!: FileUpload;

  fechaInicio?: Date;
  fechaFin?: Date;

  seleccionados: any[] = [];

  mostrarCardCrear = false;
  mostrarCardSubir = false;
  mostrarTablaArchivos: boolean = false;
  archivosCarpeta: any[] = [];

  estructuraCarpetas: any[] = [];

  products: any[] = [];
  selectedProduct: any;
  
  constructor(private apiService: ApiService) { }

  nuevoDocumento = {
    ruc: '',
    serie: '',
    numero: ''
  };


  statuses!: any[];

  clonedProducts: { [s: string]: Product } = {};

  productoEditando: Product | null = null; // Añadido para controlar la edición

  ngAfterViewInit() {
    // Esperamos un poco a que se renderice el input interno
    setTimeout(() => {
      const input = this.fileUploader.el.nativeElement.querySelector('input[type="file"]');
      if (input) {
        input.setAttribute('webkitdirectory', '');
        input.setAttribute('directory', '');
      }
    }, 100);
  }

  ngOnInit() {

  }

  onRowEditInit(product: Product) {
    // Si ya hay una fila editándose, cancela la anterior
    if (this.productoEditando && this.productoEditando.id !== product.id) {
      const index = this.products.findIndex(p => p.id === this.productoEditando?.id);
      this.onRowEditCancel(this.productoEditando, index);
    }
  
    // Guardas copia por si cancela
    this.clonedProducts[product.id as string] = { ...product };
    this.productoEditando = product;
  }


  onRowEditSave(product: Product) {
    if (product.price > 0) {
      delete this.clonedProducts[product.id as string];
      this.productoEditando = null;
    }
  }
  
  onRowEditCancel(product: Product, index: number) {
    this.products[index] = this.clonedProducts[product.id as string];
    delete this.clonedProducts[product.id as string];
    this.productoEditando = null;
  }

  crearDocumento() {
    const idEmpresa = '001';
  
    // Sanitizar el número: convertir "001" -> 1 -> "1"
    const numeroSinCeros = parseInt(this.nuevoDocumento.numero, 10).toString();
  
    // Concatenar para formar idCarpeta
    const idCarpeta = `${this.nuevoDocumento.ruc}_${this.nuevoDocumento.serie}-${numeroSinCeros}`;
  
    this.apiService.crearDocumento(idEmpresa, idCarpeta).subscribe({
      next: (res) => {
        console.log('Documento creado con éxito:', res);
        this.mostrarCardCrear = false;
        // aquí podrías limpiar el formulario si deseas
        this.nuevoDocumento = { ruc: '', serie: '', numero: '' };
      },
      error: (err) => {
        console.error('Error al crear documento:', err);
      }
    });
  }
  
  cerrarCardCrear() {
    this.mostrarCardCrear = false;
  }
  
  subirArchivos(event: any) {
    console.log('Archivos subidos:', event.files);
    this.cerrarCardSubir();
  }
  
  cerrarCardSubir() {
    this.mostrarCardSubir = false;
    this.estructuraCarpetas = [];
  }
  
  filtrarPorFechas() {
  if (!this.fechaInicio || !this.fechaFin) {
    alert('Por favor selecciona ambas fechas');
    return;
  }

  const fechaInicioStr = this.fechaInicio.toISOString().split('T')[0];
  const fechaFinStr = this.fechaFin.toISOString().split('T')[0];

  this.apiService.filtrarDocumentos(fechaInicioStr, fechaFinStr).subscribe({
    next: (data) => {
      this.products = data.data; // ← Aquí guardas la respuesta para mostrarla en la tabla
    },
    error: (err) => {
      console.error('Error al filtrar documentos:', err);
    }
  });
}
  
  descargarExcel() {
    console.log('Descargando Excel...');
  }

  manejarArchivos(event: any) {
    const archivos: FileList = event.target.files;
    const archivosArray: File[] = Array.from(archivos);
  
    archivosArray.forEach(archivo => {
      console.log('Archivo:', archivo.webkitRelativePath || archivo.name, 'Tipo:', archivo.type);
      // Aquí puedes hacer lo que desees con los archivos, como subirlos a un backend
    });
  }

  leerCarpetas(event: any) {
    const archivos = event.files;
    const nuevasCarpetas: { [key: string]: string[] } = {};

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      const ruta = archivo.webkitRelativePath || archivo.name;
      const partes = ruta.split('/');
      const nombreCarpeta = partes[0];

      if (!nuevasCarpetas[nombreCarpeta]) {
        nuevasCarpetas[nombreCarpeta] = [];
      }

      nuevasCarpetas[nombreCarpeta].push(partes.slice(1).join('/'));
    }

    const carpetasConvertidas = Object.keys(nuevasCarpetas).map(nombre => ({
      nombre,
      archivos: nuevasCarpetas[nombre]
    }));

    this.estructuraCarpetas = [...this.estructuraCarpetas, ...carpetasConvertidas];
  }
  
  allowDrop(event: DragEvent) {
    event.preventDefault();
  }
  
  handleDrop(event: DragEvent) {
    event.preventDefault();
    const items = event.dataTransfer?.items;
  
    if (items) {
      const nuevasCarpetas: { [key: string]: string[] } = {};
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry?.();
        if (item && item.isDirectory) {
          this.readDirectory(item, nuevasCarpetas).then(() => {
            this.estructuraCarpetas = Object.keys(nuevasCarpetas).map(nombre => ({
              nombre,
              archivos: nuevasCarpetas[nombre]
            }));
          });
        }
      }
    }
  }
  
  readDirectory(item: any, carpetaMap: { [key: string]: string[] }): Promise<void> {
    return new Promise((resolve) => {
      const reader = item.createReader();
      reader.readEntries((entries: any[]) => {
        const promises = entries.map(entry => {
          if (entry.isFile) {
            return new Promise<void>((res) => {
              entry.file((file: File) => {
                const carpetaNombre = item.name;
                if (!carpetaMap[carpetaNombre]) carpetaMap[carpetaNombre] = [];
                carpetaMap[carpetaNombre].push(file.name);
                res();
              });
            });
          } else if (entry.isDirectory) {
            return this.readDirectory(entry, carpetaMap);
          } else {
            return Promise.resolve();
          }
        });
  
        Promise.all(promises).then(() => resolve());
      });
    });
  }
  
  subirEstructura() {
    console.log("Subiendo estructura:", this.estructuraCarpetas);
    // Aquí iría la lógica para enviar al backend
  }
  
  subirCarpetas() {
    // Aquí debes manejar el upload real a tu API si lo deseas
    console.log('Subiendo:', this.estructuraCarpetas);
    this.mostrarCardSubir = false; // Cierra el diálogo
  }
  
  cancelarSubida() {
    this.estructuraCarpetas = [];
    this.mostrarCardSubir = false; // Cierra el diálogo
  }

  onCheckboxChange(product: any) {
    if (this.selectedProduct === product) {
      this.selectedProduct = null; // deselecciona si se vuelve a hacer clic
    } else {
      this.selectedProduct = product;
    }
  }

  verDetalle(idCarpeta: string) {
    this.apiService.listarArchivosCarpeta(idCarpeta.trim()).subscribe({
      next: (response) => {
        this.archivosCarpeta = Array.isArray(response) ? response : [response];
        this.mostrarTablaArchivos = true;
      },
      error: (err) => {
        console.error('Error al obtener archivos:', err);
      }
    });
    this.mostrarTablaArchivos = true;

  }

  cerrarVistaArchivos() {
    this.mostrarTablaArchivos = false;
    this.archivosCarpeta = [];
  }
}
