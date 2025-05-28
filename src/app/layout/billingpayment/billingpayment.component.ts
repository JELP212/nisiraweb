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
import { Router, ActivatedRoute } from '@angular/router';

import * as XLSX from 'xlsx';
import { HttpParams } from '@angular/common/http';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';
import { forkJoin } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { CookieService } from 'ngx-cookie-service';
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
    DxButtonModule,DrawerModule,ProgressSpinnerModule,DropdownModule,ConfirmDialogModule
  ],
  providers: [MessageService,ConfirmationService],
  templateUrl: './billingpayment.component.html',
  styleUrl: './billingpayment.component.css'
})
export class BillingpaymentComponent implements AfterViewInit{
  @ViewChild('dt') table!: Table;
  @ViewChild('fileUploader') fileUploader!: FileUpload;
  
  menuItems: MenuItem[] = [];


  seleccionados: any[] = [];

  mostrarCardCrear = false;


  mostrarCardSubir = false;
  mostrarTablaArchivos: boolean = false;
  mostrarTablaCarpetas: boolean = false;

  archivosCarpeta: any[] = [];

  estructuraCarpetas: any[] = [];
  carpetaSeleccionada: string = '';
  dropActive = false;

  products: any[] = [];
  selectedProduct: any;
  
  estructuraCarpeta: Carpeta[] = [];
  idEmpresa = '001';

  carpetasRaiz: any[] = [];
  cargandoArchivos: boolean = false;

  cargando: boolean = false;

  cargandoc: boolean = false;

  carpetaActual = { idCarpetaPadre: null, final: false, idCarpeta: null };
  regimen = [
    { idRegimen: '01', descripcion: 'Afecto' },
    { idRegimen: '02', descripcion: 'Afecto/Inafecto' },
    { idRegimen: '03', descripcion: 'Inafecto' }
  ];
  regimenSeleccionado: string = '';

  moneda = [
    { idMoneda: '01', descripcion: 'Soles' },
    { idMoneda: '02', descripcion: 'Dolares Americanos' },
    { idMoneda: '03', descripcion: 'Euros' }
  ];
  monedaSeleccionado: string = '';

  impuestos = [
    { idImpuestos: '027', descripcion: '10%' },
    { idImpuestos: '003', descripcion: '18%' }
  ];
  impuestosSeleccionado: string = '';

  obs = [
    { idObs: '01', descripcion: 'APL.NRC' },
    { idObs: '02', descripcion: 'PEND SUSTENTO' },
    { idObs: '03', descripcion: 'PUB.ASUM' },
    { idObs: '04', descripcion: 'PUB.REFAC' },
    { idObs: '05', descripcion: 'PUB.GAR' }
  ];
  obsSeleccionado: string = '';

  rev = [
    { idRev: '01', descripcion: 'CONFORME' },
    { idRev: '02', descripcion: 'PEND FAC' },
    { idRev: '02', descripcion: 'OBSERVADO' }
  ];
  revSeleccionado: string = '';

  igv = [
    { idigv: '1', descripcion: 'NA' },
    { idigv: '2', descripcion: 'DET' },
    { idigv: '3', descripcion: 'RET' }
  ];
  igvSeleccionado: string = '';

  area: any[] = [];
  tipoDet: any[] = [];
  tipoMovimiento: any[] = [];
  clasificacionLE: any[] = [];

  areaSeleccionado: string = '';
  tipoDetSeleccionado: string = '';
  tipoMovimientoSeleccionado: string = '';
  clasificacionLESeleccionado: string = '';

  mostrarVisor: boolean = false;
  archivoSeleccionadoUrl: string = '';
  archivoSeleccionadoNombre: string = '';

  safeUrl: SafeResourceUrl | null = null;

  mostrarDialogAprovisionar: boolean = false;
  ordenesCompra: any[] = [];
  ordenSeleccionada: string | null = null;
  datosTabla: any[] = [];
  dialogoVisible: boolean = false;
  tipoSeleccionado: string = '';
  tituloDialogo: string = '';
  seleccionadosTabla1: any[] = [];
  seleccionadosTabla2: any[] = [];
  documentosPendientes: any[] = [];
  detallesTabla2: any[] = [];

  previousSeleccionados: any[] = [];
  productosSeleccionados: any[] = [];
  mostrarTablaSeleccionados: boolean = false;
  documentosConfirmados: any[] = [];

  mostrarCardCrearCarpeta: boolean = false;

  mostrarAyudaFinal: boolean = false;

  productoSeleccionadoResumen: any = null;

  constructor(private apiService: ApiService,
              private messageService: MessageService, 
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private router: Router, 
              private confirmationService: ConfirmationService,
              private cookieService: CookieService) {

    }

  nuevoDocumento = {
    ruc: '',
    serie: '',
    numero: ''
  };


  statuses!: any[];

  clonedProducts: { [s: string]: Product } = {};

  productoEditando: Product | null = null; // Añadido para controlar la edición
  tituloDialogAprovisionar: string = '';
  idCarpeta: string = '';
  generarDeshabilitado: boolean = false;

  nombreCarpeta: string = '';
  final: boolean = false;
  carpetaRaiz: boolean = true;

  // Variables ocultas (obtenidas automáticamente)
  idCarpetaPadre: number = 0;
  usuarioCreador: string = '';

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

    this.route.queryParams.subscribe(params => {
      this.idCarpetaPadre = +params['idcarpeta'];

      const idCarpeta = params['idcarpeta'] || params['idCarpeta'];
      const idDocumento = params['iddocumento'] || params['idDocumento'];

      if (idCarpeta && idDocumento) {
        this.mostrarTablaArchivos = true;
        this.mostrarTablaCarpetas = true;
        this.carpetaSeleccionada = idDocumento;
        this.apiService.listarArchivosCarpeta(idDocumento.trim()).subscribe({
          next: (response) => {
            this.archivosCarpeta = Array.isArray(response) ? response : [response];
            this.mostrarTablaArchivos = true;
            this.mostrarTablaCarpetas = true;
          },
          error: (err) => {
            console.error('Error al obtener archivos desde la URL:', err);
          }
        });
        return;
      }
  
      // Lógica anterior si solo hay idCarpeta
      if (idCarpeta) {
        this.apiService.listarCarpeta(idCarpeta).subscribe((res) => {
          // Verifico si carpetasRaiz está vacío antes de asignar
          const estabaVacio = !this.carpetasRaiz || this.carpetasRaiz.length === 0;
      
          this.carpetasRaiz = res.data;
      
          console.log('oninit');
      
          if (estabaVacio && this.carpetasRaiz.length > 0) {
            this.verDetalle(this.carpetasRaiz[0].idCarpeta);
          }
        });
      } else {
        this.cargarCarpetas();
      }
      
    });
    this.usuarioCreador = this.cookieService.get('usuario');

    this.setupLicenseObserver();
    
    this.apiService.opcionArea().subscribe(res => {
    this.area = res.data;
  });

