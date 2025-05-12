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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

import { DxDataGridModule } from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular';

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
interface Carpeta {
  nombre: string;
  archivos: string[];
  files: File[]; // Para subir
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
    FileUpload,ToastModule,
    ContextMenuModule,
    DxDataGridModule,
    DxButtonModule
  ],
  providers: [MessageService],
  templateUrl: './billingpayment.component.html',
  styleUrl: './billingpayment.component.css'
})
export class BillingpaymentComponent implements AfterViewInit{
  @ViewChild('dt') table!: Table;
  @ViewChild('fileUploader') fileUploader!: FileUpload;
  menuItems: MenuItem[] = [];

  fechaInicio?: Date;
  fechaFin?: Date;

  seleccionados: any[] = [];

  mostrarCardCrear = false;
  mostrarCardSubir = false;
  mostrarTablaArchivos: boolean = false;
  archivosCarpeta: any[] = [];

  estructuraCarpetas: any[] = [];
  carpetaSeleccionada: string = '';
  dropActive = false;

  products: any[] = [];
  selectedProduct: any;
  
  estructuraCarpeta: Carpeta[] = [];
  idEmpresa = '001';

  constructor(private apiService: ApiService,private messageService: MessageService) { }

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
    this.setupLicenseObserver();

    const hoy = new Date();
    this.fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    this.filtrarPorFechas();
  }

  setupLicenseObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'DX-LICENSE') {
            (node as HTMLElement).remove();
          }
        });
      });
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  onRightClick(event: MouseEvent, idCarpeta: any, contextMenu: any) {
    event.preventDefault();
    event.stopPropagation(); // Evita que el evento se propague
    
    this.menuItems = [
      {
        label: 'Ver detalles',
        icon: 'pi pi-search',
        command: () => this.verDetalle(idCarpeta)
      },
      /* Otras opciones */
    ];
    
    // Usamos el componente directamente pasado como parámetro
    contextMenu.show(event);
    
    // Opcional: prevenir el scroll
    const container = event.currentTarget as HTMLElement;
    container.addEventListener('scroll', this.preventScroll, { passive: false });
    setTimeout(() => {
      container.removeEventListener('scroll', this.preventScroll);
    }, 100);
  }

  private preventScroll(e: Event) {
      e.preventDefault();
      e.stopPropagation();
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
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Documento creado correctamente'
        });
        this.mostrarCardCrear = false;
        this.nuevoDocumento = { ruc: '', serie: '', numero: '' };
      },
      error: (err) => {
        console.error('Error al crear documento:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear el documento'
        });
      }
    });
    this.filtrarPorFechas()
  }
  
  cerrarCardCrear() {
    this.mostrarCardCrear = false;
  }
  
  subirArchivos(event: any) {
    this.messageService.add({
      severity: 'success',
      summary: 'Subida exitosa',
      detail: 'Archivos subidos correctamente'
    });
    this.cerrarCardSubir();
  }
  
  cerrarCardSubir() {
    this.mostrarCardSubir = false;
    this.estructuraCarpetas = [];
  }
  
  filtrarPorFechas() {
  if (!this.fechaInicio || !this.fechaFin) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Faltan datos',
      detail: 'Por favor selecciona ambas fechas'
    });
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
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron filtrar los documentos'
      });
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
      const nuevasCarpetas: { [key: string]: { archivos: string[], files: File[] } } = {};
  
      const promesas = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry?.();
        if (item && item.isDirectory) {
          promesas.push(this.readDirectory(item, nuevasCarpetas));
        }
      }
  
      Promise.all(promesas).then(() => {
        const estructura = Object.keys(nuevasCarpetas).map(nombre => ({
          nombre,
          archivos: nuevasCarpetas[nombre].archivos,
          files: nuevasCarpetas[nombre].files
        }));
  
        this.estructuraCarpetas = estructura;
        this.estructuraCarpeta = estructura; // 🛠️ Aquí sí se llena para el upload
      });
    }
  }
  
  
  readDirectory(item: any, carpetaMap: { [key: string]: { archivos: string[], files: File[] } }): Promise<void> {
    return new Promise((resolve) => {
      const reader = item.createReader();
      reader.readEntries((entries: any[]) => {
        const promises = entries.map(entry => {
          if (entry.isFile) {
            return new Promise<void>((res) => {
              entry.file((file: File) => {
                const carpetaNombre = item.name;
                if (!carpetaMap[carpetaNombre]) {
                  carpetaMap[carpetaNombre] = { archivos: [], files: [] };
                }
                carpetaMap[carpetaNombre].archivos.push(file.name);
                carpetaMap[carpetaNombre].files.push(file);
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
  
  
  
  subirCarpetas(): void {
    this.estructuraCarpeta.forEach(carpeta => {
      const idCarpeta = carpeta.nombre;
  
      this.apiService.existeDocumento(this.idEmpresa, idCarpeta).subscribe({
        next: (res) => {
          if (res.success === false) {
            // Crear carpeta si no existe
            this.apiService.crearDocumento(this.idEmpresa, idCarpeta).subscribe({
              next: () => {
                // Subir todos los archivos
                carpeta.files.forEach(file => {
                  const nombreArchivo = file.name.split('.').slice(0, -1).join('.') || file.name;
                  const tipoArchivo = file.type;
  
                  this.apiService.subirArchivoCarpeta(idCarpeta, nombreArchivo, tipoArchivo, file).subscribe({
                    next: () => {
                      this.messageService.add({
                        severity: 'info',
                        summary: 'Archivo subido',
                        detail: `${file.name} subido correctamente`
                      });
                    },
                    error: (err) => {
                      this.messageService.add({
                        severity: 'error',
                        summary: 'Error de subida',
                        detail: `No se pudo subir ${file.name}`
                      });
                    }
                  });
                });
              },
              error: (err) => {
                console.error(`Error al crear la carpeta ${idCarpeta}:`, err);
              }
            });
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'Carpeta duplicada',
              detail: `La carpeta "${idCarpeta}" ya fue registrada`
            });
          }
        },
        error: (err) => {
          console.error(`Error verificando existencia de carpeta ${idCarpeta}:`, err);
        }
      });
    });
  
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

  onVerClick(e: any): void {
    this.verDetalle(e.data?.idCarpeta);
  }  

  verDetalle(idCarpeta: string) {
    this.carpetaSeleccionada = idCarpeta;
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

  onEditarDocumento(e: any) {
    // Combinar datos antiguos y nuevos
    const mergedData = { ...e.oldData, ...e.newData };
  
    // Filtrar campos vacíos, null o undefined
    const cleanedData: any = {};
    for (const key in mergedData) {
      const value = mergedData[key];
      if (value !== '' && value !== null && value !== undefined) {
        cleanedData[key] = value;
      }
    }
  
    // Llamar a la API
    this.apiService.editarDocumento(cleanedData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Documento actualizado correctamente'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el documento'
        });
        e.cancel = true; // cancela visualmente la edición
      }
    });
  }

  cerrarVistaArchivos() {
    this.mostrarTablaArchivos = false;
    this.archivosCarpeta = [];
    this.carpetaSeleccionada = '';
  }

  abrirArchivo(e: any): void {
    console.log(e)
    const url = e?.data?.url;
    if (url) {
      window.open(url, '_blank');
    }
  }

  formatSize(rowData: any): string {
    const size = rowData.size;
    if (size == null || isNaN(size)) return '0 bytes';
  
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      const kb = size / 1024;
      return `${kb.toFixed(2)} KB`;
    } else {
      const mb = size / (1024 * 1024);
      return `${mb.toFixed(2)} MB`;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dropActive = true;
  }
  
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dropActive = false;
  }
  
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.dropActive = false;
  
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const archivo = files[0];
      const nombreSinExtension = archivo.name.replace(/\.[^/.]+$/, "");
      const tipo = archivo.type;
  
      this.apiService.subirArchivoCarpeta(this.carpetaSeleccionada.trim().replace(/\s+/g, '_'), nombreSinExtension, tipo, archivo).subscribe({
        next: () => {
          this.verDetalle(this.carpetaSeleccionada.trim().replace(/\s+/g, '_'));
        },
        error: err => {
          console.error('Error al subir:', err);
        }
      });
    }
  }
  
}
