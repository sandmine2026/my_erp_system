// ==========================================
// MODULE 4: STOCK MACHINE PANEL (stock_machines.js)
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
                    <div>
                        <label>Type</label>
                        <select id="sm_m_type">
                            <option value="loading">Loading (Trip Basis)</option>
                            <option value="monthly">Monthly (Fixed Rent)</option>
                        </select>
                    </div>
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