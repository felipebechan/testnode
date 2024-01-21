
let scene, camera, renderer;
const RADIUS = 50;
const HEIGHT = 15;
let cylinders = [];
let productsInfo = {}; // Almacena la información de los productos

function init() {
    setupScene(); // Asegúrate de que la escena se configure primero

    fetch('/api/cilindros')
        .then(response => response.json())
        .then(data => {
            createCylinders(data);
            animate();
        })
        .catch(error => console.error('Error al cargar los cilindros:', error));
        
}

function createCylinders(cilindrosData) {
    // Ordenar los cilindros de mayor a menor diámetro
    cilindrosData.sort((a, b) => b[1] - a[1]); // b[1] y a[1] representan el diámetro

    let textureLoader = new THREE.TextureLoader();
    let tortaTexture = textureLoader.load('torta.jpg');
    let tortaMaterial = new THREE.MeshStandardMaterial({ map: tortaTexture });

    let cumulativeHeight = 0; // Inicializa la altura acumulada

    cilindrosData.forEach(cilindro => {
        const [id, diametro, alto, nombre] = cilindro;
        let geometry = new THREE.CylinderGeometry(diametro / 2, diametro / 2, alto, 32);
        let cylinderMesh = new THREE.Mesh(geometry, tortaMaterial);

        // Ajusta la posición del cilindro actual
        cylinderMesh.position.y = cumulativeHeight + alto / 2;
        scene.add(cylinderMesh);

        // Acumula la altura para el siguiente cilindro
        cumulativeHeight += alto;

        cylinders.push(cylinderMesh);
    });
}




function setupScene() {
    
    // Creación de la escena
    scene = new THREE.Scene();

    // Configuración de la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50; // Ajusta esto según la escala de tus objetos

    // Configuración del renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xFCE8FA); // Color de fondo
    document.body.appendChild(renderer.domElement);

    // Configuración de las luces
    let ambientLight = new THREE.AmbientLight(0xffffff, 2); // Luz ambiental más fuerte
    scene.add(ambientLight);

    // Añadir luces direccionales desde diferentes ángulos
    const addDirectionalLight = (x, y, z, intensity) => {
        let dirLight = new THREE.DirectionalLight(0xffffff, intensity);
        dirLight.position.set(x, y, z);
        scene.add(dirLight);
    };

    addDirectionalLight(1, 1, 1, 0.7);
    addDirectionalLight(-1, -1, -1, 0.7);
    addDirectionalLight(1, -1, 1, 0.7);
    addDirectionalLight(-1, 1, -1, 0.7);

    // Manejo del cambio de tamaño de la ventana
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
// Asegúrate de tener THREE.TextureLoader definido
let textureLoader = new THREE.TextureLoader();

// Cargar la textura de la nube y crear nubes
let cloudTexture = textureLoader.load('nube.png');
let clouds = [];

for (let i = 0; i < 40; i++) {
    let cloudGeometry = new THREE.PlaneGeometry(20, 15);
    let cloudMaterial = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.9 // Ajusta la opacidad para la transparencia
    });
    let cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

   // Ajusta estas posiciones para una mejor distribución
   cloud.position.set(
    Math.random() * 800 - 140, // X
    90, // Y, posición elevada
    Math.random() * -100 // Z, detrás del cilindro
);
scene.add(cloud);
clouds.push(cloud);
}
}






function startCameraAnimation() {
isAnimating = true;
animateCamera();
}


function animateCamera() {
if (!isAnimating) return;

// Interpolar la posición y el punto de mira de la cámara
camera.position.lerp(targetPosition, 0.5);
camera.lookAt(targetLookAt);

// Verificar si la animación ha alcanzado su objetivo
if (camera.position.distanceTo(targetPosition) < 0.1) {
camera.position.copy(targetPosition);
camera.lookAt(targetLookAt);
isAnimating = false;
} else {
requestAnimationFrame(animateCamera);
}
}

function focusOnCylinder(cylinderIndex) {
if (cylinderIndex < 0 || cylinderIndex >= cylinders.length) return;

let targetCylinder = cylinders[cylinderIndex];
let scale = 1 - (cylinderIndex * 0.1);
let adjustedDistance = 100 * scale; // Ajusta este valor según sea necesario

camera.position.set(targetCylinder.position.x, targetCylinder.position.y, adjustedDistance);
camera.lookAt(targetCylinder.position);
}



function loadProducts() {
    fetch('/api/items')
        .then(response => response.json())
        .then(data => displayProducts(data))
        .catch(error => console.error('Error al cargar los productos:', error));
}

