// ==========================================
// MODULE 3: STOCK VEHICLE PANEL (stock_vehicles.js)
// ==========================================
const StockVehicleModule = {
    editID: null,
    
    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.sv-date-input').forEach(el => el.value = today);
        this.updateAutoSuggest(); 
        this.switchInternalTab('dash');
    },

    getTripRate: function(wheel) { 
        if(wheel.includes("12")) return 1100; 
        if(wheel.includes("10")) return 1000; 
        if(wheel.includes("6")) return 800; 
        if(wheel.includes("14")) return 1200; 
        return 1000; 
    },

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
                @media print { 
                    .sv-nav, .no-print { display: none !important; } 
                    .sv-sum-card, .sv-full-card { border: 1px solid #ddd; } 
                    .bal-pos, .bal-neg { color: #000 !important; font-weight: bold !important; } 
                }
            </style>
            
            <div class="card no-print" style="padding-bottom:10px; margin-bottom:15px;">
                <div class="sv-nav">
                    <button class="sv-tab-btn active" id="btn-sv-dash" onclick="StockVehicleModule.switchInternalTab('dash')">📊 Dashboard</button>
                    <button class="sv-tab-btn" id="btn-sv-entry" onclick="StockVehicleModule.switchInternalTab('entry')">📝 Daily Entry</button>
                    <button class="sv-tab-btn" id="btn-sv-owner" onclick="StockVehicleModule.switchInternalTab('owner')">🤝 Owner Reg.</button>
                    <button class="sv-tab-btn" id="btn-sv-ledger" onclick="StockVehicleModule.switchInternalTab('ledger')">📋 Ledger Report</button>
                </div>
            </div>
            
            <div id="sv-dash-page" class="sv-page card">
                <h3 style="color:var(--p-color); margin-top:0;">📊 Vehicle Dashboard Overview</h3>
                <div class="no-print form-grid" style="display:flex; gap:10px; margin-bottom:20px; align-items:end; background:#eef2f7; padding:15px; border-radius:8px; flex-wrap: wrap;">
                    <div style="flex:1">
                        <label>From Date</label>
                        <input type="date" id="sv_dash_f_date" class="sv-date-input">
                    </div>
                    <div style="flex:1">
                        <label>To Date</label>
                        <input type="date" id="sv_dash_t_date" class="sv-date-input">
                    </div>
                    <button onclick="StockVehicleModule.updateDashboard()" class="btn-action" style="background:#1e3a5f;">Filter</button>
                </div>
                <div id="sv-dash-container"></div>
            </div>
            
            <div id="sv-entry-page" class="sv-page card">
                <h3 id="sv-entry-title" style="color:var(--p-color); margin-top:0;">📝 Daily Trip & Diesel Entry</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; align-items:end;">
                    <div><label>Date</label><input type="date" id="sv_date" class="sv-date-input"></div>
                    <div>
                        <label>Vehicle No</label>
                        <input type="text" id="sv_v_no" list="sv_v_list" onchange="StockVehicleModule.fetchOwner()" style="text-transform:uppercase;">
                    </div>
                    <div><label>Owner Name</label><input type="text" id="sv_owner_name_auto" readonly style="background:#eee"></div>
                    <div>
                        <label>Wheel</label>
                        <select id="sv_wheel">
                            <option>6 Wheel</option>
                            <option selected>10 Wheel</option>
                            <option>12 Wheel</option>
                            <option>14 Wheel</option>
                            <option>16 Wheel</option>
                        </select>
                    </div>
                    <div><label>Trips</label><input type="number" id="sv_t_trips" value="0"></div>
                    <div><label>Diesel (Litre)</label><input type="number" id="sv_diesel" value="0"></div>
                    <div><label>Rate</label><input type="number" id="sv_d_rate" value="92.49"></div>
                    <div><label>Other Exp</label><input type="number" id="sv_khoroch" value="0"></div>
                    <button id="sv-save-btn" onclick="StockVehicleModule.saveData()" class="btn-action" style="background:#27ae60;">SAVE DATA</button>
                </div>
                <datalist id="sv_v_list"></datalist>
            </div>
            
            <div id="sv-owner-page" class="sv-page card">
                <h3 style="color:var(--p-color); margin-top:0;">🤝 Owner Registration</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; align-items:end; margin-bottom:20px;">
                    <div><label>Vehicle No</label><input type="text" id="sv_m_v_no" placeholder="WB-XX-XXXX" style="text-transform:uppercase;"></div>
                    <div><label>Owner Name</label><input type="text" id="sv_m_o_name" placeholder="Name"></div>
                    <button onclick="StockVehicleModule.saveOwner()" class="btn-action" style="background:#3498db;">REGISTER</button>
                </div>
                <table class="d-table" style="width:100%; border:1px solid #ddd;">
                    <thead>
                        <tr style="background:#f8f9fa;">
                            <th>Vehicle No</th>
                            <th>Owner Name</th>
                            <th class="no-print">Action</th>
                        </tr>
                    </thead>
                    <tbody id="sv-owner-table-body"></tbody>
                </table>
            </div>
            
            <div id="sv-ledger-page" class="sv-page card">
                <div class="no-print" style="display:flex; gap:10px; margin-bottom:20px; align-items:end; background:#eef2f7; padding:15px; border-radius:8px; flex-wrap:wrap;">
                    <div style="flex:1.5">
                        <label>Search Owner</label>
                        <select id="sv_o_selector" onchange="StockVehicleModule.loadLedger('owner')"></select>
                    </div>
                    <div style="flex:1.5">
                        <label>OR Select Vehicle</label>
                        <select id="sv_v_selector" onchange="StockVehicleModule.loadLedger('vehicle')"></select>
                    </div>
                    <div style="flex:1">
                        <label>From</label>
                        <input type="date" id="sv_led_f_date" class="sv-date-input" onchange="StockVehicleModule.loadLedger()">
                    </div>
                    <div style="flex:1">
                        <label>To</label>
                        <input type="date" id="sv_led_t_date" class="sv-date-input" onchange="StockVehicleModule.loadLedger()">
                    </div>
                    <button onclick="window.print()" class="btn-action" style="background:#e67e22;">🖨️ PRINT</button>
                </div>
                
                <div id="sv-pdf-content">
                    <div id="sv-ledger-header" style="text-align:center; display:none; border-bottom: 3.5px solid #1e3a5f; padding-bottom: 10px; margin-bottom: 20px;">
                        <h1 id="sv_print_ghat_name" style="margin:0; color:#1e3a5f; font-size:26px;">VEHICLE LEDGER</h1>
                        <div style="margin-top:10px; font-weight:bold; font-size:14px;">
                            <span>TARGET: <span id="sv_p_vno"></span></span> | <span>OWNER: <span id="sv_p_owner"></span></span>
                        </div>
                    </div>
                    
                    <div id="sv-ledger-content" style="display:none;">
                        <div id="sv-ledger-sum-area"></div>
                        <div class="table-responsive">
                            <table class="d-table" style="width:100%; border:1px solid #000; margin-top:15px;">
                                <thead>
                                    <tr style="background:#1e3a5f; color:white;">
                                        <th>Date</th><th>Wheel</th><th>Trips</th><th>Rate</th><th>Diesel(L)</th><th>D-Cost</th><th>Other Exp</th><th>Balance</th><th class="no-print">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="sv-ledger-data"></tbody>
                            </table>
                        </div>
                        <div style="margin-top:50px; text-align:right;">
                            <div style="display:inline-block; text-align:center; width:200px; border-top:2px solid #000; font-weight:bold;">Authorized Signature</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    switchInternalTab: function(tab) {
        document.querySelectorAll('.sv-page').forEach(div => div.style.display = 'none');
        document.getElementById('sv-' + tab + '-page').style.display = 'block';
        document.querySelectorAll('.sv-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-sv-' + tab).classList.add('active');
        
        if(tab === 'dash') this.updateDashboard(); 
        if(tab === 'owner') this.renderOwnerTable(); 
        if(tab === 'ledger') this.updateSelectors();
    },

    saveOwner: function() {
        const v = document.getElementById('sv_m_v_no').value.toUpperCase().trim();
        const n = document.getElementById('sv_m_o_name').value.trim();
        if(!v || !n) return alert("Fill data!");
        
        App.db.stk_v_owners[v] = { name: n }; 
        App.saveToLocalStorage();
        
        document.getElementById('sv_m_v_no').value = ""; 
        document.getElementById('sv_m_o_name').value = "";
        
        this.renderOwnerTable(); 
        this.updateAutoSuggest(); 
        alert("Owner Registered!");
    },

    renderOwnerTable: function() {
        const owners = App.db.stk_v_owners || {};
        document.getElementById('sv-owner-table-body').innerHTML = Object.keys(owners).map(v => 
            `<tr>
                <td>${v}</td>
                <td style="font-weight:bold;">${owners[v].name}</td>
                <td class="no-print">
                    <button onclick="StockVehicleModule.delOwner('${v}')" style="color:red; border:none; background:none; cursor:pointer;">Del</button>
                </td>
            </tr>`
        ).join('');
    },

    delOwner: function(v) { 
        if(confirm("Delete this owner?")) { 
            delete App.db.stk_v_owners[v]; 
            App.saveToLocalStorage(); 
            this.renderOwnerTable(); 
        } 
    },

    fetchOwner: function() {
        const v = document.getElementById('sv_v_no').value.toUpperCase().trim();
        const owners = App.db.stk_v_owners || {};
        document.getElementById('sv_owner_name_auto').value = owners[v] ? owners[v].name : "Not Found";
    },

    updateAutoSuggest: function() { 
        const db = App.db.stk_v_db || [];
        const owners = App.db.stk_v_owners || {};
        const vList = [...new Set([...db.map(i => i.v_no), ...Object.keys(owners)])]; 
        document.getElementById('sv_v_list').innerHTML = vList.map(v => `<option value="${v}">`).join(''); 
    },

    saveData: function() {
        const vNo = document.getElementById('sv_v_no').value.toUpperCase().trim();
        if(!vNo) return alert("Enter Vehicle No!");
        
        const entry = { 
            id: this.editID || Date.now(), 
            date: document.getElementById('sv_date').value, 
            v_no: vNo, 
            wheel: document.getElementById('sv_wheel').value, 
            trips: parseFloat(document.getElementById('sv_t_trips').value)||0, 
            diesel_ltr: parseFloat(document.getElementById('sv_diesel').value)||0, 
            d_rate: parseFloat(document.getElementById('sv_d_rate').value)||92.49, 
            other_exp: parseFloat(document.getElementById('sv_khoroch').value)||0 
        };
        
        if(this.editID) { 
            App.db.stk_v_db = App.db.stk_v_db.map(i => i.id === this.editID ? entry : i); 
            this.editID = null; 
            document.getElementById('sv-save-btn').innerText="SAVE DATA"; 
            document.getElementById('sv-save-btn').style.background="#27ae60"; 
        } else { 
            App.db.stk_v_db.push(entry); 
        }
        
        App.saveToLocalStorage(); 
        alert("Trip Data Saved!"); 
        
        ['sv_v_no','sv_owner_name_auto','sv_t_trips','sv_diesel','sv_khoroch'].forEach(id => { 
            const el = document.getElementById(id); 
            if(el) el.value = (id === 'sv_v_no' || id === 'sv_owner_name_auto') ? '' : '0'; 
        });
        
        this.updateAutoSuggest();
    },

    updateDashboard: function() {
        const f = document.getElementById('sv_dash_f_date').value;
        const t = document.getElementById('sv_dash_t_date').value;
        const db = App.db.stk_v_db || [];
        
        let filtered = db.filter(i => i.date >= f && i.date <= t);
        let tT=0, tL=0, tD=0, tO=0;
        
        filtered.forEach(i => { 
            tT += i.trips; 
            tL += i.diesel_ltr; 
            tD += (i.diesel_ltr * (i.d_rate || 92.49)); 
            tO += i.other_exp; 
        });
        
        document.getElementById('sv-dash-container').innerHTML = `
            <div class="sv-sum-grid">
                <div class="sv-sum-card" style="background:#2c3e50"><span>Trips</span><strong>${tT}</strong></div>
                <div class="sv-sum-card" style="background:#2980b9"><span>Total Bill</span><strong>₹${(tT*1000).toFixed(0)}</strong></div>
                <div class="sv-sum-card" style="background:#2ecc71"><span>Diesel(L)</span><strong>${tL.toFixed(1)}</strong></div>
                <div class="sv-sum-card" style="background:#e67e22"><span>D-Exp</span><strong>₹${tD.toFixed(0)}</strong></div>
                <div class="sv-sum-card" style="background:#d35400"><span>Other Exp</span><strong>₹${tO.toFixed(0)}</strong></div>
            </div>
            <div class="sv-full-card">
                <span>Net Balance</span>
                <strong>₹${((tT*1000) - (tD+tO)).toFixed(0)}</strong>
            </div>
        `;
    },

    updateSelectors: function() {
        const db = App.db.stk_v_db || [];
        const owners = App.db.stk_v_owners || {};
        const vList = [...new Set(db.map(i => i.v_no))];
        const ownerList = [...new Set(Object.values(owners).map(o => o.name))];
        
        document.getElementById('sv_v_selector').innerHTML = '<option value="">-- Single Vehicle --</option>' + vList.map(v => `<option value="${v}">${v}</option>`).join('');
        document.getElementById('sv_o_selector').innerHTML = '<option value="">-- Owner Name --</option>' + ownerList.map(o => `<option value="${o}">${o}</option>`).join('');
    },

    loadLedger: function(type) {
        if(type === 'owner') document.getElementById('sv_v_selector').value = ""; 
        if(type === 'vehicle') document.getElementById('sv_o_selector').value = "";
        
        const selO = document.getElementById('sv_o_selector').value;
        const selV = document.getElementById('sv_v_selector').value;
        const from = document.getElementById('sv_led_f_date').value;
        const to = document.getElementById('sv_led_t_date').value;
        
        if(!selO && !selV) return;
        
        const db = App.db.stk_v_db || [];
        const owners = App.db.stk_v_owners || {};
        
        let entries = selO 
            ? db.filter(i => Object.keys(owners).filter(v => owners[v].name === selO).includes(i.v_no) && i.date >= from && i.date <= to) 
            : db.filter(i => i.v_no === selV && i.date >= from && i.date <= to);
            
        entries.sort((a,b) => new Date(a.date) - new Date(b.date));
        
        document.getElementById('sv-ledger-header').style.display = 'block'; 
        document.getElementById('sv-ledger-content').style.display = 'block';
        
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        const headerEl = document.getElementById('sv_print_ghat_name');
        if(headerEl) headerEl.innerText = `${currentGhat.toUpperCase()} (VEHICLE LEDGER)`;

        let wheelType = (selV && entries.length > 0) ? ` (${entries[entries.length-1].wheel})` : "";
        document.getElementById('sv_p_vno').innerText = (selV || "Multiple Vehicles") + wheelType; 
        document.getElementById('sv_p_owner').innerText = selO || owners[selV]?.name || "N/A";
        
        let sT=0, sB=0, sD=0, sO=0, sBal=0, sL=0;
        
        document.getElementById('sv-ledger-data').innerHTML = entries.map(i => {
            const rate = this.getTripRate(i.wheel);
            const dc = i.diesel_ltr * (i.d_rate || 92.49);
            const tb = i.trips * rate;
            const b = tb - (dc + i.other_exp);
            
            sT+=i.trips; sB+=tb; sL+=i.diesel_ltr; sD+=dc; sO+=i.other_exp; sBal+=b;
            
            return `
                <tr>
                    <td style="padding:8px;">${i.date.split('-').reverse().join('-')}</td>
                    <td style="padding:8px;">${i.wheel}</td>
                    <td style="padding:8px; font-weight:bold;">${i.trips}</td>
                    <td style="padding:8px;">${rate}</td>
                    <td style="padding:8px;">${i.diesel_ltr.toFixed(1)}</td>
                    <td style="padding:8px; color:#e67e22;">${dc.toFixed(0)}</td>
                    <td style="padding:8px; color:#d35400;">${i.other_exp.toFixed(0)}</td>
                    <td style="padding:8px;" class="${b>=0?'bal-pos':'bal-neg'}">₹${b.toFixed(0)}</td>
                    <td class="no-print">
                        <button onclick="StockVehicleModule.editEntry(${i.id})" style="color:blue; border:none; background:none; cursor:pointer;">Edit</button>
                    </td>
                </tr>`;
        }).join('');
        
        document.getElementById('sv-ledger-sum-area').innerHTML = `
            <div class="sv-sum-grid">
                <div class="sv-sum-card" style="background:#2c3e50"><span>Trips</span><strong>${sT}</strong></div>
                <div class="sv-sum-card" style="background:#2980b9"><span>Total Bill</span><strong>₹${sB.toFixed(0)}</strong></div>
                <div class="sv-sum-card" style="background:#2ecc71"><span>Diesel(L)</span><strong>${sL.toFixed(1)}</strong></div>
                <div class="sv-sum-card" style="background:#e67e22"><span>D-Exp</span><strong>₹${sD.toFixed(0)}</strong></div>
                <div class="sv-sum-card" style="background:#d35400"><span>Other Exp</span><strong>₹${sO.toFixed(0)}</strong></div>
            </div>
            <div class="sv-full-card"><span>Net Balance</span><strong>₹${sBal.toFixed(0)}</strong></div>
        `;
    },

    editEntry: function(id) { 
        this.editID = id; 
        const i = (App.db.stk_v_db || []).find(x => x.id === id); 
        
        document.getElementById('sv_date').value = i.date; 
        document.getElementById('sv_v_no').value = i.v_no; 
        document.getElementById('sv_wheel').value = i.wheel; 
        document.getElementById('sv_t_trips').value = i.trips; 
        document.getElementById('sv_diesel').value = i.diesel_ltr; 
        document.getElementById('sv_d_rate').value = i.d_rate; 
        document.getElementById('sv_khoroch').value = i.other_exp; 
        
        this.fetchOwner(); 
        this.switchInternalTab('entry');
        
        document.getElementById('sv-save-btn').innerText="UPDATE DATA"; 
        document.getElementById('sv-save-btn').style.background="#f39c12";
    }
};