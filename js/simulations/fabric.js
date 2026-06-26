const FabricSimulations = {
    "fabric-onelake": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Create Virtualized Shortcuts pointing to external clouds (ADLS Gen2, AWS S3)",
                "Step 2: Fabric Spark Notebook queries the consolidated OneLake shortcut directory",
                "Step 3: OneLake engine performs dynamic metadata resolution and streams data directly"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- External Storage 1 (ADLS Gen2) -->
                <foreignObject x="30" y="30" width="110" height="85" class="node-fo" id="onelake-adls">
                    <div class="canvas-node-card">
                        <div class="node-title" style="font-size: 10px">ADLS Gen2 Store</div>
                        <div class="node-ip" style="font-size: 8px">orders_lake (Azure)</div>
                    </div>
                </foreignObject>

                <!-- External Storage 2 (AWS S3) -->
                <foreignObject x="30" y="215" width="110" height="85" class="node-fo" id="onelake-s3">
                    <div class="canvas-node-card">
                        <div class="node-title" style="font-size: 10px">AWS S3 Bucket</div>
                        <div class="node-ip" style="font-size: 8px">sales_logs (AWS)</div>
                    </div>
                </foreignObject>

                <!-- OneLake Portal Workspace -->
                <rect x="230" y="20" width="220" height="290" rx="10" fill="rgba(245, 158, 11, 0.02)" stroke="rgba(245, 158, 11, 0.2)" stroke-width="1.5"></rect>
                <text x="245" y="45" fill="var(--color-amber)" font-size="10" font-weight="bold">FABRIC ONELAKE (ONE COPY)</text>

                <!-- Shortcut 1 -->
                <foreignObject x="250" y="70" width="180" height="50" class="node-fo" id="shortcut-1">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.06)">
                        <div class="node-title" style="font-size: 9px; text-align: left"><i data-lucide="link" style="width:10px; height:10px; vertical-align:middle; margin-right:4px"></i> /Shortcuts/adls_orders</div>
                    </div>
                </foreignObject>

                <!-- Shortcut 2 -->
                <foreignObject x="250" y="145" width="180" height="50" class="node-fo" id="shortcut-2">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.06)">
                        <div class="node-title" style="font-size: 9px; text-align: left"><i data-lucide="link" style="width:10px; height:10px; vertical-align:middle; margin-right:4px"></i> /Shortcuts/s3_sales</div>
                    </div>
                </foreignObject>

                <!-- Fabric Spark Notebook compute -->
                <foreignObject x="510" y="120" width="130" height="95" class="node-fo" id="onelake-notebook">
                    <div class="canvas-node-card active" style="border-color: var(--color-cyan)">
                        <div class="node-title">Spark Notebook</div>
                        <span class="node-badge primary">Running</span>
                    </div>
                </foreignObject>

                <!-- Path connections -->
                <path d="M 140 72 L 250 95" class="canvas-link" id="link-onelake-adls" stroke-dasharray="2,2"></path>
                <path d="M 140 257 L 250 170" class="canvas-link" id="link-onelake-s3" stroke-dasharray="2,2"></path>
                <path d="M 510 167 L 430 95" class="canvas-link" id="link-nb-sc1"></path>
                <path d="M 510 167 L 430 170" class="canvas-link" id="link-nb-sc2"></path>

                <!-- Transmitting Packet -->
                <circle cx="510" cy="167" r="6" fill="var(--color-cyan)" class="packet hidden" id="packet-onelake"></circle>
            `;
            lucide.createIcons();
            addLog("system", "OneLake Storage virtual workspace initialized. Multi-cloud endpoints registered.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-onelake");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            const sc1Card = document.getElementById("shortcut-1").querySelector(".canvas-node-card");
            const sc2Card = document.getElementById("shortcut-2").querySelector(".canvas-node-card");

            if (step === 0) {
                document.getElementById("link-onelake-adls").className = "canvas-link success";
                document.getElementById("link-onelake-s3").className = "canvas-link success";
                sc1Card.classList.add("active");
                sc1Card.style.borderColor = "var(--color-amber)";
                sc2Card.classList.add("active");
                sc2Card.style.borderColor = "var(--color-amber)";

                addLog("command", "$ fabric-admin-cli shortcuts create --workspace 'Sales_WS' --lakehouse 'Sales_LH' --path 'Files/Shortcuts/s3_sales' --target-s3 's3://sales-bucket'");
                addLog("success", "Shortcuts created. Virtual metadata bindings configured. Zero bytes copied physically.");
            } else if (step === 1) {
                document.getElementById("link-nb-sc1").className = "canvas-link active";
                addLog("command", "df = spark.read.format('parquet').load('abfss://Sales_WS@onelake.dfs.fabric.microsoft.com/Sales_LH.Lakehouse/Files/Shortcuts/adls_orders/')");
                addLog("output", "Spark Executor: Submitting analytical job... Targeting virtual path /Shortcuts/adls_orders.");
                animatePacket(packet, null, 510, 167, 430, 95, 1000 / speed);
            } else if (step === 2) {
                document.getElementById("link-nb-sc1").className = "canvas-link success";
                document.getElementById("link-onelake-adls").className = "canvas-link success active";
                addLog("output", "OneLake Engine: Resolving Shortcut metadata target -> ADLS Gen2 path: raw/orders/lake...");
                addLog("output", "Streaming Parquet file byte blocks from Azure ADLS directly to Spark memory space...");

                animatePacket(packet, null, 250, 95, 140, 72, 800 / speed, () => {
                    animatePacket(packet, null, 140, 72, 510, 167, 1000 / speed, () => {
                        addLog("success", "Dataframe loaded. Spark Read operation completed successfully in 840ms.");
                    });
                });
            }
        }
    },

    "fabric-lakehouse": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Power BI Report triggers visual rendering update query",
                "Step 2: Power BI Semantic Model queries storage directly via Direct Lake mode",
                "Step 3: OneLake reads Delta Lake Parquet column stores into memory cache"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- OneLake Delta Storage -->
                <foreignObject x="30" y="110" width="130" height="110" class="node-fo" id="direct-lake-storage">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="database"></i></div>
                        <div class="node-title">OneLake Storage</div>
                        <div class="node-ip" style="font-family: JetBrains Mono; font-size: 8px">Delta Parquet Files</div>
                    </div>
                </foreignObject>

                <!-- Power BI Semantic Model -->
                <foreignObject x="270" y="110" width="140" height="110" class="node-fo" id="direct-lake-model">
                    <div class="canvas-node-card active" style="border-color: var(--color-amber)">
                        <div class="node-title">Semantic Model</div>
                        <span class="node-badge warning">Direct Lake</span>
                    </div>
                </foreignObject>

                <!-- Power BI Report Visuals -->
                <foreignObject x="510" y="110" width="130" height="110" class="node-fo" id="direct-lake-report">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald)">
                        <div class="node-icon"><i data-lucide="bar-chart-3"></i></div>
                        <div class="node-title">Power BI Report</div>
                        <div class="node-ip" style="font-size: 8px">Live Dashboard</div>
                    </div>
                </foreignObject>

                <!-- Connecting Paths -->
                <path d="M 270 165 L 160 165" class="canvas-link" id="link-model-storage"></path>
                <path d="M 510 165 L 410 165" class="canvas-link" id="link-report-model"></path>

                <!-- Query packets -->
                <circle cx="510" cy="165" r="7" fill="var(--color-emerald)" class="packet hidden" id="packet-direct-lake"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Direct Lake mode enabled. Power BI model synchronized to Lakehouse schemas.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-direct-lake");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-report-model").className = "canvas-link active";
                addLog("command", "// Power BI Desktop client rendering dashboard visuals");
                addLog("output", "DAX Query: SELECT SUM(Sales_Amount) FROM Sales_LH.Sales_Fact GROUP BY Region...");
                animatePacket(packet, null, 510, 165, 410, 165, 1000 / speed);
            } else if (step === 1) {
                document.getElementById("link-model-storage").className = "canvas-link active";
                addLog("output", "Semantic Model: Direct Lake validation checks. No Import cache matches. Bypassing Import/DirectQuery SQL compilation.");
                addLog("output", "Mapping visual dimensions to corresponding Delta table columns: Sales_Amount, Region.");
                animatePacket(packet, null, 270, 165, 160, 165, 1000 / speed);
            } else if (step === 2) {
                document.getElementById("link-model-storage").className = "canvas-link success";
                document.getElementById("link-report-model").className = "canvas-link success";
                document.getElementById("direct-lake-storage").querySelector(".canvas-node-card").classList.add("active");

                addLog("output", "VertiPaq Engine: Accessing Delta transaction log metadata directly in OneLake.");
                addLog("output", "Reading parquet data columns into Analysis Services memory page arrays...");
                
                animatePacket(packet, null, 160, 165, 270, 165, 800 / speed, () => {
                    animatePacket(packet, null, 410, 165, 510, 165, 800 / speed, () => {
                        addLog("success", "DAX evaluation complete. Dashboard visuals populated directly from Delta tables.");
                        alertUser("Direct Lake Query Completed!");
                    });
                });
            }
        }
    },

    "fabric-data-factory": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Fabric Pipeline starts Copy Activity (Transactional DB -> Lakehouse Files)",
                "Step 2: Pipeline triggers Lakehouse Spark Job to aggregate loaded files",
                "Step 3: Synapse Data Warehouse tables synchronized and report tables updated"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Source DB (Azure SQL) -->
                <foreignObject x="30" y="110" width="110" height="95" class="node-fo" id="fdf-source">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="database"></i></div>
                        <div class="node-title">Azure SQL DB</div>
                        <div class="node-ip" style="font-size: 8px">OLTP Orders</div>
                    </div>
                </foreignObject>

                <!-- Fabric Workspace (Lakehouse Files) -->
                <foreignObject x="200" y="110" width="120" height="100" class="node-fo" id="fdf-lakehouse">
                    <div class="canvas-node-card active" style="border-color: var(--color-amber)">
                        <div class="node-title">Fabric Lakehouse</div>
                        <div class="node-ip" style="font-size: 8px">Bronze/Silver tables</div>
                    </div>
                </foreignObject>

                <!-- Fabric Spark Compute -->
                <foreignObject x="360" y="110" width="120" height="100" class="node-fo" id="fdf-spark">
                    <div class="canvas-node-card" style="border-color: var(--color-cyan)">
                        <div class="node-icon"><i data-lucide="cpu"></i></div>
                        <div class="node-title">Spark Compute</div>
                        <div class="node-ip" style="font-size: 8px">Medallion Architecture</div>
                    </div>
                </foreignObject>

                <!-- Fabric Data Warehouse -->
                <foreignObject x="520" y="110" width="120" height="100" class="node-fo" id="fdf-dw">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald)">
                        <div class="node-title">Fabric DW</div>
                        <div class="node-ip" style="font-size: 8px">Gold Analytics Layer</div>
                    </div>
                </foreignObject>

                <!-- Connection Paths -->
                <path d="M 140 160 L 200 160" class="canvas-link" id="fdf-l-copy"></path>
                <path d="M 320 160 L 360 160" class="canvas-link" id="fdf-l-spark"></path>
                <path d="M 480 160 L 520 160" class="canvas-link" id="fdf-l-dw"></path>

                <!-- Event packet -->
                <circle cx="140" cy="160" r="7" fill="var(--color-amber)" class="packet hidden" id="packet-fdf"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Fabric Data Pipeline orchestrator loaded. Pipeline: sync_orders_to_gold.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-fdf");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("fdf-l-copy").className = "canvas-link active";
                addLog("command", "// Triggering Fabric Pipeline copy activity: sql_to_lakehouse");
                addLog("output", "Extracting modified order tables from Azure SQL DB. Loading to OneLake Bronze files...");
                animatePacket(packet, null, 140, 160, 200, 160, 1200 / speed, () => {
                    addLog("success", "Bronze files populated in Lakehouse storage folder Files/raw/.");
                });
            } else if (step === 1) {
                document.getElementById("fdf-l-copy").className = "canvas-link success";
                document.getElementById("fdf-l-spark").className = "canvas-link active";
                document.getElementById("fdf-spark").querySelector(".canvas-node-card").classList.add("active");

                addLog("command", "// Triggering Spark Notebook: gold_aggregation_job");
                addLog("output", "Running Spark SQL Delta Merges: Reading Bronze, resolving transformations, updating Silver tables...");
                animatePacket(packet, null, 320, 160, 360, 160, 1000 / speed);
            } else if (step === 2) {
                document.getElementById("fdf-l-copy").className = "canvas-link success";
                document.getElementById("fdf-l-spark").className = "canvas-link success";
                document.getElementById("fdf-l-dw").className = "canvas-link success";
                document.getElementById("fdf-dw").querySelector(".canvas-node-card").classList.add("active");

                addLog("output", "Fabric DW Engine: Refreshing database schemas. Syncing Delta gold tables into SQL Analytics Warehouse...");
                
                animatePacket(packet, null, 480, 160, 520, 160, 1000 / speed, () => {
                    addLog("success", "Data Pipeline sync completed successfully. Execution status: SUCCEEDED.");
                });
            }
        }
    }
};

window.FabricSimulations = FabricSimulations;

