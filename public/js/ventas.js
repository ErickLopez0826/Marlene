// Redirige al login si no hay token JWT
if (!localStorage.getItem('jwtToken')) {
    window.location.href = '/html/login.html';
}

const API_PRODUCTOS = '/api/productos';
const API_VENTA = '/api/venta';
const token = localStorage.getItem('jwtToken');

const productosTbody = document.getElementById('productos-tbody');
const carritoTbody = document.getElementById('carrito-tbody');
const totalLabel = document.getElementById('total-label');
const ventaError = document.getElementById('venta-error');
const ventaSuccess = document.getElementById('venta-success');
const registrarVentaBtn = document.getElementById('registrar-venta-btn');
const formaPagoSelect = document.getElementById('forma_pago');

let productos = [];
let carrito = [];

function limpiarMensajes() {
    ventaError.textContent = '';
    ventaSuccess.textContent = '';
}

function renderProductos() {
    productosTbody.innerHTML = '';
    productos.forEach(prod => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prod.Nombre}</td>
            <td>${prod.Marca || ''}</td>
            <td>${prod.Presentacion || ''}</td>
            <td>$${Number(prod.Precio_Venta).toFixed(2)}</td>
            <td>${prod.Stock_Total || 0}</td>
            <td><input type="number" min="1" max="${prod.Stock_Total}" value="1" style="width:60px;" id="cantidad-${prod.ID_Producto}"></td>
            <td><button class="btn btn-add" onclick="agregarAlCarrito(${prod.ID_Producto})">Agregar</button></td>
        `;
        productosTbody.appendChild(tr);
    });
}

function renderCarrito() {
    carritoTbody.innerHTML = '';
    let total = 0;
    carrito.forEach(item => {
        const subtotal = Number(item.Precio_Venta) * item.cantidad;
        total += subtotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.Nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${Number(item.Precio_Venta).toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td><button class="btn btn-remove" onclick="quitarDelCarrito(${item.ID_Producto})">Quitar</button></td>
        `;
        carritoTbody.appendChild(tr);
    });
    totalLabel.textContent = `Total: $${total.toFixed(2)}`;
}

window.agregarAlCarrito = function(id) {
    limpiarMensajes();
    const prod = productos.find(p => p.ID_Producto === id);
    const cantidadInput = document.getElementById(`cantidad-${id}`);
    let cantidad = parseInt(cantidadInput.value);
    if (!cantidad || cantidad < 1) cantidad = 1;
    if (cantidad > prod.Stock_Total) {
        ventaError.textContent = 'No hay suficiente stock disponible.';
        return;
    }
    const existente = carrito.find(item => item.ID_Producto === id);
    if (existente) {
        if (existente.cantidad + cantidad > prod.Stock_Total) {
            ventaError.textContent = 'No hay suficiente stock disponible.';
            return;
        }
        existente.cantidad += cantidad;
    } else {
        carrito.push({ ...prod, cantidad });
    }
    renderCarrito();
};

window.quitarDelCarrito = function(id) {
    limpiarMensajes();
    carrito = carrito.filter(item => item.ID_Producto !== id);
    renderCarrito();
};

async function cargarProductos() {
    limpiarMensajes();
    try {
        const res = await fetch(API_PRODUCTOS, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('No se pudieron cargar los productos');
        productos = await res.json();
        renderProductos();
    } catch (err) {
        ventaError.textContent = err.message || 'Error al cargar productos';
    }
}

registrarVentaBtn.addEventListener('click', async function() {
    limpiarMensajes();
    if (carrito.length === 0) {
        ventaError.textContent = 'Agrega al menos un producto al carrito.';
        return;
    }
    // Prepara el body para la API
    const productosVenta = carrito.map(item => ({
        producto_id: item.ID_Producto,
        cantidad: item.cantidad
    }));
    const body = {
        productos: productosVenta,
        forma_pago: formaPagoSelect.value
    };
    try {
        const res = await fetch(API_VENTA, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Error al registrar la venta');
        }
        ventaSuccess.textContent = '¡Venta registrada correctamente!';
        carrito = [];
        renderCarrito();
        cargarProductos();
    } catch (err) {
        ventaError.textContent = err.message || 'Error al registrar la venta';
    }
});

// Inicializa
cargarProductos(); 