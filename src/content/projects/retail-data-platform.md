---
title: Retail data platform
summary: Oracle to BigQuery with no streaming path in place, then service reads from minutes to 20–50ms.
stack:
  - Java
  - Pub/Sub
  - BigQuery
  - Oracle
  - SQL
  - Kubernetes
date: '2026-01'
featured: true
---

Products, pricing, promotions, and demand forecasting for every H-E-B store in
Texas all read from the same place. Getting data there, and getting it back out
fast, are two different problems. This is both.

## Getting the data across

There was no streaming path from Oracle into BigQuery. Data moved in batch jobs
that took over an hour, and often did not finish at all. When they did finish,
records arrived duplicated, because a failed run had no way to resume — it
started over and re-sent everything it had already sent.

Two changes fixed the bulk of it:

**Partitioning the source extraction.** Pulling a hundred-million-row table as
one unit puts the whole job at the mercy of its worst moment. Partitioned reads
gave the source database smaller units of work and gave the pipeline somewhere
to restart from.

**Incremental loads.** Rather than reading everything and reconciling later, the
pipeline tracks what it has already seen and pulls only new or updated rows.
Duplicates stopped being something to clean up afterwards, because they stopped
being produced.

Runtime went from over an hour, unreliably, to roughly 20 minutes.

## Getting the data back out

The services on top — products, pricing, promotions, forecasting — were querying
BigQuery on demand. That is fine for analysis and wrong for an API. A manager
opening a screen was waiting on a warehouse query, which meant waiting minutes.

The fix was to stop asking the question at request time. The shapes those
services need are known in advance, so they are computed ahead of time into
views and tables built for reading rather than for analysis.

Response times went from minutes to 20–50ms depending on the service. Same data,
same warehouse — the work simply happens before the request arrives instead of
during it.

## What I would do differently

The incremental logic and the partitioning were built in response to failures,
in that order. Designing for resumability from the start would have made the
duplicate problem never exist, rather than something to solve. Pipelines that
cannot resume do not fail gracefully; they fail expensively.
