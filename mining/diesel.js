// ==========================================
// MODULE: DIESEL MANAGEMENT (diesel.js)
// ==========================================
const DieselModule = {
    safe: function(val) {
        let n = parseFloat(val);
        return (isNaN(n) || !isFinite(n)) ? 0 : n;
    },

    init: function() {
        if (!App.db.diesel_purchase) App.db.diesel_purchase = [];
        if (!App.db.diesel_issue) App.db.diesel_issue = [];
        if (!App.db.diesel_payments) App.db.diesel_payments = [];

        const today = new Date().toISOString().split('T')[0];
        ['f-start', 'f-end', 'in-date', 'out-date', 'pay-date'].forEach(id => {
            const el = document.getElementById(id);
            if(el && !el.value) el.value = today;
        });

        this.updateAutoSuggestions();
        this.showTab('dash');
    },

    getHTML: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        
        return `
            <style>
                /* Professional ERP Layout Styles */
                .erp-page-header { background: #ffffff; border-left: 5px solid #d35400; padding: 15px 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.04); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px; }
                .erp-page-title { margin: 0; color: #1e293b; font-size: 18px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px; }
                .erp-page-subtitle { margin: 5px 0 0 0; color: #64748b; font-size: 12px; font-weight: bold; }
                
                .d-tab-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                .d-tab-btn { padding: 10px 15px; border: none; background: #f8f9fa; cursor: pointer; font-weight: bold; border-radius: 6px; color: #2c3e50; font-size:12px; transition: 0.3s; }
                .d-tab-btn:hover, .d-tab-btn.active { background: #1e3a5f; color: white; }
                
                .erp-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); overflow: hidden; }
                .erp-card-header { background: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center; }
                .erp-card-body { padding: 20px; }

                .d-dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px; margin-bottom: 25px; }
                .d-stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; border-bottom: 4px solid #1e3a5f; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .d-stat-card h4 { margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight:bold; }
                .d-stat-card h2 { margin: 10px 0 0; color: #0f172a; font-size: 20px; font-weight: 900; }
                
                .d-form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; align-items: end; }
                
                /* Modern Table Styles */
                .erp-table { width: 100%; border-collapse: collapse; text-align: left; }
                .erp-table th { background: #1e293b; color: #ffffff; padding: 12px 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; border-right: 1px solid #334155; }
                .erp-table th:last-child { border-right: none; }
                .erp-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; vertical-align: middle; }
                .erp-table tr:hover { background-color: #f1f5f9; }
                .erp-table tr:last-child td { border-bottom: none; }
                
                .badge-btn { padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; border: none; transition: 0.2s; text-transform: uppercase; }
                .badge-edit { background: #fef08a; color: #854d0e; }
                .badge-edit:hover { background: #fde047; }
                .badge-delete { background: #fecdd3; color: #be123c; margin-left: 5px; }
                .badge-delete:hover { background: #fda4af; }
                
                .d-btn { background: #1e3a5f; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; }

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
                    .erp-table td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; }
                }
            </style>

            <datalist id="vehicle-list"></datalist>
            <datalist id="party-list"></datalist>

            <div class="erp-page-header no-print">
                <div>
                    <h2 class="erp-page-title">Fuel & Diesel Inventory</h2>
                    <p class="erp-page-subtitle">Manage fuel stock, vehicle logs, and vendor payments</p>
                </div>
            </div>

            <div class="print-only-header">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <img src="assets/sandmine.png" alt="Logo" style="height: 45px; width: auto; border-radius: 4px;">
                    <h2 id="print-d-ghat-title" style="font-size: 26px; color: #1e293b !important; margin: 0; font-weight: 900; text-transform: uppercase;">NARICHA SAND MINE</h2>
                </div>
                <h3 style="margin: 8px 0 0 0; font-size: 14px; color: #475569 !important; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #1e293b; display: inline-block; padding-bottom: 5px;">DIESEL & FUEL REPORT</h3>
                <div id="print-d-date-range" style="margin-top:12px; font-size:13px; font-weight:900; color:#c0392b; letter-spacing: 1px;"></div>
            </div>

            <div class="d-tab-bar no-print">
                <button class="d-tab-btn active" onclick="DieselModule.showTab('dash', this)">📊 Dashboard</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('purchase', this)">📥 Stock IN (Purchase)</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('issue', this)">📤 Stock OUT (Issue)</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('payment', this)">💸 Vendor Payment</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('p-history', this)">📜 Purchase Ledger</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('p-ledger', this)">✏️ Full History Logs</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('ledger', this)">🚛 Vehicle Usage</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('backup', this)" style="color: #d35400;">⚙️ Backup & Restore</button>
            </div>

            <div id="d-dash-page" class="d-page">
                <div class="erp-card no-print">
                    <div class="erp-card-body" style="display:flex; align-items:flex-end; gap:15px; border-left:5px solid #3498db; background:#f8fafc;">
                        <div style="flex:1"><label style="font-size:11px; font-weight:bold; color:#555;">From Date:</label><input type="date" id="f-start" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;"></div>
                        <div style="flex:1"><label style="font-size:11px; font-weight:bold; color:#555;">To Date:</label><input type="date" id="f-end" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;"></div>
                        <button class="d-btn" style="width:100px; background:#3b82f6;" onclick="DieselModule.updateStockDash()">FILTER</button>
                        <button class="d-btn" style="width:100px; background:#64748b;" onclick="DieselModule.resetDashFilter()">RESET</button>
                        <button class="d-btn" style="width:100px; background:#1e293b;" onclick="window.print()">🖨️ PRINT</button>
                    </div>
                </div>
                
                <div class="d-dash-grid" id="stock-cards"></div>
                
                <div class="erp-card">
                    <div class="erp-card-header" style="border-top: 3px solid #1e293b;">
                        <span><span style="font-size: 16px;">⏱️</span> RECENT FUEL TRANSACTIONS</span>
                    </div>
                    <div class="table-responsive">
                        <table class="erp-table" style="text-align: center;">
                            <thead>
                                <tr>
                                    <th style="text-align: center;">Date</th>
                                    <th style="text-align: center;">Vehicle / Party</th>
                                    <th style="text-align: center;">Entry Type</th>
                                    <th style="text-align: center;">Qty (Litre)</th>
                                    <th class="no-print" style="width:120px; text-align: center;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="recent-logs"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div id="d-purchase-page" class="d-page" style="display:none;">
                <div class="erp-card">
                    <div class="erp-card-header" style="border-top: 3px solid #27ae60;">
                        <span><span style="font-size: 16px;">📥</span> FUEL PURCHASE FORM (STOCK IN)</span>
                    </div>
                    <div class="erp-card-body d-form-row">
                        <input type="hidden" id="edit-p-id">
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Date</label><input type="date" id="in-date" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; background:#f8fafc;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Vendor/Party</label><input type="text" id="in-source" list="party-list" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Volume (Litre)</label><input type="number" id="in-qty" step="0.01" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; font-weight:bold; color:#27ae60;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Rate (₹)</label><input type="number" id="in-rate" value="92.49" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;"></div>
                        <div style="display:flex; gap:10px;">
                            <button id="in-save-btn" class="d-btn" style="background:#27ae60;" onclick="DieselModule.savePurchase()">+ ADD STOCK</button>
                            <button id="in-cancel-btn" class="d-btn" style="background:#64748b; display:none;" onclick="DieselModule.cancelPurchaseEdit()">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="d-issue-page" class="d-page" style="display:none;">
                <div class="erp-card">
                    <div class="erp-card-header" style="border-top: 3px solid #e74c3c;">
                        <span><span style="font-size: 16px;">📤</span> FUEL ISSUE FORM (STOCK OUT)</span>
                    </div>
                    <div class="erp-card-body d-form-row">
                        <input type="hidden" id="edit-i-id">
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Date</label><input type="date" id="out-date" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; background:#f8fafc;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Vehicle / Machine</label><input type="text" id="out-target" list="vehicle-list" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Volume (Litre)</label><input type="number" id="out-qty" step="0.01" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; font-weight:bold; color:#e74c3c;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Driver Name</label><input type="text" id="out-driver" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;"></div>
                        <div style="display:flex; gap:10px;">
                            <button id="out-save-btn" class="d-btn" style="background:#e74c3c;" onclick="DieselModule.saveIssue()">- ISSUE FUEL</button>
                            <button id="out-cancel-btn" class="d-btn" style="background:#64748b; display:none;" onclick="DieselModule.cancelIssueEdit()">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="d-payment-page" class="d-page" style="display:none;">
                <div class="erp-card">
                    <div class="erp-card-header" style="border-top: 3px solid #8e44ad;">
                        <span><span style="font-size: 16px;">💸</span> VENDOR PAYMENT ENTRY</span>
                    </div>
                    <div class="erp-card-body d-form-row">
                        <input type="hidden" id="edit-pay-id">
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Date</label><input type="date" id="pay-date" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; background:#f8fafc;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Vendor/Party</label><input type="text" id="pay-source" list="party-list" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Amount Paid (₹)</label><input type="number" id="pay-amt" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; font-weight:bold; color:#8e44ad;"></div>
                        <div style="display:flex; gap:10px;">
                            <button id="pay-save-btn" class="d-btn" style="background:#8e44ad;" onclick="DieselModule.savePayment()">RECORD PAYMENT</button>
                            <button id="pay-cancel-btn" class="d-btn" style="background:#64748b; display:none;" onclick="DieselModule.cancelPaymentEdit()">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="d-p-history-page" class="d-page" style="display:none;">
                <div class="erp-card">
                    <div class="erp-card-header"><span>📜 FUEL PURCHASE LEDGER</span></div>
                    <div id="p-history-content" class="table-responsive"></div>
                </div>
            </div>
            
            <div id="d-p-ledger-page" class="d-page" style="display:none;">
                <div class="erp-card">
                    <div class="erp-card-header"><span>✏️ FULL HISTORY (EDIT / DELETE)</span></div>
                    <div id="p-ledger-content" class="table-responsive"></div>
                </div>
            </div>
            
            <div id="d-ledger-page" class="d-page" style="display:none;">
                <div class="erp-card no-print">
                    <div class="erp-card-body d-form-row" style="background:#f8fafc;">
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Search Vehicle/Machine</label><input type="text" id="l-search" list="vehicle-list" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;"></div>
                        <div><button class="d-btn" style="background:#3b82f6;" onclick="DieselModule.loadLedger()">VIEW VEHICLE LOG</button></div>
                        <div><button class="d-btn" style="background:#1e293b;" onclick="window.print()">🖨️ PRINT LOG</button></div>
                    </div>
                </div>
                <div id="ledger-view" style="display:none;">
                    <div class="d-stat-card" id="l-stats" style="margin-bottom:15px; border-bottom: 4px solid #e74c3c;"></div>
                    <div id="ledger-content" class="table-responsive"></div>
                </div>
            </div>

            <div id="d-backup-page" class="d-page" style="display:none;">
                <div class="erp-card">
                    <div class="erp-card-header"><span>⚙️ DATA MIGRATION & BACKUP</span></div>
                    <div class="erp-card-body" style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <div style="flex: 1; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background:#f8fafc;">
                            <h4 style="margin-top:0; color:#1e293b;">Export Cloud Backup</h4>
                            <button onclick="DieselModule.exportBackup()" class="d-btn" style="background:#10b981;">DOWNLOAD JSON</button>
                        </div>
                        <div style="flex: 1; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background:#f8fafc;">
                            <h4 style="margin-top:0; color:#1e293b;">Import Local Backup</h4>
                            <input type="file" id="importFile" accept=".json" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #cbd5e1; border-radius:4px; background:white;">
                            <button onclick="DieselModule.importBackup()" class="d-btn" style="background:#f59e0b;">RESTORE SYSTEM</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    showTab: function(p, btn) {
        document.querySelectorAll('.d-page').forEach(div => div.style.display='none');
        document.getElementById('d-' + p + '-page').style.display='block';
        
        if(btn) {
            document.querySelectorAll('.d-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        if(p === 'dash') this.updateStockDash();
        if(p === 'p-history') this.loadPurchaseHistory();
        if(p === 'p-ledger') this.loadHistoryEdit();
    },

    savePurchase: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const id = document.getElementById('edit-p-id').value;
        const q = this.safe(document.getElementById('in-qty').value);
        const r = this.safe(document.getElementById('in-rate').value);
        const source = document.getElementById('in-source').value.trim().toUpperCase();
        
        if(!source || q <= 0) return alert("Please enter valid Party Name and Quantity!");

        const data = { 
            id: id ? parseInt(id) : Date.now(), 
            date: document.getElementById('in-date').value, 
            source: source, 
            qty: q, 
            rate: r, 
            amount: q * r,
            ghat: currentGhat
        };

        if(id) {
            App.db.diesel_purchase = App.db.diesel_purchase.map(p => p.id == id ? data : p);
            this.cancelPurchaseEdit();
            alert("✅ Stock Entry Updated!");
        } else {
            App.db.diesel_purchase.push(data);
            alert("✅ Stock Saved!");
        }

        App.saveToLocalStorage();
        this.showTab('dash', document.querySelector('.d-tab-btn'));
        document.getElementById('in-qty').value = "";
    },

    cancelPurchaseEdit: function() {
        document.getElementById('edit-p-id').value = "";
        document.getElementById('in-qty').value = "";
        document.getElementById('in-source').value = "";
        document.getElementById('in-date').value = new Date().toISOString().split('T')[0];
        
        const saveBtn = document.getElementById('in-save-btn');
        saveBtn.innerText = "+ ADD STOCK";
        saveBtn.style.background = "#27ae60";
        document.getElementById('in-cancel-btn').style.display = "none";
    },

    saveIssue: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const id = document.getElementById('edit-i-id').value;
        const q = this.safe(document.getElementById('out-qty').value);
        const target = document.getElementById('out-target').value.trim().toUpperCase();
        
        if(!target || q <= 0) return alert("Please enter valid Vehicle/Machine and Quantity!");

        const data = { 
            id: id ? parseInt(id) : Date.now(), 
            date: document.getElementById('out-date').value, 
            target: target, 
            qty: q, 
            driver: document.getElementById('out-driver').value.trim(),
            ghat: currentGhat
        };

        if(id) {
            App.db.diesel_issue = App.db.diesel_issue.map(i => i.id == id ? data : i);
            this.cancelIssueEdit();
            alert("✅ Issue Log Updated!");
        } else {
            App.db.diesel_issue.push(data);
            alert("✅ Fuel Issued!");
        }

        App.saveToLocalStorage();
        this.showTab('dash', document.querySelector('.d-tab-btn'));
        document.getElementById('out-qty').value = "";
    },

    cancelIssueEdit: function() {
        document.getElementById('edit-i-id').value = "";
        document.getElementById('out-qty').value = "";
        document.getElementById('out-target').value = "";
        document.getElementById('out-driver').value = "";
        document.getElementById('out-date').value = new Date().toISOString().split('T')[0];
        
        const saveBtn = document.getElementById('out-save-btn');
        saveBtn.innerText = "- ISSUE FUEL";
        saveBtn.style.background = "#e74c3c";
        document.getElementById('out-cancel-btn').style.display = "none";
    },

    savePayment: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const id = document.getElementById('edit-pay-id').value;
        const amt = this.safe(document.getElementById('pay-amt').value);
        const source = document.getElementById('pay-source').value.trim().toUpperCase();
        
        if(!source || amt <= 0) return alert("Please enter valid Party and Amount!");

        const data = { 
            id: id ? parseInt(id) : Date.now(), 
            date: document.getElementById('pay-date').value, 
            source: source, 
            amt: amt,
            ghat: currentGhat
        };

        if(id) {
            App.db.diesel_payments = App.db.diesel_payments.map(p => p.id == id ? data : p);
            this.cancelPaymentEdit();
            alert("✅ Payment Updated!");
        } else {
            App.db.diesel_payments.push(data);
            alert("✅ Payment Recorded!");
        }
        
        App.saveToLocalStorage();
        this.showTab('dash', document.querySelector('.d-tab-btn'));
        document.getElementById('pay-amt').value = "";
    },

    cancelPaymentEdit: function() {
        document.getElementById('edit-pay-id').value = "";
        document.getElementById('pay-amt').value = "";
        document.getElementById('pay-source').value = "";
        document.getElementById('pay-date').value = new Date().toISOString().split('T')[0];
        
        const saveBtn = document.getElementById('pay-save-btn');
        saveBtn.innerText = "RECORD PAYMENT";
        saveBtn.style.background = "#8e44ad";
        document.getElementById('pay-cancel-btn').style.display = "none";
    },

    updateStockDash: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const printGhatTitle = document.getElementById('print-d-ghat-title');
        if(printGhatTitle) printGhatTitle.innerText = currentGhat.toUpperCase();

        const start = document.getElementById('f-start')?.value;
        const end = document.getElementById('f-end')?.value;
        
        // 🔹 Update the Print Header Date Range
        const dateRangeEl = document.getElementById('print-d-date-range');
        if (dateRangeEl) {
            if (start && end) {
                dateRangeEl.innerText = `🗓️ REPORT PERIOD: ${start.split('-').reverse().join('/')} TO ${end.split('-').reverse().join('/')}`;
            } else if (start) {
                dateRangeEl.innerText = `🗓️ REPORT FROM: ${start.split('-').reverse().join('/')}`;
            } else if (end) {
                dateRangeEl.innerText = `🗓️ REPORT UPTO: ${end.split('-').reverse().join('/')}`;
            } else {
                dateRangeEl.innerText = `🗓️ ALL TIME REPORT`;
            }
        }

        let today = new Date().toISOString().split('T')[0];
        let limit = end || today;
        let tInAll = 0, tOutAll = 0;
        
        let filteredPurchase = App.db.diesel_purchase.filter(p => !p.ghat || p.ghat === currentGhat);
        let filteredIssue = App.db.diesel_issue.filter(i => !i.ghat || i.ghat === currentGhat);
        let filteredPayments = App.db.diesel_payments.filter(py => !py.ghat || py.ghat === currentGhat);

        filteredPurchase.filter(p => p.date <= limit).forEach(p => tInAll += this.safe(p.qty));
        filteredIssue.filter(i => i.date <= limit).forEach(i => tOutAll += this.safe(i.qty));
        let closing = tInAll - tOutAll;
        
        let dIn=0, dOut=0, dBill=0, dPaid=0, logs=[];
        
        if(start && end) {
            filteredPurchase.filter(p => p.date >= start && p.date <= end).forEach(p => { dIn += this.safe(p.qty); dBill += this.safe(p.amount); });
            filteredIssue.filter(i => i.date >= start && i.date <= end).forEach(i => dOut += this.safe(i.qty));
            filteredPayments.filter(py => py.date >= start && py.date <= end).forEach(py => dPaid += this.safe(py.amt));
            logs = [...filteredPurchase.filter(p => p.date >= start && p.date <= end).map(p=>({...p, m:'IN'})), ...filteredIssue.filter(i => i.date >= start && i.date <= end).map(i=>({...i, m:'OUT'}))];
        } else {
            filteredPurchase.forEach(p => { dIn += this.safe(p.qty); dBill += this.safe(p.amount); });
            filteredIssue.forEach(i => dOut += this.safe(i.qty));
            filteredPayments.forEach(py => dPaid += this.safe(py.amt));
            logs = [...filteredPurchase.map(p=>({...p, m:'IN'})), ...filteredIssue.map(i=>({...i, m:'OUT'}))];
        }
        
        const cardsHTML = `
            <div class="d-stat-card" style="border-bottom-color:#3498db"><h4>Current Stock Balance</h4><h2>${closing.toFixed(2)} L</h2></div>
            <div class="d-stat-card" style="border-bottom-color:#27ae60"><h4>Fuel Purchased</h4><h2>${dIn.toFixed(2)} L</h2></div>
            <div class="d-stat-card" style="border-bottom-color:#e74c3c"><h4>Fuel Issued</h4><h2>${dOut.toFixed(2)} L</h2></div>
            <div class="d-stat-card" style="border-bottom-color:#f39c12"><h4>Total Bill Value</h4><h2>₹${dBill.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h2></div>
            <div class="d-stat-card" style="border-bottom-color:#8e44ad"><h4>Pending Balance Due</h4><h2 style="color:#e74c3c;">₹${(dBill-dPaid).toLocaleString('en-IN', {minimumFractionDigits: 2})}</h2></div>`;
        
        if(document.getElementById('stock-cards')) document.getElementById('stock-cards').innerHTML = cardsHTML;
        
        let html = "";
        logs.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10).forEach(l => {
            html += `<tr>
                <td style="text-align: center; font-weight:bold; color:#0f172a;">${l.date.split('-').reverse().join('/')}</td>
                <td style="text-align: center; font-weight:bold; color:#334155;">${l.source || l.target}</td>
                <td style="text-align: center; font-weight:bold; font-size:11px; color:${l.m === 'IN' ? '#27ae60' : '#e74c3c'}"><span style="background:${l.m === 'IN' ? '#dcfce7' : '#fee2e2'}; padding:4px 10px; border-radius:4px; border:1px solid ${l.m === 'IN' ? '#86efac' : '#fca5a5'};">${l.m === 'IN' ? '📥 STOCK IN' : '📤 STOCK OUT'}</span></td>
                <td style="text-align: center; font-weight:900; color:${l.m === 'IN' ? '#27ae60' : '#e74c3c'}">${l.qty.toFixed(2)} L</td>
                <td class="no-print" style="text-align: center;">
                    <button class="badge-btn badge-edit" onclick="DieselModule.editItem('${l.m}', ${l.id})">Edit</button>
                    <button class="badge-btn badge-delete" onclick="DieselModule.del('${l.m}', ${l.id})">Del</button>
                </td>
            </tr>`;
        });
        
        if(document.getElementById('recent-logs')) {
            document.getElementById('recent-logs').innerHTML = html || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8; font-weight:bold;">No logs found</td></tr>';
        }
        this.updateAutoSuggestions();
    },

    loadPurchaseHistory: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        let filteredPurchase = App.db.diesel_purchase.filter(p => !p.ghat || p.ghat === currentGhat);

        let html = `<table class="erp-table"><thead><tr><th>Date</th><th>Party Name</th><th style="text-align:right;">Qty (L)</th><th style="text-align:right;">Rate (₹)</th><th style="text-align:right;">Total Bill (₹)</th></tr></thead><tbody>`;
        filteredPurchase.sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(p => {
            html += `<tr>
                <td style="font-weight:bold;">${p.date.split('-').reverse().join('/')}</td>
                <td style="font-weight:bold; color:#1e293b;">${p.source}</td>
                <td style="text-align:right; font-weight:900; color:#27ae60;">${p.qty.toFixed(2)} L</td>
                <td style="text-align:right; color:#475569;">₹${p.rate}</td>
                <td style="text-align:right; font-weight:900; color:#b91c1c;">₹${this.safe(p.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            </tr>`;
        });
        document.getElementById('p-history-content').innerHTML = html + `</tbody></table>`;
    },

    loadHistoryEdit: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        let filteredPurchase = App.db.diesel_purchase.filter(p => !p.ghat || p.ghat === currentGhat);
        let filteredIssue = App.db.diesel_issue.filter(i => !i.ghat || i.ghat === currentGhat);
        let filteredPay = App.db.diesel_payments.filter(y => !y.ghat || y.ghat === currentGhat);

        let html = `<table class="erp-table"><thead><tr><th>Date</th><th>Details</th><th style="text-align:right;">Qty / Amount</th><th class="no-print" style="text-align:center;">Action</th></tr></thead><tbody>`;
        
        let allLogs = [
            ...filteredPurchase.map(p => ({...p, type: 'IN', title: p.source + ' (Purchase)'})),
            ...filteredIssue.map(i => ({...i, type: 'OUT', title: i.target + ' (Issue)'})),
            ...filteredPay.map(y => ({...y, type: 'PAY', title: y.source + ' (Payment)'}))
        ].sort((a,b) => new Date(b.date) - new Date(a.date));

        allLogs.forEach(log => {
            let valStr = log.type === 'PAY' ? `₹${log.amt.toFixed(2)}` : `${log.qty.toFixed(2)} L`;
            let valCol = log.type === 'IN' ? '#27ae60' : (log.type === 'OUT' ? '#e74c3c' : '#8e44ad');
            
            html += `<tr>
                <td style="font-weight:bold;">${log.date.split('-').reverse().join('/')}</td>
                <td style="font-weight:bold; color:#1e293b;">${log.title}</td>
                <td style="text-align:right; font-weight:900; color:${valCol};">${valStr}</td>
                <td class="no-print" style="text-align:center;">
                    <button class="badge-btn badge-edit" onclick="DieselModule.editItem('${log.type}', ${log.id})">Edit</button>
                    <button class="badge-btn badge-delete" onclick="DieselModule.del('${log.type}', ${log.id})">Del</button>
                </td>
            </tr>`;
        });
        document.getElementById('p-ledger-content').innerHTML = html + `</tbody></table>`;
    },

    loadLedger: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const headerEl = document.getElementById('print-d-ghat-title');
        if(headerEl) headerEl.innerText = currentGhat.toUpperCase();
        
        // 🔹 Update Print Header Date Range for Ledger
        const dateRangeEl = document.getElementById('print-d-date-range');
        if (dateRangeEl) {
            dateRangeEl.innerText = `🗓️ VEHICLE LEDGER REPORT`;
        }

        const s = document.getElementById('l-search').value.trim().toUpperCase();
        if(!s) return;
        const filtered = App.db.diesel_issue.filter(i => (!i.ghat || i.ghat === currentGhat) && i.target === s).sort((a,b)=>new Date(a.date)-new Date(b.date));
        
        document.getElementById('ledger-view').style.display='block';
        let total = 0;
        let html = `<table class="erp-table"><thead><tr><th style="text-align:center;">Date</th><th>Vehicle/Machine</th><th>Driver</th><th style="text-align:right;">Fuel Issued (Qty)</th></tr></thead><tbody>`;
        filtered.forEach(f => { 
            total += this.safe(f.qty); 
            html += `<tr>
                <td style="text-align:center; font-weight:bold;">${f.date.split('-').reverse().join('/')}</td>
                <td style="font-weight:bold; color:#1e293b;">${f.target}</td>
                <td style="color:#64748b;">${f.driver || '-'}</td>
                <td style="text-align:right; font-weight:900; color:#e74c3c;">${f.qty.toFixed(2)} L</td>
            </tr>`; 
        });
        
        document.getElementById('l-stats').innerHTML = `<h4 style="margin:0; font-size:12px; color:#475569;">Total Fuel Issued to <span style="color:#1e293b; font-weight:900;">${s}</span></h4><h2 style="margin:5px 0 0 0; font-size:24px; color:#e74c3c; font-weight:900;">${total.toFixed(2)} Litres</h2>`;
        document.getElementById('ledger-content').innerHTML = html + `</tbody></table>`;
    },

    editItem: function(m, id) {
        if(m === 'IN') {
            const i = App.db.diesel_purchase.find(p => p.id === id);
            document.getElementById('edit-p-id').value = i.id;
            document.getElementById('in-date').value = i.date;
            document.getElementById('in-source').value = i.source;
            document.getElementById('in-qty').value = i.qty;
            document.getElementById('in-rate').value = i.rate;
            
            const btn = document.getElementById('in-save-btn');
            btn.innerText = "↻ UPDATE STOCK";
            btn.style.background = "#f59e0b";
            document.getElementById('in-cancel-btn').style.display = "block";
            this.showTab('purchase');
            
        } else if(m === 'OUT') {
            const i = App.db.diesel_issue.find(x => x.id === id);
            document.getElementById('edit-i-id').value = i.id;
            document.getElementById('out-date').value = i.date;
            document.getElementById('out-target').value = i.target;
            document.getElementById('out-qty').value = i.qty;
            document.getElementById('out-driver').value = i.driver || '';
            
            const btn = document.getElementById('out-save-btn');
            btn.innerText = "↻ UPDATE ISSUE";
            btn.style.background = "#f59e0b";
            document.getElementById('out-cancel-btn').style.display = "block";
            this.showTab('issue');
            
        } else if (m === 'PAY') {
            const i = App.db.diesel_payments.find(x => x.id === id);
            document.getElementById('edit-pay-id').value = i.id;
            document.getElementById('pay-date').value = i.date;
            document.getElementById('pay-source').value = i.source;
            document.getElementById('pay-amt').value = i.amt;
            
            const btn = document.getElementById('pay-save-btn');
            btn.innerText = "↻ UPDATE PAYMENT";
            btn.style.background = "#f59e0b";
            document.getElementById('pay-cancel-btn').style.display = "block";
            this.showTab('payment');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    del: function(m, id) {
        if(!confirm("⚠️ Are you sure you want to delete this log?")) return;
        if(m === 'IN') App.db.diesel_purchase = App.db.diesel_purchase.filter(p => p.id !== id); 
        else if(m === 'OUT') App.db.diesel_issue = App.db.diesel_issue.filter(i => i.id !== id);
        else if(m === 'PAY') App.db.diesel_payments = App.db.diesel_payments.filter(y => y.id !== id);
        
        App.saveToLocalStorage(); 
        this.loadHistoryEdit();
        this.updateStockDash();
    },

    resetDashFilter: function() { 
        document.getElementById('f-start').value = ""; 
        document.getElementById('f-end').value = ""; 
        this.updateStockDash(); 
    },

    updateAutoSuggestions: function() { 
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const v = [...new Set(App.db.diesel_issue.filter(i => !i.ghat || i.ghat === currentGhat).map(i => i.target))]; 
        const p = [...new Set(App.db.diesel_purchase.filter(i => !i.ghat || i.ghat === currentGhat).map(i => i.source))]; 
        if(document.getElementById('vehicle-list')) document.getElementById('vehicle-list').innerHTML = v.map(i => `<option value="${i}">`).join(''); 
        if(document.getElementById('party-list')) document.getElementById('party-list').innerHTML = p.map(i => `<option value="${i}">`).join(''); 
    },

    exportBackup: function() {
        const backupData = {
            purchase: App.db.diesel_purchase,
            issue: App.db.diesel_issue,
            payments: App.db.diesel_payments
        };
        const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `DIESEL_CLOUD_BACKUP.json`;
        a.click();
    },

    importBackup: function() {
        const fileInput = document.getElementById('importFile');
        if (fileInput.files.length === 0) return alert("Select File!");
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm("⚠️ Replace all Diesel Data with this file? This cannot be undone!")) {
                    App.db.diesel_purchase = data.purchase || [];
                    App.db.diesel_issue = data.issue || [];
                    App.db.diesel_payments = data.payments || [];
                    App.saveToLocalStorage();
                    alert("✅ Import Successful!");
                    DieselModule.showTab('dash', document.querySelector('.d-tab-btn'));
                }
            } catch (err) { alert("❌ Invalid File!"); }
        };
        reader.readAsText(fileInput.files[0]);
    }
};
