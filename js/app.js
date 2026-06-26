document.addEventListener("DOMContentLoaded", () => {
    // Instantiate core simulation engine
    const simEngine = new VisualSimulationEngine();

    // Application state
    let activeDomain = "networking";
    let activeConceptId = "tcp-handshake";
    const completedConcepts = new Set(JSON.parse(localStorage.getItem("lab_completed_concepts") || "[]"));

    // DOM Elements
    const domainTabs = document.querySelectorAll(".domain-tab");
    const conceptSearch = document.getElementById("concept-search");
    const copyTerminalBtn = document.getElementById("btn-copy-terminal");
    const explanationBox = document.getElementById("explanation-box");
    const expTitle = document.getElementById("exp-title");
    const expText = document.getElementById("exp-text");
    const toolInfo = document.getElementById("tool-info");

    const sections = {
        networking: document.getElementById("networking-concepts"),
        linux: document.getElementById("linux-concepts"),
        dataeng: document.getElementById("dataeng-concepts"),
        azure: document.getElementById("azure-concepts"),
        fabric: document.getElementById("fabric-concepts"),
        frontend: document.getElementById("frontend-concepts")
    };

    // Initialize layout list
    function renderConceptsLists() {
        const totalConcepts = Object.keys(ConceptsData).reduce((sum, key) => sum + ConceptsData[key].length, 0);

        Object.keys(ConceptsData).forEach(domain => {
            const listEl = sections[domain];
            listEl.innerHTML = "";

            ConceptsData[domain].forEach((c, idx) => {
                const isCompleted = completedConcepts.has(c.id);
                const isActive = c.id === activeConceptId;
                
                const item = document.createElement("button");
                item.className = `concept-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`;
                item.setAttribute("data-id", c.id);
                item.innerHTML = `
                    <div class="concept-left">
                        <span class="concept-num">${idx + 1}</span>
                        <span class="concept-title">${c.title}</span>
                    </div>
                    <div class="concept-status-indicator" title="Mark as studied"></div>
                `;

                // Handle click on list item
                item.addEventListener("click", (e) => {
                    // Check if clicked the status circular indicator specifically
                    if (e.target.classList.contains("concept-status-indicator")) {
                        toggleConceptCompleted(c.id);
                        return;
                    }
                    selectConcept(domain, c.id);
                });

                listEl.appendChild(item);
            });
        });

        // Update overall stats
        updateOverallProgress(totalConcepts);
    }

    function toggleConceptCompleted(id) {
        if (completedConcepts.has(id)) {
            completedConcepts.delete(id);
        } else {
            completedConcepts.add(id);
        }
        localStorage.setItem("lab_completed_concepts", JSON.stringify([...completedConcepts]));
        renderConceptsLists();
    }

    function updateOverallProgress(total) {
        const pct = total > 0 ? Math.round((completedConcepts.size / total) * 100) : 0;
        document.getElementById("progress-percent").textContent = `${pct}%`;
        document.querySelector(".progress-bar-fill").style.width = `${pct}%`;
    }

    function selectConcept(domain, id) {
        activeDomain = domain;
        activeConceptId = id;

        // Sync tab buttons active state
        document.querySelectorAll(".domain-tab").forEach(tab => {
            if (tab.getAttribute("data-domain") === domain) {
                tab.classList.add("active");
            } else {
                tab.classList.remove("active");
            }
        });

        // Toggle sidebar list sections visibility based on activeDomain, unless we are searching
        const query = conceptSearch.value.toLowerCase().trim();
        if (query === "") {
            Object.keys(sections).forEach(key => {
                if (key === domain) {
                    sections[key].classList.remove("hidden");
                } else {
                    sections[key].classList.add("hidden");
                }
            });
        }

        // Update lists visual state
        document.querySelectorAll(".concept-item").forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("data-id") === id) {
                item.classList.add("active");
            }
        });

        // Update breadcrumb
        let domainLabel = "Networking";
        if (domain === "linux") domainLabel = "Linux OS";
        if (domain === "dataeng") domainLabel = "Data Engineering";
        if (domain === "azure") domainLabel = "Azure Cloud Eng";
        if (domain === "fabric") domainLabel = "Microsoft Fabric";
        if (domain === "frontend") domainLabel = "Frontend Development";
        
        document.getElementById("current-domain").textContent = domainLabel;
        const concept = ConceptsData[domain].find(c => c.id === id);
        document.getElementById("current-concept").textContent = concept.title;

        // Load explanations
        expTitle.textContent = concept.title;
        expText.textContent = concept.description;

        // Pass to engine
        simEngine.loadConcept(domain, id);
    }

    // Tab switcher
    domainTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const domain = tab.getAttribute("data-domain");
            activeDomain = domain;

            // Toggle tabs
            domainTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Toggle sidebar list sections
            Object.keys(sections).forEach(key => {
                if (key === domain) {
                    sections[key].classList.remove("hidden");
                } else {
                    sections[key].classList.add("hidden");
                }
            });

            // Auto-load first concept of that domain
            const firstConcept = ConceptsData[domain][0];
            if (firstConcept) {
                selectConcept(domain, firstConcept.id);
            }
        });
    });

    // Search filtration
    conceptSearch.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === "") {
            // Restore normal active tab visibility
            Object.keys(sections).forEach(key => {
                if (key === activeDomain) {
                    sections[key].classList.remove("hidden");
                } else {
                    sections[key].classList.add("hidden");
                }
            });
            document.querySelectorAll(".concept-item").forEach(item => {
                item.style.display = "flex";
            });
        } else {
            // Show all lists to display matched search results across domains
            Object.keys(sections).forEach(key => {
                sections[key].classList.remove("hidden");
            });
            document.querySelectorAll(".concept-item").forEach(item => {
                const title = item.querySelector(".concept-title").textContent.toLowerCase();
                if (title.includes(query)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });
        }
    });

    // Copy Terminal script to clipboard
    copyTerminalBtn.addEventListener("click", () => {
        const consoleEl = document.getElementById("terminal-console");
        const lines = Array.from(consoleEl.querySelectorAll(".terminal-line.command, .terminal-line.output"))
                           .map(el => el.textContent.replace("$", "").trim())
                           .join("\n");
        
        navigator.clipboard.writeText(lines).then(() => {
            alertUser("Terminal commands copied to clipboard!");
        });
    });

    // Info overlay toggler
    toolInfo.addEventListener("click", () => {
        toolInfo.classList.toggle("active");
        if (explanationBox.style.opacity === "0" || explanationBox.classList.contains("hidden")) {
            explanationBox.classList.remove("hidden");
            explanationBox.style.opacity = "1";
            explanationBox.style.transform = "translateY(0)";
        } else {
            explanationBox.style.opacity = "0";
            explanationBox.style.transform = "translateY(10px)";
            setTimeout(() => explanationBox.classList.add("hidden"), 300);
        }
    });

    // Drawer Tabs switching (Parameters vs CLI panel)
    document.querySelectorAll(".drawer-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".drawer-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".drawer-panel").forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            const panelId = `panel-${tab.getAttribute("data-drawer-tab")}`;
            document.getElementById(panelId).classList.add("active");
        });
    });

    // Fit view box and simple dragging mapping on SVG
    const svgEl = document.getElementById("visual-canvas");
    const stageEl = document.getElementById("canvas-stage");
    let isDragging = false;
    let startPanX = 0, startPanY = 0;
    let translateX = 0, translateY = 0;
    let scaleVal = 1;

    svgEl.addEventListener("mousedown", (e) => {
        // Only drag if select tool is enabled or clicking on background
        if (e.target === svgEl || e.target.tagName === "rect") {
            isDragging = true;
            svgEl.style.cursor = "grabbing";
            startPanX = e.clientX - translateX;
            startPanY = e.clientY - translateY;
        }
    });

    svgEl.addEventListener("mousemove", (e) => {
        if (isDragging) {
            translateX = e.clientX - startPanX;
            translateY = e.clientY - startPanY;
            stageEl.setAttribute("transform", `translate(${translateX}, ${translateY}) scale(${scaleVal})`);
        }
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
        svgEl.style.cursor = "grab";
    });

    // Zooming triggers
    document.getElementById("tool-zoom-in").addEventListener("click", () => {
        scaleVal = Math.min(scaleVal + 0.1, 2);
        stageEl.setAttribute("transform", `translate(${translateX}, ${translateY}) scale(${scaleVal})`);
    });

    document.getElementById("tool-zoom-out").addEventListener("click", () => {
        scaleVal = Math.max(scaleVal - 0.1, 0.5);
        stageEl.setAttribute("transform", `translate(${translateX}, ${translateY}) scale(${scaleVal})`);
    });

    document.getElementById("tool-fit").addEventListener("click", () => {
        scaleVal = 1;
        translateX = 0;
        translateY = 0;
        stageEl.setAttribute("transform", `translate(0, 0) scale(1)`);
    });

    // AI Chatbot logic
    const chatInput = document.getElementById("chat-user-input");
    const chatSendBtn = document.getElementById("chat-send-btn");
    const chatMessagesLog = document.getElementById("chat-messages-log");

    function addChatMessage(sender, text, isCode = false, buttonData = null) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-msg ${sender}`;
        
        const avatar = document.createElement("div");
        avatar.className = "msg-avatar";
        avatar.innerHTML = `<i data-lucide="${sender === 'system' ? 'bot' : 'user'}"></i>`;
        
        const bubble = document.createElement("div");
        bubble.className = "msg-bubble";
        
        const p = document.createElement("p");
        p.innerHTML = text;
        bubble.appendChild(p);

        if (isCode) {
            const pre = document.createElement("pre");
            pre.className = "chat-code-block";
            const code = document.createElement("code");
            code.textContent = isCode;
            pre.appendChild(code);
            bubble.appendChild(pre);
        }

        if (buttonData) {
            const btn = document.createElement("button");
            btn.className = "chat-btn-visualize";
            btn.innerHTML = `<i data-lucide="play-circle"></i> Load &amp; Visualize Lab`;
            btn.addEventListener("click", () => {
                selectConcept(buttonData.domain, buttonData.id);
                // Switch to Parameters tab so user sees execution state/controls
                document.querySelectorAll(".drawer-tab").forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".drawer-panel").forEach(p => p.classList.remove("active"));
                document.querySelector("[data-drawer-tab='parameters']").classList.add("active");
                document.getElementById("panel-parameters").classList.add("active");
                alertUser(`Loaded lab: ${buttonData.title}`);
            });
            bubble.appendChild(btn);
        }

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(bubble);
        chatMessagesLog.appendChild(msgDiv);
        lucide.createIcons();

        // Autoscroll
        chatMessagesLog.scrollTop = chatMessagesLog.scrollHeight;
    }

    function handleChatSubmit() {
        const text = chatInput.value.trim();
        if (!text) return;

        addChatMessage("user", text);
        chatInput.value = "";

        // Trigger AI reply after short delay
        setTimeout(() => {
            processChatQuery(text);
        }, 600);
    }

    if (chatSendBtn) {
        chatSendBtn.addEventListener("click", handleChatSubmit);
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleChatSubmit();
        });
    }

    function processChatQuery(query) {
        const normalized = query.toLowerCase();

        // Match concepts database
        let matchedConcept = null;
        let matchedDomain = null;

        for (const domain of Object.keys(ConceptsData)) {
            const match = ConceptsData[domain].find(c => {
                return normalized.includes(c.id) || 
                       normalized.includes(c.title.toLowerCase()) ||
                       (domain === "azure" && normalized.includes("synapse") && c.id.includes("synapse")) ||
                       (domain === "azure" && normalized.includes("databricks") && c.id.includes("databricks")) ||
                       (domain === "fabric" && normalized.includes("fabric") && c.id.includes("fabric"));
            });
            if (match) {
                matchedConcept = match;
                matchedDomain = domain;
                break;
            }
        }

        // Broad keywords fallback
        if (!matchedConcept) {
            if (normalized.includes("synapse") || normalized.includes("serverless") || normalized.includes("dedicated")) {
                matchedDomain = "azure";
                matchedConcept = ConceptsData.azure.find(c => c.id === "synapse-serverless");
            } else if (normalized.includes("databricks") || normalized.includes("delta") || normalized.includes("photon")) {
                matchedDomain = "azure";
                matchedConcept = ConceptsData.azure.find(c => c.id === "databricks-delta-lake");
            } else if (normalized.includes("adf") || normalized.includes("data factory") || normalized.includes("watermark")) {
                matchedDomain = "azure";
                matchedConcept = ConceptsData.azure.find(c => c.id === "adf-incremental-load");
            } else if (normalized.includes("onelake") || normalized.includes("shortcut") || normalized.includes("fabric")) {
                matchedDomain = "fabric";
                matchedConcept = ConceptsData.fabric.find(c => c.id === "fabric-onelake");
            } else if (normalized.includes("rendering") || normalized.includes("path") || normalized.includes("crp")) {
                matchedDomain = "frontend";
                matchedConcept = ConceptsData.frontend.find(c => c.id === "browser-rendering");
            } else if (normalized.includes("virtual dom") || normalized.includes("reconciliation") || normalized.includes("react")) {
                matchedDomain = "frontend";
                matchedConcept = ConceptsData.frontend.find(c => c.id === "virtual-dom");
            } else if (normalized.includes("box model") || normalized.includes("flexbox") || normalized.includes("padding")) {
                matchedDomain = "frontend";
                matchedConcept = ConceptsData.frontend.find(c => c.id === "css-box-model");
            } else if (normalized.includes("handshake") || normalized.includes("tls") || normalized.includes("https")) {
                matchedDomain = "networking";
                matchedConcept = ConceptsData.networking.find(c => c.id === "http-https-handshake");
            } else if (normalized.includes("cron") || normalized.includes("schedule")) {
                matchedDomain = "linux";
                matchedConcept = ConceptsData.linux.find(c => c.id === "linux-cron-jobs");
            }
        }

        if (matchedConcept) {
            let response = `I found a matching lab topic: <strong>${matchedConcept.title}</strong>.<br><br>${matchedConcept.description}`;
            addChatMessage("system", response, matchedConcept.config, {
                domain: matchedDomain,
                id: matchedConcept.id,
                title: matchedConcept.title
            });
        } else {
            // General learning response
            let helpResponse = "I'm not sure which specific lab you're looking for, but I can guide you! Try asking about:<br>" +
                "<ul>" +
                "<li><strong>Frontend Development:</strong> Type 'rendering path', 'virtual dom', or 'box model'</li>" +
                "<li><strong>Azure Data Factory:</strong> Type 'adf ir', 'adf devops', or 'watermark'</li>" +
                "<li><strong>Synapse Analytics:</strong> Type 'synapse serverless', 'synapse dedicated', or 'synapse link'</li>" +
                "<li><strong>Databricks Spark:</strong> Type 'delta lake', 'structured streaming', or 'photon'</li>" +
                "<li><strong>Microsoft Fabric:</strong> Type 'onelake shortcuts', 'direct lake', or 'fabric pipelines'</li>" +
                "<li><strong>Networking & Linux:</strong> Type 'tcp handshake', 'dns', 'tls handshake', or 'cron scheduler'</li>" +
                "</ul>" +
                "You can also use the main search box at the top left to scan matches across all domains.";
            addChatMessage("system", helpResponse);
        }
    }

    // Initialize display lists & load initial concept
    renderConceptsLists();
    selectConcept("networking", "tcp-handshake");
});

// Toast notification callback
function alertUser(msg) {
    const toast = document.createElement("div");
    toast.className = "toast success show";
    toast.textContent = msg;
    document.getElementById("toast-container").appendChild(toast);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}
