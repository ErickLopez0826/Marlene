// Verificar si el usuario está logueado
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    console.log('🔍 Verificando autenticación...');
    console.log('👤 Usuario:', user ? 'Sí' : 'No');
    console.log('🔑 Token:', token ? 'Sí' : 'No');
    
    if (!user || !token) {
        console.log('❌ No autenticado, redirigiendo al login');
        window.location.href = '/html/login.html';
        return false;
    }
    
    console.log('✅ Usuario autenticado');
    return true;
}

// Verificar autenticación al cargar la página
if (!checkAuth()) {
    // La redirección ya se hace en checkAuth()
    throw new Error('No autenticado');
}

// Función para obtener headers de autenticación
function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
    console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
    console.log('🔑 Token valor:', token ? token.substring(0, 20) + '...' : 'No token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Función para mostrar mensajes
function showMessage(message, type = 'info') {
    const messagesContainer = document.getElementById('form-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Remover mensaje después de 5 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Variables globales
let productos = [];
let productosFiltrados = [];
let productosSeleccionados = new Set();
let currentPage = 1;
const itemsPerPage = 50;

// Variables para promociones existentes
let promociones = [];
let promocionesFiltradas = [];
let currentPagePromociones = 1;
const itemsPerPagePromociones = 12;

// Elementos del DOM
const productosGrid = document.getElementById('productos-grid');
const searchInput = document.getElementById('search-productos');
const paginationInfo = document.getElementById('pagination-info');
const pageNumbers = document.getElementById('page-numbers');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Elementos para promociones existentes
const promocionesGrid = document.getElementById('promociones-grid');
const searchPromocionesInput = document.getElementById('search-promociones');
const promocionesPaginationInfo = document.getElementById('promociones-pagination-info');
const promocionesPageNumbers = document.getElementById('promociones-page-numbers');
const promocionesPrevBtn = document.getElementById('promociones-prev-btn');
const promocionesNextBtn = document.getElementById('promociones-next-btn');

// Elementos del formulario
const promocionForm = document.getElementById('promocion-form');
const descripcionInput = document.getElementById('descripcion');
const fechaInicioInput = document.getElementById('fecha_inicio');
const fechaFinInput = document.getElementById('fecha_fin');
const tipoSelect = document.getElementById('tipo');
const valorInput = document.getElementById('valor');
const observacionesInput = document.getElementById('observaciones');
const productosSeleccionadosDiv = document.getElementById('productos-seleccionados');

// URLs de la API
const API_PRODUCTOS = '/api/productos';
const API_PROMOCIONES = '/api/promociones';

// Función para cargar productos
async function cargarProductos() {
    try {
        console.log('🔍 Cargando productos...');
        const response = await fetch(API_PRODUCTOS, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            productos = await response.json();
            productosFiltrados = [...productos];
            console.log('✅ Productos cargados:', productos.length);
            renderProductos();
        } else {
            throw new Error('Error al cargar productos');
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showMessage('Error al cargar productos', 'error');
    }
}

// Función para buscar productos
let searchTimeout;
function buscarProductos(query) {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        productosFiltrados = productos.filter(producto =>
            producto.Nombre.toLowerCase().includes(query.toLowerCase()) ||
            (producto.Marca && producto.Marca.toLowerCase().includes(query.toLowerCase()))
        );
        currentPage = 1;
        renderProductos();
    }, 300);
}

// Función para renderizar productos
function renderProductos() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productosPaginados = productosFiltrados.slice(startIndex, endIndex);
    
    productosGrid.innerHTML = '';
    
    productosPaginados.forEach(producto => {
        const card = document.createElement('div');
        card.className = `producto-card ${productosSeleccionados.has(producto.ID_Producto) ? 'selected' : ''}`;
        card.onclick = () => toggleProducto(producto.ID_Producto);
        
        card.innerHTML = `
            <input type="checkbox" class="producto-checkbox" 
                   ${productosSeleccionados.has(producto.ID_Producto) ? 'checked' : ''}
                   onchange="toggleProducto(${producto.ID_Producto})">
            <div class="producto-info">
                <div class="producto-nombre">${producto.Nombre}</div>
                <div class="producto-presentacion">${producto.Presentacion || 'Sin presentación'}</div>
                <div class="producto-precio">$${producto.Precio_Venta}</div>
            </div>
        `;
        
        productosGrid.appendChild(card);
    });
    
    actualizarPaginacion();
    actualizarProductosSeleccionados();
}

// Función para alternar selección de producto
function toggleProducto(productoId) {
    if (productosSeleccionados.has(productoId)) {
        productosSeleccionados.delete(productoId);
    } else {
        productosSeleccionados.add(productoId);
    }
    
    renderProductos();
}

// Función para actualizar paginación
function actualizarPaginacion() {
    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    
    // Actualizar información de paginación
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, productosFiltrados.length);
    paginationInfo.textContent = `Mostrando ${startIndex} a ${endIndex} de ${productosFiltrados.length} productos`;
    
    // Actualizar botones de navegación
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // Actualizar números de página
    pageNumbers.innerHTML = '';
    const maxPages = Math.min(totalPages, 5);
    const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    
    for (let i = startPage; i < startPage + maxPages && i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => irAPagina(i);
        pageNumbers.appendChild(pageBtn);
    }
}

