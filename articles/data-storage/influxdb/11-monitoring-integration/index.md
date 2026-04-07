---
title: "InfluxDB 监控集成实战"
description: "完整监控方案：系统指标采集、应用性能监控、告警配置、APM 集成和可观测性平台搭建"
date: "2025-01-25"
tags: ["influxdb", "监控", "APM", "告警", "可观测性", "tutorial"]
category: "data-storage"
---

# InfluxDB 监控集成实战

## 监控体系架构

```mermaid
flowchart TB
    subgraph DataCollection["数据采集层"]
        Sys["系统指标\nCPU/内存/磁盘"]
        App["应用指标\n响应时间/错误率"]
        Biz["业务指标\n订单/用户/交易"]
        Log["日志数据\nELK/Loki"]
    end
    
    subgraph InfluxDB["InfluxDB 存储层"]
        Raw[("原始数据\n热存储")]
        Agg[("聚合数据\n温存储")]
        Archive[("归档数据\n冷存储")]
    end
    
    subgraph Visualization["可视化层"]
        Dash["Grafana\n仪表板"]
        Alert["告警系统\nAlertmanager"]
        Report["报表系统"]
    end
    
    Sys -->|Telegraf| Raw
    App -->|SDK/API| Raw
    Biz -->|ETL| Raw
    Log -->|Pipeline| Raw
    Raw -->|CQ/Task| Agg
    Agg -->|降采样| Archive
    InfluxDB --> Dash
    InfluxDB --> Alert
    InfluxDB --> Report
```

## 系统监控

### Linux 系统监控

```mermaid
flowchart LR
    subgraph Metrics["系统指标类型"]
        CPU["CPU\n使用率/负载"]
        MEM["内存\n使用/交换"]
        DISK["磁盘\nIO/空间"]
        NET["网络\n流量/连接"]
        PROC["进程\n数量/状态"]
    end
    
    style Metrics fill:#e3f2fd
```

**Telegraf 系统监控配置：**

```toml
# /etc/telegraf/telegraf.d/system.conf

# CPU 监控
[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false
  report_active = true
  fielddrop = ["time_*"]

# 内存监控
[[inputs.mem]]

# 磁盘监控
[[inputs.disk]]
  ignore_fs = ["tmpfs", "devtmpfs", "devfs", "iso9660", "overlay", "aufs", "squashfs"]

# 磁盘 IO
[[inputs.diskio]]
  devices = ["sda", "sdb", "nvme0n1"]

# 网络监控
[[inputs.net]]
  interfaces = ["eth0", "ens160", "enp0s3"]

# 系统负载
[[inputs.system]]

# 进程监控
[[inputs.processes]]

# 内核统计
[[inputs.kernel]]
```

### Docker 容器监控

```toml
# docker.conf
[[inputs.docker]]
  endpoint = "unix:///var/run/docker.sock"
  gather_services = false
  container_names = []
  container_name_include = []
  container_name_exclude = []
  timeout = "5s"
  perdevice = true
  total = true
  
  # 存储到 InfluxDB
  [inputs.docker.tags]
    source = "docker-daemon"
```

```mermaid
flowchart TB
    subgraph ContainerMetrics["容器指标"]
        C1["容器 CPU\ncontainer_cpu_usage"]
        C2["容器内存\ncontainer_memory"]
        C3["容器网络\ncontainer_network"]
        C4["容器块 IO\ncontainer_blkio"]
    end
    
    subgraph HostMetrics["宿主机指标"]
        H1["系统 CPU"]
        H2["系统内存"]
    end
    
    C1 -->|归一化| H1
    C2 -->|限制对比| H2
```

### Kubernetes 监控

