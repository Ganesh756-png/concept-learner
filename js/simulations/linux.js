const LinuxSimulations = {
    "process-lifecycle": {
        totalSteps: 4,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Process Created (New -> Ready via fork)",
                "Step 2: Dispatched to CPU (Ready -> Running)",
                "Step 3: Process Blocks on I/O (Running -> Blocked)",
                "Step 4: Process resumes and terminates (Blocked -> Ready -> Running -> Terminated)"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- State Cards -->
                <foreignObject x="30" y="40" width="100" height="70" class="node-fo" id="proc-new">
                    <div class="canvas-node-card mini">
                        <div class="node-title">New</div>
                    </div>
                </foreignObject>

                <foreignObject x="200" y="40" width="100" height="70" class="node-fo" id="proc-ready">
                    <div class="canvas-node-card mini active">
                        <div class="node-title">Ready</div>
                    </div>
                </foreignObject>

                <foreignObject x="370" y="40" width="100" height="70" class="node-fo" id="proc-running">
                    <div class="canvas-node-card mini">
                        <div class="node-title">Running</div>
                    </div>
                </foreignObject>

                <foreignObject x="370" y="200" width="100" height="70" class="node-fo" id="proc-blocked">
                    <div class="canvas-node-card mini">
                        <div class="node-title">Blocked</div>
                    </div>
                </foreignObject>

                <foreignObject x="540" y="40" width="100" height="70" class="node-fo" id="proc-term">
                    <div class="canvas-node-card mini">
                        <div class="node-title">Terminated</div>
                    </div>
                </foreignObject>

                <!-- Connection Lines -->
                <path d="M 130 75 L 200 75" class="canvas-link" id="l-new-ready"></path>
                <path d="M 300 65 L 370 65" class="canvas-link" id="l-ready-run"></path>
                <path d="M 370 85 L 300 85" class="canvas-link" id="l-run-ready"></path>
                <path d="M 420 110 L 420 200" class="canvas-link" id="l-run-block"></path>
                <path d="M 370 235 L 250 235 L 250 110" class="canvas-link" id="l-block-ready"></path>
                <path d="M 470 75 L 540 75" class="canvas-link" id="l-run-term"></path>

                <!-- Process Token -->
                <circle cx="80" cy="75" r="8" fill="var(--color-cyan)" filter="url(#glow-effect)" class="packet hidden" id="proc-token"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Process State Machine initialized. Process parent PID: 10001.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const token = document.getElementById("proc-token");
            token.classList.add("hidden");

            // Reset cards styling
            document.querySelectorAll(".node-fo .canvas-node-card").forEach(c => c.classList.remove("active"));
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("proc-new").querySelector(".canvas-node-card").classList.add("active");
                document.getElementById("l-new-ready").className = "canvas-link active";
                
                animatePacket(token, null, 80, 75, 250, 75, 1000 / speed, () => {
                    document.getElementById("proc-ready").querySelector(".canvas-node-card").classList.add("active");
                    addLog("command", "$ fork()");
                    addLog("output", "OS Fork: Process 10243 created. State set to TASK_RUNNING (Ready in queue).");
                });
            } else if (step === 1) {
                document.getElementById("proc-ready").querySelector(".canvas-node-card").classList.add("active");
                document.getElementById("l-ready-run").className = "canvas-link active";

                animatePacket(token, null, 250, 75, 420, 75, 800 / speed, () => {
                    document.getElementById("proc-running").querySelector(".canvas-node-card").classList.add("active");
                    addLog("output", "Scheduler Dispatch: Process allocated CPU core 0. State: Running.");
                });
            } else if (step === 2) {
                document.getElementById("proc-running").querySelector(".canvas-node-card").classList.add("active");
                document.getElementById("l-run-block").className = "canvas-link active";

                animatePacket(token, null, 420, 75, 420, 235, 800 / speed, () => {
                    document.getElementById("proc-blocked").querySelector(".canvas-node-card").classList.add("active");
                    addLog("output", "Syscall read(): Process requests disk data. Yields CPU. State: TASK_INTERRUPTIBLE (Blocked/Sleep).");
                });
            } else if (step === 3) {
                document.getElementById("proc-blocked").querySelector(".canvas-node-card").classList.add("active");
                document.getElementById("l-block-ready").className = "canvas-link active";

                animatePacket(token, null, 420, 235, 250, 235, 600 / speed, () => {
                    animatePacket(token, null, 250, 235, 250, 75, 500 / speed, () => {
                        document.getElementById("proc-ready").querySelector(".canvas-node-card").classList.add("active");
                        addLog("output", "Disk Controller: I/O completed. Interrupt fired. State: Ready.");
                        
                        setTimeout(() => {
                            document.getElementById("l-run-term").className = "canvas-link success";
                            animatePacket(token, null, 420, 75, 590, 75, 800 / speed, () => {
                                document.getElementById("proc-term").querySelector(".canvas-node-card").classList.add("active");
                                addLog("success", "Process finished execution with exit code 0. State: Terminated.");
                            });
                        }, 500);
                    });
                });
            }
        }
    },

    "pipes-redirection": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: 'cat syslog' writes byte stream to stdout",
                "Step 2: '|' directs stream into 'grep' stdin, which filters matches",
                "Step 3: Second pipe feeds matches to 'wc -l' to return numeric output"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Processes -->
                <foreignObject x="20" y="130" width="110" height="90" class="node-fo" id="pipe-proc1">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-title">cat syslog</div>
                        <div class="node-ip" style="font-size: 8px">FD 1 -> Pipe 1</div>
                    </div>
                </foreignObject>

                <foreignObject x="240" y="130" width="110" height="90" class="node-fo" id="pipe-proc2">
                    <div class="canvas-node-card" style="border-color: var(--color-cyan)">
                        <div class="node-title">grep ERROR</div>
                        <div class="node-ip" style="font-size: 8px">FD 0 <- P1 | FD 1 -> P2</div>
                    </div>
                </foreignObject>

                <foreignObject x="460" y="130" width="110" height="90" class="node-fo" id="pipe-proc3">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-title">wc -l</div>
                        <div class="node-ip" style="font-size: 8px">FD 0 <- P2 | FD 1 -> STDOUT</div>
                    </div>
                </foreignObject>

                <!-- Pipe Links -->
                <path d="M 130 175 L 240 175" class="canvas-link" id="link-pipe1"></path>
                <path d="M 350 175 L 460 175" class="canvas-link" id="link-pipe2"></path>

                <!-- Animated Particles (Multiple packets representing streams) -->
                <circle cx="130" cy="175" r="4" fill="var(--color-accent)" class="packet hidden" id="stream-p1"></circle>
                <circle cx="130" cy="175" r="4" fill="var(--color-accent)" class="packet hidden" id="stream-p2"></circle>
                <circle cx="350" cy="175" r="4" fill="var(--color-cyan)" class="packet hidden" id="stream-p3"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Pipeline setup completed. Buffer sizes: 64KB.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const p1 = document.getElementById("stream-p1");
            const p2 = document.getElementById("stream-p2");
            const p3 = document.getElementById("stream-p3");
            p1.classList.add("hidden");
            p2.classList.add("hidden");
            p3.classList.add("hidden");

            document.getElementById("link-pipe1").className = "canvas-link";
            document.getElementById("link-pipe2").className = "canvas-link";

            if (step === 0) {
                document.getElementById("link-pipe1").className = "canvas-link active";
                addLog("command", "$ cat syslog");
                addLog("output", "Reading syslog file. Pushing 4,200 lines to pipe stdout buffer...");
                
                animatePacket(p1, null, 130, 175, 240, 175, 800 / speed);
                setTimeout(() => {
                    animatePacket(p2, null, 130, 175, 240, 175, 800 / speed);
                }, 300);
            } else if (step === 1) {
                document.getElementById("link-pipe1").className = "canvas-link success";
                document.getElementById("link-pipe2").className = "canvas-link active";
                document.getElementById("pipe-proc2").querySelector(".canvas-node-card").classList.add("active");
                addLog("output", "grep: Reading stdin pipe. Filtering lines containing 'ERROR'...");
                
                animatePacket(p3, null, 350, 175, 460, 175, 800 / speed);
            } else if (step === 2) {
                document.getElementById("link-pipe1").className = "canvas-link success";
                document.getElementById("link-pipe2").className = "canvas-link success";
                document.getElementById("pipe-proc3").querySelector(".canvas-node-card").classList.add("active");
                addLog("output", "wc: Reading filtered matches. Counting occurrences...");
                addLog("success", "STDOUT Count Result: 42");
            }
        }
    },

    "permissions-chmod": {
        totalSteps: 2,
        getStepLabel: (idx) => {
            return idx === 0 ? "Step 1: View Default File permissions" : "Step 2: Apply Chmod modification";
        },
        setup: (stage, params, addLog) => {
            const modeStr = params.octal || "755 (Exec/Read)";
            const octalNum = modeStr.split(" ")[0];

            let permText = "-rw-r--r--"; // default
            if (octalNum === "777") permText = "-rwxrwxrwx";
            else if (octalNum === "755") permText = "-rwxr-xr-x";
            else if (octalNum === "644") permText = "-rw-r--r--";
            else if (octalNum === "700") permText = "-rwx------";

            stage.innerHTML = `
                <!-- File Object -->
                <foreignObject x="80" y="50" width="480" height="90" class="node-fo">
                    <div class="canvas-node-card active" style="flex-direction: row; justify-content: space-around; align-items: center">
                        <div>
                            <div class="node-title" style="font-size: 14px"><i data-lucide="file-code" style="vertical-align:middle; margin-right:6px"></i>script.sh</div>
                            <div class="node-ip" style="font-family: JetBrains Mono; font-size: 13px; margin-top:4px" id="perm-string">${permText}</div>
                        </div>
                        <div style="text-align: right">
                            <span class="node-badge success" id="perm-octal">Mode: ${octalNum}</span>
                        </div>
                    </div>
                </foreignObject>

                <!-- Users Classes Grid -->
                <g transform="translate(80, 160)">
                    <!-- Owner -->
                    <foreignObject x="0" y="0" width="130" height="130" class="node-fo">
                        <div class="canvas-node-card" id="c-owner">
                            <div class="node-title" style="font-size: 12px">User (Owner)</div>
                            <div class="perm-chk-list" id="chk-owner" style="font-size: 10px; color: var(--color-text-secondary); text-align: left; width: 100%">
                                <!-- Rendered dynamically -->
                            </div>
                        </div>
                    </foreignObject>

                    <!-- Group -->
                    <foreignObject x="165" y="0" width="130" height="130" class="node-fo">
                        <div class="canvas-node-card" id="c-group">
                            <div class="node-title" style="font-size: 12px">Group</div>
                            <div class="perm-chk-list" id="chk-group" style="font-size: 10px; color: var(--color-text-secondary); text-align: left; width: 100%">
                                <!-- Rendered dynamically -->
                            </div>
                        </div>
                    </foreignObject>

                    <!-- Others -->
                    <foreignObject x="330" y="0" width="130" height="130" class="node-fo">
                        <div class="canvas-node-card" id="c-others">
                            <div class="node-title" style="font-size: 12px">Others</div>
                            <div class="perm-chk-list" id="chk-others" style="font-size: 10px; color: var(--color-text-secondary); text-align: left; width: 100%">
                                <!-- Rendered dynamically -->
                            </div>
                        </div>
                    </foreignObject>
                </g>
            `;
            lucide.createIcons();
            LinuxSimulations["permissions-chmod"].renderBits(octalNum);
            addLog("system", "Permissions module ready. Target: script.sh.");
        },
        renderBits: (octal) => {
            const u = parseInt(octal[0]);
            const g = parseInt(octal[1]);
            const o = parseInt(octal[2]);

            const getChks = (val) => {
                const r = (val & 4) ? "● Read" : "○ Read (No)";
                const w = (val & 2) ? "● Write" : "○ Write (No)";
                const x = (val & 1) ? "● Execute" : "○ Execute (No)";
                return `<div>${r}</div><div>${w}</div><div>${x}</div>`;
            };

            document.getElementById("chk-owner").innerHTML = getChks(u);
            document.getElementById("chk-group").innerHTML = getChks(g);
            document.getElementById("chk-others").innerHTML = getChks(o);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const modeStr = params.octal || "755 (Exec/Read)";
            const octalNum = modeStr.split(" ")[0];

            if (step === 0) {
                addLog("command", "$ ls -l script.sh");
                addLog("output", `-rw-r--r-- 1 root root 1024 Jun 25 17:01 script.sh`);
            } else if (step === 1) {
                addLog("command", `$ chmod ${octalNum} script.sh`);
                
                let permText = "-rw-r--r--";
                if (octalNum === "777") permText = "-rwxrwxrwx";
                else if (octalNum === "755") permText = "-rwxr-xr-x";
                else if (octalNum === "644") permText = "-rw-r--r--";
                else if (octalNum === "700") permText = "-rwx------";

                document.getElementById("perm-string").textContent = permText;
                document.getElementById("perm-octal").textContent = `Mode: ${octalNum}`;
                LinuxSimulations["permissions-chmod"].renderBits(octalNum);
                
                addLog("success", `Permissions updated. script.sh is now configured as ${permText}.`);
            }
        }
    },

    "inodes-links": {
        totalSteps: 2,
        getStepLabel: (idx) => {
            return idx === 0 ? "Step 1: Check Inode links map" : "Step 2: Trigger Link operation";
        },
        setup: (stage, params, addLog) => {
            const linkAction = params.link_type || "Create Hard Link";

            stage.innerHTML = `
                <!-- Directory Entry block -->
                <g id="links-filenames">
                    <foreignObject x="30" y="30" width="140" height="60" class="node-fo" id="fn-target">
                        <div class="canvas-node-card mini active">
                            <div class="node-title">target.txt</div>
                        </div>
                    </foreignObject>

                    <foreignObject x="30" y="130" width="140" height="60" class="node-fo hidden" id="fn-hard">
                        <div class="canvas-node-card mini" style="border-color: var(--color-cyan)">
                            <div class="node-title">hard.txt (Hard)</div>
                        </div>
                    </foreignObject>

                    <foreignObject x="30" y="230" width="140" height="60" class="node-fo hidden" id="fn-soft">
                        <div class="canvas-node-card mini" style="border-color: var(--color-violet)">
                            <div class="node-title">soft.txt (Soft)</div>
                        </div>
                    </foreignObject>
                </g>

                <!-- Inode Structure block -->
                <foreignObject x="280" y="110" width="140" height="100" class="node-fo" id="inode-main">
                    <div class="canvas-node-card" style="border-color: var(--color-amber)">
                        <div class="node-title">Inode 1048576</div>
                        <div class="node-ip" style="font-size: 8px">Links Count: <span id="inode-links-count">1</span></div>
                        <div class="node-ip" style="font-size: 8px">Blocks pointer: #451A</div>
                    </div>
                </foreignObject>

                <!-- Soft Link standalone inode -->
                <foreignObject x="280" y="240" width="140" height="70" class="node-fo hidden" id="inode-soft">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-title">Inode 2097152</div>
                        <div class="node-ip" style="font-size: 8px">Ref: target.txt</div>
                    </div>
                </foreignObject>

                <!-- Physical Storage Blocks -->
                <foreignObject x="510" y="115" width="110" height="90" class="node-fo" id="disk-block">
                    <div class="canvas-node-card active" style="border-color: var(--color-emerald)">
                        <div class="node-title">Disk Sector</div>
                        <div class="node-ip" style="font-family: JetBrains Mono; font-size: 9px">"hello world"</div>
                    </div>
                </foreignObject>

                <!-- Links Paths -->
                <path d="M 170 60 L 280 140" class="canvas-link" id="link-target-inode"></path>
                <path d="M 170 160 L 280 160" class="canvas-link hidden" id="link-hard-inode"></path>
                <path d="M 170 260 L 280 270" class="canvas-link hidden" id="link-soft-inode"></path>
                <path d="M 170 260 L 100 90" class="canvas-link hidden" id="link-soft-target" stroke-dasharray="2,2"></path>
                
                <path d="M 420 160 L 510 160" class="canvas-link success" id="link-inode-disk"></path>
            `;
            lucide.createIcons();
            addLog("system", "Inodes map loaded. Target file target.txt points to Inode 1048576.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const action = params.link_type || "Create Hard Link";
            const fnHard = document.getElementById("fn-hard");
            const fnSoft = document.getElementById("fn-soft");
            const linkHard = document.getElementById("link-hard-inode");
            const linkSoft = document.getElementById("link-soft-inode");
            const linkSoftTarget = document.getElementById("link-soft-target");
            const inodeSoft = document.getElementById("inode-soft");
            const linksCount = document.getElementById("inode-links-count");

            if (step === 0) {
                addLog("command", "$ stat target.txt");
                addLog("output", "  File: target.txt\n  Size: 12\n  Blocks: 8\n  Inode: 1048576  Links: 1");
            } else if (step === 1) {
                if (action === "Create Hard Link") {
                    fnHard.classList.remove("hidden");
                    linkHard.classList.remove("hidden");
                    linkHard.className = "canvas-link success";
                    linksCount.textContent = "2";

                    addLog("command", "$ ln target.txt hard.txt");
                    addLog("success", "Hard link created. hard.txt shares Inode 1048576. Link count incremented to 2.");
                } else if (action === "Create Soft Link") {
                    fnSoft.classList.remove("hidden");
                    inodeSoft.classList.remove("hidden");
                    linkSoft.classList.remove("hidden");
                    linkSoftTarget.classList.remove("hidden");
                    linkSoft.className = "canvas-link success";
                    linkSoftTarget.className = "canvas-link active";

                    addLog("command", "$ ln -s target.txt soft.txt");
                    addLog("success", "Symbolic link created. soft.txt gets its own Inode 2097152 pointing to string 'target.txt'.");
                } else if (action === "Delete Target File") {
                    // Remove target file entry
                    document.getElementById("fn-target").classList.add("hidden");
                    document.getElementById("link-target-inode").classList.add("hidden");
                    
                    addLog("command", "$ rm target.txt");
                    
                    // If hard link was present (simulated)
                    const hardActive = !fnHard.classList.contains("hidden");
                    const softActive = !fnSoft.classList.contains("hidden");

                    if (hardActive) {
                        linksCount.textContent = "1";
                        addLog("warning", "target.txt deleted. hard.txt remains intact as Inode 1048576 link count drops to 1. Data remains readable.");
                    } else if (softActive) {
                        linkSoftTarget.className = "canvas-link error";
                        addLog("error", "target.txt deleted. soft.txt is now a BROKEN SYMLINK pointing to a non-existent path!");
                    } else {
                        linksCount.textContent = "0";
                        document.getElementById("link-inode-disk").classList.add("hidden");
                        addLog("warning", "target.txt deleted. Inode links = 0. Disk blocks marked as free for reuse.");
                    }
                }
            }
        }
    },

    "systemd-manager": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: systemctl command is sent to systemd daemon",
                "Step 2: systemd loads config unit, checks dependencies, forks process",
                "Step 3: Service process launched under Control Group (cgroups) slice"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Systemd main core -->
                <foreignObject x="30" y="110" width="130" height="110" class="node-fo" id="sd-core">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-icon"><i data-lucide="cpu"></i></div>
                        <div class="node-title">systemd (PID 1)</div>
                    </div>
                </foreignObject>

                <!-- Service configuration card -->
                <foreignObject x="250" y="30" width="150" height="90" class="node-fo" id="sd-unit">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.1)">
                        <div class="node-title" style="font-size: 10px">prometheus.service</div>
                        <div class="node-ip" style="font-size: 8px">ExecStart=/usr/...</div>
                    </div>
                </foreignObject>

                <!-- Service Runtime Node -->
                <foreignObject x="250" y="210" width="150" height="100" class="node-fo" id="sd-runtime">
                    <div class="canvas-node-card" style="border-color: var(--color-cyan)">
                        <div class="node-title">CGroup slice</div>
                        <div class="node-ip" style="font-size: 8px">/system.slice/prometheus</div>
                        <span class="node-badge" id="service-runtime-badge">inactive (dead)</span>
                    </div>
                </foreignObject>

                <!-- Journald Logs Collector -->
                <foreignObject x="490" y="120" width="140" height="90" class="node-fo" id="sd-journald">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-title">journald logs</div>
                        <div class="node-ip" style="font-family: JetBrains Mono; font-size: 8px" id="sd-log-line">No logs yet</div>
                    </div>
                </foreignObject>

                <!-- Connections -->
                <path d="M 160 140 L 250 80" class="canvas-link" id="link-sd-unit"></path>
                <path d="M 160 190 L 250 250" class="canvas-link" id="link-sd-runtime"></path>
                <path d="M 400 240 L 490 190" class="canvas-link" id="link-runtime-logs"></path>

                <!-- Packet -->
                <circle cx="160" cy="190" r="6" class="packet hidden" id="packet-sd"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Systemd controller initialized.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const action = params.service_cmd || "systemctl start";
            const packet = document.getElementById("packet-sd");
            const rBadge = document.getElementById("service-runtime-badge");
            const rLogs = document.getElementById("sd-log-line");
            
            packet.classList.add("hidden");
            document.getElementById("link-sd-unit").className = "canvas-link";
            document.getElementById("link-sd-runtime").className = "canvas-link";

            if (step === 0) {
                addLog("command", `$ ${action} prometheus`);
                if (action === "systemctl start") {
                    addLog("output", "Systemd: Received start request. Validating dependencies...");
                } else if (action === "systemctl stop") {
                    addLog("output", "Systemd: Received stop request. Initiating SIGTERM sequence...");
                } else if (action === "systemctl status") {
                    addLog("output", "Systemd: Fetching unit configuration and runtime logs...");
                } else { // Restart
                    addLog("output", "Systemd: Initiating Service Restart cycle...");
                }
            } else if (step === 1) {
                document.getElementById("link-sd-unit").className = "canvas-link active";
                addLog("output", "Reading Prometheus service unit file configuration rules...");
            } else if (step === 2) {
                document.getElementById("link-sd-runtime").className = "canvas-link success";
                document.getElementById("link-runtime-logs").className = "canvas-link success";
                
                if (action === "systemctl start" || action === "systemctl restart") {
                    rBadge.textContent = "active (running)";
                    rBadge.className = "node-badge success";
                    rLogs.textContent = "[info] Server listening on port 9090";
                    animatePacket(packet, null, 160, 190, 250, 250, 1000 / speed);
                    addLog("success", "Service started successfully. Process PID: 14520.");
                } else if (action === "systemctl stop") {
                    rBadge.textContent = "inactive (dead)";
                    rBadge.className = "node-badge";
                    rLogs.textContent = "[info] Terminating signal caught. Dead.";
                    addLog("success", "Service stopped successfully. Resources released.");
                } else { // Status
                    rBadge.textContent = "active (running)";
                    rBadge.className = "node-badge success";
                    addLog("success", "Service Prometheus is loaded, active, and running.");
                }
            }
        }
    },

    "linux-cron-jobs": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Crond daemon wakes up and scans /etc/crontab config rules",
                "Step 2: Match triggered. Crond forks background task runner process",
                "Step 3: Task completes execution, writing log outputs and sending notifications"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Crond Daemon -->
                <foreignObject x="30" y="110" width="130" height="110" class="node-fo" id="cron-daemon">
                    <div class="canvas-node-card active" style="border-color: var(--color-cyan)">
                        <div class="node-icon"><i data-lucide="clock"></i></div>
                        <div class="node-title">crond (daemon)</div>
                        <span class="node-badge primary">Polling</span>
                    </div>
                </foreignObject>

                <!-- /etc/crontab file -->
                <foreignObject x="250" y="30" width="140" height="90" class="node-fo" id="cron-config">
                    <div class="canvas-node-card mini" style="border-color: rgba(255,255,255,0.1)">
                        <div class="node-title" style="font-size: 10px">/etc/crontab</div>
                        <div class="node-ip" style="font-family: JetBrains Mono; font-size: 8px">*/5 * * * * backup.sh</div>
                    </div>
                </foreignObject>

                <!-- Forked script task -->
                <foreignObject x="250" y="210" width="140" height="90" class="node-fo" id="cron-forked">
                    <div class="canvas-node-card" style="border-color: var(--color-violet)">
                        <div class="node-title">backup.sh [PID 1840]</div>
                        <span class="node-badge" id="cron-runtime-status">inactive</span>
                    </div>
                </foreignObject>

                <!-- Logs Output (/var/log/cron) -->
                <foreignObject x="490" y="120" width="130" height="100" class="node-fo" id="cron-logs">
                    <div class="canvas-node-card" style="border-color: var(--color-emerald)">
                        <div class="node-title">/var/log/cron</div>
                        <div class="node-ip" style="font-family: JetBrains Mono; font-size: 8px" id="cron-log-line">Awaiting execution...</div>
                    </div>
                </foreignObject>

                <!-- Paths -->
                <path d="M 160 140 L 250 80" class="canvas-link" id="link-cron-config"></path>
                <path d="M 160 190 L 250 250" class="canvas-link" id="link-cron-fork"></path>
                <path d="M 390 250 L 490 190" class="canvas-link" id="link-cron-logs-out"></path>

                <!-- Packet -->
                <circle cx="160" cy="190" r="6" fill="var(--color-cyan)" class="packet hidden" id="packet-cron"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Crond scheduler active. System crontabs loaded.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-cron");
            const rBadge = document.getElementById("cron-runtime-status");
            const rLogs = document.getElementById("cron-log-line");
            
            packet.classList.add("hidden");
            document.getElementById("link-cron-config").className = "canvas-link";
            document.getElementById("link-cron-fork").className = "canvas-link";
            document.getElementById("link-cron-logs-out").className = "canvas-link";

            if (step === 0) {
                document.getElementById("link-cron-config").className = "canvas-link active";
                addLog("command", "$ tail -f /var/log/cron");
                addLog("output", "crond: Waking up (minute tick)... Scanning /etc/crontab entries.");
                animatePacket(packet, null, 160, 140, 250, 80, 800 / speed);
            } else if (step === 1) {
                document.getElementById("link-cron-fork").className = "canvas-link active";
                document.getElementById("cron-forked").querySelector(".canvas-node-card").classList.add("active");
                rBadge.textContent = "running";
                rBadge.className = "node-badge primary";

                addLog("output", "crond: Entry matched: '*/5 * * * * backup.sh'. Forking child process 1840.");
                animatePacket(packet, null, 160, 190, 250, 250, 800 / speed);
            } else if (step === 2) {
                document.getElementById("link-cron-fork").className = "canvas-link success";
                document.getElementById("link-cron-logs-out").className = "canvas-link success";
                document.getElementById("cron-logs").querySelector(".canvas-node-card").classList.add("active");
                
                rBadge.textContent = "finished (0)";
                rBadge.className = "node-badge success";
                rLogs.textContent = "Jun 26 10:05:00 crond[942]: CMD (backup.sh)";

                addLog("success", "backup.sh: Finished. Exit code 0. Log entry written.");
                animatePacket(packet, null, 390, 250, 490, 190, 1000 / speed);
            }
        }
    }
};
