class VisualSimulationEngine {
    constructor() {
        this.stage = document.getElementById("canvas-stage");
        this.currentDomain = "networking";
        this.currentConceptId = "tcp-handshake";
        this.currentStep = -1;
        this.totalSteps = 0;
        this.speed = 1.0;
        this.isPlaying = false;
        this.playbackTimer = null;
        this.mode = "realtime"; // 'realtime' or 'simulation'

        this.simulations = {
            networking: NetworkingSimulations,
            linux: LinuxSimulations,
            dataeng: DataEngSimulations,
            azure: AzureSimulations,
            fabric: FabricSimulations,
            frontend: FrontendSimulations
        };

        // Cache parameters per concept
        this.parameters = {};

        this.initEventListeners();
    }

    initEventListeners() {
        // Player buttons
        document.getElementById("ctrl-play").addEventListener("click", () => this.togglePlayback());
        document.getElementById("ctrl-reset").addEventListener("click", () => this.resetSimulation());
        document.getElementById("ctrl-next").addEventListener("click", () => this.stepForward());
        document.getElementById("ctrl-prev").addEventListener("click", () => this.stepBackward());

        // Mode switch
        document.getElementById("mode-realtime").addEventListener("click", () => this.setMode("realtime"));
        document.getElementById("mode-simulation").addEventListener("click", () => this.setMode("simulation"));

        // Speed slider
        const speedSlider = document.getElementById("sim-speed");
        speedSlider.addEventListener("input", (e) => {
            this.speed = parseFloat(e.target.value);
            document.getElementById("speed-val").textContent = `${this.speed.toFixed(1)}x`;
            if (this.isPlaying) {
                // Restart playback timer with new interval
                this.pause();
                this.play();
            }
        });
    }

    setMode(newMode) {
        this.mode = newMode;
        const btnRealtime = document.getElementById("mode-realtime");
        const btnSimulation = document.getElementById("mode-simulation");

        btnRealtime.classList.remove("active");
        btnSimulation.classList.remove("active");

        if (newMode === "realtime") {
            btnRealtime.classList.add("active");
            // Disable manual step controls, enable autoplay loop
            document.getElementById("ctrl-prev").setAttribute("disabled", "true");
            document.getElementById("ctrl-next").setAttribute("disabled", "true");
            this.play();
        } else {
            btnSimulation.classList.add("active");
            // Enable manual controls
            document.getElementById("ctrl-prev").removeAttribute("disabled");
            document.getElementById("ctrl-next").removeAttribute("disabled");
            this.pause();
        }
        this.updatePlayerButtons();
    }

    getSimulationModule(domain, conceptId) {
        if (!this.simulations[domain]) return null;
        return this.simulations[domain][conceptId] || this.simulations[domain]["default"];
    }

    loadConcept(domain, conceptId) {
        this.currentDomain = domain;
        this.currentConceptId = conceptId;
        this.currentStep = -1;
        this.isPlaying = false;
        
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }

        const domainData = ConceptsData[domain];
        const concept = domainData.find(c => c.id === conceptId);
        const simModule = this.getSimulationModule(domain, conceptId);

        if (!concept || !simModule) {
            console.error("Concept or Simulation Module not found", domain, conceptId);
            return;
        }

        this.totalSteps = simModule.totalSteps;

        // Clear terminal & logs
        this.clearTerminal();
        concept.cli.forEach(line => {
            if (line.startsWith("$")) {
                this.writeTerminalLine(line.substring(2), "command");
            } else if (line.startsWith("//")) {
                this.writeTerminalLine(line, "comment");
            } else {
                this.writeTerminalLine(line, "output");
            }
        });

        // Set Reference config
        document.getElementById("config-code-block").textContent = concept.config;

        // Render Parameters Form
        this.renderParameters(concept);

        // Call Module Setup
        this.stage.innerHTML = "";
        simModule.setup(this.stage, this.getCurrentParameters(), (type, text) => {
            this.writeTerminalLine(text, type);
        });

        // Reset execution indicators
        this.updateStatusText("Idle");
        this.updateStepDisplay(0, this.totalSteps);
        
