// ==========================================
// MODULE 5: STOCK MANUAL ENTRY (EXTRA INFLOW) (stock_manual.js)
// ==========================================
const StockManualEntryModule = {
    init: function() { 
        const today = new Date().toISOString().split('T')[0]; 
        if(document.getElementById('stk-man-date')) {
            document.getElementById('stk-man-date').value = today; 
        }
        if(!App.db.stock_manual_adjustments) {
            App.db.stock_manual_adjustments = [];
        }
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
            </div>
        `;
    },
    
    saveEntry: function() {
        const date = document.getElementById('stk-man-date').value;
        const desc = document.getElementById('stk-man-desc').value.trim();
        const amount = parseFloat(document.getElementById('stk-man-amount').value) || 0;
        
        if(!desc || amount <= 0) return alert("Provide valid details and amount!");
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        
        App.db.stock_manual_adjustments.push({ 
            id: Date.now(), 
            date: date, 
            desc: desc, 
            amount: amount, 
            ghat: currentGhat 
        });
        App.saveToLocalStorage(); 
        
        document.getElementById('stk-man-desc').value = ""; 
        document.getElementById('stk-man-amount').value = ""; 
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
                return `
                    <tr>
                        <td style="padding:8px; border:1px solid #333; text-align:center;">${i+1}</td>
                        <td style="padding:8px; border:1px solid #333; text-align:center;">${row.date}</td>
                        <td style="padding:8px; border:1px solid #333; font-weight:bold;">${row.desc}</td>
                        <td style="padding:8px; border:1px solid #333; text-align:right; font-weight:bold; color:#27ae60;">₹${row.amount.toFixed(2)}</td>
                        <td style="padding:8px; border:1px solid #333; text-align:center;" class="no-print">
                            <button onclick="StockManualEntryModule.deleteEntry(${row.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">Del</button>
                        </td>
                    </tr>`; 
            }).join('') + `
                <tr style="background:#e2e8f0; font-weight:900;">
                    <td colspan="3" style="text-align:right; padding:10px; border:1px solid #333;">TOTAL EXTRA:</td>
                    <td style="text-align:right; padding:10px; border:1px solid #333; color:#27ae60;">₹${total.toFixed(2)}</td>
                    <td class="no-print" style="border:1px solid #333;"></td>
                </tr>`;
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