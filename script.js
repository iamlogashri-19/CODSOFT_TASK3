// DOM Elements
const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const form = document.getElementById('transaction-form');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const editIdInput = document.getElementById('edit-id');
const submitBtn = document.getElementById('submit-btn');
const formTitle = document.getElementById('form-title');
const historyList = document.getElementById('history-list');
const filterCategory = document.getElementById('filter-category');

// Set default date input to today
dateInput.valueAsDate = new Date();

// Local Storage State
let transactions = JSON.parse(localStorage.getItem('expense_tracker_data')) || [];

// Save to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('expense_tracker_data', JSON.stringify(transactions));
}

// Add or Update Transaction
function handleFormSubmit(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;
    const editId = editIdInput.value;

    if (!title || isNaN(amount) || !date) return;

    if (editId) {
        // Edit existing transaction
        transactions = transactions.map(t => t.id === editId ? { id: editId, title, amount, type, category, date } : t);
        editIdInput.value = '';
        submitBtn.textContent = 'Add Transaction';
        formTitle.textContent = 'ADD NEW TRANSACTION';
    } else {
        // Add new transaction
        const newTransaction = {
            id: Date.now().toString(),
            title,
            amount,
            type,
            category,
            date
        };
        transactions.push(newTransaction);
    }

    saveToLocalStorage();
    form.reset();
    dateInput.valueAsDate = new Date();
    renderUI();
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToLocalStorage();
    renderUI();
}

// Edit Transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    editIdInput.value = transaction.id;
    titleInput.value = transaction.title;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;

    submitBtn.textContent = 'Update Transaction';
    formTitle.textContent = 'EDIT TRANSACTION';
}

// Update Balance and Summary Cards
function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    balanceEl.textContent = `₹${balance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    incomeEl.textContent = `+ ₹${income.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    expenseEl.textContent = `- ₹${expense.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

// Render Transaction List
function renderUI() {
    updateSummary();
    historyList.innerHTML = '';

    const selectedFilter = filterCategory.value;
    const filteredTransactions = selectedFilter === 'All' 
        ? transactions 
        : transactions.filter(t => t.category === selectedFilter);

    if (filteredTransactions.length === 0) {
        historyList.innerHTML = `<li class="empty-msg">No transactions recorded yet.</li>`;
        return;
    }

    // Sort transactions by date descending
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredTransactions.forEach(t => {
        const li = document.createElement('li');
        li.className = `history-item ${t.type}`;

        const sign = t.type === 'income' ? '+' : '-';
        const formattedAmount = t.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

        li.innerHTML = `
            <div class="item-details">
                <span class="item-title">${t.title}</span>
                <span class="item-sub">${t.category} • ${t.date}</span>
            </div>
            <div class="item-right">
                <span class="item-amount ${t.type}">${sign} ₹${formattedAmount}</span>
                <div class="actions">
                    <i class="fa-solid fa-pen-to-square" title="Edit" onclick="editTransaction('${t.id}')"></i>
                    <i class="fa-solid fa-trash" title="Delete" onclick="deleteTransaction('${t.id}')"></i>
                </div>
            </div>
        `;

        historyList.appendChild(li);
    });
}

// Event Listeners
form.addEventListener('submit', handleFormSubmit);
filterCategory.addEventListener('change', renderUI);

// Initial Load
renderUI();