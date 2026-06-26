const NetworkingSimulations = {
    "tcp-handshake": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Client sends SYN (Synchronize)",
                "Step 2: Server replies with SYN-ACK",
                "Step 3: Client replies with ACK"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Client Node -->
                <foreignObject x="80" y="130" width="120" height="110" class="node-fo" id="node-client">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="monitor"></i></div>
                        <div class="node-title">Client</div>
                        <div class="node-ip">192.168.1.50</div>
                        <span class="node-badge" id="client-state">CLOSED</span>
                    </div>
                </foreignObject>

                <!-- Server Node -->
                <foreignObject x="480" y="130" width="120" height="110" class="node-fo" id="node-server">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="server"></i></div>
                        <div class="node-title">Web Server</div>
                        <div class="node-ip">10.0.0.5</div>
                        <span class="node-badge" id="server-state">LISTEN</span>
                    </div>
                </foreignObject>

                <!-- Link Line -->
                <path d="M 200 185 L 480 185" class="canvas-link" id="link-main"></path>
                
                <!-- Animated Packet -->
                <circle cx="200" cy="185" r="8" class="packet hidden" id="packet-tcp"></circle>
                
                <!-- Label on path -->
                <g id="packet-tag" class="hidden" transform="translate(0, 0)">
                    <rect x="-35" y="-30" width="70" height="20" rx="4" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.2)" stroke-width="1"></rect>
                    <text x="0" y="-16" fill="white" font-size="9" font-family="JetBrains Mono" text-anchor="middle" id="packet-tag-text">SYN</text>
                </g>
            `;
            lucide.createIcons();
            addLog("system", "TCP Handshake environment initialized.");
            addLog("system", "Server is listening on 10.0.0.5:80.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const clientState = document.getElementById("client-state");
            const serverState = document.getElementById("server-state");
            const link = document.getElementById("link-main");
            const packet = document.getElementById("packet-tcp");
            const tag = document.getElementById("packet-tag");
            const tagText = document.getElementById("packet-tag-text");
            const initSeq = parseInt(params.init_seq) || 1000;
            const lossSim = params.loss_rate === "30% (Lossy)";

            // Reset states
            packet.classList.add("hidden");
            tag.classList.add("hidden");
            link.className = "canvas-link active";

            if (step === 0) {
                // SYN Step
                clientState.textContent = "SYN_SENT";
                clientState.className = "node-badge primary";
                serverState.textContent = "LISTEN";
                serverState.className = "node-badge";
                
                tagText.textContent = `SYN (Seq=${initSeq})`;
                animatePacket(packet, tag, 200, 185, 480, 185, 1200 / speed, () => {
                    if (lossSim) {
                        addLog("error", `[LOSS] SYN packet dropped in transit! Retrying...`);
                        packet.classList.add("hidden");
                        tag.classList.add("hidden");
                        clientState.textContent = "SYN_SENT (Timeout)";
                        clientState.className = "node-badge danger";
                        link.className = "canvas-link error";
                    } else {
                        serverState.textContent = "SYN_RCVD";
                        serverState.className = "node-badge warning";
                        addLog("command", `TCP > 10.0.0.5.80: Flags [S], seq ${initSeq}, win 64240`);
                        addLog("output", `Server received SYN. Preparing SYN-ACK reply.`);
                    }
                });
            } else if (step === 1) {
                // SYN-ACK Step
                if (lossSim) {
                    addLog("warning", "Skipping SYN-ACK step due to simulation loss state. Reset or change parameters.");
                    return;
                }
                clientState.textContent = "SYN_SENT";
                clientState.className = "node-badge primary";
                serverState.textContent = "SYN_RCVD";
                serverState.className = "node-badge warning";

                const serverSeq = 4000;
                tagText.textContent = `SYN-ACK (Seq=${serverSeq}, Ack=${initSeq + 1})`;
                animatePacket(packet, tag, 480, 185, 200, 185, 1200 / speed, () => {
                    clientState.textContent = "ESTABLISHED";
                    clientState.className = "node-badge success";
                    addLog("command", `TCP < 10.0.0.5.80: Flags [S.], seq ${serverSeq}, ack ${initSeq + 1}, win 65535`);
                    addLog("output", `Client received SYN-ACK. Establishing socket descriptor.`);
                });
            } else if (step === 2) {
                // ACK Step
                if (lossSim) return;
                clientState.textContent = "ESTABLISHED";
                clientState.className = "node-badge success";
                serverState.textContent = "SYN_RCVD";
                serverState.className = "node-badge warning";

                const serverSeq = 4000;
                tagText.textContent = `ACK (Seq=${initSeq + 1}, Ack=${serverSeq + 1})`;
                animatePacket(packet, tag, 200, 185, 480, 185, 1200 / speed, () => {
                    serverState.textContent = "ESTABLISHED";
                    serverState.className = "node-badge success";
                    link.className = "canvas-link success";
                    addLog("command", `TCP > 10.0.0.5.80: Flags [.], seq ${initSeq + 1}, ack ${serverSeq + 1}`);
                    addLog("success", `Connection established. 3-Way Handshake completed successfully!`);
                });
            }
        }
    },

    "dns-resolution": {
        totalSteps: 5,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Client queries Local Resolver",
                "Step 2: Resolver queries Root Nameserver",
                "Step 3: Resolver queries TLD Nameserver (.com)",
                "Step 4: Resolver queries Authoritative Nameserver (google.com)",
                "Step 5: Resolver returns IP 142.250.190.46 to Client"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Client Node -->
                <foreignObject x="50" y="150" width="110" height="90" class="node-fo" id="dns-client">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="monitor"></i></div>
                        <div class="node-title">Client</div>
                        <div class="node-ip">192.168.1.50</div>
                    </div>
                </foreignObject>

                <!-- Local DNS Resolver Node -->
                <foreignObject x="250" y="150" width="120" height="100" class="node-fo" id="dns-resolver">
                    <div class="canvas-node-card active">
                        <div class="node-icon"><i data-lucide="server"></i></div>
                        <div class="node-title">Local Resolver</div>
                        <div class="node-ip" style="font-size: 8px">192.168.1.1 (ISP)</div>
                    </div>
                </foreignObject>

                <!-- Root NS Node -->
                <foreignObject x="480" y="30" width="130" height="80" class="node-fo" id="dns-root">
                    <div class="canvas-node-card">
                        <div class="node-title" style="font-size: 10px">Root Nameserver</div>
                        <div class="node-ip" style="font-size: 8px">192.5.5.241 (b.root)</div>
                    </div>
                </foreignObject>

                <!-- TLD NS Node -->
                <foreignObject x="480" y="150" width="130" height="80" class="node-fo" id="dns-tld">
                    <div class="canvas-node-card">
                        <div class="node-title" style="font-size: 10px">.com TLD Server</div>
                        <div class="node-ip" style="font-size: 8px">192.26.92.30 (gtld)</div>
                    </div>
                </foreignObject>

                <!-- Auth NS Node -->
                <foreignObject x="480" y="270" width="130" height="80" class="node-fo" id="dns-auth">
                    <div class="canvas-node-card">
                        <div class="node-title" style="font-size: 10px">Google Auth NS</div>
                        <div class="node-ip" style="font-size: 8px">216.239.32.10 (ns1)</div>
                    </div>
                </foreignObject>

                <!-- Connections -->
                <path d="M 160 195 L 250 195" class="canvas-link" id="link-client-res"></path>
                <path d="M 370 180 L 480 70" class="canvas-link" id="link-res-root"></path>
                <path d="M 370 200 L 480 190" class="canvas-link" id="link-res-tld"></path>
                <path d="M 370 220 L 480 310" class="canvas-link" id="link-res-auth"></path>

                <!-- Packet -->
                <circle cx="160" cy="195" r="6" class="packet hidden" id="packet-dns"></circle>
            `;
            lucide.createIcons();
            addLog("system", "DNS simulation loaded. Resolver ready.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const cacheHit = params.cache === true;
            const packet = document.getElementById("packet-dns");
            packet.classList.add("hidden");

            // Reset links
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (cacheHit) {
                // Instantly resolve from local cache
                addLog("warning", "Local DNS Cache is ENABLED. Resolving locally...");
                document.getElementById("link-client-res").className = "canvas-link success";
                animatePacket(packet, null, 50, 195, 250, 195, 600 / speed, () => {
                    animatePacket(packet, null, 250, 195, 50, 195, 600 / speed, () => {
                        addLog("success", "DNS cache hit: google.com -> 142.250.190.46 (TTL: 0s)");
                        alertUser("DNS Local Cache Hit!");
                    });
                });
                return;
            }

            if (step === 0) {
                // Client -> Resolver
                document.getElementById("link-client-res").className = "canvas-link active";
                animatePacket(packet, null, 160, 195, 250, 195, 1000 / speed, () => {
                    addLog("command", "$ dig google.com");
                    addLog("output", ";; Querying Local Resolver 192.168.1.1:53...");
                });
            } else if (step === 1) {
                // Resolver -> Root -> Resolver
                document.getElementById("link-res-root").className = "canvas-link active";
                animatePacket(packet, null, 370, 180, 480, 70, 800 / speed, () => {
                    animatePacket(packet, null, 480, 70, 370, 180, 800 / speed, () => {
                        addLog("output", ";; Root NS response: Refer to .com TLD server (192.26.92.30)");
                    });
                });
            } else if (step === 2) {
                // Resolver -> TLD -> Resolver
                document.getElementById("link-res-tld").className = "canvas-link active";
                animatePacket(packet, null, 370, 200, 480, 190, 800 / speed, () => {
                    animatePacket(packet, null, 480, 190, 370, 200, 800 / speed, () => {
                        addLog("output", ";; TLD NS response: Refer to ns1.google.com (216.239.32.10)");
                    });
                });
            } else if (step === 3) {
                // Resolver -> Auth -> Resolver
                document.getElementById("link-res-auth").className = "canvas-link active";
                animatePacket(packet, null, 370, 220, 480, 310, 800 / speed, () => {
                    animatePacket(packet, null, 480, 310, 370, 220, 800 / speed, () => {
                        addLog("output", ";; Auth NS response: google.com has Address 142.250.190.46");
                    });
                });
            } else if (step === 4) {
                // Resolver -> Client
                document.getElementById("link-client-res").className = "canvas-link success";
                animatePacket(packet, null, 250, 195, 160, 195, 1000 / speed, () => {
                    addLog("success", ";; Query time: 35 msec\n;; ANSWER SECTION:\ngoogle.com.   300   IN   A   142.250.190.46");
                });
            }
        }
    },

    "dhcp-allocation": {
        totalSteps: 4,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: DHCP Discover (Broadcast search for DHCP Server)",
                "Step 2: DHCP Offer (Server proposes IP address lease)",
                "Step 3: DHCP Request (Client requests to lease the IP)",
                "Step 4: DHCP Acknowledge (Server commits IP Lease allocation)"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Client Node -->
                <foreignObject x="100" y="140" width="120" height="110" class="node-fo" id="dhcp-client">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="monitor"></i></div>
                        <div class="node-title">Unconfigured PC</div>
                        <div class="node-ip" id="dhcp-client-ip">0.0.0.0</div>
                    </div>
                </foreignObject>

                <!-- DHCP Server Node -->
                <foreignObject x="450" y="140" width="130" height="110" class="node-fo" id="dhcp-server">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="server"></i></div>
                        <div class="node-title">DHCP Server</div>
                        <div class="node-ip">192.168.1.1</div>
                    </div>
                </foreignObject>

                <path d="M 220 195 L 450 195" class="canvas-link" id="link-dhcp"></path>
                <circle cx="220" cy="195" r="8" class="packet hidden" id="packet-dhcp"></circle>
            `;
            lucide.createIcons();
            addLog("system", "DHCP Server active on subnet 192.168.1.0/24");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const packet = document.getElementById("packet-dhcp");
            const clientIp = document.getElementById("dhcp-client-ip");
            const leaseVal = params.lease_time || "24 Hours";
            
            packet.classList.add("hidden");
            document.getElementById("link-dhcp").className = "canvas-link active";

            if (step === 0) {
                // Discover
                addLog("command", "$ ip link set eth0 up && dhclient eth0");
                addLog("output", "DHCP: Broadasting DHCPDISCOVER on eth0 to 255.255.255.255...");
                animatePacket(packet, null, 220, 195, 450, 195, 1200 / speed, () => {
                    addLog("output", "DHCP Server received Discover broadcast.");
                });
            } else if (step === 1) {
                // Offer
                addLog("output", "DHCP: Server offering 192.168.1.120 to Client.");
                animatePacket(packet, null, 450, 195, 220, 195, 1200 / speed, () => {
                    addLog("output", "Client received DHCPOFFER of 192.168.1.120.");
                });
            } else if (step === 2) {
                // Request
                addLog("output", "DHCP: Requesting IP 192.168.1.120 lease...");
                animatePacket(packet, null, 220, 195, 450, 195, 1200 / speed, () => {
                    addLog("output", "Server received DHCPREQUEST confirmation.");
                });
            } else if (step === 3) {
                // ACK
                addLog("output", `DHCP: Server leases 192.168.1.120. Lease time: ${leaseVal}`);
                animatePacket(packet, null, 450, 195, 220, 195, 1200 / speed, () => {
                    clientIp.textContent = "192.168.1.120";
                    clientIp.parentElement.classList.add("active");
                    document.getElementById("link-dhcp").className = "canvas-link success";
                    addLog("success", "IP Address 192.168.1.120 assigned successfully!");
                });
            }
        }
    },

    "subnet-routing": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Host A sends packet (Dst IP: 172.16.5.10, Dst MAC: Router)",
                "Step 2: Router rewrites MAC Header & updates interface",
                "Step 3: Host B receives packet on Subnet B"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            const netA = params.subnet_a === "10.0.0.0/24" ? "10.0.0.50" : "192.168.1.50";
            const netB = params.subnet_b === "192.168.2.0/24" ? "192.168.2.10" : "172.16.5.10";
            
            stage.innerHTML = `
                <!-- Subnet A Area -->
                <rect x="20" y="30" width="180" height="290" rx="10" fill="rgba(59, 130, 246, 0.03)" stroke="rgba(59,130,246,0.15)" stroke-width="1.5"></rect>
                <text x="30" y="55" fill="rgba(59,130,246,0.8)" font-size="11" font-weight="bold">SUBNET A (${params.subnet_a})</text>

                <!-- Subnet B Area -->
                <rect x="460" y="30" width="180" height="290" rx="10" fill="rgba(6, 182, 212, 0.03)" stroke="rgba(6,182,212,0.15)" stroke-width="1.5"></rect>
                <text x="470" y="55" fill="rgba(6,182,212,0.8)" font-size="11" font-weight="bold">SUBNET B (${params.subnet_b})</text>

                <!-- Client A -->
                <foreignObject x="50" y="120" width="120" height="100" class="node-fo" id="routing-client-a">
                    <div class="canvas-node-card">
                        <div class="node-title">Host A</div>
                        <div class="node-ip">${netA}</div>
                        <div class="node-mac" style="font-size: 8px; color: var(--color-text-muted)">MAC: AA:AA:AA</div>
                    </div>
                </foreignObject>

                <!-- Router -->
                <foreignObject x="270" y="115" width="130" height="120" class="node-fo" id="routing-router">
                    <div class="canvas-node-card active" style="border-color: var(--color-cyan)">
                        <div class="node-icon"><i data-lucide="router"></i></div>
                        <div class="node-title">Router</div>
                        <div class="node-ip" style="font-size: 8px">GW-A: ${params.subnet_a.replace(".0/24", ".1")}</div>
                        <div class="node-ip" style="font-size: 8px">GW-B: ${params.subnet_b.replace(".0/24", ".1")}</div>
                    </div>
                </foreignObject>

                <!-- Client B -->
                <foreignObject x="490" y="120" width="120" height="100" class="node-fo" id="routing-client-b">
                    <div class="canvas-node-card">
                        <div class="node-title">Host B</div>
                        <div class="node-ip">${netB}</div>
                        <div class="node-mac" style="font-size: 8px; color: var(--color-text-muted)">MAC: BB:BB:BB</div>
                    </div>
                </foreignObject>

                <!-- Links -->
                <path d="M 170 175 L 270 175" class="canvas-link" id="link-route-a"></path>
                <path d="M 400 175 L 490 175" class="canvas-link" id="link-route-b"></path>

                <!-- Packet -->
                <circle cx="170" cy="175" r="8" class="packet hidden" id="packet-route"></circle>
            `;
            lucide.createIcons();
            addLog("system", "Subnet Routing lab initialized.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const netA = params.subnet_a === "10.0.0.0/24" ? "10.0.0.50" : "192.168.1.50";
            const netB = params.subnet_b === "192.168.2.0/24" ? "192.168.2.10" : "172.16.5.10";
            const gwA_MAC = "RT:AA:AA";
            const gwB_MAC = "RT:BB:BB";

            const packet = document.getElementById("packet-route");
            packet.classList.add("hidden");
            document.getElementById("link-route-a").className = "canvas-link";
            document.getElementById("link-route-b").className = "canvas-link";

            if (step === 0) {
                document.getElementById("link-route-a").className = "canvas-link active";
                addLog("command", `$ ping ${netB}`);
                addLog("output", `Routing lookup: Destination ${netB} is outside Subnet ${params.subnet_a}. Sending packet to gateway.`);
                addLog("output", `Packet Header: [Src IP: ${netA}] [Dst IP: ${netB}] [Src MAC: AA:AA:AA] [Dst MAC: ${gwA_MAC}]`);
                animatePacket(packet, null, 170, 175, 270, 175, 1200 / speed);
            } else if (step === 1) {
                addLog("output", "Router received packet on Interface A. Finding routing match for destination...");
                addLog("output", `Route matched for ${params.subnet_b} via interface B.`);
                addLog("warning", `Router rewrites MAC Header: New Src MAC: ${gwB_MAC}, New Dst MAC: BB:BB:BB. IPs remain unchanged!`);
            } else if (step === 2) {
                document.getElementById("link-route-b").className = "canvas-link success";
                addLog("output", `Packet Header leaving router: [Src IP: ${netA}] [Dst IP: ${netB}] [Src MAC: ${gwB_MAC}] [Dst MAC: BB:BB:BB]`);
                animatePacket(packet, null, 400, 175, 490, 175, 1200 / speed, () => {
                    addLog("success", `Ping reply received from ${netB}!`);
                });
            }
        }
    },

    "load-balancer": {
        totalSteps: 3,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: User Request arriving at Load Balancer",
                "Step 2: LB applies routing logic and health evaluation",
                "Step 3: Request routed to backend Server"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            const isFailed = params.failure === true;
            
            stage.innerHTML = `
                <!-- Client Node -->
                <foreignObject x="30" y="140" width="110" height="90" class="node-fo" id="lb-client">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="monitor"></i></div>
                        <div class="node-title">Incoming Client</div>
                        <div class="node-ip">124.50.62.9</div>
                    </div>
                </foreignObject>

                <!-- Load Balancer Node -->
                <foreignObject x="220" y="130" width="130" height="110" class="node-fo" id="lb-balancer">
                    <div class="canvas-node-card active" style="border-color: var(--color-accent)">
                        <div class="node-icon"><i data-lucide="shuffle"></i></div>
                        <div class="node-title">Nginx Balancer</div>
                        <div class="node-ip">10.0.0.1</div>
                    </div>
                </foreignObject>

                <!-- Server 1 -->
                <foreignObject x="480" y="30" width="130" height="80" class="node-fo" id="lb-srv-1">
                    <div class="canvas-node-card server-card">
                        <div class="node-title">Backend Server 01</div>
                        <div class="node-ip">10.0.0.10</div>
                        <span class="node-badge success" id="srv1-conns">Conns: 8</span>
                    </div>
                </foreignObject>

                <!-- Server 2 -->
                <foreignObject x="480" y="145" width="130" height="80" class="node-fo" id="lb-srv-2">
                    <div class="canvas-node-card server-card">
                        <div class="node-title">Backend Server 02</div>
                        <div class="node-ip">10.0.0.11</div>
                        <span class="node-badge success" id="srv2-conns">Conns: 12</span>
                    </div>
                </foreignObject>

                <!-- Server 3 -->
                <foreignObject x="480" y="260" width="130" height="80" class="node-fo" id="lb-srv-3">
                    <div class="canvas-node-card server-card" style="${isFailed ? 'border-color: var(--color-rose)' : ''}">
                        <div class="node-title">Backend Server 03</div>
                        <div class="node-ip">10.0.0.12</div>
                        <span class="node-badge ${isFailed ? 'danger' : 'success'}" id="srv3-conns">${isFailed ? 'OFFLINE' : 'Conns: 5'}</span>
                    </div>
                </foreignObject>

                <!-- Connections -->
                <path d="M 140 185 L 220 185" class="canvas-link" id="link-client-lb"></path>
                <path d="M 350 160 L 480 70" class="canvas-link" id="link-lb-srv1"></path>
                <path d="M 350 185 L 480 185" class="canvas-link" id="link-lb-srv2"></path>
                <path d="M 350 210 L 480 300" class="canvas-link" id="link-lb-srv3"></path>

                <!-- Packet -->
                <circle cx="140" cy="185" r="8" class="packet hidden" id="packet-lb"></circle>
            `;
            lucide.createIcons();
            addLog("system", `Load Balancer listening. Target servers configured with logic: ${params.algo}.`);
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const isFailed = params.failure === true;
            const algo = params.algo || "Round Robin";
            const packet = document.getElementById("packet-lb");
            packet.classList.add("hidden");

            // Reset links
            document.querySelectorAll(".canvas-link").forEach(l => l.className = "canvas-link");

            if (step === 0) {
                document.getElementById("link-client-lb").className = "canvas-link active";
                animatePacket(packet, null, 140, 185, 220, 185, 1000 / speed, () => {
                    addLog("command", "$ curl http://localhost/");
                    addLog("output", "HTTP Request received from client ip 124.50.62.9.");
                });
            } else if (step === 1) {
                addLog("output", `Applying algorithm: [${algo}]`);
                if (isFailed) {
                    addLog("warning", "Nginx Health Check: Backend 3 (10.0.0.12) is unresponsive! Removing from pool.");
                }
            } else if (step === 2) {
                // Route destination selection
                let destLink, destNodeX, destNodeY, selectedIp, selectedSrv;
                
                if (algo === "Round Robin") {
                    // Say we loop: normally picks 1 -> 2 -> 3. If 3 is dead, it falls back to 1 or 2.
                    if (isFailed) {
                        destLink = "link-lb-srv1";
                        destNodeX = 480; destNodeY = 70; selectedIp = "10.0.0.10"; selectedSrv = "Server 01";
                    } else {
                        destLink = "link-lb-srv3";
                        destNodeX = 480; destNodeY = 300; selectedIp = "10.0.0.12"; selectedSrv = "Server 03";
                    }
                } else if (algo === "Least Connections") {
                    // Server 1 (8), Server 2 (12), Server 3 (5)
                    // If Server 3 is dead, lowest is Server 1
                    if (isFailed) {
                        destLink = "link-lb-srv1";
                        destNodeX = 480; destNodeY = 70; selectedIp = "10.0.0.10"; selectedSrv = "Server 01";
                    } else {
                        destLink = "link-lb-srv3";
                        destNodeX = 480; destNodeY = 300; selectedIp = "10.0.0.12"; selectedSrv = "Server 03 (least connections: 5)";
                    }
                } else { // IP Hash
                    // Hashes 124.50.62.9 to Server 2 consistently
                    destLink = "link-lb-srv2";
                    destNodeX = 480; destNodeY = 185; selectedIp = "10.0.0.11"; selectedSrv = "Server 02";
                }

                document.getElementById(destLink).className = "canvas-link success";
                animatePacket(packet, null, 350, 185, destNodeX, destNodeY, 1000 / speed, () => {
                    addLog("success", `Request proxied to backend: ${selectedSrv} (${selectedIp})`);
                });
            }
        }
    },

    "http-https-handshake": {
        totalSteps: 4,
        getStepLabel: (idx) => {
            const labels = [
                "Step 1: Client sends Client Hello (Supported TLS versions, cipher suites, client random)",
                "Step 2: Server replies Server Hello, Certificate and Key Exchange parameters",
                "Step 3: Client verifies certificate and generates premaster key",
                "Step 4: Session keys generated on both ends. Outbound data encrypted (HTTPS active)"
            ];
            return labels[idx] || "";
        },
        setup: (stage, params, addLog) => {
            stage.innerHTML = `
                <!-- Client Node -->
                <foreignObject x="80" y="130" width="120" height="110" class="node-fo" id="tls-client">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="monitor"></i></div>
                        <div class="node-title">Client</div>
                        <span class="node-badge" id="tls-client-status">HTTP (Plain)</span>
                    </div>
                </foreignObject>

                <!-- Server Node -->
                <foreignObject x="480" y="130" width="120" height="110" class="node-fo" id="tls-server">
                    <div class="canvas-node-card">
                        <div class="node-icon"><i data-lucide="server"></i></div>
                        <div class="node-title">Secure Web Server</div>
                        <span class="node-badge" id="tls-server-status">TLS Listener</span>
                    </div>
                </foreignObject>

                <!-- Link Line -->
                <path d="M 200 185 L 480 185" class="canvas-link" id="tls-link-main"></path>
                
                <!-- Animated Packet -->
                <circle cx="200" cy="185" r="8" class="packet hidden" id="tls-packet"></circle>

                <!-- Tag -->
                <g id="tls-packet-tag" class="hidden" transform="translate(0, 0)">
                    <rect x="-40" y="-30" width="80" height="20" rx="4" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.2)" stroke-width="1"></rect>
                    <text x="0" y="-16" fill="white" font-size="8" font-family="JetBrains Mono" text-anchor="middle" id="tls-packet-tag-text">Client Hello</text>
                </g>
            `;
            lucide.createIcons();
            addLog("system", "HTTPS connection request initiated. Negotiating TLS 1.3 protocol.");
        },
        executeStep: (stage, step, params, addLog, speed) => {
            const clientStatus = document.getElementById("tls-client-status");
            const serverStatus = document.getElementById("tls-server-status");
            const link = document.getElementById("tls-link-main");
            const packet = document.getElementById("tls-packet");
            const tag = document.getElementById("tls-packet-tag");
            const tagText = document.getElementById("tls-packet-tag-text");

            packet.classList.add("hidden");
            tag.classList.add("hidden");
            link.className = "canvas-link active";

            if (step === 0) {
                tagText.textContent = "Client Hello";
                addLog("command", "$ curl -v https://10.0.0.5/");
                addLog("output", "* Connecting to 10.0.0.5 port 443...\n* TLS 1.3 connection: Client Hello sent.");
                animatePacket(packet, tag, 200, 185, 480, 185, 1200 / speed);
            } else if (step === 1) {
                tagText.textContent = "Server Hello / Cert";
                addLog("output", "* Server Hello received. Certificate validation in progress...");
                animatePacket(packet, tag, 480, 185, 200, 185, 1200 / speed, () => {
                    addLog("output", " - Subject: CN=google.com, O=Google LLC\n - Issuer: CN=GTS CA 1C3");
                });
            } else if (step === 2) {
                tagText.textContent = "Key Exchange";
                addLog("output", "* Key Exchange: Client verifies Certificate Signature against root CA. Generating premaster secret...");
                animatePacket(packet, tag, 200, 185, 480, 185, 1200 / speed);
            } else if (step === 3) {
                clientStatus.textContent = "HTTPS (Secure)";
                clientStatus.className = "node-badge success";
                serverStatus.textContent = "TLS 1.3 Active";
                serverStatus.className = "node-badge success";
                link.className = "canvas-link success";

                addLog("success", "* SSL connection using TLSv1.3 / AES-256-GCM\n* Server certificate verification passed.\nConnection secured successfully!");
            }
        }
    }
};

// Common animation wrapper for moving SVG circles
function animatePacket(circle, tagGroup, startX, startY, endX, endY, duration, callback) {
    if (!circle) return;
    
    circle.classList.remove("hidden");
    if (tagGroup) {
        tagGroup.classList.remove("hidden");
    }

    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Linear interpolation
        const curX = startX + (endX - startX) * progress;
        const curY = startY + (endY - startY) * progress;
        
        circle.setAttribute("cx", curX);
        circle.setAttribute("cy", curY);

        if (tagGroup) {
            tagGroup.setAttribute("transform", `translate(${curX}, ${curY})`);
        }

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            if (callback) callback();
        }
    }

    requestAnimationFrame(step);
}

// Visual warning toast
function alertUser(msg) {
    const toast = document.createElement("div");
    toast.className = "toast success show";
    toast.textContent = msg;
    document.getElementById("toast-container").appendChild(toast);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

window.NetworkingSimulations = NetworkingSimulations;
window.animatePacket = animatePacket;

