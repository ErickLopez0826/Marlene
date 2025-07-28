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

// Variables globales
const API_PRODUCTOS = '/api/productos';
const API_VENTA = '/api/venta';
const API_VENTAS_HISTORIAL = '/api/venta/historial';

let productos = [];
let productosFiltrados = [];
let carrito = [];
let currentPage = 1;
const itemsPerPage = 50;

// Variables globales para paginación
let paginaActual = 1;
let tipoPagoActual = 'todos';

// Elementos del DOM
const productosTbody = document.getElementById('productos-tbody');
const carritoItems = document.getElementById('carrito-items');
const searchInput = document.getElementById('search-input');
const productosCount = document.getElementById('productos-count');
const paginationInfo = document.getElementById('pagination-info');
const pageNumbers = document.getElementById('page-numbers');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const finalizarVentaBtn = document.getElementById('finalizar-venta-btn');
const formaPagoSelect = document.getElementById('forma_pago');
const historialModal = document.getElementById('historial-modal');
const historialContent = document.getElementById('historial-content');

// Función para obtener headers de autenticación
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    };
}

// Función para mostrar mensajes
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#e74c3c';
    } else {
        messageDiv.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Función para obtener clase de stock
function getStockClass(stock) {
    if (stock <= 10) return 'stock-bajo';
    if (stock <= 50) return 'stock-medio';
    return 'stock-alto';
}

// Función para obtener nombre del proveedor
function getProveedorNombre(idProveedor, nombreProveedor) {
    if (nombreProveedor) {
        return nombreProveedor;
    }
    return 'Sin proveedor';
}

// Función para renderizar productos
function renderProductos() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productosPaginados = productosFiltrados.slice(startIndex, endIndex);
    
    productosTbody.innerHTML = '';
    
    productosPaginados.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.Nombre}</td>
            <td>${producto.Marca || 'Sin marca'}</td>
            <td>${getProveedorNombre(producto.ID_Proveedor, producto.Nombre_Proveedor)}</td>
            <td>$${Number(producto.Precio_Venta).toFixed(2)}</td>
            <td class="${getStockClass(producto.Stock_Total)}">${producto.Stock_Total}</td>
            <td>
                <input type="number" min="1" max="${producto.Stock_Total}" value="1" 
                       class="cantidad-input" data-producto-id="${producto.ID_Producto}">
            </td>
            <td>
                <button class="btn-agregar" onclick="agregarAlCarrito(${producto.ID_Producto}, '${producto.Nombre}', ${producto.Precio_Venta})">
                    <i class="fas fa-plus"></i> Agregar
                </button>
            </td>
        `;
        productosTbody.appendChild(row);
    });
    
    actualizarPaginacion();
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

// Función para buscar productos con debouncing
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
        actualizarContador();
        
        // Feedback visual
        if (query.length > 0) {
            showMessage(`${productosFiltrados.length} productos encontrados`, 'info');
        }
    }, 300);
}

// Función para actualizar contador
function actualizarContador() {
    productosCount.textContent = `${productosFiltrados.length} productos encontrados`;
    
    // Animación en el contador
    productosCount.style.transform = 'scale(1.1)';
    setTimeout(() => {
        productosCount.style.transform = '';
    }, 200);
}

// Función para agregar al carrito
function agregarAlCarrito(productoId, nombre, precio) {
    const cantidadInput = document.querySelector(`input[data-producto-id="${productoId}"]`);
    const cantidad = parseInt(cantidadInput.value) || 1;
    
    const itemExistente = carrito.find(item => item.ID_Producto === productoId);
    
    if (itemExistente) {
        itemExistente.cantidad += cantidad;
        showMessage(`Cantidad actualizada: ${itemExistente.cantidad}`, 'info');
    } else {
        carrito.push({
            ID_Producto: productoId,
            nombre: nombre,
            precio: precio,
            cantidad: cantidad
        });
        showMessage('Producto agregado al carrito', 'success');
    }
    
    // Animación en el botón
    const btn = document.querySelector(`button[onclick*="${productoId}"]`);
    if (btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
    }
    
    renderCarrito();
}

// Función para quitar del carrito
function quitarDelCarrito(productoId) {
    const itemElement = document.querySelector(`[data-producto-id="${productoId}"]`);
    if (itemElement) {
        itemElement.classList.add('removing');
        setTimeout(() => {
            carrito = carrito.filter(item => item.ID_Producto !== productoId);
            renderCarrito();
            showMessage('Producto removido del carrito', 'info');
        }, 300);
    } else {
        carrito = carrito.filter(item => item.ID_Producto !== productoId);
        renderCarrito();
        showMessage('Producto removido del carrito', 'info');
    }
}

// Función para renderizar carrito
function renderCarrito() {
    if (carrito.length === 0) {
        carritoItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>No hay productos en el carrito</p>
                <p>Agrega productos para comenzar la venta</p>
            </div>
        `;
        subtotalElement.textContent = '$0.00';
        totalElement.textContent = '$0.00';
        finalizarVentaBtn.disabled = true;
        return;
    }
    
    carritoItems.innerHTML = '';
    
    carrito.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrito-item';
        itemDiv.setAttribute('data-producto-id', item.ID_Producto);
        itemDiv.innerHTML = `
            <div class="item-info">
                <h4>${item.nombre}</h4>
                <p class="item-price">$${Number(item.precio).toFixed(2)} c/u</p>
            </div>
            <div class="item-actions">
                <span class="item-quantity">Cantidad: ${item.cantidad}</span>
                <span class="item-total">$${(item.precio * item.cantidad).toFixed(2)}</span>
                <button class="btn-remove" onclick="quitarDelCarrito(${item.ID_Producto})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        carritoItems.appendChild(itemDiv);
    });
    
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    
    // Animación para el total
    totalElement.classList.add('updating');
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${subtotal.toFixed(2)}`;
    
    setTimeout(() => {
        totalElement.classList.remove('updating');
    }, 600);
    
    finalizarVentaBtn.disabled = false;
}

