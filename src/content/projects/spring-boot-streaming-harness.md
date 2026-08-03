---
title: Spring Boot streaming harness
summary: End-to-end test coverage for streaming services at 500,000 messages per second.
stack:
  - Java
  - Spring Boot
  - Apache Pulsar
  - Kubernetes
  - Azure DevOps
date: '2023-06'
featured: true
---

Streaming services are hard to test honestly. Unit tests pass on systems that
fall over in production, because the thing that breaks is rarely the logic — it
is the behaviour under sustained load, with real message shapes, across service
boundaries.

Cross-functional teams needed to test their services end to end and had no
realistic way to drive traffic at them.

## What it does

A Spring Boot application that produces traffic the way production does:

- **UDP streaming**, so services could be exercised over the transport they
  actually receive on.
- **Avro over Pulsar**, so messages carried real schemas rather than
  test-shaped approximations. Schema mismatches are among the most common
  production failures in streaming systems and the easiest to miss in tests.
- **Configurable throughput**, up to 500,000 messages per second, so teams could
  find where their service degrades rather than guessing.

## Getting it in front of people

A test harness nobody can run is not a test harness. I built an Azure CI/CD
pipeline with Docker to deploy it into Kubernetes, so teams could point it at
non-production servers without local setup. Refactoring for stable
high-throughput connections against those servers took more work than the
streaming features themselves.

## Outcome

Time to meet production readiness dropped by 25% across the teams using it. The
gain was not that testing got faster — it was that a class of problem which used
to surface late started surfacing early, when it was still cheap.
