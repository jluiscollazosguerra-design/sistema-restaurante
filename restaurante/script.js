/* ================= LOGIN ================== */
function login() {
  const usuario = document.getElementById("usuario").value;
  const clave = document.getElementById("clave").value;

  if (usuario === "admin" && clave === "1234") {
    // Guardamos una "sesión"
    localStorage.setItem("logueado", "true");
    window.location.href = "menu_principal.html"; // Redirigir al menú
  } else {
    document.getElementById("error").innerText = "Usuario o clave incorrectos";
  }
}

// Proteger acceso al menú principal
if (window.location.pathname.includes("menu_principal.html")) {
  if (localStorage.getItem("logueado") !== "true") {
    window.location.href = "login.html";
  }
}

/* ================ MESAS =================== */
let mesas = [];
let mesaSeleccionada = null;

// Crear 12 mesas iniciales
for (let i = 1; i <= 12; i++) {
  mesas.push({
    id: i,
    estado: "Libre",
    observacion: "",
    precio: 0
  });
}

// Mostrar mesas
function renderMesas() {
  const contenedor = document.getElementById("mesas");
  if (!contenedor) return; // Si estamos en login.html, no hace nada

  contenedor.innerHTML = "";

  mesas.forEach(mesa => {
    const div = document.createElement("div");
    div.classList.add("mesa");

    if (mesa.estado.includes("Libre")) div.classList.add("libre");
    if (mesa.estado.includes("Falta pagar")) div.classList.add("ocupada");
    if (mesa.estado.includes("Pagado")) div.classList.add("pagado");
    if (mesa.estado.includes("Reservada")) div.classList.add("reservada");

    div.innerHTML = `
      <h3>Mesa ${mesa.id}</h3>
      <p>${mesa.estado}</p>
      <p><strong>S/:</strong> ${mesa.precio.toFixed(2)}</p>
    `;

    div.onclick = () => abrirModal(mesa.id);
    contenedor.appendChild(div);
  });

  calcularCaja();
}

// Abrir modal
function abrirModal(id) {
  mesaSeleccionada = mesas.find(m => m.id === id);
  document.getElementById("tituloMesa").innerText = `Mesa ${mesaSeleccionada.id}`;
  document.getElementById("estadoMesa").value = mesaSeleccionada.estado;
  document.getElementById("observacionMesa").value = mesaSeleccionada.observacion;
  document.getElementById("precioMesa").value = mesaSeleccionada.precio;
  document.getElementById("mesaModal").style.display = "block";
}

// Cerrar modal
function cerrarModal() {
  document.getElementById("mesaModal").style.display = "none";
}

// Guardar cambios
function guardarMesa() {
  if (!mesaSeleccionada) return;

  mesaSeleccionada.estado = document.getElementById("estadoMesa").value;
  mesaSeleccionada.observacion = document.getElementById("observacionMesa").value;
  mesaSeleccionada.precio = parseFloat(document.getElementById("precioMesa").value) || 0;

  renderMesas();
  cerrarModal();
}

// Calcular caja total
function calcularCaja() {
  const total = mesas
    .filter(m => m.estado.includes("Pagado") || m.estado.includes("adelanto"))
    .reduce((suma, m) => suma + m.precio, 0);

  let caja = document.getElementById("cajaTotal");
  if (caja) {
    caja.innerText = `S/ ${total.toFixed(2)}`;
  }
}

// Inicializar al cargar página
window.onload = () => {
  if (document.getElementById("mesas")) {
    renderMesas();
  }
};
// ... (código de mesas que ya tienes)

// Guardar cambios en mesa
function guardarMesa() {
  if (!mesaSeleccionada) return;

  mesaSeleccionada.estado = document.getElementById("estadoMesa").value;
  mesaSeleccionada.observacion = document.getElementById("observacionMesa").value;
  mesaSeleccionada.precio = parseFloat(document.getElementById("precioMesa").value) || 0;

  renderMesas();
  cerrarModal();

  // Si la mesa quedó pagada, mostrar opción de boleta
  if (mesaSeleccionada.estado.includes("Pagado")) {
    abrirFormularioBoleta(mesaSeleccionada);
  }
}

// Abrir formulario para boleta/factura
function abrirFormularioBoleta(mesa) {
  const formHTML = `
    <div id="formBoleta" style="padding:20px; background:#fff; border:2px solid #333; position:fixed; top:20%; left:35%; z-index:9999;">
      <h3>Comprobante - Mesa ${mesa.id}</h3>
      <label>Tipo:</label>
      <select id="tipoComprobante">
        <option value="Boleta">Boleta</option>
        <option value="Factura">Factura</option>
      </select><br><br>
      
      <label>DNI/RUC:</label>
      <input type="text" id="docCliente"><br><br>
      
      <label>Nombre/Razón Social:</label>
      <input type="text" id="nombreCliente"><br><br>
      
      <button onclick="generarBoleta(${mesa.id})">Generar</button>
      <button onclick="document.getElementById('formBoleta').remove()">Cancelar</button>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", formHTML);
}

// Generar boleta o factura
function generarBoleta(idMesa) {
  const mesa = mesas.find(m => m.id === idMesa);
  const tipo = document.getElementById("tipoComprobante").value;
  const doc = document.getElementById("docCliente").value;
  const nombre = document.getElementById("nombreCliente").value;

  // Crear contenido de boleta
  let boletaHTML = `
    <html>
    <head><title>${tipo} - Mesa ${mesa.id}</title></head>
    <body style="font-family:Arial; padding:20px;">
      <h2>🍽️ Restaurante - ${tipo}</h2>
      <p><strong>Mesa:</strong> ${mesa.id}</p>
      <p><strong>${tipo === "Boleta" ? "DNI" : "RUC"}:</strong> ${doc}</p>
      <p><strong>${tipo === "Boleta" ? "Cliente" : "Razón Social"}:</strong> ${nombre}</p>
      <p><strong>Observación:</strong> ${mesa.observacion}</p>
      <p><strong>Total:</strong> S/ ${mesa.precio.toFixed(2)}</p>
      <hr>
      <p>Gracias por su visita 💙</p>
      <script>window.print()</script>
    </body>
    </html>
  `;

  // Abrir en nueva ventana
  let ventana = window.open("", "_blank", "width=400,height=600");
  ventana.document.write(boletaHTML);
  ventana.document.close();

  // Cerrar formulario
  document.getElementById("formBoleta").remove();
}

// Mostrar fecha y hora en tiempo real
function mostrarFechaHora() {
  const ahora = new Date();
  const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
  const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

  const fecha = ahora.toLocaleDateString('es-PE', opcionesFecha);
  const hora = ahora.toLocaleTimeString('es-PE', opcionesHora);

  document.getElementById("fechaHora").innerText = `📅 ${fecha} ⏰ ${hora}`;
}

// Actualizar cada segundo
setInterval(mostrarFechaHora, 1000);



