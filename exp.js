let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const transactionList = document.getElementById("transaction-list");
const transactionForm = document.getElementById("transaction-form");
const filterCategory = document.getElementById("filter-category");
let chart;

transactionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const date = document.getElementById("date").value;
  const desc = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  if (!date || !desc || !amount || isNaN(amount)) {
    alert("Please fill all fields correctly.");
    return;
  }

  const transaction = {
    id: Date.now(),
    date,
    desc,
    amount,
    type,
    category
  };

  transactions.push(transaction);
  saveAndRender();
  transactionForm.reset();
});

function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveAndRender();
}

function editTransaction(id) {
  const tx = transactions.find(tx => tx.id === id);
  if (!tx) return;

  document.getElementById("date").value = tx.date;
  document.getElementById("description").value = tx.desc;
  document.getElementById("amount").value = tx.amount;
  document.getElementById("type").value = tx.type;
  document.getElementById("category").value = tx.category;

  deleteTransaction(id);
}

function saveAndRender() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  updateSummary();
  renderChart();
}

function renderTransactions() {
  transactionList.innerHTML = "";
  const selectedCategory = filterCategory.value;

  transactions
    .filter(tx => selectedCategory === "All" || tx.category === selectedCategory)
    .forEach(tx => {
      const li = document.createElement("li");
      li.className = tx.type;
      li.innerHTML = `
        ${tx.date} - ${tx.desc} [${tx.category}]: ₹${tx.amount}
        <button class="delete-btn" onclick="deleteTransaction(${tx.id})">X</button>
        <button class="delete-btn" onclick="editTransaction(${tx.id})">Edit</button>
      `;
      transactionList.appendChild(li);
    });
}

function updateSummary() {
  let income = 0, expense = 0;
  transactions.forEach(tx => {
    if (tx.type === "income") income += tx.amount;
    else expense += tx.amount;
  });

  incomeEl.textContent = income.toFixed(2);
  expenseEl.textContent = expense.toFixed(2);
  balanceEl.textContent = (income - expense).toFixed(2);
}

filterCategory.addEventListener("change", renderTransactions);

function renderChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const categories = {};
  transactions.filter(tx => tx.type === "expense").forEach(tx => {
    categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
  });

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ['#f44336', '#2196f3', '#4caf50', '#ff9800']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "transactions.json";
  a.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        transactions = imported;
        saveAndRender();
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  reader.readAsText(file);
}

saveAndRender();
