// ==========================================
// MODULE: DASHBOARD (WBMDTCL GOVERNMENT STYLE)
// ==========================================
// 🔹 const এর বদলে var দেওয়া হলো যাতে 'already been declared' এরর আর কোনোদিন না আসে
var DashboardModule = {
    init: function() {
        this.updateLiveCounters();
        this.startLiveClock();
    },

    getHTML: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        
        return `
            <style>
                .gov-dash-wrapper {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #f4f9fc;
                    margin: -20px;
                    padding: 20px;
                }
                
                /* Top Institutional Header Bar */
                .gov-top-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #e3f2fd;
                    padding: 10px 20px;
                    border-bottom: 2px solid #90caf9;
                    border-radius: 4px;
                    margin-bottom: 15px;
                }
                .gov-brand { display: flex; align-items: center; gap: 15px; }
                .gov-brand img { height: 45px; width: auto; }
                .gov-brand h1 { margin: 0; font-size: 20px; color: #ab2317; font-weight: 800; letter-spacing: 0.5px; }
                .gov-brand p { margin: 2px 0 0 0; font-size: 12px; color: #1e3a5f; font-weight: 600; }
                .gov-live-clock { font-size: 13px; font-weight: bold; color: #2c3e50; text-align: right; }

                /* Main Institutional Banner */
                .gov-hero-banner {
                    background: linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 100%), url('assets/sand_banner_bg.jpg');
                    background-size: cover;
                    background-position: center;
                    background-color: #d35400;
                    border-radius: 4px;
                    padding: 40px 30px;
                    color: white;
                    margin-bottom: 25px;
                    position: relative;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                    border-left: 6px solid #ab2317;
                }
                .gov-hero-banner h2 { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px; text-shadow: 2px 2px 4px rgba(0,0,0,0.6); }
                .gov-hero-banner p { margin: 12px 0 0 0; font-size: 16px; max-width: 600px; font-weight: 500; line-height: 1.5; text-shadow: 1px 1px 3px rgba(0,0,0,0.5); }

                /* 3-Column Layout Construction */
                .gov-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1.3fr 1fr;
                    gap: 20px;
                }
                @media (max-width: 1024px) { .gov-grid { grid-template-columns: 1fr; } }

                /* Left Side Panels */
                .gov-panel-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                    position: relative;
                }
                .gov-ribbon {
                    background: #3498db;
                    color: white;
                    padding: 6px 20px 6px 15px;
                    font-weight: bold;
                    font-size: 12px;
                    text-transform: uppercase;
                    display: inline-block;
                    margin-bottom: 15px;
                    margin-left: -20px;
                    position: relative;
                }
                .gov-ribbon::after {
                    content: '';
                    position: absolute;
                    right: 0; top: 0;
                    border-top: 14px solid transparent;
                    border-bottom: 14px solid transparent;
                    border-right: 10px solid white;
                }
                .gov-panel-text { font-size: 13px; color: #555555; line-height: 1.6; text-align: justify; margin: 0; }

                /* Center LED Meters */
                .analytics-box {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    padding: 20px;
                    text-align: center;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                }
                .analytics-header-ribbon {
                    background: #5dade2;
                    color: white;
                    padding: 4px 15px;
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                    display: inline-block;
                    margin-bottom: 15px;
                }
                .led-counter-screen {
                    background: #2c3e50;
                    border: 3px solid #bdc3c7;
                    border-radius: 6px;
                    padding: 12px 20px;
                    display: inline-block;
                    margin-bottom: 10px;
                    box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
                }
                .led-digits {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 34px;
                    font-weight: bold;
                    color: #5dade2;
                    letter-spacing: 5px;
                    text-shadow: 0 0 8px rgba(93, 173, 226, 0.6);
                }
                .analytics-label { font-size: 13px; font-weight: bold; color: #27ae60; margin: 5px 0; }
                .analytics-subtext { font-size: 11px; color: #7f8c8d; margin: 0; font-weight: 600; }

                /* Right Column Badges */
                .circular-menu-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    justify-items: center;
                    align-content: start;
                }
                .circular-badge {
                    width: 110px; height: 110px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 4px solid #f5d6a7;
                    box-shadow: 0 5px 12px rgba(0,0,0,0.08);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    padding: 5px;
                    box-sizing: border-box;
                }
                .circular-badge:hover {
                    transform: translateY(-4px) scale(1.03);
                    box-shadow: 0 8px 18px rgba(0,0,0,0.15);
                    border-color: #ab2317;
                }
                .circular-badge-icon { font-size: 22px; margin-bottom: 4px; }
                .circular-badge-text { font-size: 10.5px; font-weight: 800; color: #ab2317; line-height: 1.2; text-transform: uppercase; }
            </style>

            <div class="gov-dash-wrapper">
                <div class="gov-top-header">
                    <div class="gov-brand">
                        <img src="assets/sandmine.png" alt="Logo" onerror="this.style.display='none'">
                        <div>
                            <h1>WBMDTCL CLIENT CONTROL</h1>
                            <p>Integrated Infrastructure Portal — Government Style ERP System</p>
                        </div>
                    </div>
                    <div class="gov-live-clock" id="gov-live-clock-panel">⏳ Loading Time...</div>
                </div>

                <div class="gov-hero-banner">
                    <h2>${currentGhat.toUpperCase()}</h2>
                    <p>A wholly customized mine management dashboard under active business operational deployment. Secure logistics tracing, automated royalty processing, and live verification workflows.</p>
                </div>

                <div class="gov-grid">
                    <div>
                        <div class="gov-panel-card">
                            <div class="gov-ribbon" style="background:#3498db;">About Our System</div>
                            <p class="gov-panel-text">
                                This ERP module is tailored exclusively for managing specialized heavy earth extractions and logistics reporting. It integrates local storage safeguards with dynamic synchronization states.
                            </p>
                        </div>
                        <div class="gov-panel-card">
                            <div class="gov-ribbon" style="background:#27ae60;">Our System Vision</div>
                            <p class="gov-panel-text">
                                To ensure unmatched transparency in operational logs and dynamic billing updates with high data confidentiality.
                            </p>
                        </div>
                    </div>

                    <div>
                        <div class="analytics-box">
                            <div class="analytics-header-ribbon">Analytics</div>
                            <div class="led-counter-screen">
                                <div class="led-digits" id="led-total-challan">00000000</div>
                            </div>
                            <div class="analytics-label">Total Trucks Loaded (Till Date)</div>
                        </div>
                        
                        <div class="analytics-box">
                            <div class="analytics-header-ribbon" style="background:#9b59b6;">Total Volume</div>
                            <div class="led-counter-screen" style="border-color:#9b59b6;">
                                <div class="led-digits" id="led-total-cft" style="color:#9b59b6; text-shadow: 0 0 8px rgba(155,89,182,0.6);">00000000</div>
                            </div>
                            <div class="analytics-label" style="color:#9b59b6;">Total CFT (Till Date)</div>
                        </div>

                        <div class="analytics-box">
                            <div class="analytics-header-ribbon" style="background:#e67e22;">What's Current</div>
                            <div class="led-counter-screen" style="border-color:#e67e22;">
                                <div class="led-digits" id="led-today-challan" style="color:#e67e22; text-shadow: 0 0 8px rgba(230,126,34,0.6);">0000</div>
                            </div>
                            <div class="analytics-label" style="color:#e67e22;">Total eChallans Generated (Today)</div>
                            <div class="analytics-subtext" id="counter-today-date-lbl">Upto: 06:00 PM</div>
                        </div>
                    </div>

                    <div>
                        <div style="font-size:12px; font-weight:bold; color:#2c3e50; text-transform:uppercase; margin-bottom:12px; border-left:3px solid #ab2317; padding-left:8px;">E-Services Directory</div>
                        <div class="circular-menu-container">
                            <div class="circular-badge" onclick="App.showPage('mining')">
                                <div class="circular-badge-icon">⛏️</div>
                                <div class="circular-badge-text">Mining Sheet</div>
                            </div>
                            <div class="circular-badge" onclick="App.showPage('stock')">
                                <div class="circular-badge-icon">📦</div>
                                <div class="circular-badge-text">Stock Sheet</div>
                            </div>
                            <div class="circular-badge" onclick="App.showPage('diesel')">
                                <div class="circular-badge-icon">⛽</div>
                                <div class="circular-badge-text">Diesel Log</div>
                            </div>
                            <div class="circular-badge" onclick="App.showPage('stock-vehicles')">
                                <div class="circular-badge-icon">🚚</div>
                                <div class="circular-badge-text">Vehicle Ledger</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    updateLiveCounters: function() {
        const currentGhat = document.getElementById('global-ghat-selector')?.value || localStorage.getItem('mine_erp_active_ghat') || "Naricha Sand Mine";
        const todayStr = new Date().toISOString().split('T')[0];

        const totalMining = (App.db.mining_sheet_db || []).filter(i => i.ghat === currentGhat);
        const totalStock = (App.db.stock_ledger || []).filter(i => i.ghat === currentGhat);
        
        // Count Total Trucks/Challans
        const grandTotalCount = totalMining.length + totalStock.length;
        
        // Count Today's Trucks/Challans
        const todayMining = totalMining.filter(i => i.date === todayStr).length;
        const todayStock = totalStock.filter(i => i.date === todayStr).length;
        const grandTodayCount = todayMining + todayStock;
        
        // Calculate Total CFT
        let totalCftSum = 0;
        totalMining.forEach(i => totalCftSum += (parseFloat(i.cft) || 0));
        totalStock.forEach(i => totalCftSum += (parseFloat(i.cft) || 0));

        // Update UI
        const totalDigitsEl = document.getElementById('led-total-challan');
        if (totalDigitsEl) totalDigitsEl.innerText = String(grandTotalCount).padStart(8, '0');
        
        const totalCftEl = document.getElementById('led-total-cft');
        if (totalCftEl) totalCftEl.innerText = String(totalCftSum).padStart(8, '0');

        const todayDigitsEl = document.getElementById('led-today-challan');
        if (todayDigitsEl) todayDigitsEl.innerText = String(grandTodayCount).padStart(4, '0');

        const todayLbl = document.getElementById('counter-today-date-lbl');
        if (todayLbl) {
            const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            todayLbl.innerText = `(Upto: Today ${timeNow})`;
        }
    },

    startLiveClock: function() {
        const updateClock = () => {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            if(document.getElementById('gov-live-clock-panel')) {
                document.getElementById('gov-live-clock-panel').innerText = now.toLocaleString('en-US', options);
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    }
};