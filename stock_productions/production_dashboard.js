// ==========================================
// MODULE: PRODUCTION DASHBOARD (production_dashboard.js)
// ==========================================
const ProductionDashboardModule = {
    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('pdash_f_date').value = today.substring(0, 8) + '01'; // মাসের প্রথম দিন
        document.getElementById('pdash_t_date').value = today; // আজকের দিন
        
        this.updateDashboard();
    },

    getHTML: function() {
        return `
            <style>
                .pdash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px; }
                .pdash-card { padding: 18px; border-radius: 12px; color: white !important; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
                .pdash-card span { display: block; font-size: 11px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
                .pdash-card strong { font-size: 24px; display: block; font-weight: 900; }
                .pdash-full-card { width: 100%; margin-top: 15px; padding: 25px; background: #2c3e50 !important; color: white !important; border-radius: 12px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.15); }
                .pdash-full-card span { display: block; font-size: 14px; text-transform: uppercase; margin-bottom: 5px; color: #bdc3c7; }
                .pdash-full-card strong { font-size: 32px; font-weight: 900; color: #f1c40f; }
                @media print { .no-print { display: none !important; } }
            </style>

            <div class="card no-print" style="border-top-color: #16a085;">
                <h2 style="color: #16a085; margin-top:0; font-size:22px;">📊 Master Production Dashboard</h2>
                <div style="display:flex; gap:12px; align-items:end; flex-wrap:wrap; background:#eef2f7; padding:15px; border-radius:8px;">
                    <div style="flex:1"><label style="font-weight:bold; color:#2c3e50;">From Date</label><input type="date" id="pdash_f_date" style="border:1px solid #bdc3c7;"></div>
                    <div style="flex:1"><label style="font-weight:bold; color:#2c3e50;">To Date</label><input type="date" id="pdash_t_date" style="border:1px solid #bdc3c7;"></div>
                    <button onclick="ProductionDashboardModule.updateDashboard()" class="btn-action" style="background:#16a085; padding: 10px 20px; font-size:15px;">🔍 Filter Report</button>
                    <button onclick="window.print()" class="btn-action" style="background:#e74c3c; padding: 10px 20px; font-size:15px;">🖨️ Print</button>
                </div>
            </div>

            <div id="pdash-report-view">
                <!-- Top Summary Cards -->
                <div class="pdash-grid" id="pdash-top-cards"></div>

                <!-- Grand Total Card -->
                <div id="pdash-grand-total"></div>

                <!-- Detailed Breakdown Tables -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 25px;">
                    <div class="card" style="border-top-color:#8e44ad; box-shadow:none; border:1px solid #ddd;">
                        <h4 style="color:#8e44ad; margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">🚜 Machine Cost Breakdown</h4>
                        <div id="pdash-machine-table"></div>
                    </div>
                    
                    <div class="card" style="border-top-color:#2980b9; box-shadow:none; border:1px solid #ddd;">
                        <h4 style="color:#2980b9; margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">🚚 Vehicle Cost Breakdown</h4>
                        <div id="pdash-vehicle-table"></div>
                    </div>

                    <div class="card" style="border-top-color:#d35400; box-shadow:none; border:1px solid #ddd;">
                        <h4 style="color:#d35400; margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">💸 Other Expenses Breakdown</h4>
                        <div id="pdash-expense-table"></div>
                    </div>
                </div>
            </div>
        `;
    },

    updateDashboard: function() {
        const f = document.getElementById('pdash_f_date').value;
        const t = document.getElementById('pdash_t_date').value;

        // 1. Calculate Trucks & Vehicle Costs (From Vehicle Panel)
        let totalTrucks = 0;
        let totalVehicleCost = 0;
        let vehicleBreakdown = {};

        let vEntries = (App.db.stk_v_db || []).filter(i => i.date >= f && i.date <= t);
        vEntries.forEach(i => {
            // ট্রিপ বা ট্রাকের সংখ্যা কাউন্ট করা হচ্ছে 
            let trips = parseFloat(i.trips) || parseFloat(i.qty) || parseFloat(i.truck_count) || 1; 
            totalTrucks += trips;

            // ভাড়ার এমাউন্ট কাউন্ট করা হচ্ছে
            let amt = parseFloat(i.amount) || parseFloat(i.total) || parseFloat(i.freight) || 0;
            totalVehicleCost += amt;

            let vName = i.v_no || i.truck_no || i.vehicle_no || 'Unknown Vehicle';
            if(!vehicleBreakdown[vName]) vehicleBreakdown[vName] = 0;
            vehicleBreakdown[vName] += amt;
        });

        // 2. Calculate Machine Costs & Diesel
        let totalMachineRent = 0;
        let totalMachineDieselLtr = 0;
        let totalMachineDieselCost = 0;
        let machineBreakdown = {};

        let mEntries = (App.db.prod_m_entries || []).filter(i => i.date >= f && i.date <= t);
        mEntries.forEach(i => {
            let earning = i.earning || 0;
            let dCost = parseFloat(i.dcost) || 0;
            
            totalMachineRent += earning;
            totalMachineDieselLtr += (i.diesel || 0);
            totalMachineDieselCost += dCost;

            if(!machineBreakdown[i.machine]) machineBreakdown[i.machine] = { rent: 0, fuelCost: 0 };
            machineBreakdown[i.machine].rent += earning;
            machineBreakdown[i.machine].fuelCost += dCost;
        });

        // 3. Calculate Other Expenses
        let totalOtherExp = 0;
        let expBreakdown = {};
        
        let eEntries = (App.db.prod_expenses_db || []).filter(i => i.date >= f && i.date <= t);
        eEntries.forEach(i => {
            totalOtherExp += i.amount;
            if(!expBreakdown[i.category]) expBreakdown[i.category] = 0;
            expBreakdown[i.category] += i.amount;
        });

        // 4. Calculate Grand Totals
        let totalProductionCost = totalMachineRent + totalVehicleCost + totalMachineDieselCost + totalOtherExp;
        let costPerTruck = totalTrucks > 0 ? (totalProductionCost / totalTrucks) : 0;

        // --- Render UI ---
        
        // Top Cards
        document.getElementById('pdash-top-cards').innerHTML = `
            <div class="pdash-card" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
                <span>Total Produced</span>
                <strong>${totalTrucks.toFixed(0)} TRUCKS</strong>
            </div>
            <div class="pdash-card" style="background: linear-gradient(135deg, #8e44ad, #9b59b6);">
                <span>Total Machine Rent</span>
                <strong>₹${totalMachineRent.toFixed(0)}</strong>
            </div>
            <div class="pdash-card" style="background: linear-gradient(135deg, #2980b9, #3498db);">
                <span>Total Vehicle Cost</span>
                <strong>₹${totalVehicleCost.toFixed(0)}</strong>
            </div>
            <div class="pdash-card" style="background: linear-gradient(135deg, #c0392b, #e74c3c);">
                <span>Machine Diesel Cost</span>
                <strong>₹${totalMachineDieselCost.toFixed(0)}</strong>
                <div style="font-size:10px; margin-top:5px; opacity:0.8;">(${totalMachineDieselLtr.toFixed(1)} LTR Burned)</div>
            </div>
            <div class="pdash-card" style="background: linear-gradient(135deg, #d35400, #e67e22);">
                <span>Other Expenses</span>
                <strong>₹${totalOtherExp.toFixed(0)}</strong>
            </div>
        `;

        // Grand Total Card
        document.getElementById('pdash-grand-total').innerHTML = `
            <div class="pdash-full-card">
                <span>Grand Total Production Cost (A to Z)</span>
                <strong>₹${totalProductionCost.toLocaleString('en-IN')}</strong>
                <div style="margin-top: 15px; display: inline-block; background: rgba(255,255,255,0.1); padding: 8px 20px; border-radius: 20px;">
                    <span style="color:#ecf0f1; margin:0; font-size:16px;">Avg. Production Cost Per Truck: <b style="color:#2ecc71; font-size:22px;">₹${costPerTruck.toFixed(2)}</b></span>
                </div>
            </div>
        `;

        // Machine Breakdown Table
        let mTableHtml = `<table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
            <tr style="border-bottom:2px solid #8e44ad; color:#333;">
                <th style="padding:8px 0;">Machine Name</th>
                <th style="text-align:right;">Rent (₹)</th>
                <th style="text-align:right;">Fuel (₹)</th>
            </tr>`;
        for(let m in machineBreakdown) {
            mTableHtml += `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px 0; font-weight:bold; color:#2c3e50;">${m}</td>
                <td style="text-align:right; color:#8e44ad;">₹${machineBreakdown[m].rent.toFixed(0)}</td>
                <td style="text-align:right; color:#e74c3c;">₹${machineBreakdown[m].fuelCost.toFixed(0)}</td>
            </tr>`;
        }
        if(Object.keys(machineBreakdown).length === 0) mTableHtml += `<tr><td colspan="3" style="text-align:center; padding:10px; color:#999;">No machine data found.</td></tr>`;
        mTableHtml += `</table>`;
        document.getElementById('pdash-machine-table').innerHTML = mTableHtml;

        // Vehicle Breakdown Table
        let vTableHtml = `<table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
            <tr style="border-bottom:2px solid #2980b9; color:#333;">
                <th style="padding:8px 0;">Vehicle No / Name</th>
                <th style="text-align:right;">Total Freight (₹)</th>
            </tr>`;
        for(let v in vehicleBreakdown) {
            vTableHtml += `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px 0; font-weight:bold; color:#2c3e50;">${v}</td>
                <td style="text-align:right; color:#2980b9; font-weight:bold;">₹${vehicleBreakdown[v].toFixed(0)}</td>
            </tr>`;
        }
        if(Object.keys(vehicleBreakdown).length === 0) vTableHtml += `<tr><td colspan="2" style="text-align:center; padding:10px; color:#999;">No vehicle data found.</td></tr>`;
        vTableHtml += `</table>`;
        document.getElementById('pdash-vehicle-table').innerHTML = vTableHtml;

        // Expense Breakdown Table
        let eTableHtml = `<table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
            <tr style="border-bottom:2px solid #d35400; color:#333;">
                <th style="padding:8px 0;">Category Name</th>
                <th style="text-align:right;">Amount (₹)</th>
            </tr>`;
        for(let cat in expBreakdown) {
            eTableHtml += `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px 0; font-weight:bold; color:#2c3e50;">${cat}</td>
                <td style="text-align:right; color:#d35400; font-weight:bold;">₹${expBreakdown[cat].toFixed(0)}</td>
            </tr>`;
        }
        if(Object.keys(expBreakdown).length === 0) eTableHtml += `<tr><td colspan="2" style="text-align:center; padding:10px; color:#999;">No expense data found.</td></tr>`;
        eTableHtml += `</table>`;
        document.getElementById('pdash-expense-table').innerHTML = eTableHtml;
    }
};