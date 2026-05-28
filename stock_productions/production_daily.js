// ==========================================
// MODULE: PRODUCTION DAILY CASH SHEET (production_daily.js)
// ==========================================
const ProductionDailyModule = {
    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('p_daily_date').value = today;
        this.generateReport();
    },

    getHTML: function() {
        return `
            <style>
                .pdaily-header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 10px; margin-bottom: 20px; }
                .pdaily-header h2 { color: #2c3e50; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
                .pdaily-header p { margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #7f8c8d; }
                .pdaily-section { margin-bottom: 25px; }
                .pdaily-section h3 { background: #eef2f7; color: #2980b9; padding: 10px 15px; border-left: 5px solid #2980b9; margin: 0 0 15px 0; font-size: 16px; border-radius: 0 4px 4px 0; }
                .pdaily-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 10px; }
                .pdaily-table th, .pdaily-table td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
                .pdaily-table th { background: #f8f9fa; color: #333; font-weight: bold; }
                .pdaily-summary-box { background: #fef9e7; border: 2px dashed #f1c40f; padding: 15px; text-align: center; border-radius: 8px; margin-top: 20px; }
                .pdaily-summary-box h3 { margin: 0; color: #d35400; font-size: 22px; }
                @media print { 
                    .no-print { display: none !important; } 
                    .pdaily-table th, .pdaily-table td { padding: 6px; font-size: 12px; }
                    .card { box-shadow: none; border: none; padding: 0; }
                }
            </style>

            <div class="card no-print" style="margin-bottom: 20px; border-top-color:#2980b9; display:flex; gap:15px; align-items:end;">
                <div><label>Select Date for Daily Sheet</label><input type="date" id="p_daily_date" class="pd-date-input" style="padding:8px; border:1px solid #bdc3c7; border-radius:4px;"></div>
                <button onclick="ProductionDailyModule.generateReport()" class="btn-action" style="background:#2980b9;">Generate Sheet</button>
                <button onclick="window.print()" class="btn-action" style="background:#e74c3c; margin-left:auto;">🖨️ Print Cash Sheet</button>
            </div>

            <div class="card" id="pdaily-print-area">
                <!-- Content will be generated here -->
            </div>
        `;
    },

    generateReport: function() {
        const date = document.getElementById('p_daily_date').value;
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        const displayDate = date.split('-').reverse().join('-');

        // 1. Fetch Production Data (Trucks)
        let trucksProduced = 0;
        let truckListHtml = '';
        let vEntries = (App.db.stk_v_db || []).filter(i => i.date === date);
        
        if(vEntries.length > 0) {
            vEntries.forEach(i => {
                let trips = parseFloat(i.trips) || parseFloat(i.qty) || parseFloat(i.truck_count) || 1;
                let vName = i.v_no || i.truck_no || i.vehicle_no || 'Unknown';
                trucksProduced += trips;
                truckListHtml += `<tr>
                    <td>${vName}</td>
                    <td style="text-align:center;">${trips}</td>
                    <td>${i.driver || '-'}</td>
                </tr>`;
            });
        } else {
            truckListHtml = `<tr><td colspan="3" style="text-align:center; color:#999;">আজ কোনো ট্রাক লোড হয়নি (No trucks loaded today).</td></tr>`;
        }

        // 2. Fetch Cash Outflows (Payments)
        let totalCashOut = 0;
        let cashHtml = '';

        // A. Machine Cash Payments
        let mPayments = (App.db.prod_m_payments || []).filter(i => i.date === date);
        mPayments.forEach(p => {
            totalCashOut += p.amt;
            cashHtml += `<tr>
                <td><span class="pill-badge" style="background:#e8f8f5; color:#16a085; border-color:#16a085;">মেশিন ভাড়া (Machine)</span></td>
                <td><b>${p.machine}</b></td>
                <td>${p.remark || 'Advance / Clear'}</td>
                <td style="text-align:right; font-weight:bold; color:#c0392b;">₹${p.amt.toFixed(0)}</td>
            </tr>`;
        });

        // B. Diesel Cash Payments (To Pump)
        let dPayments = (App.db.prod_d_payments || []).filter(i => i.date === date);
        dPayments.forEach(p => {
            totalCashOut += p.amount;
            cashHtml += `<tr>
                <td><span class="pill-badge" style="background:#fef5e7; color:#e67e22; border-color:#e67e22;">ডিজেল বিল (Diesel)</span></td>
                <td><b>${p.supplier}</b></td>
                <td>${p.remark || 'Pump Payment'}</td>
                <td style="text-align:right; font-weight:bold; color:#c0392b;">₹${p.amount.toFixed(0)}</td>
            </tr>`;
        });

        // C. Daily Expenses (Cash expenses like Labour, Lease etc.)
        let otherExp = (App.db.prod_expenses_db || []).filter(i => i.date === date);
        otherExp.forEach(e => {
            totalCashOut += e.amount;
            cashHtml += `<tr>
                <td><span class="pill-badge" style="background:#fdedec; color:#e74c3c; border-color:#e74c3c;">অন্যান্য খরচ (Expense)</span></td>
                <td><b>${e.category}</b></td>
                <td>${e.remarks || '-'}</td>
                <td style="text-align:right; font-weight:bold; color:#c0392b;">₹${e.amount.toFixed(0)}</td>
            </tr>`;
        });

        if(cashHtml === '') {
            cashHtml = `<tr><td colspan="4" style="text-align:center; color:#999;">আজ কোনো নগদ খরচের এন্ট্রি নেই (No cash expenses recorded).</td></tr>`;
        }

        // Render Report
        document.getElementById('pdaily-print-area').innerHTML = `
            <div class="pdaily-header">
                <h2>${currentGhat}</h2>
                <p>দৈনিক প্রোডাকশন ও ক্যাশ রিপোর্ট <br><span style="font-size:12px; font-weight:normal;">(DAILY PRODUCTION & CASH REPORT)</span></p>
                <div style="margin-top:5px; font-size:15px; color:#2980b9;"><b>তারিখ (Date):</b> ${displayDate}</div>
            </div>

            <div class="pdaily-section">
                <h3>অংশ ১: মোট ট্রাক প্রোডাকশন (PART 1: TOTAL TRUCKS)</h3>
                <table class="pdaily-table">
                    <tr>
                        <th>গাড়ির নম্বর / নাম (Vehicle No)</th>
                        <th style="text-align:center;">মোট ট্রিপ (Total Trips)</th>
                        <th>ড্রাইভার / মন্তব্য (Remarks)</th>
                    </tr>
                    ${truckListHtml}
                    <tr style="background:#ecf0f1;">
                        <td style="text-align:right; font-weight:bold;">আজকের মোট উৎপাদন (Total Production) :</td>
                        <td colspan="2" style="font-weight:bold; color:#27ae60; font-size:16px;">${trucksProduced} TRUCKS</td>
                    </tr>
                </table>
            </div>

            <div class="pdaily-section">
                <h3 style="background:#fdedec; color:#c0392b; border-left-color:#c0392b;">অংশ ২: নগদ খরচ ও পেমেন্ট (PART 2: CASH EXPENSES OUTFLOW)</h3>
                <table class="pdaily-table">
                    <tr>
                        <th style="width:20%;">খরচের ধরন (Type)</th>
                        <th style="width:30%;">কাকে দেওয়া হলো (Paid To)</th>
                        <th style="width:30%;">বিবরণ (Remarks)</th>
                        <th style="width:20%; text-align:right;">নগদ প্রদান (Amount)</th>
                    </tr>
                    ${cashHtml}
                </table>
            </div>

            <div class="pdaily-summary-box">
                <div style="font-size:14px; color:#7f8c8d; text-transform:uppercase; font-weight:bold; margin-bottom:5px;">আজকের মোট নগদ খরচ (Total Cash Outflow Today)</div>
                <h3>₹${totalCashOut.toLocaleString('en-IN')}</h3>
            </div>
            
            <div class="no-print" style="text-align:center; margin-top:20px; font-size:12px; color:#95a5a6;">
                * এই রিপোর্টে শুধুমাত্র আজকের নগদ খরচের হিসাব দেখানো হয়েছে (Reflects actual cash payments made today).
            </div>
        `;
    }
};