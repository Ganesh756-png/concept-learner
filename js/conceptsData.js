const ConceptsData = {
    networking: [
        {
            id: "tcp-handshake",
            title: "TCP 3-Way Handshake",
            description: "Transmission Control Protocol (TCP) uses a three-way handshake to establish a reliable connection between a client and a server before transmitting data. This ensures both parties are ready to communicate.",
            parameters: [
                { id: "loss_rate", label: "Packet Loss Simulation", type: "select", options: ["0% (Perfect)", "30% (Lossy)"], default: "0% (Perfect)" },
                { id: "init_seq", label: "Client Initial Seq Number", type: "number", min: 1000, max: 9999, default: 1000 }
            ],
            cli: [
                "// Inspecting live TCP handshakes using tcpdump",
                "$ sudo tcpdump -S -i eth0 'tcp[tcpflags] & (tcp-syn|tcp-ack) != 0'",
                "IP 192.168.1.50.49152 > 10.0.0.5.80: Flags [S], seq 1000, win 64240",
                "IP 10.0.0.5.80 > 192.168.1.50.49152: Flags [S.], seq 4000, ack 1001, win 65535",
                "IP 192.168.1.50.49152 > 10.0.0.5.80: Flags [.], seq 1001, ack 4001, win 64240"
            ],
            config: `# Client-Server Socket Code Example (Python)
import socket

# Client code
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("10.0.0.5", 80)) # Triggers the 3-Way Handshake
s.sendall(b"GET / HTTP/1.1\\r\\n\\r\\n")`
        },
        {
            id: "dns-resolution",
            title: "DNS Resolution Pathway",
            description: "The Domain Name System (DNS) resolves human-readable domain names (like google.com) to machine-readable IP addresses. It follows a hierarchical lookup starting from the Local Resolver up to Root, TLD, and Authoritative Nameservers.",
            parameters: [
                { id: "cache", label: "Local DNS Cache", type: "toggle", default: false, desc: "Bypass or hit local DNS cache" }
            ],
            cli: [
                "// Querying DNS hierarchy using dig trace",
                "$ dig +trace google.com",
                ";; Received 525 bytes from 192.5.5.241#53(b.root-servers.net) in 12ms",
                ";; Received 489 bytes from 192.26.92.30#53(com.gtld-servers.net) in 8ms",
                ";; Received 128 bytes from 216.239.32.10#53(ns1.google.com) in 15ms",
                "google.com.             300     IN      A       142.250.190.46"
            ],
            config: `# /etc/resolv.conf - Local DNS Config
nameserver 127.0.0.53
options edns0 trust-ad
search localdomain`
        },
        {
            id: "dhcp-allocation",
            title: "DHCP IP Allocation",
            description: "Dynamic Host Configuration Protocol (DHCP) dynamically assigns IP addresses and other network parameters to devices in a local network. It operates through the DORA process: Discover, Offer, Request, Acknowledge.",
            parameters: [
                { id: "lease_time", label: "Lease Duration", type: "select", options: ["24 Hours", "7 Days"], default: "24 Hours" }
            ],
            cli: [
                "// Inspecting DHCP communication logs",
                "$ tail -f /var/log/syslog | grep dhcpd",
                "dhcpd: DHCPDISCOVER from 00:0c:29:3e:5b:d1 via eth0",
                "dhcpd: DHCPOFFER on 192.168.1.120 to 00:0c:29:3e:5b:d1 via eth0",
                "dhcpd: DHCPREQUEST for 192.168.1.120 from 00:0c:29:3e:5b:d1 via eth0",
                "dhcpd: DHCPACK on 192.168.1.120 to 00:0c:29:3e:5b:d1 via eth0"
            ],
            config: `# /etc/dhcp/dhcpd.conf - DHCP Server Config
subnet 192.168.1.0 netmask 255.255.255.0 {
  range 192.168.1.100 192.168.1.200;
  option routers 192.168.1.1;
  option domain-name-servers 8.8.8.8;
  default-lease-time 86400; # 24 Hours
}`
        },
        {
            id: "subnet-routing",
            title: "Subnetting & Router Routing",
            description: "Routing moves network traffic across different subnets. A router intercepts packets, modifies their Layer 2 MAC addresses (while keeping Layer 3 IPs unchanged), and forwards them to the destination subnet based on routing tables.",
            parameters: [
                { id: "subnet_a", label: "Subnet A CIDR", type: "select", options: ["192.168.1.0/24", "10.0.0.0/24"], default: "192.168.1.0/24" },
                { id: "subnet_b", label: "Subnet B CIDR", type: "select", options: ["172.16.5.0/24", "192.168.2.0/24"], default: "172.16.5.0/24" }
            ],
            cli: [
                "// Checking local routing table on Linux",
                "$ ip route show",
                "default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.50 metric 100",
                "192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50",
                "",
                "// Tracepath to the other subnet client",
                "$ tracepath -n 172.16.5.10",
                " 1?: [LOCALHOST]                      pmtu 1500",
                " 1:  192.168.1.1                             2.15ms",
                " 2:  172.16.5.10                             4.12ms reached"
            ],
            config: `# Linux Static Routing Configuration (/etc/netplan/01-netcfg.yaml)
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 192.168.1.50/24
      routes:
        - to: 172.16.5.0/24
          via: 192.168.1.1`
        },
        {
            id: "load-balancer",
            title: "Load Balancer Algorithms",
            description: "Load Balancers distribute traffic across a pool of backend servers. Choosing the right algorithm (e.g. Round Robin, Least Connections, or Source IP Hash) and executing regular health checks optimizes performance and ensures fault tolerance.",
            parameters: [
                { id: "algo", label: "Balancing Algorithm", type: "select", options: ["Round Robin", "Least Connections", "IP Hash"], default: "Round Robin" },
                { id: "failure", label: "Simulate Server Failure", type: "toggle", default: false, desc: "Simulate Server 3 going offline" }
            ],
            cli: [
                "// Checking active backend connections via load balancer proxy status",
                "$ curl http://localhost/lb-status",
                "=== Nginx Upstream Servers ===",
                " - Backend-01 (10.0.0.10:8080) State: UP, Active-Conns: 12",
                " - Backend-02 (10.0.0.11:8080) State: UP, Active-Conns: 10",
                " - Backend-03 (10.0.0.12:8080) State: DOWN, Active-Conns: 0"
            ],
            config: `# Nginx Load Balancing Configuration (/etc/nginx/nginx.conf)
upstream backend_servers {
    # ip_hash; # Toggle for IP Hash algorithm
    server 10.0.0.10:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.11:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.12:8080 max_fails=3 fail_timeout=30s;
}`
        },
        {
            id: "http-https-handshake",
            title: "TLS/HTTPS Secure Handshake",
            description: "HTTPS relies on Transport Layer Security (TLS) to encrypt all communications. The TLS handshake verifies the identity of the server using certificates and negotiates secure shared session keys using cryptographic algorithms (like Diffie-Hellman) before any data is sent.",
            parameters: [
                { id: "tls_ver", label: "TLS Protocol Version", type: "select", options: ["TLS 1.2 (Legacy)", "TLS 1.3 (Secure)"], default: "TLS 1.3 (Secure)" }
            ],
            cli: [
                "// Initiating verbose curl HTTPS call",
                "$ curl -v https://10.0.0.5/",
                "*   Trying 10.0.0.5:443...",
                "* Connected to 10.0.0.5 (10.0.0.5) port 443",
                "* TLS 1.3 connection using TLS_AES_256_GCM_SHA384",
                "* Server certificate: CN=google.com, O=Google LLC",
                "* Verification SUCCESS."
            ],
            config: `# TLS 1.3 Web Server Configuration (Nginx SSL snippet)
server {
    listen 443 ssl http2;
    server_name secure.domain.local;

    ssl_certificate /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;

    # Restrict to secure modern protocol TLSv1.3 only
    ssl_protocols TLSv1.3;
    ssl_ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;
}`
        }
    ],
    linux: [
        {
            id: "process-lifecycle",
            title: "Process Lifecycle & States",
            description: "Linux processes transition through distinct execution states: Created (New) -> Ready (waiting for CPU scheduler) -> Running (active CPU execution) -> Blocked/Waiting (I/O wait) -> Terminated -> Zombie (exit code unread).",
            parameters: [
                { id: "action", label: "Next Process Event", type: "select", options: ["Start Process", "Wait for I/O", "I/O Done", "Send SIGKILL"], default: "Start Process" }
            ],
            cli: [
                "// Inspecting process state logs via ps and top",
                "$ ps -eo pid,ppid,state,cmd | grep python",
                " 10243  10001  S  python task_runner.py  # S: Interruptible Sleep",
                " 10245  10243  R  python processor.py    # R: Running",
                " 10248  10243  Z  [python] <defunct>     # Z: Zombie state"
            ],
            config: `# Process creation via fork/exec (C-style example code)
#include <unistd.h>
#include <sys/types.h>

pid_t pid = fork();
if (pid == 0) {
    // Child Process: changes state to Ready, then Running
    execl("/bin/ls", "ls", NULL);
} else {
    // Parent Process: wait for child termination (prevents Zombie)
    wait(NULL);
}`
        },
        {
            id: "pipes-redirection",
            title: "Pipes & Redirections",
            description: "Linux enables process composition by using pipes ('|') to direct the standard output (stdout) of one program into the standard input (stdin) of another, and redirection operators ('>', '>>') to route streams to files.",
            parameters: [
                { id: "pipe_command", label: "Pipeline Command", type: "select", options: ["cat syslog | grep ERROR | wc -l", "ps aux | grep nginx"], default: "cat syslog | grep ERROR | wc -l" }
            ],
            cli: [
                "// Running standard pipe command",
                "$ cat /var/log/syslog | grep ERROR | wc -l",
                "42",
                "",
                "// Redirecting errors to a file and output to another",
                "$ ./analytics_job.sh > output.log 2> error.log",
                "$ cat error.log",
                "[ERROR] DB Connection Timeout at 17:01:56"
            ],
            config: `# Standard stream File Descriptor mapping on Linux
FD 0 -> stdin  (Standard Input)  - Keyboard/pipe
FD 1 -> stdout (Standard Output) - Console screen/pipe
FD 2 -> stderr (Standard Error)  - Console screen/file

# Directing stdout and stderr together:
$ command > output.txt 2>&1`
        },
        {
            id: "permissions-chmod",
            title: "Permissions Matrix (chmod)",
            description: "Linux controls file access permissions using three classes: Owner (u), Group (g), and Others (o). Each class has three permissions: Read (4), Write (2), and Execute (1). Together, they form octal permissions (e.g. 755).",
            parameters: [
                { id: "octal", label: "Octal Permissions Mode", type: "select", options: ["777 (Full Access)", "755 (Exec/Read)", "644 (Read/Write Only)", "700 (Private Exec)"], default: "755 (Exec/Read)" }
            ],
            cli: [
                "// Viewing file permissions using ls",
                "$ ls -l script.sh",
                "-rwxr-xr-x 1 user admin 1024 Jun 25 17:01 script.sh",
                "",
                "// Modifying permissions using chmod",
                "$ chmod 755 script.sh",
                "// Success. File is now readable and executable by group/others."
            ],
            config: `# Linux Permissions Bitmask Representation
# rwx r-x r-x  => 7 5 5 (Owner: rwx=7, Group: r-x=5, Others: r-x=5)
# r-- r-- r--  => 4 4 4 (Read only for everyone)
# rw- r-- r--  => 6 4 4 (Owner read/write, others read only)

Binary representation:
rwx = 111 (binary) = 7 (decimal)
r-x = 101 (binary) = 5 (decimal)
r-- = 100 (binary) = 4 (decimal)`
        },
        {
            id: "inodes-links",
            title: "Inodes, Hard Links, and Soft Links",
            description: "An inode is a data structure storing file metadata (permissions, size, block locations), excluding filename. Hard links point directly to the inode index. Soft (symbolic) links are pointers that reference a path/filename.",
            parameters: [
                { id: "link_type", label: "Link Action", type: "select", options: ["Create Hard Link", "Create Soft Link", "Delete Target File"], default: "Create Hard Link" }
            ],
            cli: [
                "// Inspecting inode numbers using ls",
                "$ ls -li target.txt hard.txt soft.txt",
                "1048576 -rw-r--r-- 2 user admin 12 Jun 25 17:01 target.txt",
                "1048576 -rw-r--r-- 2 user admin 12 Jun 25 17:01 hard.txt",
                "2097152 lrwxrwxrwx 1 user admin 10 Jun 25 17:01 soft.txt -> target.txt"
            ],
            config: `# Command scripts to manipulate link files
# Create target file
echo "hello world" > target.txt

# Create hard link (shares same inode 1048576)
ln target.txt hard.txt

# Create symbolic link (new inode 2097152 points to text path)
ln -s target.txt soft.txt`
        },
        {
            id: "systemd-manager",
            title: "Systemd Service Manager",
            description: "Systemd manages Linux daemon services. It parses service files to configure dependencies, tracks processes using control groups (cgroups), logs outputs via journald, and supports operations like start, stop, reload, and enable.",
            parameters: [
                { id: "service_cmd", label: "Service Command", type: "select", options: ["systemctl start", "systemctl stop", "systemctl status", "systemctl restart"], default: "systemctl start" }
            ],
            cli: [
                "// Checking systemd service status",
                "$ systemctl status prometheus.service",
                "● prometheus.service - Prometheus Monitoring",
                "     Loaded: loaded (/etc/systemd/system/prometheus.service; enabled; vendor preset: enabled)",
                "     Active: active (running) since Thu 2026-06-25 17:01:56 IST",
                "   Main PID: 14520 (prometheus)",
                "      Tasks: 8 (limit: 4915)",
                "     CGroup: /system.slice/prometheus.service",
                "             └─14520 /usr/local/bin/prometheus --config.file=/etc/prometheus.cfg"
            ],
            config: `# Systemd Service Unit File (/etc/systemd/system/prometheus.service)
[Unit]
Description=Prometheus Monitoring Daemon
After=network.target

[Service]
Type=simple
User=prometheus
ExecStart=/usr/local/bin/prometheus --config.file=/etc/prometheus.cfg
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target`
        },
        {
            id: "linux-cron-jobs",
            title: "Cron Scheduler & Tasks",
            description: "Linux uses the crond daemon to run commands and scripts automatically at scheduled intervals. Tasks are configured in crontab files using a five-field time format (minute, hour, day of month, month, day of week) specifying when the target commands should trigger.",
            parameters: [
                { id: "cron_schedule", label: "Cron Schedule Pattern", type: "select", options: ["*/5 * * * * (Every 5 mins)", "0 0 * * * (Daily at Midnight)", "0 12 * * 1 (Weekly on Mon)"], default: "*/5 * * * * (Every 5 mins)" }
            ],
            cli: [
                "// Inspecting user cron configuration table",
                "$ crontab -l",
                "*/5 * * * * /home/user/backup.sh >> /var/log/backup.log 2>&1",
                "",
                "// Checking cron execution syslog records",
                "$ grep -i cron /var/log/syslog | tail -n 3",
                "Jun 26 10:05:00 server cron[942]: (root) CMD (/home/user/backup.sh)",
                "Jun 26 10:05:04 server cron[942]: (root) CMD Finished backup.sh"
            ],
            config: `# System-wide cron configuration file (/etc/crontab)
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Example cron jobs formatting rules:
# m h dom mon dow user  command
17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )`
        }
    ],
    dataeng: [
        {
            id: "etl-elt",
            title: "ETL vs ELT Architecture",
            description: "ETL transforms data on a staging server before loading it into a Data Warehouse. ELT extracts data directly into a Data Lake/Lakehouse, leveraging the massive compute scale of modern warehouses to perform transformations via SQL.",
            parameters: [
                { id: "pipeline_type", label: "Pipeline Pattern", type: "select", options: ["ETL Pattern", "ELT Pattern"], default: "ETL Pattern" }
            ],
            cli: [
                "// Execution logs of Spark/Airflow ETL pipeline",
                "[2026-06-25 17:01:56] INFO - Extracting data from PostgreSQL (Source DB)",
                "[2026-06-25 17:02:10] INFO - Transforming schema: masking PII, converting datatypes",
                "[2026-06-25 17:02:30] INFO - Loading clean records into Redshift Analytics tables",
                "",
                "// Execution logs of ELT pipeline",
                "[2026-06-25 17:01:56] INFO - Extracting Postgres & loading raw JSON directly to Snowflake S3 Stage",
                "[2026-06-25 17:02:05] INFO - Triggering Snowflake warehouse SQL compilation (dbt run)"
            ],
            config: `# dbt (Data Build Tool) Model - ELT Transformation Code
# models/mart_users.sql
{{ config(materialized='table') }}

WITH raw_users AS (
    SELECT * FROM {{ source('raw_sources', 'users') }}
)
SELECT 
    id,
    UPPER(country) as country_code,
    MD5(pii_email) as hashed_email,
    created_at::DATE as signup_date
FROM raw_users
WHERE is_active = TRUE`
        },
        {
            id: "kafka-pubsub",
            title: "Kafka Pub/Sub Message Queues",
            description: "Apache Kafka uses partitioned log topics. Producers write records to partitions using key hashing. Consumer groups coordinate consumption: each partition is read by exactly one consumer within a group, scaling reads horizontally.",
            parameters: [
                { id: "partitions", label: "Topic Partitions", type: "select", options: ["2 Partitions", "4 Partitions"], default: "2 Partitions" },
                { id: "consumers", label: "Consumer Count", type: "select", options: ["1 Consumer", "2 Consumers", "4 Consumers"], default: "2 Consumers" }
            ],
            cli: [
                "// Creating a partitioned Kafka Topic",
                "$ kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 4 --topic order_logs",
                "",
                "// Monitoring consumer group offset lagging",
                "$ kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group order_processing_group",
                "GROUP                  TOPIC        PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG",
                "order_processing_group order_logs   0          4124            4130            6",
                "order_processing_group order_logs   1          3895            3900            5",
                "order_processing_group order_logs   2          4012            4012            0",
                "order_processing_group order_logs   3          4101            4120            19"
            ],
            config: `# Kafka Producer Configuration (Python)
from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    key_serializer=lambda k: str(k).encode('utf-8'),
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Key guarantees order by keeping identical user IDs in the same partition
producer.send(
    'order_logs', 
    key='user_102', 
    value={'order_id': 50243, 'amount': 99.99}
)`
        },
        {
            id: "spark-mapreduce",
            title: "Spark & MapReduce Processing",
            description: "Distributed analytics frameworks divide datasets into partitions. Executors map records locally, shuffle/redistribute intermediate keys across the cluster network, and reduce partitions to compile final aggregated values.",
            parameters: [
                { id: "workers", label: "Executor Node Count", type: "select", options: ["2 Workers", "4 Workers"], default: "2 Workers" }
            ],
            cli: [
                "// Submitting Spark Distributed Job to cluster manager",
                "$ spark-submit --master yarn --num-executors 4 --executor-cores 2 wordcount.py",
                "26/06/25 17:01:56 INFO TaskSchedulerImpl: Adding task set 0.0 with 8 tasks",
                "26/06/25 17:02:01 INFO BlockManagerMaster: Registered BlockManager at worker-02",
                "26/06/25 17:02:08 INFO TaskSetManager: Finished task 0 in stage 0.0 in worker-01",
                "26/06/25 17:02:15 INFO MapOutputTrackerMaster: Size of shuffle output is 45102 bytes"
            ],
            config: `# PySpark Distributed Aggregation script (wordcount.py)
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("WordCount").getOrCreate()

text_file = spark.read.text("hdfs://cluster/logs/*.log")
word_counts = text_file.rdd \\
    .flatMap(lambda line: line.value.split(" ")) \\
    .map(lambda word: (word, 1)) \\
    .reduceByKey(lambda a, b: a + b) # Triggers Spark Shuffle and Reduce stages

word_counts.saveAsTextFile("hdfs://cluster/output/")`
        },
        {
            id: "btree-index",
            title: "Database Indexing (B+ Tree)",
            description: "Database engines structure indexes as B+ Trees. Traversal starts at the Root node, navigates through multi-level pointer Nodes matching keys, and checks leaf nodes, which contain the exact pointers to physical database data blocks.",
            parameters: [
                { id: "search_key", label: "Search Key Value", type: "number", min: 1, max: 99, default: 42 }
            ],
            cli: [
                "// Running database query planner lookup check",
                "mysql> EXPLAIN SELECT * FROM users WHERE id = 42;",
                "+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+",
                "| id | select_type | table | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra |",
                "+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+",
                "|  1 | SIMPLE      | users | NULL       | const | PRIMARY       | PRIMARY | 8       | const |    1 |   100.00 | NULL  |",
                "+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+",
                "Note: Query traversed 3 index pages in B+ Tree buffer pool."
            ],
            config: `-- SQL Table definition showing Index creation
CREATE TABLE users (
    id BIGINT NOT NULL,
    username VARCHAR(50),
    email VARCHAR(100),
    PRIMARY KEY (id), -- Implicit B+ Tree Primary Key Index
    INDEX idx_username (username) -- B+ Tree Secondary Key Index
) ENGINE=InnoDB;`
        },
        {
            id: "batch-streaming",
            title: "Batch vs Stream Processing",
            description: "Batch processing executes periodically (e.g. daily) on static data stores. Stream processing evaluates data continuously. It aggregates infinite live data streams within time windows (e.g., tumbling or sliding).",
            parameters: [
                { id: "window_type", label: "Stream Window Method", type: "select", options: ["Tumbling Window (5s)", "Sliding Window (5s, step 2s)"], default: "Tumbling Window (5s)" }
            ],
            cli: [
                "// Inspecting stream processing latency logs",
                "[Continuous Processing] Flink Operator Source -> WindowAggregate -> Sink",
                "[Flink Metrics] Throughput: 12500 rec/sec, Latency: 42ms",
                "[Window Trigger] Window [17:01:50, 17:01:55) closed. Output aggregated count: 62500",
                "[Window Trigger] Window [17:01:55, 17:02:00) closed. Output aggregated count: 61032"
            ],
            config: `# PySpark Structured Streaming Window aggregation code
from pyspark.sql.functions import window, col

stream_df = spark.readStream \\
    .format("kafka") \\
    .option("kafka.bootstrap.servers", "localhost:9092") \\
    .load()

# Continuous tumbling window aggregation
aggregated_stream = stream_df \\
    .groupBy(window(col("timestamp"), "5 seconds"), col("event_type")) \\
    .count()

query = aggregated_stream.writeStream \\
    .outputMode("complete") \\
    .format("console") \\
    .start()`
        }
    ],
    azure: [
        {
            id: "adf-devops",
            title: "ADF DevOps & Git Integration",
            description: "CI/CD in Azure Data Factory uses Git integration. Changes are committed to a feature branch, merged into the collaboration branch (main), published to generate ARM templates in the adf_publish branch, and deployed via Azure DevOps pipelines to QA/Prod.",
            parameters: [
                { id: "branch", label: "Git Collaboration Branch", type: "select", options: ["main", "develop"], default: "main" },
                { id: "environment", label: "Target Environment", type: "select", options: ["QA Environment", "Production"], default: "QA Environment" }
            ],
            cli: [
                "// Initiating Azure DevOps Release Pipeline deployment",
                "$ az pipelines release create --name 'ADF-Release' --definition-name 'ADF-CD'",
                "Creating release ADF-Release for pipeline ADF-CD...",
                "Release 14 created successfully. Environment QA: IN PROGRESS",
                "Deployment Gate check passed for QA. Deploying ARM template...",
                "Environment QA: SUCCEEDED. Environment Production: WAITING FOR APPROVAL"
            ],
            config: `# Azure DevOps Pipeline YAML definition (adf-deploy-pipline.yml)
trigger:
  branches:
    include:
    - adf_publish

variables:
  azureSubscription: 'Azure-DataEng-ServiceConnection'
  resourceGroupName: 'rg-data-platform-prod'
  dataFactoryName: 'adf-platform-prod'

steps:
- task: AzureResourceManagerTemplateDeployment@3
  inputs:
    deploymentScope: 'Resource Group'
    azureResourceManagerConnection: '$(azureSubscription)'
    action: 'Create Or Update Resource Group'
    resourceGroupName: '$(resourceGroupName)'
    location: 'East US'
    templateLocation: 'Linked artifact'
    csmFile: '$(System.DefaultWorkingDirectory)/adf-platform-dev/ARMTemplateForFactory.json'
    csmParametersFile: '$(System.DefaultWorkingDirectory)/adf-platform-dev/ARMTemplateParametersForFactory.json'
    overrideParameters: '-factoryName $(dataFactoryName)'`
        },
        {
            id: "adf-ir",
            title: "ADF Integration Runtimes",
            description: "Azure Data Factory uses Integration Runtimes (IR) as the compute to execute activities. Azure IR manages cloud-to-cloud transfers inside Azure, while a Self-Hosted IR (SHIR) acts as an agent running inside private networks to access On-Premises data sources behind firewalls.",
            parameters: [
                { id: "runtime_type", label: "Integration Runtime Type", type: "select", options: ["AutoResolve Azure IR", "Self-Hosted IR (SHIR)"], default: "AutoResolve Azure IR" },
                { id: "concurrent_jobs", label: "Max Concurrent Jobs", type: "select", options: ["4 Jobs", "8 Jobs", "16 Jobs"], default: "8 Jobs" }
            ],
            cli: [
                "// Checking ADF Integration Runtime status",
                "$ Get-AzDataFactoryV2IntegrationRuntime -ResourceGroupName 'rg-data-platform' -DataFactoryName 'adf-platform'",
                "IntegrationRuntimeName : self-hosted-ir-gateway",
                "State                  : Online",
                "Version                : 5.24.8120.1",
                "NodeName               : VM-ONPREM-SHIR-01",
                "ConcurrentJobsLimit    : 16"
            ],
            config: `# ADF Self-Hosted Integration Runtime registration (JSON)
{
  "name": "self-hosted-ir-gateway",
  "properties": {
    "type": "SelfHosted",
    "typeProperties": {
      "linkedInfo": {
        "authorizationType": "RBAC"
      }
    }
  }
}`
        },
        {
            id: "adls-security",
            title: "ADLS Gen2 Access Controls",
            description: "Azure Data Lake Storage Gen2 secures data using both Role-Based Access Control (RBAC) and Access Control Lists (ACLs). RBAC grants coarse-grained permissions (e.g. Storage Blob Data Reader) for the entire storage account, while ACLs define fine-grained POSIX permissions on specific directories or files.",
            parameters: [
                { id: "user_role", label: "User Assigned RBAC", type: "select", options: ["None", "Storage Blob Data Reader", "Storage Blob Data Contributor"], default: "Storage Blob Data Reader" },
                { id: "directory_acl", label: "Target Folder ACL", type: "select", options: ["Read (r--)", "Read-Write (rw-)", "Full (rwx)"], default: "Read (r--)" }
            ],
            cli: [
                "// Checking ACL permissions on ADLS Gen2 path",
                "$ az storage fs access show --path 'raw/orders' --share-name 'datalake' --account-name 'adlsplatform'",
                "{",
                "  \"acl\": \"user::rwx,group::r-x,other::r-x,user:jane.doe@entra.com:r-x\",",
                "  \"group\": \"$superuser\",",
                "  \"owner\": \"$superuser\",",
                "  \"permissions\": \"rwxr-xr-x\"",
                "}"
            ],
            config: `# ADLS Gen2 POSIX ACL format
# Applied hierarchically down directory paths:
# /datalake (Account Level) -> Requires Reader/Contributor RBAC or execute (x) ACL
#   /raw (Directory Level) -> Requires Read (r) and Execute (x) ACL
#     /orders (Sub-directory Level) -> Requires Read (r) ACL to list files

Example CLI permission assignment:
$ az storage fs access set \\
    --acl "user::rwx,group::r-x,other::---" \\
    --path "raw/orders" \\
    --share-name "datalake" \\
    --account-name "adlsplatform"`
        },
        {
            id: "entra-identity",
            title: "Entra ID Managed Identities",
            description: "Managed Identities in Microsoft Entra ID enable passwordless authentication. Azure services (like ADF) obtain a temporary OAuth2 JWT token directly from Entra ID to authenticate against other Azure services (like ADLS or Key Vault) without storing credentials.",
            parameters: [
                { id: "identity_type", label: "Managed Identity Type", type: "select", options: ["System-Assigned", "User-Assigned"], default: "System-Assigned" }
            ],
            cli: [
                "// Authenticating with Azure Instance Metadata Service (IMDS)",
                "$ curl -H 'Metadata: true' 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://storage.azure.com/'",
                "{",
                "  \"access_token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1...\",",
                "  \"expires_in\": \"3599\",",
                "  \"resource\": \"https://storage.azure.com/\",",
                "  \"token_type\": \"Bearer\"",
                "}"
            ],
            config: `# Azure Managed Identity Authentication in Python
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

# DefaultAzureCredential automatically discovers System/User Managed Identities
credential = DefaultAzureCredential()

blob_service_client = BlobServiceClient(
    account_url="https://adlsplatform.blob.core.windows.net",
    credential=credential
)

# Performs secure connection using automatically acquired OAuth2 token!`
        },
        {
            id: "private-endpoint",
            title: "Private Link & Endpoints",
            description: "Azure Private Endpoints assign a private IP address from your Virtual Network (VNet) to an Azure service (like Azure SQL Database), securing database connections by routing traffic entirely over the private Microsoft network backbone.",
            parameters: [
                { id: "private_dns", label: "Private DNS Zone Resolution", type: "select", options: ["Enabled (Secure IP)", "Disabled (Public IP)"], default: "Enabled (Secure IP)" }
            ],
            cli: [
                "// Testing DNS lookup for secured Azure SQL database",
                "$ nslookup mydbserver.database.windows.net",
                "Server:  127.0.0.53",
                "Non-authoritative answer:",
                "Name:    mydbserver.privatelink.database.windows.net",
                "Address: 10.1.0.5  # Resolved to VNet Private IP!"
            ],
            config: `# Azure SQL Firewall Rule settings (Secure Architecture)
# Public Network Access is disabled.
# Virtual Network rule restricts traffic to VNet subnet.

        }
      }
    ]
  }
}`
        },
        {
            id: "synapse-serverless",
            title: "Synapse Serverless SQL Pools",
            description: "Azure Synapse Serverless SQL Pools allow querying unstructured and semi-structured data directly in ADLS Gen2 using standard T-SQL and the OPENROWSET function. There is no infrastructure to provision or manage, and you pay only for data processed by queries.",
            parameters: [
                { id: "query_format", label: "Target File Format", type: "select", options: ["Parquet", "CSV", "JSON"], default: "Parquet" }
            ],
            cli: [
                "// Querying raw Parquet file using Synapse Serverless",
                "$ sqlcmd -S synapse-serverless.sql.azuresynapse.net -d master -Q '",
                "  SELECT TOP 5 * FROM OPENROWSET(",
                "    BULK ''https://adlsplatform.dfs.core.windows.net/datalake/raw/orders/*.parquet'',",
                "    FORMAT = ''PARQUET''",
                "  ) AS [r]'",
                "--- Response: 5 rows queried from raw storage files directly ---"
            ],
            config: `-- Synapse Serverless SQL View definition
CREATE OR ALTER VIEW dbo.v_orders AS
SELECT
    r.filepath(1) AS [OrderYear],
    r.filepath(2) AS [OrderMonth],
    r.order_id,
    r.customer_id,
    r.amount
FROM OPENROWSET(
    BULK 'https://adlsplatform.dfs.core.windows.net/datalake/raw/orders/year=*/month=*/*.parquet',
    FORMAT = 'PARQUET'
) AS [r];`
        },
        {
            id: "synapse-dedicated",
            title: "Synapse Dedicated SQL Distribution",
            description: "Dedicated SQL Pools distribute database tables across 60 underlying storage distributions. You configure how tables are distributed: Hash (rows mapped by key hashing), Replicated (entire table copied to every compute node for fast joins), or Round Robin (even split).",
            parameters: [
                { id: "dist_type", label: "Table Distribution Type", type: "select", options: ["HASH (CustomerID)", "REPLICATED", "ROUND_ROBIN"], default: "HASH (CustomerID)" }
            ],
            cli: [
                "// Checking table distribution allocations",
                "SELECT d.distribution_id, t.name, d.row_count ",
                "FROM sys.pdw_table_distribution_properties d",
                "JOIN sys.tables t ON d.object_id = t.object_id",
                "WHERE t.name = 'FactOrders';",
                "--- distributions 1-60 row counts returned showing split distribution ---"
            ],
            config: `-- Synapse Dedicated SQL Table definitions
CREATE TABLE FactOrders (
    OrderID INT NOT NULL,
    CustomerID INT NOT NULL,
    OrderDate DATE NOT NULL,
    OrderAmount DECIMAL(18,2)
)
WITH (
    CLUSTERED COLUMNSTORE INDEX,
    DISTRIBUTION = HASH(CustomerID) -- Row distribution hash key
);`
        },
        {
            id: "synapse-link",
            title: "Synapse Link for Cosmos DB",
            description: "Synapse Link implements a cloud-native HTAP (Hybrid Transactional/Analytical Processing) architecture. Transactions committed to the Cosmos DB transactional store are copied in near-real-time to a columnar analytical store, allowing query analysis with zero performance impact on the OLTP database.",
            parameters: [
                { id: "sync_latency", label: "Sync Latency Goal", type: "select", options: ["Real-time (<1 min)", "Buffered (5 mins)"], default: "Real-time (<1 min)" }
            ],
            cli: [
                "// Verifying Synapse Link analytical store status",
                "$ az cosmosdb sql container show --name orders --container-name ordersContainer --resource-group rg-platform",
                "{",
                "  \"analyticalStorageTtl\": 2592000, // 30 days enabled",
                "  \"id\": \"ordersContainer\",",
                "  \"status\": \"Analytical store sync active\"",
                "}"
            ],
            config: `-- Querying Cosmos DB Analytical Store in Synapse Serverless
SELECT TOP 10 *
FROM OPENROWSET(
    PROVIDER = 'CosmosDB',
    CONNECTION = 'Account=cosmosplatform;Database=sales;Key=***',
    OBJECT = 'orders',
    SERVER_CREDENTIAL = 'cosmos-credential'
) AS [orders];`
        },
        {
            id: "databricks-delta-lake",
            title: "Delta Lake ACID & Time Travel",
            description: "Delta Lake is an open storage layer that brings ACID transactions and time travel history to Apache Spark. Writing changes appends data files and updates a JSON transaction log (_delta_log/). Readers use this log to query consistent table snapshots or historical versions.",
            parameters: [
                { id: "optimize", label: "Auto-Optimize Writes", type: "toggle", default: true, desc: "Enable Delta Auto-Optimize / Z-Ordering" }
            ],
            cli: [
                "// Inspecting Delta table history log details",
                "$ spark-shell -e 'import io.delta.tables._; val dt = DeltaTable.forPath(\"/data/orders\"); dt.history().show()'",
                "+-------+-------------------+------+---------+---------+-----+",
                "|version|          timestamp|userId|userName|operation| ... |",
                "+-------+-------------------+------+---------+---------+-----+",
                "|      2|2026-06-26 10:00:00|  root|    admin|    WRITE| ... |",
                "|      1|2026-06-25 17:00:00|  root|    admin|    WRITE| ... |",
                "+-------+-------------------+------+---------+---------+-----+"
            ],
            config: `# PySpark Delta Time Travel operations
# Read data committed as of specific version
df_v1 = spark.read \\
    .format("delta") \\
    .option("versionAsOf", 1) \\
    .load("/data/orders")

# Read data committed as of timestamp
df_ts = spark.read \\
    .format("delta") \\
    .option("timestampAsOf", "2026-06-25 17:00:00") \\
    .load("/data/orders")`
        },
        {
            id: "databricks-structured-streaming",
            title: "Databricks Structured Streaming",
            description: "Structured Streaming is an incremental stream processing engine. It queries live data sources continuously, executes micro-batches, updates checkpoint offsets inside metadata storage logs, and commits final records reliably to target tables.",
            parameters: [
                { id: "trigger_mode", label: "Streaming Trigger Mode", type: "select", options: ["AvailableNow (Batch-like)", "ProcessingTime (10s)", "Continuous (low-latency)"], default: "ProcessingTime (10s)" }
            ],
            cli: [
                "// Checking active stream query progress metrics",
                "$ curl http://localhost:4040/api/v1/applications/app-id/streaming/statistics",
                "{",
                "  \"numActiveSources\": 1,",
                "  \"avgInputRate\": 248.5,",
                "  \"avgProcessingRate\": 350.2,",
                "  \"latestBatchId\": 120",
                "}"
            ],
            config: `# PySpark Structured Streaming Pipeline script
stream_df = spark.readStream \\
    .format("eventhubs") \\
    .options(eh_config) \\
    .load()

# Perform processing and output write-stream with checkpointing
query = stream_df.writeStream \\
    .format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "/mnt/datalake/checkpoints/orders") \\
    .trigger(processingTime='10 seconds') \\
    .start("/mnt/datalake/gold/orders")`
        },
        {
            id: "databricks-photon",
            title: "Photon Vectorized Query Engine",
            description: "Photon is Databricks' next-generation vectorized query engine written in C++. It replaces the standard Spark JVM execution plan with a native C++ engine that processes columns directly in CPU registers, bypassing garbage collection and JIT compilations.",
            parameters: [
                { id: "photon_enabled", label: "Use Photon Engine", type: "toggle", default: true, desc: "Enable Photon native compiler acceleration" }
            ],
            cli: [
                "// Inspecting Spark query execution physical logs for Photon indicators",
                "$ spark-shell -e 'spark.sql(\"SELECT * FROM sales\").explain(\"formatted\")'",
                "== Physical Plan ==",
                "* PhotonProject (1)",
                "  +- * PhotonFilter (2)",
                "     +- * PhotonScan parquet (3)",
                "Note: Query execution plan fully offloaded to native Photon library."
            ],
            config: `# Spark SQL configurations to enforce Photon acceleration
spark.conf.set("spark.databricks.photon.enabled", "true")
spark.conf.set("spark.databricks.photon.coalesceBatches.enabled", "true")`
        },
        {
            id: "adf-incremental-load",
            title: "ADF Incremental Watermark Load",
            description: "Incremental loading copies only changes/deltas since the last run. A Watermark table logs the timestamp of the last successful copy. ADF performs lookups to retrieve this watermark, copies newer rows from source database, and updates the watermark log.",
            parameters: [
                { id: "load_type", label: "Watermark Column Type", type: "select", options: ["DateTime Column", "Sequential ID (BIGINT)"], default: "DateTime Column" }
            ],
            cli: [
                "// Checking local transactional watermark values",
                "SELECT TableName, WatermarkValue FROM Watermark_Log;",
                "+-----------+---------------------+",
                "| TableName | WatermarkValue      |",
                "+-----------+---------------------+",
                "| orders    | 2026-06-25 17:00:00 |",
                "+-----------+---------------------+"
            ],
            config: `-- SQL query executed by ADF Copy Activity source block
SELECT * 
FROM orders 
WHERE LastModifyTime > '@{activity('LookupOldWatermark').output.firstRow.WatermarkValue}' 
  AND LastModifyTime <= '@{activity('LookupNewWatermark').output.firstRow.NewWatermarkValue}';`
        }
    ],
    fabric: [
        {
            id: "fabric-onelake",
            title: "OneLake One Copy Shortcuts",
            description: "Microsoft Fabric OneLake uses Shortcuts to virtualize external folders from ADLS Gen2, AWS S3, or Google Cloud Storage. It establishes a unified single namespace ('One Copy') where Spark Notebooks and warehouse tables read data directly without physical movement or copies.",
            parameters: [
                { id: "ext_cloud", label: "External Cloud Provider", type: "select", options: ["Azure ADLS Gen2", "AWS S3 Bucket", "Google Cloud Storage"], default: "Azure ADLS Gen2" }
            ],
            cli: [
                "// Querying Fabric OneLake namespace directory files using CLI",
                "$ fabric-admin-cli shortcuts list --lakehouse 'Sales_LH'",
                "Shortcuts Found in lakehouse 'Sales_LH':",
                " - /Shortcuts/adls_orders -> Target: adlsplatform.dfs.core.windows.net/orders_lake",
                " - /Shortcuts/s3_sales   -> Target: s3://sales-bucket/sales_logs"
            ],
            config: `# Fabric Notebook python script querying OneLake shortcut
# Path maps directly to virtual shortcut endpoint
df = spark.read.parquet("abfss://Sales_WS@onelake.dfs.fabric.microsoft.com/Sales_LH.Lakehouse/Files/Shortcuts/adls_orders/")
df.groupBy("Region").sum("SalesAmount").show()`
        },
        {
            id: "fabric-lakehouse",
            title: "Power BI Direct Lake Mode",
            description: "Direct Lake mode is a semantic model lookup pattern in Power BI. Rather than importing records to a proprietary cache (Import mode) or compiling SQL statements on the fly (DirectQuery), the VertiPaq engine queries physical Delta Parquet columns directly from OneLake storage, offering instantaneous analysis on live databases.",
            parameters: [
                { id: "fallback_dq", label: "Allow DirectQuery Fallback", type: "toggle", default: true, desc: "Fallback to SQL endpoint if schemas mismatch" }
            ],
            cli: [
                "// Inspecting Power BI Semantic Model lookup performance metrics",
                "DaxStudio: Checking visual query load durations...",
                " - DAX query run: 14ms",
                " - Direct Lake query mapping files: [Sales_Amount.parquet, Region.parquet]",
                " - DirectQuery SQL compilation duration: 0ms (Bypassed!)"
            ],
            config: `# Semantic Model Direct Lake configurations (TOM JSON Snippet)
{
  "name": "Sales_DirectLake_Model",
  "tables": [
    {
      "name": "Sales_Fact",
      "partitions": [
        {
          "name": "Sales_Fact_Partition",
          "mode": "directLake",
          "source": {
            "type": "entity",
            "entityName": "Sales_Fact",
            "expression": "Database.Lakehouse(\"Sales_LH\")"
          }
        }
      ]
    }
  ]
}`
        },
        {
            id: "fabric-data-factory",
            title: "Fabric Data Pipelines",
            description: "Fabric Data Pipelines provide cloud-scale copy, trigger and control orchestrations inside Fabric workspaces. Managed through dedicated Fabric capacities, these pipelines load transactional tables to lakehouses and trigger notebooks to transform bronze directories into gold schemas.",
            parameters: [
                { id: "concur", label: "Max Concurrent Pipelines", type: "select", options: ["2 Pipelines", "5 Pipelines", "10 Pipelines"], default: "5 Pipelines" }
            ],
            cli: [
                "// Fetching pipeline run details from Fabric API",
                "$ az fabric pipeline run show --workspace-id 412A-59B1 --run-id 50243",
                "{",
                "  \"pipelineName\": \"sync_orders_to_gold\",",
                "  \"runStatus\": \"Succeeded\",",
                "  \"activitiesCount\": 3,",
                "  \"durationMs\": 124500",
                "}"
            ],
            config: `# Fabric Data Pipeline orchestration mapping definition (JSON snippet)
{
  "name": "sync_orders_to_gold",
  "properties": {
    "activities": [
      {
        "name": "Copy SQL to Lakehouse",
        "type": "Copy",
        "typeProperties": {
          "source": { "type": "AzureSqlSource" },
          "sink": { "type": "LakehouseTableSink" }
        }
      },
      {
        "name": "Trigger Gold Aggregation",
        "type": "Notebook",
        "dependsOn": [ { "activity": "Copy SQL to Lakehouse", "condition": "Succeeded" } ]
      }
    ]
  }
}`
        }
    ],
    frontend: [
    {
        "id": "browser-rendering",
        "title": "Critical Rendering Path",
        "description": "The Critical Rendering Path (CRP) is the sequence of steps the browser goes through to convert HTML, CSS, and JavaScript into active pixels on the screen. Optimizing the CRP directly improves page load speed and user experience.",
        "parameters": [
            {
                "id": "css_blocking",
                "label": "CSS Parsing Style",
                "type": "select",
                "options": [
                    "Render-Blocking",
                    "Asynchronous/Inlined"
                ],
                "default": "Render-Blocking"
            },
            {
                "id": "js_execution",
                "label": "JS Loading Strategy",
                "type": "select",
                "options": [
                    "Render-Blocking (Default)",
                    "Async / Deferred"
                ],
                "default": "Render-Blocking (Default)"
            }
        ],
        "cli": [
            "// Profiling document parsing and paint events via DevTools CLI",
            "$ curl -I https://localhost:5173/",
            "HTTP/1.1 200 OK",
            "Content-Type: text/html; charset=UTF-8",
            "",
            "[Navigation Timing API Performance Metrics]:",
            " - domLoading: 10ms",
            " - domInteractive: 140ms (DOM built)",
            " - domContentLoadedEventEnd: 290ms (CSSOM & JS complete)",
            " - firstMeaningfulPaint: 320ms (Visible elements rendered)"
        ],
        "config": "<!-- Critical Rendering Path Optimizations (HTML) -->\n<!DOCTYPE html>\n<html>\n<head>\n  <!-- Inlined critical CSS to bypass render blocking lookup -->\n  <style>body{margin:0;font-family:system-ui;}</style>\n  \n  <!-- Non-critical CSS loaded asynchronously -->\n  <link rel=\"preload\" href=\"styles.css\" as=\"style\" onload=\"this.onload=null;this.rel='stylesheet'\">\n  \n  <!-- Deferred script execution prevents block of DOM parser -->\n  <script defer src=\"app.js\"></script>\n</head>\n<body>\n  <div id=\"app\">Hello World</div>\n</body>\n</html>"
    },
    {
        "id": "virtual-dom",
        "title": "Virtual DOM & Reconciliation",
        "description": "React utilizes a Virtual DOM tree to minimize direct real DOM manipulations. When state transitions occur, React creates a new Virtual DOM tree, performs a diff comparison (Reconciliation) against the previous tree, and patches only the mismatched DOM elements.",
        "parameters": [
            {
                "id": "render_mode",
                "label": "Reconciliation Mode",
                "type": "select",
                "options": [
                    "React Diff (Targeted)",
                    "Traditional (Full Reload)"
                ],
                "default": "React Diff (Targeted)"
            }
        ],
        "cli": [
            "// React Fiber tree reconciliation engine tracing",
            "[React Core] State transition: count: 0 -> 1",
            "[Reconciliation] Instantiating diff comparison...",
            " - Comparing root element <div id='app'> : matches",
            " - Comparing child <Counter> : state changed",
            " - Comparing text node span.count value: '0' != '1' (Mismatch detected!)",
            "[DOM Patch] Queueing mutation: textContent updated for DOM ID 'counter-val'",
            "[Browser Paint] Layout reflow bypassed. 1 element repainted in 0.95ms."
        ],
        "config": "// React State Update triggering Virtual DOM Diffing\nimport React, { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n\n  // Triggering state change schedules a Virtual DOM re-render\n  return (\n    <div className=\"counter-card\">\n      <p>Count: <span className=\"count-val\">{count}</span></p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment State\n      </button>\n    </div>\n  );\n}"
    },
    {
        "id": "css-box-model",
        "title": "CSS Box Model & Flexbox",
        "description": "The CSS Box Model represents every element as a rectangular box defined by Content, Padding, Border, and Margin. Flexbox is a one-dimensional layout model that simplifies aligning items and distributing space in a parent container.",
        "parameters": [
            {
                "id": "flex_direction",
                "label": "Flex Direction",
                "type": "select",
                "options": [
                    "row",
                    "column"
                ],
                "default": "row"
            },
            {
                "id": "justify_content",
                "label": "Justify Content",
                "type": "select",
                "options": [
                    "flex-start",
                    "center",
                    "space-between"
                ],
                "default": "space-between"
            },
            {
                "id": "box_padding",
                "label": "Box Padding",
                "type": "select",
                "options": [
                    "10px",
                    "20px",
                    "30px"
                ],
                "default": "20px"
            }
        ],
        "cli": [
            "// Inspecting element layout calculations inside the browser engine",
            "$ getComputedStyle(document.querySelector('.flex-item'))",
            "{",
            "  display: \"flex\",",
            "  box-sizing: \"border-box\",",
            "  margin: \"15px\",      /* Outer gap */",
            "  border: \"2px solid\", /* Boundary */",
            "  padding: \"20px\",     /* Inner spacing */",
            "  width: \"220px\",      /* Content width */",
            "  height: \"100px\"",
            "}",
            "Layout Reflow: Parent container aligned 3 child items along main axis."
        ],
        "config": "/* CSS Layout rules demonstrating Box Model sizing */\n.flex-container {\n  display: flex;\n  flex-direction: row;          /* Main axis path selection */\n  justify-content: space-between; /* Spacing distribution */\n  align-items: center;\n  width: 100%;\n}\n\n.flex-item {\n  box-sizing: border-box;       /* Include padding & border in width */\n  width: 200px;\n  padding: 20px;                /* Emerald zone */\n  border: 3px solid #3b82f6;    /* Accent boundary */\n  margin: 15px;                 /* Amber spacing */\n  background-color: #151d33;\n}"
    },
    {
        "id": "html-intro",
        "title": "HTML Introduction",
        "description": "HTML stands for HyperText Markup Language. It defines the basic structural skeleton of web pages loaded in client browsers, organizing content using a series of tag pairs.",
        "parameters": [
            {
                "id": "doc_type",
                "label": "DOCTYPE Standard",
                "type": "select",
                "options": [
                    "HTML5",
                    "HTML 4.01 Strict"
                ],
                "default": "HTML5"
            }
        ],
        "cli": [
            "$ curl -s http://localhost/ | head -n 5",
            "<!DOCTYPE html>",
            "<html>",
            "<head>",
            "  <title>W3Schools Example</title>",
            "</head>"
        ],
        "config": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>This is a Heading</h1>\n  <p>This is a paragraph.</p>\n</body>\n</html>"
    },
    {
        "id": "html-elements",
        "title": "HTML Elements",
        "description": "An HTML element is defined by a start tag, some content, and an end tag. Elements can be nested inside other elements to create document hierarchies.",
        "parameters": [
            {
                "id": "tag_nesting",
                "label": "Nesting Level",
                "type": "select",
                "options": [
                    "Flat",
                    "Nested 2-deep"
                ],
                "default": "Flat"
            }
        ],
        "cli": [
            "$ document.body.innerHTML",
            "\"<h1>My First Heading</h1><p>My first paragraph.</p>\""
        ],
        "config": "<h1>My First Heading</h1>\n<p>My first paragraph.</p>"
    },
    {
        "id": "html-attributes",
        "title": "HTML Attributes",
        "description": "Attributes provide additional metadata information about HTML elements, such as source references (src) or hyperlink targets (href). They are always specified in the start tag.",
        "parameters": [
            {
                "id": "target_attr",
                "label": "Link Target",
                "type": "select",
                "options": [
                    "_self (Same Tab)",
                    "_blank (New Tab)"
                ],
                "default": "_self (Same Tab)"
            }
        ],
        "cli": [
            "$ document.querySelector('a').getAttribute('href')",
            "\"https://www.w3schools.com\""
        ],
        "config": "<a href=\"https://www.w3schools.com\" target=\"_blank\">Visit W3Schools</a>\n<img src=\"w3schools.jpg\" alt=\"W3Schools Logo\" width=\"104\" height=\"142\">"
    },
    {
        "id": "html-headings",
        "title": "HTML Headings",
        "description": "HTML headings are defined with the <h1> to <h6> tags. <h1> defines the most important heading, while <h6> defines the least important heading.",
        "parameters": [
            {
                "id": "heading_level",
                "label": "Selected Tag",
                "type": "select",
                "options": [
                    "h1 (Main)",
                    "h3 (Section)",
                    "h6 (Tiny)"
                ],
                "default": "h1 (Main)"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('h1')).fontSize",
            "\"32px\" // User Agent stylesheet defaults"
        ],
        "config": "<h1>Heading 1</h1>\n<h2>Heading 2</h2>\n<h3>Heading 3</h3>"
    },
    {
        "id": "html-paragraphs",
        "title": "HTML Paragraphs",
        "description": "The HTML <p> element defines a paragraph. Browsers automatically add some white space (margin) before and after any paragraph.",
        "parameters": [
            {
                "id": "br_count",
                "label": "Line Breaks (<br>)",
                "type": "select",
                "options": [
                    "None",
                    "2 Breaks"
                ],
                "default": "None"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('p')).margin",
            "\"16px 0px\" // Computed paragraph gaps"
        ],
        "config": "<p>This is a paragraph.</p>\n<p>This is another paragraph with a <br> line break.</p>"
    },
    {
        "id": "html-styles",
        "title": "HTML Inline Styles",
        "description": "The HTML style attribute is used to add inline CSS styling (like color, font, size, etc.) directly to an HTML element.",
        "parameters": [
            {
                "id": "text_color",
                "label": "Color Theme",
                "type": "select",
                "options": [
                    "Crimson Red",
                    "Royal Blue",
                    "Forest Green"
                ],
                "default": "Crimson Red"
            }
        ],
        "cli": [
            "$ document.querySelector('p').style.color",
            "\"red\" // Direct inline DOM binding"
        ],
        "config": "<p style=\"color:red;font-size:20px;\">This is a red paragraph.</p>"
    },
    {
        "id": "html-formatting",
        "title": "HTML Text Formatting",
        "description": "HTML defines special elements for defining text with special styling meanings (like <strong> for bold importances or <em> for text emphasis).",
        "parameters": [
            {
                "id": "format_tag",
                "label": "Selected Format",
                "type": "select",
                "options": [
                    "strong (Bold)",
                    "em (Italic)",
                    "mark (Highlight)"
                ],
                "default": "strong (Bold)"
            }
        ],
        "cli": [
            "$ document.querySelector('strong').tagName",
            "\"STRONG\""
        ],
        "config": "<p>This is <strong>important</strong> bold text and <em>emphasized</em> italic text.</p>\n<p>We can also <mark>highlight</mark> text.</p>"
    },
    {
        "id": "html-links",
        "title": "HTML Links & Targets",
        "description": "HTML links are hyperlinks. The href attribute specifies the destination URL address of the anchor element target.",
        "parameters": [
            {
                "id": "link_protocol",
                "label": "Protocol",
                "type": "select",
                "options": [
                    "HTTPS (Secure)",
                    "Relative Path"
                ],
                "default": "HTTPS (Secure)"
            }
        ],
        "cli": [
            "$ document.querySelector('a').href",
            "\"https://www.w3schools.com/html/\""
        ],
        "config": "<a href=\"https://www.w3schools.com/html/\">HTML Tutorial</a>"
    },
    {
        "id": "html-images",
        "title": "HTML Images",
        "description": "HTML images are defined with the <img> tag. The path to the image location is declared in the src attribute, along with alt backup text.",
        "parameters": [
            {
                "id": "img_responsive",
                "label": "Image Scale",
                "type": "select",
                "options": [
                    "Fixed (Absolute)",
                    "Responsive (100% Width)"
                ],
                "default": "Fixed (Absolute)"
            }
        ],
        "cli": [
            "$ document.querySelector('img').complete",
            "true // Resource downloaded"
        ],
        "config": "<img src=\"img_girl.jpg\" alt=\"Girl in a jacket\" width=\"500\" height=\"600\">"
    },
    {
        "id": "html-tables",
        "title": "HTML Tables",
        "description": "The <table> tag defines an HTML table. Each table row is defined with <tr>, headers with <th>, and cells with <td> tags.",
        "parameters": [
            {
                "id": "table_border",
                "label": "Border style",
                "type": "select",
                "options": [
                    "No border",
                    "1px Solid Border"
                ],
                "default": "1px Solid Border"
            }
        ],
        "cli": [
            "$ document.querySelectorAll('tr').length",
            "3 // Rows mapped"
        ],
        "config": "<table>\n  <tr>\n    <th>Company</th>\n    <th>Contact</th>\n  </tr>\n  <tr>\n    <td>Alfreds Futterkiste</td>\n    <td>Maria Anders</td>\n  </tr>\n</table>"
    },
    {
        "id": "html-lists",
        "title": "HTML Lists",
        "description": "HTML lists are either ordered (<ol>) with numeric markers or unordered (<ul>) with bullet points.",
        "parameters": [
            {
                "id": "list_type",
                "label": "List Marker style",
                "type": "select",
                "options": [
                    "Unordered (Bullet)",
                    "Ordered (Number)"
                ],
                "default": "Unordered (Bullet)"
            }
        ],
        "cli": [
            "$ document.querySelectorAll('li').length",
            "3 // List elements parsed"
        ],
        "config": "<ul>\n  <li>Coffee</li>\n  <li>Tea</li>\n  <li>Milk</li>\n</ul>"
    },
    {
        "id": "html-blocks",
        "title": "HTML Block & Inline",
        "description": "Block-level elements (like <div>, <p>) start on a new line and stretch out. Inline elements (like <span>, <a>) display inline on the same row.",
        "parameters": [
            {
                "id": "display_model",
                "label": "Default Tag type",
                "type": "select",
                "options": [
                    "div (Block)",
                    "span (Inline)"
                ],
                "default": "div (Block)"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('div')).display",
            "\"block\""
        ],
        "config": "<div>This block element starts on a new line.</div>\n<span>This inline element stays inside the text flow.</span>"
    },
    {
        "id": "html-classes",
        "title": "HTML Class Attribute",
        "description": "The class attribute specifies one or more class names for an HTML element. Multiple elements can share the same class name.",
        "parameters": [
            {
                "id": "class_active",
                "label": "Class Assigned Style",
                "type": "select",
                "options": [
                    "styled-box",
                    "default-box"
                ],
                "default": "styled-box"
            }
        ],
        "cli": [
            "$ document.querySelector('.city').className",
            "\"city\""
        ],
        "config": "<div class=\"city\">\n  <h2>London</h2>\n  <p>London is the capital city of England.</p>\n</div>"
    },
    {
        "id": "html-id",
        "title": "HTML Unique ID",
        "description": "The id attribute specifies a unique ID for an HTML element. The value of the id attribute must be unique within the HTML document.",
        "parameters": [
            {
                "id": "id_query",
                "label": "JS Query Selector",
                "type": "select",
                "options": [
                    "getElementById()",
                    "querySelector()"
                ],
                "default": "getElementById()"
            }
        ],
        "cli": [
            "$ document.getElementById('myHeader').textContent",
            "\"My Header Text\""
        ],
        "config": "<h1 id=\"myHeader\">My Header Text</h1>"
    },
    {
        "id": "html-iframes",
        "title": "HTML Iframes",
        "description": "An HTML iframe is used to display a nested web page within a frame inside the parent HTML page.",
        "parameters": [
            {
                "id": "iframe_border",
                "label": "Frame Border",
                "type": "select",
                "options": [
                    "Show Border",
                    "Hide Border (0)"
                ],
                "default": "Hide Border (0)"
            }
        ],
        "cli": [
            "$ document.querySelector('iframe').src",
            "\"https://www.w3schools.com\""
        ],
        "config": "<iframe src=\"https://www.w3schools.com\" title=\"W3Schools Website\" height=\"300\" width=\"100%\"></iframe>"
    },
    {
        "id": "html-forms",
        "title": "HTML Forms",
        "description": "The <form> element is a wrapper used to aggregate user input elements like input fields, textareas, or checkboxes before submitting them.",
        "parameters": [
            {
                "id": "form_method",
                "label": "Submit Method",
                "type": "select",
                "options": [
                    "GET (Query params)",
                    "POST (Payload body)"
                ],
                "default": "GET (Query params)"
            }
        ],
        "cli": [
            "$ document.querySelector('form').action",
            "\"/submit_page.php\""
        ],
        "config": "<form action=\"/submit_page.php\" method=\"POST\">\n  <label for=\"fname\">First name:</label><br>\n  <input type=\"text\" id=\"fname\" name=\"fname\"><br>\n  <input type=\"submit\" value=\"Submit\">\n</form>"
    },
    {
        "id": "html-input-types",
        "title": "HTML Input Types",
        "description": "HTML supports various input types for form collection, such as standard text, passwords, email addresses, numbers, or dates.",
        "parameters": [
            {
                "id": "input_type",
                "label": "Field Type",
                "type": "select",
                "options": [
                    "text",
                    "password",
                    "checkbox",
                    "submit"
                ],
                "default": "text"
            }
        ],
        "cli": [
            "$ document.querySelector('input').type",
            "\"password\""
        ],
        "config": "<input type=\"text\" name=\"username\">\n<input type=\"password\" name=\"pwd\">\n<input type=\"checkbox\" name=\"agree\">"
    },
    {
        "id": "html-input-attributes",
        "title": "HTML Input Attributes",
        "description": "Attributes on inputs specify validations and limits, like value, readonly, disabled, required, min, max, or placeholders.",
        "parameters": [
            {
                "id": "valid_required",
                "label": "Required Flag",
                "type": "select",
                "options": [
                    "required",
                    "optional"
                ],
                "default": "required"
            }
        ],
        "cli": [
            "$ document.querySelector('input').required",
            "true // Parser validates before submit"
        ],
        "config": "<input type=\"text\" name=\"email\" required placeholder=\"Enter your email\">"
    },
    {
        "id": "html-semantic",
        "title": "HTML Semantics",
        "description": "Semantic elements clearly describe their meaning to both the browser and the developer (e.g. <header>, <nav>, <article>, <section>, <footer>).",
        "parameters": [
            {
                "id": "semantic_tag",
                "label": "Wrapper tag",
                "type": "select",
                "options": [
                    "section (Content)",
                    "footer (Footer)"
                ],
                "default": "section (Content)"
            }
        ],
        "cli": [
            "$ document.querySelector('section').tagName",
            "\"SECTION\""
        ],
        "config": "<section>\n  <h2>About Us</h2>\n  <p>We are dedicated to frontend engineering.</p>\n</section>"
    },
    {
        "id": "html-media",
        "title": "HTML Media Controls",
        "description": "HTML5 introduces native multimedia components to load and play videos (<video>) and music (<audio>) directly inside the page view.",
        "parameters": [
            {
                "id": "media_controls",
                "label": "Play Controls Overlay",
                "type": "select",
                "options": [
                    "controls (Default)",
                    "autoplay / loop"
                ],
                "default": "controls (Default)"
            }
        ],
        "cli": [
            "$ document.querySelector('video').paused",
            "true // Initial playback state"
        ],
        "config": "<video width=\"320\" height=\"240\" controls>\n  <source src=\"movie.mp4\" type=\"video/mp4\">\n  Your browser does not support the video tag.\n</video>"
    },
    {
        "id": "css-syntax",
        "title": "CSS Syntax & Rules",
        "description": "A CSS rule-set consists of a selector pointing to the elements to style, and a declaration block containing style definitions.",
        "parameters": [
            {
                "id": "css_rule",
                "label": "Target style",
                "type": "select",
                "options": [
                    "Color & Size",
                    "Font weight"
                ],
                "default": "Color & Size"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('p')).color",
            "\"rgb(255, 0, 0)\""
        ],
        "config": "p {\n  color: red;\n  text-align: center;\n}"
    },
    {
        "id": "css-selectors",
        "title": "CSS Selectors",
        "description": "CSS selectors point to the HTML elements to style, matching by tag name, class (.classname), ID (#idname), or attributes.",
        "parameters": [
            {
                "id": "selector_match",
                "label": "Match Method",
                "type": "select",
                "options": [
                    ".class (Multiple)",
                    "#id (Unique)",
                    "element (All)"
                ],
                "default": ".class (Multiple)"
            }
        ],
        "cli": [
            "$ document.querySelectorAll('.intro').length",
            "3 // Class match count"
        ],
        "config": ".intro {\n  font-weight: bold;\n  color: #3b82f6;\n}"
    },
    {
        "id": "css-howto",
        "title": "CSS HowTo",
        "description": "Styles can be applied in three ways: External stylesheets, Internal style tags in the head, or Inline style attributes on elements.",
        "parameters": [
            {
                "id": "insert_style",
                "label": "Style Injection",
                "type": "select",
                "options": [
                    "External link tag",
                    "Internal style block"
                ],
                "default": "External link tag"
            }
        ],
        "cli": [
            "$ document.styleSheets.length",
            "1 // Loaded stylesheet count"
        ],
        "config": "<!-- External stylesheet link -->\n<link rel=\"stylesheet\" href=\"mystyle.css\">\n\n<!-- Internal style tag -->\n<style>\n  body { background-color: linen; }\n</style>"
    },
    {
        "id": "css-colors",
        "title": "CSS Colors",
        "description": "Colors are set using color names, HEX codes (#3b82f6), RGB formulas (rgb(59, 130, 246)), or HSL angles (hsl(220, 90%, 60%)).",
        "parameters": [
            {
                "id": "color_format",
                "label": "Color Representation",
                "type": "select",
                "options": [
                    "Hex Code",
                    "RGBA (with Alpha opacity)"
                ],
                "default": "Hex Code"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('h1')).color",
            "\"rgb(59, 130, 246)\""
        ],
        "config": "h1 {\n  color: #3b82f6;\n  background-color: rgba(59, 130, 246, 0.1);\n}"
    },
    {
        "id": "css-backgrounds",
        "title": "CSS Backgrounds",
        "description": "The CSS background properties are used to set background colors, images, repeat methods, sizes, and viewport attachments.",
        "parameters": [
            {
                "id": "bg_repeat",
                "label": "Image Repeat",
                "type": "select",
                "options": [
                    "no-repeat",
                    "repeat-x",
                    "repeat-y"
                ],
                "default": "no-repeat"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.body).backgroundImage",
            "\"url('paper.gif')\""
        ],
        "config": "body {\n  background-image: url(\"paper.gif\");\n  background-repeat: no-repeat;\n  background-size: cover;\n}"
    },
    {
        "id": "css-borders",
        "title": "CSS Borders",
        "description": "The CSS border properties allow you to specify the design style (solid, dashed), width, and color outlines around elements.",
        "parameters": [
            {
                "id": "border_radius",
                "label": "Corner Radius",
                "type": "select",
                "options": [
                    "4px (Slight)",
                    "50% (Circle)"
                ],
                "default": "4px (Slight)"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('div')).borderWidth",
            "\"2px\""
        ],
        "config": "div {\n  border: 2px solid #3b82f6;\n  border-radius: 4px;\n}"
    },
    {
        "id": "css-margins",
        "title": "CSS Margins",
        "description": "Margins set external spacing around elements, pushing neighbors away. Margins can be set individually or via shorthand.",
        "parameters": [
            {
                "id": "margin_auto",
                "label": "Centering (margin: auto)",
                "type": "select",
                "options": [
                    "Enabled",
                    "Disabled"
                ],
                "default": "Enabled"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('div')).marginRight",
            "\"40px\""
        ],
        "config": "div {\n  margin: 20px auto;\n  width: 300px;\n}"
    },
    {
        "id": "css-paddings",
        "title": "CSS Paddings",
        "description": "Padding sets internal spacing around element content, pushing the element border outwards.",
        "parameters": [
            {
                "id": "padding_shorthand",
                "label": "Padding Values",
                "type": "select",
                "options": [
                    "20px (Uniform)",
                    "10px 20px (Split)"
                ],
                "default": "20px (Uniform)"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('div')).paddingLeft",
            "\"20px\""
        ],
        "config": "div {\n  padding: 10px 20px;\n}"
    },
    {
        "id": "css-height-width",
        "title": "CSS Height & Width",
        "description": "Height and width define active box dimensions. The box-sizing: border-box rule ensures padding is included in sizing calculations.",
        "parameters": [
            {
                "id": "box_sizing_val",
                "label": "Box Sizing rule",
                "type": "select",
                "options": [
                    "border-box (Included)",
                    "content-box (Added)"
                ],
                "default": "border-box (Included)"
            }
        ],
        "cli": [
            "$ document.querySelector('div').getBoundingClientRect().width",
            "250 // Actual measured width"
        ],
        "config": "div {\n  width: 250px;\n  height: 150px;\n  box-sizing: border-box;\n}"
    },
    {
        "id": "css-outline",
        "title": "CSS Outlines",
        "description": "An outline is a line drawn around elements, outside the borders, used to highlight focus states without shifting sizes.",
        "parameters": [
            {
                "id": "outline_offset",
                "label": "Outline Offset gap",
                "type": "select",
                "options": [
                    "0px",
                    "4px"
                ],
                "default": "0px"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('input')).outline",
            "\"rgb(59, 130, 246) solid 2px\""
        ],
        "config": "input:focus {\n  outline: 2px solid #3b82f6;\n  outline-offset: 4px;\n}"
    },
    {
        "id": "css-text",
        "title": "CSS Text Styles",
        "description": "CSS contains text alignment, decoration lines, character spacing, line height metrics, and capitalization transformations.",
        "parameters": [
            {
                "id": "text_transform",
                "label": "Capitalization",
                "type": "select",
                "options": [
                    "uppercase",
                    "capitalize",
                    "none"
                ],
                "default": "uppercase"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('p')).textTransform",
            "\"uppercase\""
        ],
        "config": "p {\n  text-transform: uppercase;\n  text-align: justify;\n  line-height: 1.6;\n}"
    },
    {
        "id": "css-fonts",
        "title": "CSS Fonts",
        "description": "CSS font properties manage styles, weight sizing, web font load sources (@font-face), and system fallback font chains.",
        "parameters": [
            {
                "id": "font_family_val",
                "label": "Selected font",
                "type": "select",
                "options": [
                    "Outfit (Sans-serif)",
                    "JetBrains Mono (Mono)"
                ],
                "default": "Outfit (Sans-serif)"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.body).fontFamily",
            "\"Outfit\", sans-serif"
        ],
        "config": "body {\n  font-family: \"Outfit\", sans-serif;\n  font-weight: 500;\n}"
    },
    {
        "id": "css-icons",
        "title": "CSS Icons",
        "description": "Icon classes render vector graphics inline. Icon sets are loaded using link tags loading font-face icons.",
        "parameters": [
            {
                "id": "icon_set",
                "label": "Icon Provider",
                "type": "select",
                "options": [
                    "Lucide CDN",
                    "FontAwesome"
                ],
                "default": "Lucide CDN"
            }
        ],
        "cli": [
            "$ document.querySelectorAll('i[data-lucide]').length",
            "8 // Icons identified"
        ],
        "config": "<!-- Icon representation -->\n<i class=\"fa fa-car\"></i>\n<i data-lucide=\"network\"></i>"
    },
    {
        "id": "css-links",
        "title": "CSS Link States",
        "description": "Links are styled based on their active interaction state: a:link, a:visited, a:hover, and a:active.",
        "parameters": [
            {
                "id": "link_hover_effect",
                "label": "Hover Effect",
                "type": "select",
                "options": [
                    "Underline",
                    "Color Shift"
                ],
                "default": "Color Shift"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('a')).textDecorationLine",
            "\"none\""
        ],
        "config": "a:link { text-decoration: none; }\na:hover { text-decoration: underline; color: #2563eb; }"
    },
    {
        "id": "css-lists",
        "title": "CSS List Styling",
        "description": "CSS handles ordered and unordered list item markers (bullets, squares, numbers) or replaces them with custom icons.",
        "parameters": [
            {
                "id": "list_style_type",
                "label": "Bullet style",
                "type": "select",
                "options": [
                    "circle",
                    "square",
                    "none"
                ],
                "default": "none"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('ul')).listStyleType",
            "\"none\""
        ],
        "config": "ul {\n  list-style-type: none;\n  padding: 0;\n  margin: 0;\n}"
    },
    {
        "id": "css-display",
        "title": "CSS Display Property",
        "description": "The display property controls if elements display as inline-blocks, inline strings, grids, blocks, or hide entirely (none).",
        "parameters": [
            {
                "id": "display_prop",
                "label": "Display type",
                "type": "select",
                "options": [
                    "block",
                    "inline-block",
                    "none (Hidden)"
                ],
                "default": "block"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('span')).display",
            "\"inline\""
        ],
        "config": "span.badge {\n  display: inline-block;\n  padding: 5px;\n}"
    },
    {
        "id": "css-max-width",
        "title": "CSS Max-Width",
        "description": "Defining max-width constraints on blocks prevents horizontal scroll on smaller window screens, enabling responsiveness.",
        "parameters": [
            {
                "id": "max_width_val",
                "label": "Max Width limit",
                "type": "select",
                "options": [
                    "100% (Fluid)",
                    "500px (Fixed limit)"
                ],
                "default": "100% (Fluid)"
            }
        ],
        "cli": [
            "$ document.querySelector('img').style.maxWidth",
            "\"100%\""
        ],
        "config": "img {\n  max-width: 100%;\n  height: auto;\n}"
    },
    {
        "id": "css-position",
        "title": "CSS Position Styles",
        "description": "The position property configures element layout placement: static, relative, absolute, fixed, or sticky.",
        "parameters": [
            {
                "id": "pos_type",
                "label": "Positioning rule",
                "type": "select",
                "options": [
                    "relative",
                    "absolute",
                    "sticky"
                ],
                "default": "relative"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('header')).position",
            "\"sticky\""
        ],
        "config": "header {\n  position: sticky;\n  top: 0;\n  z-index: 10;\n}"
    },
    {
        "id": "css-zindex",
        "title": "CSS Z-Index layers",
        "description": "Z-index specifies the stack layer order of overlapping elements. Z-index only works on positioned elements.",
        "parameters": [
            {
                "id": "z_value",
                "label": "Z-Index level",
                "type": "select",
                "options": [
                    "10 (Main Content)",
                    "100 (Modal Overlay)"
                ],
                "default": "10 (Main Content)"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('.modal')).zIndex",
            "\"100\""
        ],
        "config": ".modal {\n  position: fixed;\n  z-index: 100;\n}"
    },
    {
        "id": "css-overflow",
        "title": "CSS Overflow Rules",
        "description": "Overflow properties manage element sizing overflow behavior: visible (spills out), hidden (clips content), or scroll/auto.",
        "parameters": [
            {
                "id": "overflow_y",
                "label": "Vertical Overflow",
                "type": "select",
                "options": [
                    "auto (Scrollbar)",
                    "hidden (Clip)"
                ],
                "default": "auto (Scrollbar)"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('.scrollbox')).overflowY",
            "\"auto\""
        ],
        "config": ".scrollbox {\n  height: 200px;\n  overflow-y: auto;\n}"
    },
    {
        "id": "css-align",
        "title": "CSS Box Alignment",
        "description": "Centering elements is managed via margin auto block properties, flex alignment constraints, or absolute coordinate shifts.",
        "parameters": [
            {
                "id": "align_method",
                "label": "Align Strategy",
                "type": "select",
                "options": [
                    "Flexbox Align",
                    "Position Absolute Translate"
                ],
                "default": "Flexbox Align"
            }
        ],
        "cli": [
            "$ getComputedStyle(document.querySelector('.flex-box')).justifyContent",
            "\"center\""
        ],
        "config": ".flex-box {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}"
    },
    {
        "id": "react-es6",
        "title": "React ES6 Features",
        "description": "React heavily relies on modern JavaScript (ES6+). Destructuring, arrow functions, and array helpers (.map, .filter) are crucial.",
        "parameters": [
            {
                "id": "es6_feature",
                "label": "Helper Function",
                "type": "select",
                "options": [
                    "Array.map()",
                    "Object Destructuring"
                ],
                "default": "Array.map()"
            }
        ],
        "cli": [
            "[Babel transpiler] Translating ES6 modules to ES5 standard...",
            " - Destructuring variables: parsed",
            " - Arrow functions resolved to standard functions."
        ],
        "config": "// ES6 Array map usage in React loops\nconst items = ['React', 'Vue', 'Angular'];\nconst listItems = items.map((item) => <li>{item}</li>);"
    },
    {
        "id": "react-render",
        "title": "React DOM Rendering",
        "description": "React loads components into a single root container element using the createRoot API, managing the browser lifecycle.",
        "parameters": [
            {
                "id": "root_element",
                "label": "Target DOM ID",
                "type": "select",
                "options": [
                    "root",
                    "app"
                ],
                "default": "root"
            }
        ],
        "cli": [
            "[ReactDOM] createRoot(container) initialized.",
            "[ReactDOM] Rendering app tree nodes..."
        ],
        "config": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);"
    },
    {
        "id": "react-jsx",
        "title": "React JSX Syntax",
        "description": "JSX allows writing HTML-like code inside JavaScript. The compiler (like Babel) transpiles JSX into React.createElement() commands.",
        "parameters": [
            {
                "id": "jsx_expression",
                "label": "Evaluation",
                "type": "select",
                "options": [
                    "{Variables}",
                    "{JS Logic Functions}"
                ],
                "default": "{Variables}"
            }
        ],
        "cli": [
            "[Babel compiler] Converting JSX expression: <h1 /> -> React.createElement('h1', null, ...)"
        ],
        "config": "const myName = \"W3Schools\";\nconst element = <h1>Hello {myName}</h1>;"
    },
    {
        "id": "react-components",
        "title": "React Component Model",
        "description": "Components are reusable functional entities returning JSX views. Functions are the standard model, replacing legacy classes.",
        "parameters": [
            {
                "id": "comp_type",
                "label": "Component Strategy",
                "type": "select",
                "options": [
                    "Functional Component",
                    "Class Component (Legacy)"
                ],
                "default": "Functional Component"
            }
        ],
        "cli": [
            "[React Engine] Resolving Component instance <Header />",
            "[React Engine] Mounting functional hooks..."
        ],
        "config": "function Header() {\n  return <h2>Hello, I am a Header!</h2>;\n}"
    },
    {
        "id": "react-props",
        "title": "React Props Transfer",
        "description": "Props are read-only properties passed down from parent components to child components, flowing data unidirectionally.",
        "parameters": [
            {
                "id": "prop_type",
                "label": "Pass datatype",
                "type": "select",
                "options": [
                    "String value",
                    "JS Object / Array"
                ],
                "default": "String value"
            }
        ],
        "cli": [
            "[React Lifecycle] Passing prop parameter: brand='Ford'",
            "[React Reconciler] Evaluated child prop template."
        ],
        "config": "function Car(props) {\n  return <h2>I am a {props.brand}!</h2>;\n}\n// Render syntax:\n// <Car brand=\"Ford\" />"
    },
    {
        "id": "react-state",
        "title": "React State Concept",
        "description": "State is local data belonging to a component instance that can change over time. Modifying state schedules a component re-render.",
        "parameters": [
            {
                "id": "state_val",
                "label": "State tracking",
                "type": "select",
                "options": [
                    "useState hook",
                    "State Object"
                ],
                "default": "useState hook"
            }
        ],
        "cli": [
            "[React State] State change request registered.",
            "[React Fiber] Scheduled queue update tick."
        ],
        "config": "// Standard functional state template\nconst [color, setColor] = useState(\"red\");"
    },
    {
        "id": "react-events",
        "title": "React Events Handler",
        "description": "React triggers event handlers using camelCase SyntheticEvents (like onClick, onChange) wrapping browser events.",
        "parameters": [
            {
                "id": "event_type",
                "label": "Action event",
                "type": "select",
                "options": [
                    "onClick (Buttons)",
                    "onChange (Inputs)"
                ],
                "default": "onClick (Buttons)"
            }
        ],
        "cli": [
            "[SyntheticEvent] Intercepted user mouse click event.",
            "[React Handler] Calling inline callback function."
        ],
        "config": "function Football() {\n  const shoot = () => { alert(\"Goal!\"); }\n  return <button onClick={shoot}>Take the shot!</button>;\n}"
    },
    {
        "id": "react-conditionals",
        "title": "React Conditionals",
        "description": "Conditional rendering in React displays components conditionally using standard if-statements, ternary expressions, or logical operators.",
        "parameters": [
            {
                "id": "cond_logic",
                "label": "Logical Strategy",
                "type": "select",
                "options": [
                    "Logical && (Short circuit)",
                    "Ternary operator (A ? B : C)"
                ],
                "default": "Logical && (Short circuit)"
            }
        ],
        "cli": [
            "[React Render] Condition evaluated: showHeader is true.",
            "[React Reconciler] Rendering subcomponent header."
        ],
        "config": "function Garage(props) {\n  const cars = props.cars;\n  return (\n    <>\n      {cars.length > 0 && <h2>You have {cars.length} cars.</h2>}\n    </>\n  );\n}"
    },
    {
        "id": "react-lists",
        "title": "React Lists & Keys",
        "description": "Rendering loops map arrays to JSX components. Items inside loops require a unique 'key' prop to aid DOM reconciliation.",
        "parameters": [
            {
                "id": "key_type",
                "label": "Key Assignment",
                "type": "select",
                "options": [
                    "Unique ID (Database)",
                    "Array Index (Warning)"
                ],
                "default": "Unique ID (Database)"
            }
        ],
        "cli": [
            "[React Reconciler] Reconciliation warning: lists without keys trigger full resets."
        ],
        "config": "function CarList() {\n  const cars = [\n    {id: 1, brand: 'Ford'},\n    {id: 2, brand: 'BMW'}\n  ];\n  return (\n    <ul>\n      {cars.map((car) => <li key={car.id}>{car.brand}</li>)}\n    </ul>\n  );\n}"
    },
    {
        "id": "react-useState",
        "title": "React useState Hook",
        "description": "The useState hook allows state variables to be managed inside functional components, returning the state value and updater function.",
        "parameters": [
            {
                "id": "state_type",
                "label": "State type",
                "type": "select",
                "options": [
                    "String",
                    "Numeric Counter"
                ],
                "default": "Numeric Counter"
            }
        ],
        "cli": [
            "[useState] Initialized state hook index 0 with value 0.",
            "[useState] Trigger update: setVal(1)"
        ],
        "config": "import React, { useState } from \"react\";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n}"
    },
    {
        "id": "react-useEffect",
        "title": "React useEffect Hook",
        "description": "The useEffect hook registers side-effects (like data fetching or interval timers) triggered on component mount, unmount, or updates.",
        "parameters": [
            {
                "id": "effect_deps",
                "label": "Dependency array",
                "type": "select",
                "options": [
                    "Empty array [] (Mount only)",
                    "State updates dependency [val]"
                ],
                "default": "Empty array [] (Mount only)"
            }
        ],
        "cli": [
            "[useEffect] Scheduling side-effect task after repaint.",
            "[useEffect] Cleaning up old effect events."
        ],
        "config": "import { useEffect, useState } from \"react\";\n\nfunction Timer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    setTimeout(() => {\n      setCount((count) => count + 1);\n    }, 1000);\n  }, []); // Run on mount only\n}"
    },
    {
        "id": "react-useContext",
        "title": "React useContext Hook",
        "description": "React Context is a state management system allowing props to be distributed globally, bypassing prop-drilling down levels.",
        "parameters": [
            {
                "id": "context_scope",
                "label": "Provider context",
                "type": "select",
                "options": [
                    "User context",
                    "Global CSS Theme"
                ],
                "default": "User context"
            }
        ],
        "cli": [
            "[Context Engine] Distributing state update. Re-rendering context subscribers..."
        ],
        "config": "import { createContext, useContext } from 'react';\n\nconst UserContext = createContext();\n\nfunction Component5() {\n  const user = useContext(UserContext);\n  return <h1>Hello {user} again!</h1>;\n}"
    },
    {
        "id": "react-useRef",
        "title": "React useRef Hook",
        "description": "The useRef hook persists mutable state parameters between re-renders without scheduling updates, and handles direct DOM nodes references.",
        "parameters": [
            {
                "id": "use_ref_target",
                "label": "Reference target",
                "type": "select",
                "options": [
                    "Focus Input element",
                    "Render Count persist"
                ],
                "default": "Focus Input element"
            }
        ],
        "cli": [
            "[useRef] Bound element reference tracker to DOM element input#my-input."
        ],
        "config": "import { useRef } from 'react';\n\nfunction FocusInput() {\n  const inputEl = useRef(null);\n  const focusInput = () => {\n    inputEl.current.focus();\n  };\n  return (\n    <>\n      <input ref={inputEl} type=\"text\" />\n      <button onClick={focusInput}>Focus Input</button>\n    </>\n  );\n}"
    },
    {
        "id": "react-custom-hooks",
        "title": "React Custom Hooks",
        "description": "Custom Hooks are reusable functional blocks aggregating multiple built-in hooks (like combining useState + useEffect) to share component logic.",
        "parameters": [
            {
                "id": "hook_name",
                "label": "Hook name prefix",
                "type": "select",
                "options": [
                    "useFetch (API Loader)",
                    "useWindowSize"
                ],
                "default": "useFetch (API Loader)"
            }
        ],
        "cli": [
            "[Custom Hook] Executing shareable logic hook: useFetch(url)..."
        ],
        "config": "// Custom useFetch hook definition\nimport { useState, useEffect } from \"react\";\n\nexport function useFetch(url) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch(url)\n      .then((res) => res.json())\n      .then((data) => setData(data));\n  }, [url]);\n  return [data];\n}"
    }
]
};

