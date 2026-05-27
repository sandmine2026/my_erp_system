// ==========================================
// MODULE: MINING EXPENSES REGISTER (expenses.js)
// ==========================================
var ExpensesModule = {
    init: function() {
        this.renderTable();
        // ডিফল্টভাবে আজকের তারিখ সেট করা
        const dateInput = document.getElementById('exp_date');
        if(dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    },

    getHTML: function() {
        return `
            <style>
                /* প্রিন্ট ও ডিসপ্লে টেবিল হেডারের ইউনিক কালার স্টাইল */
                .unique-table th {
                    background: linear-gradient(135deg, #1e3a5f 0%, #2c3e50 100%) !important;
                    color: #ffffff !important;
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 13px;
                    letter-spacing: 0.5px;
                    padding: 12px 10px;
                    border: 1px solid #34495e !important;
                }
                .unique-table td {
                    padding: 10px;
                    border: 1px solid #e2e8f0;
                }
                .unique-table tr:nth-child(even) {
                    background-color: #f8fafc;
                }
                
                /* প্রিন্ট ফরম্যাটিং স্টাইল */
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; color: black; padding: 0; margin: 0; }
                    .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
                    .unique-table th {
                        background: #1e3a5f !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print-header-title {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .print-header-title h2 {
                        font-size: 24px;
                        color: #1e3a5f !important;
                        margin: 0;
                        font-weight: bold;
                    }
                }
            </style>

            <div class="print-header-title" style="display: none; justify-content: center; align-items: center; gap: 10px;">
                <h2>📊 EXPENSE REGISTER REPORT</h2>
            </div>

            <div class="card no-print" style="border-top-color: #e74c3c; margin-bottom: 20px;">
                <h3 style="color: #e74c3c; margin-top: 0; margin-bottom: 15px;">💸 Add New Expense</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; align-items: end;">
                    <div>
                        <label>Date</label>
                        <input type="date" id="exp_date">
                    </div>
                    <div>
                        <label>Expense Head / Purpose</label>
                        <input type="text" id="exp_purpose" placeholder="e.g. Tea, Khadan Rent, Electric">
                    </div>
                    <div>
                        <label>Amount (₹)</label>
                        <input type="number" id="exp_amount" placeholder="0.00">
                    </div>
                    <div>
                        <label>Paid To / Remarks</label>
                        <input type="text" id="exp_remarks" placeholder="Optional remarks">
                    </div>
                    <button class="btn-action" onclick="ExpensesModule.saveEntry()" style="background: #e74c3c; height: 42px;">SAVE EXPENSE</button>
                </div>
            </div>

            <div class="card" style="border-top-color: #1e3a5f;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                    <h3 style="color: #1e3a5f; margin: 0;" id="expense-title-text">📊 EXPENSE REGISTER BOOK</h3>
                    <button class="btn-action no-print" onclick="window.print()" style="background: #34495e; width: auto; padding: 8px 15px;">🖨️ PRINT REPORT</button>
                </div>
                
                <div class="table-responsive">
                    <table class="unique-table" style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr>
                                <th>Sl No</th>
                                <th>Date</th>
                                <th>Ghat Name</th>
                                <th>Expense Purpose</th>
                                <th>Amount (₹)</th>
                                <th>Paid To / Remarks</th>
                                <th class="no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="expense-table-body">
                            <tr><td colspan="7" style="text-align:center; color:#94a3b8;">Loading entries...</td></tr>
                        </tbody>
                        <tfoot>
                            <tr style="background: #e2e8f0; font-weight: bold; border-top: 2px solid #1e3a5f;">
                                <td colspan="4" style="text-align: right; padding: 12px 10px;">GRAND TOTAL:</td>
                                <td id="expense-total-amount" style="color: #e74c3c; padding: 12px 10px;">₹0.00</td>
                                <td colspan="2" class="no-print"></td>
                                <td class="only-print" style="display:none;"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
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
            id: "EXP_" + Date.now(),
            date: date,
            ghat: currentGhat,
            purpose: purpose,
            amount: amount,
            remarks: remarks,
            timestamp: new Date().toISOString()
        };

        if (!App.db.mining_expenses_db) App.db.mining_expenses_db = [];
        App.db.mining_expenses_db.push(newEntry);
        
        App.saveToLocalStorage();
        alert("✅ খরচ সফলভাবে সেভ হয়েছে!");
        
        // ইনপুট ফিল্ড ক্লিয়ার করা
        document.getElementById('exp_purpose').value = "";
        document.getElementById('exp_amount').value = "";
        document.getElementById('exp_remarks').value = "";
        
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
        
        if (!tbody) return;

        // বর্তমান ঘাটের ডাটা ফিল্টার করা
        const filteredData = (App.db.mining_expenses_db || []).filter(item => item.ghat === currentGhat);

        // তারিখ অনুযায়ী সর্টিং (নতুন এন্ট্রি আগে আসবে)
        filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#94a3b8;">কোনো খরচের রেকর্ড পাওয়া যায়নি।</td></tr>`;
            if (totalEl) totalEl.innerText = "₹0.00";
            return;
        }

        let html = "";
        let grandTotal = 0;

        filteredData.forEach((item, index) => {
            grandTotal += item.amount;
            
            // ডেট ফরম্যাট করা (DD/MM/YYYY)
            let formattedDate = item.date;
            try {
                const parts = item.date.split('-');
                if(parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            } catch(e) {}

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><b>${formattedDate}</b></td>
                    <td style="color: #475569; font-weight: 600;">${item.ghat}</td>
                    <td style="font-weight: 600; color: #1e293b;">${item.purpose}</td>
                    <td style="font-weight: bold; color: #b91c1c;">₹${item.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td style="color: #64748b; font-style: italic;">${item.remarks}</td>
                    <td class="no-print">
                        <button onclick="ExpensesModule.deleteEntry('${item.id}')" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:11px;">✖ DELETE</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        if (totalEl) totalEl.innerText = "₹" + grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2});
    }
};