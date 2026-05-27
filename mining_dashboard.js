// ==========================================
// MINING DASHBOARD & ARCHIVE MODULE
// ==========================================
var MiningDashboardModule = {
    init: function() {
        const today = new Date();
        document.getElementById('md_from').value = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        document.getElementById('md_to').value = today.toISOString().split('T')[0];
        this.generateReport();
    },

    getHTML: function() {
        return `
            <style>
                .dash-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
                .dash-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; border-bottom: 4px solid var(--p-color); }
                .dash-card h4 { margin: 0; color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .dash-card h2 { margin: 10px 0 0; font-size: 24px; color: #2c3e50; }
                .dash-card.profit { border-bottom-color: #27ae60; } .dash-card.profit h2 { color: #27ae60; }
                .dash-card.expense { border-bottom-color: #e74c3c; } .dash-card.expense h2 { color: #e74c3c; }
                .dash-card.royalty { border-bottom-color: #f39c12; } .dash-card.royalty h2 { color: #f39c12; }
                
                /* প্রিন্টের জন্য স্পেশাল CSS */
                .print-header { display: none; }
                @media print {
                    .no-print { display: none !important; }
                    .print-header { display: block !important; text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #1e3a5f; }
                    .print-header h1 { margin: 0; color: #1e3a5f; font-size: 26px; text-transform: uppercase; }
                    .print-header p { margin: 5px 0 0; font-weight: bold; font-size: 14px; }
                    .dash-card { border: 2px solid #000; box-shadow: none; break-inside: avoid; }
                }
            </style>

            <div class="card no-print" style="border-top-color: #2980b9;">
                <h3 style="color:#2980b9; margin-top:0;">⛏️ Mining Dashboard & Yearly Report</h3>
                <div class="form-grid" style="display:flex; gap:10px; align-items:end; background:#eef2f7; padding:15px; border-radius:8px; flex-wrap:wrap;">
                    <div style="flex:1"><label>From Date</label><input type="date" id="md_from" class="sm-date-input"></div>
                    <div style="flex:1"><label>To Date</label><input type="date" id="md_to" class="sm-date-input"></div>
                    <button onclick="MiningDashboardModule.generateReport()" class="btn-action" style="background:#2980b9;">Generate Report</button>
                    <button onclick="window.print()" class="btn-action" style="background:#e67e22; width:auto;">🖨️ Print Report</button>
                </div>
            </div>

            <div id="md_report_area" style="display:none;">
                <div class="print-header">
                    <h1 id="md_print_ghat_name">MINING REPORT</h1>
                    <p id="md_print_date_range"></p>
                </div>

                <div class="dash-stat-grid" id="md_cards"></div>
                
                <div class="card no-print" style="margin-top:20px;">
                    <h3 style="margin-top:0; color:#333; border-bottom:2px solid #eee; padding-bottom:10px;">📅 Daily Sheet Archive Register</h3>
                    <div class="table-responsive">
                        <table style="width:100%; border-collapse:collapse; border:1px solid #ddd;">
                            <thead style="background:#1e3a5f; color:white;">
                                <tr>
                                    <th style="padding:10px;">Date</th>
                                    <th style="padding:10px;">Total Trucks</th>
                                    <th style="padding:10px;">Total CFT</th>
                                    <th style="padding:10px;">Field Expense</th>
                                    <th style="padding:10px;">Net Profit Joma</th>
                                    <th style="padding:10px;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="md_archive_body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    generateReport: function() {
        const from = document.getElementById('md_from').value;
        const to = document.getElementById('md_to').value;
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";

        if(!from || !to) return alert("Select Date Range!");

        const sheets = (App.db.mining_sheet_db || []).filter(i => i.ghat === currentGhat && i.date >= from && i.date <= to);
        const exps = (App.db.mining_expenses_db || []).filter(i => i.ghat === currentGhat && i.date >= from && i.date <= to);
        const manuals = (App.db.manual_adjustments_db || []).filter(i => i.ghat === currentGhat && i.date >= from && i.date <= to);

        // প্রিন্ট হেডারের ডেটা সেট করা
        document.getElementById('md_print_ghat_name').innerText = currentGhat + " - MINING REPORT";
        document.getElementById('md_print_date_range').innerText = `Report Period: ${from.split('-').reverse().join('-')} TO ${to.split('-').reverse().join('-')}`;

        let totalGross = 0, totalRt = 0, totalGst = 0, totalCft = 0, totalExp = 0, totalManual = 0;
        let dayByDay = {}; 

        sheets.forEach(r => {
            let rate = r.rateAtTimeOfEntry || r.sandRate;
            let rt = r.rtAmount || 0;
            let gst = r.gstAmount || 0;
            let load = r.loadingCharge || 0;
            let net = rate - rt - gst - load;

            totalGross += net;
            totalRt += rt;
            totalGst += gst;
            totalCft += (r.cft || 0);

            if(!dayByDay[r.date]) dayByDay[r.date] = { trucks:0, cft:0, net:0, exp:0 };
            dayByDay[r.date].trucks += 1;
            dayByDay[r.date].cft += (r.cft || 0);
            dayByDay[r.date].net += net;
        });

        exps.forEach(e => {
            totalExp += parseFloat(e.amount || 0);
            if(!dayByDay[e.date]) dayByDay[e.date] = { trucks:0, cft:0, net:0, exp:0 };
            dayByDay[e.date].exp += parseFloat(e.amount || 0);
        });

        manuals.forEach(m => {
            totalManual += parseFloat(m.amount || 0);
        });

        let finalProfit = totalGross - totalExp + totalManual;

        document.getElementById('md_report_area').style.display = 'block';
        document.getElementById('md_cards').innerHTML = `
            <div class="dash-card"><h4>Total Trucks</h4><h2>${sheets.length}</h2></div>
            <div class="dash-card royalty"><h4>Royalty + GST Paid</h4><h2>₹${(totalRt + totalGst).toFixed(0)}</h2><span style="font-size:10px; color:#555;">On ${totalCft} CFT</span></div>
            <div class="dash-card expense"><h4>Total Field Expenses</h4><h2>₹${totalExp.toFixed(0)}</h2></div>
            <div class="dash-card"><h4>Extra / Manual Add</h4><h2>₹${totalManual.toFixed(0)}</h2></div>
            <div class="dash-card profit"><h4>Net Profit (Joma)</h4><h2 style="font-weight:900;">₹${finalProfit.toFixed(0)}</h2></div>
        `;

        let archiveHtml = "";
        let sortedDates = Object.keys(dayByDay).sort((a,b) => new Date(b) - new Date(a));
        
        sortedDates.forEach(d => {
            let data = dayByDay[d];
            archiveHtml += `
                <tr style="text-align:center; border-bottom:1px solid #eee;">
                    <td style="padding:10px; font-weight:bold;">${d.split('-').reverse().join('-')}</td>
                    <td style="padding:10px;">${data.trucks}</td>
                    <td style="padding:10px;">${data.cft}</td>
                    <td style="padding:10px; color:#e74c3c; font-weight:bold;">₹${data.exp.toFixed(2)}</td>
                    <td style="padding:10px; color:#27ae60; font-weight:bold;">₹${data.net.toFixed(2)}</td>
                    <td style="padding:10px;" class="no-print">
                        <button onclick="MiningDashboardModule.goToSheet('${d}')" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">👁️ View Sheet</button>
                    </td>
                </tr>
            `;
        });
        
        if(archiveHtml === "") archiveHtml = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#7f8c8d;">No Data Available in this Date Range</td></tr>`;
        document.getElementById('md_archive_body').innerHTML = archiveHtml;
    },

    goToSheet: function(dateStr) {
        App.showPage('mining'); 
        setTimeout(() => {
            let dateInput = document.getElementById('ms-date');
            if(dateInput) {
                dateInput.value = dateStr;
                MiningModule.updateDate(); 
            }
        }, 100);
    }
};