// ==========================================
// MODULE 2: STOCK EXPENSES (stock_expenses.js)
// ==========================================
const StockExpensesModule = {
    init: function() { 
        const today = new Date().toISOString().split('T')[0]; 
        if(document.getElementById('stk-exp-date')) {
            document.getElementById('stk-exp-date').value = today; 
        }
        this.renderTable(); 
    },

    getHTML: function() {
        return `
            <div class="card no-print" style="border-top-color: var(--red);">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                    <img src="assets/sandmine.png" alt="Logo" style="height: 35px; width: auto;">
                    <h3 style="color:var(--red); margin:0;">💸 Stock Expense Entry</h3>
                </div>
                <div class="form-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; align-items:end;">
                    <div><label>Date</label><input type="date" id="stk-exp-date" onchange="StockExpensesModule.renderTable()"></div>
                    <div><label>Description</label><input type="text" id="stk-exp-desc" placeholder="Expense Details..."></div>
                    <div><label>Amount (₹)</label><input type="number" id="stk-exp-amount" placeholder="0"></div>
                    <div><button class="btn-action" style="background:var(--red); width:100%;" onclick="StockExpensesModule.saveExpense()">SAVE EXPENSE</button></div>
                </div>
            </div>
            
            <div class="card">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                    <img src="assets/sandmine.png" alt="Logo" style="height: 35px; width: auto;">
                    <h3 style="color:#000; margin:0;">📋 Stock Expense List</h3>
                </div>
                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; border:2px solid #333;">
                        <thead>
                            <tr style="background:#f8f9fa;">
                                <th style="padding:10px; border:1px solid #333;">SL</th>
                                <th style="padding:10px; border:1px solid #333;">Date</th>
                                <th style="padding:10px; border:1px solid #333; text-align:left;">Description</th>
                                <th style="padding:10px; border:1px solid #333; text-align:right;">Amount</th>
                                <th style="padding:10px; border:1px solid #333;" class="no-print">Action</th>
                            </tr>
                        </thead>
                        <tbody id="stk-exp-body"></tbody>
                    </table>
                </div>
            </div>
        `;
    },

    saveExpense: function() {
        const date = document.getElementById('stk-exp-date').value;
        const desc = document.getElementById('stk-exp-desc').value.trim();
        const amount = parseFloat(document.getElementById('stk-exp-amount').value) || 0;
        
        if(!desc || amount <= 0) return alert("Provide valid details!");
        
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        App.db.stock_expenses.push({ id: Date.now(), date, desc, amount, ghat: currentGhat });
        App.saveToLocalStorage(); 
        
        document.getElementById('stk-exp-desc').value = ""; 
        document.getElementById('stk-exp-amount').value = ""; 
        this.renderTable();
    },

    renderTable: function() {
        const body = document.getElementById('stk-exp-body'); 
        if(!body) return;
        
        const filterDate = document.getElementById('stk-exp-date')?.value;
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        
        let filtered = (App.db.stock_expenses || []).filter(i => i.ghat === currentGhat && (filterDate ? i.date === filterDate : true));
        let total = 0;
        
        if (filtered.length > 0) {
            body.innerHTML = filtered.map((row, i) => { 
                total += parseFloat(row.amount); 
                return `
                    <tr>
                        <td style="padding:8px; border:1px solid #333; text-align:center;">${i+1}</td>
                        <td style="padding:8px; border:1px solid #333; text-align:center;">${row.date}</td>
                        <td style="padding:8px; border:1px solid #333; font-weight:bold;">${row.desc}</td>
                        <td style="padding:8px; border:1px solid #333; text-align:right; font-weight:bold; color:var(--red);">₹${row.amount.toFixed(2)}</td>
                        <td style="padding:8px; border:1px solid #333; text-align:center;" class="no-print">
                            <button onclick="StockExpensesModule.deleteExpense(${row.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">Del</button>
                        </td>
                    </tr>`; 
            }).join('') + `
                <tr style="background:#e2e8f0; font-weight:900;">
                    <td colspan="3" style="text-align:right; padding:10px; border:1px solid #333;">TOTAL EXPENSE:</td>
                    <td style="text-align:right; padding:10px; border:1px solid #333; color:var(--red);">₹${total.toFixed(2)}</td>
                    <td class="no-print" style="border:1px solid #333;"></td>
                </tr>`;
        } else {
            body.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#7f8c8d;">No Expense Entries Found.</td></tr>`;
        }
    },

    deleteExpense: function(id) {
        if(confirm("Are you sure?")) { 
            App.db.stock_expenses = App.db.stock_expenses.filter(i => i.id !== id); 
            App.saveToLocalStorage(); 
            this.renderTable(); 
        }
    }
};