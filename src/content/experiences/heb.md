---
company: H-E-B
role: Software Engineer
start: '2024-05'
end: present
summary: 'Streaming Oracle into BigQuery, and the services reading from it — pricing, promotions, forecasting.'
highlights:
  - Built the Oracle-to-BigQuery streaming pipeline where none existed, replacing batch extraction that ran over an hour or failed outright. Source-side partitioning and incremental loads brought it to roughly 20 minutes with duplicate records eliminated.
  - Keep tables ranging from millions to hundreds of millions of rows in sync between operational and analytical systems.
  - Own backend services for products, pricing, promotions, and demand forecasting, used by store and product managers across every H-E-B store in Texas.
  - Cut service response times from minutes to 20–50ms by designing precomputed BigQuery views and tables in place of on-demand queries.
stack:
  - Java
  - Pub/Sub
  - BigQuery
  - Oracle
  - SQL
---
