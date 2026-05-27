const GhatModule = {
    getHTML: function() {
        return `
            <div class="card">
                <h3>Ghat / Site Configuration & Dynamic Rate Master</h3>
                <div style="background:#f8f9fa; padding:15px; border-radius:8px; border:1px solid #ddd; margin-bottom:20px;">
                    <h4 style="margin-top:0; color:var(--p-color);">1. Add or Update Ghat Details</h4>
                    <p style="font-size:11px; color:#27ae60; margin:0 0 10px 0; font-weight:bold;">* টিপস: আগে থেকে থাকা কোনো ঘাটের রেট বদলাতে চাইলে, সেই একই নাম লিখে নিচে নতুন রেট টাইপ করে 'Save' বাটনে চাপুন।</p>
                    <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:12px; align-items:end; margin-bottom:15px;">
                        <div><label>Ghat Name</label><input type="text" id="new-ghat-name" placeholder="যেমন: Naricha Sand Mine"></div>
                        <div><label>Secure PIN (4 Digit)</label><input type="password" id="new-ghat-pin" placeholder="যেমন: 1111" maxlength="4"></div>
                        <button onclick="GhatModule.addNewGhat()" style="background:var(--blue); color:white; padding:10px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Save / Update Ghat</button>
                    </div>
                    
                    <h4 style="color:var(--p-color); margin-bottom:5px;">2. Set Rates for Wheels (এই ঘাটের চাকা ভিত্তিক সুনির্দিষ্ট রেট চার্ট)</h4>
                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; background:#fff; padding:10px; border:1px solid #ccc; border-radius:6px;">
                        <div><b>16 Wheels:</b><br>
                            <label>Rate</label><input type="number" id="r16-rate" value="33000"><label>CFT</label><input type="number" id="r16-cft" value="750"><label>Royalty/CFT</label><input type="number" id="r16-roy" value="25">
                        </div>
                        <div><b>12 Wheels:</b><br>
                            <label>Rate</label><input type="number" id="r12-rate" value="28000"><label>CFT</label><input type="number" id="r12-cft" value="650"><label>Royalty/CFT</label><input type="number" id="r12-roy" value="25">
                        </div>
                        <div><b>10 Wheels:</b><br>
                            <label>Rate</label><input type="number" id="r10-rate" value="22000"><label>CFT</label><input type="number" id="r10-cft" value="500"><label>Royalty/CFT</label><input type="number" id="r10-roy" value="25">
                        </div>
                        <div><b>6 Wheels:</b><br>
                            <label>Rate</label><input type="number" id="r6-rate" value="15000"><label>CFT</label><input type="number" id="r6-cft" value="300"><label>Royalty/CFT</label><input type="number" id="r6-roy" value="25">
                        </div>
                    </div>
                </div>
                
                <h4 style="margin-top:20px; color:var(--p-color); font-weight:bold;">Registered Ghats Lock & Custom Royalty Directory</h4>
                <div class="table-responsive">
                    <table id="ghat-directory-table">
                        <thead>
                            <tr style="background:#1e3a5f; color:white;">
                                <th style="color:white; padding:10px;">Ghat Name</th>
                                <th style="color:white; padding:10px;">Secure Pin</th>
                                <th style="color:white; padding:10px;">16W Chart</th>
                                <th style="color:white; padding:10px;">12W Chart</th>
                                <th style="color:white; padding:10px;">10W Chart</th>
                                <th style="color:white; padding:10px;">6W Chart</th>
                                <th style="color:#ffca28; padding:10px; width:80px;">ACTION</th>
                            </tr>
                        </thead>
                        <tbody id="ghat-directory-tbody"></tbody>
                    </table>
                </div>
            </div>
        `;
    },

    init: function() {
        this.renderTable();
    },

    addNewGhat: function() {
        const nameInput = document.getElementById('new-ghat-name');
        const pinInput = document.getElementById('new-ghat-pin');
        const name = nameInput.value.trim();
        const pin = pinInput.value.trim();
        if(!name || pin.length < 4) return alert("ঘাট নাম এবং ৪ অক্ষরের পিন কোড দিন!");
        
        if(!App.db.ghats.includes(name)) App.db.ghats.push(name);
        App.db.ghats_security_directory[name] = pin;

        App.db.ghats_rate_master[name] = {
            "16": { sandRate: parseFloat(document.getElementById('r16-rate').value)||33000, cft: parseFloat(document.getElementById('r16-cft').value)||750, royaltyPerCft: parseFloat(document.getElementById('r16-roy').value)||25, loading: "VOLVO", load: 1300, boat: "NA" },
            "12": { sandRate: parseFloat(document.getElementById('r12-rate').value)||28000, cft: parseFloat(document.getElementById('r12-cft').value)||650, royaltyPerCft: parseFloat(document.getElementById('r12-roy').value)||25, loading: "VOLVO", load: 1100, boat: "NA" },
            "10": { sandRate: parseFloat(document.getElementById('r10-rate').value)||22000, cft: parseFloat(document.getElementById('r10-cft').value)||500, royaltyPerCft: parseFloat(document.getElementById('r10-roy').value)||25, loading: "TATA",  load: 900,  boat: "NA" },
            "6":  { sandRate: parseFloat(document.getElementById('r6-rate').value)||15000,  cft: parseFloat(document.getElementById('r6-cft').value)||300,  royaltyPerCft: parseFloat(document.getElementById('r6-roy').value)||25,  loading: "JCB",   load: 600,  boat: "NA" }
        };

        nameInput.value = ""; pinInput.value = "";
        App.saveToLocalStorage();
        App.updateGhatDropdown();
        this.renderTable();
        alert("Ghat Saved Successfully!");
    },

    renderTable: function() {
        const body = document.getElementById('ghat-directory-tbody');
        if(!body) return;
        let html = "";
        
        App.db.ghats.forEach(gName => {
            let pin = App.db.ghats_security_directory[gName] || "N/A";
            let rates = App.db.ghats_rate_master[gName] || {
                "16": {sandRate:0, cft:0, royaltyPerCft:0},
                "12": {sandRate:0, cft:0, royaltyPerCft:0},
                "10": {sandRate:0, cft:0, royaltyPerCft:0},
                "6":  {sandRate:0, cft:0, royaltyPerCft:0}
            };
            
            html += `
                <tr>
                    <td style="padding:10px; text-align:left;"><b>${gName}</b></td>
                    <td style="padding:10px;"><span style="color:var(--blue); font-weight:bold;">${pin}</span></td>
                    <td style="padding:10px; font-size:11px;">₹${rates["16"].sandRate}/${rates["16"].cft}cft/<b style="color:var(--red);">₹${rates["16"].royaltyPerCft}</b></td>
                    <td style="padding:10px; font-size:11px;">₹${rates["12"].sandRate}/${rates["12"].cft}cft/<b style="color:var(--red);">₹${rates["12"].royaltyPerCft}</b></td>
                    <td style="padding:10px; font-size:11px;">₹${rates["10"].sandRate}/${rates["10"].cft}cft/<b style="color:var(--red);">₹${rates["10"].royaltyPerCft}</b></td>
                    <td style="padding:10px; font-size:11px;">₹${rates["6"].sandRate}/${rates["6"].cft}cft/<b style="color:var(--red);">₹${rates["6"].royaltyPerCft}</b></td>
                    <td style="padding:10px;">
                        <button onclick="GhatModule.deleteGhat('${gName}')" style="background:var(--red); color:white; border:none; padding:4px 8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:11px;">ডিলিট</button>
                    </td>
                </tr>`;
        });
        body.innerHTML = html;
    },

    deleteGhat: function(ghatName) {
        if(ghatName === "Naricha Sand Mine") return alert("মেইন ডিফল্ট ঘাট (Naricha Sand Mine) ডিলিট করা যাবে না!");
        if(confirm(`আপনি কি নিশ্চিত যে "${ghatName}" ঘাটটি ডিলিট করতে চান?`)) {
            App.db.ghats = App.db.ghats.filter(g => g !== ghatName);
            delete App.db.ghats_security_directory[ghatName];
            delete App.db.ghats_rate_master[ghatName];
            App.saveToLocalStorage();
            App.updateGhatDropdown();
            this.renderTable();
        }
    }
};