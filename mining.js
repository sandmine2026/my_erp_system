const MiningModule = {
    calculateTotalsOnly: function() {
        this.renderTable();
    }, 

    init: function() {
        const today = new Date().toISOString().split('T')[0];
        if(document.getElementById('ms-date')) {
            document.getElementById('ms-date').value = today;
        }
        
        const fields = ['ms-sand-rate', 'ms-cft', 'ms-phone-pay', 'ms-load'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', () => this.calculateLiveAmounts());
        });

        this.autoFillRates();
        this.updateDate();
    },

    getHTML: function() {
        const currentGhat = document.getElementById('global-ghat-selector') ? document.getElementById('global-ghat-selector').value : "Naricha Sand Mine";
        return `
            <style>
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: inline-block !important; font-weight: bold; }
                }
            </style>
            <div class="card no-print" style="border-top-color: var(--s-color);">
                <h3 style="margin-top:0; color:var(--p-color); font-size:15px; margin-bottom:10px;">Bulk Column Copy-Paste Box</h3>
                <div class="bulk-grid">
                    <div>
                        <label>1. Paste Trucks List</label>
                        <textarea id="ms-bulk-trucks" class="bulk-area" placeholder="Paste Truck No Column..."></textarea>
                    </div>
                    <div>
                        <label>2. Paste Wheels List</label>
                        <textarea id="ms-bulk-wheels" class="bulk-area" placeholder="Paste Wheel Column..."></textarea>
                    </div>
                    <div>
                        <label>3. Paste CFT List</label>
                        <textarea id="ms-bulk-cft" class="bulk-area" placeholder="Paste CFT Column..."></textarea>
                    </div>
                </div>
                <div style="text-align: right;">
                    <button class="btn-action" onclick="MiningModule.parseBulk()" style="width: 230px; background: var(--p-color);">PARSE & AUTO-FILL ALL</button>
                </div>
            </div>

            <div class="card no-print">
                <h3 style="margin-top:0; color:var(--p-color); border-bottom:2px solid #e2e8f0; padding-bottom:8px;">Single Manual Entry</h3>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; align-items: end;">
                    <div><label>Date</label><input type="date" id="ms-date" onchange="MiningModule.updateDate()"></div>
                    <div><label>Truck No</label><input type="text" id="ms-truck" placeholder="WB-XX-XXXX" style="text-transform: uppercase;"></div>
                    <div>
                        <label>Wheel</label>
                        <select id="ms-wheel" onchange="MiningModule.autoFillRates()">
                            <option value="6">6 Wheels</option>
                            <option value="10">10 Wheels</option>
                            <option value="12">12 Wheels</option>
                            <option value="16" selected>16 Wheels</option>
                        </select>
                    </div>
                    <div><label>Sand Rate</label><input type="number" id="ms-sand-rate" value="33000" step="any"></div>
                    <div><label>Online/Phone Pay</label><input type="number" id="ms-phone-pay" value="0" step="any"></div>
                    
                    <div>
                        <label>Select Bank/UPI A/c</label>
                        <select id="ms-bank-account">
                            <option value="PhonePay" selected>PhonePay / UPI</option>
                            <option value="SBI A/c">SBI Bank A/c</option>
                            <option value="HDFC A/c">HDFC Bank A/c</option>
                            <option value="CASH">Direct Cash</option>
                        </select>
                    </div>

                    <div><label>CFT</label><input type="number" id="ms-cft" value="750" step="any"></div>
                    <div><label>RT Amount</label><input type="number" id="ms-rt-amount" value="18750" readonly></div>
                    <div><label>I/C.G.S.T (5%)</label><input type="number" id="ms-gst" value="938" readonly></div>
                    <div><label>Phone Ex 1% (Auto)</label><input type="number" id="ms-phone-ex" value="0" readonly style="background:#f1f5f9;"></div>
                    
                    <div>
                        <label>Loading Machine</label>
                        <select id="ms-loading">
                            <option value="TATA">TATA</option>
                            <option value="VOLVO" selected>VOLVO</option>
                            <option value="JCB">JCB</option>
                            <option value="NA">NA</option>
                        </select>
                    </div>
                    <div><label>Load Charge</label><input type="number" id="ms-load" value="1300" step="any"></div>
                    <div><label>Net Balance</label><input type="number" id="ms-net-amount" value="12012" readonly style="color:var(--green); font-size:14px; background:#e8f8f5;"></div>
                    <div><button class="btn-action" onclick="MiningModule.saveSingle()">SAVE ENTRY</button></div>
                </div>
            </div>

            <div class="card" style="padding:0; border:none; background:transparent;">
                <div style="text-align:right; margin-bottom:10px;" class="no-print">
                    <button onclick="window.print()" style="background:var(--p-color); color:white; border:none; padding:8px 20px; font-weight:bold; border-radius:6px; cursor:pointer;">🖨️ Print Daily Sheet</button>
                </div>
                <div class="table-responsive">
                    <table id="mining-sheet-table" style="width: 100%; border-collapse: collapse; border: 2px solid #333;">
                        <thead>
                            <tr>
                                <th colspan="12" class="header-banner" style="background: #f39c12 !important; color: #000000 !important; font-size: 20px !important; font-weight: 900 !important; padding: 12px !important; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                                        <img src="assets/sandmine.png" alt="Logo" style="height: 40px; width: auto; border-radius: 4px;">
                                        <span id="ms-dynamic-ghat-name">MINING DAILY SHEET</span>
                                    </div>
                                </th>
                            </tr>
                            <tr style="background: white !important;">
                                <th colspan="3" style="background:#fff !important; border:none;"></th>
                                <th colspan="4" class="sub-header-banner" style="font-weight:900; font-size:12px; border:1px solid #333; background: #ffffff !important; color: black !important; text-align: center; padding: 5px;">DAILY SHEET</th>
                                <th colspan="5" class="sub-header-banner" style="font-weight:900; font-size:12px; border:1px solid #333; background: #ffffff !important; color: black !important; text-align: center; padding: 5px;" id="sheet-date-display">DATE-DD-MM-YYYY</th>
                            </tr>
                            <tr style="background: #f8f9fa !important;">
                                <th style="width:40px; padding: 5px; font-size: 11px;">SL</th>
                                <th style="padding: 5px; font-size: 11px;">TRUCK NO</th>
                                <th style="padding: 5px; font-size: 11px;">WHEEL</th>
                                <th style="padding: 5px; font-size: 11px;">SAND RATE</th>
                                <th style="padding: 5px; font-size: 11px;">PHONE PAY</th>
                                <th style="padding: 5px; font-size: 11px;">CFT</th>
                                <th style="padding: 5px; font-size: 11px;">RT AMOUNT</th>
                                <th style="padding: 5px; font-size: 11px;">I.G.S.T/C.G.S.T</th>
                                <th style="padding: 5px; font-size: 11px;">PHONE EX 1%</th>
                                <th style="padding: 5px; font-size: 11px;">LOADING MACHINE</th>
                                <th style="padding: 5px; font-size: 11px;">LOAD CHARGE</th>
                                <th style="padding: 5px; font-size: 11px;">NET BALANCE</th>
                                <th class="no-print" style="width:50px; padding: 5px; font-size: 11px;">ACT</th>
                            </tr>
                        </thead>
                        <tbody id="mining-sheet-table-body"></tbody>
                    </table>
                </div>
                <div id="print-only-expense-wrap"></div>
            </div>
        `;
    },

    updateDate: function() {
        const inputDate = document.getElementById('ms-date')?.value;
        if(inputDate) {
            const formatted = inputDate.split('-').reverse().join('/');
            if(document.getElementById('sheet-date-display')) {
                document.getElementById('sheet-date-display').innerText = "DATE - " + formatted;
            }
            this.renderTable();
        }
    },

    autoFillRates: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const wheelSelected = document.getElementById('ms-wheel')?.value || "16";
        
        let ghatRates = App.db.ghats_rate_master[currentGhat] || App.db.ghats_rate_master["Naricha Sand Mine"];
        const rates = ghatRates[wheelSelected];
        
        if(rates && document.getElementById('ms-sand-rate')) {
            document.getElementById('ms-sand-rate').value = rates.sandRate;
            document.getElementById('ms-cft').value = rates.cft;
            document.getElementById('ms-loading').value = rates.loading || "VOLVO";
            document.getElementById('ms-load').value = rates.load;
        }
        this.calculateLiveAmounts();
    },

    calculateLiveAmounts: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const wheelSelected = document.getElementById('ms-wheel')?.value || "16";
        
        let ghatRates = App.db.ghats_rate_master[currentGhat] || App.db.ghats_rate_master["Naricha Sand Mine"];
        let master = ghatRates[wheelSelected];
        let royFactor = master ? master.royaltyPerCft : 25;

        const sandRate = parseFloat(document.getElementById('ms-sand-rate')?.value) || 0;
        const cft = parseFloat(document.getElementById('ms-cft')?.value) || 0;
        
        const rtAmount = cft * royFactor;
        if(document.getElementById('ms-rt-amount')) document.getElementById('ms-rt-amount').value = Math.round(rtAmount);

        const gstAmount = rtAmount * 0.05;
        if(document.getElementById('ms-gst')) document.getElementById('ms-gst').value = Math.round(gstAmount);

        const load = parseFloat(document.getElementById('ms-load')?.value) || 0;
        const phonePay = parseFloat(document.getElementById('ms-phone-pay')?.value) || 0;
        
        const phoneEx = Math.round(phonePay * 0.01);
        if(document.getElementById('ms-phone-ex')) document.getElementById('ms-phone-ex').value = phoneEx;

        let finalNetBalance = sandRate - Math.round(rtAmount) - Math.round(gstAmount) - load;
        if(document.getElementById('ms-net-amount')) document.getElementById('ms-net-amount').value = finalNetBalance;
    },

    saveSingle: function() {
        const truckNo = document.getElementById('ms-truck')?.value.trim().toUpperCase();
        if(!truckNo) return alert("Truck No is missing!");
        
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const wheelSelected = document.getElementById('ms-wheel').value;
        
        let ghatRates = App.db.ghats_rate_master[currentGhat] || App.db.ghats_rate_master["Naricha Sand Mine"];
        let master = ghatRates[wheelSelected];
        let currentRoyFactor = master ? master.royaltyPerCft : 25;

        const rowData = {
            id: Date.now(),
            date: document.getElementById('ms-date').value,
            truckNo: truckNo, 
            wheel: wheelSelected,
            sandRate: parseFloat(document.getElementById('ms-sand-rate').value) || 0,
            phonePay: parseFloat(document.getElementById('ms-phone-pay').value) || 0,
            bankAccount: document.getElementById('ms-bank-account').value, 
            cft: parseFloat(document.getElementById('ms-cft').value) || 0,
            rtAmount: parseFloat(document.getElementById('ms-rt-amount').value) || 0,
            gstAmount: parseFloat(document.getElementById('ms-gst').value) || 0,
            phoneEx: parseFloat(document.getElementById('ms-phone-ex').value) || 0,
            loadingMachine: document.getElementById('ms-loading').value,
            loadingCharge: parseFloat(document.getElementById('ms-load').value) || 0,
            netAmount: parseFloat(document.getElementById('ms-net-amount').value) || 0,
            ghat: currentGhat,
            rateAtTimeOfEntry: parseFloat(document.getElementById('ms-sand-rate').value) || 0, 
            royaltyAtTimeOfEntry: currentRoyFactor
        };

        App.db.mining_sheet_db.push(rowData);
        document.getElementById('ms-truck').value = "";
        document.getElementById('ms-phone-pay').value = "0";
        document.getElementById('ms-phone-ex').value = "0";
        
        App.saveToLocalStorage();
        this.autoFillRates(); 
        this.renderTable();
        alert("Entry Saved Successfully!");
    },

    parseBulk: function() {
        const trucksText = document.getElementById('ms-bulk-trucks').value.trim();
        const wheelsText = document.getElementById('ms-bulk-wheels').value.trim();
        const cftText = document.getElementById('ms-bulk-cft').value.trim();

        if(!trucksText) return alert("Please paste the Trucks list column!");

        const trucksArr = trucksText.split('\n').map(t => t.trim().toUpperCase()).filter(t => t !== "");
        const wheelsArr = wheelsText.split('\n').map(w => w.trim()).filter(w => w !== "");
        const cftArr = cftText.split('\n').map(c => c.trim()).filter(c => c !== "");

        const currentGhat = document.getElementById('global-ghat-selector').value || "Naricha Sand Mine";
        const entryDate = document.getElementById('ms-date').value;
        let successCount = 0;

        let ghatRates = App.db.ghats_rate_master[currentGhat] || App.db.ghats_rate_master["Naricha Sand Mine"];

        trucksArr.forEach((truckNo, index) => {
            let wheel = wheelsArr[index] || "16"; 
            let cft = parseFloat(cftArr[index]) || 750; 
            if(!["6", "10", "12", "16"].includes(wheel)) wheel = "16";

            let masterRates = ghatRates[wheel] || ghatRates["16"];
            let royFactor = masterRates.royaltyPerCft || 25;
            
            let rtAmt = Math.round(cft * royFactor);
            let gstAmt = Math.round(rtAmt * 0.05);
            let netAmt = masterRates.sandRate - rtAmt - gstAmt - masterRates.load;

            const bulkRow = {
                id: Date.now() + Math.random() + index, 
                date: entryDate, 
                truckNo: truckNo,
                wheel: wheel,
                sandRate: masterRates.sandRate, 
                phonePay: 0, 
                bankAccount: "CASH", 
                cft: cft,
                rtAmount: rtAmt, 
                gstAmount: gstAmt,
                phoneEx: 0,
                loadingMachine: masterRates.loading, 
                loadingCharge: masterRates.load, 
                netAmount: netAmt, 
                ghat: currentGhat,
                rateAtTimeOfEntry: masterRates.sandRate, 
                royaltyAtTimeOfEntry: royFactor
            };
            
            App.db.mining_sheet_db.push(bulkRow);
            successCount++;
        });

        document.getElementById('ms-bulk-trucks').value = "";
        document.getElementById('ms-bulk-wheels').value = "";
        document.getElementById('ms-bulk-cft').value = "";
        
        App.saveToLocalStorage();
        this.renderTable();
        alert(`Successfully Processed ${successCount} entries!`);
    },

    updateInlineMachine: function(id, newMachine) {
        App.db.mining_sheet_db = App.db.mining_sheet_db.map(row => {
            if(row.id == id) row.loadingMachine = newMachine;
            return row;
        });
        App.saveToLocalStorage();
        this.renderTable();
    },

    renderTable: function() {
        const body = document.getElementById('mining-sheet-table-body');
        if(!body) return;
        
        const currentGhat = document.getElementById('global-ghat-selector')?.value || "Naricha Sand Mine";
        const filterDate = document.getElementById('ms-date')?.value;

        const ghatTitleEl = document.getElementById('ms-dynamic-ghat-name');
        if(ghatTitleEl) ghatTitleEl.innerText = `${currentGhat.toUpperCase()} MINING SHEET`;

        if(document.getElementById('sheet-date-display') && filterDate) {
            document.getElementById('sheet-date-display').innerText = "DATE - " + filterDate.split('-').reverse().join('/');
        }

        let filtered = App.db.mining_sheet_db.filter(i => i.ghat === currentGhat && (filterDate ? i.date === filterDate : true));
        
        let totalSandRate = 0, totalPhonePay = 0, totalCft = 0, totalRtAmount = 0, totalGst = 0, totalPhoneEx = 0, totalLoad = 0, totalNetAmount = 0;
        let rowsHtml = "";
        let onlineCollectionRowsHtml = ""; 
        let totalOnlinePaySum = 0;
        let totalOnlineExSum = 0;
        let onlineSl = 1;
        let machineSummaryData = {};

        filtered.forEach((row, index) => {
            let finalRowSandRate = row.rateAtTimeOfEntry || row.sandRate;
            let currentRt = row.rtAmount || 0;
            let currentGst = row.gstAmount || 0;
            let currentLoad = row.loadingCharge || 0;
            let correctedNet = finalRowSandRate - currentRt - currentGst - currentLoad;

            totalSandRate += finalRowSandRate; 
            totalPhonePay += (row.phonePay || 0); 
            totalCft += (row.cft || 0);
            totalRtAmount += currentRt; 
            totalGst += currentGst; 
            totalPhoneEx += (row.phoneEx || 0);
            totalLoad += currentLoad; 
            totalNetAmount += correctedNet;

            if (row.phonePay > 0) {
                totalOnlinePaySum += row.phonePay;
                totalOnlineExSum += (row.phoneEx || 0);
                
                onlineCollectionRowsHtml += `
                    <tr>
                        <td style="border:1px solid #333; padding:4px; text-align:center; font-size:11px;">${onlineSl++}</td>
                        <td style="border:1px solid #333; padding:4px; text-align:center; font-weight:bold; font-size:11px;">${row.truckNo || '-'}</td>
                        <td style="border:1px solid #333; padding:4px; text-align:center; font-weight:bold; color:#1e3a5f; font-size:11px;">${row.bankAccount || 'PhonePay'}</td>
                        <td style="border:1px solid #333; padding:4px; text-align:right; padding-right:10px; font-weight:bold; color:#27ae60; font-size:11px;">₹${row.phonePay.toFixed(2)}</td>
                        <td style="border:1px solid #333; padding:4px; text-align:center; font-weight:bold; color:#e67e22; font-size:11px;">₹${(row.phoneEx || 0).toFixed(2)}</td>
                    </tr>`;
            }

            let mName = (row.loadingMachine || "NA").toUpperCase().trim();
            if(mName !== "NA") {
                if(!machineSummaryData[mName]) {
                    machineSummaryData[mName] = { totalTrucks: 0, totalLoadCash: 0, wheelBreakdown: {} };
                }
                machineSummaryData[mName].totalTrucks += 1;
                machineSummaryData[mName].totalLoadCash += currentLoad;
                
                let wType = (row.wheel || "16") + " Wheels";
                if(!machineSummaryData[mName].wheelBreakdown[wType]) {
                    machineSummaryData[mName].wheelBreakdown[wType] = 0;
                }
                machineSummaryData[mName].wheelBreakdown[wType] += 1;
            }

            rowsHtml += `
                <tr style="font-size:12px;">
                    <td style="padding:4px;">${index + 1}</td>
                    <td style="padding:4px; font-weight:bold;">${row.truckNo || '-'}</td>
                    <td style="padding:4px;">${row.wheel} W</td>
                    <td style="padding:4px;">${finalRowSandRate > 0 ? finalRowSandRate.toFixed(2) : '-'}</td>
                    <td class="hl-blue" style="padding:4px;">₹${row.phonePay > 0 ? row.phonePay.toFixed(2) : '0.00'}</td>
                    <td style="padding:4px;">${row.cft > 0 ? row.cft : '-'}</td>
                    <td style="padding:4px;">₹${row.rtAmount > 0 ? row.rtAmount.toFixed(2) : '-'}</td>
                    <td style="color: #475569; padding:4px;">₹${row.gstAmount > 0 ? row.gstAmount.toFixed(2) : '-'}</td>
                    <td style="color: #e67e22; padding:4px;">₹${row.phoneEx > 0 ? row.phoneEx.toFixed(2) : '0.00'}</td>
                    <td>
                        <div class="no-print">
                            <select class="table-select" onchange="MiningModule.updateInlineMachine(${row.id}, this.value)" style="padding:2px; font-size:11px;">
                                <option value="VOLVO" ${row.loadingMachine === 'VOLVO' ? 'selected' : ''}>VOLVO</option>
                                <option value="TATA" ${row.loadingMachine === 'TATA' ? 'selected' : ''}>TATA</option>
                                <option value="JCB" ${row.loadingMachine === 'JCB' ? 'selected' : ''}>JCB</option>
                                <option value="NA" ${row.loadingMachine === 'NA' ? 'selected' : ''}>NA</option>
                            </select>
                        </div>
                        <span class="print-only" style="display:none;">${row.loadingMachine || 'NA'}</span>
                    </td>
                    <td style="font-weight:bold; color:#000; padding:4px;">₹${currentLoad > 0 ? currentLoad.toFixed(2) : '0.00'}</td>
                    <td class="hl-green" style="padding:4px; font-weight:bold;">₹${correctedNet.toFixed(2)}</td>
                    <td class="no-print" style="padding:4px;">
                        <button onclick="MiningModule.deleteRow(${row.id})" style="color:var(--red); background:none; border:none; cursor:pointer; font-weight:bold;">Del</button>
                    </td>
                </tr>`;
        });

        body.innerHTML = filtered.length > 0 ? (rowsHtml + `
            <tr class="total-row" style="background:#e2e8f0 !important; font-weight:900; font-size:12px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                <td colspan="3" style="padding:5px;">TOTAL</td>
                <td style="padding:5px;">₹${totalSandRate.toFixed(2)}</td>
                <td style="color:#2980b9 !important; padding:5px;">₹${totalPhonePay.toFixed(2)}</td>
                <td style="padding:5px;">${totalCft}</td>
                <td style="padding:5px;">₹${totalRtAmount.toFixed(2)}</td>
                <td style="padding:5px;">₹${totalGst.toFixed(2)}</td>
                <td style="color:#e67e22 !important; padding:5px;">₹${totalPhoneEx.toFixed(2)}</td>
                <td style="padding:5px;">-</td>
                <td style="padding:5px;">₹${totalLoad.toFixed(2)}</td>
                <td style="background:#27ae60 !important; color:white !important; font-weight:900; padding:5px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">₹${totalNetAmount.toFixed(2)}</td>
                <td class="no-print" style="padding:5px;"></td>
            </tr>`) : `<tr><td colspan="12" style="padding:20px; color:#7f8c8d; text-align:center;">No Entries Found For This Date.</td></tr>`;

        App.currentGlobalJomaSum = totalNetAmount;
        App.currentGlobalRtSum = totalRtAmount;
        App.currentGlobalGstSum = totalGst;

        let printExpenseSection = document.getElementById('print-only-expense-wrap');
        if(printExpenseSection) {
            const expenses = App.db.mining_expenses_db || [];
            const manualAdjustments = App.db.manual_adjustments_db || [];

            let dayExpenses = expenses.filter(i => i.ghat === currentGhat && i.date === filterDate);
            let dayManuals = manualAdjustments.filter(i => i.ghat === currentGhat && i.date === filterDate);

            // 🔹 ১. ফিল্ড এক্সপেন্স ডাইনামিক রেন্ডারিং
            let expRowsHtml = ""; let totalExpSum = 0;
            let expenseTableHTML = "";
            if (dayExpenses.length > 0) {
                dayExpenses.forEach((row, i) => {
                    totalExpSum += parseFloat(row.amount || 0);
                    expRowsHtml += `
                        <tr>
                            <td style="border:1px solid #000; padding:4px; text-align:center; font-size:11px;">${i+1}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; font-size:12px;">${row.purpose || row.desc || 'Expense'}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:right; padding-right:15px; font-weight:bold; width:150px; color:#000; font-size:11px;">₹${parseFloat(row.amount||0).toFixed(2)}</td>
                        </tr>`;
                });
                
                expenseTableHTML = `
                    <div style="width: 100%; margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
                            <thead>
                                <tr style="background: #f2f2f2 !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <th style="width:50px; border:1px solid #000; padding:8px; font-size:12px; text-align:center;">SL</th>
                                    <th style="border:1px solid #000; padding:8px; font-size:14px; text-align:center; font-weight:900;">খরচ</th>
                                    <th style="width:150px; border:1px solid #000; padding:8px; font-size:12px; text-align:right; padding-right:15px;">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${expRowsHtml}
                                <tr style="font-weight: bold; background: #f2f2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <td colspan="2" style="text-align: right; padding-right: 15px; border: 1px solid #000; font-size:11px; padding:5px;">TOTAL FIELD EXPENSE:</td>
                                    <td style="border:1px solid #000; font-size:11px; padding:5px; text-align:right; padding-right:15px; font-weight:900;">₹${totalExpSum.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            }

            // 🔹 ২. অনলাইন পেমেন্ট ডাইনামিক রেন্ডারিং
            let onlineTableHTML = "";
            if (totalOnlinePaySum > 0) {
                onlineTableHTML = `
                    <div style="width: 100%; margin-bottom: 20px;">
                        <h4 style="background:#1e3a5f !important; color:white !important; padding:6px; margin:0; border:2px solid #000; border-bottom:none; font-size:11px; text-transform:uppercase; text-align:center; -webkit-print-color-adjust: exact; print-color-adjust: exact;">💰 ONLINE TRANSACTIONS</h4>
                        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
                            <thead>
                                <tr style="background: #e2e8f0 !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <th style="width:50px; border:1px solid #333; padding:8px; font-size:11px; text-align:center;">SL</th>
                                    <th style="width:180px; border:1px solid #333; padding:8px; font-size:11px; text-align:center;">TRUCK NO</th>
                                    <th style="width:200px; border:1px solid #333; padding:8px; font-size:11px; text-align:center;">BANK / UPI ACCOUNT</th>
                                    <th style="border:1px solid #333; padding:8px; font-size:11px; text-align:right; padding-right:15px;">ONLINE RECEIVED</th>
                                    <th style="width:150px; border:1px solid #333; padding:6px; font-size:11px; text-align:center;">PHONE EX (1%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${onlineCollectionRowsHtml}
                                <tr style="font-weight: bold; background: #cbd5e1 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                    <td colspan="3" style="text-align: right; padding-right: 15px; border: 1px solid #333; font-size:11px; padding:5px;">TOTAL ONLINE COLLECTION:</td>
                                    <td style="border: 1px solid #333; font-size:11px; padding:5px; text-align:right; padding-right:15px; font-weight:900; color:#27ae60;">₹${totalOnlinePaySum.toFixed(2)}</td>
                                    <td style="border: 1px solid #333; font-size:11px; padding:5px; text-align:center; font-weight:900; color:#e67e22;">₹${totalOnlineExSum.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            }

            // 🔹 ৩. মেশিন ব্রেকডাউন ডাইনামিক রেন্ডারিং (সেন্টার এবং ব্লু হেডার)
            let dynamicMachineTablesHtml = "";
            for (let mac in machineSummaryData) {
                let macData = machineSummaryData[mac];
                let breakdownString = [];
                for (let wh in macData.wheelBreakdown) {
                    breakdownString.push(`${macData.wheelBreakdown[wh]} ${wh}`);
                }

                dynamicMachineTablesHtml += `
                    <div style="width: 100%; margin-bottom: 15px; display: block; page-break-inside: avoid;">
                        <table style="width: 100%; border-collapse: collapse; border: 2px solid #1e3a5f;">
                            <thead>
                                <tr>
                                    <th colspan="3" style="background: #1e3a5f !important; color: white !important; border: 1px solid #1e3a5f; padding: 10px; font-size: 13px; text-align: center; font-weight: 800; letter-spacing: 1px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                        ⚙️ MACHINE LOADING BREAKDOWN: <span style="color:#f39c12 !important;">${mac}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border: 1px solid #1e3a5f; padding: 6px; font-weight: bold; font-size:11px; width:33%; text-align: center;">Total Trucks: ${macData.totalTrucks}</td>
                                    <td style="border: 1px solid #1e3a5f; padding: 6px; font-weight: bold; color: #333; font-size:11px; text-align: center; width:33%;">[ ${breakdownString.join(' | ')} ]</td>
                                    <td style="border: 1px solid #1e3a5f; padding: 6px; font-weight: 900; text-align: center; font-size:12px; color: #16a085; width:33%;">EARNED: ₹${macData.totalLoadCash.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>`;
            }

            // ম্যানুয়াল এডজাস্টমেন্ট
            let manualRowsHtml = ""; let totalManualSum = 0;
            dayManuals.forEach((row, i) => {
                totalManualSum += parseFloat(row.amount || 0);
                manualRowsHtml += `
                    <tr>
                        <td style="border:1px solid #000; padding:4px; text-align:center; font-size:11px;">${i+1}</td>
                        <td style="border:1px solid #000; padding:4px; text-align:left; padding-left:15px; font-weight:bold; font-size:11px;">${row.desc || 'Manual Entry'}</td>
                        <td style="border:1px solid #000; padding:4px; text-align:right; padding-right:15px; font-weight:bold; width:150px; color:#000; font-size:11px;">₹${parseFloat(row.amount||0).toFixed(2)}</td>
                    </tr>`;
            });

            let cashInHand = (totalNetAmount - totalOnlinePaySum) - totalExpSum + totalManualSum;

            printExpenseSection.innerHTML = `
                <div style="margin-top: 30px; width: 100%; box-sizing: border-box; font-family: sans-serif; display: block; clear: both;">
                    
                    <h3 style="text-align: center; margin-bottom: 15px; color: #000; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; border-bottom: 2px dashed #000; padding-bottom: 5px;">DAILY EXPENSES & CASH SUMMARY</h3>
                    
                    ${dynamicMachineTablesHtml}
                    ${onlineTableHTML}
                    ${expenseTableHTML}

                    <div style="display: flex; gap: 15px; width: 100%; box-sizing: border-box; clear: both;">
                        <div style="flex: 1; background: white; border: 1px solid #000; padding: 10px;">
                            <h4 style="margin:0 0 10px 0; color:#000; font-size:11px; text-transform:uppercase; font-weight:800; text-align:center;">ROYALTY & TAX SUMMARY</h4>
                            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
                                <thead>
                                    <tr style="background:#f2f2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;"><th style="border: 1px solid #000; padding:4px; font-size:10px;">HEAD</th><th style="border: 1px solid #000; padding:4px; font-size:10px;">AMOUNT</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td style="text-align:left; padding:5px; font-size:10px; border: 1px solid #000;">Total Royalty (on ${totalCft} CFT)</td><td style="text-align:right; font-weight:bold; padding-right:8px; font-size:10px; border: 1px solid #000;">₹${totalRtAmount.toFixed(2)}</td></tr>
                                    <tr><td style="text-align:left; padding:5px; font-size:10px; border: 1px solid #000;">Total GST (5%)</td><td style="text-align:right; font-weight:bold; padding-right:8px; font-size:10px; border: 1px solid #000;">₹${totalGst.toFixed(2)}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="flex: 1; background: white; border: 1px solid #000; padding: 10px;">
                            <h4 style="margin:0 0 10px 0; color:#000; font-size:11px; text-transform:uppercase; font-weight:800; text-align:center;">MANUAL ADJUSTMENTS / EXTRA INFLOW</h4>
                            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
                                <thead>
                                    <tr style="background:#f2f2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;"><th style="border: 1px solid #000; padding:4px; font-size:10px;">DETAILS</th><th style="border: 1px solid #000; padding:4px; font-size:10px;">AMOUNT</th></tr>
                                </thead>
                                <tbody>
                                    ${manualRowsHtml || '<tr><td colspan="2" style="color:#000; font-size:10px; padding:6px; border: 1px solid #000; text-align:center;">কোনো ম্যানুয়াল এন্ট্রি নেই।</td></tr>'}
                                    <tr style="font-weight:bold; background:#f2f2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                        <td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">TOTAL EXTRA:</td>
                                        <td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000;">₹${totalManualSum.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="flex: 1; background: white; border: 1px solid #000; padding: 10px;">
                            <h4 style="margin:0 0 10px 0; color:#000; font-size:11px; text-transform:uppercase; font-weight:800; text-align:center;">CASH IN HAND (অবশিষ্ট নিট ক্যাশ)</h4>
                            <table style="border-collapse: collapse; border: 2px solid #000; background: #ffffff; width:100%;">
                                <tbody>
                                    <tr><td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">Total Profit Joma</td><td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000; font-weight:bold;">₹${totalNetAmount.toFixed(2)}</td></tr>
                                    <tr><td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">Online Payments (-)</td><td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000; font-weight:bold; color:#e74c3c;">₹${totalOnlinePaySum.toFixed(2)}</td></tr>
                                    <tr><td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">Total Field Khoroch (-)</td><td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000; font-weight:bold; color:#e74c3c;">₹${totalExpSum.toFixed(2)}</td></tr>
                                    <tr><td style="text-align:left; padding:4px; font-size:10px; border: 1px solid #000;">Manual Adjust Total (+)</td><td style="text-align:right; padding-right:8px; font-size:10px; border: 1px solid #000; font-weight:bold; color:#27ae60;">₹${totalManualSum.toFixed(2)}</td></tr>
                                    <tr style="font-weight:900; background:#d4efdf !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                        <td style="text-align:left; padding:6px; font-size:11px; font-weight:900; border: 1px solid #000;">CASH IN HAND</td>
                                        <td style="font-size:12px; text-align:right; padding-right:8px; font-weight:900; border: 1px solid #000; color: #1e8449;">₹${cashInHand.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
        }
    },

    deleteRow: function(id) {
        if(confirm("Are you sure you want to delete this record?")) {
            App.db.mining_sheet_db = App.db.mining_sheet_db.filter(item => item.id !== id);
            App.saveToLocalStorage();
            this.renderTable();
        }
    }
};