function displayProducts(products) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    products.forEach(product => {
        productsInfo[product[0]] = {
            id: product[0],
            name: product[1],
            imageUrl: product[2],
            price: product[3],
            width: product[5],
            height: product[6]
        };

        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.innerHTML = `
            <img src="${product[2]}" alt="${product[1]}">
            <p>${product[1]}</p><p>${product[3]}CLP</p>
            <button onclick="decorateCylinderWithProduct(${product[0]})">Seleccionar</button>
        `;
        productsContainer.appendChild(productElement);
    });
}
function createExplosionEffect(cylinder) {
    let particles = 4; // Reducir la cantidad de partículas
    let positions = [];
    let sizes = [];
    let colors = [];
    let color = new THREE.Color();
    let cylinderRadius = cylinder.geometry.parameters.radiusTop;

    for (let i = 0; i < particles; i++) {
        // Posiciones iniciales alrededor del borde del cilindro
        let angle = Math.random() * Math.PI * 2;
        let x = cylinder.position.x + Math.cos(angle) * cylinderRadius;
        let y = cylinder.position.y;
        let z = cylinder.position.z + Math.sin(angle) * cylinderRadius;
        positions.push(x, y, z);

        // Tamaños grandes
        sizes.push(Math.random() * 6.0 + 4.0); // Tamaños entre 4.0 y 10.0

        // Colores variados
        color.setHSL(Math.random(), 1.0, 0.5);
        colors.push(color.r, color.g, color.b);
    }

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    let material = new THREE.PointsMaterial({
        size: 2, // Tamaño base para partículas
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true
    });

    let particleSystem = new THREE.Points(geometry, material);

    scene.add(particleSystem);

    // Animar las partículas
    let animateParticles = function() {
        requestAnimationFrame(animateParticles);
        let positions = particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            // Velocidad y dirección para una expansión más dramática
            positions[i + 1] += Math.random() * 2 ; // Y
            positions[i] += Math.random() * 2 -1; // X
            positions[i + 2] += Math.random() * 2 -1 ; // Z
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Opcional: Reducir el tamaño de las partículas con el tiempo para un efecto de desvanecimiento
        let sizes = particleSystem.geometry.attributes.size.array;
        for (let i = 0; i < sizes.length; i++) {
            sizes[i] *= 0.96;
            if (sizes[i] < 0.5) {
                particleSystem.geometry.deleteAttribute('position');
                particleSystem.geometry.deleteAttribute('size');
                scene.remove(particleSystem);
                return;
            }
        }
        particleSystem.geometry.attributes.size.needsUpdate = true;
    };
    animateParticles();
}





let selectedProducts = {}; // Este objeto almacenará los productos seleccionados

function decorateCylinderWithProduct(productID) {
    
let cylinderIndex = parseInt(document.getElementById('cylinderSelector').value);
console.log("Cilindro seleccionado:", cylinderIndex);

if (cylinderIndex < 0 || cylinderIndex >= cylinders.length) {
console.error("Índice de cilindro inválido:", cylinderIndex);
return;
}

let selectedCylinder = cylinders[cylinderIndex];
clearDecorations(selectedCylinder);


// Eliminar cualquier selección previa para este cilindro
Object.keys(selectedProducts).forEach(key => {
if (selectedProducts[key].cylinderIndex === cylinderIndex) {
    delete selectedProducts[key];
}
});

let product = productsInfo[productID];
let numProducts = calculateNumProducts(selectedCylinder, product.width, product.height);

selectedProducts[productID] = {
id: product.id,
name: product.name,
quantity: numProducts,
price: product.price,
totalPrice: product.price * numProducts, // Precio total por producto
cylinderIndex: cylinderIndex
};


// Aplica la decoración al cilindro seleccionado
let textureLoader = new THREE.TextureLoader();
textureLoader.load(product.imageUrl, function (texture) {
let adjustedRadius = selectedCylinder.geometry.parameters.radiusTop;
let angleStep = (2 * Math.PI) / numProducts;

for (let i = 0; i < numProducts; i++) {
    let angle = i * angleStep;
    let planeGeometry = new THREE.PlaneGeometry(product.width, product.height);
    let planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
    let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

    planeMesh.position.x = adjustedRadius * Math.cos(angle);
    planeMesh.position.y = 0;
    planeMesh.position.z = adjustedRadius * Math.sin(angle);

    // Ajustar la rotación
    planeMesh.rotation.y = Math.PI / 2 - angle;

    selectedCylinder.add(planeMesh);
    createExplosionEffect(selectedCylinder);
}
}, undefined, function (error) {
console.error('Error loading texture:', error);
});

// Actualizar dropdown del cilindro seleccionado
let dropdownId = `dropdown-${cylinderIndex + 1}`;
let selectedCylinderDropdown = document.getElementById(dropdownId);
if (selectedCylinderDropdown) {
selectedCylinderDropdown.innerHTML = `${product.name} x ${numProducts}`;
selectedCylinderDropdown.style.display = 'block'; // Solo abre este dropdown
} else {

console.error("Dropdown no encontrado para el cilindro:", cylinderIndex);
}

}

