// ==========================================
// MODULE: MASTER SETTINGS (DYNAMIC CONTROL)
// ==========================================
const MasterSettingsModule = {
    init: function() {
        // 🔹 সিকিউরিটি চেক: ম্যানেজার জোর করে ইউআরএল বা পেজ আইডি দিয়ে ঢোকার চেষ্টা করলে আটকে দেবে
        if (!App.isAdmin) {
            const content = document.getElementById('page-content');
            if (content) {
                content.innerHTML = `
                    <div class="card" style="text-align:center; padding:40px; border-top: 4px solid var(--red);">
                        <h3 style="color:var(--red);">❌ Access Denied!</h3>
                        <p>ম্যানেজারদের জন্য এই পেজটি দেখা নিষেধ। শুধুমাত্র মূল মালিক (Admin) এখানে প্রবেশ করতে পারবেন।</p>
                    </div>`;
            }
            return;
        }

        if (!App.db.master_settings) {
            App.db.master_settings = {
                wheels: ["6", "10", "12", "14", "16", "18"],
                machines: ["VOLVO", "TATA", "JCB", "KOBELCO", "HYUNDAI", "KOMATSU", "NA"]
            };
        }
        if (!App.db.ghats_rate_master) {
            App.db.ghats_rate_master = { "Naricha Sand Mine": {} };
        }
        this.switchInternalTab('lists');
    },

    getHTML: function() {
        return `
            <style>
                .set-nav { display:flex; gap:10px; margin-bottom:20px; border-bottom: 2px solid #ddd; padding-bottom:10px; overflow-x: auto; }
                .set-tab-btn { background:#ecf0f1; border:none; padding:10px 20px; font-weight:bold; cursor:pointer; border-radius:6px; color:#2c3e50; white-space: nowrap; }
                .set-tab-btn.active { background:var(--p-color); color:white; }
                .set-page { display:none; }
                .list-card { background: #f8f9fa; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
                .list-item { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee; }
            </style>

            <div class="card no-print" style="padding-bottom:10px; margin-bottom:15px; border-top-color:#8e44ad;">
                <h3 style="color:#8e44ad; margin:0; margin-bottom:15px;">⚙️ System Master Settings</h3>
                <div class="set-nav">
                    <button class="set-tab-btn active" id="btn-set-lists" onclick="MasterSettingsModule.switchInternalTab('lists')">🚜 Wheels & Machines</button>
                    <button class="set-tab-btn" id="btn-set-rates" onclick="MasterSettingsModule.switchInternalTab('rates')">💰 Ghat Rates</button>
                    <button class="set-tab-btn" id="btn-set-ghats" onclick="MasterSettingsModule.switchInternalTab('ghats')">📍 Manage Ghats</button>
                </div>
            </div>

            <div id="set-lists-page" class="set-page">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div class="card" style="flex: 1; min-width: 300px;">
                        <h4 style="color:var(--p-color); margin-top:0;">Truck Wheel Types</h4>
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <input type="text" id="set_new_wheel" placeholder="e.g. 22" style="flex:1;">
                            <button class="btn-action" onclick="MasterSettingsModule.addWheel()" style="width:auto;">Add</button>
                        </div>
                        <div class="list-card" id="set_wheel_list"></div>
                    </div>
                    <div class="card" style="flex: 1; min-width: 300px;">
                        <h4 style="color:var(--p-color); margin-top:0;">Loading Machines</h4>
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <input type="text" id="set_new_machine" placeholder="e.g. CAT" style="flex:1; text-transform:uppercase;">
                            <button class="btn-action" onclick="MasterSettingsModule.addMachine()" style="width:auto;">Add</button>
                        </div>
                        <div class="list-card" id="set_machine_list"></div>
                    </div>
                </div>
            </div>

            <div id="set-rates-page" class="set-page card">
                <h4 style="color:var(--p-color); margin-top:0;">Configure Rates by Ghat</h4>
                <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; align-items: end; background:#f8f9fa; padding:15px; border-radius:8px; border:1px solid #ddd;">
                    <div><label>Select Ghat</label><select id="set_r_ghat" onchange="MasterSettingsModule.loadRateForm()"></select></div>
                    <div><label>Select Wheel</label><select id="set_r_wheel" onchange="MasterSettingsModule.loadRateForm()"></select></div>
                    <div><label>Sand Rate</label><input type="number" id="set_r_sand"></div>
                    <div><label>CFT</label><input type="number" id="set_r_cft"></div>
                    <div><label>Royalty/CFT</label><input type="number" id="set_r_royalty"></div>
                    <div><label>Machine</label><select id="set_r_machine"></select></div>
                    <div><label>Load Charge</label><input type="number" id="set_r_load"></div>
                    <button class="btn-action" onclick="MasterSettingsModule.saveGhatRate()" style="background:#27ae60;">SAVE RATE</button>
                </div>
                <div class="table-responsive" id="set_rate_table_container" style="margin-top:20px;"></div>
            </div>

            <div id="set-ghats-page" class="set-page card">
                <h4 style="color:var(--p-color);">Add New Ghat (Admin Only)</h4>
                <div class="form-grid" style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
                    <input type="text" id="set_new_ghat_name" placeholder="New Ghat Name">
                    <input type="password" id="set_new_ghat_pin" placeholder="Ghat Login PIN">
                    <input type="password" id="set_admin_master_pin" placeholder="Master Admin PIN">
                    <button class="btn-action" onclick="MasterSettingsModule.addNewGhat()" style="background:#8e44ad;">ADD GHAT</button>
                </div>
                <div id="set_ghat_list" class="list-card"></div>
            </div>
        `;
    },

    switchInternalTab: function(tab) {
        document.querySelectorAll('.set-page').forEach(div => div.style.display = 'none');
        document.getElementById('set-' + tab + '-page').style.display = 'block';
        document.querySelectorAll('.set-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-set-' + tab).classList.add('active');

        if(tab === 'lists') this.renderLists();
        else if(tab === 'rates') { this.populateDropdowns(); this.loadRateForm(); this.renderRateTable(); }
        else if(tab === 'ghats') { this.renderGhats(); }
    },

    addNewGhat: function() {
        const name = document.getElementById('set_new_ghat_name').value.trim();
        const pin = document.getElementById('set_new_ghat_pin').value.trim();
        const masterPin = document.getElementById('set_admin_master_pin').value.trim();
        
        if(masterPin !== ADMIN_MASTER_PIN) return alert("❌ Access Denied! Wrong Admin PIN.");
        if(!name || !pin) return alert("Please fill Name and PIN!");
        if(App.db.ghats.includes(name)) return alert("Ghat already exists!");

        App.db.ghats.push(name);
        App.db.ghats_security_directory[name] = pin;
        App.db.ghats_rate_master[name] = { "16": { sandRate: 0, cft: 0, royaltyPerCft: 25, loading: "VOLVO", load: 0 } };

        App.saveToLocalStorage();
        alert("Success! New Ghat Added.");
        
        // ফর্ম ক্লিয়ার করা
        document.getElementById('set_new_ghat_name').value = '';
        document.getElementById('set_new_ghat_pin').value = '';
        document.getElementById('set_admin_master_pin').value = '';

        this.renderGhats();
        App.updateGhatDropdown(); // গ্লোবাল ড্রপডাউন আপডেট করা
    },

    deleteGhat: function(ghatName) {
        if (!App.isAdmin) {
            alert("শুধুমাত্র অ্যাডমিন ঘাট মুছে ফেলতে পারবেন!");
            return;
        }
    
        if (confirm(`আপনি কি নিশ্চিত যে "${ghatName}" ঘাটটি সম্পূর্ণ মুছে ফেলতে চান?\nএর সাথে সম্পর্কিত রেট এবং পিনও মুছে যাবে!`)) {
            
            const index = App.db.ghats.indexOf(ghatName);
            if (index > -1) {
                App.db.ghats.splice(index, 1);
            }
            
            if (App.db.ghats_security_directory && App.db.ghats_security_directory[ghatName]) {
                delete App.db.ghats_security_directory[ghatName];
            }
            
            if (App.db.ghats_rate_master && App.db.ghats_rate_master[ghatName]) {
                delete App.db.ghats_rate_master[ghatName];
            }
            
            App.saveToLocalStorage(); 
            this.renderGhats();
            App.updateGhatDropdown();
            
            alert(`✅ ${ghatName} ঘাটটি সফলভাবে ডিলিট করা হয়েছে!`);
            
            // যদি কারেন্ট সিলেক্টেড ঘাট ডিলিট হয়ে যায়, তবে প্রথম ঘাটে শিফট করা
            let currentGhat = document.getElementById('global-ghat-selector').value;
            if(currentGhat === ghatName && App.db.ghats.length > 0) {
                document.getElementById('global-ghat-selector').value = App.db.ghats[0];
                App.changeGhatFilter();
            }
        }
    },

    renderGhats: function() {
        document.getElementById('set_ghat_list').innerHTML = App.db.ghats.map(g => 
            `<div class="list-item">
                <div><b>${g}</b> <span style="color:#7f8c8d; font-size: 0.9em; margin-left: 10px;">(PIN: ${App.db.ghats_security_directory[g]})</span></div>
                <button onclick="MasterSettingsModule.deleteGhat('${g}')" style="background: var(--red); color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">🗑️ Delete</button>
            </div>`
        ).join('');
    },

    renderLists: function() {
        document.getElementById('set_wheel_list').innerHTML = App.db.master_settings.wheels.map(w => 
            `<div class="list-item"><b>${w} Wheels</b> <button onclick="MasterSettingsModule.deleteItem('wheels', '${w}')" style="color:red; background:none; border:none; cursor:pointer;">✖</button></div>`
        ).join('');
        document.getElementById('set_machine_list').innerHTML = App.db.master_settings.machines.map(m => 
            `<div class="list-item"><b>${m}</b> <button onclick="MasterSettingsModule.deleteItem('machines', '${m}')" style="color:red; background:none; border:none; cursor:pointer;">✖</button></div>`
        ).join('');
    },

    addWheel: function() {
        let val = document.getElementById('set_new_wheel').value.trim();
        if(val && !App.db.master_settings.wheels.includes(val)) { 
            App.db.master_settings.wheels.push(val); 
            App.db.master_settings.wheels.sort((a,b) => a-b); 
            App.saveToLocalStorage(); 
            this.renderLists(); 
        }
        document.getElementById('set_new_wheel').value = "";
    },

    addMachine: function() {
        let val = document.getElementById('set_new_machine').value.trim().toUpperCase();
        if(val && !App.db.master_settings.machines.includes(val)) { 
            App.db.master_settings.machines.push(val); 
            App.saveToLocalStorage(); 
            this.renderLists(); 
        }
        document.getElementById('set_new_machine').value = "";
    },

    deleteItem: function(type, val) {
        if(confirm(`Delete ${val}?`)) { 
            App.db.master_settings[type] = App.db.master_settings[type].filter(i => i !== val); 
            App.saveToLocalStorage(); 
            this.renderLists(); 
        }
    },

    populateDropdowns: function() {
        document.getElementById('set_r_ghat').innerHTML = App.db.ghats.map(g => `<option value="${g}">${g}</option>`).join('');
        document.getElementById('set_r_wheel').innerHTML = App.db.master_settings.wheels.map(w => `<option value="${w}">${w} Wheels</option>`).join('');
        document.getElementById('set_r_machine').innerHTML = App.db.master_settings.machines.map(m => `<option value="${m}">${m}</option>`).join('');
    },

    loadRateForm: function() {
        let ghat = document.getElementById('set_r_ghat').value;
        let wheel = document.getElementById('set_r_wheel').value;
        
        if(!App.db.ghats_rate_master[ghat]) App.db.ghats_rate_master[ghat] = {};
        let r = App.db.ghats_rate_master[ghat][wheel];
        
        document.getElementById('set_r_sand').value = r ? r.sandRate : "";
        document.getElementById('set_r_cft').value = r ? r.cft : "";
        document.getElementById('set_r_royalty').value = r ? r.royaltyPerCft : "25";
        document.getElementById('set_r_machine').value = r ? r.loading : "VOLVO";
        document.getElementById('set_r_load').value = r ? r.load : "";
    },

    saveGhatRate: function() {
        let ghat = document.getElementById('set_r_ghat').value;
        let wheel = document.getElementById('set_r_wheel').value;
        
        if(!App.db.ghats_rate_master[ghat]) App.db.ghats_rate_master[ghat] = {};
        
        App.db.ghats_rate_master[ghat][wheel] = { 
            sandRate: parseFloat(document.getElementById('set_r_sand').value)||0, 
            cft: parseFloat(document.getElementById('set_r_cft').value)||0, 
            royaltyPerCft: parseFloat(document.getElementById('set_r_royalty').value)||0, 
            loading: document.getElementById('set_r_machine').value, 
            load: parseFloat(document.getElementById('set_r_load').value)||0 
        };
        
        App.saveToLocalStorage(); 
        this.renderRateTable(); 
        alert("Rates Updated!");
    },

    renderRateTable: function() {
        let ghat = document.getElementById('set_r_ghat').value;
        let rates = App.db.ghats_rate_master[ghat] || {};
        
        let html = `
            <table style="width:100%; border:1px solid #ddd; text-align:center;">
                <thead style="background:#1e3a5f; color:white;">
                    <tr><th>Wheel</th><th>Sand Rate</th><th>CFT</th><th>Royalty</th><th>Machine</th><th>Load</th></tr>
                </thead>
                <tbody>`;
                
        App.db.master_settings.wheels.forEach(w => { 
            if(rates[w]) {
                html += `<tr><td>${w} W</td><td>${rates[w].sandRate}</td><td>${rates[w].cft}</td><td>${rates[w].royaltyPerCft}</td><td>${rates[w].loading}</td><td>${rates[w].load}</td></tr>`; 
            }
        });
        
        document.getElementById('set_rate_table_container').innerHTML = html + `</tbody></table>`;
    }
};