```yaml
# telegraf-daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: telegraf
  namespace: monitoring
spec:
  selector:
    matchLabels:
      name: telegraf
  template:
    metadata:
      labels:
        name: telegraf
    spec:
      containers:
      - name: telegraf
        image: telegraf:1.28
        env:
        - name: INFLUX_TOKEN
          valueFrom:
            secretKeyRef:
              name: influxdb-token
              key: token
        - name: INFLUX_ORG
          value: "my-org"
        - name: INFLUX_BUCKET
          value: "k8s-metrics"
        volumeMounts:
        - name: config
          mountPath: /etc/telegraf
        - name: docker-sock
          mountPath: /var/run/docker.sock
        - name: sys
          mountPath: /host/sys
          readOnly: true
        - name: proc
          mountPath: /host/proc
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: telegraf-config
      - name: docker-sock
        hostPath:
          path: /var/run/docker.sock
      - name: sys
        hostPath:
          path: /sys
      - name: proc
        hostPath:
          path: /proc
```

```toml
# k8s-telegraf.conf
[[inputs.kubernetes]]
  url = "https://$HOSTIP:10250"
  bearer_token = "/var/run/secrets/kubernetes.io/serviceaccount/token"
  insecure_skip_verify = true
  
[[inputs.prometheus]]
  urls = ["http://kube-state-metrics.monitoring.svc:8080/metrics"]
  metric_version = 2
```

## 应用性能监控 (APM)

### HTTP 服务监控

```python
# Flask 应用埋点示例
from flask import Flask, request
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import time

app = Flask(__name__)

# InfluxDB 客户端
client = InfluxDBClient(
    url="http://localhost:8086",
    token="your-token",
    org="my-org"
)
write_api = client.write_api(write_options=SYNCHRONOUS)

@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    # 计算响应时间
    latency = time.time() - request.start_time
    
    # 构建数据点
    point = Point("http_request") \
        .tag("method", request.method) \
        .tag("endpoint", request.endpoint) \
        .tag("status_code", str(response.status_code)) \
        .tag("service", "user-api") \
        .field("latency_ms", latency * 1000) \
        .field("request_size", request.content_length or 0) \
        .field("response_size", response.content_length or 0) \
        .field("error", 1 if response.status_code >= 500 else 0)
    
    # 写入 InfluxDB
    write_api.write(bucket="apm-metrics", record=point)
    
    return response

@app.errorhandler(Exception)
def handle_error(error):
    # 记录异常
    point = Point("http_error") \
        .tag("service", "user-api") \
        .tag("error_type", type(error).__name__) \
        .field("count", 1) \
        .field("message", str(error)[:255])
    
    write_api.write(bucket="apm-metrics", record=point)
    raise error

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 数据库查询监控

```python
# SQLAlchemy 查询监控
from sqlalchemy import event
from sqlalchemy.engine import Engine
import time

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total_time = time.time() - context._query_start_time
    
    # 解析 SQL 类型
    sql_type = statement.split()[0].upper() if statement else "UNKNOWN"
    
    point = Point("db_query") \
        .tag("database", conn.engine.url.database) \
        .tag("sql_type", sql_type) \
        .tag("table", extract_table_name(statement)) \
        .field("duration_ms", total_time * 1000) \
        .field("rows_affected", cursor.rowcount)
    
    write_api.write(bucket="apm-metrics", record=point)
```

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant App as 应用服务
    participant DB as 数据库
    participant Influx as InfluxDB
    
    Client->>App: HTTP Request
    App->>Influx: 记录请求开始
    
    App->>DB: SQL Query
    DB-->>App: Query Result
    App->>Influx: 记录查询耗时
    
    App-->>Client: HTTP Response
    App->>Influx: 记录总耗时
```

## 业务指标监控

### 电商业务指标

