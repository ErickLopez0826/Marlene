// Redirige al login si no hay token JWT
if (!localStorage.getItem('jwtToken')) {
    window.location.href = '/html/login.html';
}

const API_PROMOS = '/api/promociones';
const API_PRODUCTOS = '/api/productos';
const token = localStorage.getItem('jwtToken');

const toggleFormBtn = document.getElementById('toggle-form-btn');
const formSection = document.getElementById('form-section');
const promoForm = document.getElementById('promo-form');
const productosList = document.getElementById('productos-list');
const errorMsg = document.getElementById('form-error');
const successMsg = document.getElementById('form-success');
const promoCards = document.getElementById('promo-cards');

const consultaPromoForm = document.getElementById('consulta-promo-form');
const consultaPromoId = document.getElementById('consulta-promo-id');
const consultaPromoError = document.getElementById('consulta-promo-error');

let productos = [];

function limpiarMensajes() {
    errorMsg.textContent = '';
    errorMsg.classList.remove('visible');
    successMsg.textContent = '';
    successMsg.classList.remove('visible');
}

function renderProductosForm() {
    productosList.innerHTML = '';
    productos.forEach(prod => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.innerHTML = `
            <input type="checkbox" id="prod-${prod.ID_Producto}" name="productos" value="${prod.ID_Producto}" style="margin-right:8px;">
            <label for="prod-${prod.ID_Producto}" style="flex:1;">${prod.Nombre} (${prod.Marca || ''})</label>
            <input type="number" min="1" max="${prod.Stock_Total}" value="1" id="cant-${prod.ID_Producto}" style="width:60px; margin-left:8px;" disabled>
        `;
        productosList.appendChild(row);
        // Habilita/deshabilita input cantidad
        row.querySelector(`#prod-${prod.ID_Producto}`).addEventListener('change', function(e) {
            row.querySelector(`#cant-${prod.ID_Producto}`).disabled = !e.target.checked;
        });
    });
}

function renderPromos(promos) {
    promoCards.innerHTML = '';
    promos.forEach(promo => {
        const card = document.createElement('div');
        card.className = 'promo-card';
        card.innerHTML = `
            <div class="promo-card-title">${promo.Descripcion || '(Sin descripción)'}</div>
            <div class="promo-card-dates">${promo.Fecha_Inicio?.split('T')[0] || ''} - ${promo.Fecha_Fin?.split('T')[0] || ''}</div>
            <div class="promo-card-products"><b>Productos:</b><ul style="margin:0 0 0 18px; padding:0;">$${Array.isArray(promo.productos) && promo.productos.length > 0 ? promo.productos.map(p => `<li>${p.Nombre || 'ID ' + p.ID_Producto} x${p.Cantidad || 1}</li>`).join('') : '<li>Ninguno</li>'}</ul></div>
            <div><b>Tipo:</b> ${promo.Tipo || ''}</div>
            <div><b>Descuento:</b> ${promo.Descuento_Porcentual || 0}%</div>
            <div><b>Precio Promocional:</b> $${promo.Precio_Promocional !== null && promo.Precio_Promocional !== undefined ? Number(promo.Precio_Promocional).toFixed(2) : '-'}</div>
        `;
        promoCards.appendChild(card);
    });
}

async function cargarPromos() {
    try {
        const res = await fetch(API_PROMOS, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('No se pudieron cargar las promociones');
        const promos = await res.json();
        renderPromos(promos);
    } catch (err) {
        promoCards.innerHTML = '<div style="color:#e74c3c;">Error al cargar promociones</div>';
    }
}

async function cargarProductos() {
    try {
        const res = await fetch(API_PRODUCTOS, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('No se pudieron cargar los productos');
        productos = await res.json();
        renderProductosForm();
    } catch (err) {
        productosList.innerHTML = '<div style="color:#e74c3c;">Error al cargar productos</div>';
    }
}

toggleFormBtn.addEventListener('click', function() {
    formSection.classList.toggle('hide');
    limpiarMensajes();
    if (!formSection.classList.contains('hide')) {
        cargarProductos();
    }
});

promoForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    limpiarMensajes();
    // Recolecta productos seleccionados
    const productosSeleccionados = [];
    productos.forEach(prod => {
        const check = document.getElementById(`prod-${prod.ID_Producto}`);
        const cant = document.getElementById(`cant-${prod.ID_Producto}`);
        if (check.checked) {
            productosSeleccionados.push({
                ID_Producto: prod.ID_Producto,
                Cantidad: parseInt(cant.value) || 1
            });
        }
    });
    if (productosSeleccionados.length === 0) {
        errorMsg.textContent = 'Selecciona al menos un producto.';
        errorMsg.classList.add('visible');
        return;
    }
    const data = {
        Descripcion: promoForm.descripcion.value.trim(),
        Fecha_Inicio: promoForm.fecha_inicio.value,
        Fecha_Fin: promoForm.fecha_fin.value,
        Tipo: promoForm.tipo.value.trim(),
        Descuento_Porcentual: promoForm.descuento.value ? parseFloat(promoForm.descuento.value) : null,
        Precio_Promocional: promoForm.precio_promocional.value ? parseFloat(promoForm.precio_promocional.value) : null,
        productos: productosSeleccionados
    };
    try {
        const res = await fetch(API_PROMOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Error al registrar promoción');
        }
        successMsg.textContent = '¡Promoción registrada correctamente!';
        successMsg.classList.add('visible');
        promoForm.reset();
        setTimeout(() => {
            formSection.classList.add('hide');
            successMsg.classList.remove('visible');
        }, 1200);
        cargarPromos();
    } catch (err) {
        errorMsg.textContent = err.message || 'Error al registrar promoción';
        errorMsg.classList.add('visible');
    }
});

if (consultaPromoForm) {
    consultaPromoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        consultaPromoError.textContent = '';
        const id = consultaPromoId.value;
        if (!id) {
            consultaPromoError.textContent = 'Ingresa un ID válido.';
            return;
        }
        try {
            const res = await fetch(`/api/promociones/${id}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) {
                promoCards.innerHTML = '';
                consultaPromoError.textContent = 'No se encontró promoción con ese ID.';
                return;
            }
            const promo = await res.json();
            renderPromos([promo]);
        } catch (err) {
            consultaPromoError.textContent = 'Error al consultar promoción.';
        }
    });
}

// Inicializa
cargarPromos(); 