// Función para finalizar venta
async function finalizarVenta() {
    if (carrito.length === 0) {
        showMessage('Agrega al menos un producto al carrito', 'error');
        return;
    }
    
    const productosVenta = carrito.map(item => ({
        producto_id: item.ID_Producto,
        cantidad: item.cantidad
    }));
    
    const ventaData = {
        productos: productosVenta,
        forma_pago: formaPagoSelect.value
    };
    
    console.log('Enviando venta:', ventaData);
    
    try {
        // Deshabilitar botón y mostrar loading
        finalizarVentaBtn.disabled = true;
        const originalText = finalizarVentaBtn.innerHTML;
        finalizarVentaBtn.innerHTML = '<span class="loading"></span> Procesando...';
        
        const response = await fetch(API_VENTA, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(ventaData)
        });
        
        console.log('Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        
        const ventaResult = await response.json();
        console.log('Venta registrada:', ventaResult);
        
        // Animación de éxito
        finalizarVentaBtn.innerHTML = '<i class="fas fa-check"></i> ¡Venta Completada!';
        finalizarVentaBtn.style.background = '#27ae60';
        
        showMessage('¡Venta registrada correctamente!', 'success');
        
        // Limpiar carrito después de un breve delay
        setTimeout(() => {
        carrito = [];
        renderCarrito();
        cargarProductos();
            
            // Restaurar botón
            finalizarVentaBtn.disabled = false;
            finalizarVentaBtn.innerHTML = originalText;
            finalizarVentaBtn.style.background = '';
        }, 2000);
        
    } catch (error) {
        console.error('Error completo:', error);
        showMessage('Error al registrar la venta: ' + error.message, 'error');
        
        // Restaurar botón en caso de error
        finalizarVentaBtn.disabled = false;
        finalizarVentaBtn.innerHTML = '<i class="fas fa-check"></i> Finalizar Venta';
        finalizarVentaBtn.style.background = '';
    }
}

