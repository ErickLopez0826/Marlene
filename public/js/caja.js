// Redirige al login si no hay token JWT
if (!localStorage.getItem('jwtToken')) {
    window.location.href = '/html/login.html';
}

const API_CAJA = '/api/caja';
const token = localStorage.getItem('jwtToken');

const corteForm = document.getElementById('corte-form');
const consultaForm = document.getElementById('consulta-form');
const errorMsg = document.getElementById('form-error');
const successMsg = document.getElementById('form-success');
const panelCorte = document.getElementById('panel-corte');

function limpiarMensajes() {
    errorMsg.textContent = '';
    successMsg.textContent = '';
}

function mostrarPanelCorte(corte) {
    if (!corte) {
        panelCorte.innerHTML = '<div class="panel-row">No se encontró corte para esa fecha.</div>';
        panelCorte.classList.add('visible');
        return;
    }
    panelCorte.innerHTML = `
        <h3>Corte de Caja</h3>
        <div class="panel-row"><span class="panel-label">Fecha:</span> ${corte.Fecha_Corte ? corte.Fecha_Corte.split('T')[0] : ''}</div>
        <div class="panel-row"><span class="panel-label">Total Efectivo:</span> $${Number(corte.Total_Efectivo).toFixed(2)}</div>
        <div class="panel-row"><span class="panel-label">Total Transferencia:</span> $${Number(corte.Total_Transferencia).toFixed(2)}</div>
        <div class="panel-row"><span class="panel-label">Total Caja:</span> $${Number(corte.Total_Caja).toFixed(2)}</div>
        <div class="panel-row"><span class="panel-label">Responsable:</span> ${corte.Responsable || ''}</div>
        <div class="panel-row panel-obs"><span class="panel-label">Observaciones:</span> ${corte.Observaciones || ''}</div>
    `;
    setTimeout(() => panelCorte.classList.add('visible'), 50);
}

corteForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    limpiarMensajes();
    panelCorte.classList.remove('visible');
    const data = {
        Fecha_Corte: corteForm.fecha_corte.value,
        Total_Efectivo: parseFloat(corteForm.total_efectivo.value),
        Total_Transferencia: parseFloat(corteForm.total_transferencia.value),
        Total_Caja: parseFloat(corteForm.total_caja.value),
        Responsable: corteForm.responsable.value.trim(),
        Observaciones: corteForm.observaciones.value.trim()
    };
    // Validación visual
    if (!data.Fecha_Corte || isNaN(data.Total_Efectivo) || isNaN(data.Total_Transferencia) || isNaN(data.Total_Caja) || !data.Responsable) {
        errorMsg.textContent = 'Todos los campos obligatorios deben estar completos.';
        return;
    }
    try {
        const res = await fetch(API_CAJA, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Error al registrar corte');
        }
        successMsg.textContent = 'Corte registrado correctamente';
        corteForm.reset();
    } catch (err) {
        errorMsg.textContent = err.message || 'Error al registrar corte';
    }
});

consultaForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    limpiarMensajes();
    panelCorte.classList.remove('visible');
    const id = consultaForm['consulta-id'].value;
    if (!id) {
        errorMsg.textContent = 'Ingresa un ID de corte para consultar.';
        return;
    }
    try {
        const res = await fetch(`${API_CAJA}/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) {
            mostrarPanelCorte(null);
            return;
        }
        const corte = await res.json();
        mostrarPanelCorte(corte);
    } catch (err) {
        errorMsg.textContent = err.message || 'Error al consultar corte';
    }
}); 