```python
# 订单指标采集
class OrderMetrics:
    def __init__(self, influx_client):
        self.write_api = influx_client.write_api()
        self.bucket = "business-metrics"
    
    def record_order_created(self, order):
        """订单创建"""
        point = Point("order_events") \
            .tag("event_type", "created") \
            .tag("platform", order.platform) \
            .tag("region", order.region) \
            .tag("payment_method", order.payment_method) \
            .field("order_amount", float(order.amount)) \
            .field("item_count", len(order.items)) \
            .field("user_id_hash", hash(order.user_id) % 1000)  # 降基数
        
        self.write_api.write(bucket=self.bucket, record=point)
    
    def record_order_completed(self, order):
        """订单完成"""
        processing_time = (order.completed_at - order.created_at).total_seconds()
        
        point = Point("order_events") \
            .tag("event_type", "completed") \
            .tag("platform", order.platform) \
            .field("processing_time_sec", processing_time) \
            .field("order_amount", float(order.amount))
        
        self.write_api.write(bucket=self.bucket, record=point)
    
    def record_inventory_change(self, product_id, quantity, operation):
        """库存变更"""
        point = Point("inventory") \
            .tag("product_category", get_category(product_id)) \
            .tag("warehouse", get_warehouse(product_id)) \
            .tag("operation", operation) \
            .field("quantity_change", quantity) \
            .field("product_id_bucket", hash(product_id) % 100)
        
        self.write_api.write(bucket=self.bucket, record=point)

# 实时销售看板数据
def generate_sales_dashboard_data():
    """生成销售实时指标"""
    query = '''
    // 今日销售额
    today_sales = from(bucket: "business-metrics")
        |> range(start: today())
        |> filter(fn: (r) => r._measurement == "order_events")
        |> filter(fn: (r) => r.event_type == "completed")
        |> filter(fn: (r) => r._field == "order_amount")
        |> sum()
    
    // 今日订单数
    today_orders = from(bucket: "business-metrics")
        |> range(start: today())
        |> filter(fn: (r) => r._measurement == "order_events")
        |> filter(fn: (r) => r._field == "order_amount")
        |> count()
    
    // 每小时销售趋势
    hourly_sales = from(bucket: "business-metrics")
        |> range(start: today())
        |> filter(fn: (r) => r._measurement == "order_events")
        |> aggregateWindow(every: 1h, fn: sum)
    
    return {
        "total_sales": today_sales,
        "total_orders": today_orders,
        "hourly_trend": hourly_sales
    }
```

```mermaid
xychart-beta
    title "电商销售趋势（小时级）"
    x-axis ["00", "04", "08", "12", "16", "20", "24"]
    y-axis "销售额（万元）"
    bar [5, 2, 15, 45, 38, 62, 30]
    line [5, 2, 15, 45, 38, 62, 30]
```

## 告警配置

### Flux 告警规则

```flux
// cpu-alert.flux - CPU 使用率告警
import "influxdata/influxdb/monitor"
import "influxdata/influxdb/secrets"

// 检查 CPU 使用率
from(bucket: "system-metrics")
    |> range(start: -5m)
    |> filter(fn: (r) => r._measurement == "cpu")
    |> filter(fn: (r) => r._field == "usage_idle")
    |> aggregateWindow(every: 1m, fn: mean)
    |> map(fn: (r) => ({r with _value: 100.0 - r._value}))  // 转换为使用率
    |> monitor.check(
        crit: (r) => r._value > 90.0,
        warn: (r) => r._value > 80.0,
        info: (r) => r._value > 70.0,
        messageFn: (r) => "CPU usage on ${r.host} is ${r._value}%",
        data: {
            _check_name: "cpu-usage-check",
            _check_id: "cpu-check-001",
            _notification_endpoint: "slack-endpoint"
        }
    )
```

```flux
// memory-alert.flux - 内存告警
from(bucket: "system-metrics")
    |> range(start: -5m)
    |> filter(fn: (r) => r._measurement == "mem")
    |> filter(fn: (r) => r._field == "used_percent")
    |> aggregateWindow(every: 1m, fn: mean)
    |> monitor.check(
        crit: (r) => r._value > 95.0,
        warn: (r) => r._value > 85.0,
        messageFn: (r) => "Memory usage on ${r.host}: ${r._value}%"
    )
```

### 告警通知配置

