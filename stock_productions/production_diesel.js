// ==========================================
// MODULE: PRODUCTION DIESEL PANEL (production_diesel.js)
// ==========================================
const ProductionDieselModule = {
    editID: null,

    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.pd-date-input').forEach(el => el.value = today);
        document.getElementById('pd_l_from').value = today.substring(0, 8) + '01'; 
        
        if(!App.db.prod_d_purchase) App.db.prod_d_purchase = [];
        if(!App.db.prod_d_issue) App.db.prod_d_issue = [];
        if(!App.db.prod_d_payments) App.db.prod_d_payments = [];

        this.updateAutoSuggest();
        this.switchInternalTab('dash');
    },

    getHTML: function() {
        return `
            <style>
                .pd-nav { display:flex; gap:10px; margin-bottom:20px; border-bottom: 2px solid #ddd; padding-bottom:10px; overflow-x: auto; }
                .pd-tab-btn { background:#ecf0f1; border:none; padding:10px 20px; font-weight:bold; cursor:pointer; border-radius:6px; color:#2c3e50; white-space: nowrap; }
                .pd-tab-btn.active { background:#e67e22; color:white; }
                .pd-page { display:none; }
                .pd-dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
                .pd-stat-card { background: white; padding: 15px; border-radius: 10px; text-align: center; border-bottom: 4px solid #e67e22; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .pd-stat-card h4 { margin: 0; color: #7f8c8d; font-size: 11px; text-transform: uppercase; }
                .pd-stat-card h2 { margin: 8px 0 0; color: #2c3e50; font-size: 20px; }
                .pill-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; border: 1px solid; white-space: nowrap; }
                @media print { .pd-nav, .no-print { display: none !important; } }
            </style>

            <div class="card no-print" style="padding-bottom:10px; margin-bottom:15px; border-top-color:#e67e22;">
                <div class="pd-nav">
                    <button class="pd-tab-btn active" id="btn-pd-dash" onclick="ProductionDieselModule.switchInternalTab('dash')">📊 Dashboard</button>
                    <button class="pd-tab-btn" id="btn-pd-purchase" onclick="ProductionDieselModule.switchInternalTab('purchase')">⛽ Purchase</button>
                    <button class="pd-tab-btn" id="btn-pd-issue" onclick="ProductionDieselModule.switchInternalTab('issue')">🚜 Issue (Usage)</button>
                    <button class="pd-tab-btn" id="btn-pd-payment" onclick="ProductionDieselModule.switchInternalTab('payment')">💸 Payment</button>
                    <button class="pd-tab-btn" id="btn-pd-ledger" onclick="ProductionDieselModule.switchInternalTab('ledger')">📋 Ledger</button>
                </div>
            </div>

            <!-- DASHBOARD -->
            <div id="pd-dash-page" class="pd-page card" style="border-top-color:#e67e22;">
                <h3 style="color:#e67e22; margin-top:0;">📊 Diesel Overview (Production)</h3>
                <div class="pd-dash-grid" id="pd-dash-cards"></div>
            </div>

            <!-- PURCHASE PAGE -->
            <div id="pd-purchase-page" class="pd-page card" style="border-top-color:#e67e22;">
                <h3 style="color:#e67e22; margin-top:0;">⛽ Diesel Purchase Entry</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end; margin-bottom: 15px;">
                    <div><label>Date</label><input type="date" id="pd_p_date" class="pd-date-input"></div>
                    <div><label>Supplier / Pump</label><input type="text" id="pd_p_supplier" list="pd_sup_list" style="text-transform:uppercase;"></div>
                    <div><label>Bill No</label><input type="text" id="pd_p_bill" placeholder="Optional"></div>
                    <div><label>Liters</label><input type="number" id="pd_p_liter" step="0.01" oninput="ProductionDieselModule.calcPurchase()"></div>
                    <div><label>Rate / Ltr</label><input type="number" id="pd_p_rate" step="0.01" value="92.49" oninput="ProductionDieselModule.calcPurchase()"></div>
                    <div><label>Total Amount</label><input type="number" id="pd_p_amt" readonly style="background:#eee; font-weight:bold;"></div>
                    <button class="btn-action" style="background:#e67e22;" onclick="ProductionDieselModule.savePurchase()">SAVE PURCHASE</button>
                </div>
                <datalist id="pd_sup_list"></datalist>
            </div>

            <!-- ISSUE PAGE -->
            <div id="pd-issue-page" class="pd-page card" style="border-top-color:#e67e22;">
                <h3 style="color:#e67e22; margin-top:0;">🚜 Diesel Issue (Machine/Truck)</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end; margin-bottom: 15px;">
                    <div><label>Date</label><input type="date" id="pd_i_date" class="pd-date-input"></div>
                    <div><label>Receiver (Mach/Trk)</label><input type="text" id="pd_i_receiver" list="pd_rec_list" style="text-transform:uppercase;"></div>
                    <div><label>Slip No</label><input type="text" id="pd_i_slip" placeholder="Optional"></div>
                    <div><label>Liters Issued</label><input type="number" id="pd_i_liter" step="0.01" oninput="ProductionDieselModule.calcIssue()"></div>
                    <div><label>Rate / Ltr</label><input type="number" id="pd_i_rate" value="92.49" step="0.01" oninput="ProductionDieselModule.calcIssue()"></div>
                    <div><label>Total Cost (₹)</label><input type="number" id="pd_i_amt" readonly style="background:#eee; font-weight:bold; color:#c0392b;"></div>
                    <button class="btn-action" style="background:#2980b9;" onclick="ProductionDieselModule.saveIssue()">SAVE ISSUE</button>
                </div>
                <datalist id="pd_rec_list"></datalist>
            </div>

            <!-- PAYMENT PAGE -->
            <div id="pd-payment-page" class="pd-page card" style="border-top-color:#e67e22;">
                <h3 style="color:#e67e22; margin-top:0;">💸 Pump Payment Entry</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end;">
                    <div><label>Date</label><input type="date" id="pd_pay_date" class="pd-date-input"></div>
                    <div><label>Supplier / Pump</label><input type="text" id="pd_pay_supplier" list="pd_sup_list" style="text-transform:uppercase;"></div>
                    <div><label>Amount (₹)</label><input type="number" id="pd_pay_amt"></div>
                    <div><label>Remarks</label><input type="text" id="pd_pay_remark" placeholder="e.g. Bank Trf"></div>
                    <button class="btn-action" style="background:#27ae60;" onclick="ProductionDieselModule.savePayment()">SAVE PAYMENT</button>
                </div>
            </div>

            <!-- LEDGER PAGE -->
            <div id="pd-ledger-page" class="pd-page card" style="border-top-color:#e67e22;">
                <div class="no-print" style="display:flex; gap:10px; margin-bottom:20px; align-items:end; background:#eef2f7; padding:15px; border-radius:8px; flex-wrap:wrap;">
                    <div style="flex:1"><label>Report Type</label>
                        <select id="pd_l_type" onchange="ProductionDieselModule.toggleLedgerType()">
                            <option value="supplier">Pump / Supplier Ledger</option>
                            <option value="issue">Issue / Receiver Report</option>
                        </select>
                    </div>
                    <div style="flex:1.5" id="pd_sup_sel_div"><label>Select Pump</label><select id="pd_l_sup"></select></div>
                    <div style="flex:1.5; display:none;" id="pd_rec_sel_div"><label>Select Receiver</label><select id="pd_l_rec"></select></div>
                    
                    <div style="flex:1"><label>From</label><input type="date" id="pd_l_from" class="pd-date-input"></div>
                    <div style="flex:1"><label>To</label><input type="date" id="pd_l_to" class="pd-date-input"></div>
                    <button onclick="ProductionDieselModule.loadLedger()" class="btn-action" style="background:#1e3a5f;">View</button>
                    <button onclick="window.print()" class="btn-action" style="background:#c0392b;">🖨️ Print</button>
                </div>
                <div id="pd-ledger-view" style="display:none;">
                    <h2 id="pd-ledger-title" style="text-align:center; color:#e67e22; border-bottom:2px solid #e67e22; padding-bottom:10px;">DIESEL LEDGER</h2>
                    <div class="pd-dash-grid" id="pd-ledger-cards"></div>
                    <div class="table-responsive" id="pd-ledger-content" style="margin-top:20px;"></div>
                </div>
            </div>
        `;
    },

    switchInternalTab: function(tab) {
        document.querySelectorAll('.pd-page').forEach(div => div.style.display = 'none');
        document.getElementById('pd-' + tab + '-page').style.display = 'block';
        document.querySelectorAll('.pd-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-pd-' + tab).classList.add('active');
        
        if(tab === 'dash') this.updateDashboard();
        this.updateAutoSuggest();
    },

    calcPurchase: function() {
        const ltr = parseFloat(document.getElementById('pd_p_liter').value) || 0;
        const rate = parseFloat(document.getElementById('pd_p_rate').value) || 0;
        document.getElementById('pd_p_amt').value = (ltr * rate).toFixed(2);
    },

    // 🔹 ইস্যু করার সময় টাকার হিসাব
    calcIssue: function() {
        const ltr = parseFloat(document.getElementById('pd_i_liter').value) || 0;
        const rate = parseFloat(document.getElementById('pd_i_rate').value) || 0;
        const amtEl = document.getElementById('pd_i_amt');
        if(amtEl) amtEl.value = (ltr * rate).toFixed(2);
    },

    updateAutoSuggest: function() {
        const pDB = App.db.prod_d_purchase || [];
        const iDB = App.db.prod_d_issue || [];
        
        const suppliers = [...new Set(pDB.map(i => i.supplier))];
        let receivers = [...new Set(iDB.map(i => i.receiver))];
        
        if(App.db.prod_m_machines) receivers.push(...Object.keys(App.db.prod_m_machines));
        if(App.db.stock_trucks) receivers.push(...Object.keys(App.db.stock_trucks));
        receivers = [...new Set(receivers)]; 

        document.getElementById('pd_sup_list').innerHTML = suppliers.map(s => `<option value="${s}">`).join('');
        document.getElementById('pd_rec_list').innerHTML = receivers.map(r => `<option value="${r}">`).join('');
        
        const selSup = document.getElementById('pd_l_sup');
        if(selSup) selSup.innerHTML = '<option value="">-- All Pumps --</option>' + suppliers.map(s => `<option value="${s}">${s}</option>`).join('');
        
        const selRec = document.getElementById('pd_l_rec');
        if(selRec) selRec.innerHTML = '<option value="">-- All Receivers --</option>' + receivers.map(r => `<option value="${r}">${r}</option>`).join('');
    },

    savePurchase: function() {
        const sup = document.getElementById('pd_p_supplier').value.toUpperCase().trim();
        const ltr = parseFloat(document.getElementById('pd_p_liter').value);
        if(!sup || !ltr) return alert("Pump Name and Liters required!");

        App.db.prod_d_purchase.push({
            id: Date.now(),
            date: document.getElementById('pd_p_date').value,
            supplier: sup,
            bill: document.getElementById('pd_p_bill').value,
            liter: ltr,
            rate: parseFloat(document.getElementById('pd_p_rate').value) || 0,
            amount: parseFloat(document.getElementById('pd_p_amt').value) || 0
        });
        App.saveToLocalStorage();
        alert("Purchase Saved!");
        ['pd_p_liter', 'pd_p_bill', 'pd_p_amt'].forEach(id => document.getElementById(id).value = '');
        this.updateAutoSuggest();
    },

    // 🔹 ইস্যু সেভ করার লজিক আপডেট করা হলো
    saveIssue: function() {
        const rec = document.getElementById('pd_i_receiver').value.toUpperCase().trim();
        const ltr = parseFloat(document.getElementById('pd_i_liter').value);
        const rate = parseFloat(document.getElementById('pd_i_rate').value) || 0;
        const cost = parseFloat(document.getElementById('pd_i_amt').value) || 0;

        if(!rec || !ltr) return alert("Receiver Name and Liters required!");

        App.db.prod_d_issue.push({
            id: Date.now(),
            date: document.getElementById('pd_i_date').value,
            receiver: rec,
            slip: document.getElementById('pd_i_slip').value,
            liter: ltr,
            rate: rate,
            cost: cost
        });
        App.saveToLocalStorage();
        alert("Diesel Issue Saved!");
        ['pd_i_receiver', 'pd_i_slip', 'pd_i_liter', 'pd_i_amt'].forEach(id => document.getElementById(id).value = '');
        this.updateAutoSuggest();
    },

    savePayment: function() {
        const sup = document.getElementById('pd_pay_supplier').value.toUpperCase().trim();
        const amt = parseFloat(document.getElementById('pd_pay_amt').value);
        if(!sup || !amt) return alert("Pump Name and Amount required!");

        App.db.prod_d_payments.push({
            id: Date.now(),
            date: document.getElementById('pd_pay_date').value,
            supplier: sup,
            amount: amt,
            remark: document.getElementById('pd_pay_remark').value
        });
        App.saveToLocalStorage();
        alert("Payment Saved!");
        ['pd_pay_amt', 'pd_pay_remark'].forEach(id => document.getElementById(id).value = '');
    },

    updateDashboard: function() {
        let tIn = 0, tOut = 0, tVal = 0, tPaid = 0;
        
        (App.db.prod_d_purchase || []).forEach(p => { tIn += p.liter; tVal += p.amount; });
        (App.db.prod_d_issue || []).forEach(i => tOut += i.liter);
        (App.db.prod_d_payments || []).forEach(p => tPaid += p.amount);

        let stockLtr = tIn - tOut;
        let due = tVal - tPaid;

        document.getElementById('pd-dash-cards').innerHTML = `
            <div class="pd-stat-card"><h4>Total Purchased</h4><h2 style="color:#2980b9;">${tIn.toFixed(1)} L</h2></div>
            <div class="pd-stat-card"><h4>Total Issued</h4><h2 style="color:#e67e22;">${tOut.toFixed(1)} L</h2></div>
            <div class="pd-stat-card"><h4>Current Stock</h4><h2 style="color:${stockLtr>=0?'#27ae60':'#c0392b'};">${stockLtr.toFixed(1)} L</h2></div>
            <div class="pd-stat-card"><h4>Total Bill</h4><h2>₹${tVal.toFixed(0)}</h2></div>
            <div class="pd-stat-card"><h4>Total Paid</h4><h2 style="color:#27ae60;">₹${tPaid.toFixed(0)}</h2></div>
            <div class="pd-stat-card"><h4>Pump Due Balance</h4><h2 style="color:#c0392b;">₹${due.toFixed(0)}</h2></div>
        `;
    },

    toggleLedgerType: function() {
        const type = document.getElementById('pd_l_type').value;
        document.getElementById('pd_sup_sel_div').style.display = type === 'supplier' ? 'block' : 'none';
        document.getElementById('pd_rec_sel_div').style.display = type === 'issue' ? 'block' : 'none';
        document.getElementById('pd-ledger-view').style.display = 'none';
    },

    loadLedger: function() {
        const type = document.getElementById('pd_l_type').value;
        const from = document.getElementById('pd_l_from').value;
        const to = document.getElementById('pd_l_to').value;
        
        document.getElementById('pd-ledger-view').style.display = 'block';
        let tableHtml = `<table class="d-table" style="width:100%; border:1px solid #ddd; text-align:center;">`;

        if (type === 'supplier') {
            const sup = document.getElementById('pd_l_sup').value;
            let pData = (App.db.prod_d_purchase || []).filter(i => i.date >= from && i.date <= to);
            let payData = (App.db.prod_d_payments || []).filter(i => i.date >= from && i.date <= to);
            
            if(sup) {
                pData = pData.filter(i => i.supplier === sup);
                payData = payData.filter(i => i.supplier === sup);
                document.getElementById('pd-ledger-title').innerText = `PUMP LEDGER: ${sup}`;
            } else {
                document.getElementById('pd-ledger-title').innerText = `ALL PUMPS LEDGER`;
            }

            let merged = [];
            pData.forEach(p => merged.push({ date: p.date, type: 'PURCHASE', desc: `Bill: ${p.bill||'N/A'}`, ltr: p.liter, rate: p.rate, dr: p.amount, cr: 0 }));
            payData.forEach(p => merged.push({ date: p.date, type: 'PAYMENT', desc: p.remark, ltr: 0, rate: 0, dr: 0, cr: p.amount }));
            
            merged.sort((a,b) => new Date(a.date) - new Date(b.date));

            let totLtr=0, totDr=0, totCr=0, bal=0;
            tableHtml += `<tr style="background:#e67e22; color:white;"><th>Date</th><th>Type</th><th>Description</th><th>Liters</th><th>Rate</th><th>Bill (Dr)</th><th>Paid (Cr)</th><th>Balance</th></tr>`;
            
            merged.forEach(m => {
                totLtr += m.ltr; totDr += m.dr; totCr += m.cr; bal += (m.dr - m.cr);
                tableHtml += `<tr>
                    <td>${m.date.split('-').reverse().join('-')}</td>
                    <td><span class="pill-badge" style="background:${m.type==='PURCHASE'?'#eef2f7':'#e8f8f5'}; color:${m.type==='PURCHASE'?'#2980b9':'#27ae60'};">${m.type}</span></td>
                    <td>${m.desc}</td>
                    <td>${m.ltr > 0 ? m.ltr.toFixed(1) : '-'}</td>
                    <td>${m.rate > 0 ? m.rate.toFixed(2) : '-'}</td>
                    <td style="color:#c0392b;">${m.dr > 0 ? '₹'+m.dr.toFixed(0) : '-'}</td>
                    <td style="color:#27ae60;">${m.cr > 0 ? '₹'+m.cr.toFixed(0) : '-'}</td>
                    <td style="font-weight:bold;">₹${bal.toFixed(0)}</td>
                </tr>`;
            });

            document.getElementById('pd-ledger-cards').innerHTML = `
                <div class="pd-stat-card"><h4>Total Liters</h4><h2>${totLtr.toFixed(1)} L</h2></div>
                <div class="pd-stat-card"><h4>Total Billed</h4><h2>₹${totDr.toFixed(0)}</h2></div>
                <div class="pd-stat-card"><h4>Total Paid</h4><h2 style="color:#27ae60;">₹${totCr.toFixed(0)}</h2></div>
                <div class="pd-stat-card"><h4>Net Due</h4><h2 style="color:#c0392b;">₹${bal.toFixed(0)}</h2></div>
            `;
        } 
        else {
            // 🔹 Issue Ledger (এখানে টাকার হিসাব দেখানো হলো)
            const rec = document.getElementById('pd_l_rec').value;
            let iData = (App.db.prod_d_issue || []).filter(i => i.date >= from && i.date <= to);
            
            if(rec) {
                iData = iData.filter(i => i.receiver === rec);
                document.getElementById('pd-ledger-title').innerText = `DIESEL USAGE: ${rec}`;
            } else {
                document.getElementById('pd-ledger-title').innerText = `ALL MACHINES / TRUCKS USAGE`;
            }
            
            iData.sort((a,b) => new Date(a.date) - new Date(b.date));
            
            let totLtr = 0;
            let totCost = 0;
            tableHtml += `<tr style="background:#2980b9; color:white;"><th>Date</th><th>Receiver</th><th>Slip No</th><th>Liters Issued</th><th>Rate / Ltr</th><th>Total Cost</th></tr>`;
            
            iData.forEach(i => {
                let rate = i.rate || 92.49; // পুরানো ডেটার জন্য ডিফল্ট রেট
                let cost = i.cost || (i.liter * rate); 
                totLtr += i.liter;
                totCost += cost;

                tableHtml += `<tr>
                    <td>${i.date.split('-').reverse().join('-')}</td>
                    <td style="font-weight:bold;">${i.receiver}</td>
                    <td>${i.slip || '-'}</td>
                    <td style="color:#d35400; font-weight:bold;">${i.liter.toFixed(1)} L</td>
                    <td>₹${rate.toFixed(2)}</td>
                    <td style="color:#c0392b; font-weight:bold;">₹${cost.toFixed(0)}</td>
                </tr>`;
            });

            document.getElementById('pd-ledger-cards').innerHTML = `
                <div class="pd-stat-card"><h4>Total Consumed</h4><h2 style="color:#d35400;">${totLtr.toFixed(1)} L</h2></div>
                <div class="pd-stat-card"><h4>Total Diesel Cost</h4><h2 style="color:#c0392b;">₹${totCost.toFixed(0)}</h2></div>
            `;
        }
        
        document.getElementById('pd-ledger-content').innerHTML = tableHtml + `</table>`;
    }
};