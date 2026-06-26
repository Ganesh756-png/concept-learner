const AzureSimulations = {
    "adf-devops": {
        totalSteps: 4,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Commit and push changes to developer feature branch (adf_dev)",
                "Step 2: Merge Pull Request into collaboration branch (main)",
                "Step 3: Click Publish to compile and generate ARM templates in adf_publish branch",
                "Step 4: Release Pipeline triggers deployment and updates target environments"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            const colBranch = params.branch || "main";
            stage.innerHTML = `
                <!-- ADF Dev Node -->
                <foreignObject x="30" y="110" width="110" height="90" class="node-fo" id="devops-adf-dev">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-title">ADF Dev Env</div>
                        <span class="node-badge primary">dev_feature</span>
                    </div>
                </foreignObject>

                <!-- Git Repo Collaboration Node -->
                <foreignObject x="220" y="30" width="130" height="90" class="node-fo" id="devops-git-collab">
                    <div class="canvas-node-card" style="border-color: rgba(255,255,255,0.1)">
                        <div class="node-icon"><i data-lucide="git-branch"></i></div>
                        <div class="node-title">Git Repo</div>
                        <span class="node-badge" id="badge-collab-branch">${colBranch}</span>
                    </div>
                </foreignObject>

                <!-- Git Publish Branch -->
                <foreignObject x="220" y="210" width="130" height="90" class="node-fo" id="devops-git-publish">
                    <div class="canvas-node-card" style="border-color: rgba(255,255,255,0.1)">
                        <div class="node-icon"><i data-lucide="git-commit"></i></div>
                        <div class="node-title">Publish Branch</div>
                        <span class="node-badge warning">adf_publish</span>
                    </div>
                </foreignObject>

                <!-- Azure DevOps Pipeline -->
                <foreignObject x="430" y="120" width="130" height="90" class="node-fo" id="devops-pipeline">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-icon"><i data-lucide="play-circle"></i></div>
                        <div class="node-title">Release CD</div>
                        <span class="node-badge" id="badge-pipeline-status">idle</span>
                    </div>
                </foreignObject>

                <!-- Target QA/Prod ADF -->
                <foreignObject x="600" y="120" width="120" height="90" class="node-fo" id="devops-target">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald)">
                        <div class="node-title">ADF Platform</div>
                        <span class="node-badge success" id="badge-target-env">${params.environment}</span>
                    </div>
                </foreignObject>

                <!-- Links -->
                <path d="M 140 140 L 220 75" class="canvas-link" id="l-dev-collab"></path>
                <path d="M 285 120 L 285 210" class="canvas-link" id="l-collab-pub"></path>
                <path d="M 350 255 L 430 180" class="canvas-link" id="l-pub-pipe"></path>
                <path d="M 560 165 L 600 165" class="canvas-link" id="l-pipe-target"></path>

                <!-- Packets -->
                <circle cx="140" cy="140" r="6" fill="var(--color-accent)" class="packet hidden" id="packet-devops"></circle>
            `;
            lucide.createIcons();
            addLog("system", `ADF Git workspace configured. Collaboration branch: ${colBranch}.`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const colBranch = params.branch || "main";
            const targetEnv = params.environment || "QA Environment";
            const packet = document.getElementById("packet-devops");
            const pipeStatus = document.getElementById("badge-pipeline-status");
            const targetCard = document.getElementById("devops-target").querySelector(".canvas-node-card");
            
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("l-dev-collab").className = "canvas-link active";
                addLog("command", "$ git add . && git commit -m 'added load_orders_pipeline' && git push origin dev_feature");
                addLog("output", `Pushed commit: added load_orders_pipeline to remote origin.`);
                animatePacket(packet, null, 140, 140, 220, 75, 1000 / speed);
            } else if (step === 1) {
                document.getElementById("l-collab-pub").className = "canvas-link active";
                document.getElementById("devops-git-collab").querySelector(".canvas-node-card").classList.add("active");
                addLog("command", `$ gh pr create --base ${colBranch} --head dev_feature --title 'Merge new pipelines'`);
                addLog("output", `Pull Request created and approved. Merged dev_feature into ${colBranch}.`);
            } else if (step === 2) {
                document.getElementById("l-collab-pub").className = "canvas-link success";
                document.getElementById("l-pub-pipe").className = "canvas-link active";
                document.getElementById("devops-git-publish").querySelector(".canvas-node-card").classList.add("active");
                
                addLog("output", "Publishing ADF. Compiling pipeline definitions to ARM templates...");
                addLog("success", "ARM templates generated and pushed to remote branch 'adf_publish' successfully.");
                animatePacket(packet, null, 285, 120, 285, 210, 800 / speed, () => {
                    animatePacket(packet, null, 350, 255, 430, 180, 800 / speed);
                });
            } else if (step === 3) {
                document.getElementById("l-pub-pipe").className = "canvas-link success";
                document.getElementById("l-pipe-target").className = "canvas-link success";
                document.getElementById("devops-pipeline").querySelector(".canvas-node-card").classList.add("active");
                
                pipeStatus.textContent = "deploying";
                pipeStatus.className = "node-badge primary";

                addLog("command", `az pipelines release create --definition-name 'ADF-CD' --variables TargetFactory='${targetEnv.includes("QA") ? "adf-qa" : "adf-prod"}'`);
                addLog("output", `DevOps release pipeline executing template deployment to ${targetEnv}...`);

                animatePacket(packet, null, 430, 165, 600, 165, 1200 / speed, () => {
                    pipeStatus.textContent = "success";
                    pipeStatus.className = "node-badge success";
                    targetCard.classList.add("active");
                    addLog("success", `ARM templates successfully deployed to ADF ${targetEnv}! Environment synced.`);
                });
            }
        }
    },

    "adf-ir": {
        totalSteps: 2,
        getStepLabel: (idx) => {
            return idx === 0 ? "Step 1: Check outbound gateway connection request" : "Step 2: Transfer data securely over outbound channel";
        },
        setup: (stage, params, addLog) => {
            const isSHIR = params.runtime_type === "Self-Hosted IR (SHIR)";

            stage.innerHTML = `
                <!-- On-Premises DB SQL Server (Inside corporate network) -->
                <rect x="20" y="30" width="310" height="290" rx="10" fill="rgba(239,68,68,0.02)" stroke="rgba(239,68,68,0.15)" stroke-width="1.5"></rect>
                <text x="35" y="55" fill="var(--color-rose)" font-size="10" font-weight="bold">ON-PREMISES PRIVATE NETWORK (FIREWALLED)</text>

                <!-- SQL DB -->
                <foreignObject x="40" y="130" width="110" height="100" class="node-fo" id="ir-source-db">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="database"></i></div>
                        <div class="node-title">SQL Server</div>
                        <div class="node-ip">10.15.5.42 (Local)</div>
                    </div>
                </foreignObject>

                <!-- SHIR Gateway VM -->
                <foreignObject x="190" y="130" width="120" height="100" class="node-fo" id="ir-shir-vm">
                    <div class="canvas-node-card" style="border-color: ${isSHIR ? 'var(--color-cyan)' : 'rgba(255,255,255,0.05)'}">
                        <div class="node-icon"><i data-lucide="cpu"></i></div>
                        <div class="node-title">SHIR Agent</div>
                        <div class="node-ip" style="font-size: 8px">Outbound Port 443</div>
                    </div>
                </foreignObject>

                <!-- Cloud Space (ADF and ADLS) -->
                <foreignObject x="480" y="30" width="130" height="95" class="node-fo" id="ir-adf-cloud">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-title">ADF Cloud Engine</div>
                        <span class="node-badge primary" id="ir-badge-type">${params.runtime_type.includes("Self") ? "SHIR Mode" : "Azure IR Mode"}</span>
                    </div>
                </foreignObject>

                <foreignObject x="480" y="200" width="130" height="95" class="node-fo" id="ir-adls-cloud">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="folder-git"></i></div>
                        <div class="node-title">ADLS Gen2 Storage</div>
                        <div class="node-ip">adlsplatform</div>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 150 180 L 190 180" class="canvas-link" id="link-db-shir"></path>
                <path d="M 310 180 L 480 80" class="canvas-link" id="link-shir-adf"></path>
                <path d="M 310 180 L 480 250" class="canvas-link" id="link-shir-adls"></path>
                <path d="M 545 125 L 545 200" class="canvas-link" id="link-adf-adls"></path>

                <!-- Firewall Wall separator -->
                <line x1="330" y1="30" x2="330" y2="320" stroke="var(--color-rose)" stroke-width="2" stroke-dasharray="4,4"></line>
                <text x="335" y="315" fill="var(--color-rose)" font-size="8" font-family="JetBrains Mono">Firewall Wall</text>

                <!-- Packets -->
                <circle cx="480" cy="80" r="7" fill="var(--color-accent)" class="packet hidden" id="packet-ir"></circle>
            `;
            lucide.createIcons();
            addLog("system", `Integration Runtime lab loaded with compute option: ${params.runtime_type}.`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const isSHIR = params.runtime_type === "Self-Hosted IR (SHIR)";
            const packet = document.getElementById("packet-ir");
            packet.classList.add("hidden");

            // Reset links
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (!isSHIR) {
                // Azure IR attempting to connect directly to On-Premises SQL (BLOCKED)
                if (step === 0) {
                    document.getElementById("link-shir-adf").className = "canvas-link error";
                    addLog("command", "ADF: Testing connection to On-premises SQL (10.15.5.42)...");
                    animatePacket(packet, null, 480, 80, 330, 160, 1000 / speed, () => {
                        addLog("error", "CONNECTION FAILED: Network route blocked by On-Premises Firewall. Incoming requests on Port 1433 are blocked!");
                        alertUser("Azure IR Blocked by On-Premises Firewall!");
                    });
                } else if (step === 1) {
                    addLog("warning", "Direct cloud-to-local connection blocked. Register a Self-Hosted Integration Runtime inside the network to proceed.");
                }
                return;
            }

            // SHIR Mode (Success Path)
            if (step === 0) {
                document.getElementById("link-shir-adf").className = "canvas-link active";
                addLog("output", "SHIR Node: Initializing outbound HTTPS (Port 443) connection channel to ADF Cloud control plane...");
                
                // Animate outbound connection registration from SHIR to Cloud ADF
                animatePacket(packet, null, 310, 180, 480, 80, 1000 / speed, () => {
                    addLog("success", "SHIR Node VM-ONPREM-SHIR-01 connected. Awaiting copy task execution.");
                });
            } else if (step === 1) {
                document.getElementById("link-db-shir").className = "canvas-link success";
                document.getElementById("link-shir-adls").className = "canvas-link success";
                
                addLog("output", "Executing pipeline task: SQL Database -> Local SHIR gateway -> ADLS cloud upload.");
                
                // Animate SQL Server -> SHIR -> ADLS Gen2 Cloud target
                animatePacket(packet, null, 150, 180, 190, 180, 600 / speed, () => {
                    animatePacket(packet, null, 310, 180, 480, 250, 1000 / speed, () => {
                        addLog("success", "Copy complete. Data securely extracted using Self-Hosted Integration Runtime!");
                    });
                });
            }
        }
    },

    "adls-security": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Check Role-Based Access Control (RBAC) at Storage Account level",
                "Step 2: Check POSIX Access Control Lists (ACLs) down path hierarchy to directory root",
                "Step 3: Read file from folder raw/orders/file.csv"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            const rbacRole = params.user_role || "Storage Blob Data Reader";
            const aclPerm = params.directory_acl || "Read (r--)";

            stage.innerHTML = `
                <!-- User Principal -->
                <foreignObject x="30" y="125" width="110" height="90" class="node-fo" id="adls-sec-client">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="user"></i></div>
                        <div class="node-title">jane.doe</div>
                        <div class="node-ip" style="font-size: 8px">Principal ID</div>
                    </div>
                </foreignObject>

                <!-- Storage RBAC Gate -->
                <foreignObject x="210" y="120" width="130" height="100" class="node-fo" id="adls-sec-rbac">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-title" style="font-size: 11px">RBAC Guard</div>
                        <span class="node-badge" id="rbac-assigned-badge">${rbacRole}</span>
                    </div>
                </foreignObject>

                <!-- Directory Trees nodes -->
                <g id="adls-sec-tree">
                    <foreignObject x="420" y="30" width="100" height="60" class="node-fo">
                        <div class="canvas-node-card mini" id="dir-root-node">
                            <div class="node-title" style="font-size: 10px">/ (Root)</div>
                            <div class="node-ip" style="font-size: 8px">ACL: r-x</div>
                        </div>
                    </foreignObject>
                    <foreignObject x="420" y="120" width="100" height="60" class="node-fo">
                        <div class="canvas-node-card mini" id="dir-raw-node">
                            <div class="node-title" style="font-size: 10px">raw/</div>
                            <div class="node-ip" style="font-size: 8px">ACL: r-x</div>
                        </div>
                    </foreignObject>
                    <foreignObject x="420" y="210" width="100" height="60" class="node-fo">
                        <div class="canvas-node-card mini" id="dir-orders-node">
                            <div class="node-title" style="font-size: 10px">orders/</div>
                            <div class="node-ip" style="font-size: 8px" id="acl-orders-val">ACL: ${aclPerm.includes("Full") ? 'rwx' : aclPerm.includes("Write") ? 'rw-' : 'r--'}</div>
                        </div>
                    </foreignObject>
                    <foreignObject x="560" y="210" width="90" height="60" class="node-fo" id="file-target-node">
                        <div class="canvas-node-card mini">
                            <div class="node-title" style="font-size: 9px">file.csv</div>
                        </div>
                    </foreignObject>
                </g>

                <!-- Connections -->
                <path d="M 140 170 L 210 170" class="canvas-link" id="link-client-rbac"></path>
                <path d="M 340 145 L 420 60" class="canvas-link" id="link-rbac-root"></path>
                <path d="M 470 90 L 470 120" class="canvas-link" id="link-root-raw"></path>
                <path d="M 470 180 L 470 210" class="canvas-link" id="link-raw-orders"></path>
                <path d="M 520 240 L 560 240" class="canvas-link" id="link-orders-file"></path>

                <!-- Packet -->
                <circle cx="140" cy="170" r="7" fill="var(--color-accent)" class="packet hidden" id="packet-adls-sec"></circle>
            `;
            lucide.createIcons();
            addLog("system", "ADLS Gen2 hierarchical namespace structure active.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const rbacRole = params.user_role || "Storage Blob Data Reader";
            const aclPerm = params.directory_acl || "Read (r--)";
            const packet = document.getElementById("packet-adls-sec");
            const rbacCard = document.getElementById("adls-sec-rbac").querySelector(".canvas-node-card");
            
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-client-rbac").className = "canvas-link active";
                addLog("command", `$ az storage fs file download --path 'raw/orders/file.csv'`);
                addLog("output", "ADLS: Evaluating client identity authorization token...");
                
                animatePacket(packet, null, 140, 170, 210, 170, 1000 / speed, () => {
                    if (rbacRole === "None") {
                        addLog("error", "RBAC Auth: Identity has no Storage level roles assigned. Access DENIED.");
                        rbacCard.style.borderColor = "var(--color-rose)";
                        alertUser("RBAC Storage level Check Failed!");
                    } else {
                        addLog("output", `RBAC Auth: Matched Storage level role [${rbacRole}]. Permission granted to parse storage hierarchy.`);
                        rbacCard.style.borderColor = "var(--color-emerald)";
                    }
                });
            } else if (step === 1) {
                if (rbacRole === "None") {
                    addLog("warning", "Cannot check ACLs. RBAC storage access check failed. Reset or modify parameters.");
                    return;
                }
                
                document.getElementById("link-rbac-root").className = "canvas-link active";
                document.getElementById("link-root-raw").className = "canvas-link active";
                document.getElementById("link-raw-orders").className = "canvas-link active";
                
                addLog("output", "ACL Engine: Evaluating POSIX Access Control permissions directory by directory down path raw/orders/file.csv...");
                
                // Animate checking down the directories
                animatePacket(packet, null, 340, 145, 420, 60, 600 / speed, () => {
                    document.getElementById("dir-root-node").classList.add("active");
                    addLog("output", " - Root Folder (/) ACL check: jane.doe has Execute (x) permissions. Passed.");
                    
                    animatePacket(packet, null, 470, 90, 470, 120, 400 / speed, () => {
                        document.getElementById("dir-raw-node").classList.add("active");
                        addLog("output", " - Folder /raw ACL check: jane.doe has Execute (x) permissions. Passed.");
                        
                        animatePacket(packet, null, 470, 180, 470, 210, 400 / speed, () => {
                            document.getElementById("dir-orders-node").classList.add("active");
                        });
                    });
                });
            } else if (step === 2) {
                if (rbacRole === "None") return;

                document.getElementById("link-orders-file").className = "canvas-link success";
                
                if (aclPerm.includes("Read") || aclPerm.includes("Full")) {
                    document.getElementById("file-target-node").querySelector(".canvas-node-card").classList.add("active");
                    animatePacket(packet, null, 520, 240, 560, 240, 600 / speed, () => {
                        addLog("success", "Access GRANTED. file.csv byte download complete.");
                    });
                } else {
                    document.getElementById("link-orders-file").className = "canvas-link error";
                    addLog("error", "Access DENIED. /orders subfolder lacks Read (r) POSIX permissions for identity jane.doe@entra.com.");
                    alertUser("Access Denied by folder ACL check!");
                }
            }
        }
    },

    "entra-identity": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Client service requests OAuth2 JWT token from Entra ID endpoint",
                "Step 2: Entra ID validates credentials/Managed Identity and issues Token",
                "Step 3: Client includes JWT token in ADLS storage call header to authenticate securely"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- ADF Managed Identity Node -->
                <foreignObject x="30" y="130" width="130" height="110" class="node-fo" id="entra-adf">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-title">Azure Data Factory</div>
                        <span class="node-badge primary" id="entra-id-type">${params.identity_type}</span>
                    </div>
                </foreignObject>

                <!-- Microsoft Entra ID Node -->
                <foreignObject x="250" y="30" width="150" height="90" class="node-fo" id="entra-endpoint">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-icon"><i data-lucide="shield-check"></i></div>
                        <div class="node-title">Microsoft Entra ID</div>
                        <div class="node-ip" style="font-size: 8px">Token Endpoint</div>
                    </div>
                </foreignObject>

                <!-- ADLS Storage target -->
                <foreignObject x="490" y="130" width="130" height="110" class="node-fo" id="entra-adls">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="folder-heart"></i></div>
                        <div class="node-title">ADLS Gen2 Storage</div>
                        <span class="node-badge" id="entra-adls-auth">Awaiting Auth</span>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 110 130 L 250 80" class="canvas-link" id="link-adf-entra-req"></path>
                <path d="M 330 120 L 140 200" class="canvas-link" id="link-entra-adf-res"></path>
                <path d="M 160 185 L 490 185" class="canvas-link" id="link-adf-adls-data"></path>

                <!-- Packet -->
                <circle cx="110" cy="130" r="7" fill="var(--color-accent)" class="packet hidden" id="packet-entra"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Azure Instance Metadata Service (IMDS) configured on virtual subnet.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-entra");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-adf-entra-req").className = "canvas-link active";
                addLog("command", "curl -H 'Metadata: true' 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://storage.azure.com/'");
                addLog("output", "Requesting OAuth2 security token for storage.azure.com resource using IMDS...");
                
                animatePacket(packet, null, 110, 130, 250, 80, 1000 / speed);
            } else if (step === 1) {
                document.getElementById("link-entra-adf-res").className = "canvas-link active";
                addLog("output", "Entra ID: Validated Managed Identity VM metadata context. Issuing JSON Web Token...");
                
                animatePacket(packet, null, 330, 120, 140, 200, 1000 / speed, () => {
                    addLog("success", "JWT Token received locally in memory cache.");
                });
            } else if (step === 2) {
                document.getElementById("link-adf-adls-data").className = "canvas-link success";
                const adlsAuthBadge = document.getElementById("entra-adls-auth");
                
                addLog("command", "GET https://adlsplatform.dfs.core.windows.net/datalake?resource=filesystem");
                addLog("output", "Header: Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1...");
                
                animatePacket(packet, null, 160, 185, 490, 185, 1200 / speed, () => {
                    adlsAuthBadge.textContent = "Authorized";
                    adlsAuthBadge.className = "node-badge success";
                    addLog("success", "ADLS: Token signature validated successfully. Access Authorized. Loading files.");
                });
            }
        }
    },

    "private-endpoint": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Check DNS resolution path for Database connection endpoint",
                "Step 2: Route request through Private Endpoint IP interface",
                "Step 3: Secure private backbone data transfer to SQL Database"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            const privateDns = params.private_dns === "Enabled (Secure IP)";

            stage.innerHTML = `
                <!-- VNet Subnet Area -->
                <rect x="20" y="30" width="320" height="290" rx="10" fill="rgba(59, 130, 246, 0.02)" stroke="rgba(59,130,246,0.15)" stroke-width="1.5"></rect>
                <text x="35" y="55" fill="var(--color-accent)" font-size="10" font-weight="bold">AZURE VIRTUAL NETWORK (VNET - 10.1.0.0/16)</text>

                <!-- ADF compute in Private Subnet -->
                <foreignObject x="40" y="125" width="115" height="100" class="node-fo" id="pep-adf">
                    <div class="canvas-node-card active">
                        <div class="node-title">ADF Managed IR</div>
                        <div class="node-ip">IP: 10.1.5.8</div>
                    </div>
                </foreignObject>

                <!-- Private Endpoint (Private IP Interface) -->
                <foreignObject x="210" y="125" width="120" height="100" class="node-fo" id="pep-endpoint">
                    <div class="canvas-node-card" style="border-color: ${privateDns ? 'var(--color-cyan)' : 'rgba(255,255,255,0.05)'}">
                        <div class="node-icon"><i data-lucide="shield-alert"></i></div>
                        <div class="node-title">Private Endpoint</div>
                        <div class="node-ip" style="font-size: 8px">IP: 10.1.0.5</div>
                    </div>
                </foreignObject>

                <!-- Azure SQL Database in Public Azure Space -->
                <foreignObject x="490" y="125" width="130" height="110" class="node-fo" id="pep-sql">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald)">
                        <div class="node-icon"><i data-lucide="database"></i></div>
                        <div class="node-title">Azure SQL Database</div>
                        <span class="node-badge" id="sql-endpoint-status">Firewall active</span>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 155 175 L 210 175" class="canvas-link" id="link-adf-pep"></path>
                <path d="M 330 175 L 490 175" class="canvas-link" id="link-pep-sql"></path>
                <path d="M 155 155 L 490 145" class="canvas-link" id="link-adf-sql-public"></path>

                <!-- Separator line -->
                <line x1="360" y1="30" x2="360" y2="320" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"></line>

                <!-- Packet -->
                <circle cx="155" cy="175" r="7" fill="var(--color-accent)" class="packet hidden" id="packet-pep"></circle>
            `;
            lucide.createIcons();
            addLog("system", `Private link resolution setup. Dynamic Private DNS settings: ${params.private_dns}.`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const privateDns = params.private_dns === "Enabled (Secure IP)";
            const packet = document.getElementById("packet-pep");
            packet.classList.add("hidden");

            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                addLog("command", "$ nslookup mydbserver.database.windows.net");
                if (privateDns) {
                    addLog("output", "DNS: CNAME found pointing database.windows.net to mydbserver.privatelink.database.windows.net.\nResolution IP: 10.1.0.5");
                } else {
                    addLog("output", "DNS: Resolving database endpoint publicly.\nResolution Public IP: 40.112.5.42");
                }
            } else if (step === 1) {
                if (privateDns) {
                    document.getElementById("link-adf-pep").className = "canvas-link active";
                    addLog("output", "Routing database query locally via Private IP 10.1.0.5 inside Virtual Network...");
                    animatePacket(packet, null, 155, 175, 210, 175, 800 / speed);
                } else {
                    document.getElementById("link-adf-sql-public").className = "canvas-link error";
                    addLog("command", "$ telnet mydbserver.database.windows.net 1433");
                    animatePacket(packet, null, 155, 155, 490, 145, 1200 / speed, () => {
                        addLog("error", "CONNECTION REFUSED. SQL Firewall Blocked: Database allows connection only via VNet Private Endpoint interface.");
                        alertUser("SQL Public Connection Blocked!");
                    });
                }
            } else if (step === 2) {
                if (!privateDns) return;

                document.getElementById("link-adf-pep").className = "canvas-link success";
                document.getElementById("link-pep-sql").className = "canvas-link success";
                document.getElementById("pep-sql").querySelector(".canvas-node-card").classList.add("active");
                
                const sqlStatus = document.getElementById("sql-endpoint-status");

                animatePacket(packet, null, 210, 175, 490, 175, 1000 / speed, () => {
                    sqlStatus.textContent = "Secure Link Active";
                    sqlStatus.className = "node-badge success";
                    addLog("success", "Database connection established securely over private link network backbone.");
                });
            }
        }
    },

    "synapse-serverless": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: SQL client sends OPENROWSET serverless query request",
                "Step 2: Serverless Query Engine parses schema and allocates dynamic workers",
                "Step 3: Serverless workers query raw files in parallel and stream records back"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Client Console -->
                <foreignObject x="30" y="110" width="110" height="95" class="node-fo" id="syn-client">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="terminal"></i></div>
                        <div class="node-title">SSMS / Client</div>
                        <div class="node-ip" style="font-size: 8px">Query Console</div>
                    </div>
                </foreignObject>

                <!-- Synapse Serverless Control Node -->
                <foreignObject x="220" y="110" width="130" height="100" class="node-fo" id="syn-control">
                    <div class="canvas-node-card active" style="border-color: var(--color-cyan)">
                        <div class="node-title">Control Node</div>
                        <span class="node-badge primary">Serverless SQL</span>
                    </div>
                </foreignObject>

                <!-- Dynamic Worker Nodes -->
                <g id="syn-workers">
                    <foreignObject x="410" y="30" width="90" height="60" class="node-fo" id="syn-work-1">
                        <div class="canvas-node-card mini" style="border-color: var(--color-cyan)">
                            <div class="node-title" style="font-size: 9px">Worker 01</div>
                        </div>
                    </foreignObject>
                    <foreignObject x="410" y="210" width="90" height="60" class="node-fo" id="syn-work-2">
                        <div class="canvas-node-card mini" style="border-color: var(--color-cyan)">
                            <div class="node-title" style="font-size: 9px">Worker 02</div>
                        </div>
                    </foreignObject>
                </g>

                <!-- ADLS Storage parquet files -->
                <foreignObject x="540" y="110" width="100" height="100" class="node-fo" id="syn-storage">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="folder"></i></div>
                        <div class="node-title" style="font-size: 9px">ADLS Gen2</div>
                        <div class="node-ip" style="font-size: 8px">Parquet Files</div>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 140 160 L 220 160" class="canvas-link" id="link-cli-ctrl"></path>
                <path d="M 350 145 L 410 70" class="canvas-link" id="link-ctrl-w1"></path>
                <path d="M 350 175 L 410 230" class="canvas-link" id="link-ctrl-w2"></path>
                <path d="M 500 70 L 540 130" class="canvas-link" id="link-w1-st" stroke-dasharray="2,2"></path>
                <path d="M 500 230 L 540 180" class="canvas-link" id="link-w2-st" stroke-dasharray="2,2"></path>

                <!-- Packet -->
                <circle cx="140" cy="160" r="7" fill="var(--color-cyan)" class="packet hidden" id="packet-syn-serv"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Synapse Serverless SQL workspace ready. Dynamic scaling pool active.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-syn-serv");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-cli-ctrl").className = "canvas-link active";
                addLog("command", "SELECT TOP 100 * FROM OPENROWSET(BULK 'datalake/raw/orders/*.parquet', FORMAT = 'PARQUET') AS [r];");
                addLog("output", "Client: Submitting serverless SQL query to endpoint...");
                animatePacket(packet, null, 140, 160, 220, 160, 1000 / speed);
            } else if (step === 1) {
                document.getElementById("link-ctrl-w1").className = "canvas-link active";
                document.getElementById("link-ctrl-w2").className = "canvas-link active";
                document.getElementById("syn-work-1").querySelector(".canvas-node-card").classList.add("active");
                document.getElementById("syn-work-2").querySelector(".canvas-node-card").classList.add("active");

                addLog("output", "Control Node: Generating query partitions. Allocating 2 workers to read data slices...");
                animatePacket(packet, null, 350, 145, 410, 70, 800 / speed);
            } else if (step === 2) {
                document.getElementById("link-w1-st").className = "canvas-link success";
                document.getElementById("link-w2-st").className = "canvas-link success";
                document.getElementById("link-cli-ctrl").className = "canvas-link success";
                document.getElementById("syn-storage").querySelector(".canvas-node-card").classList.add("active");

                addLog("output", "Workers: Reading Parquet columns from ADLS Gen2 in parallel. Streaming response records...");

                animatePacket(packet, null, 500, 70, 540, 130, 600 / speed, () => {
                    animatePacket(packet, null, 540, 130, 140, 160, 1000 / speed, () => {
                        addLog("success", "Query successful. Retrieved 100 records in 1.25s.");
                    });
                });
            }
        }
    },

    "synapse-dedicated": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Control Node receives query and analyzes distribution model",
                "Step 2: Compute Nodes read from distributed storage nodes in parallel",
                "Step 3: Compute nodes perform Data Movement Service (DMS) shuffle if joins require partition alignment"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Control Node -->
                <foreignObject x="250" y="20" width="130" height="70" class="node-fo" id="syn-ded-ctrl">
                    <div class="canvas-node-card active" style="border-color: var(--color-violet)">
                        <div class="node-title">Control Node</div>
                        <span class="node-badge primary" style="font-size: 8px">Dedicated Pool</span>
                    </div>
                </foreignObject>

                <!-- Compute Nodes -->
                <foreignObject x="100" y="130" width="120" height="70" class="node-fo" id="syn-comp-1">
                    <div class="canvas-node-card mini" style="border-color: var(--color-cyan)">
                        <div class="node-title" style="font-size: 9px">Compute Node 01</div>
                    </div>
                </foreignObject>

                <foreignObject x="400" y="130" width="120" height="70" class="node-fo" id="syn-comp-2">
                    <div class="canvas-node-card mini" style="border-color: var(--color-cyan)">
                        <div class="node-title" style="font-size: 9px">Compute Node 02</div>
                    </div>
                </foreignObject>

                <!-- Storage Nodes (Representing 60 Distributions) -->
                <foreignObject x="40" y="250" width="110" height="60" class="node-fo" id="syn-dist-1">
                    <div class="canvas-node-card mini" style="border-color: var(--color-emerald)">
                        <div class="node-title" style="font-size: 8px">Distributions 1-30</div>
                    </div>
                </foreignObject>
                <foreignObject x="480" y="250" width="110" height="60" class="node-fo" id="syn-dist-2">
                    <div class="canvas-node-card mini" style="border-color: var(--color-emerald)">
                        <div class="node-title" style="font-size: 8px">Distributions 31-60</div>
                    </div>
                </foreignObject>

                <!-- Connections -->
                <path d="M 315 90 L 160 130" class="canvas-link" id="link-ded-c1"></path>
                <path d="M 315 90 L 460 130" class="canvas-link" id="link-ded-c2"></path>
                <path d="M 160 200 L 95 250" class="canvas-link" id="link-comp-d1"></path>
                <path d="M 460 200 L 535 250" class="canvas-link" id="link-comp-d2"></path>
                <path d="M 220 165 L 400 165" class="canvas-link" id="link-dms-shuffle" stroke-dasharray="2,2"></path>

                <!-- Packet -->
                <circle cx="315" cy="90" r="6" fill="var(--color-violet)" class="packet hidden" id="packet-syn-ded"></circle>
            `;
            lucide.createIcons();
            addLog("system", `Dedicated SQL Pool active. Distribution patterns configured: Hash/Replicated.`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-syn-ded");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                addLog("command", "SELECT c.CustomerName, SUM(o.OrderAmount) FROM Orders o JOIN Customer c ON o.CustomerID = c.CustomerID GROUP BY c.CustomerName;");
                addLog("output", "Control Node: Analyzing distribution keys... Orders is HASH-distributed on CustomerID. Customer is REPLICATED.");
                addLog("output", "Parsing query to compile steps for compute nodes...");
            } else if (step === 1) {
                document.getElementById("link-ded-c1").className = "canvas-link active";
                document.getElementById("link-ded-c2").className = "canvas-link active";
                document.getElementById("link-comp-d1").className = "canvas-link active";
                document.getElementById("link-comp-d2").className = "canvas-link active";

                addLog("output", "Compute Nodes: Initiating parallel scan on target storage distributions (30 distributions per compute)...");
                animatePacket(packet, null, 315, 90, 160, 130, 800 / speed);
            } else if (step === 2) {
                document.getElementById("link-ded-c1").className = "canvas-link success";
                document.getElementById("link-ded-c2").className = "canvas-link success";
                document.getElementById("link-dms-shuffle").className = "canvas-link success active";

                addLog("warning", "Data Movement Service (DMS): Replicated Customer table already present on all compute nodes. Join aligns locally, avoiding a full table shuffle!");
                addLog("success", "Dedicated SQL Pool aggregation completed. Results Consolidated by Control Node.");
                
                animatePacket(packet, null, 160, 165, 460, 165, 800 / speed);
            }
        }
    },

    "synapse-link": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Application writes real-time transactional rows to Cosmos DB OLTP store",
                "Step 2: Cosmos DB sync mechanism copies writes to columnar Analytical Store",
                "Step 3: Synapse analytics workspace queries Analytical Store directly via Synapse Link"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Application client -->
                <foreignObject x="30" y="110" width="110" height="95" class="node-fo" id="syn-link-app">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-title">App Client</div>
                        <span class="node-badge primary">OLTP Write</span>
                    </div>
                </foreignObject>

                <!-- Cosmos DB Container (Split OLTP / Analytical) -->
                <rect x="200" y="30" width="240" height="260" rx="10" fill="rgba(6, 182, 212, 0.02)" stroke="rgba(6, 182, 212, 0.2)" stroke-width="1.5"></rect>
                <text x="215" y="55" fill="var(--color-cyan)" font-size="10" font-weight="bold">COSMOS DB CONTAINER</text>

                <!-- OLTP Store -->
                <foreignObject x="220" y="80" width="200" height="60" class="node-fo" id="cosmos-oltp">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.06)">
                        <div class="node-title" style="font-size: 9px">Transactional Store (Row-store)</div>
                    </div>
                </foreignObject>

                <!-- Analytical Store -->
                <foreignObject x="220" y="200" width="200" height="60" class="node-fo" id="cosmos-analytics">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.06)">
                        <div class="node-title" style="font-size: 9px">Analytical Store (Columnar)</div>
                    </div>
                </foreignObject>

                <!-- Synapse Analytical SQL -->
                <foreignObject x="510" y="110" width="130" height="110" class="node-fo" id="syn-link-synapse">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-icon"><i data-lucide="cloud"></i></div>
                        <div class="node-title">Synapse Studio</div>
                        <span class="node-badge success">HTAP Analytics</span>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 140 160 L 220 110" class="canvas-link" id="link-app-oltp"></path>
                <path d="M 320 140 L 320 200" class="canvas-link" id="link-oltp-analytical" stroke-dasharray="2,2"></path>
                <path d="M 510 165 L 420 230" class="canvas-link" id="link-syn-analytical"></path>

                <!-- Packet -->
                <circle cx="140" cy="160" r="6" fill="var(--color-accent)" class="packet hidden" id="packet-syn-link"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Synapse Link analytical store integration active.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-syn-link");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-app-oltp").className = "canvas-link active";
                addLog("command", "db.orders.insertOne({ order_id: 99402, status: 'Completed', cost: 120.5 });");
                addLog("output", "Application: Writing transactional record JSON directly to Cosmos DB Row Store.");
                animatePacket(packet, null, 140, 160, 220, 110, 1000 / speed);
            } else if (step === 1) {
                document.getElementById("link-oltp-analytical").className = "canvas-link active";
                document.getElementById("cosmos-analytics").querySelector(".canvas-node-card").classList.add("active");
                
                addLog("output", "Cosmos DB Sync: Automatically converting transactional row structure to columnar format in the analytical store...");
                animatePacket(packet, null, 320, 140, 320, 200, 800 / speed);
            } else if (step === 2) {
                document.getElementById("link-syn-analytical").className = "canvas-link success";
                document.getElementById("syn-link-synapse").querySelector(".canvas-node-card").classList.add("active");

                addLog("command", "SELECT * FROM OPENROWSET(PROVIDER = 'CosmosDB', CONNECTION = '...', OBJECT = 'orders') AS [o];");
                addLog("output", "Synapse SQL: Querying analytical columnar store... Zero impact on transactional OLTP workload!");
                
                animatePacket(packet, null, 510, 165, 420, 230, 1000 / speed, () => {
                    addLog("success", "HTAP analytical retrieval succeeded in 82ms.");
                });
            }
        }
    },

    "databricks-delta-lake": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Spark writer starts transaction write on Delta table",
                "Step 2: Commit metadata entry appended to Delta transaction log (_delta_log/)",
                "Step 3: Reader queries specific table version via transaction log Time Travel"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Spark Writer -->
                <foreignObject x="30" y="110" width="110" height="95" class="node-fo" id="delta-writer">
                    <div class="canvas-node-card active" style="border-color: var(--color-cyan)">
                        <div class="node-title">Spark Writer</div>
                        <span class="node-badge primary">Commit v2</span>
                    </div>
                </foreignObject>

                <!-- Delta Transaction Log -->
                <foreignObject x="250" y="30" width="150" height="90" class="node-fo" id="delta-log">
                    <div class="canvas-node-card" style="border-color: var(--color-amber)">
                        <div class="node-title">_delta_log/</div>
                        <div class="node-ip" style="font-family: JetBrains Mono; font-size: 8px">000002.json</div>
                    </div>
                </foreignObject>

                <!-- Data Storage Files -->
                <foreignObject x="250" y="210" width="150" height="90" class="node-fo" id="delta-parquet">
                    <div class="canvas-node-card">
                        <div class="node-title">Parquet Files</div>
                        <div class="node-ip" style="font-size: 8px">part-0002.parquet</div>
                    </div>
                </foreignObject>

                <!-- Spark Reader -->
                <foreignObject x="510" y="110" width="110" height="95" class="node-fo" id="delta-reader">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-title">Spark Reader</div>
                        <span class="node-badge warning">Time Travel</span>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 140 160 L 250 75" class="canvas-link" id="link-write-log"></path>
                <path d="M 140 160 L 250 255" class="canvas-link" id="link-write-parquet"></path>
                <path d="M 510 160 L 400 75" class="canvas-link" id="link-read-log"></path>
                <path d="M 510 160 L 400 255" class="canvas-link" id="link-read-parquet"></path>

                <!-- Packet -->
                <circle cx="140" cy="160" r="6" fill="var(--color-cyan)" class="packet hidden" id="packet-delta"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Delta Lake environment active on ADLS Gen2 path.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-delta");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-write-parquet").className = "canvas-link active";
                addLog("command", "df.write.format('delta').mode('overwrite').save('/data/orders')");
                addLog("output", "Spark Writer: Overwriting table records. Generating new physical Parquet part file...");
                animatePacket(packet, null, 140, 160, 250, 255, 1000 / speed);
            } else if (step === 1) {
                document.getElementById("link-write-parquet").className = "canvas-link success";
                document.getElementById("link-write-log").className = "canvas-link active";
                document.getElementById("delta-log").querySelector(".canvas-node-card").classList.add("active");

                addLog("output", "Delta Log: Appending transaction log commit entry: 000002.json...");
                addLog("success", "v2 Commit complete. Atomic write confirmed under ACID compliance rules.");
                animatePacket(packet, null, 140, 160, 250, 75, 800 / speed);
            } else if (step === 2) {
                document.getElementById("link-write-log").className = "canvas-link success";
                document.getElementById("link-read-log").className = "canvas-link active";
                document.getElementById("link-read-parquet").className = "canvas-link success";
                document.getElementById("delta-reader").querySelector(".canvas-node-card").classList.add("active");

                addLog("command", "spark.read.format('delta').option('versionAsOf', 1).load('/data/orders')");
                addLog("output", "Reader: Requesting historical snapshot version 1. Fetching log 000001.json...");
                addLog("output", "Time Travel: Directing query only to Parquet files committed in version 1. Success.");
                
                animatePacket(packet, null, 510, 160, 400, 75, 800 / speed, () => {
                    animatePacket(packet, null, 400, 255, 510, 160, 1000 / speed);
                });
            }
        }
    },

    "databricks-structured-streaming": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Spark Structured Streaming engine polls Event Hubs stream partitions",
                "Step 2: Engine commits batch offsets to the ADLS Checkpoint directory",
                "Step 3: Transformed records committed atomically to target Delta Gold tables"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Event Hubs -->
                <foreignObject x="30" y="110" width="110" height="95" class="node-fo" id="stream-hub">
                    <div class="canvas-node-card active" style="border-color: var(--color-cyan)">
                        <div class="node-title">Azure Event Hubs</div>
                        <span class="node-badge primary">IoT Stream</span>
                    </div>
                </foreignObject>

                <!-- Spark Streaming Engine -->
                <foreignObject x="240" y="110" width="140" height="110" class="node-fo" id="stream-spark">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-icon"><i data-lucide="cpu"></i></div>
                        <div class="node-title">Spark Streaming</div>
                        <div class="node-ip" style="font-size: 8px">Micro-batch processing</div>
                    </div>
                </foreignObject>

                <!-- Checkpoint Directory -->
                <foreignObject x="240" y="240" width="140" height="60" class="node-fo" id="stream-checkpoint">
                    <div class="canvas-node-card mini" style="border-color: var(--color-amber)">
                        <div class="node-title" style="font-size: 8px">Checkpoint Log</div>
                    </div>
                </foreignObject>

                <!-- Delta Gold Table -->
                <foreignObject x="510" y="110" width="110" height="95" class="node-fo" id="stream-delta-gold">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald)">
                        <div class="node-title">Delta Gold Table</div>
                        <span class="node-badge success">Materialized</span>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 140 160 L 240 160" class="canvas-link" id="link-hub-spark"></path>
                <path d="M 310 220 L 310 240" class="canvas-link" id="link-spark-cp" stroke-dasharray="2,2"></path>
                <path d="M 380 160 L 510 160" class="canvas-link" id="link-spark-gold"></path>

                <!-- Packet -->
                <circle cx="140" cy="160" r="7" fill="var(--color-cyan)" class="packet hidden" id="packet-struct-stream"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Spark Structured Streaming job listening to Event Hub namespace.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-struct-stream");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-hub-spark").className = "canvas-link active";
                addLog("command", "df = spark.readStream.format('eventhubs').options(configs).load()");
                addLog("output", "Spark: Fetching active offset records from partition logs. Batch 120 active.");
                animatePacket(packet, null, 140, 160, 240, 160, 1000 / speed);
            } else if (step === 1) {
                document.getElementById("link-hub-spark").className = "canvas-link success";
                document.getElementById("link-spark-cp").className = "canvas-link active";
                document.getElementById("stream-checkpoint").querySelector(".canvas-node-card").classList.add("active");

                addLog("output", "Checkpointing: Writing micro-batch 120 offsets to metadata write-ahead logs for fault tolerance...");
                animatePacket(packet, null, 310, 160, 310, 240, 600 / speed);
            } else if (step === 2) {
                document.getElementById("link-hub-spark").className = "canvas-link success";
                document.getElementById("link-spark-cp").className = "canvas-link success";
                document.getElementById("link-spark-gold").className = "canvas-link success";
                document.getElementById("stream-delta-gold").querySelector(".canvas-node-card").classList.add("active");

                addLog("output", "Spark Writer: Aggregating user metrics. Committing transformed batches atomically to Gold tables.");
                addLog("success", "Batch 120 successfully processed. Offsets advanced.");

                animatePacket(packet, null, 380, 160, 510, 160, 1000 / speed);
            }
        }
    },

    "databricks-photon": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: SQL query plan checked. Photon-compatible operators offloaded",
                "Step 2: Photon native execution library reads column blocks into CPU registers",
                "Step 3: Photon vectorized C++ engine executes calculation and transfers results to JVM"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- JVM Spark Driver -->
                <foreignObject x="30" y="110" width="120" height="95" class="node-fo" id="photon-jvm">
                    <div class="canvas-node-card">
                        <div class="node-title">JVM Driver</div>
                        <div class="node-ip" style="font-size: 8px">Spark Execution Plan</div>
                    </div>
                </foreignObject>

                <!-- Photon Execution Library (C++) -->
                <foreignObject x="250" y="100" width="150" height="120" class="node-fo" id="photon-engine">
                    <div class="canvas-node-card active" style="border-color: var(--color-cyan)">
                        <div class="node-icon"><i data-lucide="zap"></i></div>
                        <div class="node-title">Photon Engine</div>
                        <span class="node-badge primary">Native C++</span>
                    </div>
                </foreignObject>

                <!-- CPU registers (SIMD) -->
                <foreignObject x="510" y="110" width="110" height="95" class="node-fo" id="photon-cpu">
                    <div class="canvas-node-card" style="border-color: var(--color-amber)">
                        <div class="node-title">CPU Registers</div>
                        <div class="node-ip" style="font-size: 8px">SIMD Execution</div>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 150 160 L 250 160" class="canvas-link" id="link-jvm-photon"></path>
                <path d="M 400 160 L 510 160" class="canvas-link" id="link-photon-cpu"></path>

                <!-- Packet -->
                <circle cx="150" cy="160" r="7" fill="var(--color-cyan)" class="packet hidden" id="packet-photon"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Photon vectorization library loaded in Spark Runtime environment.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-photon");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-jvm-photon").className = "canvas-link active";
                addLog("command", "SELECT id, cost * 1.18 AS price_vat FROM db.sales;");
                addLog("output", "JVM Planner: Query compiled. Offloading aggregation and arithmetic functions to Photon native library.");
                animatePacket(packet, null, 150, 160, 250, 160, 800 / speed);
            } else if (step === 1) {
                document.getElementById("link-photon-cpu").className = "canvas-link active";
                document.getElementById("photon-cpu").querySelector(".canvas-node-card").classList.add("active");

                addLog("output", "Photon: Reading cost values in chunks directly to SIMD data buffers, avoiding JVM boxing overhead.");
                animatePacket(packet, null, 400, 160, 510, 160, 800 / speed);
            } else if (step === 2) {
                document.getElementById("link-jvm-photon").className = "canvas-link success";
                document.getElementById("link-photon-cpu").className = "canvas-link success";

                addLog("output", "Photon CPU: Executing vectorized multiplication across register columns in parallel.");
                addLog("success", "Photon calculation complete. Yielded 8.2x speedup compared to standard JVM Spark execution.");
                
                animatePacket(packet, null, 510, 160, 250, 160, 600 / speed, () => {
                    animatePacket(packet, null, 250, 160, 150, 160, 600 / speed);
                });
            }
        }
    },

    "adf-incremental-load": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Lookup activity reads the current watermark timestamp from control table",
                "Step 2: Copy activity queries source database for records added after watermark",
                "Step 3: Target ADLS loaded, and Stored Procedure activity updates control table watermark"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Source SQL Database -->
                <foreignObject x="30" y="120" width="110" height="90" class="node-fo" id="watermark-src">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="database"></i></div>
                        <div class="node-title">SQL Database</div>
                        <div class="node-ip" style="font-size: 8px">Source Records</div>
                    </div>
                </foreignObject>

                <!-- ADF Pipeline Workspace -->
                <rect x="180" y="30" width="300" height="260" rx="10" fill="rgba(59, 130, 246, 0.02)" stroke="rgba(59,130,246,0.15)" stroke-width="1.5"></rect>
                <text x="195" y="55" fill="var(--color-accent)" font-size="10" font-weight="bold">ADF INCREMENTAL LOAD</text>

                <!-- Watermark Control Table -->
                <foreignObject x="200" y="80" width="120" height="60" class="node-fo" id="watermark-table">
                    <div class="canvas-node-card mini" style="border-color: var(--color-amber)">
                        <div class="node-title" style="font-size: 9px">Watermark Table</div>
                        <div class="node-ip" style="font-size: 8px">Last: 2026-06-25</div>
                    </div>
                </foreignObject>

                <!-- Copy Activity -->
                <foreignObject x="340" y="160" width="120" height="60" class="node-fo" id="watermark-copy">
                    <div class="canvas-node-card mini" style="border-color: var(--color-cyan)">
                        <div class="node-title" style="font-size: 9px">Copy Activity</div>
                    </div>
                </foreignObject>

                <!-- Target Lakehouse -->
                <foreignObject x="520" y="120" width="110" height="90" class="node-fo" id="watermark-target">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald)">
                        <div class="node-icon"><i data-lucide="folder"></i></div>
                        <div class="node-title">ADLS Gen2</div>
                    </div>
                </foreignObject>

                <!-- Connections -->
                <path d="M 260 140 L 340 190" class="canvas-link" id="link-wm-lookup"></path>
                <path d="M 140 165 L 340 190" class="canvas-link" id="link-wm-src-copy"></path>
                <path d="M 460 190 L 520 165" class="canvas-link" id="link-wm-copy-tgt"></path>

                <!-- Packet -->
                <circle cx="260" cy="110" r="7" fill="var(--color-amber)" class="packet hidden" id="packet-wm"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Incremental loader pipeline triggered. Pipeline: Load_Incremental_Orders.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-wm");
            packet.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-wm-lookup").className = "canvas-link active";
                addLog("command", "SELECT WatermarkValue FROM Watermark_Log WHERE TableName = 'orders';");
                addLog("output", "Lookup Activity: Fetching current watermark timestamp...");
                addLog("output", "Result: Current Watermark = '2026-06-25 17:00:00'.");
                animatePacket(packet, null, 260, 110, 340, 190, 800 / speed);
            } else if (step === 1) {
                document.getElementById("link-wm-src-copy").className = "canvas-link active";
                addLog("command", "SELECT * FROM orders WHERE LastModifyTime > '2026-06-25 17:00:00';");
                addLog("output", "Copy Activity: Querying source database for changes since last sync...");
                
                animatePacket(packet, null, 140, 165, 340, 190, 1000 / speed);
            } else if (step === 2) {
                document.getElementById("link-wm-src-copy").className = "canvas-link success";
                document.getElementById("link-wm-copy-tgt").className = "canvas-link success";
                document.getElementById("watermark-target").querySelector(".canvas-node-card").classList.add("active");

                addLog("output", "Copy Activity: Uploading delta records to ADLS. Storing new watermark timestamp...");
                addLog("command", "UPDATE Watermark_Log SET WatermarkValue = '2026-06-26 10:00:00' WHERE TableName = 'orders';");
                addLog("success", "Watermark table updated. Pipeline sync succeeded.");

                animatePacket(packet, null, 340, 190, 520, 165, 1000 / speed, () => {
                    document.getElementById("watermark-table").querySelector(".node-ip").textContent = "Last: 2026-06-26";
                });
            }
        }
    }
};

window.AzureSimulations = AzureSimulations;