// Resto de tu código...




function clearDecorations(cylinder) {
while (cylinder.children.length > 0) {
cylinder.remove(cylinder.children[0]);
}
}

function calculateNumProducts(cylinder, productWidth) {
    // El diámetro del cilindro es el doble del radio (geometry.parameters.radiusTop)
    let diameter = cylinder.geometry.parameters.radiusTop * 2;
    let perimeter = Math.PI * diameter;
    let numProductsAround = Math.floor(perimeter / productWidth);

    return numProductsAround;
}



function clearDecorations(cylinder) {
while (cylinder.children.length > 0) {
cylinder.remove(cylinder.children[0]);
}
}






function clearDecorations(cylinder) {
    while (cylinder.children.length > 0) {
        cylinder.remove(cylinder.children[0]);
    }
}

function calculateNumProducts(cylinder, productWidth) {
    let cylinderRadius = cylinder.geometry.parameters.radiusTop; // Usa el radio real del cilindro
    let perimeter = 2 * Math.PI * cylinderRadius;
    let numProductsAround = Math.floor(perimeter / productWidth);
    return numProductsAround;
}


function updatePriceSummary(cylinderIndex, product, numProducts) {
let priceSummary = document.getElementById('priceSummary');
let individualPriceLine = `Cilindro ${cylinderIndex + 1}: ${product.name} x ${numProducts} = ${(product.price * numProducts).toFixed(2)}`;

// Borrar la línea anterior del mismo cilindro, si existe
let existingLine = document.querySelector(`#priceSummary .cylinder-${cylinderIndex}`);
if (existingLine) {
existingLine.innerHTML = individualPriceLine;
} else {
let newLine = document.createElement('div');
newLine.classList.add(`cylinder-${cylinderIndex}`);
newLine.innerHTML = individualPriceLine;
priceSummary.appendChild(newLine);
}

// Actualizar el total
updateTotal();
}

function updateTotal() {
let totalPrice = 0;
document.querySelectorAll('#priceSummary div').forEach(line => {
let pricePart = line.innerHTML.split('=')[1];
if (pricePart) {
    totalPrice += parseFloat(pricePart);
}
});

let totalLine = document.getElementById('totalPrice');
if (!totalLine) {
totalLine = document.createElement('div');
totalLine.id = 'totalPrice';
document.getElementById('priceSummary').appendChild(totalLine);
}
totalLine.innerHTML = `Total: ${totalPrice.toFixed(2)}`;

// Mostrar el botón de continuar si hay un total
let continueButton = document.getElementById('continueButton');
if (totalPrice > 0) {
continueButton.style.display = 'block';
} else {
continueButton.style.display = 'none';
}
}



function animate() {
    requestAnimationFrame(animate);
    cylinders.forEach(cylinder => {
        cylinder.rotation.y += 0.002;
        
    });
    renderer.render(scene, camera);
    // Mueve cada nube ligeramente
    clouds.forEach(cloud => {
       cloud.position.x += 1; // Aumentar la velocidad para ver si las nubes se mueven
       if (cloud.position.x > 50) {
           console.log("Nube reubicada"); // Mensaje de depuración
           cloud.position.x = -50;
       }
   });
   

    // Asegúrate de que esto esté al final de tu función animate
    renderer.render(scene, camera);

}

// Incluye aquí los event listeners y la inicialización necesaria
window.onload = () => {
    init();
    loadProducts();
    loadCategories(); // Si se requiere cargar categorías al inicio
};
document.getElementById('cylinderSelector').addEventListener('change', function() {
focusOnCylinder(this.value);
});
// Almacenar el cilindro actualmente seleccionado
let selectedCylinderIndex = null;

document.querySelectorAll('.cylinder-dropdown').forEach(item => {
item.addEventListener('click', function() {
let cylinderIndex = parseInt(this.id.split('-')[1]) - 1;

// Actualiza el cilindro seleccionado actual
document.getElementById('cylinderSelector').value = cylinderIndex;


focusOnCylinder(cylinderIndex);
let currentDropdown = this.querySelector('.dropdown-content');
currentDropdown.style.display = 'block';


});
});



