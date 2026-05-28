// ==========================================
// MODULE: PRODUCTION EXPENSES (production_expenses.js)
// ==========================================
const ProductionExpenseModule = {
    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.pe-date-input').forEach(el => el.value = today);
        document.getElementById('pe_l_from').value = today.substring(0, 8) + '01'; 
        
        if(!App.db.prod_expenses_db) App.db.prod_expenses_db = [];
        
        this.updateCategoryFilter(); // ফিল্টার আপডেট
        this.switchInternalTab('entry');
    },

    getHTML: function() {
        return `
            <style>
                .pe-nav { display:flex; gap:10px; margin-bottom:20px; border-bottom: 2px solid #ddd; padding-bottom:10px; overflow-x: auto; }
                .pe-tab-btn { background:#ecf0f1; border:none; padding:10px 20px; font-weight:bold; cursor:pointer; border-radius:6px; color:#2c3e50; white-space: nowrap; }
                .pe-tab-btn.active { background:#d35400; color:white; }
                .pe-page { display:none; }
                .pe-dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
                .pe-stat-card { background: white; padding: 15px; border-radius: 10px; text-align: center; border-bottom: 4px solid #d35400; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .pe-stat-card h4 { margin: 0; color: #7f8c8d; font-size: 11px; text-transform: uppercase; }
                .pe-stat-card h2 { margin: 8px 0 0; color: #d35400; font-size: 20px; }
            </style>

            <div class="card no-print" style="padding-bottom:10px; margin-bottom:15px; border-top-color:#d35400;">
                <div class="pe-nav">
                    <button class="pe-tab-btn active" id="btn-pe-entry" onclick="ProductionExpenseModule.switchInternalTab('entry')">📝 Expense Entry</button>
                    <button class="pe-tab-btn" id="btn-pe-dash" onclick="ProductionExpenseModule.switchInternalTab('dash')">📊 Dashboard</button>
                    <button class="pe-tab-btn" id="btn-pe-ledger" onclick="ProductionExpenseModule.switchInternalTab('ledger')">📋 Report</button>
                </div>
            </div>

            <div id="pe-entry-page" class="pe-page card" style="border-top-color:#d35400;">
                <h3 style="color:#d35400; margin-top:0;">💸 Add Production Expense</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: end;">
                    <div><label>Date</label><input type="date" id="pe_date" class="pe-date-input"></div>
                    <div>
                        <label>Expense Category</label>
                        <input type="text" id="pe_category" list="pe_cat_list" placeholder="Select or type new category...">
                        <datalist id="pe_cat_list">
                            <option value="Labour (লেবার)"></option>
                            <option value="Land Lease (জমি লিজ)"></option>
                            <option value="Straw / Khor (খড়)"></option>
                            <option value="Talpata (তালপাতা)"></option>
                            <option value="Brick Slag (ইট স্লাগ)"></option>
                        </datalist>
                    </div>
                    <div><label>Amount (₹)</label><input type="number" id="pe_amount" value="0"></div>
                    <div><label>Remarks / Description</label><input type="text" id="pe_remarks" placeholder="Optional notes..."></div>
                    <button class="btn-action" style="background:#d35400;" onclick="ProductionExpenseModule.saveExpense()">SAVE EXPENSE</button>
                </div>
            </div>

            <div id="pe-dash-page" class="pe-page card" style="border-top-color:#d35400;">
                <h3 style="color:#d35400; margin-top:0;">📊 Expenses Dashboard</h3>
                <div class="no-print" style="display:flex; gap:10px; margin-bottom:20px; align-items:end;">
                    <div><label>From Date</label><input type="date" id="pe_dash_from" class="pe-date-input"></div>
                    <div><label>To Date</label><input type="date" id="pe_dash_to" class="pe-date-input"></div>
                    <button onclick="ProductionExpenseModule.updateDashboard()" class="btn-action" style="background:#1e3a5f;">Filter Data</button>
                </div>
                <div class="pe-dash-grid" id="pe-dash-cards"></div>
            </div>

            <div id="pe-ledger-page" class="pe-page card" style="border-top-color:#d35400;">
                <div class="no-print" style="display:flex; gap:10px; margin-bottom:20px; align-items:end; background:#eef2f7; padding:15px; border-radius:8px; flex-wrap:wrap;">
                    <div style="flex:1">
                        <label>Filter Category</label>
                        <select id="pe_l_category">
                            </select>
                    </div>
                    <div style="flex:1"><label>From</label><input type="date" id="pe_l_from" class="pe-date-input"></div>
                    <div style="flex:1"><label>To</label><input type="date" id="pe_l_to" class="pe-date-input"></div>
                    <button onclick="ProductionExpenseModule.loadLedger()" class="btn-action" style="background:#1e3a5f;">View</button>
                    <button onclick="window.print()" class="btn-action" style="background:#c0392b;">🖨️ Print</button>
                </div>
                
                <div id="pe-ledger-view" style="display:none;">
                    <h2 id="pe-ledger-title" style="text-align:center; color:#d35400; border-bottom:2px solid #d35400; padding-bottom:10px;">PRODUCTION EXPENSES REPORT</h2>
                    <div class="table-responsive" id="pe-ledger-content" style="margin-top:20px;"></div>
                </div>
            </div>
        `;
    },

    switchInternalTab: function(tab) {
        document.querySelectorAll('.pe-page').forEach(div => div.style.display = 'none');
        document.getElementById('pe-' + tab + '-page').style.display = 'block';
        document.querySelectorAll('.pe-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-pe-' + tab).classList.add('active');
        
        if(tab === 'dash') this.updateDashboard();
        if(tab === 'ledger') {
            this.updateCategoryFilter();
            this.loadLedger();
        }
    },

    updateCategoryFilter: function() {
        const filterSelect = document.getElementById('pe_l_category');
        if(!filterSelect) return;
        
        // সব ইউনিক ক্যাটাগরি ডাটাবেস থেকে কালেক্ট করা হচ্ছে
        const uniqueCategories = [...new Set((App.db.prod_expenses_db || []).map(i => i.category))];
        
        // ডিফল্ট ক্যাটাগরিগুলোও লিস্টে রাখা হচ্ছে
        const defaultCategories = ["Labour (লেবার)", "Land Lease (জমি লিজ)", "Straw / Khor (খড়)", "Talpata (তালপাতা)", "Brick Slag (ইট স্লাগ)"];
        const combinedCategories = [...new Set([...defaultCategories, ...uniqueCategories])];

        let optionsHtml = `<option value="ALL">-- ALL CATEGORIES --</option>`;
        combinedCategories.forEach(cat => {
            optionsHtml += `<option value="${cat}">${cat}</option>`;
        });
        
        filterSelect.innerHTML = optionsHtml;
    },

    saveExpense: function() {
        const cat = document.getElementById('pe_category').value.trim();
        const amt = parseFloat(document.getElementById('pe_amount').value) || 0;
        
        if(!cat) return alert("Please specify or select an expense category!");
        if(amt <= 0) return alert("Enter a valid amount!");

        App.db.prod_expenses_db.push({
            id: Date.now(),
            date: document.getElementById('pe_date').value,
            category: cat,
            amount: amt,
            remarks: document.getElementById('pe_remarks').value.trim()
        });
        
        App.saveToLocalStorage();
        alert("Expense Saved Successfully!");
        
        document.getElementById('pe_category').value = '';
        document.getElementById('pe_amount').value = '0';
        document.getElementById('pe_remarks').value = '';
        
        this.updateCategoryFilter(); // ফিল্টার ড্রপডাউন আপডেট করা হচ্ছে
    },

    updateDashboard: function() {
        const from = document.getElementById('pe_dash_from').value;
        const to = document.getElementById('pe_dash_to').value;
        
        let filtered = (App.db.prod_expenses_db || []).filter(i => i.date >= from && i.date <= to);
        let categoryTotals = {};
        let totalExp = 0;

        filtered.forEach(item => {
            if(!categoryTotals[item.category]) categoryTotals[item.category] = 0;
            categoryTotals[item.category] += item.amount;
            totalExp += item.amount;
        });

        let html = `<div class="pe-stat-card" style="background:#fdf2e9;"><h4>Total Expenses</h4><h2 style="color:#d35400; font-size:26px;">₹${totalExp.toFixed(0)}</h2></div>`;
        
        for(let cat in categoryTotals) {
            html += `<div class="pe-stat-card"><h4>${cat}</h4><h2>₹${categoryTotals[cat].toFixed(0)}</h2></div>`;
        }

        document.getElementById('pe-dash-cards').innerHTML = html;
    },

    loadLedger: function() {
        const cat = document.getElementById('pe_l_category').value;
        const from = document.getElementById('pe_l_from').value;
        const to = document.getElementById('pe_l_to').value;
        
        let data = (App.db.prod_expenses_db || []).filter(i => i.date >= from && i.date <= to);
        
        if (cat !== 'ALL') {
            data = data.filter(i => i.category === cat);
            document.getElementById('pe-ledger-title').innerText = `EXPENSES REPORT: ${cat.toUpperCase()}`;
        } else {
            document.getElementById('pe-ledger-title').innerText = `ALL PRODUCTION EXPENSES`;
        }

        data.sort((a,b) => new Date(a.date) - new Date(b.date));
        
        document.getElementById('pe-ledger-view').style.display = 'block';
        
        let total = 0;
        let tableHtml = `<table class="d-table" style="width:100%; border:1px solid #ddd; text-align:left;">
            <tr style="background:#d35400; color:white;">
                <th style="padding:10px;">Date</th>
                <th>Category</th>
                <th>Remarks</th>
                <th style="text-align:right; padding-right:10px;">Amount (₹)</th>
                <th class="no-print" style="text-align:center;">Action</th>
            </tr>`;

        data.forEach(item => {
            total += item.amount;
            tableHtml += `<tr>
                <td style="padding:10px;">${item.date.split('-').reverse().join('-')}</td>
                <td style="font-weight:bold; color:#d35400;">${item.category}</td>
                <td>${item.remarks || '-'}</td>
                <td style="text-align:right; padding-right:10px; font-weight:bold;">₹${item.amount.toFixed(0)}</td>
                <td class="no-print" style="text-align:center;">
                    <button onclick="ProductionExpenseModule.deleteExpense(${item.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">X</button>
                </td>
            </tr>`;
        });

        tableHtml += `<tr style="background:#fdf2e9; font-weight:bold; font-size:16px;">
            <td colspan="3" style="text-align:right; padding:12px;">Total Expenses:</td>
            <td style="text-align:right; padding-right:10px; color:#d35400;">₹${total.toFixed(0)}</td>
            <td class="no-print"></td>
        </tr></table>`;

        document.getElementById('pe-ledger-content').innerHTML = tableHtml;
    },

    deleteExpense: function(id) {
        if(confirm("Are you sure you want to delete this expense entry?")) {
            App.db.prod_expenses_db = App.db.prod_expenses_db.filter(i => i.id !== id);
            App.saveToLocalStorage();
            this.loadLedger();
        }
    }
};