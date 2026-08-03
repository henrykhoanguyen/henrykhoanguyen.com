---
title: Vehicle data streaming
summary: Java, Akka, and Apache Pulsar carrying telemetry for over 13 million vehicles.
stack:
  - Java
  - Akka
  - Apache Pulsar
  - Cassandra
  - Redis
date: '2024-05'
featured: true
---

Every connected vehicle in the North American fleet reports back. At over 13
million vehicles, the interesting constraint is not any single message — it is
that messages never stop arriving, and the system has no quiet period in which
to catch up.

## The shape of the problem

High throughput and low latency pull in different directions. Batching helps
throughput and hurts latency. Small units help latency and waste capacity. Akka's
actor model was a good fit here: work is distributed across many small
independent units, and backpressure is something the system expresses rather
than something that happens to it. Apache Pulsar handled the transport.

## Where the latency actually was

Persistence, not transport. Reads against Cassandra sat in the path of
operations that needed to be fast, and Cassandra is built for write throughput
rather than for low-latency point reads of recently-touched data.

Adding Redis in front cut that, but a cache in front of a system under constant
write load is a correctness problem before it is a performance one. Stale reads
are worse than slow ones. The work that mattered was invalidation — making sure
that when data changed underneath, the cache knew, rather than serving something
plausible and wrong.

## Keeping it up

I set up metrics, alerting, and Grafana dashboards, and trained the team on
handling incidents on Linux production servers. That work contributed to four
nines of availability.

That training mattered more than it sounds. A system observed by one person who
understands it is fragile in a way that has nothing to do with its architecture.
Spreading that understanding was the higher-leverage work.
