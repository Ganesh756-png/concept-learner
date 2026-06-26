const DataEngSimulations = {
    "etl-elt": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Extract raw data from Source databases",
                "Step 2: Apply Schema transformations (Staging server vs Warehouse)",
                "Step 3: Load cleaned tables into Warehouse analytics layer"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            const isETL = params.pipeline_type === "ETL Pattern";

            stage.innerHTML = `
                <!-- Source DB -->
                <foreignObject x="30" y="120" width="110" height="90" class="node-fo" id="ee-source">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-icon"><i data-lucide="database"></i></div>
                        <div class="node-title">Postgres DB</div>
                        <div class="node-ip" style="font-size: 8px">Source Tables</div>
                    </div>
                </foreignObject>

                <!-- Staging Transform Engine -->
                <foreignObject x="250" y="120" width="130" height="100" class="node-fo" id="ee-stage">
                    <div class="canvas-node-card" style="border-color: ${isETL ? 'var(--color-cyan)' : 'rgba(255,255,255,0.1)'}">
                        <div class="node-icon"><i data-lucide="cpu"></i></div>
                        <div class="node-title">${isETL ? 'Spark Engine' : 'S3 Stage (Raw)'}</div>
                        <div class="node-ip" style="font-size: 8px">${isETL ? 'Transform Layer' : 'Raw JSON Bucket'}</div>
                    </div>
                </foreignObject>

                <!-- Target DW -->
                <foreignObject x="480" y="120" width="130" height="100" class="node-fo" id="ee-target">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald)">
                        <div class="node-icon"><i data-lucide="server"></i></div>
                        <div class="node-title">Snowflake DW</div>
                        <div class="node-ip" style="font-size: 8px">Analytics Marts</div>
                    </div>
                </foreignObject>

                <!-- Connections -->
                <path d="M 140 165 L 250 165" class="canvas-link" id="link-ee-1"></path>
                <path d="M 380 165 L 480 165" class="canvas-link" id="link-ee-2"></path>
                
                <!-- Data Particle -->
                <circle cx="140" cy="165" r="7" fill="var(--color-accent)" class="packet hidden" id="packet-ee"></circle>
            `;
            lucide.createIcons();
            addLog("system", `Data Pipeline model initialized with pattern: ${params.pipeline_type}.`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const isETL = params.pipeline_type === "ETL Pattern";
            const packet = document.getElementById("packet-ee");
            packet.classList.add("hidden");
            document.getElementById("link-ee-1").className = "canvas-link";
            document.getElementById("link-ee-2").className = "canvas-link";

            if (step === 0) {
                document.getElementById("link-ee-1").className = "canvas-link active";
                addLog("command", isETL ? "$ python extract_job.py" : "$ airbyte sync");
                addLog("output", "Extracting raw user records (id, name, pii_email, country) from transactional DB...");
                animatePacket(packet, null, 140, 165, 250, 165, 1200 / speed);
            } else if (step === 1) {
                if (isETL) {
                    document.getElementById("ee-stage").querySelector(".canvas-node-card").classList.add("active");
                    addLog("output", "Spark (ETL): Filtering active records, hashing PII fields, mapping ISO countries...");
                    addLog("success", "Transformation done on compute cluster. Schema validated.");
                } else {
                    document.getElementById("link-ee-2").className = "canvas-link active";
                    addLog("output", "ELT Raw Load: Transferring raw files directly into Snowflake staging tables.");
                    animatePacket(packet, null, 250, 165, 480, 165, 1000 / speed);
                }
            } else if (step === 2) {
                document.getElementById("ee-target").querySelector(".canvas-node-card").classList.add("active");
                
                if (isETL) {
                    document.getElementById("link-ee-2").className = "canvas-link success";
                    animatePacket(packet, null, 250, 165, 480, 165, 1200 / speed, () => {
                        addLog("success", "Clean data loaded into Snowflake. Pipelines terminated.");
                    });
                } else {
                    document.getElementById("link-ee-2").className = "canvas-link success";
                    addLog("command", "$ dbt run --models users");
                    addLog("output", "Snowflake (ELT): Compiling SQL query views. Transforming raw JSON into schema inside warehouse...");
                    addLog("success", "Transformation materialized successfully inside target data warehouse.");
                }
            }
        }
    },

    "kafka-pubsub": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Producer publishes event to Topic partition",
                "Step 2: Message logged to broker commit log, incrementing partition offset",
                "Step 3: Consumer group node pulls message and updates partition read status"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            const partitionCount = params.partitions === "4 Partitions" ? 4 : 2;
            const consumerCount = parseInt(params.consumers) || 2;

            let partitionHTML = "";
            for (let i = 0; i < partitionCount; i++) {
                const y = 50 + (i * 70);
                partitionHTML += `
                    <foreignObject x="250" y="${y}" width="140" height="55" class="node-fo">
                        <div class="canvas-node-card mini" style="border-color: var(--color-cyan)" id="kafka-part-${i}">
                            <div class="node-title" style="font-size: 10px">Partition ${i}</div>
                            <div class="node-ip" style="font-family: JetBrains Mono; font-size: 8px">Offset: 412${4+i}</div>
                        </div>
                    </foreignObject>
                `;
            }

            let consumerHTML = "";
            for (let i = 0; i < consumerCount; i++) {
                const step = 280 / consumerCount;
                const y = 40 + (i * step) + (step - 60) / 2;
                consumerHTML += `
                    <foreignObject x="490" y="${y}" width="130" height="60" class="node-fo">
                        <div class="canvas-node-card mini active" style="border-color: var(--color-violet)">
                            <div class="node-title" style="font-size: 10px">Consumer 0${i+1}</div>
                        </div>
                    </foreignObject>
                `;
            }

            stage.innerHTML = `
                <!-- Producer Node -->
                <foreignObject x="30" y="125" width="120" height="90" class="node-fo">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-icon"><i data-lucide="radio"></i></div>
                        <div class="node-title">Log Producer</div>
                    </div>
                </foreignObject>

                <!-- Partitions group -->
                <g id="kafka-partitions">
                    ${partitionHTML}
                </g>

                <!-- Consumers Group -->
                <g id="kafka-consumers">
                    ${consumerHTML}
                </g>

                <!-- Connection Links from Producer to Partitions -->
                <path d="M 150 170 L 250 80" class="canvas-link" id="prod-part-0"></path>
                <path d="M 150 170 L 250 150" class="canvas-link" id="prod-part-1"></path>
                ${partitionCount > 2 ? `
                    <path d="M 150 170 L 250 220" class="canvas-link" id="prod-part-2"></path>
                    <path d="M 150 170 L 250 290" class="canvas-link" id="prod-part-3"></path>
                ` : ""}

                <!-- Connection Links from Partitions to Consumers (Static routing illustration) -->
                <!-- We dynamically compute this or show active connection paths -->
                
                <!-- Moving Packet -->
                <circle cx="150" cy="170" r="6" fill="var(--color-accent)" class="packet hidden" id="packet-kafka"></circle>
            `;
            lucide.createIcons();
            addLog("system", `Kafka topic cluster initialized: ${partitionCount} partitions, ${consumerCount} consumer(s).`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const partitionCount = params.partitions === "4 Partitions" ? 4 : 2;
            const consumerCount = parseInt(params.consumers) || 2;
            const packet = document.getElementById("packet-kafka");
            packet.classList.add("hidden");

            // Reset links
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                // Key hashes to Partition 1
                document.getElementById("prod-part-1").className = "canvas-link active";
                addLog("command", "$ kafka-console-producer.sh --topic orders");
                addLog("output", "Producer: Key 'user_102' hashes to Partition 1. Transmitting message byte payload...");
                animatePacket(packet, null, 150, 170, 250, 150, 1000 / speed);
            } else if (step === 1) {
                // Offset increment
                const part1 = document.getElementById("kafka-part-1");
                part1.classList.add("active");
                
                const curOffset = 4125;
                addLog("output", `Broker: Message written to Partition 1 offset ${curOffset}. Replicating state...`);
            } else if (step === 2) {
                // Consumer routes packet from partition 1 to consumer 1 (roughly y=100)
                // Animate from Partition 1 center to Consumer 1 center
                // Coordinates: Part 1 center: (320, 150) -> Consumer 1 center: (550, 100) (depending on counts)
                // Just animate to Consumer 1
                const consumerY = consumerCount === 1 ? 150 : 100;
                animatePacket(packet, null, 390, 150, 490, consumerY, 1000 / speed, () => {
                    addLog("success", `Consumer: Consumer 01 polled Partition 1 offset 4125. Message processing complete.`);
                });
            }
        }
    },

    "spark-mapreduce": {
        totalSteps: 4,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Input split processed by Map Workers locally",
                "Step 2: Map execution completes (aggregating localized datasets)",
                "Step 3: Network Shuffle phase (Redistribute keys across worker nodes)",
                "Step 4: Reduce execution completes (aggregate final keys to disk output)"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Map Workers -->
                <g id="map-workers">
                    <foreignObject x="30" y="30" width="130" height="75" class="node-fo">
                        <div class="canvas-node-card mini" style="border-color: var(--color-cyan)">
                            <div class="node-title" style="font-size: 10px">Map Worker 01</div>
                            <div class="node-ip" style="font-size: 8px">Input Split A</div>
                        </div>
                    </foreignObject>
                    <foreignObject x="30" y="210" width="130" height="75" class="node-fo">
                        <div class="canvas-node-card mini" style="border-color: var(--color-cyan)">
                            <div class="node-title" style="font-size: 10px">Map Worker 02</div>
                            <div class="node-ip" style="font-size: 8px">Input Split B</div>
                        </div>
                    </foreignObject>
                </g>

                <!-- Reduce Workers -->
                <g id="reduce-workers">
                    <foreignObject x="480" y="30" width="130" height="75" class="node-fo">
                        <div class="canvas-node-card mini" style="border-color: var(--color-violet)">
                            <div class="node-title" style="font-size: 10px">Reduce Worker 01</div>
                            <div class="node-ip" style="font-size: 8px">Keys A-M</div>
                        </div>
                    </foreignObject>
                    <foreignObject x="480" y="210" width="130" height="75" class="node-fo">
                        <div class="canvas-node-card mini" style="border-color: var(--color-violet)">
                            <div class="node-title" style="font-size: 10px">Reduce Worker 02</div>
                            <div class="node-ip" style="font-size: 8px">Keys N-Z</div>
                        </div>
                    </foreignObject>
                </g>

                <!-- Shuffle web lines -->
                <path d="M 160 67 L 480 67" class="canvas-link" id="shuf-1"></path>
                <path d="M 160 67 L 480 247" class="canvas-link" id="shuf-2"></path>
                <path d="M 160 247 L 480 67" class="canvas-link" id="shuf-3"></path>
                <path d="M 160 247 L 480 247" class="canvas-link" id="shuf-4"></path>

                <!-- Particles -->
                <circle cx="160" cy="67" r="5" fill="var(--color-cyan)" class="packet hidden" id="part-s1"></circle>
                <circle cx="160" cy="247" r="5" fill="var(--color-cyan)" class="packet hidden" id="part-s2"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Distributed cluster initialized. Cluster Master: YARN scheduler.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const s1 = document.getElementById("part-s1");
            const s2 = document.getElementById("part-s2");
            s1.classList.add("hidden");
            s2.classList.add("hidden");
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                addLog("command", "$ spark-submit wordcount.py");
                addLog("output", "Spark: Splitting HDFS files. Deploying Map task containers to Worker 1 and Worker 2.");
            } else if (step === 1) {
                addLog("output", "Workers: Processing mapped word emissions. Local intermediate storage populated.");
                addLog("output", "Worker 1 maps: ('apple', 1), ('zebra', 1). Worker 2 maps: ('apple', 1), ('monkey', 1)");
            } else if (step === 2) {
                // Shuffle particles crossing!
                document.getElementById("shuf-2").className = "canvas-link active";
                document.getElementById("shuf-3").className = "canvas-link active";

                addLog("warning", "Network Shuffle: Transporting partition keys across worker networks to sort identical keys together...");
                
                // Animate Worker 1 to Reduce 2, Worker 2 to Reduce 1
                animatePacket(s1, null, 160, 67, 480, 247, 1200 / speed);
                animatePacket(s2, null, 160, 247, 480, 67, 1200 / speed);
            } else if (step === 3) {
                document.getElementById("shuf-1").className = "canvas-link success";
                document.getElementById("shuf-4").className = "canvas-link success";
                
                addLog("output", "Reduce phase: Workers aggregating values per word key.");
                addLog("success", "Execution Completed. Output written to HDFS: ('apple', 2), ('monkey', 1), ('zebra', 1).");
            }
        }
    },

    "btree-index": {
        totalSteps: 4,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Check Root Index Node comparison bounds",
                "Step 2: Follow matching pointer down to Intermediate node range",
                "Step 3: Navigate to Leaf node matching the requested search Key",
                "Step 4: Resolve page pointer offset to retrieve data row from Disk"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Root Node -->
                <foreignObject x="250" y="20" width="140" height="60" class="node-fo" id="bt-root">
                    <div class="canvas-node-card mini active" style="border-color: var(--color-accent)">
                        <div class="node-title" style="font-size: 11px">Root Node [20 | 50]</div>
                    </div>
                </foreignObject>

                <!-- Level 1 Nodes -->
                <foreignObject x="100" y="110" width="130" height="55" class="node-fo" id="bt-level1-left">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.1)">
                        <div class="node-title" style="font-size: 9px">Keys: 1 - 19</div>
                    </div>
                </foreignObject>

                <foreignObject x="260" y="110" width="130" height="55" class="node-fo" id="bt-level1-mid">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.1)">
                        <div class="node-title" style="font-size: 9px">Keys: 20 - 49</div>
                    </div>
                </foreignObject>

                <foreignObject x="420" y="110" width="130" height="55" class="node-fo" id="bt-level1-right">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.1)">
                        <div class="node-title" style="font-size: 9px">Keys: 50+</div>
                    </div>
                </foreignObject>

                <!-- Leaf Node -->
                <foreignObject x="260" y="200" width="130" height="55" class="node-fo" id="bt-leaf">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.1)">
                        <div class="node-title" style="font-size: 9px; font-family: JetBrains Mono" id="bt-leaf-title">Keys: 35, 42, 48</div>
                    </div>
                </foreignObject>

                <!-- Disk Node -->
                <foreignObject x="260" y="290" width="130" height="60" class="node-fo" id="bt-disk">
                    <div class="canvas-node-card mini" style="border-color: var(--color-emerald)">
                        <div class="node-title" style="font-size: 9px" id="bt-disk-val">Disk Row #412A</div>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 320 80 L 165 110" class="canvas-link" id="path-root-l"></path>
                <path d="M 320 80 L 325 110" class="canvas-link" id="path-root-m"></path>
                <path d="M 320 80 L 485 110" class="canvas-link" id="path-root-r"></path>
                
                <path d="M 325 165 L 325 200" class="canvas-link" id="path-mid-leaf"></path>
                <path d="M 325 255 L 325 290" class="canvas-link" id="path-leaf-disk"></path>

                <!-- Search Pointer -->
                <circle cx="320" cy="50" r="6" fill="var(--color-accent)" class="packet hidden" id="packet-btree"></circle>
            `;
            lucide.createIcons();
            addLog("system", `B+ Tree lookup setup. Target Search Key: ${params.search_key || 42}`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const searchKey = parseInt(params.search_key) || 42;
            const packet = document.getElementById("packet-btree");
            packet.classList.add("hidden");
            
            // Adjust leaf keys to match
            document.getElementById("bt-leaf-title").textContent = `Keys: 35, ${searchKey}, 48`;
            document.getElementById("bt-disk-val").textContent = `Disk Row offset #${1000 + searchKey}`;

            // Reset nodes
            document.querySelectorAll(".node-fo .canvas-node-card").forEach(c => {
                if (c.parentElement.id !== "bt-root") c.classList.remove("active");
            });
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                addLog("command", `SELECT * FROM users WHERE id = ${searchKey};`);
                addLog("output", `Root comparison: Key ${searchKey} is >= 20 and < 50. Routing to middle branch pointer.`);
            } else if (step === 1) {
                document.getElementById("path-root-m").className = "canvas-link active";
                document.getElementById("bt-level1-mid").querySelector(".canvas-node-card").classList.add("active");
                
                animatePacket(packet, null, 320, 50, 325, 137, 800 / speed);
                addLog("output", `Intermediate Page: Found Key range 20-49. Fetching child leaf node pointer page.`);
            } else if (step === 2) {
                document.getElementById("path-root-m").className = "canvas-link success";
                document.getElementById("path-mid-leaf").className = "canvas-link active";
                document.getElementById("bt-leaf").querySelector(".canvas-node-card").classList.add("active");
                
                animatePacket(packet, null, 325, 137, 325, 227, 800 / speed);
                addLog("output", `Leaf Node Page: Located exact key ${searchKey}. Resolving page buffer memory address...`);
            } else if (step === 3) {
                document.getElementById("path-root-m").className = "canvas-link success";
                document.getElementById("path-mid-leaf").className = "canvas-link success";
                document.getElementById("path-leaf-disk").className = "canvas-link success";
                document.getElementById("bt-disk").querySelector(".canvas-node-card").classList.add("active");
                
                animatePacket(packet, null, 325, 227, 325, 320, 800 / speed);
                addLog("success", `Data row retrieved from disk block offset #${1000 + searchKey}. Traversal complete (3 page reads).`);
            }
        }
    },

    "batch-streaming": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Event particles flowing on live streaming queue",
                "Step 2: Streaming Engine captures events inside time-based Window boundaries",
                "Step 3: Window triggers aggregation evaluation, outputting state results"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Live Event Stream Timeline -->
                <rect x="20" y="30" width="600" height="90" rx="8" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"></rect>
                <text x="35" y="55" fill="var(--color-text-secondary)" font-size="10" font-weight="bold">LIVE EVENTS STREAM TIMELINE</text>
                
                <!-- Windows boundaries visual markers -->
                <g id="window-boundaries">
                    <line x1="120" y1="30" x2="120" y2="120" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2,2"></line>
                    <line x1="280" y1="30" x2="280" y2="120" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2,2"></line>
                    <line x1="440" y1="30" x2="440" y2="120" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2,2"></line>
                </g>

                <!-- Processing Nodes -->
                <foreignObject x="180" y="160" width="130" height="90" class="node-fo" id="bs-flink">
                    <div class="canvas-node-card active" style="border-color: var(--color-cyan)">
                        <div class="node-icon"><i data-lucide="cpu"></i></div>
                        <div class="node-title">Flink Engine</div>
                        <div class="node-ip" style="font-size: 8px">Real-time Stream</div>
                    </div>
                </foreignObject>

                <foreignObject x="350" y="160" width="130" height="90" class="node-fo" id="bs-sink">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald)">
                        <div class="node-icon"><i data-lucide="database"></i></div>
                        <div class="node-title">Output Console</div>
                    </div>
                </foreignObject>

                <!-- Path from stream into engine and sink -->
                <path d="M 280 120 L 245 160" class="canvas-link" id="link-stream-engine"></path>
                <path d="M 310 205 L 350 205" class="canvas-link" id="link-engine-sink"></path>

                <!-- Stream Particles -->
                <circle cx="50" cy="85" r="5" fill="var(--color-accent)" class="packet" id="sp-1"></circle>
                <circle cx="100" cy="85" r="5" fill="var(--color-accent)" class="packet" id="sp-2"></circle>
                <circle cx="200" cy="85" r="5" fill="var(--color-accent)" class="packet" id="sp-3"></circle>
                <circle cx="260" cy="85" r="5" fill="var(--color-accent)" class="packet" id="sp-4"></circle>
                <circle cx="340" cy="85" r="5" fill="var(--color-accent)" class="packet" id="sp-5"></circle>
                <circle cx="410" cy="85" r="5" fill="var(--color-accent)" class="packet" id="sp-6"></circle>
                <circle cx="500" cy="85" r="5" fill="var(--color-accent)" class="packet" id="sp-7"></circle>
            `;
            lucide.createIcons();
            addLog("system", `Flink streaming environment initialized with window type: ${params.window_type || "Tumbling Window"}`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const linkEngine = document.getElementById("link-stream-engine");
            const linkSink = document.getElementById("link-engine-sink");
            
            linkEngine.className = "canvas-link";
            linkSink.className = "canvas-link";

            if (step === 0) {
                addLog("output", "Stream Source: Event pipeline actively consuming events from order_logs Kafka topic.");
            } else if (step === 1) {
                linkEngine.className = "canvas-link active";
                // Animate events falling from the window timeline into the Flink engine
                const sp3 = document.getElementById("sp-3");
                const sp4 = document.getElementById("sp-4");
                
                animatePacket(sp3, null, 200, 85, 245, 160, 800 / speed);
                animatePacket(sp4, null, 260, 85, 245, 160, 800 / speed);

                addLog("output", `Window Assignment: Accumulating events [sp-3, sp-4] inside time window: 17:01:50 - 17:01:55.`);
            } else if (step === 2) {
                linkEngine.className = "canvas-link success";
                linkSink.className = "canvas-link success";
                
                // Animate output aggregate going to console sink
                const spOut = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                spOut.setAttribute("cx", "245");
                spOut.setAttribute("cy", "205");
                spOut.setAttribute("r", "6");
                spOut.setAttribute("fill", "var(--color-emerald)");
                stage.appendChild(spOut);
                
                animatePacket(spOut, null, 245, 205, 350, 205, 800 / speed, () => {
                    spOut.remove();
                    addLog("success", "Window closed. Trigger evaluated: Output Aggregated Count = 2 orders.");
                });
            }
        }
    }
};
