// app.js

// Evento para el formulario, maneja tanto agregar como actualizar productos
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const editingId = document.getElementById('editingId').value;
    if (editingId) {
        updateProduct(editingId);
    } else {
        addProduct();
    }
});

// Función para agregar un producto
function addProduct() {
    let name = document.getElementById('name').value;
    let price = document.getElementById('price').value;
    let category = document.getElementById('category').value;
    let image = document.getElementById('image').files[0];
    let largo = document.getElementById('largo').value;
    let ancho = document.getElementById('ancho').value;

    let formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('image', image);
    formData.append('largo', largo);
    formData.append('ancho', ancho);

    fetch('http://localhost:8000/items/', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        getProducts(); // Actualizar lista de productos
        clearForm(); // Limpia el formulario
    })
    .catch(error => console.error('Error:', error));
}

// Función para obtener y mostrar los productos
function getProducts() {
    fetch('http://localhost:8000/items/')
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('productList');
            productList.innerHTML = ''; // Limpiar lista actual
            products.forEach(product => {
                const [id, name, photo, price, category, largo, ancho] = product;
                productList.innerHTML += `
                    <tr>
                        <td data-label="Nombre">${name}</td>
                        <td data-label="Precio">${price}</td>
                        <td data-label="Categoría">${category}</td>
                        <td data-label="Imagen"><img src="${photo}" alt="${name}" style="width: 50px; height: auto;"></td>
                        <td data-label="Largo">${largo}</td>
                        <td data-label="Ancho">${ancho}</td>
                        <td data-label="Acciones">
                            <button onclick="editProduct(${id})">Editar</button>
                            <button onclick="deleteProduct(${id})">Eliminar</button>
                        </td>
                    </tr>`;
            });
        })
        .catch(error => console.error('Error:', error));
}

// Función para eliminar un producto
function deleteProduct(id) {
    fetch(`http://localhost:8000/items/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        getProducts(); // Actualizar lista de productos
    })
    .catch(error => console.error('Error:', error));
}

function editProduct(id) {
    fetch(`http://localhost:8000/items/${id}`)
        .then(response => response.json())
        .then(product => {
            const [productId, name, photo, price, category, largo, ancho] = product;

            document.getElementById('editingId').value = productId;
            document.getElementById('name').value = name;
            document.getElementById('price').value = price;
            document.getElementById('category').value = category;
            // No se puede establecer 'image' ya que es un archivo
            document.getElementById('largo').value = largo;
            document.getElementById('ancho').value = ancho;

            // Cambiar los botones para el modo de edición
            document.getElementById('addButton').style.display = 'none';
            document.getElementById('updateButton').style.display = 'block';
            document.getElementById('cancelButton').style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

function updateProduct() {
    const editingId = document.getElementById('editingId').value;

    if (!editingId) {
        console.error("No product ID provided for update.");
        return;
    }

    let name = document.getElementById('name').value;
    let price = document.getElementById('price').value;
    let category = document.getElementById('category').value;
    let image = document.getElementById('image').files[0];
    let largo = document.getElementById('largo').value;
    let ancho = document.getElementById('ancho').value;

    let formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    if(image) formData.append('image', image);
    formData.append('largo', largo);
    formData.append('ancho', ancho);

    fetch(`http://localhost:8000/items/${editingId}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        getProducts(); // Actualizar lista de productos
        clearForm(); // Limpia el formulario
    })
    .catch(error => console.error('Error:', error));
}


// Función para limpiar el formulario
function clearForm() {
    document.getElementById('editingId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('category').value = '';
    document.getElementById('image').value = '';
    document.getElementById('largo').value = '';
    document.getElementById('ancho').value = '';

    // Restablece los botones a su estado original
    document.getElementById('addButton').style.display = 'block';
    document.getElementById('updateButton').style.display = 'none';
    document.getElementById('cancelButton').style.display = 'none';
}

// Función para cancelar la edición
function cancelEdit() {
    clearForm();
}

// Llamar a getProducts al cargar la página para mostrar los productos existentes
window.onload = getProducts;