        // Load default execution based on current mode
        if (this.mode === "realtime") {
            setTimeout(() => this.play(), 200);
        } else {
            this.updatePlayerButtons();
        }
    }

    renderParameters(concept) {
        const container = document.getElementById("parameters-form");
        container.innerHTML = "";

        if (!concept.parameters || concept.parameters.length === 0) {
            container.innerHTML = '<p class="empty-params">No configurable parameters for this concept. <br><br><span style="color: var(--color-cyan)">Tip:</span> Switch to the <strong>CLI & Code</strong> tab to view code syntax.</p>';
            return;
        }

        concept.parameters.forEach(p => {
            const group = document.createElement("div");
            
            if (p.type === "select") {
                group.className = "param-group";
                group.innerHTML = `
                    <label for="param-${p.id}">${p.label}</label>
                    <select id="param-${p.id}">
                        ${p.options.map(opt => `<option value="${opt}" ${opt === p.default ? 'selected' : ''}>${opt}</option>`).join("")}
                    </select>
                `;
                // Add event listener to auto-reload simulation on parameter change
                group.querySelector("select").addEventListener("change", () => {
                    this.resetSimulation();
                });
            } else if (p.type === "toggle") {
                group.className = "param-toggle";
                group.innerHTML = `
                    <div class="switch-label">
                        <span>${p.label}</span>
                        <span class="desc">${p.desc || ""}</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="param-${p.id}" ${p.default ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                `;
                group.querySelector("input").addEventListener("change", () => {
                    this.resetSimulation();
                });
            } else if (p.type === "number") {
                group.className = "param-group";
                group.innerHTML = `
                    <label for="param-${p.id}">${p.label}</label>
                    <input type="text" id="param-${p.id}" value="${p.default}" min="${p.min}" max="${p.max}">
                `;
                group.querySelector("input").addEventListener("change", () => {
                    this.resetSimulation();
                });
            }

            container.appendChild(group);
        });
    }

    getCurrentParameters() {
        const params = {};
        const concept = ConceptsData[this.currentDomain].find(c => c.id === this.currentConceptId);
        if (!concept || !concept.parameters) return params;

        concept.parameters.forEach(p => {
            const input = document.getElementById(`param-${p.id}`);
            if (input) {
                if (p.type === "toggle") {
                    params[p.id] = input.checked;
                } else if (p.type === "number") {
                    params[p.id] = parseInt(input.value) || p.default;
                } else {
                    params[p.id] = input.value;
                }
            }
        });
        return params;
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.updatePlayerButtons();
        this.updateStatusText("Running");

        // If completed or not started, start from beginning
        if (this.currentStep >= this.totalSteps - 1 || this.currentStep === -1) {
            this.resetSimulationStageOnly();
        }

        const intervalMs = 2500 / this.speed;

        // Run first step immediately if just starting
        if (this.currentStep === -1) {
            this.stepForward();
        }

        this.playbackTimer = setInterval(() => {
            if (this.currentStep < this.totalSteps - 1) {
                this.stepForward();
            } else {
                if (this.mode === "realtime") {
                    // Loop around in real time mode
                    setTimeout(() => {
                        this.resetSimulationStageOnly();
                        this.stepForward();
                    }, 1200);
                } else {
                    this.pause();
                    this.updateStatusText("Completed");
                }
            }
        }, intervalMs);
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
        this.updatePlayerButtons();
        this.updateStatusText("Paused");
    }

    resetSimulation() {
        this.pause();
        const simModule = this.getSimulationModule(this.currentDomain, this.currentConceptId);
        this.clearTerminal();

        const concept = ConceptsData[this.currentDomain].find(c => c.id === this.currentConceptId);
        concept.cli.forEach(line => {
            if (line.startsWith("$")) {
                this.writeTerminalLine(line.substring(2), "command");
            } else if (line.startsWith("//")) {
                this.writeTerminalLine(line, "comment");
            } else {
                this.writeTerminalLine(line, "output");
            }
        });

        this.stage.innerHTML = "";
        simModule.setup(this.stage, this.getCurrentParameters(), (type, text) => {
            this.writeTerminalLine(text, type);
        });

        this.currentStep = -1;
        this.updateStepDisplay(0, this.totalSteps);
        this.updateStatusText("Idle");

        if (this.mode === "realtime") {
            setTimeout(() => this.play(), 200);
        }
    }

    resetSimulationStageOnly() {
        const simModule = this.getSimulationModule(this.currentDomain, this.currentConceptId);
        this.stage.innerHTML = "";
        simModule.setup(this.stage, this.getCurrentParameters(), () => {});
        this.currentStep = -1;
        this.updateStepDisplay(0, this.totalSteps);
    }

    stepForward() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.executeCurrentStep();
        }
    }

    stepBackward() {
        if (this.currentStep > 0) {
            this.currentStep--;
            // Since SVG state changes might not be perfectly reversible, we reset stage and catch up
            const targetStep = this.currentStep;
            this.resetSimulationStageOnly();
            
            // Fast catch up
            for (let i = 0; i <= targetStep; i++) {
                this.currentStep = i;
                this.executeCurrentStep(true); // pass skipAnimation=true if supported or just run fast
            }
        }
    }

    executeCurrentStep(fastCatchup = false) {
        const simModule = this.getSimulationModule(this.currentDomain, this.currentConceptId);
        const stepLabel = simModule.getStepLabel(this.currentStep);
        
        // Log step title in console
        this.writeTerminalLine(`\n-- ${stepLabel} --`, "comment");

        // Run step log callback
        simModule.executeStep(
            this.stage, 
            this.currentStep, 
            this.getCurrentParameters(), 
            (type, text) => this.writeTerminalLine(text, type),
            fastCatchup ? 10 : this.speed
        );

        this.updateStepDisplay(this.currentStep + 1, this.totalSteps);
    }

    // Helper updates UI
    updatePlayerButtons() {
        const playIcon = document.getElementById("play-icon");
        if (this.isPlaying) {
            playIcon.setAttribute("data-lucide", "pause");
        } else {
            playIcon.setAttribute("data-lucide", "play");
        }
        lucide.createIcons();
    }

    updateStatusText(txt) {
        const indicator = document.getElementById("sim-status-text");
        indicator.textContent = txt;
        
        indicator.className = "val status-indicator";
        if (txt === "Running") indicator.classList.add("running");
        else if (txt === "Paused") indicator.classList.add("paused");
        else if (txt === "Completed") indicator.classList.add("completed");
        else if (txt === "Failed") indicator.classList.add("failed");
    }

    updateStepDisplay(current, total) {
        document.getElementById("sim-step-text").textContent = `${current} / ${total}`;
        
        const pct = total > 0 ? (current / total) * 100 : 0;
        document.getElementById("sim-progress-bar").style.width = `${pct}%`;
    }

    clearTerminal() {
        document.getElementById("terminal-console").innerHTML = "";
    }

    writeTerminalLine(text, type = "output") {
        const consoleEl = document.getElementById("terminal-console");
        const line = document.createElement("div");
        line.className = `terminal-line ${type}`;

        if (type === "command") {
            line.innerHTML = `<span class="prompt">$</span> ${text}`;
        } else if (type === "comment") {
            line.textContent = text;
            line.style.color = "var(--color-text-muted)";
        } else {
            line.textContent = text;
        }

        consoleEl.appendChild(line);
        // Autoscroll
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }
}
