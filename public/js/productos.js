// Variables globales
let productos = [];
let productosFiltrados = [];
let proveedores = [];
let currentPage = 1;
const itemsPerPage = 50;
let editingProductId = null;

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

// Función para obtener el token
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    };
}

// Función para mostrar mensajes
function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    
    if (isError) {
        element.className = 'error-message';
    } else {
        element.className = 'success-message';
    }
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Función para cargar productos
async function cargarProductos() {
    try {
        const response = await fetch('/api/productos', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            productos = await response.json();
            productosFiltrados = [...productos];
            actualizarTabla();
            actualizarContador();
        } else {
            console.error('Error al cargar productos');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para cargar proveedores
async function cargarProveedores() {
    try {
        const response = await fetch('/api/proveedores', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            proveedores = await response.json();
            actualizarSelectProveedores();
        } else {
            console.error('Error al cargar proveedores');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para actualizar el select de proveedores
function actualizarSelectProveedores() {
    const select = document.getElementById('id_proveedor');
    select.innerHTML = '<option value="">Seleccionar proveedor</option>';
    
    proveedores.forEach(proveedor => {
        const option = document.createElement('option');
        option.value = proveedor.ID_Proveedor;
        option.textContent = proveedor.Nombre;
        select.appendChild(option);
    });
}

// Función para obtener nombre del proveedor
function getProveedorNombre(idProveedor, nombreProveedor) {
    if (nombreProveedor) {
        return nombreProveedor;
    }
    const proveedor = proveedores.find(p => p.ID_Proveedor == idProveedor);
    return proveedor ? proveedor.Nombre : 'Sin proveedor';
}

// Función para actualizar la tabla
function actualizarTabla() {
    const tbody = document.getElementById('productos-tbody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productosPaginados = productosFiltrados.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    productosPaginados.forEach(producto => {
        const row = document.createElement('tr');
        
        // Determinar clase de stock
        let stockClass = 'stock-alto';
        if (producto.Stock_Total <= 10) {
            stockClass = 'stock-bajo';
        } else if (producto.Stock_Total <= 30) {
            stockClass = 'stock-medio';
        }
        
        row.innerHTML = `
            <td>${producto.ID_Producto}</td>
            <td class="producto-nombre">${producto.Nombre || ''}</td>
            <td>${producto.Marca || ''}</td>
            <td>${getProveedorNombre(producto.ID_Proveedor, producto.Nombre_Proveedor)}</td>
            <td class="producto-precio">$$${parseFloat(producto.Precio_Venta || 0).toFixed(2)}</td>
            <td class="producto-stock ${stockClass}">${producto.Stock_Total || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editarProducto(${producto.ID_Producto})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarProducto(${producto.ID_Producto})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    actualizarPaginacion();
}

// Función para actualizar contador
function actualizarContador() {
    const countElement = document.getElementById('productos-count');
    countElement.textContent = productosFiltrados.length;
}

// Función para actualizar paginación
function actualizarPaginacion() {
    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, productosFiltrados.length);
    
    document.getElementById('pagination-start').textContent = startItem;
    document.getElementById('pagination-end').textContent = endItem;
    document.getElementById('pagination-total').textContent = productosFiltrados.length;
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // Generar números de página
    pageNumbers.innerHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => irAPagina(i);
        pageNumbers.appendChild(pageBtn);
    }
}

// Función para ir a una página específica
function irAPagina(page) {
    currentPage = page;
    actualizarTabla();
}

// Función para búsqueda
function buscarProductos(query) {
    productosFiltrados = productos.filter(producto => 
        producto.Nombre && producto.Nombre.toLowerCase().includes(query.toLowerCase())
    );
    currentPage = 1;
    actualizarTabla();
    actualizarContador();
}

// Función para enviar formulario
async function submitForm(event) {
    event.preventDefault();
    
    // Validar formulario antes de enviar
    if (!validarFormulario()) {
        return;
    }
    
    const formData = new FormData(event.target);
    const producto = {
        Nombre: formData.get('nombre'),
        Marca: formData.get('marca'),
        Presentacion: formData.get('presentacion'),
        Precio_Venta: parseFloat(formData.get('precio_venta')),
        Precio_Compra: parseFloat(formData.get('precio_compra')),
        Stock_Total: parseInt(formData.get('stock_total')),
        Fecha_Caducidad: formData.get('fecha_caducidad'),
        ID_Proveedor: parseInt(formData.get('id_proveedor'))
    };
    
    try {
        const url = editingProductId ? `/api/productos/${editingProductId}` : '/api/productos';
        const method = editingProductId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(producto)
        });
        
        if (response.ok) {
            const message = editingProductId ? 'Producto actualizado exitosamente' : 'Producto agregado exitosamente';
            showMessage('form-success', message, false);
            event.target.reset();
            resetForm();
            await cargarProductos();
        } else {
            const error = await response.json();
            showMessage('form-error', error.message || 'Error al procesar el producto', true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('form-error', 'Error de conexión', true);
    }
}

// Función para editar producto
async function editarProducto(id) {
    try {
        const response = await fetch(`/api/productos/${id}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const producto = await response.json();
            llenarFormulario(producto);
            editingProductId = id;
            
            const submitBtn = document.getElementById('submit-btn');
            const cancelBtn = document.getElementById('cancel-btn');
            
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
            cancelBtn.style.display = 'block';
            
            // Scroll al formulario en móviles
            if (window.innerWidth <= 992) {
                document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para llenar formulario
function llenarFormulario(producto) {
    document.getElementById('nombre').value = producto.Nombre || '';
    document.getElementById('marca').value = producto.Marca || '';
    document.getElementById('presentacion').value = producto.Presentacion || '';
    document.getElementById('precio_venta').value = producto.Precio_Venta || '';
    document.getElementById('precio_compra').value = producto.Precio_Compra || '';
    document.getElementById('stock_total').value = producto.Stock_Total || '';
    document.getElementById('fecha_caducidad').value = producto.Fecha_Caducidad || '';
    document.getElementById('id_proveedor').value = producto.ID_Proveedor || '';
}

// Función para resetear formulario
function resetForm() {
    editingProductId = null;
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar Producto';
    cancelBtn.style.display = 'none';
}

// Función para eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/productos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showMessage('form-success', 'Producto eliminado exitosamente', false);
            await cargarProductos();
        } else {
            const error = await response.json();
            showMessage('form-error', error.message || 'Error al eliminar el producto', true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('form-error', 'Error de conexión', true);
    }
}

// Función para validar campos numéricos
function validarCampoNumerico(input) {
    const valor = parseFloat(input.value);
    if (valor < 0) {
        input.value = 0;
        showMessage('No se permiten valores negativos', 'error');
    }
}

// Función para validar formulario completo
function validarFormulario() {
    const precioVenta = parseFloat(document.getElementById('precio_venta').value) || 0;
    const precioCompra = parseFloat(document.getElementById('precio_compra').value) || 0;
    const stockTotal = parseInt(document.getElementById('stock_total').value) || 0;
    const proveedor = document.getElementById('id_proveedor').value;
    
    if (precioVenta < 0 || precioCompra < 0 || stockTotal < 0) {
        showMessage('No se permiten valores negativos', 'error');
        return false;
    }
    
    if (!proveedor) {
        showMessage('Debe seleccionar un proveedor', 'error');
        return false;
    }
    
    return true;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    cargarProveedores(); // Cargar proveedores al cargar la página
    
    // Event listeners para validación en tiempo real
    document.getElementById('precio_venta').addEventListener('input', function() {
        validarCampoNumerico(this);
    });
    
    document.getElementById('precio_compra').addEventListener('input', function() {
        validarCampoNumerico(this);
    });
    
    document.getElementById('stock_total').addEventListener('input', function() {
        validarCampoNumerico(this);
    });
    
    // Formulario
    document.getElementById('producto-form').addEventListener('submit', submitForm);
    
    // Botón cancelar
    document.getElementById('cancel-btn').addEventListener('click', function() {
        document.getElementById('producto-form').reset();
        resetForm();
    });
    
    // Búsqueda
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            buscarProductos(this.value);
        }, 300);
    });
    
    // Paginación
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            irAPagina(currentPage - 1);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', function() {
        const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
        if (currentPage < totalPages) {
            irAPagina(currentPage + 1);
        }
    });
 }); 