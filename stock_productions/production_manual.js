// ==========================================
// MODULE: PRODUCTION MANUAL ADJUSTMENTS (production_manual.js)
// ==========================================
const ProductionManualModule = {
    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('p_man_date').value = today;
        
        if(!App.db.prod_manual_adjustments_db) App.db.prod_manual_adjustments_db = [];
        this.renderTable();
    },

    getHTML: function() {
        return `
            <div class="card no-print" style="border-top-color: #16a085;">
                <h3 style="color: #16a085; margin-top:0;">➕ Production Stock Manual Adjustment</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px; align-items:end;">
                    <div><label>Date</label><input type="date" id="p_man_date"></div>
                    <div>
                        <label>Action Type</label>
                        <select id="p_man_type">
                            <option value="ADD">➕ ADD STOCK (স্টক বাড়ান)</option>
                            <option value="REDUCE">➖ REDUCE STOCK (স্টক কমান)</option>
                        </select>
                    </div>
                    <div><label>Quantity (CFT)</label><input type="number" id="p_man_cft" value="0"></div>
                    <div><label>Reason / Remarks</label><input type="text" id="p_man_remark" placeholder="e.g. Theft / Recounting"></div>
                    <button onclick="ProductionManualModule.saveEntry()" class="btn-action" style="background:#16a085;">SAVE ENTRY</button>
                </div>
            </div>

            <div class="card" style="margin-top:15px; border-top-color: #16a085;">
                <h3 style="color: #2c3e50; margin-top:0;">📋 Adjustment Logs</h3>
                <div class="table-responsive">
                    <table class="d-table" style="width:100%; border:1px solid #ddd;">
                        <thead>
                            <tr style="background:#f4f6f7; color:#333;">
                                <th style="padding:10px;">Date</th>
                                <th>Type</th>
                                <th>CFT (Volume)</th>
                                <th>Reason / Remarks</th>
                                <th class="no-print" style="text-align:center;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="p-manual-table-body"></tbody>
                    </table>
                </div>
            </div>
        `;
    },

    saveEntry: function() {
        const cft = parseFloat(document.getElementById('p_man_cft').value) || 0;
        const remark = document.getElementById('p_man_remark').value.trim();
        
        if(cft <= 0) return alert("Enter a valid CFT amount!");
        if(!remark) return alert("Please specify a reason!");

        const entry = {
            id: Date.now(),
            date: document.getElementById('p_man_date').value,
            type: document.getElementById('p_man_type').value,
            cft: cft,
            remark: remark
        };

        App.db.prod_manual_adjustments_db.push(entry);
        App.saveToLocalStorage();
        alert("Adjustment Entry Saved!");
        
        document.getElementById('p_man_cft').value = '0';
        document.getElementById('p_man_remark').value = '';
        this.renderTable();
    },

    renderTable: function() {
        const tbody = document.getElementById('p-manual-table-body');
        if(!tbody) return;

        let logs = App.db.prod_manual_adjustments_db || [];
        logs.sort((a,b) => new Date(b.date) - new Date(a.date)); // Newest first

        if(logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px; color:#7f8c8d;">No adjustments recorded yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(i => {
            let badgeColor = i.type === 'ADD' ? 'background:#e8f8f5; color:#27ae60; border-color:#27ae60;' : 'background:#fdedec; color:#e74c3c; border-color:#e74c3c;';
            return `
                <tr>
                    <td style="padding:10px;">${i.date.split('-').reverse().join('-')}</td>
                    <td><span class="pill-badge" style="${badgeColor}">${i.type}</span></td>
                    <td style="font-weight:bold; color:${i.type==='ADD'?'#27ae60':'#e74c3c'}">${i.cft.toFixed(0)} CFT</td>
                    <td>${i.remark}</td>
                    <td class="no-print" style="text-align:center;">
                        <button onclick="ProductionManualModule.deleteEntry(${i.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    deleteEntry: function(id) {
        if(confirm("Delete this adjustment log?")) {
            App.db.prod_manual_adjustments_db = App.db.prod_manual_adjustments_db.filter(i => i.id !== id);
            App.saveToLocalStorage();
            this.renderTable();
        }
    }
};