// Función para cargar productos
async function cargarProductos() {
    try {
        const response = await fetch(API_PRODUCTOS, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            productos = await response.json();
            productosFiltrados = [...productos];
            renderProductos();
            actualizarContador();
        } else {
            console.error('Error al cargar productos');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para abrir historial
function abrirHistorial() {
    historialModal.style.display = 'block';
    cargarHistorial();
}

// Función para cerrar historial
function cerrarHistorial() {
    historialModal.style.display = 'none';
}

// Función para cargar historial con filtro por tipo de pago y paginación
function cargarHistorial() {
    historialContent.innerHTML = '<p>Cargando historial...</p>';
    
    const url = new URL(API_VENTAS_HISTORIAL, window.location.origin);
    url.searchParams.set('tipoPago', tipoPagoActual);
    url.searchParams.set('pagina', paginaActual);
    url.searchParams.set('porPagina', 30);
    
    console.log('Cargando historial desde:', url.toString());
    
    fetch(url.toString(), {
        headers: getAuthHeaders()
    })
    .then(response => {
        console.log('Respuesta historial:', response.status, response.statusText);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Historial recibido:', data);
        
        const ventas = data.ventas;
        const paginacion = data.paginacion;
        
        if (ventas.length === 0) {
            historialContent.innerHTML = '<p>No hay ventas registradas</p>';
            return;
        }
        
        // Crear filtros
        const filterHtml = `
            <div class="historial-filters">
                <div class="filter-group">
                    <label for="tipo-pago-filter">Tipo de Pago:</label>
                    <select id="tipo-pago-filter">
                        <option value="todos" ${tipoPagoActual === 'todos' ? 'selected' : ''}>Todos</option>
                        <option value="Efectivo" ${tipoPagoActual === 'Efectivo' ? 'selected' : ''}>Efectivo</option>
                        <option value="Transferencia" ${tipoPagoActual === 'Transferencia' ? 'selected' : ''}>Transferencia</option>
                        <option value="Mixto" ${tipoPagoActual === 'Mixto' ? 'selected' : ''}>Mixto</option>
                    </select>
                </div>
            </div>
        `;
        
        const table = document.createElement('table');
        table.className = 'historial-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Forma de Pago</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${ventas.map(venta => `
                    <tr>
                        <td>${venta.ID_Venta}</td>
                        <td>${new Date(venta.Fecha_Venta).toLocaleDateString()}</td>
                        <td>${venta.Cantidad_Productos || 0} productos</td>
                        <td>$${Number(venta.Monto_Total || 0).toFixed(2)}</td>
                        <td>${venta.Forma_Pago}</td>
                        <td>
                            <button class="btn-ver-detalle" onclick="verDetalleVenta(${venta.ID_Venta})">
                                <i class="fas fa-eye"></i> Ver Detalle
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        // Crear paginación
        const paginacionHtml = crearPaginacion(paginacion);
        
        historialContent.innerHTML = filterHtml + table.outerHTML + paginacionHtml;
        
        // Agregar event listeners
        const tipoPagoFilter = document.getElementById('tipo-pago-filter');
        
        if (tipoPagoFilter) {
            tipoPagoFilter.addEventListener('change', function() {
                tipoPagoActual = this.value;
                paginaActual = 1; // Reset a primera página
                cargarHistorial();
            });
        }
        
    })
    .catch(error => {
        console.error('Error al cargar historial:', error);
        historialContent.innerHTML = `<p>Error al cargar historial: ${error.message}</p>`;
    });
}

// Función para crear la paginación
function crearPaginacion(paginacion) {
    const { paginaActual, totalPaginas, totalRegistros } = paginacion;
    
    if (totalPaginas <= 1) {
        return `<div class="paginacion-info">Mostrando ${totalRegistros} registros</div>`;
    }
    
    let paginacionHtml = '<div class="paginacion">';
    
    // Botón anterior
    if (paginaActual > 1) {
        paginacionHtml += `<button class="btn-pagina" onclick="cambiarPagina(${paginaActual - 1})">
            <i class="fas fa-chevron-left"></i> Anterior
        </button>`;
    }
    
    // Números de página
    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(totalPaginas, paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
        const clase = i === paginaActual ? 'btn-pagina activa' : 'btn-pagina';
        paginacionHtml += `<button class="${clase}" onclick="cambiarPagina(${i})">${i}</button>`;
    }
    
    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginacionHtml += `<button class="btn-pagina" onclick="cambiarPagina(${paginaActual + 1})">
            Siguiente <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    paginacionHtml += '</div>';
    paginacionHtml += `<div class="paginacion-info">Página ${paginaActual} de ${totalPaginas} (${totalRegistros} registros)</div>`;
    
    return paginacionHtml;
}

// Función para cambiar página
function cambiarPagina(pagina) {
    paginaActual = pagina;
    cargarHistorial();
}

// Función para ver detalle de venta
async function verDetalleVenta(ventaId) {
    console.log('Solicitando detalle de venta:', ventaId);
    
    try {
        const response = await fetch(`/api/venta/${ventaId}/detalle`, {
            headers: getAuthHeaders()
        });
        
        console.log('Respuesta detalle:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const detalle = await response.json();
        console.log('Detalle recibido:', detalle);
        
        // Crear modal de detalle mejorado
        const detalleModal = document.createElement('div');
        detalleModal.className = 'modal detalle-modal';
        detalleModal.innerHTML = `
            <div class="modal-content detalle-content">
                <div class="modal-header">
                    <h2><i class="fas fa-receipt"></i> Detalle de Venta #${detalle.ID_Venta}</h2>
                    <span class="close" onclick="cerrarDetalleModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="venta-info">
                        <div class="info-row">
                            <div class="info-item">
                                <i class="fas fa-calendar"></i>
                                <strong>Fecha:</strong> ${new Date(detalle.Fecha_Venta).toLocaleString('es-ES')}
                            </div>
                            <div class="info-item">
                                <i class="fas fa-dollar-sign"></i>
                                <strong>Total:</strong> $${Number(detalle.Monto_Total).toFixed(2)}
                            </div>
                            <div class="info-item">
                                <i class="fas fa-credit-card"></i>
                                <strong>Forma de Pago:</strong> ${detalle.Forma_Pago}
                            </div>
                        </div>
                    </div>
                    
                    <div class="productos-detalle">
                        <h3><i class="fas fa-shopping-bag"></i> Productos Vendidos:</h3>
                        ${detalle.detalle && detalle.detalle.length > 0 ? `
                            <div class="detalle-table-container">
                                <table class="detalle-table">
                                    <thead>
                                        <tr>
                                            <th><i class="fas fa-box"></i> Producto</th>
                                            <th><i class="fas fa-hashtag"></i> Cantidad</th>
                                            <th><i class="fas fa-tag"></i> Precio Unitario</th>
                                            <th><i class="fas fa-calculator"></i> Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${detalle.detalle.map((item, index) => `
                                            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                                                <td>
                                                    <div class="producto-info">
                                                        <span class="producto-nombre">${item.Nombre_Producto || 'Producto'}</span>
                                                        ${item.Marca ? `<span class="producto-marca">${item.Marca}</span>` : ''}
                                                    </div>
                                                </td>
                                                <td class="cantidad">${item.Cantidad}</td>
                                                <td class="precio">$${Number(item.Precio_Unitario).toFixed(2)}</td>
                                                <td class="subtotal">$${Number(item.Subtotal).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr class="total-row">
                                            <td colspan="3"><strong>Total de la Venta:</strong></td>
                                            <td class="total-amount"><strong>$${Number(detalle.Monto_Total).toFixed(2)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <div class="resumen-detalle">
                                <div class="resumen-item">
                                    <i class="fas fa-boxes"></i>
                                    <span><strong>Total de Productos:</strong> ${detalle.detalle.reduce((sum, item) => sum + Number(item.Cantidad), 0)}</span>
                                </div>
                                <div class="resumen-item">
                                    <i class="fas fa-list"></i>
                                    <span><strong>Tipos de Productos:</strong> ${detalle.detalle.length}</span>
                                </div>
                            </div>
                        ` : `
                            <div class="no-detalle">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p>No hay detalles disponibles para esta venta</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(detalleModal);
        
        // Agregar event listener para cerrar con ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                cerrarDetalleModal();
            }
        });
        
        // Agregar event listener para cerrar al hacer clic fuera del modal
        detalleModal.addEventListener('click', function(e) {
            if (e.target === detalleModal) {
                cerrarDetalleModal();
            }
        });
        
    } catch (error) {
        console.error('Error al obtener detalle:', error);
        showMessage('Error al obtener el detalle de la venta: ' + error.message, 'error');
    }
}

// Función para cerrar modal de detalle
function cerrarDetalleModal() {
    const modal = document.querySelector('.detalle-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
cargarProductos(); 
    
    // Event listener para búsqueda
    searchInput.addEventListener('input', function() {
        buscarProductos(this.value);
    });
    
    // Event listener para finalizar venta
    finalizarVentaBtn.addEventListener('click', finalizarVenta);
    
    // Event listener para cerrar modal
    window.addEventListener('click', function(event) {
        if (event.target === historialModal) {
            cerrarHistorial();
        }
    });
    
    // Event listener para cantidad inputs
    document.addEventListener('change', function(event) {
        if (event.target.classList.contains('cantidad-input')) {
            const cantidad = parseInt(event.target.value);
            const max = parseInt(event.target.getAttribute('max'));
            if (cantidad > max) {
                event.target.value = max;
            } else if (cantidad < 1) {
                event.target.value = 1;
            }
        }
    });
});

// Agregar estilos CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 