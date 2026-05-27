

            // 🔹 ১. স্টক এক্সপেন্স (খরচ) ডাইনামিক রেন্ডারিং
            let expRowsHtml = ""; let totalExpSum = 0;
            let expenseTableHTML = "";
            if (dayExpenses.length > 0) {
                dayExpenses.forEach((row, i) => {
                    totalExpSum += parseFloat(row.amount || 0);
                    expRowsHtml += `
                        <tr>
                            <td style="border:1px solid #000; padding:4px; text-align:center; font-size:11px;">${i+1}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; font-size:12px;">${row.purpose || row.desc || 'Expense'}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:right; padding-right:15px; font-weight:bold; width:150px; color:#000; font-size:11px;">₹${parseFloat(row.amount||0).toFixed(2)}</td>
                        </tr>`;
                });
                
                expenseTableHTML = `
                    <div style="width: 100%; margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
                            <thead>
                                <tr style="background: #f2f2f2 !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <th style="width:50px; border:1px solid #000; padding:8px; font-size:12px; text-align:center;">SL</th>
                                    <th style="border:1px solid #000; padding:8px; font-size:14px; text-align:center; font-weight:900;">খরচ</th>
                                    <th style="width:150px; border:1px solid #000; padding:8px; font-size:12px; text-align:right; padding-right:15px;">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${expRowsHtml}
                                <tr style="font-weight: bold; background: #f2f2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <td colspan="2" style="text-align: right; padding-right: 15px; border: 1px solid #000; font-size:11px; padding:5px;">TOTAL STOCK EXPENSE:</td>
                                    <td style="border:1px solid #000; font-size:11px; padding:5px; text-align:right; padding-right:15px; font-weight:900;">₹${totalExpSum.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            }

            // 🔹 ২. অনলাইন পেমেন্ট ডাইনামিক রেন্ডারিং
            let onlineTableHTML = "";
            if (totalOnlinePaySum > 0) {
                onlineTableHTML = `
                    <div style="width: 100%; margin-bottom: 20px;">
                        <h4 style="background:#1e3a5f !important; color:white !important; padding:6px; margin:0; border:2px solid #000; border-bottom:none; font-size:11px; text-transform:uppercase; text-align:center; -webkit-print-color-adjust: exact; print-color-adjust: exact;">💰 ONLINE TRANSACTIONS</h4>
                        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
                            <thead>
                                <tr style="background: #e2e8f0 !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <th style="width:50px; border:1px solid #333; padding:8px; font-size:11px; text-align:center;">SL</th>
                                    <th style="width:180px; border:1px solid #333; padding:8px; font-size:11px; text-align:center;">TRUCK NO</th>
                                    <th style="width:200px; border:1px solid #333; padding:8px; font-size:11px; text-align:center;">BANK / UPI ACCOUNT</th>
                                    <th style="border:1px solid #333; padding:8px; font-size:11px; text-align:right; padding-right:15px;">ONLINE RECEIVED</th>
                                    <th style="width:150px; border:1px solid #333; padding:6px; font-size:11px; text-align:center;">PHONE EX (1%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${onlineCollectionRowsHtml}
                                <tr style="font-weight: bold; background: #cbd5e1 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <td colspan="3" style="text-align: right; padding-right: 15px; border: 1px solid #333; font-size:11px; padding:5px;">TOTAL ONLINE COLLECTION:</td>
                                    <td style="border: 1px solid #333; font-size:11px; padding:5px; text-align:right; padding-right:15px; font-weight:900; color:#27ae60;">₹${totalOnlinePaySum.toFixed(2)}</td>
                                    <td style="border: 1px solid #333; font-size:11px; padding:5px; text-align:center; font-weight:900; color:#e67e22;">₹${totalOnlineExSum.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            }

            // 🔹 ৩. মেশিন ব্রেকডাউন ডাইনামিক রেন্ডারিং (সেন্টার এবং ব্লু হেডার)
            let dynamicMachineTablesHtml = "";
            let machineCountForHide = 0;
            for (let mac in machineSummaryData) {
                machineCountForHide++;
                let macData = machineSummaryData[mac];
                let breakdownString = [];
                for (let wh in macData.wheelBreakdown) {
                    breakdownString.push(`${macData.wheelBreakdown[wh]} ${wh}`);
                }

                dynamicMachineTablesHtml += `
                    <div style="width: 100%; margin-bottom: 15px; display: block; page-break-inside: avoid;">
                        <table style="width: 100%; border-collapse: collapse; border: 2px solid #1e3a5f;">
                            <thead>
                                <tr>
                                    <th colspan="3" style="background: #1e3a5f !important; color: white !important; border: 1px solid #1e3a5f; padding: 10px; font-size: 13px; text-align: center; font-weight: 800; letter-spacing: 1px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                        ⚙️ MACHINE LOADING BREAKDOWN: <span style="color:#f39c12 !important;">${mac}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border: 1px solid #1e3a5f; padding: 6px; font-weight: bold; font-size:11px; width:33%; text-align: center;">Total Trucks: ${macData.totalTrucks}</td>
                                    <td style="border: 1px solid #1e3a5f; padding: 6px; font-weight: bold; color: #333; font-size:11px; text-align: center; width:33%;">[ ${breakdownString.join(' | ')} ]</td>
                                    <td style="border: 1px solid #1e3a5f; padding: 6px; font-weight: 900; text-align: center; font-size:12px; color: #16a085; width:33%;">EARNED: ₹${macData.totalLoadCash.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>`;
            }

            // 🔹 ম্যানুয়াল এন্ট্রি
            let manualRowsHtml = ""; let totalManualSum = 0;
            dayManuals.forEach((row, i) => {
                totalManualSum += parseFloat(row.amount || 0);
                manualRowsHtml += `
                    <tr>
                        <td style="border:1px solid #000; padding:4px; text-align:center; font-size:11px;">${i+1}</td>
                        <td style="border:1px solid #000; padding:4px; text-align:left; padding-left:15px; font-weight:bold; font-size:11px;">${row.desc || 'Manual Entry'}</td>
                        <td style="border:1px solid #000; padding:4px; text-align:right; padding-right:15px; font-weight:bold; width:150px; color:#000; font-size:11px;">₹${parseFloat(row.amount||0).toFixed(2)}</td>
                    </tr>`;
            });

            let cashInHand = (totalNetAmount - totalOnlinePaySum) - totalExpSum + totalManualSum;

            printExpenseSection.innerHTML = `
                <div style="margin-top: 30px; width: 100%; box-sizing: border-box; font-family: sans-serif; display: block; clear: both;">
                    <style>
                        @media print {
                            .empty-hide-machine { display: ${machineCountForHide > 0 ? 'block' : 'none !important'}; }
                        }
                    </style>

                    <h3 style="text-align: center; margin-bottom: 15px; color: #000; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; border-bottom: 2px dashed #000; padding-bottom: 5px;">STOCK EXPENSES & CASH SUMMARY</h3>
                    
                    <div class="empty-hide-machine" style="width: 100%; margin-bottom: 20px; display: block;">
                        ${dynamicMachineTablesHtml}
                    </div>

                    ${onlineTableHTML}
                    ${expenseTableHTML}

                    <div style="display: flex; gap: 15px; width: 100%; box-sizing: border-box; clear: both;">
                        <div style="flex: 1; background: white; border: 1px solid #000; padding: 10px;">
                            <h4 style="margin:0 0 10px 0; color:#000; font-size:11px; text-transform:uppercase; font-weight:800; text-align:center;">ROYALTY & TAX SUMMARY</h4>
                            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
                                <thead>
                                    <tr style="background:#f2f2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;"><th style="border: 1px solid #000; padding:4px; font-size:10px;">HEAD</th><th style="border: 1px solid #000; padding:4px; font-size:10px;">AMOUNT</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td style="text-align:left; padding:5px; font-size:10px; border: 1px solid #000;">Total Royalty (on ${totalCft} CFT)</td><td style="text-align:right; font-weight:bold; padding-right:8px; font-size:10px; border: 1px solid #000;">₹${totalRtAmount.toFixed(2)}</td></tr>
                                    <tr><td style="text-align:left; padding:5px; font-size:10px; border: 1px solid #000;">Total GST (5%)</td><td style="text-align:right; font-weight:bold; padding-right:8px; font-size:10px; border: 1px solid #000;">₹${totalGst.toFixed(2)}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="flex: 1; background: white; border: 1px solid #000; padding: 10px;">
                            <h4 style="margin:0 0 10px 0; color:#000; font-size:11px; text-transform:uppercase; font-weight:800; text-align:center;">MANUAL ADJUSTMENTS / EXTRA INFLOW</h4>
                            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
                                <thead>
                                    <tr style="background:#f2f2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;"><th style="border: 1px solid #000; padding:4px; font-size:10px;">DETAILS</th><th style="border: 1px solid #000; padding:4px; font-size:10px;">AMOUNT</th></tr>
                                </thead>
                                <tbody>
                                    ${manualRowsHtml || '<tr><td colspan="2" style="color:#000; font-size:10px; padding:6px; border: 1px solid #000; text-align:center;">No manual entries.</td></tr>'}
                                    <tr style="font-weight:bold; background:#f2f2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                        <td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">TOTAL EXTRA:</td>
                                        <td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000;">₹${totalManualSum.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="flex: 1; background: white; border: 1px solid #000; padding: 10px;">
                            <h4 style="margin:0 0 10px 0; color:#000; font-size:11px; text-transform:uppercase; font-weight:800; text-align:center;">CASH IN HAND (অবশিষ্ট নিট ক্যাশ)</h4>
                            <table style="border-collapse: collapse; border: 2px solid #000; background: #ffffff; width:100%;">
                                <tbody>
                                    <tr><td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">Total Stock Net Balance</td><td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000; font-weight:bold;">₹${totalNetAmount.toFixed(2)}</td></tr>
                                    <tr><td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">Online Payments (-)</td><td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000; font-weight:bold; color:#e74c3c;">₹${totalOnlinePaySum.toFixed(2)}</td></tr>
                                    <tr><td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">Total Stock Expense (-)</td><td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000; font-weight:bold; color:#e74c3c;">₹${totalExpSum.toFixed(2)}</td></tr>
                                    <tr><td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">Manual Adjust Total (+)</td><td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000; font-weight:bold; color:#27ae60;">₹${totalManualSum.toFixed(2)}</td></tr>
                                    <tr style="font-weight:900; background:#d4efdf !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                        <td style="text-align:left; padding:6px; font-size:11px; font-weight:900; border: 1px solid #000;">CASH IN HAND</td>
                                        <td style="font-size:12px; text-align:right; padding-right:8px; font-weight:900; border: 1px solid #000; color: #1e8449;">₹${cashInHand.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
        }
    },

    deleteRow: function(id) {
        if(confirm("Are you sure you want to delete this record?")) {
            App.db.stock_ledger = App.db.stock_ledger.filter(item => item.id !== id);
            App.saveToLocalStorage();
            this.renderTable();
        }
    }
};

// ==========================================
// MODULE 2: STOCK EXPENSES
// ==========================================
const StockExpensesModule = {
    init: function() { const today = new Date().toISOString().split('T')[0]; if(document.getElementById('stk-exp-date')) document.getElementById('stk-exp-date').value = today; this.renderTable(); },
    getHTML: function() {
        return `
            <div class="card no-print" style="border-top-color: var(--red);">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><img src="assets/sandmine.png" alt="Logo" style="height: 35px; width: auto;"><h3 style="color:var(--red); margin:0;">💸 Stock Expense Entry</h3></div>
                <div class="form-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; align-items:end;">
                    <div><label>Date</label><input type="date" id="stk-exp-date" onchange="StockExpensesModule.renderTable()"></div>
                    <div><label>Description</label><input type="text" id="stk-exp-desc" placeholder="Expense Details..."></div>
                    <div><label>Amount (₹)</label><input type="number" id="stk-exp-amount" placeholder="0"></div>
                    <div><button class="btn-action" style="background:var(--red); width:100%;" onclick="StockExpensesModule.saveExpense()">SAVE EXPENSE</button></div>
                </div>
            </div>
            <div class="card">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><img src="assets/sandmine.png" alt="Logo" style="height: 35px; width: auto;"><h3 style="color:#000; margin:0;">📋 Stock Expense List</h3></div>
                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; border:2px solid #333;">
                        <thead><tr style="background:#f8f9fa;"><th style="padding:10px; border:1px solid #333;">SL</th><th style="padding:10px; border:1px solid #333;">Date</th><th style="padding:10px; border:1px solid #333; text-align:left;">Description</th><th style="padding:10px; border:1px solid #333; text-align:right;">Amount</th><th style="padding:10px; border:1px solid #333;" class="no-print">Action</th></tr></thead>
                        <tbody id="stk-exp-body"></tbody>
                    </table>
                </div>
            </div>`;
    },
    saveExpense: function() {
        const date = document.getElementById('stk-exp-date').value, desc = document.getElementById('stk-exp-desc').value.trim(), amount = parseFloat(document.getElementById('stk-exp-amount').value) || 0;
        if(!desc || amount <= 0) return alert("Provide valid details!");
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        App.db.stock_expenses.push({ id: Date.now(), date, desc, amount, ghat: currentGhat });
        App.saveToLocalStorage(); document.getElementById('stk-exp-desc').value = ""; document.getElementById('stk-exp-amount').value = ""; this.renderTable();
    },
    renderTable: function() {
        const body = document.getElementById('stk-exp-body'); if(!body) return;
        const filterDate = document.getElementById('stk-exp-date')?.value, currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        let filtered = (App.db.stock_expenses || []).filter(i => i.ghat === currentGhat && (filterDate ? i.date === filterDate : true));
        let total = 0;
        body.innerHTML = filtered.length > 0 ? filtered.map((row, i) => { total += parseFloat(row.amount); return `<tr><td style="padding:8px; border:1px solid #333; text-align:center;">${i+1}</td><td style="padding:8px; border:1px solid #333; text-align:center;">${row.date}</td><td style="padding:8px; border:1px solid #333; font-weight:bold;">${row.desc}</td><td style="padding:8px; border:1px solid #333; text-align:right; font-weight:bold; color:var(--red);">₹${row.amount.toFixed(2)}</td><td style="padding:8px; border:1px solid #333; text-align:center;" class="no-print"><button onclick="StockExpensesModule.deleteExpense(${row.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">Del</button></td></tr>`; }).join('') + `<tr style="background:#e2e8f0; font-weight:900;"><td colspan="3" style="text-align:right; padding:10px; border:1px solid #333;">TOTAL EXPENSE:</td><td style="text-align:right; padding:10px; border:1px solid #333; color:var(--red);">₹${total.toFixed(2)}</td><td class="no-print" style="border:1px solid #333;"></td></tr>` : `<tr><td colspan="5" style="padding:20px; text-align:center; color:#7f8c8d;">No Expense Entries Found.</td></tr>`;
    },
    deleteExpense: function(id) {
        if(confirm("Are you sure?")) { App.db.stock_expenses = App.db.stock_expenses.filter(i => i.id !== id); App.saveToLocalStorage(); this.renderTable(); }
    }
};

// ==========================================
// MODULE 3: STOCK VEHICLE PANEL
// ==========================================
const StockVehicleModule = {
    editID: null,
    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.sv-date-input').forEach(el => el.value = today);
        this.updateAutoSuggest(); this.switchInternalTab('dash');
    },
    getTripRate: function(wheel) { if(wheel.includes("12")) return 1100; if(wheel.includes("10")) return 1000; if(wheel.includes("6")) return 800; if(wheel.includes("14")) return 1200; return 1000; },
    getHTML: function() {
        return `
            <style>
                .sv-nav { display:flex; gap:10px; margin-bottom:20px; border-bottom: 2px solid #ddd; padding-bottom:10px; overflow-x: auto; }
                .sv-tab-btn { background:#ecf0f1; border:none; padding:10px 20px; font-weight:bold; cursor:pointer; border-radius:6px; color:#2c3e50; white-space: nowrap; }
                .sv-tab-btn.active { background:var(--p-color); color:white; }
                .sv-page { display:none; }
                .sv-sum-grid { display: flex; gap: 10px; margin-bottom: 15px; width: 100%; flex-wrap: wrap; }
                .sv-sum-card { flex: 1; min-width: 110px; padding: 15px 5px; border-radius: 8px; color: white !important; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .sv-sum-card span { display: block; font-size: 10px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                .sv-sum-card strong { font-size: 17px; display: block; }
                .sv-full-card { width: 100%; margin-top: 10px; padding: 15px; background: #1b5e20 !important; color: white !important; border-radius: 8px; text-align: center; }
                .sv-full-card span { display: block; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
                .sv-full-card strong { font-size: 22px; }
                .bal-pos { color: #27ae60 !important; font-weight: 800; }
                .bal-neg { color: #e74c3c !important; font-weight: 800; }
                @media print { .sv-nav, .no-print { display: none !important; } .sv-sum-card, .sv-full-card { border: 1px solid #ddd; } .bal-pos, .bal-neg { color: #000 !important; font-weight: bold !important; } }
            </style>
            <div class="card no-print" style="padding-bottom:10px; margin-bottom:15px;">
                <div class="sv-nav">
                    <button class="sv-tab-btn active" id="btn-sv-dash" onclick="StockVehicleModule.switchInternalTab('dash')">📊 Dashboard</button>
                    <button class="sv-tab-btn" id="btn-sv-entry" onclick="StockVehicleModule.switchInternalTab('entry')">📝 Daily Entry</button>
                    <button class="sv-tab-btn" id="btn-sv-owner" onclick="StockVehicleModule.switchInternalTab('owner')">🤝 Owner Reg.</button>
                    <button class="sv-tab-btn" id="btn-sv-ledger" onclick="StockVehicleModule.switchInternalTab('ledger')">📋 Ledger Report</button>
                </div>
            </div>
            <div id="sv-dash-page" class="sv-page card"><h3 style="color:var(--p-color); margin-top:0;">📊 Vehicle Dashboard Overview</h3><div class="no-print form-grid" style="display:flex; gap:10px; margin-bottom:20px; align-items:end; background:#eef2f7; padding:15px; border-radius:8px; flex-wrap: wrap;"><div style="flex:1"><label>From Date</label><input type="date" id="sv_dash_f_date" class="sv-date-input"></div><div style="flex:1"><label>To Date</label><input type="date" id="sv_dash_t_date" class="sv-date-input"></div><button onclick="StockVehicleModule.updateDashboard()" class="btn-action" style="background:#1e3a5f;">Filter</button></div><div id="sv-dash-container"></div></div>
            <div id="sv-entry-page" class="sv-page card"><h3 id="sv-entry-title" style="color:var(--p-color); margin-top:0;">📝 Daily Trip & Diesel Entry</h3><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; align-items:end;"><div><label>Date</label><input type="date" id="sv_date" class="sv-date-input"></div><div><label>Vehicle No</label><input type="text" id="sv_v_no" list="sv_v_list" onchange="StockVehicleModule.fetchOwner()" style="text-transform:uppercase;"></div><div><label>Owner Name</label><input type="text" id="sv_owner_name_auto" readonly style="background:#eee"></div><div><label>Wheel</label><select id="sv_wheel"><option>6 Wheel</option><option selected>10 Wheel</option><option>12 Wheel</option><option>14 Wheel</option><option>16 Wheel</option></select></div><div><label>Trips</label><input type="number" id="sv_t_trips" value="0"></div><div><label>Diesel (Litre)</label><input type="number" id="sv_diesel" value="0"></div><div><label>Rate</label><input type="number" id="sv_d_rate" value="92.49"></div><div><label>Other Exp</label><input type="number" id="sv_khoroch" value="0"></div><button id="sv-save-btn" onclick="StockVehicleModule.saveData()" class="btn-action" style="background:#27ae60;">SAVE DATA</button></div><datalist id="sv_v_list"></datalist></div>
            <div id="sv-owner-page" class="sv-page card"><h3 style="color:var(--p-color); margin-top:0;">🤝 Owner Registration</h3><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; align-items:end; margin-bottom:20px;"><div><label>Vehicle No</label><input type="text" id="sv_m_v_no" placeholder="WB-XX-XXXX" style="text-transform:uppercase;"></div><div><label>Owner Name</label><input type="text" id="sv_m_o_name" placeholder="Name"></div><button onclick="StockVehicleModule.saveOwner()" class="btn-action" style="background:#3498db;">REGISTER</button></div><table class="d-table" style="width:100%; border:1px solid #ddd;"><thead><tr style="background:#f8f9fa;"><th>Vehicle No</th><th>Owner Name</th><th class="no-print">Action</th></tr></thead><tbody id="sv-owner-table-body"></tbody></table></div>
            <div id="sv-ledger-page" class="sv-page card">
                <div class="no-print" style="display:flex; gap:10px; margin-bottom:20px; align-items:end; background:#eef2f7; padding:15px; border-radius:8px; flex-wrap:wrap;">
                    <div style="flex:1.5"><label>Search Owner</label><select id="sv_o_selector" onchange="StockVehicleModule.loadLedger('owner')"></select></div>
                    <div style="flex:1.5"><label>OR Select Vehicle</label><select id="sv_v_selector" onchange="StockVehicleModule.loadLedger('vehicle')"></select></div>
                    <div style="flex:1"><label>From</label><input type="date" id="sv_led_f_date" class="sv-date-input" onchange="StockVehicleModule.loadLedger()"></div>
                    <div style="flex:1"><label>To</label><input type="date" id="sv_led_t_date" class="sv-date-input" onchange="StockVehicleModule.loadLedger()"></div>
                    <button onclick="window.print()" class="btn-action" style="background:#e67e22;">🖨️ PRINT</button>
                </div>
                <div id="sv-pdf-content">
                    <div id="sv-ledger-header" style="text-align:center; display:none; border-bottom: 3.5px solid #1e3a5f; padding-bottom: 10px; margin-bottom: 20px;">
                        <h1 id="sv_print_ghat_name" style="margin:0; color:#1e3a5f; font-size:26px;">VEHICLE LEDGER</h1>
                        <div style="margin-top:10px; font-weight:bold; font-size:14px;"><span>TARGET: <span id="sv_p_vno"></span></span> | <span>OWNER: <span id="sv_p_owner"></span></span></div>
                    </div>
                    <div id="sv-ledger-content" style="display:none;">
                        <div id="sv-ledger-sum-area"></div>
                        <div class="table-responsive">
                            <table class="d-table" style="width:100%; border:1px solid #000; margin-top:15px;">
                                <thead><tr style="background:#1e3a5f; color:white;"><th>Date</th><th>Wheel</th><th>Trips</th><th>Rate</th><th>Diesel(L)</th><th>D-Cost</th><th>Other Exp</th><th>Balance</th><th class="no-print">Action</th></tr></thead>
                                <tbody id="sv-ledger-data"></tbody>
                            </table>
                        </div>
                        <div style="margin-top:50px; text-align:right;"><div style="display:inline-block; text-align:center; width:200px; border-top:2px solid #000; font-weight:bold;">Authorized Signature</div></div>
                    </div>
                </div>
            </div>`;
    },
    switchInternalTab: function(tab) {
        document.querySelectorAll('.sv-page').forEach(div => div.style.display = 'none');
        document.getElementById('sv-' + tab + '-page').style.display = 'block';
        document.querySelectorAll('.sv-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-sv-' + tab).classList.add('active');
        if(tab === 'dash') this.updateDashboard(); if(tab === 'owner') this.renderOwnerTable(); if(tab === 'ledger') this.updateSelectors();
    },
    saveOwner: function() {
        const v = document.getElementById('sv_m_v_no').value.toUpperCase().trim(), n = document.getElementById('sv_m_o_name').value.trim();
        if(!v || !n) return alert("Fill data!");
        App.db.stk_v_owners[v] = { name: n }; App.saveToLocalStorage();
        document.getElementById('sv_m_v_no').value = ""; document.getElementById('sv_m_o_name').value = "";
        this.renderOwnerTable(); this.updateAutoSuggest(); alert("Owner Registered!");
    },
    renderOwnerTable: function() {
        const owners = App.db.stk_v_owners || {};
        document.getElementById('sv-owner-table-body').innerHTML = Object.keys(owners).map(v => `<tr><td>${v}</td><td style="font-weight:bold;">${owners[v].name}</td><td class="no-print"><button onclick="StockVehicleModule.delOwner('${v}')" style="color:red; border:none; background:none; cursor:pointer;">Del</button></td></tr>`).join('');
    },
    delOwner: function(v) { if(confirm("Delete this owner?")) { delete App.db.stk_v_owners[v]; App.saveToLocalStorage(); this.renderOwnerTable(); } },
    fetchOwner: function() {
        const v = document.getElementById('sv_v_no').value.toUpperCase().trim(), owners = App.db.stk_v_owners || {};
        document.getElementById('sv_owner_name_auto').value = owners[v] ? owners[v].name : "Not Found";
    },
    updateAutoSuggest: function() { 
        const db = App.db.stk_v_db || [], owners = App.db.stk_v_owners || {};
        const vList = [...new Set([...db.map(i => i.v_no), ...Object.keys(owners)])]; 
        document.getElementById('sv_v_list').innerHTML = vList.map(v => `<option value="${v}">`).join(''); 
    },
    saveData: function() {
        const vNo = document.getElementById('sv_v_no').value.toUpperCase().trim();
        if(!vNo) return alert("Enter Vehicle No!");
        const entry = { id: this.editID || Date.now(), date: document.getElementById('sv_date').value, v_no: vNo, wheel: document.getElementById('sv_wheel').value, trips: parseFloat(document.getElementById('sv_t_trips').value)||0, diesel_ltr: parseFloat(document.getElementById('sv_diesel').value)||0, d_rate: parseFloat(document.getElementById('sv_d_rate').value)||92.49, other_exp: parseFloat(document.getElementById('sv_khoroch').value)||0 };
        if(this.editID) { App.db.stk_v_db = App.db.stk_v_db.map(i => i.id === this.editID ? entry : i); this.editID = null; document.getElementById('sv-save-btn').innerText="SAVE DATA"; document.getElementById('sv-save-btn').style.background="#27ae60"; } 
        else { App.db.stk_v_db.push(entry); }
        App.saveToLocalStorage(); alert("Trip Data Saved!"); 
        ['sv_v_no','sv_owner_name_auto','sv_t_trips','sv_diesel','sv_khoroch'].forEach(id => { const el = document.getElementById(id); if(el) el.value = (id === 'sv_v_no' || id === 'sv_owner_name_auto') ? '' : '0'; });
        this.updateAutoSuggest();
    },
    updateDashboard: function() {
        const f = document.getElementById('sv_dash_f_date').value, t = document.getElementById('sv_dash_t_date').value, db = App.db.stk_v_db || [];
        let filtered = db.filter(i => i.date >= f && i.date <= t), tT=0, tL=0, tD=0, tO=0;
        filtered.forEach(i => { tT += i.trips; tL += i.diesel_ltr; tD += (i.diesel_ltr * (i.d_rate || 92.49)); tO += i.other_exp; });
        document.getElementById('sv-dash-container').innerHTML = `<div class="sv-sum-grid"><div class="sv-sum-card" style="background:#2c3e50"><span>Trips</span><strong>${tT}</strong></div><div class="sv-sum-card" style="background:#2980b9"><span>Total Bill</span><strong>₹${(tT*1000).toFixed(0)}</strong></div><div class="sv-sum-card" style="background:#2ecc71"><span>Diesel(L)</span><strong>${tL.toFixed(1)}</strong></div><div class="sv-sum-card" style="background:#e67e22"><span>D-Exp</span><strong>₹${tD.toFixed(0)}</strong></div><div class="sv-sum-card" style="background:#d35400"><span>Other Exp</span><strong>₹${tO.toFixed(0)}</strong></div></div><div class="sv-full-card"><span>Net Balance</span><strong>₹${((tT*1000) - (tD+tO)).toFixed(0)}</strong></div>`;
    },
    updateSelectors: function() {
        const db = App.db.stk_v_db || [], owners = App.db.stk_v_owners || {};
        const vList = [...new Set(db.map(i => i.v_no))], ownerList = [...new Set(Object.values(owners).map(o => o.name))];
        document.getElementById('sv_v_selector').innerHTML = '<option value="">-- Single Vehicle --</option>' + vList.map(v => `<option value="${v}">${v}</option>`).join('');
        document.getElementById('sv_o_selector').innerHTML = '<option value="">-- Owner Name --</option>' + ownerList.map(o => `<option value="${o}">${o}</option>`).join('');
    },
    loadLedger: function(type) {
        if(type === 'owner') document.getElementById('sv_v_selector').value = ""; if(type === 'vehicle') document.getElementById('sv_o_selector').value = "";
        const selO = document.getElementById('sv_o_selector').value, selV = document.getElementById('sv_v_selector').value, from = document.getElementById('sv_led_f_date').value, to = document.getElementById('sv_led_t_date').value;
        if(!selO && !selV) return;
        const db = App.db.stk_v_db || [], owners = App.db.stk_v_owners || {};
        let entries = selO ? db.filter(i => Object.keys(owners).filter(v => owners[v].name === selO).includes(i.v_no) && i.date >= from && i.date <= to) : db.filter(i => i.v_no === selV && i.date >= from && i.date <= to);
        entries.sort((a,b) => new Date(a.date) - new Date(b.date));
        document.getElementById('sv-ledger-header').style.display = 'block'; document.getElementById('sv-ledger-content').style.display = 'block';
        
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        const headerEl = document.getElementById('sv_print_ghat_name');
        if(headerEl) headerEl.innerText = `${currentGhat.toUpperCase()} (VEHICLE LEDGER)`;

        let wheelType = (selV && entries.length > 0) ? ` (${entries[entries.length-1].wheel})` : "";
        document.getElementById('sv_p_vno').innerText = (selV || "Multiple Vehicles") + wheelType; document.getElementById('sv_p_owner').innerText = selO || owners[selV]?.name || "N/A";
        let sT=0, sB=0, sD=0, sO=0, sBal=0, sL=0;
        document.getElementById('sv-ledger-data').innerHTML = entries.map(i => {
            const rate = this.getTripRate(i.wheel), dc = i.diesel_ltr * (i.d_rate || 92.49), tb = i.trips * rate, b = tb - (dc + i.other_exp);
            sT+=i.trips; sB+=tb; sL+=i.diesel_ltr; sD+=dc; sO+=i.other_exp; sBal+=b;
            return `<tr><td style="padding:8px;">${i.date.split('-').reverse().join('-')}</td><td style="padding:8px;">${i.wheel}</td><td style="padding:8px; font-weight:bold;">${i.trips}</td><td style="padding:8px;">${rate}</td><td style="padding:8px;">${i.diesel_ltr.toFixed(1)}</td><td style="padding:8px; color:#e67e22;">${dc.toFixed(0)}</td><td style="padding:8px; color:#d35400;">${i.other_exp.toFixed(0)}</td><td style="padding:8px;" class="${b>=0?'bal-pos':'bal-neg'}">₹${b.toFixed(0)}</td><td class="no-print"><button onclick="StockVehicleModule.editEntry(${i.id})" style="color:blue; border:none; background:none; cursor:pointer;">Edit</button></td></tr>`;
        }).join('');
        document.getElementById('sv-ledger-sum-area').innerHTML = `<div class="sv-sum-grid"><div class="sv-sum-card" style="background:#2c3e50"><span>Trips</span><strong>${sT}</strong></div><div class="sv-sum-card" style="background:#2980b9"><span>Total Bill</span><strong>₹${sB.toFixed(0)}</strong></div><div class="sv-sum-card" style="background:#2ecc71"><span>Diesel(L)</span><strong>${sL.toFixed(1)}</strong></div><div class="sv-sum-card" style="background:#e67e22"><span>D-Exp</span><strong>₹${sD.toFixed(0)}</strong></div><div class="sv-sum-card" style="background:#d35400"><span>Other Exp</span><strong>₹${sO.toFixed(0)}</strong></div></div><div class="sv-full-card"><span>Net Balance</span><strong>₹${sBal.toFixed(0)}</strong></div>`;
    },
    editEntry: function(id) { 
        this.editID = id; const i = (App.db.stk_v_db || []).find(x => x.id === id); 
        document.getElementById('sv_date').value = i.date; document.getElementById('sv_v_no').value = i.v_no; document.getElementById('sv_wheel').value = i.wheel; document.getElementById('sv_t_trips').value = i.trips; document.getElementById('sv_diesel').value = i.diesel_ltr; document.getElementById('sv_d_rate').value = i.d_rate; document.getElementById('sv_khoroch').value = i.other_exp; 
        this.fetchOwner(); this.switchInternalTab('entry');
        document.getElementById('sv-save-btn').innerText="UPDATE DATA"; document.getElementById('sv-save-btn').style.background="#f39c12";
    }
};

// ==========================================
// MODULE 4: STOCK MACHINE PANEL
// ==========================================
const StockMachineModule = {
    readingToTotalMinutes: function(val) {
        let hours = Math.floor(val);
        let units = Math.round((val - hours) * 10); 
        return (hours * 60) + (units * 5); 
    },
    formatDuration: function(totalMinutes) {
        let h = Math.floor(totalMinutes / 60);
        let m = totalMinutes % 60;
        return `${h}h ${m}m`;
    },
    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.sm-date-input').forEach(el => el.value = today);
        document.getElementById('sm_l_from').value = today.substring(0, 8) + '01'; 
        
        if(!App.db.stk_m_machines) App.db.stk_m_machines = {};
        if(!App.db.stk_m_entries) App.db.stk_m_entries = [];
        if(!App.db.stk_m_payments) App.db.stk_m_payments = [];

        this.updateDropdowns();
        this.switchInternalTab('dash');
    },
    getHTML: function() {
        return `
            <style>
                .sm-nav { display:flex; gap:10px; margin-bottom:20px; border-bottom: 2px solid #ddd; padding-bottom:10px; overflow-x: auto; }
                .sm-tab-btn { background:#ecf0f1; border:none; padding:10px 20px; font-weight:bold; cursor:pointer; border-radius:6px; color:#2c3e50; white-space: nowrap; }
                .sm-tab-btn.active { background:var(--p-color); color:white; }
                .sm-page { display:none; }
                .sm-dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
                .sm-stat-card { background: white; padding: 15px; border-radius: 10px; text-align: center; border-bottom: 4px solid var(--p-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .sm-stat-card h4 { margin: 0; color: #7f8c8d; font-size: 11px; text-transform: uppercase; }
                .sm-stat-card h2 { margin: 8px 0 0; color: var(--s-color); font-size: 20px; }
                @media print { .sm-nav, .no-print { display: none !important; } }
            </style>

            <div class="card no-print" style="padding-bottom:10px; margin-bottom:15px; border-top-color:#d35400;">
                <div class="sm-nav">
                    <button class="sm-tab-btn active" id="btn-sm-dash" onclick="StockMachineModule.switchInternalTab('dash')">📊 Dashboard</button>
                    <button class="sm-tab-btn" id="btn-sm-machines" onclick="StockMachineModule.switchInternalTab('machines')">⚙️ Machines</button>
                    <button class="sm-tab-btn" id="btn-sm-daily" onclick="StockMachineModule.switchInternalTab('daily')">📝 Daily Entry</button>
                    <button class="sm-tab-btn" id="btn-sm-payment" onclick="StockMachineModule.switchInternalTab('payment')">💸 Payment Entry</button>
                    <button class="sm-tab-btn" id="btn-sm-ledger" onclick="StockMachineModule.switchInternalTab('ledger')">📋 Ledger Report</button>
                </div>
            </div>

            <div id="sm-dash-page" class="sm-page card" style="border-top-color:#d35400;">
                <h3 style="color:#d35400; margin-top:0;">📊 Machine Dashboard Overview</h3>
                <div class="sm-dash-grid" id="sm-dash-cards"></div>
                <div style="margin-top:20px;">
                    <h3 style="color:#333; margin-top:0;">Machine Live Status (Today)</h3>
                    <div id="sm-dash-summary" class="table-responsive"></div>
                </div>
            </div>

            <div id="sm-machines-page" class="sm-page card" style="border-top-color:#d35400;">
                <h3 style="color:#d35400; margin-top:0;">⚙️ Machine Registration</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 20px; align-items: end;">
                    <div><label>Name</label><input type="text" id="sm_m_name" placeholder="Ex: JCB-205"></div>
                    <div><label>Type</label><select id="sm_m_type"><option value="loading">Loading (Trip Basis)</option><option value="monthly">Monthly (Fixed Rent)</option></select></div>
                    <div><label>Rate / Rent (₹)</label><input type="number" id="sm_m_rate" value="1000"></div>
                    <div><label>Start Read</label><input type="number" id="sm_m_read" value="0" step="0.01"></div>
                    <button class="btn-action" style="background:#d35400;" onclick="StockMachineModule.saveMachine()">SAVE MACHINE</button>
                </div>
                <div id="sm-machine-list-display"></div>
            </div>

            <div id="sm-daily-page" class="sm-page card" style="border-top-color:#d35400;">
                <h3 style="color:#d35400; margin-top:0;">📝 Daily Work & Diesel Entry</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 15px; align-items: end;">
                    <div><label>Date</label><input type="date" id="sm_e_date" class="sm-date-input"></div>
                    <div><label>Machine</label><select id="sm_e_machine" onchange="StockMachineModule.autoFillReading()"></select></div>
                    <div><label>Start Read</label><input type="number" id="sm_e_start" step="0.01"></div>
                    <div><label>Stop Read</label><input type="number" id="sm_e_stop" step="0.01"></div>
                    <div><label>Diesel (L)</label><input type="number" id="sm_e_diesel" value="0"></div>
                    <div><label>D-Rate</label><input type="number" id="sm_e_drate" value="92.49"></div>
                </div>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; align-items: end;">
                    <div><label>10W Trips (For Loading)</label><input type="number" id="sm_e_10w" value="0"></div>
                    <div><label>12W Trips (For Loading)</label><input type="number" id="sm_e_12w" value="0"></div>
                    <button class="btn-action" style="background:#d35400;" onclick="StockMachineModule.saveDaily()">SAVE RECORD</button>
                </div>
            </div>

            <div id="sm-payment-page" class="sm-page card" style="border-top-color:#d35400;">
                <h3 style="color:#d35400; margin-top:0;">💸 Payment Entry</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; align-items: end;">
                    <div><label>Date</label><input type="date" id="sm_p_date" class="sm-date-input"></div>
                    <div><label>Select Machine</label><select id="sm_p_machine"></select></div>
                    <div><label>Amount (₹)</label><input type="number" id="sm_p_amt" value="0"></div>
                    <div><label>Remarks</label><input type="text" id="sm_p_remark" placeholder="e.g. Advance"></div>
                    <button class="btn-action" style="background:#d35400;" onclick="StockMachineModule.savePayment()">SAVE PAYMENT</button>
                </div>
            </div>

            <div id="sm-ledger-page" class="sm-page card" style="border-top-color:#d35400;">
                <div class="no-print" style="display:flex; gap:10px; margin-bottom:20px; align-items:end; background:#eef2f7; padding:15px; border-radius:8px; flex-wrap:wrap;">
                    <div style="flex:1.5"><label>Select Machine</label><select id="sm_l_machine"></select></div>
                    <div style="flex:1"><label>From Date</label><input type="date" id="sm_l_from" class="sm-date-input"></div>
                    <div style="flex:1"><label>To Date</label><input type="date" id="sm_l_to" class="sm-date-input"></div>
                    <button onclick="StockMachineModule.loadLedger()" class="btn-action" style="background:#1e3a5f;">View Report</button>
                    <button onclick="window.print()" class="btn-action" style="background:#e67e22;">🖨️ Print</button>
                </div>
                <div id="sm-ledger-view" style="display:none;">
                    <div style="text-align: center; margin-bottom: 20px; color: #2c3e50;">
                        <h1 id="sm_print_ghat_name" style="margin: 0; font-size: 24px; text-transform: uppercase; border-bottom: 3px solid #d35400; display: inline-block; padding-bottom: 5px;">MACHINE LEDGER</h1>
                        <p id="sm_l_machine_title" style="font-weight:bold; font-size:14px; margin-top:10px;"></p>
                    </div>
                    <div class="sm-dash-grid" id="sm-ledger-cards"></div>
                    <div class="table-responsive" id="sm-ledger-content" style="margin-top:20px;"></div>
                </div>
            </div>
        `;
    },

    switchInternalTab: function(tab) {
        document.querySelectorAll('.sm-page').forEach(div => div.style.display = 'none');
        document.getElementById('sm-' + tab + '-page').style.display = 'block';
        document.querySelectorAll('.sm-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-sm-' + tab).classList.add('active');
        
        if(tab === 'dash') this.updateDashboard();
        if(tab === 'machines') this.displayMachines();
    },

    saveMachine: function() {
        const name = document.getElementById('sm_m_name').value.trim();
        if(!name) return alert("Machine name required!");
        App.db.stk_m_machines[name] = { 
            type: document.getElementById('sm_m_type').value, 
            rate: parseFloat(document.getElementById('sm_m_rate').value) || 0, 
            startRead: parseFloat(document.getElementById('sm_m_read').value) || 0 
        };
        App.saveToLocalStorage();
        document.getElementById('sm_m_name').value = "";
        this.displayMachines(); 
        this.updateDropdowns();
        alert("Machine Registered!");
    },

    displayMachines: function() {
        const container = document.getElementById('sm-machine-list-display');
        container.innerHTML = "<h3 style='color:#333;'>Registered Machines</h3>";
        for (let m in App.db.stk_m_machines) {
            container.innerHTML += `
                <div style="background:#f8f9fa; padding:15px; border:1px solid #ddd; margin-bottom:10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><b style="font-size:16px; color:#d35400;">${m}</b><br><span style="font-size:12px; color:#555;">${App.db.stk_m_machines[m].type.toUpperCase()} | Rate: ₹${App.db.stk_m_machines[m].rate}</span></div>
                    <button onclick="StockMachineModule.deleteMachine('${m}')" class="btn-action" style="background:#e74c3c; width:auto; padding:8px 15px;">Delete</button>
                </div>`;
        }
    },

    deleteMachine: function(n) { 
        if(confirm("Delete this machine?")) { 
            delete App.db.stk_m_machines[n]; 
            App.saveToLocalStorage(); 
            this.displayMachines(); 
            this.updateDropdowns(); 
        } 
    },

    updateDropdowns: function() {
        const names = Object.keys(App.db.stk_m_machines || {});
        let opt = names.map(n => `<option value="${n}">${n}</option>`).join('');
        ['sm_e_machine', 'sm_p_machine', 'sm_l_machine'].forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).innerHTML = opt;
        });
        this.autoFillReading();
    },

    autoFillReading: function() {
        const m = document.getElementById('sm_e_machine')?.value;
        if(!m) return;
        const mEntries = (App.db.stk_m_entries || []).filter(i => i.machine === m);
        let last = App.db.stk_m_machines[m] ? App.db.stk_m_machines[m].startRead : 0;
        if(mEntries.length > 0) last = mEntries[mEntries.length-1].stop;
        if(document.getElementById('sm_e_start')) document.getElementById('sm_e_start').value = last.toFixed(1);
    },

    saveDaily: function() {
        const m = document.getElementById('sm_e_machine').value;
        if(!m) return alert("Select Machine!");
        const stop = parseFloat(document.getElementById('sm_e_stop').value) || 0;
        const start = parseFloat(document.getElementById('sm_e_start').value) || 0;
        
        let diffMin = this.readingToTotalMinutes(stop) - this.readingToTotalMinutes(start);
        if(diffMin < 0) return alert("Stop reading error (Cannot be less than start)!");

        const entry = {
            id: Date.now(), 
            date: document.getElementById('sm_e_date').value, 
            machine: m,
            start, 
            stop, 
            totalMin: diffMin,
            diesel: parseFloat(document.getElementById('sm_e_diesel').value) || 0,
            dcost: (parseFloat(document.getElementById('sm_e_diesel').value) * parseFloat(document.getElementById('sm_e_drate').value)).toFixed(0),
            w10: parseInt(document.getElementById('sm_e_10w').value) || 0,
            w12: parseInt(document.getElementById('sm_e_12w').value) || 0
        };
        const mConfig = App.db.stk_m_machines[m];
        entry.earning = mConfig.type === 'loading' ? (entry.w10 + entry.w12) * mConfig.rate : 0;
        
        App.db.stk_m_entries.push(entry); 
        App.saveToLocalStorage(); 
        
        ['sm_e_stop', 'sm_e_diesel', 'sm_e_10w', 'sm_e_12w'].forEach(id => document.getElementById(id).value = '');
        this.autoFillReading();
        alert("Daily Machine Record Saved!");
    },

    savePayment: function() {
        const amt = parseFloat(document.getElementById('sm_p_amt').value) || 0;
        if(amt <= 0) return alert("Enter amount!");
        App.db.stk_m_payments.push({
            id: Date.now(), 
            date: document.getElementById('sm_p_date').value,
            machine: document.getElementById('sm_p_machine').value,
            amt: amt,
            remark: document.getElementById('sm_p_remark').value
        });
        App.saveToLocalStorage(); 
        document.getElementById('sm_p_amt').value = '';
        document.getElementById('sm_p_remark').value = '';
        alert("Payment Recorded!");
    },

    updateDashboard: function() {
        const today = new Date().toISOString().split('T')[0];
        let tDL=0, tMin=0, tDC=0, tP=0;
        let tableHtml = `<table class="d-table" style="width:100%; border:1px solid #ddd;"><thead><tr style="background:#f8f9fa;"><th>Machine Name</th><th>Last Reading</th><th>Today Fuel</th><th>Today Status</th></tr></thead><tbody>`;
        
        for(let m in App.db.stk_m_machines) {
            const todayE = (App.db.stk_m_entries || []).filter(i => i.machine === m && i.date === today);
            let dL=0, dC=0, min=0, lastS = App.db.stk_m_machines[m].startRead;
            
            todayE.forEach(x => { dL += x.diesel; dC += parseFloat(x.dcost); min += x.totalMin; });
            const allM = (App.db.stk_m_entries || []).filter(i => i.machine === m);
            if(allM.length > 0) lastS = allM[allM.length-1].stop;
            
            tDL += dL; tMin += min; tDC += dC;
            tableHtml += `<tr><td style="font-weight:bold; color:#d35400;">${m}</td><td>${lastS.toFixed(1)}</td><td>${dL} L</td><td><strong style="color:${min>0?'#27ae60':'#e74c3c'};">${min>0?this.formatDuration(min):'Idle'}</strong></td></tr>`;
        }
        
        (App.db.stk_m_payments || []).filter(p => p.date === today).forEach(p => tP += p.amt);
        
        const cardsEl = document.getElementById('sm-dash-cards');
        if(cardsEl) {
            cardsEl.innerHTML = `
                <div class="sm-stat-card"><h4>Today Hours</h4><h2>${this.formatDuration(tMin)}</h2></div>
                <div class="sm-stat-card"><h4>Today Fuel</h4><h2>${tDL.toFixed(1)} L</h2></div>
                <div class="sm-stat-card"><h4>Fuel Expense</h4><h2>₹${tDC.toFixed(0)}</h2></div>
                <div class="sm-stat-card"><h4>Payments Out</h4><h2>₹${tP}</h2></div>
            `;
        }
        const summaryEl = document.getElementById('sm-dash-summary');
        if(summaryEl) summaryEl.innerHTML = tableHtml + `</tbody></table>`;
    },

    loadLedger: function() {
        const m = document.getElementById('sm_l_machine').value;
        const from = document.getElementById('sm_l_from').value;
        const to = document.getElementById('sm_l_to').value;
        if(!m) return alert("Please select a machine!");

        const mConfig = App.db.stk_m_machines[m];
        if(!mConfig) return;

        const filteredE = (App.db.stk_m_entries || []).filter(i => i.machine === m && i.date >= from && i.date <= to).sort((a,b)=>new Date(a.date)-new Date(b.date));
        const filteredP = (App.db.stk_m_payments || []).filter(i => i.machine === m && i.date >= from && i.date <= to);
        
        document.getElementById('sm-ledger-view').style.display = 'block';
        
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        const headerEl = document.getElementById('sm_print_ghat_name');
        if(headerEl) headerEl.innerText = `${currentGhat.toUpperCase()}`;
        
        document.getElementById('sm_l_machine_title').innerText = `MACHINE: ${m} | TYPE: ${mConfig.type.toUpperCase()}`;

        let totalMin=0, sDL=0, sDC=0, sE=0, sP=0;
        let tableHtml = `<table class="d-table" style="width:100%; border:1px solid #000;"><thead><tr style="background:#1e3a5f; color:white;"><th>Date</th><th>Start Read</th><th>Stop Read</th>${mConfig.type==='loading'?'<th>Loading Rate</th><th>Total Trips</th>':'<th>Diesel (L)</th><th>Diesel Cost</th>'}<th>Duration</th></tr></thead><tbody>`;

        filteredE.forEach(i => {
            totalMin += i.totalMin; sDL += i.diesel; sDC += parseFloat(i.dcost); sE += i.earning;
            tableHtml += `<tr>
                <td>${i.date.split('-').reverse().join('-')}</td>
                <td>${i.start.toFixed(1)}</td><td>${i.stop.toFixed(1)}</td>
                ${mConfig.type==='loading' ? `<td style="color:#27ae60; font-weight:bold;">₹${mConfig.rate}</td><td style="font-weight:bold;">${i.w10+i.w12}</td>` : `<td style="color:#e67e22; font-weight:bold;">${i.diesel} L</td><td style="color:#c0392b; font-weight:bold;">₹${i.dcost}</td>`}
                <td style="font-weight:bold;">${this.formatDuration(i.totalMin)}</td>
            </tr>`;
        });

        filteredP.forEach(p => { 
            sP += p.amt; 
            tableHtml += `<tr style="background:#fff3f3"><td colspan="3" style="text-align:right; font-weight:bold;">PAYMENT: ${p.remark}</td><td colspan="2" style="color:#c0392b; font-weight:bold;">₹${p.amt} Paid</td></tr>`; 
        });

        const totalIncome = mConfig.type === 'loading' ? sE : mConfig.rate;
        const finalBal = totalIncome - (sDC + sP);

        document.getElementById('sm-ledger-cards').innerHTML = `
            ${mConfig.type==='monthly' ? `<div class="sm-stat-card"><h4>Monthly Rent</h4><h2>₹${mConfig.rate}</h2></div>` : `<div class="sm-stat-card"><h4>Trip Earnings</h4><h2 style="color:#27ae60;">₹${sE}</h2></div>`}
            <div class="sm-stat-card"><h4>Fuel Used</h4><h2>${sDL.toFixed(1)} L</h2></div>
            <div class="sm-stat-card"><h4>Fuel Cost</h4><h2 style="color:#e67e22;">₹${sDC.toFixed(0)}</h2></div>
            <div class="sm-stat-card"><h4>Total Paid</h4><h2 style="color:#c0392b;">₹${sP}</h2></div>
            <div class="sm-stat-card" style="border-bottom-color:${finalBal>=0?'#27ae60':'#e74c3c'};"><h4>Balance</h4><h2 style="color:${finalBal>=0?'#27ae60':'#e74c3c'}; font-weight:900;">₹${finalBal.toFixed(0)}</h2></div>
        `;

        document.getElementById('sm-ledger-content').innerHTML = tableHtml + `</tbody></table>`;
    }
};

// ==========================================
// MODULE 5: STOCK MANUAL ENTRY (EXTRA INFLOW)
// ==========================================
const StockManualEntryModule = {
    init: function() { 
        const today = new Date().toISOString().split('T')[0]; 
        if(document.getElementById('stk-man-date')) document.getElementById('stk-man-date').value = today; 
        if(!App.db.stock_manual_adjustments) App.db.stock_manual_adjustments = [];
        this.renderTable(); 
    },
    
    getHTML: function() {
        return `
            <div class="card no-print" style="border-top-color: #27ae60;">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                    <h3 style="color:#27ae60; margin:0;">➕ Stock Manual Adjustment / Extra Inflow</h3>
                </div>
                <div class="form-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; align-items:end;">
                    <div><label>Date</label><input type="date" id="stk-man-date" onchange="StockManualEntryModule.renderTable()"></div>
                    <div><label>Details / Source</label><input type="text" id="stk-man-desc" placeholder="e.g. Extra Cash from XYZ..."></div>
                    <div><label>Amount (₹)</label><input type="number" id="stk-man-amount" placeholder="0"></div>
                    <div><button class="btn-action" style="background:#27ae60; width:100%;" onclick="StockManualEntryModule.saveEntry()">SAVE ENTRY</button></div>
                </div>
            </div>
            <div class="card">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                    <h3 style="color:#000; margin:0;">📋 Manual Adjustments List</h3>
                </div>
                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; border:2px solid #333;">
                        <thead>
                            <tr style="background:#f8f9fa;">
                                <th style="padding:10px; border:1px solid #333;">SL</th>
                                <th style="padding:10px; border:1px solid #333;">Date</th>
                                <th style="padding:10px; border:1px solid #333; text-align:left;">Details</th>
                                <th style="padding:10px; border:1px solid #333; text-align:right;">Amount</th>
                                <th style="padding:10px; border:1px solid #333;" class="no-print">Action</th>
                            </tr>
                        </thead>
                        <tbody id="stk-man-body"></tbody>
                    </table>
                </div>
            </div>`;
    },
    
    saveEntry: function() {
        const date = document.getElementById('stk-man-date').value;
        const desc = document.getElementById('stk-man-desc').value.trim();
        const amount = parseFloat(document.getElementById('stk-man-amount').value) || 0;
        
        if(!desc || amount <= 0) return alert("Provide valid details and amount!");
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        
        App.db.stock_manual_adjustments.push({ id: Date.now(), date: date, desc: desc, amount: amount, ghat: currentGhat });
        App.saveToLocalStorage(); 
        document.getElementById('stk-man-desc').value = ""; document.getElementById('stk-man-amount').value = ""; 
        this.renderTable();
    },
    
    renderTable: function() {
        const body = document.getElementById('stk-man-body'); 
        if(!body) return;
        
        const filterDate = document.getElementById('stk-man-date')?.value;
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        
        let filtered = (App.db.stock_manual_adjustments || []).filter(i => i.ghat === currentGhat && (filterDate ? i.date === filterDate : true));
        let total = 0;
        
        if(filtered.length > 0) {
            body.innerHTML = filtered.map((row, i) => { 
                total += parseFloat(row.amount); 
                return `<tr><td style="padding:8px; border:1px solid #333; text-align:center;">${i+1}</td><td style="padding:8px; border:1px solid #333; text-align:center;">${row.date}</td><td style="padding:8px; border:1px solid #333; font-weight:bold;">${row.desc}</td><td style="padding:8px; border:1px solid #333; text-align:right; font-weight:bold; color:#27ae60;">₹${row.amount.toFixed(2)}</td><td style="padding:8px; border:1px solid #333; text-align:center;" class="no-print"><button onclick="StockManualEntryModule.deleteEntry(${row.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">Del</button></td></tr>`; 
            }).join('') + `<tr style="background:#e2e8f0; font-weight:900;"><td colspan="3" style="text-align:right; padding:10px; border:1px solid #333;">TOTAL EXTRA:</td><td style="text-align:right; padding:10px; border:1px solid #333; color:#27ae60;">₹${total.toFixed(2)}</td><td class="no-print" style="border:1px solid #333;"></td></tr>`;
        } else {
            body.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#7f8c8d;">No Manual Entries Found For This Date.</td></tr>`;
        }
    },
    
    deleteEntry: function(id) { 
        if(confirm("Are you sure you want to delete this manual entry?")) { 
            App.db.stock_manual_adjustments = App.db.stock_manual_adjustments.filter(i => i.id !== id); 
            App.saveToLocalStorage(); 
            this.renderTable(); 
        } 
    }
};