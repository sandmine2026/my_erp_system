// ==========================================
// MODULE: PRODUCTION MACHINE PANEL (production_machines.js)
// ==========================================
const ProductionMachineModule = {
    readingToTotalMinutes: function(val) {
        let hours = Math.floor(val);
        let units = Math.round((val - hours) * 10); 
        return (hours * 60) + (units * 6); 
    },

    formatDuration: function(totalMinutes) {
        let h = Math.floor(totalMinutes / 60);
        let m = Math.floor(totalMinutes % 60);
        return `${h}h ${m}m`;
    },

    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.pm-date-input').forEach(el => el.value = today);
        document.getElementById('pm_l_from').value = today.substring(0, 8) + '01'; 
        
        if(!App.db.prod_m_machines) App.db.prod_m_machines = {};
        if(!App.db.prod_m_entries) App.db.prod_m_entries = [];
        if(!App.db.prod_m_payments) App.db.prod_m_payments = [];

        this.updateDropdowns();
        this.switchInternalTab('dash');
    },

    getHTML: function() {
        return `
            <style>
                .pm-nav { display:flex; gap:10px; margin-bottom:20px; border-bottom: 2px solid #ddd; padding-bottom:10px; overflow-x: auto; }
                .pm-tab-btn { background:#ecf0f1; border:none; padding:10px 20px; font-weight:bold; cursor:pointer; border-radius:6px; color:#2c3e50; white-space: nowrap; }
                .pm-tab-btn.active { background:#16a085; color:white; }
                .pm-page { display:none; }
                .pm-dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
                .pm-stat-card { background: white; padding: 15px; border-radius: 10px; text-align: center; border-bottom: 4px solid #16a085; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .pm-stat-card h4 { margin: 0; color: #7f8c8d; font-size: 11px; text-transform: uppercase; }
                .pm-stat-card h2 { margin: 8px 0 0; color: #2c3e50; font-size: 20px; }
                
                /* Pill CSS */
                .pill-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; border: 1px solid; white-space: nowrap; }
                .header-pill { display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; border: 1px solid; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                
                @media print { .pm-nav, .no-print { display: none !important; } }
            </style>

            <div class="card no-print" style="padding-bottom:10px; margin-bottom:15px; border-top-color:#16a085;">
                <div class="pm-nav">
                    <button class="pm-tab-btn active" id="btn-pm-dash" onclick="ProductionMachineModule.switchInternalTab('dash')">📊 Dashboard</button>
                    <button class="pm-tab-btn" id="btn-pm-machines" onclick="ProductionMachineModule.switchInternalTab('machines')">⚙️ Machines</button>
                    <button class="pm-tab-btn" id="btn-pm-daily" onclick="ProductionMachineModule.switchInternalTab('daily')">📝 Daily Entry</button>
                    <button class="pm-tab-btn" id="btn-pm-payment" onclick="ProductionMachineModule.switchInternalTab('payment')">💸 Payment Entry</button>
                    <button class="pm-tab-btn" id="btn-pm-ledger" onclick="ProductionMachineModule.switchInternalTab('ledger')">📋 Ledger Report</button>
                </div>
            </div>

            <div id="pm-dash-page" class="pm-page card" style="border-top-color:#16a085;">
                <h3 style="color:#16a085; margin-top:0;">📊 Production Machine Overview</h3>
                <div class="pm-dash-grid" id="pm-dash-cards"></div>
                <div style="margin-top:20px;">
                    <h3 style="color:#333; margin-top:0;">Machine Live Status (Today)</h3>
                    <div id="pm-dash-summary" class="table-responsive"></div>
                </div>
            </div>

            <div id="pm-machines-page" class="pm-page card" style="border-top-color:#16a085;">
                <h3 style="color:#16a085; margin-top:0;">⚙️ Machine Registration</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 20px; align-items: end;">
                    <div><label>Join Date</label><input type="date" id="pm_m_join_date" class="pm-date-input"></div>
                    <div><label>Name</label><input type="text" id="pm_m_name" placeholder="Ex: JCB-PROD"></div>
                    <div>
                        <label>Type</label>
                        <select id="pm_m_type">
                            <option value="loading">Loading (Trip Basis)</option>
                            <option value="marching">Marching (Hourly)</option>
                            <option value="monthly">Monthly (Fixed Rent)</option>
                        </select>
                    </div>
                    <div><label>Rate / Rent (₹)</label><input type="number" id="pm_m_rate" value="1000"></div>
                    <div><label>Start Read</label><input type="number" id="pm_m_read" value="0" step="0.01"></div>
                    <div><label>Join Diesel (L)</label><input type="number" id="pm_m_join_diesel" value="0" step="0.01" placeholder="Initial Diesel"></div>
                    <button class="btn-action" style="background:#16a085;" onclick="ProductionMachineModule.saveMachine()">SAVE MACHINE</button>
                </div>
                <div id="pm-machine-list-display"></div>
            </div>

            <div id="pm-daily-page" class="pm-page card" style="border-top-color:#16a085;">
                <h3 style="color:#16a085; margin-top:0;">📝 Daily Work & Diesel Entry</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 15px; align-items: end;">
                    <div><label>Date</label><input type="date" id="pm_e_date" class="pm-date-input"></div>
                    <div><label>Machine</label><select id="pm_e_machine" onchange="ProductionMachineModule.autoFillReading()"></select></div>
                    <div><label>Start Read</label><input type="number" id="pm_e_start" step="0.01"></div>
                    <div><label>Stop Read</label><input type="number" id="pm_e_stop" step="0.01"></div>
                    <div><label>Diesel (L)</label><input type="number" id="pm_e_diesel" value="0"></div>
                    <div><label>D-Rate</label><input type="number" id="pm_e_drate" value="92.49"></div>
                </div>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; align-items: end;">
                    <div><label>10W Trips (For Loading)</label><input type="number" id="pm_e_10w" value="0"></div>
                    <div><label>12W Trips (For Loading)</label><input type="number" id="pm_e_12w" value="0"></div>
                    <button class="btn-action" style="background:#16a085;" onclick="ProductionMachineModule.saveDaily()">SAVE RECORD</button>
                </div>
            </div>

            <div id="pm-payment-page" class="pm-page card" style="border-top-color:#16a085;">
                <h3 style="color:#16a085; margin-top:0;">💸 Payment Entry</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; align-items: end;">
                    <div><label>Date</label><input type="date" id="pm_p_date" class="pm-date-input"></div>
                    <div><label>Select Machine</label><select id="pm_p_machine"></select></div>
                    <div><label>Amount (₹)</label><input type="number" id="pm_p_amt" value="0"></div>
                    <div><label>Remarks</label><input type="text" id="pm_p_remark" placeholder="e.g. Advance"></div>
                    <button class="btn-action" style="background:#16a085;" onclick="ProductionMachineModule.savePayment()">SAVE PAYMENT</button>
                </div>
            </div>

            <div id="pm-ledger-page" class="pm-page card" style="border-top-color:#16a085;">
                <div class="no-print" style="display:flex; gap:10px; margin-bottom:20px; align-items:end; background:#eef2f7; padding:15px; border-radius:8px; flex-wrap:wrap;">
                    <div style="flex:1.5"><label>Select Machine</label><select id="pm_l_machine"></select></div>
                    <div style="flex:1"><label>From Date</label><input type="date" id="pm_l_from" class="pm-date-input"></div>
                    <div style="flex:1"><label>To Date</label><input type="date" id="pm_l_to" class="pm-date-input"></div>
                    <button onclick="ProductionMachineModule.loadLedger()" class="btn-action" style="background:#1e3a5f;">View Report</button>
                    <button onclick="window.print()" class="btn-action" style="background:#e67e22;">🖨️ Print</button>
                </div>
                <div id="pm-ledger-view" style="display:none;">
                    <div style="text-align: center; margin-bottom: 20px; color: #2c3e50;">
                        <h1 id="pm_print_ghat_name" style="margin: 0; font-size: 24px; text-transform: uppercase; border-bottom: 3px solid #16a085; display: inline-block; padding-bottom: 5px;">MACHINE LEDGER</h1>
                        <div id="pm_l_machine_title" style="margin-top:15px;"></div>
                    </div>
                    <div class="pm-dash-grid" id="pm-ledger-cards"></div>
                    <div class="table-responsive" id="pm-ledger-content" style="margin-top:20px;"></div>
                </div>
            </div>
        `;
    },

    switchInternalTab: function(tab) {
        document.querySelectorAll('.pm-page').forEach(div => div.style.display = 'none');
        document.getElementById('pm-' + tab + '-page').style.display = 'block';
        document.querySelectorAll('.pm-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-pm-' + tab).classList.add('active');
        
        if(tab === 'dash') this.updateDashboard();
        if(tab === 'machines') this.displayMachines();
    },

    saveMachine: function() {
        const name = document.getElementById('pm_m_name').value.trim();
        if(!name) return alert("Machine name required!");
        
        App.db.prod_m_machines[name] = { 
            type: document.getElementById('pm_m_type').value, 
            rate: parseFloat(document.getElementById('pm_m_rate').value) || 0, 
            startRead: parseFloat(document.getElementById('pm_m_read').value) || 0,
            joinDate: document.getElementById('pm_m_join_date').value || new Date().toISOString().split('T')[0],
            joinDiesel: parseFloat(document.getElementById('pm_m_join_diesel').value) || 0
        };
        App.saveToLocalStorage();
        
        document.getElementById('pm_m_name').value = "";
        document.getElementById('pm_m_join_diesel').value = "0";
        this.displayMachines(); 
        this.updateDropdowns();
        alert("Machine Registered Successfully!");
    },

    displayMachines: function() {
        const container = document.getElementById('pm-machine-list-display');
        container.innerHTML = "<h3 style='color:#333;'>Registered Machines</h3>";
        for (let m in App.db.prod_m_machines) {
            let mData = App.db.prod_m_machines[m];
            let jDateStr = mData.joinDate ? mData.joinDate.split('-').reverse().join('-') : 'N/A';
            let jDiesel = mData.joinDiesel || 0;
            
            container.innerHTML += `
                <div style="background:#f8f9fa; padding:15px; border:1px solid #ddd; margin-bottom:10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <b style="font-size:16px; color:#16a085;">${m}</b><br>
                        <span style="font-size:12px; color:#555; display:inline-block; margin-top:5px;">
                            <b>Type:</b> ${mData.type.toUpperCase()} | 
                            <b>Rate:</b> ₹${mData.rate} | 
                            <b style="color:#2980b9;">Join Date:</b> ${jDateStr} | 
                            <b style="color:#e67e22;">Initial Diesel:</b> ${jDiesel} L
                        </span>
                    </div>
                    <button onclick="ProductionMachineModule.deleteMachine('${m}')" class="btn-action" style="background:#e74c3c; width:auto; padding:8px 15px;">Delete</button>
                </div>`;
        }
    },

    deleteMachine: function(n) { 
        if(confirm("Delete this machine?")) { 
            delete App.db.prod_m_machines[n]; 
            App.saveToLocalStorage(); 
            this.displayMachines(); 
            this.updateDropdowns(); 
        } 
    },

    updateDropdowns: function() {
        const names = Object.keys(App.db.prod_m_machines || {});
        let opt = names.map(n => `<option value="${n}">${n}</option>`).join('');
        
        ['pm_e_machine', 'pm_p_machine', 'pm_l_machine'].forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).innerHTML = opt;
        });
        this.autoFillReading();
    },

    autoFillReading: function() {
        const m = document.getElementById('pm_e_machine')?.value;
        if(!m) return;
        
        const mEntries = (App.db.prod_m_entries || []).filter(i => i.machine === m);
        let last = App.db.prod_m_machines[m] ? App.db.prod_m_machines[m].startRead : 0;
        if(mEntries.length > 0) last = mEntries[mEntries.length-1].stop;
        
        if(document.getElementById('pm_e_start')) document.getElementById('pm_e_start').value = last.toFixed(1);
    },

    saveDaily: function() {
        const m = document.getElementById('pm_e_machine').value;
        if(!m) return alert("Select Machine!");
        
        const stop = parseFloat(document.getElementById('pm_e_stop').value) || 0;
        const start = parseFloat(document.getElementById('pm_e_start').value) || 0;
        
        let diffMin = this.readingToTotalMinutes(stop) - this.readingToTotalMinutes(start);
        if(diffMin < 0) return alert("Stop reading error (Cannot be less than start)!");

        const entry = {
            id: Date.now(), 
            date: document.getElementById('pm_e_date').value, 
            machine: m,
            start, 
            stop, 
            totalMin: diffMin,
            diesel: parseFloat(document.getElementById('pm_e_diesel').value) || 0,
            dcost: (parseFloat(document.getElementById('pm_e_diesel').value) * parseFloat(document.getElementById('pm_e_drate').value)).toFixed(0),
            w10: parseInt(document.getElementById('pm_e_10w').value) || 0,
            w12: parseInt(document.getElementById('pm_e_12w').value) || 0
        };
        
        const mConfig = App.db.prod_m_machines[m];
        
        entry.earning = 0;
        if (mConfig.type === 'loading') {
            entry.earning = (entry.w10 + entry.w12) * mConfig.rate;
        } else if (mConfig.type === 'marching') {
            entry.earning = (entry.totalMin / 60) * mConfig.rate;
        }
        
        App.db.prod_m_entries.push(entry); 
        App.saveToLocalStorage(); 
        
        ['pm_e_stop', 'pm_e_diesel', 'pm_e_10w', 'pm_e_12w'].forEach(id => document.getElementById(id).value = '');
        this.autoFillReading();
        alert("Daily Machine Record Saved!");
    },

    savePayment: function() {
        const amt = parseFloat(document.getElementById('pm_p_amt').value) || 0;
        if(amt <= 0) return alert("Enter amount!");
        
        App.db.prod_m_payments.push({
            id: Date.now(), 
            date: document.getElementById('pm_p_date').value,
            machine: document.getElementById('pm_p_machine').value,
            amt: amt,
            remark: document.getElementById('pm_p_remark').value
        });
        App.saveToLocalStorage(); 
        
        document.getElementById('pm_p_amt').value = '';
        document.getElementById('pm_p_remark').value = '';
        alert("Payment Recorded!");
    },

    updateDashboard: function() {
        const today = new Date().toISOString().split('T')[0];
        let tDL=0, tMin=0, tDC=0, tP=0;
        let tableHtml = `<table class="d-table" style="width:100%; border:1px solid #ddd;"><thead><tr style="background:#f8f9fa;"><th>Machine Name</th><th>Last Reading</th><th>Today Fuel</th><th>Today Status</th></tr></thead><tbody>`;
        
        for(let m in App.db.prod_m_machines) {
            const todayE = (App.db.prod_m_entries || []).filter(i => i.machine === m && i.date === today);
            let dL=0, dC=0, min=0, lastS = App.db.prod_m_machines[m].startRead;
            
            todayE.forEach(x => { dL += x.diesel; dC += parseFloat(x.dcost); min += x.totalMin; });
            const allM = (App.db.prod_m_entries || []).filter(i => i.machine === m);
            if(allM.length > 0) lastS = allM[allM.length-1].stop;
            
            tDL += dL; tMin += min; tDC += dC;
            tableHtml += `<tr><td style="font-weight:bold; color:#16a085;">${m}</td><td>${lastS.toFixed(1)}</td><td>${dL} L</td><td><strong style="color:${min>0?'#27ae60':'#e74c3c'};">${min>0?this.formatDuration(min):'Idle'}</strong></td></tr>`;
        }
        
        (App.db.prod_m_payments || []).filter(p => p.date === today).forEach(p => tP += p.amt);
        
        const cardsEl = document.getElementById('pm-dash-cards');
        if(cardsEl) {
            cardsEl.innerHTML = `
                <div class="pm-stat-card"><h4>Today Hours</h4><h2>${this.formatDuration(tMin)}</h2></div>
                <div class="pm-stat-card"><h4>Today Fuel</h4><h2>${tDL.toFixed(1)} L</h2></div>
                <div class="pm-stat-card"><h4>Fuel Expense</h4><h2>₹${tDC.toFixed(0)}</h2></div>
                <div class="pm-stat-card"><h4>Payments Out</h4><h2>₹${tP}</h2></div>
            `;
        }
        
        const summaryEl = document.getElementById('pm-dash-summary');
        if(summaryEl) summaryEl.innerHTML = tableHtml + `</tbody></table>`;
    },

    loadLedger: function() {
        const m = document.getElementById('pm_l_machine').value;
        const from = document.getElementById('pm_l_from').value;
        const to = document.getElementById('pm_l_to').value;
        if(!m) return alert("Please select a machine!");

        const mConfig = App.db.prod_m_machines[m];
        if(!mConfig) return;

        const filteredE = (App.db.prod_m_entries || []).filter(i => i.machine === m && i.date >= from && i.date <= to).sort((a,b)=>new Date(a.date)-new Date(b.date));
        const filteredP = (App.db.prod_m_payments || []).filter(i => i.machine === m && i.date >= from && i.date <= to);
        
        document.getElementById('pm-ledger-view').style.display = 'block';
        
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        const headerEl = document.getElementById('pm_print_ghat_name');
        if(headerEl) headerEl.innerText = `${currentGhat.toUpperCase()}`;
        
        let jDateStr = mConfig.joinDate ? mConfig.joinDate.split('-').reverse().join('-') : 'N/A';
        let initialDiesel = mConfig.joinDiesel || 0;
        let startReadHeader = mConfig.startRead || 0;
        let stopReadHeader = startReadHeader;
        let endingDateStr = "N/A";
        
        if (filteredE.length > 0) {
            let lastEntry = filteredE[filteredE.length - 1];
            stopReadHeader = lastEntry.stop;
            endingDateStr = lastEntry.date.split('-').reverse().join('-');
        }

        document.getElementById('pm_l_machine_title').innerHTML = `
            <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">
                <span class="header-pill" style="background:#eef2f7; color:#2c3e50; border-color:#bdc3c7;">🚜 MACHINE: ${m}</span>
                <span class="header-pill" style="background:#e8f8f5; color:#16a085; border-color:#1abc9c;">🏷️ TYPE: ${mConfig.type.toUpperCase()}</span>
                <span class="header-pill" style="background:#ebf5fb; color:#2980b9; border-color:#5dade2;">📅 JOIN: ${jDateStr}</span>
                <span class="header-pill" style="background:#fef5e7; color:#e67e22; border-color:#f39c12;">⛽ INITIAL DIESEL: ${initialDiesel} L</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:10px;">
                <span class="header-pill" style="background:#e8f8f5; color:#16a085; border-color:#1abc9c;">▶️ REG. START READ: ${startReadHeader.toFixed(1)}</span>
                <span class="header-pill" style="background:#fdedec; color:#c0392b; border-color:#e74c3c;">⏹️ LAST STOP READ: ${stopReadHeader.toFixed(1)}</span>
                <span class="header-pill" style="background:#f4ecf7; color:#8e44ad; border-color:#af7ac5;">🏁 ENDING DATE: ${endingDateStr}</span>
            </div>
        `;

        let totalMin=0, sDL=0, sDC=0, sE=0, sP=0;
        
        let dynHead = '';
        if(mConfig.type === 'loading') dynHead = '<th>Loading Rate</th><th>Total Trips</th>';
        else if(mConfig.type === 'marching') dynHead = '<th>Hourly Rate</th>';
        else dynHead = '<th>Diesel (L)</th><th>Diesel Cost</th>';

        let tableHtml = `<table class="d-table" style="width:100%; border:1px solid #ddd; text-align:center; border-collapse: collapse;">
            <thead>
                <tr style="background:#1e3a5f; color:white;">
                    <th style="padding:10px;">Date</th>
                    <th>Start Read</th>
                    <th>Stop Read</th>
                    ${dynHead}
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>`;

        filteredE.forEach(i => {
            totalMin += i.totalMin; sDL += i.diesel; sDC += parseFloat(i.dcost); sE += i.earning;
            
            let dynCols = '';
            if(mConfig.type === 'loading') {
                dynCols = `<td style="color:#27ae60; font-weight:bold; vertical-align:middle;">₹${mConfig.rate}</td>
                           <td style="vertical-align:middle;"><span class="pill-badge" style="background:#eef2f7; color:#2980b9; border-color:#2980b9;">${i.w10+i.w12} Trips</span></td>`;
            } else if(mConfig.type === 'marching') {
                dynCols = `<td style="color:#27ae60; font-weight:bold; vertical-align:middle;">₹${mConfig.rate}</td>`; 
            } else {
                dynCols = `<td style="vertical-align:middle;"><span class="pill-badge" style="background:#fef5e7; color:#e67e22; border-color:#e67e22;">${i.diesel} L</span></td>
                           <td style="color:#c0392b; font-weight:bold; vertical-align:middle;">₹${i.dcost}</td>`;
            }

            let durationPill = `<span class="pill-badge" style="background:#e8f8f5; color:#16a085; border-color:#1abc9c;">⏱️ ${this.formatDuration(i.totalMin)}</span>`;

            tableHtml += `<tr style="border-bottom: 1px solid #eee;">
                <td style="padding:10px; vertical-align:middle;"><b>${i.date.split('-').reverse().join('-')}</b></td>
                <td style="vertical-align:middle;">${i.start.toFixed(1)}</td>
                <td style="vertical-align:middle;">${i.stop.toFixed(1)}</td>
                ${dynCols}
                <td style="vertical-align:middle;">${durationPill}</td>
            </tr>`;
        });

        filteredP.forEach(p => { 
            sP += p.amt; 
            let leftColspan = (mConfig.type === 'marching') ? 3 : 4; 
            tableHtml += `<tr style="background:#fff3f3; border-bottom: 1px solid #eee;">
                <td colspan="${leftColspan}" style="text-align:right; padding:10px; vertical-align:middle;">
                    <span class="pill-badge" style="background:#fadbd8; color:#c0392b; border-color:#c0392b; font-size:11px;">💸 PAYMENT: ${p.remark.toUpperCase()}</span>
                </td>
                <td colspan="2" style="color:#c0392b; font-weight:bold; text-align:center; vertical-align:middle;">₹${p.amt} Paid</td>
            </tr>`; 
        });

        const totalIncome = (mConfig.type === 'loading' || mConfig.type === 'marching') ? sE : mConfig.rate;
        const finalBal = totalIncome - (sDC + sP);

        let earningCard = '';
        if (mConfig.type === 'monthly') {
            earningCard = `<div class="pm-stat-card"><h4>Monthly Rent</h4><h2>₹${mConfig.rate}</h2></div>`;
        } else {
            earningCard = `<div class="pm-stat-card"><h4>${mConfig.type === 'marching' ? 'Marching Earnings' : 'Trip Earnings'}</h4><h2 style="color:#16a085;">₹${sE.toFixed(0)}</h2></div>`;
        }

        document.getElementById('pm-ledger-cards').innerHTML = `
            ${earningCard}
            <div class="pm-stat-card"><h4>Fuel Used</h4><h2>${sDL.toFixed(1)} L</h2></div>
            <div class="pm-stat-card"><h4>Fuel Cost</h4><h2 style="color:#e67e22;">₹${sDC.toFixed(0)}</h2></div>
            <div class="pm-stat-card"><h4>Total Paid</h4><h2 style="color:#c0392b;">₹${sP}</h2></div>
            <div class="pm-stat-card" style="border-bottom-color:${finalBal>=0?'#27ae60':'#e74c3c'};"><h4>Balance</h4><h2 style="color:${finalBal>=0?'#27ae60':'#e74c3c'}; font-weight:900;">₹${finalBal.toFixed(0)}</h2></div>
        `;

        document.getElementById('pm-ledger-content').innerHTML = tableHtml + `</tbody></table>`;
    }
};