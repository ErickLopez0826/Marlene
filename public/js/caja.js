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

const API_CAJA = '/api/caja';

// Elementos del DOM
const corteForm = document.getElementById('corte-form');
const cortesGrid = document.getElementById('cortes-grid');
const searchInput = document.getElementById('search-cortes');
const messageContainer = document.getElementById('message-container');
const nuevoCorteBtn = document.getElementById('nuevo-corte-btn');
const formSection = document.querySelector('.form-section');

// Variables globales
let cortes = [];
let cortesFiltrados = [];

// Función para obtener headers de autenticación
function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Función para mostrar mensajes
function showMessage(message, type = 'info') {
    messageContainer.innerHTML = `
        <div class="message ${type}">
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 5000);
}

// Función para formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Función para calcular total automáticamente
function calcularTotal() {
    const efectivo = parseFloat(document.getElementById('total_efectivo').value) || 0;
    const transferencia = parseFloat(document.getElementById('total_transferencia').value) || 0;
    const total = efectivo + transferencia;
    
    document.getElementById('total_caja').value = total.toFixed(2);
}

// Función para cargar cortes
async function cargarCortes() {
    try {
        console.log('🔍 Cargando cortes de caja...');
        
        const response = await fetch(API_CAJA, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error al cargar cortes: ${response.status}`);
        }
        
        const data = await response.json();
        cortes = data;
        cortesFiltrados = [...cortes];
        
        console.log(`✅ Cortes cargados: ${cortes.length}`);
        renderCortes();
        
    } catch (error) {
        console.error('❌ Error al cargar cortes:', error);
        showMessage('Error al cargar cortes de caja', 'error');
    }
}

// Función para renderizar cortes
function renderCortes() {
    if (cortesFiltrados.length === 0) {
        cortesGrid.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--dark-gray);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No se encontraron cortes de caja</p>
            </div>
        `;
        return;
    }
    
    cortesGrid.innerHTML = '';
    
    cortesFiltrados.forEach(corte => {
        const card = document.createElement('div');
        card.className = 'corte-card fade-in-up';
        
        const fecha = formatDate(corte.Fecha_Corte);
        const efectivo = formatCurrency(corte.Total_Efectivo);
        const transferencia = formatCurrency(corte.Total_Transferencia);
        const total = formatCurrency(corte.Total_Caja);
        
        card.innerHTML = `
            <div class="corte-header">
                <div>
                    <div class="corte-fecha">${fecha}</div>
                    <div class="corte-responsable">
                        <i class="fas fa-user"></i>
                        ${corte.Responsable || 'Sin responsable'}
                    </div>
                </div>
            </div>
            
            <div class="corte-totales">
                <div class="corte-total">
                    <div class="corte-total-label">Efectivo</div>
                    <div class="corte-total-valor efectivo">${efectivo}</div>
                </div>
                <div class="corte-total">
                    <div class="corte-total-label">Transferencia</div>
                    <div class="corte-total-valor transferencia">${transferencia}</div>
                </div>
                <div class="corte-total">
                    <div class="corte-total-label">Total</div>
                    <div class="corte-total-valor total">${total}</div>
                </div>
            </div>
            
            ${corte.Observaciones ? `
                <div class="corte-observaciones">
                    <i class="fas fa-comment"></i>
                    ${corte.Observaciones}
                </div>
            ` : ''}
        `;
        
        cortesGrid.appendChild(card);
    });
}

// Función para buscar cortes
let searchTimeout;
function buscarCortes(query) {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        if (!query.trim()) {
            cortesFiltrados = [...cortes];
        } else {
            const searchTerm = query.toLowerCase();
            cortesFiltrados = cortes.filter(corte => {
                const fecha = formatDate(corte.Fecha_Corte).toLowerCase();
                const responsable = (corte.Responsable || '').toLowerCase();
                const observaciones = (corte.Observaciones || '').toLowerCase();
                
                return fecha.includes(searchTerm) || 
                       responsable.includes(searchTerm) || 
                       observaciones.includes(searchTerm);
            });
        }
        
        renderCortes();
    }, 300);
}

// Función para guardar corte
async function guardarCorte(event) {
    event.preventDefault();
    
    const guardarBtn = document.getElementById('guardar-corte-btn');
    const originalText = guardarBtn.innerHTML;
    
    try {
        // Validar formulario
        const fecha = document.getElementById('fecha_corte').value;
        const efectivo = parseFloat(document.getElementById('total_efectivo').value);
        const transferencia = parseFloat(document.getElementById('total_transferencia').value);
        const total = parseFloat(document.getElementById('total_caja').value);
        const responsable = document.getElementById('responsable').value.trim();
        
        if (!fecha || isNaN(efectivo) || isNaN(transferencia) || isNaN(total) || !responsable) {
            showMessage('Todos los campos obligatorios deben estar completos', 'error');
            return;
        }
        
        // Cambiar botón a estado de carga
        guardarBtn.disabled = true;
        guardarBtn.innerHTML = '<span class="loading"></span> Guardando...';
        
        const corteData = {
            Fecha_Corte: fecha,
            Total_Efectivo: efectivo,
            Total_Transferencia: transferencia,
            Total_Caja: total,
            Responsable: responsable,
            Observaciones: document.getElementById('observaciones').value.trim()
        };
        
        console.log('📤 Enviando datos de corte:', corteData);
        
        const response = await fetch(API_CAJA, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(corteData)
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error al guardar corte: ${response.status} ${response.statusText}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Corte guardado:', resultado);
        
        showMessage('Corte de caja registrado correctamente', 'success');
        
        // Limpiar formulario
        corteForm.reset();
        
        // Recargar cortes
        await cargarCortes();
        
    } catch (error) {
        console.error('❌ Error al guardar corte:', error);
        showMessage('Error al guardar corte: ' + error.message, 'error');
    } finally {
        // Restaurar botón
        guardarBtn.disabled = false;
        guardarBtn.innerHTML = originalText;
    }
}

// Función para mostrar formulario en móviles
function mostrarFormulario() {
    formSection.classList.toggle('active');
    
    if (formSection.classList.contains('active')) {
        nuevoCorteBtn.innerHTML = '<i class="fas fa-times"></i>';
    } else {
        nuevoCorteBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando página de corte de caja...');
    
    // Cargar cortes iniciales
    cargarCortes();
    
    // Event listener para el formulario
    corteForm.addEventListener('submit', guardarCorte);
    
    // Event listener para búsqueda
    searchInput.addEventListener('input', function() {
        buscarCortes(this.value);
    });
    
    // Event listeners para cálculo automático
    document.getElementById('total_efectivo').addEventListener('input', calcularTotal);
    document.getElementById('total_transferencia').addEventListener('input', calcularTotal);
    
    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_corte').min = today;
    
    // Establecer fecha por defecto como hoy
    document.getElementById('fecha_corte').value = today;
}); 