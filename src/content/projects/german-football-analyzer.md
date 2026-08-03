---
title: German football data analyzer
summary: League tables and match statistics for Bundesliga 1 and 2, parsed from CSV into a REST API.
stack:
  - Node.js
  - Express
  - MongoDB
  - Angular
date: '2020-01'
featured: false
repo: https://github.com/henrykhoanguyen/german_football
---

A personal project from university, and the earliest thing here worth keeping.
It takes raw CSV match data for Bundesliga 1 and 2, parses and aggregates it into
league tables and match statistics, and serves it through a REST API to an
Angular front end.

The parts I still think about are the ones that turned out to be about data
rather than about the web: deciding what the models should be before writing the
endpoints, and working out which figures could be computed on demand versus which
needed to be derived once and stored.

It is the same question I spend my time on now, at a smaller scale and with
worse tools. The live demo is long gone — Heroku removed free dynos in late
2022 — but the code is still up.
