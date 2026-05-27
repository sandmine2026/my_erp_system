// ==========================================
// MAIN APP MODULE (app.js)
// ==========================================
const ADMIN_MASTER_PIN = "9999"; 

const App = {
    firebaseConfig: {
        apiKey: "AIzaSyBo8zsNOtuUgak04LfDnaQ7hZC-mwSCWBU",
        authDomain: "sandmine-5b3cf.firebaseapp.com",
        databaseURL: "https://sandmine-5b3cf-default-rtdb.firebaseio.com/",
        projectId: "sandmine-5b3cf",
        storageBucket: "sandmine-5b3cf.firebasestorage.app",
        messagingSenderId: "774315909250",
        appId: "1:774315909250:web:038ab01ec9ac86c554949b"
    },

    db: { 
        mining_sheet_db: [], 
        mining_expenses_db: [], 
        manual_adjustments_db: [],
        diesel_purchase: [],
        diesel_issue: [],
        diesel_payments: [],
        stock_ledger: [], 
        stock_expenses: [],
        stock_manual_adjustments: [], 
        stock_production: [], 
        stk_v_db: [],       
        stk_v_owners: {},   
        stk_m_machines: {}, 
        stk_m_entries: [],  
        stk_m_payments: [], 
        min_m_machines: {}, 
        min_m_entries: [],  
        min_m_payments: [], 
        
        // Production Databases
        prod_m_machines: {},
        prod_m_entries: [],
        prod_m_payments: [],
        prod_d_purchase: [],
        prod_d_issue: [],
        prod_d_payments: [],
        prod_expenses_db: [],
        prod_manual_adjustments_db: [],
        
        ghats: ["Naricha Sand Mine", "UBF BRICK FIELDS"],
        ghats_security_directory: { 
            "Naricha Sand Mine": "1111",
            "UBF BRICK FIELDS": "2222"
        },
        
        master_settings: {
            wheels: ["6", "10", "12", "14", "16", "18"],
            machines: ["VOLVO", "TATA", "JCB", "KOBELCO", "HYUNDAI", "KOMATSU", "NA"]
        },

        ghats_rate_master: {
            "Naricha Sand Mine": {
                "16": { sandRate: 33000, cft: 750, royaltyPerCft: 25, loading: "VOLVO", load: 1300, boat: "NA" },
                "12": { sandRate: 28000, cft: 650, royaltyPerCft: 25, loading: "VOLVO", load: 1100, boat: "NA" },
                "10": { sandRate: 22000, cft: 500, royaltyPerCft: 25, loading: "TATA",  load: 900,  boat: "NA" },
                "6":  { sandRate: 15000, cft: 300, royaltyPerCft: 25, loading: "JCB",   load: 600,  boat: "NA" }
            }
        }
    },
    
    currentPage: 'dashboard',
    isLoggedIn: false,
    isAdmin: false, 

    init: function() {
        const statusEl = document.getElementById('cloud-status');
        try {
            if (!firebase.apps.length) firebase.initializeApp(this.firebaseConfig);
            if(statusEl) statusEl.innerHTML = "⚡ SYNCING...";

            const dbRef = firebase.database().ref('naricha_mine_db');
            
            dbRef.on('value', (snapshot) => {
                const cloudData = snapshot.val();
                if (cloudData) {
                    this.db.mining_sheet_db = cloudData.mining_sheet_db || [];
                    this.db.mining_expenses_db = cloudData.mining_expenses_db || [];
                    this.db.manual_adjustments_db = cloudData.manual_adjustments_db || [];
                    this.db.diesel_purchase = cloudData.diesel_purchase || [];
                    this.db.diesel_issue = cloudData.diesel_issue || [];
                    this.db.diesel_payments = cloudData.diesel_payments || [];
                    this.db.stock_ledger = cloudData.stock_ledger || [];
                    this.db.stock_expenses = cloudData.stock_expenses || []; 
                    this.db.stock_manual_adjustments = cloudData.stock_manual_adjustments || [];
                    this.db.stock_production = cloudData.stock_production || []; 
                    this.db.stk_v_db = cloudData.stk_v_db || [];
                    this.db.stk_v_owners = cloudData.stk_v_owners || {};
                    this.db.stk_m_machines = cloudData.stk_m_machines || {}; 
                    this.db.stk_m_entries = cloudData.stk_m_entries || [];   
                    this.db.stk_m_payments = cloudData.stk_m_payments || []; 
                    this.db.min_m_machines = cloudData.min_m_machines || {};
                    this.db.min_m_entries = cloudData.min_m_entries || [];
                    this.db.min_m_payments = cloudData.min_m_payments || [];

                    this.db.prod_m_machines = cloudData.prod_m_machines || {};
                    this.db.prod_m_entries = cloudData.prod_m_entries || [];
                    this.db.prod_m_payments = cloudData.prod_m_payments || [];
                    this.db.prod_d_purchase = cloudData.prod_d_purchase || [];
                    this.db.prod_d_issue = cloudData.prod_d_issue || [];
                    this.db.prod_d_payments = cloudData.prod_d_payments || [];
                    this.db.prod_expenses_db = cloudData.prod_expenses_db || [];
                    this.db.prod_manual_adjustments_db = cloudData.prod_manual_adjustments_db || [];

                    this.db.ghats = cloudData.ghats || this.db.ghats;
                    this.db.ghats_security_directory = cloudData.ghats_security_directory || this.db.ghats_security_directory;
                    this.db.master_settings = cloudData.master_settings || this.db.master_settings;
                }
                this.updateGhatDropdown();
                
                if (localStorage.getItem('mine_erp_logged_in') === 'true') {
                    this.isLoggedIn = true;
                    this.isAdmin = localStorage.getItem('mine_erp_is_admin') === 'true'; 
                    document.getElementById('sidebar').style.display = "flex";
                    const savedGhat = localStorage.getItem('mine_erp_active_ghat');
                    if (savedGhat && document.getElementById('global-ghat-selector')) {
                        document.getElementById('global-ghat-selector').value = savedGhat;
                    }
                    this.showPage(this.currentPage);
                } else {
                    this.renderLoginScreen();
                }
                if(statusEl) statusEl.innerHTML = "☁️ ONLINE LIVE";
            }, (error) => {
                console.log("Firebase direct connection enforced.");
            });
            
        } catch (e) { 
            console.error("Initialization failed: ", e); 
            if(statusEl) statusEl.innerHTML = "❌ OFFLINE MODE";
        }
    },

    renderLoginScreen: function() {
        document.getElementById('sidebar').style.display = "none";
        const content = document.getElementById('page-content');
        if(!content) return;

        let ghatOptions = "";
        if(this.db && this.db.ghats) {
            ghatOptions = this.db.ghats.map(g => `<option value="${g}">${g}</option>`).join('');
        }

        content.innerHTML = `
            <style>
                .login-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f4f7f9; width: 100vw; position: fixed; top: 0; left: 0; z-index: 9999; }
                .login-box { background: #ffffff; padding: 65px 35px 30px 35px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); width: 100%; max-width: 400px; text-align: center; position: relative; border: 1px solid #e2e8f0; }
                .login-logo-container { position: absolute; top: -55px; left: 50%; transform: translateX(-50%); width: 110px; height: 110px; border-radius: 50%; background: white; border: 4px solid #ab2317; display: flex; align-items: center; justify-content: center; }
                .login-logo { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
                .input-group { display: flex; margin-bottom: 15px; width: 100%; height: 42px; }
                .input-icon-block { width: 45px; background: #27ae60; color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; border-radius: 4px 0 0 4px; }
                .login-input { flex: 1; padding: 0 12px; border: 1px solid #cccccc; border-left: none; border-radius: 0 4px 4px 0; font-size: 14px; font-weight: 600; outline: none; }
                .login-btn { width: 100%; padding: 12px; background: #27ae60; color: white; border: none; font-size: 15px; font-weight: bold; border-radius: 4px; cursor: pointer; }
                .bottom-green-bar { position: fixed; bottom: 0; left: 0; width: 100vw; height: 35px; background: #7cb342; z-index: 9998; }
            </style>
            <div class="login-wrapper">
                <div class="login-box">
                    <div class="login-logo-container"><img src="assets/sandmine.png" alt="Logo" class="login-logo"></div>
                    <h3 style="color:#27ae60; margin:10px 0;">e-Permit & e-Pass</h3>
                    <div class="input-group">
                        <div class="input-icon-block">📱</div>
                        <select id="login-ghat-selector" class="login-input">${ghatOptions}</select>
                    </div>
                    <div class="input-group">
                        <div class="input-icon-block">📝</div>
                        <input type="password" id="login-pin" class="login-input" placeholder="Enter Secure PIN">
                    </div>
                    <button onclick="App.handleLogin()" class="login-btn">Login</button>
                    <div id="login-error" style="color: #e74c3c; margin-top: 15px; display: none; font-weight: bold;">❌ Incorrect PIN!</div>
                </div>
            </div>
            <div class="bottom-green-bar no-print"></div>
        `;
    },

    handleLogin: function() {
        const selectedGhat = document.getElementById('login-ghat-selector').value;
        const enteredPin = document.getElementById('login-pin').value.trim();
        if (enteredPin === ADMIN_MASTER_PIN) {
            this.isAdmin = true;
            localStorage.setItem('mine_erp_is_admin', 'true');
            this.finalizeLogin(selectedGhat);
        } else if (enteredPin === this.db.ghats_security_directory[selectedGhat]) {
            this.isAdmin = false;
            localStorage.setItem('mine_erp_is_admin', 'false');
            this.finalizeLogin(selectedGhat);
        } else {
            document.getElementById('login-error').style.display = "block";
        }
    },

    finalizeLogin: function(selectedGhat) {
        this.isLoggedIn = true;
        localStorage.setItem('mine_erp_logged_in', 'true');
        localStorage.setItem('mine_erp_active_ghat', selectedGhat);
        window.location.reload(); 
    },

    logout: function() {
        if(confirm("লগআউট করতে চান?")) {
            this.isLoggedIn = false;
            this.isAdmin = false;
            localStorage.removeItem('mine_erp_logged_in');
            localStorage.removeItem('mine_erp_is_admin');
            window.location.reload();
        }
    },

    hideSensitiveMenus: function() {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.setProperty('display', this.isAdmin ? 'block' : 'none', 'important');
        });
    },

    saveToLocalStorage: function() { firebase.database().ref('naricha_mine_db').set(this.db); },

    updateGhatDropdown: function() {
        const selector = document.getElementById('global-ghat-selector');
        if(!selector) return;
        let val = selector.value;
        selector.innerHTML = this.db.ghats.map(g => `<option value="${g}">${g}</option>`).join('');
        selector.value = val || this.db.ghats[0];
    },

    changeGhatFilter: function() {
        const selectedGhat = document.getElementById('global-ghat-selector').value;
        localStorage.setItem('mine_erp_active_ghat', selectedGhat);
        this.refreshCurrentPageData();
    },

    refreshCurrentPageData: function() {
        if (!this.isLoggedIn) return;
        
        // Mining
        if(this.currentPage === 'mining') MiningModule.renderTable();
        else if(this.currentPage === 'expenses') ExpensesModule.renderTable();
        else if(this.currentPage === 'diesel') DieselModule.init();
        else if(this.currentPage === 'mining-machines') MiningMachineModule.init(); 
        
        // Stock
        else if(this.currentPage === 'stock') StockModule.renderTable();
        else if(this.currentPage === 'stock-expenses') StockExpensesModule.renderTable();
        else if(this.currentPage === 'stock-machines') StockMachineModule.init();
        else if(this.currentPage === 'stock-manual') StockManualEntryModule.renderTable(); 
        
        // Production
        else if(this.currentPage === 'production-dash') ProductionDashboardModule.init(); 
        else if(this.currentPage === 'stock-production') StockProductionModule.init(); 
        else if(this.currentPage === 'production-machines') ProductionMachineModule.init(); 
        else if(this.currentPage === 'production-diesel') ProductionDieselModule.init(); 
        else if(this.currentPage === 'production-expenses') ProductionExpenseModule.init(); 
        else if(this.currentPage === 'production-manual') ProductionManualModule.renderTable(); 
        else if(this.currentPage === 'production-daily') ProductionDailyModule.init(); 
        
        // Settings
        else if(this.currentPage === 'master-settings') MasterSettingsModule.init(); 
    },

    showPage: function(pageId, btn) {
        if (!this.isLoggedIn) return this.renderLoginScreen();
        this.currentPage = pageId;
        if(btn) {
            document.querySelectorAll('.menu-btn, .sub-menu-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
        const content = document.getElementById('page-content');
        if(!content) return;
        
        // Dashboards
        if(pageId === 'dashboard' || pageId === 'dash') { content.innerHTML = DashboardModule.getHTML(); DashboardModule.init(); }
        else if(pageId === 'mining-dash') { content.innerHTML = MiningDashboardModule.getHTML(); MiningDashboardModule.init(); }
        else if(pageId === 'stock-dash') { content.innerHTML = StockDashboardModule.getHTML(); StockDashboardModule.init(); }
        else if(pageId === 'production-dash') { content.innerHTML = ProductionDashboardModule.getHTML(); ProductionDashboardModule.init(); } 
        
        // Mining Modules
        else if(pageId === 'mining') { content.innerHTML = MiningModule.getHTML(); MiningModule.init(); }
        else if(pageId === 'expenses') { content.innerHTML = ExpensesModule.getHTML(); ExpensesModule.init(); }
        else if(pageId === 'diesel') { content.innerHTML = DieselModule.getHTML(); DieselModule.init(); }
        else if(pageId === 'ghats') { content.innerHTML = GhatModule.getHTML(); GhatModule.init(); }
        else if(pageId === 'mining-machines') { content.innerHTML = MiningMachineModule.getHTML(); MiningMachineModule.init(); } 
        
        // Production Modules
        else if(pageId === 'stock-production') { content.innerHTML = StockProductionModule.getHTML(); StockProductionModule.init(); }
        else if(pageId === 'stock-vehicles') { content.innerHTML = StockVehicleModule.getHTML(); StockVehicleModule.init(); }
        else if(pageId === 'production-machines') { content.innerHTML = ProductionMachineModule.getHTML(); ProductionMachineModule.init(); } 
        else if(pageId === 'production-diesel') { content.innerHTML = ProductionDieselModule.getHTML(); ProductionDieselModule.init(); } 
        else if(pageId === 'production-expenses') { content.innerHTML = ProductionExpenseModule.getHTML(); ProductionExpenseModule.init(); } 
        else if(pageId === 'production-manual') { content.innerHTML = ProductionManualModule.getHTML(); ProductionManualModule.init(); } 
        else if(pageId === 'production-daily') { content.innerHTML = ProductionDailyModule.getHTML(); ProductionDailyModule.init(); } 
        
        // Stock Modules
        else if(pageId === 'stock') { content.innerHTML = StockModule.getHTML(); StockModule.init(); }
        else if(pageId === 'stock-expenses') { content.innerHTML = StockExpensesModule.getHTML(); StockExpensesModule.init(); }
        else if(pageId === 'stock-machines') { content.innerHTML = StockMachineModule.getHTML(); StockMachineModule.init(); }
        else if(pageId === 'stock-manual') { content.innerHTML = StockManualEntryModule.getHTML(); StockManualEntryModule.init(); }
        
        // Master Settings
        else if(pageId === 'master-settings') { content.innerHTML = MasterSettingsModule.getHTML(); MasterSettingsModule.init(); }
        
        this.hideSensitiveMenus();
    }
};

function toggleMenu(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'block' : 'none';
}
