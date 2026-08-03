---
title: mdsvex smoke test
---

# mdsvex smoke test

This route exists only to prove that mdsvex compiles `.md` files as routes and
that Shiki highlights fenced code in the phosphor theme. It is deleted in
Phase 3, once real content routes exist.

```java
public class StreamProcessor {
    // A comment, to check the dim green stop.
    private static final int BATCH_SIZE = 500_000;

    public void process(String topic) {
        System.out.println("consuming " + topic);
    }
}
```

```sql
select store_id, count(*) as n
from promotions
where updated_at > current_timestamp - interval 1 day
group by store_id;
```
