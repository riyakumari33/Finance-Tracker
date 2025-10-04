const form = document.getElementById("transaction-form");
const tableBody = document.getElementById("transaction-table");
const incomeDisplay = document.getElementById("total-income");
const expenseDisplay = document.getElementById("total-expense");
const balanceDisplay = document.getElementById("balance");
const exportBtn = document.getElementById("export-btn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const ctx = document.getElementById("pieChart");
let pieChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ["#d32f2f", "#f5b700","#00c853","#e0e0e0"]
    }]
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  const transaction = {
    id: Date.now(),
    amount: parseFloat(amount),
    type,
    category,
    date
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  form.reset();

  renderUI();
});

function renderUI() {
  // Totals
  let income = 0, expense = 0;

  tableBody.innerHTML = "";

  transactions.forEach(t => {
    if (t.type === "Income") income += t.amount;
    else expense += t.amount;

    // Add to table
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
      <td>₹${t.amount}</td>
      <td><button onclick="deleteTransaction(${t.id})">❌</button></td>
    `;
    tableBody.appendChild(row);
  });

  incomeDisplay.textContent = income;
  expenseDisplay.textContent = expense;
  balanceDisplay.textContent = income - expense;

  // Update Chart
  const categoryTotals = {};
  transactions.forEach(t => {
    if (t.type === "Expense") {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  pieChart.data.labels = Object.keys(categoryTotals);
  pieChart.data.datasets[0].data = Object.values(categoryTotals);
  pieChart.update();
}


function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderUI();
}

// Export CSV
exportBtn.addEventListener("click", () => {
  let csv = "Date,Type,Category,Amount\n";
  transactions.forEach(t => {
    csv += `${t.date},${t.type},${t.category},${t.amount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  link.click();
});

//Initial Render
renderUI();