```yaml
# alert-notification.yml
apiVersion: influxdata.com/v2
kind: NotificationEndpoint
metadata:
  name: slack-endpoint
spec:
  type: slack
  url: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
  token: ""
---
apiVersion: influxdata.com/v2
kind: NotificationRule
metadata:
  name: critical-alerts
spec:
  endpoint: slack-endpoint
  every: 1m
  offset: 0s
  statusRules:
    - currentLevel: CRIT
      previousLevel: OK
  tagRules: []
```

```python
# 自定义告警处理器
import requests
import json
from datetime import datetime

class AlertManager:
    def __init__(self, influx_client):
        self.client = influx_client
        self.alert_bucket = "alerts"
    
    def send_slack_alert(self, message, severity="warning"):
        """发送 Slack 告警"""
        color = {"info": "#36a64f", "warning": "#ff9900", "critical": "#ff0000"}
        
        payload = {
            "attachments": [{
                "color": color.get(severity, "#36a64f"),
                "title": f"InfluxDB Alert - {severity.upper()}",
                "text": message,
                "ts": int(datetime.now().timestamp())
            }]
        }
        
        webhook_url = "https://hooks.slack.com/services/YOUR/WEBHOOK"
        requests.post(webhook_url, json=payload)
    
    def send_pagerduty_alert(self, message, severity="warning"):
        """发送 PagerDuty 告警"""
        headers = {
            "Authorization": "Token token=YOUR_PAGERDUTY_TOKEN",
            "Content-Type": "application/json"
        }
        
        payload = {
            "incident": {
                "type": "incident",
                "title": message,
                "service": {"id": "YOUR_SERVICE_ID", "type": "service_reference"},
                "urgency": "high" if severity == "critical" else "low"
            }
        }
        
        requests.post(
            "https://api.pagerduty.com/incidents",
            headers=headers,
            json=payload
        )
```

## 可观测性仪表板

### Grafana 仪表板配置

```json
{
  "dashboard": {
    "title": "System Monitoring",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "timeseries",
        "targets": [
          {
            "query": "from(bucket: \"system-metrics\")\n  |\u003e range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |\u003e filter(fn: (r) =\u003e r._measurement == \"cpu\")\n  |\u003e filter(fn: (r) =\u003e r._field == \"usage_user\")\n  |\u003e aggregateWindow(every: v.windowPeriod, fn: mean)\n  |\u003e group(columns: [\"host\"])"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "gauge",
        "targets": [
          {
            "query": "from(bucket: \"system-metrics\")\n  |\u003e range(start: -1m)\n  |\u003e filter(fn: (r) =\u003e r._measurement == \"mem\")\n  |\u003e filter(fn: (r) =\u003e r._field == \"used_percent\")\n  |\u003e last()"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                {"color": "green", "value": 0},
                {"color": "yellow", "value": 70},
                {"color": "red", "value": 85}
              ]
            }
          }
        }
      }
    ]
  }
}
```

```mermaid
flowchart TB
    subgraph Dashboard["Grafana 仪表板布局"]
        Row1["行1: 系统概览"]
        Row2["行2: 资源详情"]
        Row3["行3: 应用指标"]
        Row4["行4: 业务指标"]
    end
    
    subgraph Panels["面板类型"]
        P1["时间序列\nCPU/内存趋势"]
        P2["仪表盘\n当前使用率"]
        P3["热力图\n延迟分布"]
        P4["表格\nTop N 列表"]
        P5["统计\n汇总数据"]
        P6["告警\n异常标记"]
    end
    
    Row1 --> P1
    Row1 --> P2
    Row2 --> P3
    Row2 --> P4
    Row3 --> P5
    Row4 --> P6
```

## 实战案例：完整监控方案

### 微服务监控架构

