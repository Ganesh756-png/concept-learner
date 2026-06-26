const FrontendSimulations = {
    "browser-rendering": {
        totalSteps: 4,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: HTML parser constructs the Document Object Model (DOM) Tree",
                "Step 2: CSS parser builds the CSS Object Model (CSSOM) Tree",
                "Step 3: Combine DOM and CSSOM trees into the Render Tree",
                "Step 4: Layout geometry calculated & pixels Painted onto browser viewport"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            // Check params
            const isCssAsync = params.css_blocking === "Asynchronous/Inlined";
            const isJsDeferred = params.js_execution === "Async / Deferred";

            stage.innerHTML = `
                <!-- HTML Document (Source) -->
                <foreignObject x="20" y="90" width="100" height="90" class="node-fo" id="crp-html">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="file-code"></i></div>
                        <div class="node-title">index.html</div>
                        <div class="node-ip" style="font-size: 8px">HTML Source</div>
                    </div>
                </foreignObject>

                <!-- DOM Tree container -->
                <rect x="180" y="20" width="140" height="260" rx="8" fill="rgba(6, 182, 212, 0.02)" stroke="rgba(6, 182, 212, 0.15)" stroke-width="1.5"></rect>
                <text x="195" y="40" fill="var(--color-cyan)" font-size="9" font-weight="bold">DOM TREE</text>
                
                <!-- DOM Nodes -->
                <g id="crp-dom-nodes" opacity="0.4">
                    <circle cx="250" cy="70" r="14" fill="var(--color-bg-card)" stroke="var(--color-cyan)" stroke-width="1.5"></circle>
                    <text x="250" y="73" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">html</text>

                    <circle cx="215" cy="130" r="14" fill="var(--color-bg-card)" stroke="var(--color-cyan)" stroke-width="1.5"></circle>
                    <text x="215" y="133" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">head</text>

                    <circle cx="285" cy="130" r="14" fill="var(--color-bg-card)" stroke="var(--color-cyan)" stroke-width="1.5"></circle>
                    <text x="285" y="133" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">body</text>

                    <circle cx="285" cy="190" r="14" fill="var(--color-bg-card)" stroke="var(--color-cyan)" stroke-width="1.5"></circle>
                    <text x="285" y="193" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">div#app</text>

                    <line x1="240" y1="82" x2="225" y2="118" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                    <line x1="260" y1="82" x2="275" y2="118" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                    <line x1="285" y1="144" x2="285" y2="176" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                </g>

                <!-- CSSOM Tree container -->
                <rect x="360" y="20" width="130" height="150" rx="8" fill="rgba(139, 92, 246, 0.02)" stroke="rgba(139, 92, 246, 0.15)" stroke-width="1.5"></rect>
                <text x="375" y="40" fill="var(--color-violet)" font-size="9" font-weight="bold">CSSOM TREE</text>

                <!-- CSSOM Nodes -->
                <g id="crp-cssom-nodes" opacity="0.4">
                    <circle cx="425" cy="70" r="14" fill="var(--color-bg-card)" stroke="var(--color-violet)" stroke-width="1.5"></circle>
                    <text x="425" y="73" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">body</text>

                    <circle cx="425" cy="130" r="14" fill="var(--color-bg-card)" stroke="var(--color-violet)" stroke-width="1.5"></circle>
                    <text x="425" y="133" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">div</text>

                    <line x1="425" y1="84" x2="425" y2="116" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                </g>

                <!-- Viewport Container (Right) -->
                <rect x="520" y="40" width="130" height="210" rx="8" fill="rgba(0, 0, 0, 0.4)" stroke="rgba(255,255,255,0.08)" stroke-width="2"></rect>
                <rect x="520" y="40" width="130" height="22" rx="8" fill="rgba(255, 255, 255, 0.04)" stroke="none"></rect>
                <!-- Browser window buttons -->
                <circle cx="530" cy="51" r="3.5" fill="var(--color-rose)"></circle>
                <circle cx="540" cy="51" r="3.5" fill="var(--color-amber)"></circle>
                <circle cx="550" cy="51" r="3.5" fill="var(--color-emerald)"></circle>
                <text x="585" y="54" fill="var(--color-text-muted)" font-size="7" font-weight="bold" text-anchor="middle" font-family="var(--font-mono)">localhost</text>

                <!-- Render viewport canvas screen -->
                <g id="viewport-screen" opacity="0.2">
                    <rect x="532" y="75" width="106" height="160" rx="4" fill="var(--color-bg-card)" stroke="none"></rect>
                    <!-- Simulated content header -->
                    <rect x="542" y="85" width="86" height="15" rx="2" fill="rgba(255,255,255,0.05)"></rect>
                    <!-- Simulated text lines -->
                    <line x1="542" y1="112" x2="628" y2="112" stroke="rgba(255,255,255,0.1)" stroke-width="3"></line>
                    <line x1="542" y1="120" x2="610" y2="120" stroke="rgba(255,255,255,0.1)" stroke-width="3"></line>
                    <!-- Simulated card box -->
                    <rect x="542" y="135" width="86" height="85" rx="3" id="viewport-card" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"></rect>
                    <text x="585" y="180" fill="rgba(255,255,255,0.15)" font-size="8" text-anchor="middle" id="viewport-painted-text" font-weight="bold">No Paint Yet</text>
                </g>

                <!-- Connecting links -->
                <path d="M 120 135 L 180 135" class="canvas-link" id="link-html-dom"></path>
                <path d="M 120 135 L 360 90" class="canvas-link" id="link-html-cssom" stroke-dasharray="2,2"></path>
                
                <!-- Combined render tree links -->
                <path d="M 320 150 L 520 150" class="canvas-link" id="link-render-tree"></path>

                <!-- Animating Packets -->
                <circle cx="120" cy="135" r="5" fill="var(--color-cyan)" class="packet hidden" id="packet-crp-dom"></circle>
                <circle cx="120" cy="135" r="5" fill="var(--color-violet)" class="packet hidden" id="packet-crp-cssom"></circle>
            `;
            lucide.createIcons();
            
            // Initial log helper
            addLog("system", `Critical Rendering Path Workspace initialized. Strategy configuration:
 - CSS Style: ${params.css_blocking}
 - JS Load: ${params.js_execution}`);

            if (isCssAsync) {
                addLog("success", "Preloaded CSS triggers early DOM rendering without block!");
            } else {
                addLog("warning", "Render-blocking CSS in <head> blocks paint until CSSOM is ready.");
            }
            if (isJsDeferred) {
                addLog("success", "Deferred scripts allow continuous HTML parsing and fast layout.");
            }
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const pDom = document.getElementById("packet-crp-dom");
            const pCssom = document.getElementById("packet-crp-cssom");
            pDom.classList.add("hidden");
            pCssom.classList.add("hidden");

            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            const domNodes = document.getElementById("crp-dom-nodes");
            const cssomNodes = document.getElementById("crp-cssom-nodes");
            const viewportScreen = document.getElementById("viewport-screen");

            if (step === 0) {
                // Step 1: Parse HTML -> DOM
                document.getElementById("link-html-dom").className = "canvas-link active";
                domNodes.setAttribute("opacity", "0.4");
                cssomNodes.setAttribute("opacity", "0.4");
                viewportScreen.setAttribute("opacity", "0.2");

                addLog("command", "$ [HTML Parser] Stream parsing index.html bytes...");
                addLog("output", "Tokenizing HTML structure tags: html, head, body, div");
                
                animatePacket(pDom, null, 120, 135, 180, 135, 1000 / speed, () => {
                    domNodes.setAttribute("opacity", "1");
                    document.getElementById("link-html-dom").className = "canvas-link success";
                    addLog("success", "Document Object Model (DOM) Tree successfully constructed!");
                });
            } else if (step === 1) {
                // Step 2: Parse CSS -> CSSOM
                document.getElementById("link-html-cssom").className = "canvas-link active";
                domNodes.setAttribute("opacity", "1");
                cssomNodes.setAttribute("opacity", "0.4");

                addLog("command", "$ [CSS Parser] Fetching external style resource styles.css...");
                if (params.css_blocking === "Render-Blocking") {
                    addLog("warning", "Browser parser blocks DOM layout updates while downloading CSS rules.");
                } else {
                    addLog("success", "CSS rules non-blocking. Parsing layout rules in parallel.");
                }

                animatePacket(pCssom, null, 120, 135, 360, 90, 1000 / speed, () => {
                    cssomNodes.setAttribute("opacity", "1");
                    document.getElementById("link-html-cssom").className = "canvas-link success";
                    addLog("success", "CSS Object Model (CSSOM) Tree computed successfully!");
                });
            } else if (step === 2) {
                // Step 3: Combine DOM & CSSOM -> Render Tree
                domNodes.setAttribute("opacity", "1");
                cssomNodes.setAttribute("opacity", "1");
                viewportScreen.setAttribute("opacity", "0.2");
                
                addLog("output", "Reconciliation Engine: Aligning active elements from DOM with CSS rules...");
                addLog("output", "Excluding script, meta, link, and non-rendered nodes (display: none)...");
                
                // Highlight nodes during merge
                domNodes.querySelectorAll("circle").forEach(c => c.setAttribute("fill", "rgba(6, 182, 212, 0.25)"));
                cssomNodes.querySelectorAll("circle").forEach(c => c.setAttribute("fill", "rgba(139, 92, 246, 0.25)"));

                setTimeout(() => {
                    domNodes.querySelectorAll("circle").forEach(c => c.setAttribute("fill", "var(--color-bg-card)"));
                    cssomNodes.querySelectorAll("circle").forEach(c => c.setAttribute("fill", "var(--color-bg-card)"));
                    addLog("success", "Render Tree constructed successfully with active nodes.");
                }, 1000 / speed);
            } else if (step === 3) {
                // Step 4: Layout & Paint
                document.getElementById("link-render-tree").className = "canvas-link active";
                
                addLog("command", "[Layout Engine] Calculating box dimensions, font sizes and coordinates...");
                addLog("output", "Reflow coordinates generated. Rasterizing page content layers...");

                animatePacket(pDom, null, 320, 150, 520, 150, 1200 / speed, () => {
                    document.getElementById("link-render-tree").className = "canvas-link success";
                    
                    // Flash viewport and draw card
                    viewportScreen.setAttribute("opacity", "1");
                    const vCard = document.getElementById("viewport-card");
                    vCard.setAttribute("fill", "var(--color-cyan)");
                    vCard.setAttribute("stroke", "var(--color-accent)");
                    vCard.style.filter = "drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))";
                    
                    const paintText = document.getElementById("viewport-painted-text");
                    paintText.textContent = "Painted!";
                    paintText.setAttribute("fill", "var(--color-text-primary)");

                    addLog("success", "Paint complete! Viewport repainted successfully. First Contentful Paint: 240ms.");
                });
            }
        }
    },

    "virtual-dom": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: State changed, React schedules Counter component for re-rendering",
                "Step 2: Reconciliation engine compares previous vs new Virtual DOM trees",
                "Step 3: React patches only the modified text node in the Real Browser DOM"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Trigger Panel (Left) -->
                <foreignObject x="20" y="80" width="130" height="110" class="node-fo" id="vdom-trigger-panel">
                    <div class="canvas-node-card active" style="border-color: var(--color-amber)">
                        <div class="node-title">Component UI</div>
                        <button id="vdom-mock-btn" style="margin-top:12px; background:var(--color-amber); border:none; padding:6px 10px; font-size:8px; border-radius:4px; font-weight:bold; color:var(--color-bg-base); cursor:pointer">
                            count: <span id="vdom-btn-val">0</span>
                        </button>
                        <div class="node-ip" style="font-size: 7px; margin-top:6px">State Change Trigger</div>
                    </div>
                </foreignObject>

                <!-- Virtual DOM Tree (Center) -->
                <rect x="200" y="20" width="190" height="260" rx="8" fill="rgba(6, 182, 212, 0.01)" stroke="rgba(6, 182, 212, 0.15)" stroke-width="1.5"></rect>
                <text x="215" y="40" fill="var(--color-cyan)" font-size="9" font-weight="bold">VIRTUAL DOM (REPLAY)</text>

                <!-- Virtual DOM Nodes -->
                <g id="vdom-virtual-nodes">
                    <circle cx="295" cy="70" r="14" fill="var(--color-bg-card)" stroke="var(--color-cyan)" stroke-width="1.5" id="v-node-root"></circle>
                    <text x="295" y="73" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">div</text>

                    <circle cx="260" cy="130" r="14" fill="var(--color-bg-card)" stroke="var(--color-cyan)" stroke-width="1.5" id="v-node-p"></circle>
                    <text x="260" y="133" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">p</text>

                    <circle cx="330" cy="130" r="14" fill="var(--color-bg-card)" stroke="var(--color-cyan)" stroke-width="1.5" id="v-node-btn"></circle>
                    <text x="330" y="133" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">button</text>

                    <circle cx="260" cy="190" r="14" fill="var(--color-bg-card)" stroke="var(--color-cyan)" stroke-width="1.5" id="v-node-span"></circle>
                    <text x="260" y="193" fill="var(--color-cyan)" font-size="8" text-anchor="middle" font-family="var(--font-mono)" font-weight="bold" id="v-span-val">0</text>

                    <line x1="285" y1="82" x2="270" y2="118" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                    <line x1="305" y1="82" x2="320" y2="118" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                    <line x1="260" y1="144" x2="260" y2="176" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                </g>

                <!-- Real Browser DOM Tree (Right) -->
                <rect x="440" y="20" width="190" height="260" rx="8" fill="rgba(16, 185, 129, 0.01)" stroke="rgba(16, 185, 129, 0.15)" stroke-width="1.5"></rect>
                <text x="455" y="40" fill="var(--color-emerald)" font-size="9" font-weight="bold">REAL BROWSER DOM</text>

                <!-- Real DOM Nodes -->
                <g id="vdom-real-nodes">
                    <circle cx="535" cy="70" r="14" fill="var(--color-bg-card)" stroke="var(--color-emerald)" stroke-width="1.5"></circle>
                    <text x="535" y="73" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">div</text>

                    <circle cx="500" cy="130" r="14" fill="var(--color-bg-card)" stroke="var(--color-emerald)" stroke-width="1.5"></circle>
                    <text x="500" y="133" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">p</text>

                    <circle cx="570" cy="130" r="14" fill="var(--color-bg-card)" stroke="var(--color-emerald)" stroke-width="1.5"></circle>
                    <text x="570" y="133" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-family="var(--font-mono)">button</text>

                    <circle cx="500" cy="190" r="14" fill="var(--color-bg-card)" stroke="var(--color-emerald)" stroke-width="1.5" id="r-node-span"></circle>
                    <text x="500" y="193" fill="var(--color-emerald)" font-size="8" text-anchor="middle" font-family="var(--font-mono)" font-weight="bold" id="r-span-val">0</text>

                    <line x1="525" y1="82" x2="510" y2="118" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                    <line x1="545" y1="82" x2="560" y2="118" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                    <line x1="500" y1="144" x2="500" y2="176" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></line>
                </g>

                <!-- Action paths -->
                <path d="M 150 135 L 200 135" class="canvas-link" id="link-trigger-vdom"></path>
                <path d="M 390 135 L 440 135" class="canvas-link" id="link-vdom-rdom"></path>

                <!-- Pulse Packet -->
                <circle cx="150" cy="135" r="6" fill="var(--color-amber)" class="packet hidden" id="packet-vdom-pulse"></circle>
            `;
            
            // Add interactivity to mock button inside setup!
            const mockBtn = document.getElementById("vdom-mock-btn");
            if (mockBtn) {
                mockBtn.addEventListener("click", () => {
                    const btnVal = document.getElementById("vdom-btn-val");
                    let cur = parseInt(btnVal.textContent) || 0;
                    cur++;
                    btnVal.textContent = cur;
                    addLog("output", `Interactive Click! Component state scheduled to increment to: ${cur}`);
                });
            }

            addLog("system", "Reconciliation environment initialized. Virtual DOM model registered.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-vdom-pulse");
            packet.classList.add("hidden");

            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            const vSpan = document.getElementById("v-node-span");
            const rSpan = document.getElementById("r-node-span");
            
            vSpan.setAttribute("stroke", "var(--color-cyan)");
            vSpan.setAttribute("fill", "var(--color-bg-card)");
            rSpan.setAttribute("stroke", "var(--color-emerald)");
            rSpan.setAttribute("fill", "var(--color-bg-card)");

            if (step === 0) {
                // Step 1: Trigger State Change
                document.getElementById("link-trigger-vdom").className = "canvas-link active";
                
                // Show counter update in trigger card
                const btnVal = document.getElementById("vdom-btn-val");
                btnVal.textContent = "1";

                addLog("command", "Counter.setCount(1) // Scheduling state re-render");
                addLog("output", "React: Queued reconciliation ticket in fiber scheduler queue.");
                
                animatePacket(packet, null, 150, 135, 200, 135, 1000 / speed, () => {
                    document.getElementById("link-trigger-vdom").className = "canvas-link success";
                    addLog("success", "Re-render initiated. Rendering new Virtual DOM state tree.");
                });
            } else if (step === 1) {
                // Step 2: Compare trees
                addLog("output", "Reconciler: Comparing previous Virtual DOM tree with newly rendered tree...");
                
                // Highlight reconciliation comparison
                vSpan.setAttribute("stroke", "var(--color-amber)");
                vSpan.setAttribute("fill", "rgba(245, 158, 11, 0.1)");
                
                const virtualSpanVal = document.getElementById("v-span-val");
                virtualSpanVal.textContent = "1";
                
                addLog("warning", "Diff Found: Node span.count value modified: 0 -> 1");
                addLog("output", "React reconciler creates minimal edit instruction (Patch).");
            } else if (step === 2) {
                // Step 3: Patch Real DOM
                document.getElementById("link-vdom-rdom").className = "canvas-link active";
                addLog("command", "ReactDOM.flushSync() // Applying layout patches");

                if (params.render_mode === "Traditional (Full Reload)") {
                    addLog("warning", "Alert: Traditional reload style updates all 12 container elements recursively.");
                } else {
                    addLog("success", "React Reconciliation optimization: only 1 DOM node scheduled for patch.");
                }

                animatePacket(packet, null, 390, 135, 440, 135, 1000 / speed, () => {
                    document.getElementById("link-vdom-rdom").className = "canvas-link success";
                    
                    // Mutate Real DOM Node
                    const realSpanVal = document.getElementById("r-span-val");
                    realSpanVal.textContent = "1";
                    
                    rSpan.setAttribute("stroke", "var(--color-emerald)");
                    rSpan.setAttribute("fill", "rgba(16, 185, 129, 0.25)");
                    
                    setTimeout(() => {
                        rSpan.setAttribute("fill", "var(--color-bg-card)");
                    }, 500);

                    addLog("success", "DOM Patch finished! Browser layout engine painted 1 updated text node.");
                });
            }
        }
    },

    "css-box-model": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Parent Flexbox Container loads and sets flex alignment properties",
                "Step 2: Flex Items align dynamically according to main axis parameters",
                "Step 3: Inspect active element Box Model (Content, Padding, Border, Margin)"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            const dir = params.flex_direction || "row";
            const jc = params.justify_content || "space-between";
            const padVal = params.box_padding || "20px";

            stage.innerHTML = `
                <!-- Flexbox Parent Container boundaries -->
                <rect x="30" y="20" width="360" height="260" rx="10" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2" id="flex-parent-container"></rect>
                <text x="45" y="40" fill="var(--color-text-secondary)" font-size="8" font-weight="bold">FLEX CONTAINER (.flex-container)</text>

                <!-- Dynamic Flex Items (we will change coordinates inside executeStep) -->
                <g id="flex-items-group">
                    <g id="flex-item-1" class="canvas-node">
                        <rect x="50" y="70" width="80" height="60" rx="6" fill="var(--color-bg-card)" stroke="var(--color-accent)" stroke-width="1.5"></rect>
                        <text x="90" y="105" fill="var(--color-text-primary)" font-size="9" text-anchor="middle" font-family="var(--font-mono)">Item 1</text>
                    </g>
                    <g id="flex-item-2" class="canvas-node">
                        <rect x="170" y="70" width="80" height="60" rx="6" fill="var(--color-bg-card)" stroke="var(--color-accent)" stroke-width="1.5"></rect>
                        <text x="210" y="105" fill="var(--color-text-primary)" font-size="9" text-anchor="middle" font-family="var(--font-mono)">Item 2</text>
                    </g>
                    <g id="flex-item-3" class="canvas-node">
                        <rect x="290" y="70" width="80" height="60" rx="6" fill="var(--color-bg-card)" stroke="var(--color-accent)" stroke-width="1.5"></rect>
                        <text x="330" y="105" fill="var(--color-text-primary)" font-size="9" text-anchor="middle" font-family="var(--font-mono)">Item 3</text>
                    </g>
                </g>

                <!-- Box Model Details (Right Side) -->
                <g id="box-model-details" opacity="0.3">
                    <rect x="420" y="20" width="220" height="260" rx="8" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"></rect>
                    <text x="435" y="40" fill="var(--color-text-primary)" font-size="9" font-weight="bold">BOX MODEL (.flex-item)</text>

                    <!-- Margin (Amber) -->
                    <rect x="440" y="70" width="180" height="180" class="box-model-margin"></rect>
                    <text x="450" y="85" fill="var(--color-amber)" font-size="7" font-weight="bold">MARGIN</text>

                    <!-- Border (Blue) -->
                    <rect x="460" y="95" width="140" height="130" class="box-model-border"></rect>
                    <text x="470" y="108" fill="var(--color-accent)" font-size="7" font-weight="bold">BORDER</text>

                    <!-- Padding (Green) -->
                    <rect x="480" y="115" width="100" height="90" class="box-model-padding"></rect>
                    <text x="490" y="128" fill="var(--color-emerald)" font-size="7" font-weight="bold">PADDING</text>

                    <!-- Content (Cyan) -->
                    <rect x="500" y="135" width="60" height="50" class="box-model-content"></rect>
                    <text x="530" y="163" fill="var(--color-cyan)" font-size="7" font-weight="bold" text-anchor="middle">CONTENT</text>

                    <!-- Spacers Labels -->
                    <text x="530" y="80" class="box-model-text">margin: 15px</text>
                    <text x="530" y="123" class="box-model-text" id="box-pad-label">padding: 20px</text>
                    <text x="530" y="103" class="box-model-text" style="fill:var(--color-accent)">border: 2px</text>
                </g>
            `;

            // Adjust layout based on current properties
            adjustFlexboxItems(dir, jc);

            addLog("system", `Flexbox Layout loaded. Parent: display: flex. Flex-Direction: ${dir}. Justify-Content: ${jc}. Padding: ${padVal}.`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const dir = params.flex_direction || "row";
            const jc = params.justify_content || "space-between";
            const padVal = params.box_padding || "20px";

            const parentContainer = document.getElementById("flex-parent-container");
            const boxModelDetail = document.getElementById("box-model-details");

            boxModelDetail.setAttribute("opacity", "0.3");
            parentContainer.setAttribute("stroke", "rgba(255,255,255,0.08)");

            if (step === 0) {
                // Step 1: Load Container
                parentContainer.setAttribute("stroke", "var(--color-accent)");
                parentContainer.setAttribute("fill", "rgba(59, 130, 246, 0.02)");
                
                addLog("command", ".flex-container { display: flex; flex-direction: " + dir + "; }");
                addLog("output", `Browser Layout Engine: Creating flex formatting context. Main alignment axis configured: ${dir === 'row' ? 'Horizontal (X)' : 'Vertical (Y)'}.`);
            } else if (step === 1) {
                // Step 2: Align Items
                adjustFlexboxItems(dir, jc, true, speed);
                addLog("command", ".flex-container { justify-content: " + jc + "; }");
                addLog("output", `Reflowing items... Distributing leftover container space on main axis via strategy: ${jc}.`);
            } else if (step === 2) {
                // Step 3: Inspect Box Model
                boxModelDetail.setAttribute("opacity", "1");
                
                // Highlight item 2 as inspected
                const item2 = document.getElementById("flex-item-2").querySelector("rect");
                item2.setAttribute("stroke", "var(--color-emerald)");
                item2.setAttribute("stroke-width", "2.5");
                
                // Update padding label
                const padLabel = document.getElementById("box-pad-label");
                padLabel.textContent = `padding: ${padVal}`;

                addLog("command", "$ getComputedStyle(flexItems[1]) // Inspecting Layout");
                addLog("output", `Computed layout box metrics:
 - Content Size: 80px x 60px (calculated width/height)
 - Inner Padding: ${padVal} (creates spacing inside border)
 - Border Thickness: 2px (drawn layout outline)
 - Outer Margin: 15px (space between sibling items)`);
                addLog("success", "Box model coordinates successfully mapped. No overlapping layout constraints detected.");
            }
        }
    },

    "html-forms": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Validate input field rules (required, email regex structure check)",
                "Step 2: Intercept click event, validate status, and serialize form values to JSON",
                "Step 3: Transmit payload parameters via HTTP POST request to backend API database"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Mock Browser Card (Left) -->
                <rect x="20" y="30" width="220" height="250" rx="10" fill="var(--color-bg-surface)" stroke="rgba(255,255,255,0.08)" stroke-width="2" id="forms-browser"></rect>
                <rect x="20" y="30" width="220" height="24" rx="10" fill="rgba(255,255,255,0.03)"></rect>
                <circle cx="34" cy="42" r="3" fill="var(--color-rose)"></circle>
                <circle cx="44" cy="42" r="3" fill="var(--color-amber)"></circle>
                <circle cx="54" cy="42" r="3" fill="var(--color-emerald)"></circle>
                <text x="130" y="45" fill="var(--color-text-muted)" font-size="7" font-weight="bold" text-anchor="middle" font-family="var(--font-mono)">secure-auth / login</text>

                <!-- Login Form -->
                <g id="forms-card-body">
                    <rect x="40" y="75" width="180" height="180" rx="6" fill="var(--color-bg-card)" stroke="rgba(255,255,255,0.05)"></rect>
                    <text x="130" y="95" fill="var(--color-text-primary)" font-size="10" font-weight="bold" text-anchor="middle">SIGN IN</text>

                    <!-- Email Input -->
                    <text x="50" y="120" fill="var(--color-text-secondary)" font-size="8">Email Address</text>
                    <rect x="50" y="126" width="160" height="24" rx="4" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" stroke-width="1" id="forms-input-email"></rect>
                    <text x="58" y="141" fill="var(--color-text-primary)" font-size="8" id="forms-email-text">john.doe@</text>
                    <circle cx="196" cy="138" r="6" fill="var(--color-rose)" class="hidden" id="forms-email-error-indicator"></circle>
                    <path d="M 193 138 L 199 138" stroke="white" stroke-width="1.5" class="hidden" id="forms-email-error-icon"></path>

                    <!-- Password Input -->
                    <text x="50" y="168" fill="var(--color-text-secondary)" font-size="8">Password</text>
                    <rect x="50" y="174" width="160" height="24" rx="4" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" stroke-width="1" id="forms-input-password"></rect>
                    <text x="58" y="189" fill="var(--color-text-muted)" font-size="8">••••••••</text>

                    <!-- Sign In Button -->
                    <rect x="50" y="215" width="160" height="24" rx="4" fill="var(--color-amber)" stroke="none" id="forms-submit-btn"></rect>
                    <text x="130" y="230" fill="var(--color-bg-base)" font-size="9" font-weight="bold" text-anchor="middle">Sign In</text>
                </g>

                <!-- API Server Node (Center) -->
                <foreignObject x="320" y="90" width="120" height="110" class="node-fo" id="forms-api-server">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="cpu"></i></div>
                        <div class="node-title">Auth API Server</div>
                        <div class="node-ip" style="font-size: 7px">api/v1/auth</div>
                    </div>
                </foreignObject>

                <!-- Database Node (Right) -->
                <foreignObject x="510" y="90" width="110" height="110" class="node-fo" id="forms-database">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="database"></i></div>
                        <div class="node-title">User DB</div>
                        <div class="node-ip" style="font-size: 7px">Credential logs</div>
                    </div>
                </foreignObject>

                <!-- Connectors -->
                <path d="M 240 145 L 320 145" class="canvas-link" id="link-forms-server"></path>
                <path d="M 440 145 L 510 145" class="canvas-link" id="link-server-db"></path>

                <!-- Packets -->
                <circle cx="240" cy="145" r="6" fill="var(--color-amber)" class="packet hidden" id="packet-forms-submit"></circle>
            `;
            lucide.createIcons();
            addLog("system", "HTML Login Form visualizer initialized. Form validation rules active.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const pSubmit = document.getElementById("packet-forms-submit");
            if (pSubmit) pSubmit.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            const emailBox = document.getElementById("forms-input-email");
            const emailText = document.getElementById("forms-email-text");
            const errIndicator = document.getElementById("forms-email-error-indicator");
            const errIcon = document.getElementById("forms-email-error-icon");
            const apiCard = document.getElementById("forms-api-server")?.querySelector(".canvas-node-card");
            const dbCard = document.getElementById("forms-database")?.querySelector(".canvas-node-card");

            if (step === 0) {
                // Step 1: Validation Failed
                addLog("command", "$ [HTML Validator] Evaluating form fields validation criteria...");
                addLog("output", "Input Email: 'john.doe@' -> Invalid. Missing TLD suffix.");

                if (emailBox) emailBox.setAttribute("stroke", "var(--color-rose)");
                if (errIndicator) errIndicator.classList.remove("hidden");
                if (errIcon) errIcon.classList.remove("hidden");
                
                addLog("warning", "Error: HTMLInputElement checkValidity() failed. Input field is required to be email shape.");
            } else if (step === 1) {
                // Step 2: Correct email & Intercept event
                addLog("command", "e.preventDefault(); // Intercepting submit trigger");
                
                // Update email input visually
                if (emailBox) emailBox.setAttribute("stroke", "var(--color-emerald)");
                if (emailText) {
                    emailText.textContent = "john.doe@entra.com";
                    emailText.setAttribute("fill", "var(--color-text-primary)");
                }
                if (errIndicator) {
                    errIndicator.classList.remove("hidden");
                    errIndicator.setAttribute("fill", "var(--color-emerald)");
                }
                if (errIcon) {
                    errIcon.classList.add("hidden");
                }
                
                addLog("success", "Email updated. Validation PASSED. Form fields serialized to JSON payload.");
                addLog("output", "Payload: { \"email\": \"john.doe@entra.com\", \"pass\": \"••••••••\" }");
            } else if (step === 2) {
                // Step 3: Send POST
                document.getElementById("link-forms-server").className = "canvas-link active";
                addLog("command", "$ fetch('/api/v1/auth', { method: 'POST', body: JSON.stringify(payload) })");
                addLog("output", "Client Request: Transmitting credentials payload across network...");

                animatePacket(pSubmit, null, 240, 145, 320, 145, 1000 / speed, () => {
                    document.getElementById("link-forms-server").className = "canvas-link success";
                    document.getElementById("link-server-db").className = "canvas-link active";
                    
                    if (apiCard) apiCard.classList.add("active");
                    addLog("output", "API Server: Hashing password, comparing credential hashes in database...");

                    setTimeout(() => {
                        animatePacket(pSubmit, null, 440, 145, 510, 145, 800 / speed, () => {
                            document.getElementById("link-server-db").className = "canvas-link success";
                            if (dbCard) dbCard.classList.add("active");
                            if (apiCard) apiCard.classList.remove("active");
                            addLog("success", "API Database: Session matched. Status: 200 OK (Auth Token Generated).");
                        });
                    }, 500 / speed);
                });
            }
        }
    },

    "css-position": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Sibling A shifts offset dynamically (position: relative) without affecting grid space",
                "Step 2: Sibling B detaches from standard document flow (position: absolute) relative to nearest parent",
                "Step 3: Header remains pinned at browser viewport boundary (position: sticky) during scroll reflows"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Webpage Container (Viewport) -->
                <rect x="30" y="20" width="380" height="260" rx="10" fill="var(--color-bg-surface)" stroke="rgba(255,255,255,0.08)" stroke-width="2" id="pos-browser"></rect>
                
                <!-- Sticky Header (pinned at top) -->
                <rect x="32" y="22" width="376" height="35" fill="rgba(59, 130, 246, 0.15)" stroke="var(--color-accent)" stroke-width="1.5" id="pos-header" style="z-index:5"></rect>
                <text x="220" y="44" fill="var(--color-text-primary)" font-size="8" font-weight="bold" text-anchor="middle">STICKY HEADER (position: sticky; top: 0)</text>

                <!-- Document Flow Area -->
                <g id="pos-flow-area">
                    <!-- Sibling A (Relative Box) -->
                    <rect x="60" y="80" width="100" height="40" rx="4" fill="rgba(245, 158, 11, 0.05)" stroke="var(--color-amber)" stroke-width="1.5" stroke-dasharray="3,3" id="pos-sib-a-original" opacity="0.4"></rect>
                    
                    <g id="pos-sib-a">
                        <rect x="60" y="80" width="100" height="40" rx="4" fill="var(--color-bg-card)" stroke="var(--color-amber)" stroke-width="1.5"></rect>
                        <text x="110" y="104" fill="var(--color-text-primary)" font-size="8" text-anchor="middle" font-weight="bold">Sibling A (relative)</text>
                    </g>

                    <!-- Sibling B (Absolute parent container box) -->
                    <g id="pos-sib-b-parent">
                        <rect x="60" y="145" width="220" height="85" rx="6" fill="rgba(6, 182, 212, 0.02)" stroke="var(--color-cyan)" stroke-width="1" stroke-dasharray="2,2"></rect>
                        <text x="170" y="160" fill="var(--color-cyan)" font-size="7" font-weight="bold" text-anchor="middle">Relative Parent Container</text>
                        
                        <!-- Sibling B (Absolute node inside parent) -->
                        <g id="pos-sib-b">
                            <rect x="80" y="175" width="90" height="35" rx="4" fill="var(--color-bg-card)" stroke="var(--color-violet)" stroke-width="1.5"></rect>
                            <text x="125" y="196" fill="var(--color-text-primary)" font-size="7" text-anchor="middle" font-weight="bold">Sibling B (absolute)</text>
                        </g>
                    </g>
                </g>

                <!-- Fixed Element (Far Right side) -->
                <g id="pos-fixed-box" style="z-index: 6">
                    <rect x="440" y="90" width="180" height="110" rx="8" fill="rgba(16, 185, 129, 0.05)" stroke="var(--color-emerald)" stroke-width="2"></rect>
                    <text x="530" y="115" fill="var(--color-emerald)" font-size="9" font-weight="bold" text-anchor="middle">FIXED CHAT WIDGET</text>
                    <text x="530" y="135" fill="var(--color-text-secondary)" font-size="7" text-anchor="middle">position: fixed;</text>
                    <text x="530" y="150" fill="var(--color-text-secondary)" font-size="7" text-anchor="middle">right: 20px; bottom: 20px;</text>
                    <circle cx="530" cy="180" r="10" fill="var(--color-emerald)"></circle>
                    <path d="M 527 180 L 533 180 M 530 177 L 530 183" stroke="white" stroke-width="1.5"></path>
                </g>
            `;
            addLog("system", "CSS Position visualizer initialized. Element layout tree ready.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const sibA = document.getElementById("pos-sib-a");
            const sibB = document.getElementById("pos-sib-b");
            const header = document.getElementById("pos-header");
            const headerText = header.nextElementSibling;
            const flowArea = document.getElementById("pos-flow-area");

            if (sibA) sibA.style.transition = `transform ${0.8 / speed}s ease`;
            if (sibB) sibB.style.transition = `transform ${0.8 / speed}s ease`;
            if (flowArea) flowArea.style.transition = `transform ${0.8 / speed}s ease`;

            if (step === 0) {
                // Step 1: Relative offset
                addLog("command", ".sibling-a { position: relative; top: 15px; left: 25px; }");
                addLog("output", "CSS Engine: Offsetting Item A. Note: Its original layout box remains in the static document flow.");
                
                if (sibA) sibA.style.transform = "translate(25px, 15px)";
                if (sibB) sibB.style.transform = "translate(0px, 0px)";
                if (flowArea) flowArea.style.transform = "translate(0px, 0px)";
            } else if (step === 1) {
                // Step 2: Absolute offset
                addLog("command", ".sibling-b { position: absolute; top: 10px; right: 10px; }");
                addLog("output", "CSS Engine: Sibling B detached from flow. Positioned relative to nearest relative ancestor.");
                
                if (sibB) sibB.style.transform = "translate(100px, -20px)";
                if (flowArea) flowArea.style.transform = "translate(0px, 0px)";
            } else if (step === 2) {
                // Step 3: Sticky scroll
                addLog("command", "window.scrollBy(0, 40) // Simulating scroll reflow");
                addLog("output", "Scroll reflow triggered. Document flow elements shift upwards.");
                addLog("success", "Sticky Header remains locked at boundary top: 0 while content slides under.");

                if (flowArea) flowArea.style.transform = "translate(0px, -45px)";
                if (sibA) sibA.style.transform = "translate(25px, 15px)";
            }
        }
    },

    "react-useEffect": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Component mounts, state variables initialized and inserted into Real DOM",
                "Step 2: useEffect triggers fetch callback operation on completion of paint cycle",
                "Step 3: API data loaded, count state updates, triggering virtual-to-real DOM repaints"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- React Lifecycle Dashboard (Left) -->
                <rect x="20" y="30" width="240" height="250" rx="10" fill="var(--color-bg-surface)" stroke="rgba(255,255,255,0.08)" stroke-width="2"></rect>
                <text x="35" y="50" fill="var(--color-cyan)" font-size="9" font-weight="bold">REACT LIFECYCLE MONITOR</text>

                <!-- Component Status State Card -->
                <g id="ue-state-card">
                    <rect x="40" y="70" width="200" height="85" rx="6" fill="var(--color-bg-card)" stroke="rgba(255,255,255,0.05)"></rect>
                    <text x="55" y="90" fill="var(--color-text-secondary)" font-size="8">Mount Status:</text>
                    <circle cx="150" cy="87" r="5" fill="var(--color-rose)" id="ue-status-mount-dot"></circle>
                    <text x="165" y="90" fill="var(--color-rose)" font-size="8" font-weight="bold" id="ue-status-mount-text">Unmounted</text>

                    <text x="55" y="115" fill="var(--color-text-secondary)" font-size="8">State count:</text>
                    <text x="150" y="115" fill="var(--color-text-primary)" font-size="8" font-weight="bold" id="ue-status-count">0</text>

                    <text x="55" y="140" fill="var(--color-text-secondary)" font-size="8">Effect Phase:</text>
                    <circle cx="150" cy="137" r="5" fill="var(--color-text-muted)" id="ue-status-effect-dot"></circle>
                    <text x="165" y="140" fill="var(--color-text-muted)" font-size="8" font-weight="bold" id="ue-status-effect-text">Idle</text>
                </g>

                <!-- Mock Browser Viewport (Center) -->
                <g id="ue-dom-card">
                    <rect x="40" y="170" width="200" height="95" rx="6" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" id="ue-real-dom-box"></rect>
                    <text x="55" y="185" fill="var(--color-text-muted)" font-size="8" id="ue-dom-label">REAL BROWSER DOM</text>
                    <text x="140" y="220" fill="var(--color-text-muted)" font-size="10" font-weight="bold" text-anchor="middle" id="ue-dom-preview-text">EMPTY VIEW</text>
                </g>

                <!-- Fetch Database Node (Right) -->
                <foreignObject x="490" y="90" width="130" height="110" class="node-fo" id="ue-api-server">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="cloud"></i></div>
                        <div class="node-title">Fetch API Database</div>
                        <div class="node-ip" style="font-size: 7px">https://api/counters</div>
                    </div>
                </foreignObject>

                <!-- Connection Link -->
                <path d="M 260 150 L 490 150" class="canvas-link" id="link-ue-api"></path>

                <!-- Signal Packet -->
                <circle cx="260" cy="150" r="6" fill="var(--color-violet)" class="packet hidden" id="packet-ue-fetch"></circle>
            `;
            lucide.createIcons();
            addLog("system", "React component hooks monitor initialized. Lifecycle events reset.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const pFetch = document.getElementById("packet-ue-fetch");
            if (pFetch) pFetch.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            const mDot = document.getElementById("ue-status-mount-dot");
            const mText = document.getElementById("ue-status-mount-text");
            const eDot = document.getElementById("ue-status-effect-dot");
            const eText = document.getElementById("ue-status-effect-text");
            const countText = document.getElementById("ue-status-count");
            const domBox = document.getElementById("ue-real-dom-box");
            const domLabel = document.getElementById("ue-dom-label");
            const domPreview = document.getElementById("ue-dom-preview-text");
            const apiCard = document.getElementById("ue-api-server")?.querySelector(".canvas-node-card");

            if (step === 0) {
                // Step 1: Mount Component
                addLog("command", "CounterComponent.mount() // Inserting tree");
                addLog("output", "React Engine: Resolving fiber nodes. Writing state counters to Real DOM.");

                if (mDot) mDot.setAttribute("fill", "var(--color-emerald)");
                if (mText) {
                    mText.textContent = "Mounted";
                    mText.setAttribute("fill", "var(--color-emerald)");
                }
                
                if (domBox) domBox.setAttribute("stroke", "var(--color-emerald)");
                if (domLabel) domLabel.setAttribute("fill", "var(--color-emerald)");
                if (domPreview) {
                    domPreview.textContent = "Count State: 0";
                    domPreview.setAttribute("fill", "var(--color-text-primary)");
                }

                addLog("success", "Render complete. Component successfully mounted in viewport DOM tree.");
            } else if (step === 1) {
                // Step 2: Trigger useEffect side-effect
                document.getElementById("link-ue-api").className = "canvas-link active";
                addLog("command", "useEffect(() => { fetchCount() }, []) // Side effect trigger");
                addLog("output", "React: DOM paint cycle completed. Triggering asynchronous side-effects.");

                if (eDot) eDot.setAttribute("fill", "var(--color-cyan)");
                if (eText) {
                    eText.textContent = "Fetching Data";
                    eText.setAttribute("fill", "var(--color-cyan)");
                }

                animatePacket(pFetch, null, 260, 150, 490, 150, 1000 / speed, () => {
                    document.getElementById("link-ue-api").className = "canvas-link success";
                    if (apiCard) apiCard.classList.add("active");
                    addLog("output", "API Server: Handshaking with Fetch client. Loading initial counts...");
                });
            } else if (step === 2) {
                // Step 3: API loaded & state update
                if (apiCard) apiCard.classList.remove("active");
                document.getElementById("link-ue-api").className = "canvas-link success";
                addLog("output", "API Server: Returning JSON response: { count: 1 }");
                addLog("command", "setCount(1) // State updated");

                if (eDot) eDot.setAttribute("fill", "var(--color-emerald)");
                if (eText) {
                    eText.textContent = "Effect Complete";
                    eText.setAttribute("fill", "var(--color-emerald)");
                }
                if (countText) countText.textContent = "1";

                if (domPreview) {
                    domPreview.textContent = "Count State: 1";
                    domPreview.style.filter = "drop-shadow(0 0 5px var(--color-emerald))";
                    setTimeout(() => {
                    domPreview.style.filter = "none";
                    }, 500);
                }

                addLog("success", "React: Virtual DOM reconciliation finished. Real DOM updated successfully.");
            }
        }
    },

    "default": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Client drafts HTML/CSS/React component logic in source files",
                "Step 2: Server compiler resolves syntax rules and triggers paint layout calculations",
                "Step 3: Viewport paints visual component interface elements dynamically"
            ];
            return labels[idx] || "";
        },
        getCategory: (conceptId) => {
            if (!conceptId) return "sandbox";
            // 1. DOM Tree Parser
            const domList = ["html-elements", "html-headings", "html-paragraphs", "html-styles", "html-formatting", "html-semantic", "html-media", "html-blocks"];
            if (domList.includes(conceptId)) return "dom-parser";

            // 2. Resource Fetcher
            const fetchList = ["html-links", "html-images", "html-iframes", "html-intro", "html-attributes"];
            if (fetchList.includes(conceptId)) return "resource-fetcher";

            // 3. CSS Styling Engine
            const cssStyleList = ["css-syntax", "css-selectors", "css-howto", "css-colors", "css-backgrounds", "css-borders", "css-outline", "css-text", "css-fonts", "css-icons"];
            if (cssStyleList.includes(conceptId)) return "css-styling";

            // 4. Reflow Spacing Layout
            const cssSpacingList = ["css-margins", "css-paddings", "css-height-width", "css-boxmodel", "css-display", "css-max-width", "css-zindex", "css-overflow", "css-align", "css-links", "css-lists"];
            if (cssSpacingList.includes(conceptId)) return "css-layout";

            // 5. React Data Flow
            const reactList = ["react-es6", "react-render", "react-jsx", "react-components", "react-props", "react-state", "react-events", "react-conditionals", "react-lists"];
            if (reactList.includes(conceptId)) return "react-flow";

            // 6. Hooks Provider
            const hooksList = ["react-useState", "react-useEffect", "react-useContext", "react-useRef", "react-custom-hooks"];
            if (hooksList.includes(conceptId)) return "hooks-provider";

            return "sandbox";
        },
        setup: (stage, params, addLog) => {
            const activeItem = document.querySelector(".concept-item.active");
            const conceptId = activeItem ? activeItem.getAttribute("data-id") : "generic-concept";
            const conceptTitle = document.getElementById("current-concept")?.textContent || "Web Concept";
            
            const category = FrontendSimulations["default"].getCategory(conceptId);
            
            let categoryLabel = "GENERIC SANDBOX";
            let leftNodeTitle = "Client IDE";
            let centerNodeTitle = "Web Compiler";
            let rightNodeTitle = "Browser Viewport";
            let leftNodeIcon = "file-code";
            let centerNodeIcon = "cpu";
            let rightNodeIcon = "layout";

            if (category === "dom-parser") {
                categoryLabel = "DOM TREE PARSER & OUTLINE";
                leftNodeTitle = "HTML Parser";
                centerNodeTitle = "DOM Node Tree";
                rightNodeTitle = "Document Outline";
                leftNodeIcon = "code";
                centerNodeIcon = "network";
                rightNodeIcon = "file-text";
            } else if (category === "resource-fetcher") {
                categoryLabel = "CLIENT-SERVER RESOURCE GET";
                leftNodeTitle = "Client Browser";
                centerNodeTitle = "Network Gate";
                rightNodeTitle = "Asset Server";
                leftNodeIcon = "globe";
                centerNodeIcon = "shuffle";
                rightNodeIcon = "server";
            } else if (category === "css-styling") {
                categoryLabel = "CSS STYLE DECLARATION CASCADE";
                leftNodeTitle = "Styles sheet";
                centerNodeTitle = "CSS Rules Tree";
                rightNodeTitle = "Styled Node";
                leftNodeIcon = "palette";
                centerNodeIcon = "sliders";
                rightNodeIcon = "layout";
            } else if (category === "css-layout") {
                categoryLabel = "REFLOW SPACING BOX MODEL";
                leftNodeTitle = "Sizing rules";
                centerNodeTitle = "Layout Engine";
                rightNodeTitle = "Reflow Grid";
                leftNodeIcon = "maximize";
                centerNodeIcon = "layout";
                rightNodeIcon = "grid";
            } else if (category === "react-flow") {
                categoryLabel = "REACT DATA FLOW & COMPOSITION";
                leftNodeTitle = "Parent Element";
                centerNodeTitle = "React Core";
                rightNodeTitle = "Child View";
                leftNodeIcon = "box";
                centerNodeIcon = "refresh-cw";
                rightNodeIcon = "layers";
            } else if (category === "hooks-provider") {
                categoryLabel = "REACT HOOK REGISTRY & PROVIDER";
                leftNodeTitle = "State Trigger";
                centerNodeTitle = "Hook Fiber";
                rightNodeTitle = "Real DOM Ref";
                leftNodeIcon = "play-circle";
                centerNodeIcon = "cpu";
                rightNodeIcon = "link";
            }

            stage.innerHTML = `
                <!-- Category Title Card -->
                <rect x="20" y="10" width="620" height="25" rx="5" fill="rgba(255,255,255,0.02)" stroke="var(--color-border)" stroke-width="1"></rect>
                <text x="320" y="26" fill="var(--color-text-secondary)" font-size="8" font-weight="bold" text-anchor="middle" font-family="var(--font-mono)" letter-spacing="1">${categoryLabel}</text>

                <!-- Left Node Card -->
                <foreignObject x="30" y="80" width="130" height="110" class="node-fo" id="sb-left-node">
                    <div class="canvas-node-card active" style="border-color: var(--color-cyan)">
                        <div class="node-icon"><i data-lucide="${leftNodeIcon}"></i></div>
                        <div class="node-title">${leftNodeTitle}</div>
                        <div class="node-ip" style="font-size: 7px; opacity:0.8">Active Context</div>
                    </div>
                </foreignObject>

                <!-- Center Node Card -->
                <foreignObject x="250" y="80" width="130" height="110" class="node-fo" id="sb-center-node">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-icon"><i data-lucide="${centerNodeIcon}"></i></div>
                        <div class="node-title">${centerNodeTitle}</div>
                        <div class="node-ip" style="font-size: 7px">Processing...</div>
                    </div>
                </foreignObject>

                <!-- Right Browser Viewport Card -->
                <foreignObject x="470" y="60" width="170" height="165" class="node-fo" id="sb-right-node">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald); padding:0; overflow:hidden; height:100%">
                        <!-- Browser Header -->
                        <div style="background:rgba(255,255,255,0.04); padding:4px 8px; display:flex; align-items:center; gap:4px; border-bottom:1px solid var(--color-border)">
                            <span style="width:4px; height:4px; border-radius:50%; background:var(--color-rose)"></span>
                            <span style="width:4px; height:4px; border-radius:50%; background:var(--color-amber)"></span>
                            <span style="width:4px; height:4px; border-radius:50%; background:var(--color-emerald)"></span>
                            <div style="flex:1; font-family:var(--font-mono); font-size:6px; color:var(--color-text-muted); text-align:center; background:rgba(0,0,0,0.2); padding:1px; border-radius:2px">w3schools-sandbox</div>
                        </div>
                        <!-- Browser Body -->
                        <div style="padding:10px; text-align:left;" id="viewport-preview-content">
                            <div style="font-size:8px; font-weight:bold; color:var(--color-cyan)" id="viewport-preview-title">${conceptTitle}</div>
                            <div style="font-size:7px; color:var(--color-text-secondary); margin-top:6px; line-height:1.2" id="viewport-preview-desc">
                              To view the code syntax for this topic, select the CLI & Code tab on the right.
                            </div>
                            <div id="viewport-visual-demo" style="margin-top:8px; height:40px; border-radius:4px; background:rgba(255,255,255,0.02); border:1px dashed var(--color-border); display:flex; align-items:center; justify-content:center; font-size:7px; color:var(--color-text-muted)">
                              [Waiting for step 3 paint]
                            </div>
                        </div>
                    </div>
                </foreignObject>

                <!-- Connectors -->
                <path d="M 160 135 L 250 135" class="canvas-link" id="link-sb-1"></path>
                <path d="M 380 135 L 470 135" class="canvas-link" id="link-sb-2"></path>

                <!-- Packets -->
                <circle cx="160" cy="135" r="5" fill="var(--color-cyan)" class="packet hidden" id="packet-sb-1"></circle>
                <circle cx="380" cy="135" r="5" fill="var(--color-emerald)" class="packet hidden" id="packet-sb-2"></circle>
            `;
            lucide.createIcons();
            addLog("system", `Category Visualizer: [${leftNodeTitle}] -> [${centerNodeTitle}] -> [${rightNodeTitle}] loaded for topic: ${conceptTitle}.`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const p1 = document.getElementById("packet-sb-1");
            const p2 = document.getElementById("packet-sb-2");
            if (p1) p1.classList.add("hidden");
            if (p2) p2.classList.add("hidden");

            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            const activeItem = document.querySelector(".concept-item.active");
            const conceptId = activeItem ? activeItem.getAttribute("data-id") : "";
            const conceptTitle = document.getElementById("current-concept")?.textContent || "Web Concept";
            const category = FrontendSimulations["default"].getCategory(conceptId);

            let conceptDesc = "Interactive visualization placeholder.";
            let conceptConfig = "// No Code";
            const conceptObj = ConceptsData.frontend.find(c => c.id === conceptId);
            if (conceptObj) {
                conceptDesc = conceptObj.description;
                conceptConfig = conceptObj.config;
            }

            const centerCard = document.getElementById("sb-center-node")?.querySelector(".canvas-node-card");
            const rightCard = document.getElementById("sb-right-node")?.querySelector(".canvas-node-card");

            if (step === 0) {
                document.getElementById("link-sb-1").className = "canvas-link active";
                
                if (category === "dom-parser") {
                    addLog("command", `[HTML Parser] Parsing layout elements for ${conceptTitle}...`);
                } else if (category === "resource-fetcher") {
                    addLog("command", `[HTTP GET] Fetching external resource references for ${conceptTitle}...`);
                } else if (category === "css-styling") {
                    addLog("command", `[CSS Parser] Evaluating layout stylesheets: matching rules...`);
                } else if (category === "css-layout") {
                    addLog("command", `[Layout Engine] Running geometry math bounds check...`);
                } else if (category === "react-flow") {
                    addLog("command", `[React Reconciler] Resolving component props flow...`);
                } else if (category === "hooks-provider") {
                    addLog("command", `[React Hooks] Triggering hook update event...`);
                } else {
                    addLog("command", `// Syncing files for ${conceptTitle}...`);
                }

                animatePacket(p1, null, 160, 135, 250, 135, 1000 / speed, () => {
                    document.getElementById("link-sb-1").className = "canvas-link success";
                    addLog("success", "Stage 1 sync completed. Code compiled successfully.");
                });
            } else if (step === 1) {
                if (centerCard) {
                    centerCard.classList.add("active");
                    centerCard.style.borderColor = "var(--color-violet)";
                }

                if (category === "dom-parser") {
                    addLog("output", "DOM Engine: Converting token rules to live structural memory nodes...");
                } else if (category === "resource-fetcher") {
                    addLog("output", "Server Gateway: Dispatching asset stream across content delivery network...");
                } else if (category === "css-styling") {
                    addLog("output", "Styling Engine: Compiling selector hashes into active paint instructions...");
                } else if (category === "css-layout") {
                    addLog("output", "Reflow Engine: recalculating container bounds & box model coordinates...");
                } else if (category === "react-flow") {
                    addLog("output", "React Fiber: Syncing component states and scheduling paint queue...");
                } else if (category === "hooks-provider") {
                    addLog("output", "Hooks Store: Querying hook registries and tracking fiber references...");
                } else {
                    addLog("output", "Bundler: Resolving asset files...");
                }
            } else if (step === 2) {
                if (centerCard) centerCard.classList.remove("active");
                document.getElementById("link-sb-1").className = "canvas-link success";
                document.getElementById("link-sb-2").className = "canvas-link active";
                
                animatePacket(p2, null, 380, 135, 470, 135, 1000 / speed, () => {
                    document.getElementById("link-sb-2").className = "canvas-link success";
                    
                    const viewTitle = document.getElementById("viewport-preview-title");
                    const viewDesc = document.getElementById("viewport-preview-desc");
                    const viewDemo = document.getElementById("viewport-visual-demo");

                    if (viewTitle) viewTitle.textContent = conceptTitle;
                    if (viewDesc) viewDesc.textContent = conceptDesc.substring(0, 85) + "...";
                    
                    if (viewDemo) {
                        if (category === "dom-parser") {
                            viewDemo.innerHTML = `<span style="background:rgba(6, 182, 212, 0.15); border:1px solid var(--color-cyan); padding:3px 6px; border-radius:3px; color:var(--color-text-primary); font-family:var(--font-mono); font-size:7px">&lt;${conceptId} /&gt; DOM node</span>`;
                        } else if (category === "resource-fetcher") {
                            viewDemo.innerHTML = `<span style="border:1px solid var(--color-amber); padding:3px 6px; border-radius:4px; font-size:7px; color:var(--color-amber); font-weight:bold"><i data-lucide="download" style="width:8px; height:8px; vertical-align:middle; margin-right:3px"></i> Load Complete</span>`;
                            lucide.createIcons();
                        } else if (category === "css-styling") {
                            viewDemo.innerHTML = `<div style="background:linear-gradient(135deg, var(--color-accent), var(--color-violet)); width:50px; height:15px; border-radius:4px; box-shadow:0 2px 6px rgba(59,130,246,0.3)"></div>`;
                        } else if (category === "css-layout") {
                            viewDemo.innerHTML = `<div style="border:2px dashed var(--color-cyan); padding:2px; display:inline-block"><div style="background:var(--color-emerald); width:35px; height:10px"></div></div>`;
                        } else if (category === "react-flow") {
                            viewDemo.innerHTML = `<span style="border:1px solid var(--color-emerald); padding:2px 5px; border-radius:10px; font-size:6px; color:var(--color-emerald); font-weight:bold"><i data-lucide="refresh-cw" style="width:7px; height:7px; vertical-align:middle; animation:spin 4s linear infinite; margin-right:2px"></i> Rendered Prop</span>`;
                            lucide.createIcons();
                        } else if (category === "hooks-provider") {
                            viewDemo.innerHTML = `<span style="background:rgba(16, 185, 129, 0.15); border:1px solid var(--color-emerald); padding:3px 6px; border-radius:3px; font-size:7px; color:var(--color-emerald); font-weight:bold">Hook State Active</span>`;
                        } else {
                            viewDemo.innerHTML = `<span style="font-style:italic; font-size:7px; color:var(--color-text-secondary)">Painted!</span>`;
                        }
                    }

                    if (rightCard) {
                        rightCard.style.borderColor = "var(--color-emerald)";
                        rightCard.style.boxShadow = "0 0 12px rgba(16, 185, 129, 0.25)";
                    }

                    addLog("success", `Paint operation completed for ${conceptTitle}. Preview rendered inside viewport layout.`);
                });
            }
        }
    }
};