function updateDropdown(cylinderIndex, product, numProducts) {
// Solo actualiza el dropdown si corresponde al cilindro seleccionado
if (cylinderIndex === selectedCylinderIndex) {
let dropdown = document.querySelector(`#cylinder-${cylinderIndex} .dropdown-content`);
dropdown.innerHTML = `${product.name} x ${numProducts} = ${(product.price * numProducts).toFixed(2)}`;
}
}

function closeAllDropdowns() {
document.querySelectorAll('.dropdown-content').forEach(dropdown => {
dropdown.style.display = 'none';
});
}
function updateCamera() {
// Obtener las dimensiones del viewport
let width = window.innerWidth;
let height = window.innerHeight;

// Ajustar la cámara según las dimensiones
camera.aspect = width / height;
camera.updateProjectionMatrix();

// Ajustar el tamaño del renderer
renderer.setSize(width, height);
}


function adjustCameraView() {
    let boundingBox = new THREE.Box3();

    // Calcular el bounding box que contiene todos los cilindros
    for (let cylinder of cylinders) {
        boundingBox.expandByObject(cylinder);
    }

    let center = boundingBox.getCenter(new THREE.Vector3());
    let size = boundingBox.getSize(new THREE.Vector3());

    // Ajustar la distancia de la cámara en base al tamaño del bounding box
    let maxDim = Math.max(size.x, size.y, size.z);
    let distance = maxDim * 2; // Ajusta este factor según sea necesario

    let aspect = window.innerWidth / window.innerHeight;
    let cameraZ = aspect < 1 ? distance / Math.tan(camera.fov * 0.5) : distance / aspect;

    camera.position.set(center.x, center.y, cameraZ);
    camera.lookAt(center);

    camera.updateProjectionMatrix();
}


function proceedToCheckout() {
    adjustCameraView();
    renderer.render(scene, camera);
    let imgData = renderer.domElement.toDataURL("image/jpeg", 0.8);

    let productsArray = Object.values(selectedProducts).map(product => {
        return {
            id: product.id,
            name: product.name,
            quantity: product.quantity.toString(),
            price: product.totalPrice.toString()
        };
    });

    let orderData = {
        productos: productsArray,
        imagen: imgData
    };

    fetch('/api/create_shopify_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Pedido realizado con éxito:', data);
        // Lógica de post-compra (por ejemplo, redirección o mensajes al usuario)
    })
    .catch(error => console.error('Error:', error));
}
// Añadir esta función para cargar las categorías al inicio
function loadCategories() {

        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => populateCategoryDropdown(categories))
            .catch(error => console.error('Error al cargar las categorías:', error))
    
.then(response => response.json())
.then(categories => {
    populateCategoryDropdown(categories);

    // Seleccionar automáticamente la primera categoría y cargar los productos
    if (categories.length > 0) {
        let firstCategory = categories[0];
        let categoryDropdown = document.getElementById('categoryDropdown');
        categoryDropdown.value = firstCategory;
        loadProductsByCategory(firstCategory);
    }
})
.catch(error => {
    console.error('Error al cargar las categorías:', error);
});
}


// Función para llenar el dropdown de categorías
function populateCategoryDropdown(categories) {
    let categoryDropdown = document.getElementById('categoryDropdown');
    categories.forEach(category => {
        let option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryDropdown.appendChild(option);
    });

    categoryDropdown.addEventListener('change', function() {
        loadProductsByCategory(this.value);
    });
}

// Objeto para almacenar las categorías cargadas
let loadedCategories = {};

function loadProductsByCategory(category) {
    fetch(`/api/items/category/${category}`)
        .then(response => response.json())
        .then(products => displayProducts(products))
        .catch(error => console.error(`Error al cargar productos de la categoría ${category}:`, error));
}





document.getElementById('VerBien').addEventListener('click', function() {
adjustCameraView();
});
document.getElementById('checkoutButton').addEventListener('click', function() {
proceedToCheckout();
});


document.getElementById('saveImageBtn').addEventListener('click', function() {
adjustCameraView();
renderer.render(scene, camera); // Asegúrate de renderizar la escena
let imgData = renderer.domElement.toDataURL("image/png"); // Captura la imagen

// Crear un elemento <a> para descargar la imagen
let link = document.createElement('a');
link.download = 'torta.png';
link.href = imgData;
link.click();
});

// Llama a esta función al iniciar y cuando la ventana cambie de tamaño
window.addEventListener('resize', updateCamera);
updateCamera(); // Inicializa la cámara
adjustCameraView();