```mermaid
flowchart TB
    subgraph Services["微服务集群"]
        S1["API Gateway"]
        S2["User Service"]
        S3["Order Service"]
        S4["Payment Service"]
    end
    
    subgraph Collection["数据采集"]
        Sidecar["Telegraf Sidecar"]
        SDK["应用 SDK"]
        Envoy["Envoy Proxy"]
    end
    
    subgraph Storage["InfluxDB"]
        Metrics[("指标数据")]
        Traces[("链路数据")]
        Logs[("日志索引")]
    end
    
    subgraph Analysis["分析告警"]
        Alert["告警规则"]
        SLO["SLO 监控"]
        RCA["根因分析"]
    end
    
    S1 --> Sidecar
    S2 --> SDK
    S3 --> SDK
    S4 --> Envoy
    Sidecar --> Metrics
    SDK --> Metrics
    Envoy --> Metrics
    Metrics --> Alert
    Metrics --> SLO
    Metrics --> RCA
```

### 统一监控脚本

```python
#!/usr/bin/env python3
"""
统一监控配置部署工具
"""
import yaml
from influxdb_client import InfluxDBClient
from influxdb_client.domain.bucket import BucketRetentionRules

class MonitoringSetup:
    def __init__(self, url, token, org):
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.org = org
    
    def create_monitoring_buckets(self):
        """创建监控用 Buckets"""
        buckets_api = self.client.buckets_api()
        
        buckets_config = [
            {
                "name": "system-metrics",
                "retention_days": 7,
                "description": "系统级监控指标"
            },
            {
                "name": "apm-metrics",
                "retention_days": 30,
                "description": "应用性能监控"
            },
            {
                "name": "business-metrics",
                "retention_days": 90,
                "description": "业务指标"
            },
            {
                "name": "alerts",
                "retention_days": 365,
                "description": "告警历史"
            }
        ]
        
        for config in buckets_config:
            try:
                buckets_api.create_bucket(
                    bucket_name=config["name"],
                    retention_rules=BucketRetentionRules(
                        every_seconds=config["retention_days"] * 24 * 60 * 60
                    ),
                    org=self.org
                )
                print(f"✅ Created bucket: {config['name']}")
            except Exception as e:
                print(f"⚠️ Bucket {config['name']}: {e}")
    
    def create_alert_tasks(self):
        """创建告警任务"""
        tasks_api = self.client.tasks_api()
        
        alerts = [
            {
                "name": "cpu-high-alert",
                "flux": '''
option task = {name: "cpu-high-alert", every: 1m}
import "influxdata/influxdb/monitor"
from(bucket: "system-metrics")
    |\u003e range(start: -2m)
    |\u003e filter(fn: (r) =\u003e r._measurement == "cpu")
    |\u003e filter(fn: (r) =\u003e r._field == "usage_user")
    |\u003e monitor.check(
        crit: (r) =\u003e r._value \u003e 90.0,
        warn: (r) =\u003e r._value \u003e 80.0,
        messageFn: (r) =\u003e "High CPU on ${r.host}: ${r._value}%"
    )
'''
            },
            {
                "name": "memory-high-alert",
                "flux": '''
option task = {name: "memory-high-alert", every: 1m}
import "influxdata/influxdb/monitor"
from(bucket: "system-metrics")
    |\u003e range(start: -2m)
    |\u003e filter(fn: (r) =\u003e r._measurement == "mem")
    |\u003e filter(fn: (r) =\u003e r._field == "used_percent")
    |\u003e monitor.check(
        crit: (r) =\u003e r._value \u003e 95.0,
        warn: (r) =\u003e r._value \u003e 85.0,
        messageFn: (r) =\u003e "High memory on ${r.host}: ${r._value}%"
    )
'''
            }
        ]
        
        for alert in alerts:
            task = Task(
                org_id=self.get_org_id(),
                name=alert["name"],
                flux=alert["flux"],
                every="1m"
            )
            tasks_api.create_task(task)
            print(f"✅ Created alert task: {alert['name']}")

# 部署监控栈
def deploy_monitoring_stack():
    setup = MonitoringSetup(
        url="http://localhost:8086",
        token="your-token",
        org="my-org"
    )
    
    setup.create_monitoring_buckets()
    setup.create_alert_tasks()
    print("\n🎉 Monitoring stack deployed!")

if __name__ == '__main__':
    deploy_monitoring_stack()
```

---

掌握监控集成后，下一篇将介绍性能调优。
