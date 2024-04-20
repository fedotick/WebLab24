let db;

const addWindow = document.getElementById('addWindow');

const btnOpenAddWindow = document.getElementById('btnOpenAddWindow');
const btnCloseAddWindow = document.getElementById('btnCloseAddWindow');
const btnAddEntry = document.getElementById('btnAddEntry');
const btnDeleteEntries = document.getElementById('btnDeleteEntries');

const productsTable = document.getElementById('productsTable');

const inputNname = document.getElementById('name');
const inputPrice = document.getElementById('price');
const inputQuantity = document.getElementById('quantity');

btnOpenAddWindow.addEventListener('click', openAddWindow);
btnCloseAddWindow.addEventListener('click', closeAddWindow);
btnAddEntry.addEventListener('click', addEntry);
btnDeleteEntries.addEventListener('click', deleteEntries);

async function openAddWindow() {
    addWindow.style = '';
}

async function closeAddWindow() {
    addWindow.style.display = 'none';
    await resetInputValues();
}

async function resetInputValues() {
    inputNname.value = '';
    inputPrice.value = '';
    inputQuantity.value = '';
}

async function addEntry() {
    const name = inputNname.value;
    const price = parseFloat(inputPrice.value);
    const quantity = parseInt(inputQuantity.value);

    if (!name || Number.isNaN(price) || Number.isNaN(quantity)) {
        alert('Incorrectly entered data!');
        return;
    }

    const tx = db.transaction('products', 'readwrite');

    const entry = { name: name, price: price, quantity: quantity };

    await tx.objectStore('products').add(entry);
    
    await uploadEntries();
    await closeAddWindow();
}

async function uploadEntries() {
    const tx = db.transaction('products');
    const productStore = tx.objectStore('products');
    
    const products = await productStore.getAll();
    
    if (products.length) {
        showTable();

        const tableEntries = document.getElementById('tableEntries');

        tableEntries.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price}$</td>
            <td>${product.quantity}</td>
            <td>${product.price * product.quantity}$</td>
        </tr>`).join('');

        const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
        const totalPrice = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

        const totalQuantityCell = document.getElementById('totalQuantityCell');
        const totalPriceCell = document.getElementById('totalPriceCell');

        totalQuantityCell.innerHTML = totalQuantity;
        totalPriceCell.innerHTML = `${totalPrice}$`;
    } else {
        productsTable.innerHTML = '<h2>No products</h2>'
    }
}

async function showTable() {
    productsTable.innerHTML = `
    <table>
        <thead>
            <tr>
                <td>Id</td>
                <td>Name</td>
                <td>Price</td>
                <td>Quantity</td>
                <td>Total</td>
            </tr>
        </thead>
        <tbody id="tableEntries"></tbody>
        <tfoot>
            <tr>
                <td colspan="3">Total</td>
                <td id="totalQuantityCell"></td>
                <td id="totalPriceCell"></td>
            </tr>
        </tfoot>
    </table>`;
}

async function deleteEntries() {
    const tx = db.transaction('products', 'readwrite');
    await tx.objectStore('products').clear();

    await uploadEntries();
}

async function init() {
    db = await idb.openDb('ProductsDB', 1, db => {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
    });

    await uploadEntries();
}

init();
