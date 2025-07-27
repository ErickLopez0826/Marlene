// Redirige al login si no hay token JWT
if (!localStorage.getItem('jwtToken')) {
    window.location.href = '/html/login.html';
}

const API_INVENTARIO = '/api/inventario';
const token = localStorage.getItem('jwtToken');

const form = document.getElementById('movimiento-form');
const errorMsg = document.getElementById('form-error');
const successMsg = document.getElementById('form-success');
const historialTbody = document.getElementById('historial-tbody');
const historialTable = document.getElementById('historial-table');
const filtroTipo = document.getElementById('filtro-tipo');

let historial = [];

function limpiarMensajes() {
    errorMsg.textContent = '';
    successMsg.textContent = '';
}

function renderHistorial() {
    historialTbody.innerHTML = '';
    let tipoFiltro = filtroTipo.value;
    let visibleRows = 0;
    historial.forEach(mov => {
        if (tipoFiltro && mov.Tipo_Movimiento !== tipoFiltro) return;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${mov.ID_Inventario}</td>
            <td>${mov.ID_Producto}</td>
            <td>${mov.Tipo_Movimiento}</td>
            <td>${Number(mov.Cantidad).toFixed(2)}</td>
            <td>${mov.Fecha_Movimiento ? mov.Fecha_Movimiento.split('T')[0] : ''}</td>
            <td>${mov.Observaciones || ''}</td>
            <td>${mov.ID_Usuario || ''}</td>
        `;
        historialTbody.appendChild(tr);
        visibleRows++;
    });
    // Animación suave
    setTimeout(() => {
        if (visibleRows > 0) {
            historialTable.classList.add('visible');
        } else {
            historialTable.classList.remove('visible');
        }
    }, 50);
}

async function cargarHistorial() {
    limpiarMensajes();
    try {
        const res = await fetch(API_INVENTARIO, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('No se pudo cargar el historial');
        historial = await res.json();
        renderHistorial();
    } catch (err) {
        errorMsg.textContent = err.message || 'Error al cargar historial';
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    limpiarMensajes();
    const data = {
        Tipo_Movimiento: form.tipo.value,
        ID_Producto: parseInt(form.producto_id.value),
        Cantidad: parseInt(form.cantidad.value),
        Observaciones: form.observaciones.value.trim()
    };
    try {
        const res = await fetch(API_INVENTARIO, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Error al registrar movimiento');
        }
        successMsg.textContent = 'Movimiento registrado correctamente';
        form.reset();
        cargarHistorial();
    } catch (err) {
        errorMsg.textContent = err.message || 'Error al registrar movimiento';
    }
});

filtroTipo.addEventListener('change', renderHistorial);

// Inicializa
cargarHistorial(); 