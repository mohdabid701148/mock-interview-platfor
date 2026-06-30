# System Design: Collaborative Interview Platform at Scale

## Why this topic exists in MockMate
MockMate operates as a peer-to-peer real-time collaborative workspace with built-in code compilation. Designing such a system at enterprise scale (e.g. 100,000+ concurrent interview sessions, millions of daily active users) is a classic system design challenge. It combines real-time bidirectional synchronization, state consistency, CPU-intensive sandboxed code executions, high availability database configurations, and strict latency bounds (<100ms).

---

## 🏗️ System Architecture (Scale: 10M DAU)

Below is the distributed system design for an enterprise-grade MockMate deployment:

```
                               ┌───────────────────┐
                               │  DNS / CDN (CF)   │
                               └─────────┬─────────┘
                                         │
                               ┌─────────▼─────────┐
                               │   Load Balancer   │ (HTTPS / Sticky Sessions)
                               └────┬──────────┬───┘
                                    │          │
         ┌──────────────────────────┘          └──────────────────────────┐
         ▼ (Stateless REST API)                                           ▼ (Real-Time WebSockets)
┌─────────────────┐                                            ┌─────────────────┐
│ API App Nodes   │◄───────────┐ (Redis Session Lock)          │  Socket.IO Node │
│ (Express/Node)  │            │                               │  Cluster Nodes  │
└────────┬────────┘            │                               └────────┬────────┘
         │                     ▼                                        │ (Redis Adapter Pub/Sub)
         │              ┌─────────────┐                                 │
         ├─────────────►│ Redis Cache │◄────────────────────────────────┤
         │              └─────────────┘                                 │
         ▼                                                              ▼
┌─────────────────┐                                            ┌─────────────────┐
│ MongoDB Replica │                                            │   Message Bus   │ (Kafka/RabbitMQ)
│  Set (Sharded)  │                                            └────────┬────────┘
└─────────────────┘                                                     │
                                                                        ├────────────────────────┐
                                                                        ▼                        ▼
                                                               ┌─────────────────┐      ┌─────────────────┐
                                                               │  Code Execution │      │  Notification   │
                                                               │ Worker Cluster  │      │  Email Workers  │
                                                               └────────┬────────┘      └─────────────────┘
                                                                        │
                                                               ┌────────▼────────┐
                                                               │  gVisor/Docker  │ (Sandboxed VMs)
                                                               └─────────────────┘
```

---

## Key System Design Components

### 1. Collaborative Editing Engine (OT vs. CRDT)
To synchronize Monaco Editor instances, a simple state overwrite fails under concurrent inputs. Scalable architectures utilize one of two synchronization algorithms:

#### A. Operational Transformation (OT)
- **Concept**: A centralized server acts as the single source of truth. Every editing change is serialized as an "operation" (e.g., `Insert(index, char)`, `Delete(index, length)`). The server transforms incoming operations against concurrent operations already applied to the server document and broadcasts the transformed operation.
- **Used by**: Google Docs, ShareDB.
- **Trade-off**: Requires a stateful server to coordinate operations sequentially. Very complex to implement but highly efficient in document history size.

#### B. Conflict-Free Replicated Data Types (CRDT)
- **Concept**: Decentralized merge algorithm. Characters are assigned unique identifiers (e.g., fractional indexes). Edits are commutative and associative; they can be applied in any order across nodes, and the final state converges to the exact same result without server arbitration.
- **Used by**: Figma, Yjs, Automerge.
- **Trade-off**: Stateless servers (simply pass messages). However, the metadata overhead grows over time (tombstone markers for deleted text).

---

### 2. Isolated Code Execution (Sandboxing)
Running arbitrary user-submitted code (JavaScript, Python, C++, Java) introduces critical security vectors (RCE, network denial attacks, disk manipulation, host hijacking).

#### Secure Isolation Layer
- **Containerization vs. MicroVMs**: Standard Docker containers share the host kernel and are vulnerable to container-escape exploits. Scalable solutions run code in microVMs (**AWS Firecracker**, **Google gVisor**, or **Kata Containers**) that virtualize or intercept system calls (`syscalls`).
- **Resource Constraints**: Each container/VM must be strictly capped:
  - **CPU**: Cap execution to 1 core, throttling processes exceeding allocations.
  - **Memory**: Cap to 256MB to prevent Out-Of-Memory (OOM) host crashes.
  - **Execution Time**: Standard timeout of 5 seconds to terminate infinite loop attacks.
  - **Disk Space**: Limit write privileges to temporary volumes (e.g. 10MB) or use read-only root filesystems.
  - **Network Egress**: Complete egress block to prevent workers from participating in DDoS botnets or sending outbound spam.

---

### 3. Real-Time Clustering and Sticky Sessions
Scaling WebSockets (Socket.IO) to support 500,000 concurrent sockets requires distributing load across many nodes.

- **Sticky Sessions**: WebSockets upgrades begin as HTTP requests. If subsequent handshake packets land on different nodes, connection upgrades fail. Load balancers must apply **cookie-based sticky sessions** or **IP-affinity hashes**.
- **Redis Adapter**: Connects Socket.IO server instances. When a socket on Node A emits a change to Room 101, the event is published to Redis Pub/Sub, notifying Node B to emit the update to its locally connected room participants.

---

### 4. Database Sharding and High Availability
For Mongoose/MongoDB, storing active room states and historic records requires robust data layouts:

- **Partitioning / Sharding Key**: Shard database collections by `roomId` or `userId`. Since room operations are transactionally isolated, partitioning by `roomId` ensures operations are routed to specific replica shards.
- **Replica Sets**: Deploy collections across multi-region replica sets (Primary/Secondary nodes) to enable automatic failovers under network drops.
- **Hot/Cold Data Separation**: Active session caches reside in Redis (Fast I/O). Upon session completion, the final scorecards and code snapshots are written to MongoDB (Durability) and memory caches are freed.

---

## System Design Interview Prep

### Beginner Questions
- Explain the role of a Load Balancer in a real-time collaborative system.
- Why is it dangerous to run user-submitted code directly on the application host?
- What database indexing strategy would you use to fetch a user's interview history efficiently?

### Intermediate Questions
- Why do Socket.IO servers require sticky sessions on a load balancer?
- Compare WebSockets and HTTP Long Polling under high connection drop rates.
- How would you design a rate limiter to prevent a user from flood-spamming socket events?

### Advanced Questions
- Explain the difference between Operational Transformation (OT) and CRDTs. In what scenarios is each preferred?
- How does gVisor isolate untrusted user-submitted code compared to raw Docker namespaces?
- Design a notification dispatch service that ensures near real-time deliveries under spike conditions (e.g. 50,000 feedback completions at the exact same hour).

### Staff-Level Questions
- Design a multi-region collaborative editing system where users in London and Tokyo edit the same document concurrently. How do you resolve conflicts, guarantee ordering, and keep the UI latency sub-100ms?
- If the Redis Adapter pub/sub experiences broker failures or memory backpressures under heavy load, how do you prevent cascading node failures across the Socket.IO cluster?
- Architect an automated billing and quota tracking system for Judge0 code runs that prevents abuse while maintaining low-latency execution paths.

---

## Revision Checklist
- [ ] I can draw the block architecture of a collaborative editing platform at scale.
- [ ] I can explain the conflict resolution math of CRDTs vs OT.
- [ ] I can list the system-level limits required to secure a code execution sandbox.
- [ ] I can explain how the Redis Adapter resolves multi-node Socket communications.
- [ ] I can explain the trade-offs of MongoDB Sharding keys for relational interview models.
