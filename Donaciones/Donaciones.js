const general = document.getElementById("general");
const refugio = document.getElementById("refugio");
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.querySelector(".sidebar");
const mercadoBtn = document.getElementById("mercadoBtn");
const paypalBtn = document.getElementById("paypalBtn");
const selectorRefugio = document.getElementById("selectorRefugio");
const listaInstituciones = document.getElementById("listaInstituciones");

let instituciones = [];
let institucionSeleccionada = null;

// Toggle sidebar mobile
menuToggle.addEventListener("click", ()=>{ sidebar.classList.toggle("active"); });

// Verificar tipo de usuario al cargar la página
async function verificarTipoUsuario() {
  try {
    const res = await fetch("../php/session_status.php", {
      credentials: "include",
      cache: "no-store"
    });
    const data = await res.json();
    
    if (data.logged && (data.rol === 'empleado' || data.rol === 'institucion')) {
      // Deshabilitar botones y checkboxes
      mercadoBtn.disabled = true;
      paypalBtn.disabled = true;
      general.disabled = true;
      refugio.disabled = true;
      input.disabled = true;
      
      // Agregar estilos visuales de deshabilitado
      mercadoBtn.style.opacity = "0.5";
      mercadoBtn.style.cursor = "not-allowed";
      paypalBtn.style.opacity = "0.5";
      paypalBtn.style.cursor = "not-allowed";
      
      // Agregar mensaje de advertencia
      const card = document.querySelector(".donaciones-card");
      const mensaje = document.createElement("div");
      mensaje.style.cssText = "background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px; color: #856404; font-weight: 600; text-align: center;";
      mensaje.innerHTML = "⚠️ Solo los usuarios regulares pueden realizar donaciones.<br>Empleados e instituciones no tienen acceso a esta función.";
      card.insertBefore(mensaje, card.firstChild);
    }
  } catch (error) {
    console.error("Error al verificar usuario:", error);
  }
}

// Cargar instituciones disponibles
async function cargarInstituciones() {
  try {
    const res = await fetch("../php/obtener_instituciones.php", {
      credentials: "include",
      cache: "no-store"
    });
    const data = await res.json();
    
    if (data.success) {
      instituciones = data.instituciones;
      mostrarInstituciones();
    } else {
      console.error("Error al cargar instituciones:", data.message);
    }
  } catch (error) {
    console.error("Error al cargar instituciones:", error);
  }
}

// Mostrar instituciones en el selector
function mostrarInstituciones() {
  listaInstituciones.innerHTML = '';
  
  if (instituciones.length === 0) {
    listaInstituciones.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No hay instituciones disponibles</p>';
    return;
  }
  
  instituciones.forEach(inst => {
    const item = document.createElement('div');
    item.className = 'institucion-item';
    item.dataset.id = inst.id_inst;
    
    // Avatar con imagen o inicial
    const avatar = document.createElement('img');
    avatar.className = 'institucion-avatar';
    
    if (inst.logo_inst && inst.logo_inst !== '') {
      // Usar la imagen de perfil de la institución (la ruta ya viene completa)
      avatar.src = inst.logo_inst;
      avatar.alt = inst.nomb_inst;
      avatar.onerror = function() {
        // Si la imagen no carga, mostrar inicial
        this.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'institucion-avatar';
        fallback.style.cssText = `
          background: linear-gradient(135deg, var(--marron), var(--accent));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
        `;
        fallback.textContent = inst.nomb_inst.charAt(0).toUpperCase();
        this.parentNode.replaceChild(fallback, this);
      };
    } else {
      // Si no tiene imagen, mostrar inicial
      avatar.style.cssText = `
        background: linear-gradient(135deg, var(--marron), var(--accent));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 18px;
      `;
      avatar.textContent = inst.nomb_inst.charAt(0).toUpperCase();
      avatar.removeAttribute('src');
    }
    
    const info = document.createElement('div');
    info.className = 'institucion-info';
    
    const nombre = document.createElement('div');
    nombre.className = 'institucion-nombre';
    nombre.textContent = inst.nomb_inst;
    
    const email = document.createElement('div');
    email.className = 'institucion-email';
    email.textContent = inst.email_inst;
    
    info.appendChild(nombre);
    info.appendChild(email);
    
    item.appendChild(avatar);
    item.appendChild(info);
    
    // Manejar selección
    item.addEventListener('click', () => {
      // Remover selección previa
      document.querySelectorAll('.institucion-item').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Marcar como seleccionada
      item.classList.add('selected');
      institucionSeleccionada = inst;
    });
    
    listaInstituciones.appendChild(item);
  });
}

// Ejecutar verificación y carga al iniciar
verificarTipoUsuario();
cargarInstituciones();

// Donación checkbox
function handleCheck(e){
  if(e.target===general && general.checked){ 
    refugio.checked=false; 
    selectorRefugio.style.display = 'none';
    institucionSeleccionada = null;
    document.querySelectorAll('.institucion-item').forEach(el => {
      el.classList.remove('selected');
    });
  }
  if(e.target===refugio && refugio.checked){ 
    general.checked=false; 
    selectorRefugio.style.display = 'block';
  }
}
general.addEventListener("change", handleCheck);
refugio.addEventListener("change", handleCheck);

// Validación y simulación pago
async function validarDonacion(plataforma){
  // Verificar que el usuario sea tipo 'usuario'
  try {
    const res = await fetch("../php/session_status.php", {
      credentials: "include",
      cache: "no-store"
    });
    const data = await res.json();
    
    if (!data.logged) {
      alert("Debes iniciar sesión para realizar una donación.");
      window.location.href = "../login/login.html";
      return;
    }
    
    if (data.rol === 'empleado' || data.rol === 'institucion') {
      alert("❌ No puedes realizar donaciones.\n\nSolo los usuarios regulares pueden donar.\nEmpleados e instituciones no tienen acceso a esta función.");
      return;
    }
  } catch (error) {
    alert("Error al verificar tu sesión. Por favor intenta nuevamente.");
    return;
  }
  
  if(!general.checked && !refugio.checked){
    alert("Por favor selecciona una opción de donación.");
    return;
  }
  
  if(refugio.checked && !institucionSeleccionada){
    alert("Por favor selecciona una institución para realizar tu donación.");
    return;
  }
  
  const destino = general.checked ? "Proyecto Casa Patitas" : institucionSeleccionada.nomb_inst;
  const confirmacion = confirm(`¿Confirmas que deseas proceder con la donación a ${destino} a través de ${plataforma}?`);
  if(!confirmacion) return;
  
  try {
    const response = await fetch("../php/registrar_donacion.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        plataforma: plataforma,
        donacion_pagina: general.checked,
        id_inst: refugio.checked ? institucionSeleccionada.id_inst : null,
        destino: destino
      })
    });
    
    const data = await response.json();
    
    if(data.success) {
      alert(`¡Gracias por tu donación! 🐾\n\nAhora eres un donante premium y tienes una patita dorada en tu perfil.\n\nSe simuló el proceso de pago con ${plataforma}.`);
      // Opcional: redirigir al inicio
      window.location.href = "../index/index.html";
    } else {
      alert(data.message || "Error al registrar la donación.");
    }
  } catch(error) {
    console.error("Error:", error);
    alert("Error al procesar la donación. Por favor intenta nuevamente.");
  }
}

mercadoBtn.addEventListener("click", ()=> validarDonacion("Mercado Pago"));
paypalBtn.addEventListener("click", ()=> validarDonacion("PayPal"));