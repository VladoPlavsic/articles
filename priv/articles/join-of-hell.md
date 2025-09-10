**Abstract:**

In this article, I will tell you a real life story and a bit of how PostgreSQL handles JOINs and some of the performance pitfalls you might encounter when writing unoptimized queries.

To illustrate this, I’ll describe a real-world scenario where a minor SQL tweak drastically improved performance in an ETL pipeline — something my entire team had accepted as “just slow.”

 --- 


**The Challenge:**

A Massive Dataset
Imagine a system managing tens of thousands of objects, each with millions of time-series records tracking various statuses over time. Our goal was to aggregate these records by different parameters — per object, per time period, etc.

While PostgreSQL handled the workload decently, things got complicated as our dataset approached 100 million records. To tackle this, we decided to offload data to Amazon Redshift, an analytics database, using an ETL pipeline:

 1.Extract data from PostgreSQL.

 2.Transform it into a denormalized format.

 3.Load it into Redshift.

This pipeline involved processing vast amounts of data, converting time-series statuses into consecutive `start_ts` and `end_ts` timestamps from multiple tables.

**The Initial ETL Implementation:**

The ETL process followed these steps:

 1.Select all objects for which data should be loaded.

 2.Process each object separately (to reduce the strain on Postgres).

 3.Build transformation queries.

 4.Stream query results into a CSV file and upload them to S3.

 5.Load the data into Redshift.

 Everything worked fine — until our latest production release.

 --- 

**The Problem: A Performance Nightmare**

Following the release, two major issues surfaced:

 **1.Full Data Resync** — We needed to run full resync for 3 years worth of data due to an old bug. With thousands of objects, each taking 7–10 minutes (sometimes 20+ minutes), this was a painfully slow process.

 **2.Data Explosion** — A new bug caused certain objects to generate 500,000+ status updates per day, further slowing things down.

I was responsible for handling this re-sync. After a week of manually running scripts and tweaking parameters, I started questioning my life choices. Maybe I should open a beach bar and mix cocktails instead?

The team had already optimized the transformation process as much as possible — or so we thought. Everyone accepted that “this is just slow, and there’s nothing we can do right now.”

Still, I decided to take one last look.

 --- 

**The Investigation: Finding the Bottleneck**

One particular object was failing even when processed for a single day’s worth of data. I could have chunked it into smaller periods and moved on, but I was too bored with the repetitive work. So, I added logging to pinpoint the slowest part of the pipeline.

Surprisingly, the timeout was happening right at the start — on the very first attempt to load a single record from the transformed query. That didn’t make sense. Running the query manually returned results within minutes, yet in the pipeline, it timed out after 20+ minutes.

Something was wrong.

I dove into the transformation query module and found this:

 ```sql
 SELECT q.*, o.name
 FROM query_built_for_single_object AS q
 INNER JOIN object AS o ON q.object_id = o.id
 LEFT JOIN (
     SELECT object_id, array_agg(tag) FROM tags GROUP BY object_id
 ) AS t ON q.object_id = t.object_id;
 ``` 

 At first glance, this looked fine. But then it hit me.

 --- 

**The Root Cause: A Costly JOIN**

PostgreSQL is usually great at optimizing queries, especially when using indexed joins. However, when a join is performed on a column without an index, things go south quickly.

Let’s break it down:

 **+Indexed JOINs**: PostgreSQL scans the outer table and looks up matching rows in the indexed column of the inner table.

 **+Non-Indexed JOINs**: It performs a nested loop join, checking every row from the outer table against every row in the inner table.

In our case:

 +The outer query (`q`) contained 1.5 million rows.

 +The inner subquery (`tags`) contained only 200 rows.

 +Because the join condition didn’t filter tags properly, PostgreSQL compared every row in `q` to every row in `tags`, leading to 300 million operations.

No wonder the pipeline was crawling!

 --- 

**The Fix: One Simple WHERE Clause**

The solution was almost laughably simple:

```sql
LEFT JOIN (
    SELECT object_id, array_agg(tag)
    FROM tags
    WHERE object_id = ?  -- Filter before aggregating!
    GROUP BY object_id
) AS t ON q.object_id = t.object_id;
```

Since our pipeline processes one object at a time, there was no need to aggregate tags for all objects in the database. This tiny `WHERE` clause reduced the number of comparisons from 300 million to just 1.5 million.

And just like that, the problem disappeared.

 --- 

 **The Lesson: Always Question Assumptions**

This experience taught me a valuable lesson: even when everyone is convinced that a process cannot be optimized further, it’s worth double-checking.

Worst case? You confirm there’s nothing left to improve. Best case? You save countless hours of computation with a single line of code.

Next time someone tells you, “That’s just the way it is,” have a closer look. You might just find your own one-line miracle.