// Helper function to shift flexbox items based on flex alignment settings
function adjustFlexboxItems(direction, justify, animate = false, speed = 1.0) {
    const item1 = document.getElementById("flex-item-1");
    const item2 = document.getElementById("flex-item-2");
    const item3 = document.getElementById("flex-item-3");

    if (!item1 || !item2 || !item3) return;

    const w = 80;
    const h = 60;
    let coords = [];

    if (direction === "row") {
        // Horizontal distribution
        // Parent width = 360, boundaries x: 30 to 390. Main spacing width = 360
        if (justify === "flex-start") {
            coords = [
                { x: 50, y: 120 },
                { x: 140, y: 120 },
                { x: 230, y: 120 }
            ];
        } else if (justify === "center") {
            coords = [
                { x: 80, y: 120 },
                { x: 170, y: 120 },
                { x: 260, y: 120 }
            ];
        } else { // space-between
            coords = [
                { x: 50, y: 120 },
                { x: 170, y: 120 },
                { x: 290, y: 120 }
            ];
        }
    } else {
        // Vertical distribution
        // Parent height = 260, boundaries y: 20 to 280. Items y-spacing
        if (justify === "flex-start") {
            coords = [
                { x: 170, y: 40 },
                { x: 170, y: 110 },
                { x: 170, y: 180 }
            ];
        } else if (justify === "center") {
            coords = [
                { x: 170, y: 55 },
                { x: 170, y: 120 },
                { x: 170, y: 185 }
            ];
        } else { // space-between
            coords = [
                { x: 170, y: 40 },
                { x: 170, y: 120 },
                { x: 170, y: 200 }
            ];
        }
    }

    const items = [item1, item2, item3];
    items.forEach((item, idx) => {
        const target = coords[idx];
        const rect = item.querySelector("rect");
        const text = item.querySelector("text");
        
        if (animate) {
            rect.style.transition = `x ${0.8 / speed}s ease, y ${0.8 / speed}s ease`;
            text.style.transition = `x ${0.8 / speed}s ease, y ${0.8 / speed}s ease`;
        } else {
            rect.style.transition = "none";
            text.style.transition = "none";
        }
        
        rect.setAttribute("x", target.x);
        rect.setAttribute("y", target.y);
        text.setAttribute("x", target.x + w / 2);
        text.setAttribute("y", target.y + h / 2 + 5);
    });
}

window.FrontendSimulations = FrontendSimulations;

