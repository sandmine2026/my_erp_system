// ==========================================
// MODULE: MINING EXPENSES REGISTER (expenses.js)
// ==========================================
var ExpensesModule = {
    editId: null,

    init: function() {
        this.renderTable();
        const dateInput = document.getElementById('exp_date');
        if(dateInput && !this.editId) dateInput.value = new Date().toISOString().split('T')[0];
    },

    getHTML: function() {
        return `
            <style>
                /* Professional ERP Layout Styles */
                .erp-page-header { background: #ffffff; border-left: 5px solid #e74c3c; padding: 15px 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.04); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px; }
                .erp-page-title { margin: 0; color: #1e293b; font-size: 18px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px; }
                .erp-page-subtitle { margin: 5px 0 0 0; color: #64748b; font-size: 12px; font-weight: bold; }
                
                .erp-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); overflow: hidden; }
                .erp-card-header { background: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 10px; }
                .erp-card-body { padding: 20px; }

                /* Modern Table Styles */
                .erp-table { width: 100%; border-collapse: collapse; text-align: left; }
                .erp-table th { background: #1e293b; color: #ffffff; padding: 14px 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; border-right: 1px solid #334155; }
                .erp-table th:last-child { border-right: none; }
                .erp-table td { padding: 14px 15px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; vertical-align: middle; }
                .erp-table tr:hover { background-color: #f1f5f9; }
                .erp-table tr:last-child td { border-bottom: none; }
                
                /* Action Badges */
                .badge-btn { padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; border: none; transition: 0.2s; text-transform: uppercase; }
                .badge-edit { background: #fef08a; color: #854d0e; }
                .badge-edit:hover { background: #fde047; }
                .badge-delete { background: #fecdd3; color: #be123c; margin-left: 5px; }
                .badge-delete:hover { background: #fda4af; }

                .erp-summary-footer { background: #f8fafc; padding: 15px 20px; border-top: 2px solid #e2e8f0; display: flex; justify-content: flex-end; align-items: center; gap: 15px; }
                .summary-label { font-size: 14px; font-weight: bold; color: #475569; text-transform: uppercase; }
                .summary-value { font-size: 20px; font-weight: 900; color: #e74c3c; background: #fee2e2; padding: 5px 15px; border-radius: 4px; border: 1px solid #fca5a5; }

                /* Print Layout Controls */
                @media screen {
                    .print-only-header { display: none; }
                }
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; color: black; padding: 0; margin: 0; }
                    .erp-card { border: none !important; box-shadow: none !important; margin: 0 !important; }
                    .erp-card-header { display: none !important; }
                    .print-only-header { display: block !important; text-align: center; margin-bottom: 25px; }
                    .erp-table th { background: #1e293b !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .erp-table td { border: 1px solid #cbd5e1; padding: 8px; }
                    .erp-summary-footer { background: white !important; border: none; padding: 10px 0; }
                    .summary-value { background: white !important; border: none; padding: 0; }
                }
            </style>

            <div class="erp-page-header no-print">
                <div>
                    <h2 class="erp-page-title">Expense Management Portal</h2>
                    <p class="erp-page-subtitle">Track and manage daily operational field expenses</p>
                </div>
                <button class="btn-action" onclick="window.print()" style="background: #1e293b; padding: 10px 20px; display: flex; align-items: center; gap: 8px;">
                    🖨️ PRINT RECORD
                </button>
            </div>

            <div class="print-only-header">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <img src="assets/sandmine.png" alt="Logo" style="height: 45px; width: auto; border-radius: 4px;">
                    <h2 id="print-ghat-title" style="font-size: 26px; color: #1e293b !important; margin: 0; font-weight: 900; text-transform: uppercase;">NARICHA SAND MINE</h2>
                </div>
                <h3 style="margin: 8px 0 0 0; font-size: 14px; color: #475569 !important; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #1e293b; display: inline-block; padding-bottom: 5px;">EXPENSE REGISTER REPORT</h3>
            </div>

            <div class="erp-card no-print">
                <div class="erp-card-header" style="border-top: 3px solid #e74c3c;">
                    <span style="font-size: 16px;">💸</span> ENTRY FORM - ADD / EDIT EXPENSE
                </div>
                <div class="erp-card-body form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; align-items: end;">
                    <div>
                        <label>Voucher Date</label>
                        <input type="date" id="exp_date" style="background: #f8fafc;">
                    </div>
                    <div>
                        <label>Expense Head / Purpose</label>
                        <input type="text" id="exp_purpose" placeholder="e.g. Tea, Khadan Rent, Electric">
                    </div>
                    <div>
                        <label>Total Amount (₹)</label>
                        <input type="number" id="exp_amount" placeholder="0.00" step="any" style="font-weight: bold; color: #b91c1c;">
                    </div>
                    <div>
                        <label>Remarks / Paid To</label>
                        <input type="text" id="exp_remarks" placeholder="Optional notes">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="exp-save-btn" class="btn-action" onclick="ExpensesModule.saveEntry()" style="background: #e74c3c; height: 42px; flex: 1; font-weight: 900;">+ SAVE EXPENSE</button>
                        <button id="exp-cancel-btn" class="btn-action" onclick="ExpensesModule.cancelEdit()" style="display: none; background: #64748b; height: 42px; font-weight: 900;">CANCEL</button>
                    </div>
                </div>
            </div>

            <div class="erp-card">
                <div class="erp-card-header no-print" style="border-top: 3px solid #1e293b;">
                    <span style="font-size: 16px;">📊</span> EXPENSE LEDGER BOOK
                </div>
                
                <div class="table-responsive">
                    <table class="erp-table">
                        <thead>
                            <tr>
                                <th style="width: 50px;">SL</th>
                                <th>Date</th>
                                <th>Ghat/Site Name</th>
                                <th>Expense Purpose</th>
                                <th style="text-align: right;">Amount (₹)</th>
                                <th>Remarks</th>
                                <th class="no-print" style="text-align: center; width: 140px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="expense-table-body">
                            <tr><td colspan="7" style="text-align:center; padding: 30px; color:#94a3b8; font-weight: bold;">Loading entries...</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="erp-summary-footer">
                    <div class="summary-label">Grand Total Expenses :</div>
                    <div class="summary-value" id="expense-total-amount">₹0.00</div>
                </div>
            </div>
        `;
    },

    editRow: function(id) {
        const record = App.db.mining_expenses_db.find(item => item.id === id);
        if(!record) return;

        this.editId = id;
        
        document.getElementById('exp_date').value = record.date;
        document.getElementById('exp_purpose').value = record.purpose;
        document.getElementById('exp_amount').value = record.amount;
        document.getElementById('exp_remarks').value = record.remarks || "";

        const saveBtn = document.getElementById('exp-save-btn');
        saveBtn.innerText = "↻ UPDATE EXPENSE";
        saveBtn.style.background = "#f59e0b"; // Amber color
        document.getElementById('exp-cancel-btn').style.display = "block";

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    cancelEdit: function() {
        this.editId = null;
        document.getElementById('exp_date').value = new Date().toISOString().split('T')[0];
        document.getElementById('exp_purpose').value = "";
        document.getElementById('exp_amount').value = "";
        document.getElementById('exp_remarks').value = "";
        
        const saveBtn = document.getElementById('exp-save-btn');
        saveBtn.innerText = "+ SAVE EXPENSE";
        saveBtn.style.background = "#e74c3c";
        document.getElementById('exp-cancel-btn').style.display = "none";
    },

    saveEntry: function() {
        const date = document.getElementById('exp_date').value;
        const purpose = document.getElementById('exp_purpose').value.trim();
        const amount = parseFloat(document.getElementById('exp_amount').value);
        const remarks = document.getElementById('exp_remarks').value.trim() || "NA";
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";

        if (!date || !purpose || isNaN(amount) || amount <= 0) {
            alert("❌ অনুগ্রহ করে সঠিক তারিখ, খরচের কারণ এবং অংক ইনপুট দিন!");
            return;
        }

        const newEntry = {
            id: this.editId ? this.editId : "EXP_" + Date.now(),
            date: date,
            ghat: currentGhat,
            purpose: purpose,
            amount: amount,
            remarks: remarks,
            timestamp: new Date().toISOString()
        };

        if (!App.db.mining_expenses_db) App.db.mining_expenses_db = [];

        if (this.editId) {
            const index = App.db.mining_expenses_db.findIndex(item => item.id === this.editId);
            if (index !== -1) App.db.mining_expenses_db[index] = newEntry;
            this.cancelEdit();
        } else {
            App.db.mining_expenses_db.push(newEntry);
            this.cancelEdit();
        }
        
        App.saveToLocalStorage();
        this.renderTable();
    },

    deleteEntry: function(id) {
        if (confirm("⚠️ আপনি কি নিশ্চিতভাবে এই খরচের এন্ট্রিটি ডিলিট করতে চান?")) {
            App.db.mining_expenses_db = App.db.mining_expenses_db.filter(item => item.id !== id);
            App.saveToLocalStorage();
            this.renderTable();
        }
    },

    renderTable: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        const tbody = document.getElementById('expense-table-body');
        const totalEl = document.getElementById('expense-total-amount');
        const printGhatTitle = document.getElementById('print-ghat-title');
        
        if (!tbody) return;

        // 🔹 ডাইনামিক ঘাটের নাম প্রিন্ট হেডারে আপডেট করা
        if (printGhatTitle) {
            printGhatTitle.innerText = currentGhat.toUpperCase();
        }

        const filteredData = (App.db.mining_expenses_db || []).filter(item => item.ghat === currentGhat);
        filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8; font-weight:bold;">কোনো খরচের রেকর্ড পাওয়া যায়নি।</td></tr>`;
            if (totalEl) totalEl.innerText = "₹0.00";
            return;
        }

        let html = "";
        let grandTotal = 0;

        filteredData.forEach((item, index) => {
            grandTotal += item.amount;
            
            let formattedDate = item.date;
            try {
                const parts = item.date.split('-');
                if(parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            } catch(e) {}

            html += `
                <tr>
                    <td style="font-weight:bold; color:#64748b;">${index + 1}</td>
                    <td style="font-weight:900; color:#0f172a;">${formattedDate}</td>
                    <td><span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; color:#475569; border:1px solid #e2e8f0;">${item.ghat}</span></td>
                    <td style="font-weight: bold; color: #1e293b;">${item.purpose}</td>
                    <td style="font-weight: 900; color: #b91c1c; text-align: right;">₹${item.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td style="color: #64748b;">${item.remarks}</td>
                    <td class="no-print" style="text-align: center;">
                        <button class="badge-btn badge-edit" onclick="ExpensesModule.editRow('${item.id}')">Edit</button>
                        <button class="badge-btn badge-delete" onclick="ExpensesModule.deleteEntry('${item.id}')">Del</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        if (totalEl) totalEl.innerText = "₹" + grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2});
    }
};