// Función para ir a una página específica
function irAPagina(page) {
    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProductos();
    }
}

// Función para actualizar productos seleccionados
function actualizarProductosSeleccionados() {
    if (productosSeleccionados.size === 0) {
        productosSeleccionadosDiv.innerHTML = '<p class="no-selection">Ningún producto seleccionado</p>';
        return;
    }
    
    const productosSeleccionadosList = Array.from(productosSeleccionados).map(id => {
        const producto = productos.find(p => p.ID_Producto === id);
        return producto ? producto.Nombre : `Producto ${id}`;
    });
    
    productosSeleccionadosDiv.innerHTML = `
        <div class="selected-products-list">
            ${productosSeleccionadosList.map(nombre => `
                <span class="selected-product-tag">${nombre}</span>
            `).join('')}
        </div>
    `;
}

// Función para validar formulario
function validarFormulario() {
    const descripcion = descripcionInput.value.trim();
    const fechaInicio = fechaInicioInput.value;
    const fechaFin = fechaFinInput.value;
    const tipo = tipoSelect.value;
    const valor = valorInput.value;
    
    if (!descripcion) {
        showMessage('La descripción es obligatoria', 'error');
        return false;
    }
    
    if (!fechaInicio) {
        showMessage('La fecha de inicio es obligatoria', 'error');
        return false;
    }
    
    if (!fechaFin) {
        showMessage('La fecha de fin es obligatoria', 'error');
        return false;
    }
    
    if (new Date(fechaInicio) >= new Date(fechaFin)) {
        showMessage('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
        return false;
    }
    
    if (!tipo) {
        showMessage('El tipo de promoción es obligatorio', 'error');
        return false;
    }
    
    if (!valor || valor <= 0) {
        showMessage('El valor de la promoción es obligatorio y debe ser mayor a 0', 'error');
        return false;
    }
    
    if (productosSeleccionados.size === 0) {
        showMessage('Debe seleccionar al menos un producto', 'error');
        return false;
    }
    
    return true;
}

// Función para guardar promoción
async function guardarPromocion() {
    const guardarBtn = document.getElementById('guardar-promocion-btn');
    
    if (!validarFormulario()) {
        return;
    }
    
    try {
        if (guardarBtn) {
            guardarBtn.disabled = true;
            guardarBtn.innerHTML = '<span class="loading"></span> Guardando...';
        }
        
        const promocionData = {
            descripcion: descripcionInput.value.trim(),
            fecha_inicio: fechaInicioInput.value,
            fecha_fin: fechaFinInput.value,
            tipo: tipoSelect.value,
            valor: parseFloat(valorInput.value),
            observaciones: observacionesInput.value.trim(),
            productos: Array.from(productosSeleccionados)
        };
        
        console.log('📤 Enviando datos de promoción:', promocionData);
        
        const response = await fetch(API_PROMOCIONES, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(promocionData)
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Status Text:', response.statusText);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('❌ Error response:', errorData);
            
            // Si es error de autenticación
            if (response.status === 401) {
                showMessage('Sesión expirada, por favor inicia sesión nuevamente', 'error');
                window.location.href = '/html/login.html';
                return;
            }
            
            throw new Error(`Error al guardar promoción: ${response.status} ${response.statusText}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Resultado:', resultado);
        
        showMessage('Promoción guardada correctamente', 'success');
        
        // Limpiar formulario
        promocionForm.reset();
        productosSeleccionados.clear();
        actualizarProductosSeleccionados();
        renderProductos();
        
        // Recargar promociones existentes inmediatamente
        await cargarPromociones();
        
        // Resetear página de promociones a la primera
        currentPagePromociones = 1;
        
    } catch (error) {
        console.error('❌ Error al guardar promoción:', error);
        
        // Mostrar mensaje más específico
        if (error.message.includes('Failed to fetch')) {
            showMessage('Error de conexión con el servidor', 'error');
        } else if (error.message.includes('401')) {
            showMessage('Sesión expirada, por favor inicia sesión nuevamente', 'error');
        } else {
            showMessage('Error al guardar promoción: ' + error.message, 'error');
        }
    } finally {
        // Siempre restaurar el botón
        if (guardarBtn) {
            guardarBtn.disabled = false;
            guardarBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Promoción';
        }
    }
}

// Función para cargar promociones existentes
async function cargarPromociones() {
    try {
        console.log('🔍 Intentando cargar promociones...');
        console.log('📡 URL:', API_PROMOCIONES);
        
        const headers = getAuthHeaders();
        console.log('🔑 Headers:', headers);
        
        const response = await fetch(API_PROMOCIONES, {
            headers: headers
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Status Text:', response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📄 Datos recibidos:', data);
            console.log('📄 Tipo de datos:', typeof data);
            console.log('📄 Es array:', Array.isArray(data));
            console.log('📄 Longitud:', data.length);
            
            promociones = data;
            promocionesFiltradas = [...promociones];
            console.log('✅ Promociones cargadas:', promociones.length);
            
            renderPromociones();
        } else {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            
            // Si es error de autenticación, intentar recargar la página
            if (response.status === 401) {
                console.log('🔐 Error de autenticación, redirigiendo al login...');
                window.location.href = '/html/login.html';
                return;
            }
            
            throw new Error(`Error al cargar promociones: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Error al cargar promociones:', error);
        
        // Mostrar mensaje más específico
        if (error.message.includes('Failed to fetch')) {
            showMessage('Error de conexión con el servidor', 'error');
        } else if (error.message.includes('401')) {
            showMessage('Sesión expirada, por favor inicia sesión nuevamente', 'error');
        } else {
            showMessage('Error al cargar promociones existentes: ' + error.message, 'error');
        }
    }
}

// Función para buscar promociones
let searchPromocionesTimeout;
function buscarPromociones(query) {
    clearTimeout(searchPromocionesTimeout);
    
    searchPromocionesTimeout = setTimeout(() => {
        promocionesFiltradas = promociones.filter(promocion =>
            promocion.Descripcion?.toLowerCase().includes(query.toLowerCase()) ||
            promocion.Tipo?.toLowerCase().includes(query.toLowerCase()) ||
            promocion.Observaciones?.toLowerCase().includes(query.toLowerCase())
        );
        currentPagePromociones = 1;
        renderPromociones();
    }, 300);
}

// Función para renderizar promociones
function renderPromociones() {
    const hoy = new Date();
    // Filtrar solo promociones activas y vigentes
    const promocionesVigentes = promocionesFiltradas.filter(promocion => {
        const fechaFin = new Date(promocion.Fecha_Fin);
        return promocion.Activo == 1 && fechaFin >= hoy;
    });

    const startIndex = (currentPagePromociones - 1) * itemsPerPagePromociones;
    const endIndex = startIndex + itemsPerPagePromociones;
    const promocionesPaginadas = promocionesVigentes.slice(startIndex, endIndex);
    
    promocionesGrid.innerHTML = '';
    
    if (promocionesPaginadas.length === 0) {
        promocionesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--dark-gray);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No se encontraron promociones</p>
            </div>
        `;
        actualizarPaginacionPromociones();
        return;
    }
    
    promocionesPaginadas.forEach(promocion => {
        const card = document.createElement('div');
        card.className = 'promocion-card';
        
        const fechaInicio = new Date(promocion.Fecha_Inicio);
        const fechaFin = new Date(promocion.Fecha_Fin);
        const esActiva = hoy >= fechaInicio && hoy <= fechaFin && promocion.Activo == 1;
        
        // Mostrar productos asociados reales
        let productosList = 'Sin productos asociados';
        if (promocion.productos && promocion.productos.length > 0) {
            const nombresProductos = promocion.productos.map(p => p.Nombre || p.nombre || `Producto ${p.ID_Producto || p.id_producto}`).join(', ');
            productosList = nombresProductos;
        }
        
        // Determinar el valor a mostrar según el tipo
        let valorMostrar = 'N/A';
        if (promocion.Tipo === 'Porcentaje') {
            valorMostrar = promocion.Descuento_Porcentual ? `${promocion.Descuento_Porcentual}%` : 'N/A';
        } else if (promocion.Tipo === 'Promocional') {
            valorMostrar = promocion.Precio_Promocional ? `$${promocion.Precio_Promocional}` : 'N/A';
        } else if (promocion.Tipo === '2x1') {
            valorMostrar = '2x1';
        } else if (promocion.Tipo === '3x2') {
            valorMostrar = '3x2';
        } else {
            // Para otros tipos, intentar mostrar el valor disponible
            if (promocion.Descuento_Porcentual) {
                valorMostrar = `${promocion.Descuento_Porcentual}%`;
            } else if (promocion.Precio_Promocional) {
                valorMostrar = `$${promocion.Precio_Promocional}`;
            } else {
                valorMostrar = 'N/A';
            }
        }
        
        // Botón de activación - siempre mostrar como Activa
        const botonActivacion = `<span class="promocion-estado promocion-activa" onclick="togglePromocion(${promocion.ID_Promocion}, false)">Activa</span>`;
        
        // Botón de eliminar
        const botonEliminar = `<button class="btn-eliminar" onclick="eliminarPromocion(${promocion.ID_Promocion})">
            <i class="fas fa-trash"></i> Eliminar
        </button>`;
        
        card.innerHTML = `
            <div class="promocion-header">
                <div>
                    <div class="promocion-titulo">${promocion.Descripcion || 'Sin descripción'}</div>
                </div>
                <div class="promocion-actions">
                    ${botonActivacion}
                    ${botonEliminar}
                </div>
            </div>
            
            <div class="promocion-fechas">
                <i class="fas fa-calendar"></i>
                ${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}
            </div>
            
            <div class="promocion-detalles">
                <div class="promocion-detalle">
                    <span class="promocion-detalle-label">Tipo:</span>
                    <span class="promocion-detalle-valor">${promocion.Tipo || 'N/A'}</span>
                </div>
                <div class="promocion-detalle">
                    <span class="promocion-detalle-label">Valor:</span>
                    <span class="promocion-detalle-valor">${valorMostrar}</span>
                </div>
            </div>
            
            <div class="promocion-productos">
                <div class="promocion-productos-titulo">
                    <i class="fas fa-box"></i> Productos incluidos:
                </div>
                <div class="promocion-productos-lista">
                    <span class="promocion-producto-tag">${productosList}</span>
                </div>
            </div>
        `;
        
        promocionesGrid.appendChild(card);
    });
    
    actualizarPaginacionPromociones(promocionesVigentes.length);
}

// Función para actualizar paginación de promociones
function actualizarPaginacionPromociones() {
    const totalPages = Math.ceil(promocionesFiltradas.length / itemsPerPagePromociones);
    
    // Actualizar información de paginación
    const startIndex = (currentPagePromociones - 1) * itemsPerPagePromociones + 1;
    const endIndex = Math.min(currentPagePromociones * itemsPerPagePromociones, promocionesFiltradas.length);
    promocionesPaginationInfo.textContent = `Mostrando ${startIndex} a ${endIndex} de ${promocionesFiltradas.length} promociones`;
    
    // Actualizar botones de navegación
    promocionesPrevBtn.disabled = currentPagePromociones === 1;
    promocionesNextBtn.disabled = currentPagePromociones === totalPages;
    
    // Actualizar números de página
    promocionesPageNumbers.innerHTML = '';
    const maxPages = Math.min(totalPages, 5);
    const startPage = Math.max(1, currentPagePromociones - Math.floor(maxPages / 2));
    
    for (let i = startPage; i < startPage + maxPages && i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPagePromociones ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => irAPaginaPromociones(i);
        promocionesPageNumbers.appendChild(pageBtn);
    }
}

// Función para ir a una página específica de promociones
function irAPaginaPromociones(page) {
    const totalPages = Math.ceil(promocionesFiltradas.length / itemsPerPagePromociones);
    if (page >= 1 && page <= totalPages) {
        currentPagePromociones = page;
        renderPromociones();
    }
}

// Función para activar/desactivar promoción
async function togglePromocion(promocionId, activar) {
    try {
        console.log(`${activar ? 'Activando' : 'Desactivando'} promoción ${promocionId}...`);
        
        const response = await fetch(`/api/promociones/${promocionId}/toggle`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ activo: activar })
        });
        
        if (response.ok) {
            showMessage(`Promoción ${activar ? 'activada' : 'desactivada'} correctamente`, 'success');
            // Eliminar de la lista si se desactiva
            if (!activar) {
                promocionesFiltradas = promocionesFiltradas.filter(p => p.ID_Promocion !== promocionId);
            }
            await cargarPromociones();
        } else {
            const errorData = await response.json();
            showMessage(`Error al ${activar ? 'activar' : 'desactivar'} promoción: ${errorData.message}`, 'error');
        }
    } catch (error) {
        console.error('Error al cambiar estado de promoción:', error);
        showMessage('Error al cambiar estado de promoción', 'error');
    }
}

// Función para eliminar promoción del frontend y base de datos
async function eliminarPromocion(promocionId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
        try {
            console.log(`🗑️ Eliminando promoción ${promocionId} de la base de datos...`);
            
            const response = await fetch(`${API_PROMOCIONES}/${promocionId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('❌ Error response:', errorData);
                throw new Error(`Error al eliminar promoción: ${response.status} ${response.statusText}`);
            }
            
            const resultado = await response.json();
            console.log('✅ Resultado eliminación:', resultado);
            
            // Recargar promociones desde la base de datos
            await cargarPromociones();
            
            showMessage('Promoción eliminada correctamente', 'success');
        } catch (error) {
            console.error('❌ Error al eliminar promoción:', error);
            showMessage('Error al eliminar promoción: ' + error.message, 'error');
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando página de promociones...');
    
    // Cargar datos iniciales
    cargarProductos();
    cargarPromociones();
    
    // Event listener para búsqueda de productos
    searchInput.addEventListener('input', function() {
        buscarProductos(this.value);
    });
    
    // Event listener para búsqueda de promociones
    searchPromocionesInput.addEventListener('input', function() {
        buscarPromociones(this.value);
    });
    
    // Event listener para cambiar placeholder del valor según tipo
    const tipoSelect = document.getElementById('tipo');
    const valorInput = document.getElementById('valor');
    
    if (tipoSelect && valorInput) {
        tipoSelect.addEventListener('change', function() {
            const tipo = this.value;
            switch(tipo) {
                case 'Porcentaje':
                    valorInput.placeholder = 'Ej: 20 (porcentaje)';
                    break;
                case 'Promocional':
                    valorInput.placeholder = 'Ej: 15.50 (precio fijo)';
                    break;
                case '2x1':
                case '3x2':
                    valorInput.placeholder = 'No requiere valor';
                    valorInput.value = '';
                    valorInput.disabled = true;
                    break;
                default:
                    valorInput.placeholder = '% o precio';
                    valorInput.disabled = false;
            }
        });
    }
    
    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    fechaInicioInput.min = today;
    fechaFinInput.min = today;
    
    // Actualizar fecha mínima de fin cuando cambia fecha de inicio
    fechaInicioInput.addEventListener('change', function() {
        fechaFinInput.min = this.value;
    });
}); 