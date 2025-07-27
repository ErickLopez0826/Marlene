// Redirige al login si no hay token JWT
if (!localStorage.getItem('jwtToken')) {
    window.location.href = '/html/login.html';
}

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.addEventListener('pageshow', function() {
    setTimeout(() => window.scrollTo(0, 0), 10);
});

const API_URL = '/api/productos';
const token = localStorage.getItem('jwtToken');
const tableBody = document.getElementById('productos-tbody');
const form = document.getElementById('producto-form');
const errorMsg = document.getElementById('form-error');
const successMsg = document.getElementById('form-success');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const logoutBtn = document.getElementById('logout-btn');
const logoutMsg = document.getElementById('logout-message');

let editId = null;

function limpiarMensajes() {
    errorMsg.textContent = '';
    successMsg.textContent = '';
}

function limpiarFormulario() {
    form.reset();
    editId = null;
    submitBtn.textContent = 'Agregar Producto';
    cancelBtn.style.display = 'none';
}

function renderProductos(productos) {
    tableBody.innerHTML = '';
    productos.forEach(prod => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prod.ID_Producto}</td>
            <td>${prod.Nombre}</td>
            <td>${prod.Marca || ''}</td>
            <td>${prod.Presentacion || ''}</td>
            <td>$${Number(prod.Precio_Venta).toFixed(2)}</td>
            <td>${prod.Stock_Total || 0}</td>
            <td>
                <button class="btn btn-edit" onclick="editarProducto(${prod.ID_Producto})">Editar</button>
                <button class="btn btn-delete" onclick="eliminarProducto(${prod.ID_Producto})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

async function cargarProductos() {
    limpiarMensajes();
    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('No se pudieron cargar los productos');
        const productos = await res.json();
        renderProductos(productos);
    } catch (err) {
        errorMsg.textContent = err.message || 'Error al cargar productos';
    }
}

window.editarProducto = async function(id) {
    limpiarMensajes();
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('No se pudo obtener el producto');
        const prod = await res.json();
        form.nombre.value = prod.Nombre;
        form.marca.value = prod.Marca || '';
        form.presentacion.value = prod.Presentacion || '';
        form.precio_venta.value = prod.Precio_Venta || '';
        form.precio_compra.value = prod.Precio_Compra || '';
        form.stock_total.value = prod.Stock_Total || '';
        form.fecha_caducidad.value = prod.Fecha_Caducidad ? prod.Fecha_Caducidad.split('T')[0] : '';
        form.id_proveedor.value = prod.ID_Proveedor || '';
        editId = id;
        submitBtn.textContent = 'Actualizar Producto';
        cancelBtn.style.display = 'inline-block';
    } catch (err) {
        errorMsg.textContent = err.message || 'Error al editar producto';
    }
};

window.eliminarProducto = async function(id) {
    limpiarMensajes();
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('No se pudo eliminar el producto');
        successMsg.textContent = 'Producto eliminado correctamente';
        cargarProductos();
    } catch (err) {
        errorMsg.textContent = err.message || 'Error al eliminar producto';
    }
};

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    limpiarMensajes();
    const data = {
        Nombre: form.nombre.value.trim(),
        Marca: form.marca.value.trim(),
        Presentacion: form.presentacion.value.trim(),
        Precio_Venta: parseFloat(form.precio_venta.value),
        Precio_Compra: form.precio_compra.value ? parseFloat(form.precio_compra.value) : null,
        Stock_Total: parseInt(form.stock_total.value),
        Fecha_Caducidad: form.fecha_caducidad.value || null,
        ID_Proveedor: form.id_proveedor.value ? parseInt(form.id_proveedor.value) : null
    };
    try {
        let res;
        if (editId) {
            res = await fetch(`${API_URL}/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });
        }
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Error en la operación');
        }
        successMsg.textContent = editId ? 'Producto actualizado correctamente' : 'Producto agregado correctamente';
        limpiarFormulario();
        cargarProductos();
    } catch (err) {
        errorMsg.textContent = err.message || 'Error al guardar producto';
    }
});

cancelBtn.addEventListener('click', function() {
    limpiarFormulario();
    limpiarMensajes();
});

if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('jwtToken');
        if (logoutMsg) {
            logoutMsg.style.display = 'block';
            logoutMsg.classList.add('visible');
            setTimeout(() => {
                logoutMsg.classList.remove('visible');
                logoutMsg.style.display = 'none';
                window.location.href = '/html/login.html';
            }, 1000);
        } else {
            window.location.href = '/html/login.html';
        }
    });
}

// Inicializa
window.scrollTo(0, 0);
cargarProductos(); 