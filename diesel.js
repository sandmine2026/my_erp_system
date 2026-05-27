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
        // 🔹 গ্লোবাল ঘাট সিলেকশন
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        
        return `
            <style>
                .d-tab-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border-left: 5px solid #d35400; }
                .d-tab-btn { padding: 10px 15px; border: none; background: #f8f9fa; cursor: pointer; font-weight: bold; border-radius: 6px; color: #2c3e50; font-size:12px; transition: 0.3s; }
                .d-tab-btn:hover, .d-tab-btn.active { background: #d35400; color: white; }
                .d-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); margin-bottom: 25px; border-top: 4px solid #d35400; }
                .d-dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 25px; }
                .d-stat-card { background: white; padding: 12px 10px; border-radius: 10px; text-align: center; border-bottom: 4px solid #d35400; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .d-stat-card h4 { margin: 0; color: #7f8c8d; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
                .d-stat-card h2 { margin: 8px 0 0; color: #2c3e50; font-size: 16px; font-weight: bold; }
                .d-form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 15px; align-items: end; }
                .d-btn { background: #3498db; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; }
                .d-hl-red { color: #e74c3c; font-weight:bold; }
                .d-hl-green { color: #27ae60; font-weight:bold; }
                .d-table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #fff; border: 1px solid #ddd; }
                .d-table th { background: #f8f9fa; color: #333; padding: 10px; font-size: 11px; border: 1px solid #ddd; text-transform: uppercase; }
                .d-table td { padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 600; font-size: 12px; }
                
                /* 🎯 ডিজেল প্রিন্ট হেডারের জন্য সিএসএস */
                @media print { 
                    #diesel-print-logo-row, #d-ledger-print-header { display: table-row !important; } 
                    .no-print { display: none !important; }
                }
            </style>

            <datalist id="vehicle-list"></datalist>
            <datalist id="party-list"></datalist>

            <div class="d-tab-bar no-print">
                <button class="d-tab-btn active" onclick="DieselModule.showTab('dash', this)">📊 Dashboard</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('purchase', this)">📥 Stock IN Entry</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('issue', this)">📤 Stock OUT Entry</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('payment', this)">💸 Party Payment</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('p-history', this)">📜 Stock IN History</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('p-ledger', this)">✏️ Edit/Del Ledger</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('ledger', this)">🚛 Vehicle Ledger</button>
                <button class="d-tab-btn" onclick="DieselModule.showTab('backup', this)" style="color: #d35400;">⚙️ Backup & Restore</button>
            </div>

            <div id="d-dash-page" class="d-page">
                <div class="d-card no-print" style="border-top:none; background:#fff; padding:15px; display:flex; align-items:flex-end; gap:15px; border-left:5px solid #3498db;">
                    <div style="flex:1"><label style="font-size:11px; font-weight:bold; color:#555;">From Date:</label><input type="date" id="f-start" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                    <div style="flex:1"><label style="font-size:11px; font-weight:bold; color:#555;">To Date:</label><input type="date" id="f-end" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                    <button class="d-btn" style="width:100px" onclick="DieselModule.updateStockDash()">FILTER</button>
                    <button class="d-btn" style="background:#7f8c8d; width:100px" onclick="DieselModule.resetDashFilter()">RESET</button>
                    <button class="d-btn" style="background:var(--p-color); width:100px" onclick="window.print()">🖨️ PRINT</button>
                </div>
                <div class="d-dash-grid" id="stock-cards"></div>
                <div class="d-card">
                    <h3 id="logs-title" style="margin-top:0; color:#34495e;">Recent Transactions</h3>
                    <div class="table-responsive">
                        <table class="d-table">
                            <thead>
                                <tr id="diesel-print-logo-row" style="display:none; background:#f8f9fa !important; border-bottom: 2px solid #333; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <th colspan="5" style="padding: 15px; border: 1px solid #333; text-align: center;">
                                        <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                                            <img src="assets/sandmine.png" alt="Logo" style="height: 40px; width: auto; border-radius: 4px;">
                                            <span id="d-dynamic-ghat-name" style="font-size: 18px; font-weight: bold; color:#2c3e50;">${currentGhat.toUpperCase()} DIESEL REPORT</span>
                                        </div>
                                    </th>
                                </tr>
                                <tr style="background:#1e3a5f; color:white;">
                                    <th style="padding: 10px; border: 1px solid #333; color: white !important;">Date</th>
                                    <th style="padding: 10px; border: 1px solid #333; color: white !important;">Vehicle / Party</th>
                                    <th style="padding: 10px; border: 1px solid #333; color: white !important;">Entry Type</th>
                                    <th style="padding: 10px; border: 1px solid #333; color: white !important;">Qty (Litre)</th>
                                    <th class="no-print" style="padding: 10px; border: 1px solid #333; color: white !important; width:60px;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="recent-logs"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div id="d-purchase-page" class="d-page" style="display:none;">
                <div class="d-card">
                    <h3 style="margin-top:0; color:#34495e;">Diesel Purchase (Stock IN)</h3>
                    <div class="d-form-row">
                        <input type="hidden" id="edit-p-id">
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Date</label><input type="date" id="in-date" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Party</label><input type="text" id="in-source" list="party-list" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Litre</label><input type="number" id="in-qty" step="0.01" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Rate</label><input type="number" id="in-rate" value="92.49" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><button class="d-btn" onclick="DieselModule.savePurchase()">Save Online</button></div>
                    </div>
                </div>
            </div>

            <div id="d-issue-page" class="d-page" style="display:none;">
                <div class="d-card">
                    <h3 style="margin-top:0; color:#34495e;">Issue Diesel (Stock OUT)</h3>
                    <div class="d-form-row">
                        <input type="hidden" id="edit-i-id">
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Date</label><input type="date" id="out-date" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Vehicle/Machine</label><input type="text" id="out-target" list="vehicle-list" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Litre</label><input type="number" id="out-qty" step="0.01" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Driver</label><input type="text" id="out-driver" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><button class="d-btn" style="background:#e74c3c" onclick="DieselModule.saveIssue()">Confirm Issue</button></div>
                    </div>
                </div>
            </div>

            <div id="d-payment-page" class="d-page" style="display:none;">
                <div class="d-card">
                    <h3 style="margin-top:0; color:#34495e;">Payment Entry</h3>
                    <div class="d-form-row">
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Date</label><input type="date" id="pay-date" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Party</label><input type="text" id="pay-source" list="party-list" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Amount</label><input type="number" id="pay-amt" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><button class="d-btn" style="background:#27ae60" onclick="DieselModule.savePayment()">Save Payment</button></div>
                    </div>
                </div>
            </div>

            <div id="d-p-history-page" class="d-page" style="display:none;"><div class="d-card"><h3 style="margin-top:0;">Detailed Purchase History</h3><div id="p-history-content" class="table-responsive"></div></div></div>
            <div id="d-p-ledger-page" class="d-page" style="display:none;"><div class="d-card"><h3 style="margin-top:0;">Edit/Delete Ledger</h3><div id="p-ledger-content" class="table-responsive"></div></div></div>
            
            <div id="d-ledger-page" class="d-page" style="display:none;">
                <div class="d-card no-print">
                    <h3 style="margin-top:0; color:#34495e;">Search Vehicle Ledger</h3>
                    <div class="d-form-row">
                        <div><label style="font-size:11px; font-weight:bold; color:#555;">Vehicle</label><input type="text" id="l-search" list="vehicle-list" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div><button class="d-btn" onclick="DieselModule.loadLedger()">View Report</button></div>
                        <div><button class="d-btn" style="background:var(--p-color);" onclick="window.print()">🖨️ PRINT</button></div>
                    </div>
                </div>
                <div id="ledger-view" style="display:none;">
                    <div id="d-ledger-print-header" style="display:none; text-align:center; margin-bottom:15px; border-bottom:2px solid #000; padding-bottom:10px;">
                        <h2 id="d-ledger-ghat-name" style="margin:0; font-size:22px; color:#2c3e50;">${currentGhat.toUpperCase()} DIESEL LEDGER</h2>
                    </div>
                    <div class="d-stat-card" id="l-stats" style="margin-bottom:15px;"></div>
                    <div id="ledger-content" class="table-responsive"></div>
                </div>
            </div>

            <div id="d-backup-page" class="d-page" style="display:none;">
                <div class="d-card">
                    <h3 style="margin-top:0; color:#34495e;">Migration & Local Backup</h3>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <div style="flex: 1; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h4 style="margin-top:0;">Download Backup</h4>
                            <button onclick="DieselModule.exportBackup()" class="d-btn" style="background:#27ae60;">Export JSON</button>
                        </div>
                        <div style="flex: 1; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h4 style="margin-top:0;">Upload from Old File</h4>
                            <input type="file" id="importFile" accept=".json" style="width:100%; padding:10px; margin-bottom:10px;">
                            <button onclick="DieselModule.importBackup()" class="d-btn" style="background:#e67e22;">Import to System</button>
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
        const data = { 
            id: id ? parseInt(id) : Date.now(), 
            date: document.getElementById('in-date').value, 
            source: document.getElementById('in-source').value.trim().toUpperCase(), 
            qty: q, 
            rate: r, 
            amount: q * r,
            ghat: currentGhat // 🔹 ঘাট ফিল্টার সেভ
        };

        if(!data.source || q <= 0) return alert("Please enter valid Party Name and Quantity!");

        if(id) {
            App.db.diesel_purchase = App.db.diesel_purchase.map(p => p.id == id ? data : p);
        } else {
            App.db.diesel_purchase.push(data);
        }

        App.saveToLocalStorage();
        this.showTab('dash', document.querySelector('.d-tab-btn'));
        document.getElementById('edit-p-id').value = "";
        document.getElementById('in-qty').value = "";
    },

    saveIssue: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const id = document.getElementById('edit-i-id').value;
        const q = this.safe(document.getElementById('out-qty').value);
        const target = document.getElementById('out-target').value.trim().toUpperCase();
        const data = { 
            id: id ? parseInt(id) : Date.now(), 
            date: document.getElementById('out-date').value, 
            target: target, 
            qty: q, 
            driver: document.getElementById('out-driver').value.trim(),
            ghat: currentGhat // 🔹 ঘাট ফিল্টার সেভ
        };

        if(!target || q <= 0) return alert("Please enter valid Vehicle/Machine and Quantity!");

        if(id) {
            App.db.diesel_issue = App.db.diesel_issue.map(i => i.id == id ? data : i);
        } else {
            App.db.diesel_issue.push(data);
        }

        App.saveToLocalStorage();
        this.showTab('dash', document.querySelector('.d-tab-btn'));
        document.getElementById('edit-i-id').value = "";
        document.getElementById('out-qty').value = "";
    },

    savePayment: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const amt = this.safe(document.getElementById('pay-amt').value);
        const source = document.getElementById('pay-source').value.trim().toUpperCase();
        
        if(!source || amt <= 0) return alert("Please enter valid Party and Amount!");

        App.db.diesel_payments.push({ 
            id: Date.now(), 
            date: document.getElementById('pay-date').value, 
            source: source, 
            amt: amt,
            ghat: currentGhat // 🔹 ঘাট ফিল্টার সেভ
        });
        
        App.saveToLocalStorage();
        this.showTab('dash', document.querySelector('.d-tab-btn'));
        document.getElementById('pay-amt').value = "";
    },

    updateStockDash: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const titleEl = document.getElementById('d-dynamic-ghat-name');
        if(titleEl) titleEl.innerText = currentGhat.toUpperCase() + " DIESEL REPORT";

        const start = document.getElementById('f-start')?.value;
        const end = document.getElementById('f-end')?.value;
        let today = new Date().toISOString().split('T')[0];
        let limit = end || today;
        let tInAll = 0, tOutAll = 0;
        
        // 🔹 ডাটাবেসকে ঘাট অনুযায়ী ফিল্টার করা হচ্ছে (!p.ghat দেওয়া আছে পুরনো ডাটার ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য)
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
            <div class="d-stat-card" style="border-bottom-color:#3498db"><h4>Closing Stock</h4><h2>${closing.toFixed(1)} L</h2></div>
            <div class="d-stat-card" style="border-bottom-color:#27ae60"><h4>Range IN</h4><h2>${dIn.toFixed(1)} L</h2></div>
            <div class="d-stat-card" style="border-bottom-color:#e74c3c"><h4>Range OUT</h4><h2>${dOut.toFixed(1)} L</h2></div>
            <div class="d-stat-card"><h4>Bill Total</h4><h2>₹${dBill.toLocaleString('en-IN')}</h2></div>
            <div class="d-stat-card" style="border-bottom-color:#e74c3c"><h4>Balance Due</h4><h2>₹${(dBill-dPaid).toLocaleString('en-IN')}</h2></div>`;
        
        if(document.getElementById('stock-cards')) document.getElementById('stock-cards').innerHTML = cardsHTML;
        
        let html = "";
        logs.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10).forEach(l => {
            html += `<tr>
                <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size:12px;">${l.date.split('-').reverse().join('/')}</td>
                <td style="padding: 8px; border: 1px solid #333; text-align: center; font-weight:bold; font-size:12px;">${l.source || l.target}</td>
                <td style="padding: 8px; border: 1px solid #333; text-align: center; font-weight:bold; font-size:12px; color:${l.m === 'IN' ? '#27ae60' : '#e74c3c'}">${l.m === 'IN' ? 'STOCK IN (+)' : 'STOCK OUT (-)'}</td>
                <td style="padding: 8px; border: 1px solid #333; text-align: center; font-weight:bold; font-size:13px; color:${l.m === 'IN' ? '#27ae60' : '#e74c3c'}">${l.qty.toFixed(2)} L</td>
                <td class="no-print" style="padding: 8px; border: 1px solid #333; text-align: center;">
                    <button class="d-btn" style="padding:5px 10px; width:auto; font-size:11px;" onclick="DieselModule.editItem('${l.m}', ${l.id})">Edit</button>
                </td>
            </tr>`;
        });
        
        if(document.getElementById('recent-logs')) {
            document.getElementById('recent-logs').innerHTML = html || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #7f8c8d;">No Logs Found</td></tr>';
        }
        this.updateAutoSuggestions();
    },

    loadPurchaseHistory: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        let filteredPurchase = App.db.diesel_purchase.filter(p => !p.ghat || p.ghat === currentGhat);

        let html = `<table class="d-table"><thead><tr><th>Date</th><th>Party Name</th><th>Qty (L)</th><th>Rate</th><th>Total</th></tr></thead><tbody>`;
        filteredPurchase.sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(p => {
            html += `<tr><td>${p.date.split('-').reverse().join('/')}</td><td>${p.source}</td><td class="d-hl-green">${p.qty} L</td><td>₹${p.rate}</td><td>₹${this.safe(p.amount).toLocaleString('en-IN')}</td></tr>`;
        });
        document.getElementById('p-history-content').innerHTML = html + `</tbody></table>`;
    },

    loadHistoryEdit: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        let filteredPurchase = App.db.diesel_purchase.filter(p => !p.ghat || p.ghat === currentGhat);
        let filteredIssue = App.db.diesel_issue.filter(i => !i.ghat || i.ghat === currentGhat);

        let html = `<table class="d-table"><thead><tr><th>Date</th><th>Details</th><th>Qty</th><th class="no-print">Action</th></tr></thead><tbody>`;
        filteredPurchase.sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(p => {
            html += `<tr><td>${p.date}</td><td>${p.source} (IN)</td><td class="d-hl-green">${p.qty} L</td><td class="no-print"><button style="color:#e74c3c; background:none; border:none; cursor:pointer; font-weight:bold;" onclick="DieselModule.del('IN', ${p.id})">Del</button></td></tr>`;
        });
        filteredIssue.sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(i => {
            html += `<tr><td>${i.date}</td><td>${i.target} (OUT)</td><td class="d-hl-red">${i.qty} L</td><td class="no-print"><button style="color:#e74c3c; background:none; border:none; cursor:pointer; font-weight:bold;" onclick="DieselModule.del('OUT', ${i.id})">Del</button></td></tr>`;
        });
        document.getElementById('p-ledger-content').innerHTML = html + `</tbody></table>`;
    },

    loadLedger: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const headerEl = document.getElementById('d-ledger-ghat-name');
        if(headerEl) headerEl.innerText = currentGhat.toUpperCase() + " DIESEL LEDGER";

        const s = document.getElementById('l-search').value.trim().toUpperCase();
        if(!s) return;
        const filtered = App.db.diesel_issue.filter(i => (!i.ghat || i.ghat === currentGhat) && i.target === s).sort((a,b)=>new Date(a.date)-new Date(b.date));
        
        document.getElementById('ledger-view').style.display='block';
        let total = 0;
        let html = `<table class="d-table"><thead><tr style="background:#1e3a5f; color:white;"><th>Date</th><th>Driver</th><th>Qty</th></tr></thead><tbody>`;
        filtered.forEach(f => { total += this.safe(f.qty); html += `<tr><td>${f.date.split('-').reverse().join('/')}</td><td>${f.driver}</td><td class="d-hl-red">${f.qty} L</td></tr>`; });
        
        document.getElementById('l-stats').innerHTML = `<h4 style="margin:0; font-size:14px;">Total Usage for <span style="color:#e74c3c;">${s}</span>: ${total.toFixed(1)} L</h4>`;
        document.getElementById('ledger-content').innerHTML = html + `</tbody></table>`;
    },

    editItem: function(m, id) {
        if(m === 'IN') {
            const i = App.db.diesel_purchase.find(p => p.id === id);
            document.getElementById('edit-p-id').value = i.id;
            document.getElementById('in-source').value = i.source;
            document.getElementById('in-qty').value = i.qty;
            document.getElementById('in-rate').value = i.rate;
            this.showTab('purchase');
        } else {
            const i = App.db.diesel_issue.find(x => x.id === id);
            document.getElementById('edit-i-id').value = i.id;
            document.getElementById('out-target').value = i.target;
            document.getElementById('out-qty').value = i.qty;
            document.getElementById('out-driver').value = i.driver || '';
            this.showTab('issue');
        }
    },

    del: function(m, id) {
        if(!confirm("Are you sure you want to delete this log?")) return;
        if(m === 'IN') App.db.diesel_purchase = App.db.diesel_purchase.filter(p => p.id !== id); 
        else App.db.diesel_issue = App.db.diesel_issue.filter(i => i.id !== id);
        
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
                if (confirm("Replace all Diesel Data with this file?")) {
                    App.db.diesel_purchase = data.purchase || [];
                    App.db.diesel_issue = data.issue || [];
                    App.db.diesel_payments = data.payments || [];
                    App.saveToLocalStorage();
                    alert("Import Successful!");
                    DieselModule.showTab('dash', document.querySelector('.d-tab-btn'));
                }
            } catch (err) { alert("Invalid File!"); }
        };
        reader.readAsText(fileInput.files[0]);
    }
};