  this.apiService.opciontipoDet().subscribe(res => {
    this.tipoDet = res.data;
  });

  this.apiService.opcionTipoMovimiento().subscribe(res => {
    this.tipoMovimiento = res.data;
  });

  this.apiService.opcionClasificacionLE().subscribe(res => {
    this.clasificacionLE = res.data;
  });
  }

  cargarCarpetas() {
    this.apiService.listarCarpeta('').subscribe((res) => {
      this.carpetasRaiz = res.data; 
    });
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
        command: () => this.verArchivos(idCarpeta)
      },
      {
        label: 'Aprovisionar',
        icon: 'pi pi-file',
        command: () => {

          this.idCarpeta = idCarpeta;

          const carpeta = this.products.find(p => p.idCarpeta === idCarpeta);
          const doc = carpeta?.idCobrarPagarDoc;
        if (doc && doc !== 'null' && doc !== 'undefined' && doc.trim() !== '') {
          this.generarDeshabilitado = true;
          this.mostrarDialogAprovisionar = false;

          this.messageService.add({
            severity: 'error',
            summary: 'No permitido',
            detail: 'Este documento ya esta provisionado, revisar el ERP.'
          });

          return;
        }

        // Si no tiene ID, permite abrir el diálogo
        this.generarDeshabilitado = false;
        this.tituloDialogAprovisionar = `ID Carpeta: ${idCarpeta}`;
        this.cargarResumenProducto(idCarpeta);
        this.mostrarDialogAprovisionar = true;
        

        console.log(idCarpeta);
        }
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-eraser',
        command: () => {
          const documento = this.products.find(p => p.idCarpeta === idCarpeta);
      
          if (documento?.idCobrarPagarDoc) {
            this.messageService.add({
              severity: 'warn',
              summary: 'No se puede eliminar',
              detail: 'Este documento está vinculado a Cobrar/Pagar y no puede eliminarse.'
            });
            return;
          }
      
          this.confirmationService.confirm({
            message: '¿Estás segura de que deseas eliminar este documento?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
              this.apiService.eliminarDocumento(this.idEmpresa, idCarpeta).subscribe({
                next: () => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Eliminado correctamente.'
                  });
                  // Refrescar tabla según condición
                  if (!this.idCarpetaPadre || this.idCarpetaPadre === 0) {
                    this.apiService.listarCarpeta('').subscribe((res) => {
                      this.carpetasRaiz = res.data;
                    });
                  } else {
                    this.verDetalle(this.idCarpetaPadre);
                  }
                },
                error: (err) => {
                  console.error('Error al eliminar documento', err);
                }
              });
            }
          });
        }
      },
      {
        label: 'Aprobar',
        icon: 'pi pi-check',
        command: () => {
          // Suponiendo que tienes el idCarpeta del documento a aprobar (ejemplo: this.selectedIdCarpeta)
          const documento = this.products.find(p => p.idCarpeta === idCarpeta);
      
          if (!documento) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Aviso',
              detail: 'Debe seleccionar un documento para aprobar.'
            });
            return;
          }
      
          // Puedes incluir confirmación si quieres
          this.confirmationService.confirm({
            message: '¿Estás seguro que deseas aprobar este documento?',
            header: 'Confirmar aprobación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
              const usuario = this.cookieService.get('usuario') || 'Usuario';
              const datosParaEditar = {
                ...documento,
                estado: `APROBADO POR ${usuario}`
              };
      
              this.cargandoc = true;
              this.apiService.editarDocumento(datosParaEditar).subscribe({
                next: () => {
                  this.cargandoc = false;
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Documento aprobado correctamente.'
                  });
      
                  // Refrescar la tabla igual que en eliminar
                  if (!this.idCarpetaPadre || this.idCarpetaPadre === 0) {
                    this.apiService.listarCarpeta('').subscribe((res) => {
                      this.carpetasRaiz = res.data;
                    });
                  } else {
                    this.verDetalle(this.idCarpetaPadre);
                  }
                },
                error: (err) => {
                  this.cargandoc = false;
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo aprobar el documento.'
                  });
                  console.error('Error al aprobar documento:', err);
                }
              });
            }
          });
        }
      }      
      
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

    const numeroSinCeros = parseInt(this.nuevoDocumento.numero, 10).toString();
  
    // Crear idCarpeta (ej. RUC_SERIE-NUMERO)
    const idCarpeta = `${this.nuevoDocumento.ruc}_${this.nuevoDocumento.serie}-${numeroSinCeros}`;
  
    // Obtener periodo actual (ej. 202505)
    const now = new Date();
    const periodo = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  
    // Carpeta padre
    const idCarpetaPadre: number = this.carpetaActual.idCarpeta!;
  
    // Verificar si ya existe
    this.apiService.existeDocumento(this.idEmpresa, idCarpeta).subscribe({
      next: (res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Ya existe, no se crea
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Ya existe un documento con esta carpeta'
          });
        } else {
          // No existe, se crea
          this.apiService.crearDocumento(this.idEmpresa, idCarpeta, periodo, idCarpetaPadre).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Documento creado correctamente'
              });
              this.cargando = true;
              this.mostrarCardCrear = false;
              this.nuevoDocumento = { ruc: '', serie: '', numero: '' };
              const idCarpetaDesdeUrl = this.route.snapshot.queryParamMap.get('idcarpeta') || this.route.snapshot.queryParamMap.get('idCarpeta');

            if (idCarpetaDesdeUrl) {
              this.apiService.filtrarDocumentos(idCarpetaDesdeUrl).subscribe({
                
                next: (res) => {
                  this.products = res.data;
                  this.mostrarTablaCarpetas = true;
                  this.cargando = false;
                },
                error: (err) => {
                  console.error('Error al filtrar documentos:', err);
                }
              });
            }
            },
            error: (err) => {
              console.error('Error al crear documento:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear el documento'
              });
              this.cargando = false;
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al verificar existencia del documento:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo verificar si el documento ya existe'
        });
      }
    });
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
  
  
  descargarExcel() {
    const idCarpeta = this.route.snapshot.queryParamMap.get('idcarpeta') || '';
  
    forkJoin({
      documentos: this.apiService.filtrarDocumentos(idCarpeta),
      areas: this.apiService.opcionArea(),
      tipoDet: this.apiService.opciontipoDet(),
      tipoMov: this.apiService.opcionTipoMovimiento(),
      clasificacion: this.apiService.opcionClasificacionLE()
    }).subscribe(({ documentos, areas, tipoDet, tipoMov, clasificacion }) => {
      const data = documentos.data.map((doc: any) => {
        const areaDesc = areas.data.find((a: any) => a.idArea?.trim() === doc.idArea?.trim())?.descripcion || '';
        const revDesc = this.rev.find(r => r.idRev === doc.revControl)?.descripcion || '';
        const igvDesc = this.igv.find(i => i.idigv === String(doc.srIgv))?.descripcion || '';
        const tipoDetDesc = tipoDet.data.find((t: any) => t.idTipoDet === doc.tipoDet)?.descripcion || '';
        const obsDesc = this.obs.find(o => o.idObs === doc.onsContable)?.descripcion || '';
        const regimenDesc = this.regimen.find(r => r.idRegimen === doc.regimen)?.descripcion || '';
        const impDesc = this.impuestos.find(i => i.idImpuestos === String(doc.impuestos))?.descripcion || '';
        const monedaDesc = this.moneda.find(m => m.idMoneda === doc.moneda?.trim())?.descripcion || '';
        const tipoMovDesc = tipoMov.data.find((t: any) => t.idTipoMov === doc.tipoMovimiento)?.descripcion || '';
        const clasDesc = clasificacion.data.find((c: any) => c.idClasificacionLE === doc.clasificacionLe?.trim())?.descripcion || '';
  
        const enlace = `${window.location.origin}/billingpayment?idCarpeta=${doc.idCarpetaPadre}&idDocumento=${doc.idCarpeta?.trim()}`;
  
        return {
          ...doc,
          idArea: areaDesc,
          revControl: revDesc,
          srIgv: igvDesc,
          tipoDet: tipoDetDesc,
          onsContable: obsDesc,
          regimen: regimenDesc,
          impuestos: impDesc,
          moneda: monedaDesc,
          tipoMovimiento: tipoMovDesc,
          clasificacionLe: clasDesc,
          enlace
        };
      });
  
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = { Sheets: { 'Documentos': worksheet }, SheetNames: ['Documentos'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'documentos.xlsx');
    });
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
      const now = new Date();
      const periodo = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const idCarpetaPadre: number = this.carpetaActual.idCarpeta!;
      this.apiService.existeDocumento(this.idEmpresa, idCarpeta).subscribe({
        next: (res) => {
          if (res.success === false) {
            // Crear carpeta si no existe
            this.apiService.crearDocumento(this.idEmpresa, idCarpeta, periodo, idCarpetaPadre).subscribe({
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
    this.verArchivos(e.data?.idCarpeta);
  }  

  verDetalle(idCarpeta: any, idDocumento?: any) {

    const carpeta = this.carpetasRaiz.find(c => c.idCarpeta === idCarpeta);
    this.carpetaActual = carpeta? carpeta: { idCarpetaPadre: null, final: false };
  
    if (!carpeta) {
      this.carpetaActual.final = false;
    }
    if (this.carpetaActual.final === true) {
      this.cargando = true;
      
      this.apiService.filtrarDocumentos(idCarpeta).subscribe({
        next: (res) => {
          this.products = res.data;
          this.mostrarTablaCarpetas= true;
          this.cargando = false;

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { idcarpeta: idCarpeta, iddocumento: idDocumento },
            replaceUrl: true
          });
        },
        error: (err) => {
          console.error('Error al filtrar documentos:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo filtrar documentos'
          });
          this.cargando = false;
        }
      });
    } else {
      this.cargandoc = true;
      // Si no es final, usamos listarCarpeta
      this.apiService.listarCarpeta(idCarpeta===null?'':idCarpeta).subscribe({
        
        next: (res) => {
          this.carpetasRaiz = res.data;
          this.mostrarTablaCarpetas = false;
          this.cargandoc = false;
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { idcarpeta: idCarpeta, iddocumento: idDocumento },
            replaceUrl: true
          });
        },
        error: (err) => {
          console.error('Error al listar carpeta:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo listar la carpeta'
          });
          this.cargandoc = false;
        }

        
      });
      console.log("prueba")
      console.log(idCarpeta)
      
    }
  }
  

  filtrarPorCarpeta(idCarpeta: string): void {
    this.apiService.filtrarDocumentos(idCarpeta).subscribe({
      next: (response) => {
        this.archivosCarpeta = response;
      },
      error: (error) => {
        console.error('Error al filtrar documentos:', error);
      }
    });
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
  
    // Comparar usando triple igual con conversión explícita
    const oldIgv = String(e.oldData['srIgv']);
    const newIgv = String(e.newData['srIgv']);
  
    // Solo si cambió el srIgv
    if (oldIgv !== newIgv) {
      const tipoIgv = cleanedData['srIgv'];
      const importeBruto = parseFloat(cleanedData['importeBruto']);
  
      if (!isNaN(importeBruto)) {
        let nuevoImporteNeto = importeBruto;
  
        if (tipoIgv === '2') {
          const det = Math.floor(importeBruto * 0.12);
          nuevoImporteNeto = importeBruto - det;
        } else if (tipoIgv === '3') {
          const ret = parseFloat((importeBruto * 0.03).toFixed(2));
          nuevoImporteNeto = importeBruto - ret;
        }
  
        cleanedData['importeNeto'] = nuevoImporteNeto;
  
        // Actualizar producto en products
        const index = this.products.findIndex(p => p.id === cleanedData.id);
        if (index !== -1) {
          this.products[index].importeNeto = nuevoImporteNeto;
          this.products[index].srIgv = tipoIgv; // asegurarse de reflejar el cambio también aquí
        }
      }
    }
  
    this.cargandoc = true;
    this.apiService.editarDocumento(cleanedData).subscribe({
      next: () => {
        this.cargandoc = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Documento actualizado correctamente.'
        });
  
        // Solo refrescar si existe el ID de carpeta
        const idCarpeta = this.route.snapshot.queryParamMap.get('idcarpeta') || this.route.snapshot.queryParamMap.get('idCarpeta');
        if (idCarpeta) {
          this.apiService.filtrarDocumentos(idCarpeta).subscribe({
            next: (res) => {
              this.products = res.data;
              this.mostrarTablaCarpetas = true;
              this.cargando = false;
            },
            error: (err) => {
              console.error('Error al filtrar documentos:', err);
            }
          });
        }
      },
      error: (err) => {
        this.cargandoc = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el documento'
        });
        e.cancel = true;
      }
    });
  }
  

  cerrarVistaArchivos() {
    this.mostrarTablaArchivos = false;
    this.cargandoArchivos = false; 
    this.archivosCarpeta = [];
    this.carpetaSeleccionada = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { idDocumento: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  
    if(this.products.length === 0){
      this.verDetalle(this.route.snapshot.queryParamMap.get('idcarpeta') || this.route.snapshot.queryParamMap.get('idCarpeta'))
    } 
  }

  abrirArchivo(e: any): void {
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
          this.verArchivos(this.carpetaSeleccionada.trim().replace(/\s+/g, '_'));
        },
        error: err => {
          console.error('Error al subir:', err);
        }
      });

    }
  }
  
  verArchivos(idDocumento: string) {
    const idCarpeta = this.route.snapshot.queryParamMap.get('idcarpeta') || this.route.snapshot.queryParamMap.get('idCarpeta');
    const documento = this.products.find(c => c.idCarpeta === idCarpeta);
    this.carpetaSeleccionada = idDocumento;
  
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { idCarpeta: idCarpeta, idDocumento: idDocumento },
      replaceUrl: true
    });

    this.cargandoArchivos = true;
    this.archivosCarpeta = []; // Limpiar archivos anteriores mientras se cargan los nuevos
    this.mostrarTablaArchivos = true;

    this.apiService.listarArchivosCarpeta(idDocumento.trim()).subscribe({
      next: (response) => {
        console.log(response)
        this.archivosCarpeta = Array.isArray(response) ? response : [response];
        this.cargandoArchivos = false;
        this.mostrarTablaArchivos = true;
        
      },
      error: (err) => {
        console.error('Error al obtener archivos:', err);
        this.cargandoArchivos = false;
      }
    });
    //this.mostrarTablaArchivos = true;
  }
  

  cerrarVistaCarpeta() {
    const idCarpeta = this.route.snapshot.queryParamMap.get('idcarpeta') || this.route.snapshot.queryParamMap.get('idCarpeta');

    if (idCarpeta) {
      this.apiService.listarCarpeta(idCarpeta).subscribe((res) => {
        console.log(res)
        if (
          res.data.length === 1 &&
          res.data[0].final === true &&
          res.data[0].esOrigen === true
        ) {
          this.carpetasRaiz = res.data;
          this.verDetalle(res.data[0].idCarpetaPadre);
        }
      });
    }
  }


  verArchivo(url: string, name: string) {
    this.archivoSeleccionadoUrl = url;
    this.archivoSeleccionadoNombre = name;
    this.mostrarVisor = true;
    if (this.esPDF(url) || this.esImagen(url)) {
      this.safeUrl = this.getSafeUrl(url);
    } else {
      this.safeUrl = null;
    }
  }

  esImagen(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }
  
  esPDF(url: string): boolean {
    return url.toLowerCase().endsWith('.pdf');
  }
  
  esWord(url: string): boolean {
    return /\.(doc|docx)$/i.test(url);
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  encodeURI(url: string): string {
    return encodeURIComponent(url);
  }
  
  descargarArchivo() {
    const esImagen = (url: string): boolean => {
      return /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(url);
    };
  
    if (esImagen(this.archivoSeleccionadoUrl)) {
      // CORS impide descarga directa, así que abrimos en nueva pestaña
      window.open(this.archivoSeleccionadoUrl, '_blank');
    } else {
      // Para archivos no-imagen, usamos blob
      fetch(this.archivoSeleccionadoUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al descargar archivo');
          }
          return response.blob();
        })
        .then(blob => {
          const urlBlob = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = urlBlob;
          link.download = this.archivoSeleccionadoNombre || 'archivo';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(urlBlob);
        })
        .catch(err => {
          console.error('Error al descargar archivo:', err);
        });
    }
  }

  abrirDialogo(tipo: string): void {
  
    if (!this.idCarpeta) {
      console.error('No se ha definido idCarpeta.');
      return;
    }
  
    // Extraer solo el RUC (antes del "_")
    const ruc = this.idCarpeta.split('_')[0];
    const idDocumento = tipo.toUpperCase(); // GRP, OCO, OSR
  
    this.apiService.listarDocumentosPendientes(this.idEmpresa, ruc, idDocumento).subscribe({
      next: (respuesta) => {
        console.log('Documentos recibidos:', respuesta);
        this.documentosPendientes = (respuesta?.data || []).map((doc: any) => ({
          ...doc,
          id: `${doc.serie}-${doc.numero}`
        })); // si necesitas mostrarlos
        this.tipoSeleccionado = tipo;
        this.tituloDialogo = `Detalles de ${tipo}`;
        this.dialogoVisible = true;
      },
      error: (error) => {
        console.error('Error al listar documentos pendientes:', error);
      }
    });
  }
  

  cerrarDialogo(): void {
    this.dialogoVisible = false;
    this.seleccionadosTabla1 = [];
    this.detallesTabla2 = [];
    this.previousSeleccionados = [];
    this.seleccionadosTabla2 = [];
    this.productosSeleccionados = []; 
    this.documentosConfirmados = [];
  }

  cerrarDialogos(): void {
    this.dialogoVisible = false;
    this.seleccionadosTabla1 = [];
    this.detallesTabla2 = [];
    this.previousSeleccionados = [];
    this.seleccionadosTabla2 = [];
    
  }

  toggleFila(row: any): void {
    const index = this.seleccionadosTabla1.findIndex(item => item.id === row.id);
    if (index > -1) {
      this.seleccionadosTabla1.splice(index, 1); // Deselecciona
    } else {
      this.seleccionadosTabla1.push(row); // Selecciona
    }
    this.onSeleccionarFila([...this.seleccionadosTabla1]);
  }
  
  filaSeleccionada(row: any): boolean {
    return this.seleccionadosTabla1.some(item => item.id === row.id);
  }

  onSeleccionarFila(nuevaSeleccion: any[]): void {
    const agregados = nuevaSeleccion.filter(x => !this.previousSeleccionados.includes(x));
    const removidos = this.previousSeleccionados.filter(x => !nuevaSeleccion.includes(x));
  
    if (!this.idCarpeta) {
      console.error('No se ha definido idCarpeta.');
      return;
    }
  
    const ruc = this.idCarpeta.split('_')[0];
    console.log('RUC extraído:', ruc);
  
    agregados.forEach((documento: any) => {
      const idDocumento = documento.tipoDocumento || this.tipoSeleccionado;
      const serie = documento.serie;
      const numero = documento.numero;
  
      // Llamar API detalle
      this.apiService.detalleDocumentosPendientes(this.idEmpresa, ruc, idDocumento, serie, numero).subscribe({
        next: (detalle) => {
          const detalles = detalle?.data || [];
          const detallesConId = detalles.map((item: any, index: number) => ({
            ...item,
            id: `${serie}-${numero}-${index}`
          }));
          this.detallesTabla2 = [...this.detallesTabla2, ...detallesConId];
        },
        error: (err) => {
          console.error('Error al obtener detalle:', err);
        }
      });
  
      // Si el tipo es GRP, llamar a ConsultarRefGuia
      if (idDocumento === 'GRP') {
        this.apiService.ConsultarRefGuia(idDocumento, serie, numero).subscribe({
          next: (res) => {
            console.log('Referencia GRP:', res);
            // Guardar en documentosConfirmados
            const documentoConfirmado = {
              tipo: idDocumento,
              serie,
              numero,
              fecha: documento.fecha || new Date().toISOString().split('T')[0]
            };
            this.documentosConfirmados.push(documentoConfirmado);
          },
          error: (err) => {
            console.error('Error al obtener referencia GRP:', err);
          }
        });
      }
    });
  
    removidos.forEach((documento: any) => {
      const serie = documento.serie;
      const numero = documento.numero;
      const clave = `${serie}-${numero}`;
      this.detallesTabla2 = this.detallesTabla2.filter(item => !item.id.startsWith(clave));
    });
  
    this.previousSeleccionados = [...nuevaSeleccion];
  }
  
  

  toggleFila2(rowData: any) {
    const index = this.seleccionadosTabla2.findIndex(item => item.id === rowData.id);
    if (index !== -1) {
      this.seleccionadosTabla2.splice(index, 1);
    } else {
      this.seleccionadosTabla2.push(rowData);
    }
  }
  
  filaSeleccionada2(rowData: any): boolean {
    return this.seleccionadosTabla2.some(item => item.id === rowData.id);
  }

  mostrarDatosEnGrid() {
    const productoRelacionado = this.products.find(
      (prod: any) => prod.idCarpeta === this.idCarpeta
    );
  
    const observacion = productoRelacionado?.observacionesGlosa || '';
  
    this.productosSeleccionados = this.seleccionadosTabla2.map((item, index) => {
  
      return {
        idCarpeta: index + 1,
        item: item.item,
        cuenta: '',
        observaciones: observacion,
        costos: '',
        descripcioncc: '',
        destino: '',
        importe: '',
        descripcionp: item.descripcion,
        cantidad: item.Cantidad || item.cantidad,
        producto: item.idProducto,
        referencia: item.referencia,
      };
    });
  
    this.mostrarTablaSeleccionados = true;
    this.documentosConfirmados = [...this.seleccionadosTabla1];
    this.dialogoVisible = false;
    console.log(this.productosSeleccionados);
    console.log('products:', this.products);
  }
  
  
  editar(e: any) {
    const updatedData = e.newData;
    const oldData = e.oldData;
  
    const index = this.productosSeleccionados.findIndex(item => item === oldData);
  
    // Función para aplicar los cambios válidos
    const aplicarCambios = () => {
      if (index !== -1) {
        this.productosSeleccionados[index] = {
          ...this.productosSeleccionados[index],
          ...updatedData
        };
  
        this.messageService.add({
          severity: 'success',
          summary: 'Cambios guardados',
          detail: 'Los datos fueron actualizados correctamente'
        });
      }
    };
  
    // Validar cuenta si fue modificada
    if (updatedData?.cuenta && updatedData.cuenta !== oldData.cuenta) {
      this.apiService.validarCuenta(this.idEmpresa, updatedData.cuenta).subscribe(res => {
        if (res?.data?.[0] === false) {
          this.messageService.add({
            severity: 'error',
            summary: 'Cuenta inválida',
            detail: 'Esa cuenta no existe, ingrese una correcta'
          });
    
          if (index !== -1) this.productosSeleccionados[index].cuenta = '';
          e.cancel = true;
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Cuenta válida',
            detail: 'La cuenta fue validada correctamente'
          });
    
          aplicarCambios(); // cuenta válida
        }
      });
    }
    
    // Validar destino si fue modificado
    else if (updatedData?.destino && updatedData.destino !== oldData.destino) {
      this.apiService.validarDestino(updatedData.destino).subscribe(res => {
        if (res?.data?.[0] === false) {
          this.messageService.add({
            severity: 'error',
            summary: 'Destino inválido',
            detail: 'Ese destino no existe, ingrese uno correcto'
          });
    
          if (index !== -1) this.productosSeleccionados[index].destino = '';
          e.cancel = true;
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Destino válido',
            detail: 'El destino fue validado correctamente'
          });
    
          aplicarCambios(); // destino válido
        }
      });
    }    
  }
  
  
  
  generar() {
    this.confirmationService.confirm({
      message: '¿Estás segura que deseas generar el aprovisionamiento?',
      header: 'Confirmar generación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.grabar(); // Llama a la función que realiza la acción
      },
      reject: () => {
        // Opcional: puedes mostrar un mensaje o dejar vacío
      }
    });
  }

  grabar() {

    if (!this.idCarpeta) {
      console.error('No se ha definido idCarpeta.');
      return;
    }
    const carpeta = this.products.find(p => p.idCarpeta === this.idCarpeta);
    const ruc = this.idCarpeta?.split('_')[0] ?? '';
    const serie = this.idCarpeta?.split('_')[1]?.split('-')[0] ?? '';
    const numero = this.idCarpeta?.split('-')[1] ?? '';
    const tipoTabla = 
  this.tipoSeleccionado === 'GRP' ? 'INGRESOSALIDAALM' :
  this.tipoSeleccionado === 'OCO' ? 'ORDENCOMPRA' :
  this.tipoSeleccionado === 'OSR' ? 'ORDENSERVICIO' :
  '';
  const tipo = this.tipoSeleccionado?.toUpperCase() || '';
    this.apiService.generarIdCobrarPagarDoc(this.idEmpresa, this.idCarpeta).subscribe({
      next: (response) => {
        this.generarDeshabilitado = true;
  
        // Mostramos mensaje de éxito de la primera acción
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Asignado con éxito'
        });
  
        // Llamamos a la segunda API después del éxito de la primera
        const body = {

          lcEmpresa: this.idEmpresa,
          lcId: response.data[0]?.idCobrarPagarDoc,  // Ajusta si tu API retorna el ID generado
          idCarpeta: this.idCarpeta,
          xmlData: `<?xml version = "1.0" encoding="Windows-1252" standalone="yes"?>
          <VFPData>
            <cobrarpagardoc>
              <idempresa>${this.idEmpresa}</idempresa>
              <idcobrarpagardoc>${response.data[0]?.idCobrarPagarDoc}</idcobrarpagardoc>
              <idemisor>${this.idEmpresa}</idemisor>
              <periodo>${carpeta?.periodo}</periodo>
              <idoperacion>PPFC</idoperacion>
              <numoperacion>0000000660</numoperacion>
              <idsubdiario/>
              <voucher/>
              <fecharegistro>${carpeta?.fechaCreacion}</fecharegistro>
              <idsucursal>001</idsucursal>
              <idalmacen/>
              <idcaja/>
              <idcontrol/>
              <idpedidopv/>
              <origen>P</origen>
              <iddocumento>FAC</iddocumento>
              <serie>${serie}</serie>
              <numero>${numero}</numero>
              <fecha>${carpeta?.fechaCreacion}</fecha>
              <dias>0</dias>
              <vencimiento>${carpeta?.fechaVcto}</vencimiento>
              <tcambio>3.662000</tcambio>
              <idclieprov>${ruc}</idclieprov>
              <direccion/>
              <ruc>${ruc}</ruc>
              <razonsocial>${carpeta?.razonSocial}</razonsocial>
              <idclieprov2/>
              <lugargiro/>
              <idvendedor/>
              <idproyecto/>
              <idregimen>${carpeta?.regimen}</idregimen>
              <idmoneda>${carpeta?.moneda}</idmoneda>
              <tcmoneda>1.000000</tcmoneda>
              <idestadoletra/>
              <idtipoventa/>
              <idtipomov>${carpeta?.tipoMovimiento}</idtipomov>
              <idmotivo/>
              <idfpago>004</idfpago>
              <idarea>${carpeta?.idArea}</idarea>
              <glosa>${carpeta?.observacionesGlosa}</glosa>
              <ocompra/>
              <vventa>${carpeta?.importeBruto}</vventa>
              <inafecto>0.00</inafecto>
              <otros>0</otros>
              <impuesto>${carpeta?.importeNeto - carpeta?.importeBruto}</impuesto>
              <pimpuesto>18.0000</pimpuesto>
              <descuento>0.00</descuento>
              <pdescuento>0.0000</pdescuento>
              <descuentodoc>0.00</descuentodoc>
              <redondeo>0.000000</redondeo>
              <importe>${carpeta?.importeNeto}</importe>
              <importemof>0</importemof>
              <importemex>0</importemex>
              <iddocdetrac/>
              <seriedetrac/>
              <numerodetrac/>
              <fechadetrac/>
              <regagricola>0</regagricola>
              <exportacion>0</exportacion>
              <importacion>0</importacion>
              <es_apertura>0</es_apertura>
              <afecta_almacen>0</afecta_almacen>
              <muevekardex>0</muevekardex>
              <gastoaduana>0</gastoaduana>
              <multivendedores>0</multivendedores>
              <idcontabilizado/>
              <idajuste/>
              <idestado>PE</idestado>
              <sincroniza>N</sincroniza>
              <precioigv>0</precioigv>
              <igv>0</igv>
              <contabilizado>0</contabilizado>
              <idusuario>MCUEVA</idusuario>
              <ventana>EDT_PROVISION</ventana>
              <fechacreacion>${carpeta?.fechaCreacion}</fechacreacion>
              <comision>0</comision>
              <aplicar_anticipo>0</aplicar_anticipo>
              <impreso>0</impreso>
              <marcas/>
              <ptoorigen/>
              <ptodestino/>
              <embarcadoen/>
              <nrobultos/>
              <pesobruto/>
              <pesoneto/>
              <fechaocc/>
              <fecharecepocc/>
              <numeroocc/>
              <idflete/>
              <fechaembarque/>
              <nroembarque/>
              <idtipocontenedor/>
              <idtipoprecio/>
              <idmovplanilla/>
              <es_detraccion>0</es_detraccion>
              <indicadorventa/>
              <con_retencion>0</con_retencion>
              <idplanilla/>
              <fecha_desde/>
              <fecha_hasta/>
              <idingresoegresocaba/>
              <detgeneral>0</detgeneral>
              <detalle1/>
              <totaldetalle1>0</totaldetalle1>
              <detalle2/>
              <totaldetalle2>0</totaldetalle2>
              <detalle3/>
              <totaldetalle3>0</totaldetalle3>
              <idretencion/>
              <idmediopago/>
              <fecha_entrega>${carpeta?.fechaCreacion}</fecha_entrega>
              <feci_4ta5ta/>
              <fecf_4ta5ta/>
              <dua/>
              <idlineaaerea/>
              <idtransportista/>
              <awb/>
              <exonerado>0</exonerado>
              <con_declimportacion>0</con_declimportacion>
              <idviajet/>
              <imp_costo>0</imp_costo>
              <idcontacto/>
              <idcontrata/>
              <imp_presupuesto>0</imp_presupuesto>
              <numero_rcompras>0135269</numero_rcompras>
              <certiftransporte/>
              <certiftransporte1/>
              <idvehiculo/>
              <placa/>
              <placa1/>
              <marca/>
              <marca1/>
              <idchofer/>
              <chofer/>
              <brevete/>
              <fechatraslado/>
              <razonsocial2/>
              <iddocpretencion/>
              <docpretencion/>
              <iddocdrawback/>
              <docdrawback/>
              <iddocrliqcompra/>
              <docrliqcompra/>
              <itemptodestino/>
              <itemptoembarque/>
              <itemagente_aduana/>
              <idreserva>0</idreserva>
              <item>0</item>
              <idvia_embarque/>
              <idcontabilizado2/>
              <iddocdetraccion/>
              <idunidadnegocio/>
              <idsubunidadnegocio/>
              <area_ha>0</area_ha>
              <idcontrato/>
              <idhabilitacion/>
              <con_entregarendir>0</con_entregarendir>
              <doc_entregarendir/>
              <importado_externo>0</importado_externo>
              <idreclamo/>
              <idreferencia_externo/>
              <exonerado_isc>0</exonerado_isc>
              <iddocumento_alm/>
              <serie_alm/>
              <numero_alm/>
              <fecha_alm/>
              <estadosunat>ACTIVO</estadosunat>
              <condicionsunat>HABIDO</condicionsunat>
              <es_gasto_vinculado>0</es_gasto_vinculado>
              <flete_awb>0</flete_awb>
              <cantidad>0</cantidad>
              <idmoneda_prt/>
              <iddocumento_prt/>
              <serie_prt/>
              <numero_prt/>
              <fecha_prt/>
              <importe_prt>0</importe_prt>
              <tcambio_emision>0</tcambio_emision>
              <nro_contenedor/>
              <fechaawb/>
              <referencia_cliente/>
              <isc>0</isc>
              <idsucursal2_o/>
              <idalmacen2_o/>
              <idsucursal2_d/>
              <idalmacen2_d/>
              <idresponsable/>
              <con_percepcion>0</con_percepcion>
              <idpercepcion/>
              <docpercepcion/>
              <genera_docalmacen>0</genera_docalmacen>
              <idnotificante/>
              <fdistribucion>0</fdistribucion>
              <idingresosalidaactivo/>
              <ventanaref/>
              <idreferencia1/>
              <flete_acuerdo>0</flete_acuerdo>
              <idrecepdocumentos/>
              <idactividad/>
              <idestructura/>
              <idmotivo_an/>
              <motivo_an/>
              <idresponsable_an/>
              <observacion_an/>
              <archivo_ce/>
              <transferido_ce>0</transferido_ce>
              <situacion_ce>ACEPTADO</situacion_ce>
              <idanulacion_ws/>
              <idclieprov3/>
              <transferido_ws>0</transferido_ws>
              <ruta_archivo_ce/>
              <ruta_archivo_signed_ws/>
              <archivo_signed_ce/>
              <estado_ce>0</estado_ce>
              <idestadosunat/>
              <idclasificacion_bs_sunat>001</idclasificacion_bs_sunat>
              <nro_autsunat/>
              <estado_autsunat/>
              <periodo_correccion/>
              <identificador_correccion/>
              <validado_ce>0</validado_ce>
              <idmotivo_emision/>
              <idtipo_impresion_omt/>
              <idopebanco/>
              <idpremotivo_emision/>
              <serie_bak/>
              <idmotivo_andv/>
              <fecharecep/>
              <serie_grande>${serie}</serie_grande>
              <vgratuita>0</vgratuita>
              <vexonerada>0</vexonerada>
              <vinafecta>0</vinafecta>
              <vgravada>0</vgravada>
              <idruta/>
              <numversion>1</numversion>
              <idbanco/>
              <idpuntoventa/>
              <idtarjeta/>
              <ncuentachaque/>
              <ntarjetacheque/>
              <numaperturacierre/>
              <numpedido/>
              <vventa_importacion>0</vventa_importacion>
              <autodetraccion>0</autodetraccion>
              <idvehiculo_origen/>
              <idcampana/>
              <esletradescuento>0</esletradescuento>
              <nro_rem_carga/>
              <nro_rem_trans/>
              <esgdeducible>0</esgdeducible>
            </cobrarpagardoc>
          </VFPData>`,  // Reemplaza con los datos reales que tengas
          xmlDeta: `<?xml version = "1.0" encoding="Windows-1252" standalone="yes"?>
          <VFPData>
          ${this.productosSeleccionados.map((p, index) => `
            <dcobrarpagardoc>
              <idempresa>${this.idEmpresa}</idempresa>
              <idcobrarpagardoc>${response.data[0]?.idCobrarPagarDoc}</idcobrarpagardoc>
              <item>${p.item}</item>
              <itemliquidacion/>
              <idclieprov/>
              <idcuenta>${p.cuenta}</idcuenta>
              <idconsumidor/>
              <iddestino>${p.destino}</iddestino>
              <idtipotransaccion/>
              <idproducto>${p.producto}</idproducto>
              <idmedida>PZA</idmedida>
              <descripcion>${p.descripcionp}</descripcion>
              <idestadoproducto>0</idestadoproducto>
              <idlote/>
              <idserie/>
              <idreferencia>${p.referencia}</idreferencia>
              <origen/>
              <idmovrefer/>
              <iddocrefer/>
              <serierefer/>
              <numerorefer/>
              <fecharefer/>
              <vencerefer/>
              <es_nuevo>0</es_nuevo>
              <cantidad>${p.cantidad}</cantidad>
              <precio>${p.importe}</precio>
              <preciolista>0</preciolista>
              <precio_cif>0</precio_cif>
              <impuesto_i>0</impuesto_i>
              <impuesto>0</impuesto>
              <vventa>${p.importe}</vventa>
              <descuento_i>0</descuento_i>
              <descuento>0</descuento>
              <importe>0</importe>
              <fechadocventa/>
              <seriedocventa/>
              <numerodocventa/>
              <idref/>
              <itemref>${p.item}</itemref>
              <tablaref>${tipoTabla}</tablaref>
              <idubicacion/>
              <observaciones/>
              <idactividad/>
              <idlabor/>
              <anniofabricacion/>
              <idcolor/>
              <idot/>
              <dsc_ot/>
              <iddoc_venta/>
              <dsc_docventa/>
              <itemot/>
              <nromotor/>
              <nrochasis/>
              <pcosto_mof>0</pcosto_mof>
              <pcosto_mex>0</pcosto_mex>
              <tcosto_mof>0</tcosto_mof>
              <tcosto_mex>0</tcosto_mex>
              <doc_pret/>
              <ser_pret/>
              <nro_pret/>
              <nofacturar>0</nofacturar>
              <idactivo/>
              <flete>0</flete>
              <seguro>0</seguro>
              <otros>0</otros>
              <valorexport>0</valorexport>
              <idcampana/>
              <idloteproduccion/>
              <idordenproduccion/>
              <idsiembra/>
              <docordenproduccion/>
              <vin/>
              <importe_isc>0</importe_isc>
              <idpartidaarancel/>
              <saldoocc>0</saldoocc>
              <idparteproduccion/>
              <docparteproduccion/>
              <precio_fob>0</precio_fob>
              <factor>0</factor>
              <gratuito>0</gratuito>
              <idingresosalidaalm/>
              <documentoalmacen/>
              <itemalmacen/>
              <ventana/>
              <distribucion/>
              <liberado>0</liberado>
              <idvehiculo/>
              <es_docne>0</es_docne>
              <anticipo>0</anticipo>
              <idmedida2/>
              <cantidad2>0</cantidad2>
              <idmedida_fac/>
              <cantidad_fac>0</cantidad_fac>
              <precio_fac>0</precio_fac>
              <idmedida3/>
              <cantidad3>0</cantidad3>
              <precio3>0</precio3>
              <importe3>0</importe3>
              <iddoc_almacen/>
              <doc_almacen/>
              <idtipoafectacion/>
              <vventa_origen>${p.importe}</vventa_origen>
              <es_acobrarpagardoc>0</es_acobrarpagardoc>
              <estructura/>
              <con_fise>0</con_fise>
              <fise>0</fise>
              <automatico>0</automatico>
              <es_exonerado>0</es_exonerado>
              <fecha_provision/>
              <importe_provision>0</importe_provision>
              <idpromocion/>
              <itempromocion/>
              <es_inafecto>0</es_inafecto>
              <idkit/>
              <es_kit>0</es_kit>
              <columnabutaca>0</columnabutaca>
              <etiquetabutaca/>
              <idcategoria/>
              <idbloque/>
              <filabutaca>0</filabutaca>
              <idtarifa/>
              <categoria/>
              <tarifa/>
              <es_cortesia>0</es_cortesia>
              <es_costoexp>0</es_costoexp>
              <idtipo_costoexp/>
              <numversionref>0</numversionref>
              <idreferencia2/>
              <itemref2/>
              <tablaref2/>
              <cma30eqpid/>
              <idruta/>
              <idlugar_o/>
              <idlugar_d/>
              <descuento_i1>0</descuento_i1>
              <descuento1>0</descuento1>
              <descuento_i2>0</descuento_i2>
              <descuento2>0</descuento2>
              <descuento_i3>0</descuento_i3>
              <descuento3>0</descuento3>
              <idconcepto/>
              <sinbutaca>false</sinbutaca>
              <idcondicion/>
              <idetiqueta/>
              <tasaret>0</tasaret>
              <tiporet/>
              <ajuste>0</ajuste>
              <idorigen/>
              <lote_ref/>
              <idloteinmobiliaria/>
            </dcobrarpagardoc>
            `).join('')}
          </VFPData>`,
          xmlImp: `<?xml version = "1.0" encoding="Windows-1252" standalone="yes"?>
          <VFPData>
          ${this.productosSeleccionados.map((p, index) => `
            <icobrarpagardoc>
              <idempresa>${this.idEmpresa}</idempresa>
              <idcobrarpagardoc>${response.data[0]?.idCobrarPagarDoc}</idcobrarpagardoc>
              <item>${p.item}</item>
              <idimpuesto>${response.data[0]?.impuestos}</idimpuesto>
              <subitem/>
              <valor>${response.data[0]?.impuestos === '027'? '10.00':'18.00'}</valor>
              <baseimponible>${
                (p.importe - 
                  (response.data[0]?.impuestos === '027' 
                    ? p.importe * 0.10 
                    : p.importe * 0.18)
                ).toFixed(2)
              }</baseimponible>
              <impuesto>${response.data[0]?.impuestos === '027' 
                ? (p.importe * 0.10).toFixed(2) 
                : (p.importe * 0.18).toFixed(2)}</impuesto>
              <idcuenta/>
              <idccosto/>
              <orden>0</orden>
              <porcentual>0</porcentual>
              <aplicaianterior>0</aplicaianterior>
              <idproducto/>
              <porcentaje>0</porcentaje>
              <impto_de_catalogo>0</impto_de_catalogo>
              <calculo_especifico>0</calculo_especifico>
              <baseimponible_ant>0</baseimponible_ant>
              <impuesto_ant>0</impuesto_ant>
            </icobrarpagardoc>
            `).join('')}
          </VFPData>`,
          xmlRef: `<?xml version = "1.0" encoding="Windows-1252" standalone="yes"?>
          <VFPData>
           ${this.documentosConfirmados.map((p: any) => `
            <docreferencia_cp>
              <idempresa>${this.idEmpresa}</idempresa>
              <idorigen>${response.data[0]?.idCobrarPagarDoc}</idorigen>
              <tabla>${tipoTabla}</tabla>
              <idreferencia>${p.referencia}</idreferencia>
              <iddocumento>${tipo}</iddocumento>
              <serie>${p.serie}</serie>
              <numero>${p.numero}</numero>
              <fecha>${p.fecha}</fecha>
              <glosa/>
              <aplicar_ncr>0</aplicar_ncr>
              <documento2/>
              <exonerado>0</exonerado>
              <documento3/>
              <origen/>
            </docreferencia_cp>
            `).join('')}
          </VFPData>`,
          c_xml_da: `<?xml version = "1.0" encoding="Windows-1252" standalone="yes"?>
          <VFPData>
            <dcobrarpagardoc_a>
              <idempresa>${this.idEmpresa}</idempresa>
              <idcobrarpagardoc>${response.data[0]?.idCobrarPagarDoc}</idcobrarpagardoc>
              <semana>${
                (() => {
                  const fecha = new Date(carpeta?.fechaCreacion);
                  const inicioAno = new Date(fecha.getFullYear(), 0, 1);
                  const diasTranscurridos = Math.floor((fecha.getTime() - inicioAno.getTime()) / (1000 * 60 * 60 * 24));
                  return Math.ceil((diasTranscurridos + inicioAno.getDay() + 1) / 7);
                })()
              }
              </semana>
            </dcobrarpagardoc_a>
          </VFPData>`
        };
        console.log(body)
        /*this.apiService.grabarCobrarPagarDoc(body).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cobro/Pago registrado correctamente.'
            });
          },
          error: (err) => {
            console.error('Error al grabar CobrarPagar:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo registrar el cobro/pago.'
            });
          }
        });*/
      },
      error: (err) => {
        console.error('Error al generar:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear el documento'
        });
      }
      
    });
  }
  
  crearCarpeta() {
    const carpetaRaiz = !this.idCarpetaPadre || this.idCarpetaPadre === 0;
  
    const body = {
      nombreCarpeta: this.nombreCarpeta,
      idCarpetaPadre: this.idCarpetaPadre,
      carpetaRaiz: carpetaRaiz,
      usuarioCreador: this.usuarioCreador,
      final: this.final
    };
  
    this.apiService.crearCarpeta(body).subscribe({
      next: () => {
        this.mostrarCardCrearCarpeta = false;
        this.nombreCarpeta = '';
        this.final = false;

        if (!this.idCarpetaPadre) {
          // idCarpetaPadre es null, undefined, 0 o falsy
          this.apiService.listarCarpeta('').subscribe((res) => {
            this.carpetasRaiz = res.data; 
          });
        } else {
          this.verDetalle(this.idCarpetaPadre);
        }
      },
      error: (err) => {
        console.error('Error al crear carpeta', err);
      }
    });
  }
  
  

  mensajeAyudaFinal() {
    alert('Si marcas esta opción, la carpeta se creará como definitiva (Final).');
  }
  
  
  eliminarArchivo(event: MouseEvent, idCarpeta: string, nombreArchivo: string) {
    event.stopPropagation(); // Previene que se ejecute verArchivo
  
    this.confirmationService.confirm({
      message: `¿Deseas eliminar el archivo "${nombreArchivo}"?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.apiService.eliminarArchivoDocumento(this.carpetaSeleccionada, nombreArchivo).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Archivo eliminado' });
            // Vuelve a cargar archivos (o simplemente los filtras si ya están en memoria)
            this.archivosCarpeta = this.archivosCarpeta.filter(a => a.name !== nombreArchivo);
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error al eliminar archivo' });
            console.error(err);
          }
        });
      }
    });
  }
  
  getDescripcionMoneda(id: string): string {
    const monedaEncontrada = this.moneda.find(m => m.idMoneda === id);
    return monedaEncontrada ? monedaEncontrada.descripcion : 'Desconocida';
  }
  
  getDescripcionRegimen(id: string): string {
    const regimenEncontrado = this.regimen.find(r => r.idRegimen === id);
    return regimenEncontrado ? regimenEncontrado.descripcion : 'Desconocido';
  }

  getDescripcionImpuestos(id: string): string {
    const impuestoEncontrado = this.impuestos.find(r => r.idImpuestos === id);
    return impuestoEncontrado ? impuestoEncontrado.descripcion : 'Desconocido';
  }

  getMontoImpuesto(): number {
    const id = this.productoSeleccionadoResumen?.impuestos?.trim();
    const total = this.getImporteTotal();
  
    if (id === '027') {
      return total * 0.10;
    } else if (id === '003') {
      return total * 0.18;
    } else {
      return 0;
    }
  }

  getImporteTotal(): number {
    return this.productosSeleccionados.reduce((acc, prod) => acc + (Number(prod.importe) || 0), 0);
  }
  
  cargarResumenProducto(idCarpeta: string) {  

    console.log(idCarpeta)
    const productoRelacionado = this.products.find(
      (prod: any) => prod.idCarpeta === idCarpeta
    );
    console.log(productoRelacionado);

    if (!productoRelacionado) {
      console.warn('No se encontró producto con idCarpeta:', idCarpeta);
      return;
    }
    const moneda = productoRelacionado.moneda || '';
    const regimen = productoRelacionado.regimen || '';
    const baseImponible = productoRelacionado.baseImponible || '';
    const total = productoRelacionado.total || '';
    const impuestos = productoRelacionado.impuestos || '';
  
    this.productoSeleccionadoResumen = {
      moneda,
      regimen,
      baseImponible,
      impuestos,
      total
    };
  
    this.mostrarTablaSeleccionados = true;
    this.documentosConfirmados = [...this.seleccionadosTabla1];
    this.dialogoVisible = false;
  
    console.log('Resumen seleccionado:', this.productoSeleccionadoResumen);
  }
  
  
}
