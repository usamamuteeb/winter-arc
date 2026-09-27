export interface Concept { id: string; title: string; tag: string; plain: string; example: string; remember: string }
export interface Step { n: string; t?: string }
export interface Scenario { id: string; title: string; situation: string; flow: Step[]; tools: string; watch: string[]; say: string }
export interface Service { need: string; azure: string; aws: string; gcp: string; when: string }
export interface Snip { id: string; title: string; plain: string; code: string }

export const CONCEPTS: Concept[] = [
  { id: 'c1', tag: 'Basics', title: 'OLTP vs OLAP',
    plain: 'OLTP databases run the live app: thousands of tiny reads and writes (place an order, update a balance). OLAP systems answer big questions over lots of history (sales by region for 3 years). They are built differently, so we copy data from OLTP into OLAP instead of analysing it on the live database.',
    example: 'SQL Server behind a shop website = OLTP. Synapse / Databricks SQL / Snowflake / BigQuery holding all past orders = OLAP.',
    remember: 'Never run heavy analytics on the production database. Move the data to an analytical system.' },
  { id: 'c2', tag: 'Basics', title: 'Warehouse vs Lake vs Lakehouse',
    plain: 'A data warehouse stores clean, structured tables and gives fast SQL. A data lake is cheap storage that holds any raw file (CSV, JSON, images) and you decide the structure when you read it. A lakehouse keeps files in the lake but adds a table layer (Delta) so you get transactions, SQL and governance on the same data.',
    example: 'Warehouse: Synapse dedicated pool. Lake: ADLS Gen2 folders of files. Lakehouse: Databricks + Delta tables on ADLS.',
    remember: 'Lakehouse = the flexibility of a lake plus the reliability of a warehouse.' },
  { id: 'c3', tag: 'Basics', title: 'ETL vs ELT',
    plain: 'ETL: Extract, Transform, then Load. You clean the data on a separate server before it lands. ELT: Extract, Load the raw data first, then Transform inside the powerful warehouse or Spark cluster. Modern cloud stacks prefer ELT because storage is cheap and raw data lets you replay or fix mistakes.',
    example: 'ADF copies a table into ADLS untouched (EL), then a Databricks notebook cleans it (T).',
    remember: 'Keep the raw copy. If your logic was wrong, you can rebuild from raw.' },
  { id: 'c4', tag: 'Basics', title: 'Batch vs Streaming',
    plain: 'Batch processes data in chunks on a schedule (every night, every hour). Streaming processes events continuously, within seconds. Spark Structured Streaming actually works in tiny micro-batches. Streaming is harder and costs more, so use it only when the business truly needs fresh data.',
    example: 'Daily sales report = batch. Fraud alert on a card swipe = streaming.',
    remember: 'Ask "how fresh does it need to be?" before choosing. Most things are fine as batch.' },
  { id: 'c5', tag: 'Modeling', title: 'Fact and Dimension tables (Star schema)',
    plain: 'A fact table records events or measurements: one row per sale with amount, quantity and keys. Dimension tables describe the who/what/where/when: customer, product, store, date. In a star schema the fact sits in the middle and joins to each dimension. First decide the grain: what exactly does one row of the fact mean?',
    example: 'fact_sales(order_id, date_key, customer_key, product_key, qty, amount) joined to dim_customer, dim_product, dim_date.',
    remember: 'Facts = numbers you sum. Dimensions = labels you group and filter by.' },
  { id: 'c6', tag: 'Modeling', title: 'Slowly Changing Dimensions (SCD)',
    plain: 'Descriptive data changes over time: a customer moves city. SCD Type 1 overwrites the old value (no history). Type 2 keeps history by adding a new row with start_date, end_date and is_current. Type 3 keeps only the previous value in an extra column. Type 2 is the one interviews ask about.',
    example: 'Ali lives in Lahore until March, then Karachi. Type 2 keeps two rows so last year\'s sales still show Lahore.',
    remember: 'SCD2 = never update history, close the old row and insert a new one.' },
  { id: 'c7', tag: 'Modeling', title: 'Normalization vs Denormalization',
    plain: 'OLTP databases are normalized (3NF): data split into many small tables to avoid duplication and keep writes safe. Analytics models are denormalized: fewer, wider tables so reads and joins are fast. A star schema is a denormalized design.',
    example: 'Orders, Customers, Addresses, Cities as 4 tables (normalized) vs one dim_customer with city included (denormalized).',
    remember: 'Normalize for writing, denormalize for reading.' },
  { id: 'c8', tag: 'Architecture', title: 'Medallion architecture (Bronze / Silver / Gold)',
    plain: 'A layered way to organize a lakehouse. Bronze: raw data exactly as received, append-only, easy to replay. Silver: cleaned, typed, deduplicated and joined. Gold: business-ready tables and aggregates for dashboards and ML. Each layer is a Delta table.',
    example: 'Bronze: raw_orders JSON. Silver: orders with correct types and no duplicates. Gold: daily_revenue_by_region.',
    remember: 'Bronze = truth as received. Silver = trusted. Gold = useful.' },
  { id: 'c9', tag: 'Architecture', title: 'File formats and partitioning',
    plain: 'CSV and JSON are text and slow to scan. Parquet is columnar and compressed, so Spark reads only the columns it needs. Delta is Parquet plus a transaction log (ACID, time travel, MERGE). Partitioning splits data into folders by a column (e.g. date) so queries skip what they do not need. Too many tiny partitions or tiny files hurts badly; aim for files of roughly 128 MB to 1 GB.',
    example: 'sales/date=2026-10-01/part-0001.parquet lets a query for one day read one folder.',
    remember: 'Partition by a low-cardinality column you filter on often (date). Never by user_id.' },
  { id: 'c10', tag: 'Movement', title: 'Full load, incremental load, watermark, CDC',
    plain: 'Full load copies everything every time (simple, wasteful). Incremental load copies only what is new or changed since last run, tracked with a watermark such as the last updated_at value or an ever-increasing id. CDC (change data capture) reads the database change log so you also catch updates and deletes, which a watermark cannot see.',
    example: 'WHERE updated_at > last_watermark for incremental. Debezium or SQL Server CDC for row-level changes.',
    remember: 'Watermark misses deletes. If deletes matter, use CDC or soft-delete flags.' },
  { id: 'c11', tag: 'Movement', title: 'Idempotency and backfills',
    plain: 'A pipeline is idempotent if running it twice gives the same result. Blind INSERT/append breaks this and creates duplicates on retry. Use MERGE on a key, or overwrite the partition you are processing. This makes retries, reruns and historical backfills safe.',
    example: 'Reload 2026-10-01: overwrite the date=2026-10-01 partition, not append to it.',
    remember: 'Design every job so that "run it again" is always safe.' },
  { id: 'c12', tag: 'Movement', title: 'Orchestration and dependencies',
    plain: 'An orchestrator runs tasks in the right order (a DAG), retries failures, and alerts you. Triggers can be a schedule, a file arriving, or another pipeline finishing. Copy data with ADF, transform with Databricks, and chain them in one workflow.',
    example: 'ADF pipeline: Copy Activity, then Databricks notebook, then Stored Procedure, with email on failure.',
    remember: 'Orchestrator decides when and in what order. The compute engine does the actual work.' },
  { id: 'c13', tag: 'Quality', title: 'Data quality checks',
    plain: 'Trust is the product. Common checks: nulls in key columns, duplicate keys, values in a valid range, foreign keys that exist, row counts matching the source, and freshness (did today\'s data arrive?). Bad rows go to a quarantine table instead of breaking or silently polluting the pipeline.',
    example: 'Silver load rejects rows with null order_id and writes them to quarantine_orders with a reason column.',
    remember: 'Fail loudly, quarantine bad rows, and always reconcile counts against the source.' },
  { id: 'c14', tag: 'Quality', title: 'Schema evolution and data contracts',
    plain: 'Sources add, rename and drop columns. A robust pipeline detects schema changes instead of crashing. Auto Loader and Delta mergeSchema can add new columns automatically. A data contract is an agreement between the data producer and consumers about columns, types and meaning.',
    example: 'Partner adds a column "discount". Bronze picks it up automatically; silver only exposes it once you approve it.',
    remember: 'Be liberal in bronze (accept), strict in silver (validate).' },
  { id: 'c15', tag: 'Ops', title: 'Governance and security',
    plain: 'Know who can see what. Use role-based access, mask personal data (PII), store passwords and keys in a vault (Azure Key Vault) and never in code. Unity Catalog manages tables, permissions and lineage in Databricks.',
    example: 'Analysts read gold only; a service principal reads secrets from Key Vault via a Databricks secret scope.',
    remember: 'Least privilege, no secrets in notebooks, and know your PII columns.' },
  { id: 'c16', tag: 'Ops', title: 'Cost and performance basics',
    plain: 'Costs come from compute time and scanned data. Use job clusters that auto-terminate, right-size clusters, store data as Parquet/Delta, partition sensibly, avoid the small-files problem, and run OPTIMIZE (Z-order) on big Delta tables. Slow Spark jobs are usually caused by shuffles, skewed keys or too many small files.',
    example: 'A nightly job on an always-on all-purpose cluster wastes money; switch to a job cluster that shuts down after the run.',
    remember: 'Read less data, shuffle less data, and switch compute off when idle.' },
]

export const SCENARIOS: Scenario[] = [
  { id: 's1', title: 'Nightly sales from on-prem SQL Server to dashboards',
    situation: 'The shop keeps orders in SQL Server in the office. Management wants a fresh sales dashboard every morning.',
    flow: [
      { n: 'SQL Server (on-prem)', t: 'source' }, { n: 'Copy to the cloud', t: 'ADF + Self-hosted Integration Runtime' }, { n: 'Raw files land in the lake', t: 'ADLS Gen2 /raw' },
      { n: 'Clean and dedupe (silver)', t: 'Databricks + Delta' }, { n: 'Aggregate (gold)', t: 'Databricks SQL / Synapse' }, { n: 'Dashboard', t: 'Power BI' },
    ],
    tools: 'ADF, ADLS Gen2, Databricks, Delta, Power BI',
    watch: ['Schedule the ADF trigger after the source finishes its own nightly jobs', 'Load incrementally with a watermark, not the whole table every night', 'Alert on failure so the dashboard never silently shows old data'],
    say: 'I would copy incrementally into the lake with ADF, transform with Databricks through bronze, silver and gold, and serve gold to Power BI.' },
  { id: 's2', title: 'Real-time clickstream / IoT events',
    situation: 'A mobile app sends millions of click events. The business wants live counts and alerts within seconds.',
    flow: [
      { n: 'App / devices send events', t: 'source' }, { n: 'Message broker buffers events', t: 'Event Hubs or Kafka' }, { n: 'Stream processing', t: 'Databricks Structured Streaming' },
      { n: 'Bronze Delta table (raw)', t: 'Delta' }, { n: 'Windowed aggregates (silver/gold)', t: 'Delta' }, { n: 'Live dashboard / alert', t: 'Power BI / Alerts' },
    ],
    tools: 'Event Hubs / Kafka, Structured Streaming, Delta',
    watch: ['Use checkpoints so the stream resumes exactly where it stopped', 'Handle late events with watermarks and windows', 'Duplicates happen: dedupe on event_id'],
    say: 'Events go to Event Hubs, Structured Streaming writes them to bronze Delta with checkpointing, then windowed aggregates feed the dashboard.' },
  { id: 's3', title: 'Keep a table in sync with a production DB (updates and deletes)',
    situation: 'Customers are edited and deleted all day in the app database. The warehouse copy must stay correct.',
    flow: [
      { n: 'Source DB change log', t: 'CDC / Debezium' }, { n: 'Ship changes', t: 'Kafka or ADF' }, { n: 'Land change rows in bronze', t: 'Delta (append)' },
      { n: 'MERGE INTO silver by key', t: 'Delta MERGE' }, { n: 'Deletes: mark or remove', t: 'MERGE WHEN MATCHED DELETE' },
    ],
    tools: 'CDC, ADF or Kafka, Delta MERGE',
    watch: ['A watermark alone cannot see deletes', 'Order changes by commit time or log sequence number', 'MERGE on the business key keeps reruns safe (idempotent)'],
    say: 'I would capture changes with CDC, append them to bronze, and MERGE into silver by key so updates and deletes are applied idempotently.' },
  { id: 's4', title: 'A partner drops CSV files in a folder every day',
    situation: 'A vendor uploads a new CSV to storage each day. Column order or names sometimes change.',
    flow: [
      { n: 'Partner uploads file', t: 'Blob / ADLS landing' }, { n: 'Detect new files', t: 'Event trigger or Auto Loader' }, { n: 'Ingest with schema handling', t: 'Auto Loader (cloudFiles)' },
      { n: 'Bronze Delta + source file name', t: 'Delta' }, { n: 'Validate + move to silver', t: 'Databricks' }, { n: 'Archive processed file', t: 'ADLS /archive' },
    ],
    tools: 'ADLS, Auto Loader, Delta',
    watch: ['Auto Loader remembers which files it processed, so no double loads', 'Add ingestion time and file name columns for traceability', 'Send bad files to a quarantine folder'],
    say: 'Auto Loader picks up new files incrementally, handles schema changes, and lands them in a bronze Delta table with lineage columns.' },
  { id: 's5', title: 'Pull data from a REST API every day',
    situation: 'A marketing tool exposes data only through a paginated API with rate limits.',
    flow: [
      { n: 'Scheduler', t: 'ADF / Databricks Workflow' }, { n: 'Call API with pagination', t: 'Python notebook or ADF REST' }, { n: 'Store raw JSON with a date', t: 'ADLS /raw/api/date=...' },
      { n: 'Parse JSON to columns', t: 'PySpark' }, { n: 'Upsert to silver', t: 'Delta MERGE' },
    ],
    tools: 'ADF or Databricks, ADLS, PySpark, Key Vault',
    watch: ['Keep API keys in Key Vault', 'Respect rate limits and retry with backoff', 'Save the raw response first so you can reparse later'],
    say: 'I would schedule a job that pages through the API, stores raw JSON by date, then parses and upserts into Delta.' },
  { id: 's6', title: 'A customer changes city and you must keep history',
    situation: 'Reports must show last year\'s sales under the customer\'s old city, and new sales under the new city.',
    flow: [
      { n: 'Incoming customer changes', t: 'bronze' }, { n: 'Compare with current dimension rows', t: 'PySpark' }, { n: 'Close old row (end_date, is_current = false)', t: 'MERGE' },
      { n: 'Insert new row (start_date, is_current = true)', t: 'MERGE' }, { n: 'Facts join on surrogate key', t: 'dim_customer' },
    ],
    tools: 'Delta MERGE, surrogate keys',
    watch: ['Use a surrogate key per version, not the business key', 'Join facts using the version valid at the sale date', 'Test with a customer that changes twice'],
    say: 'That is SCD Type 2: close the current row, insert a new version, and give each version its own surrogate key.' },
  { id: 's7', title: 'Bad data arrived. Reprocess it (backfill)',
    situation: 'You find out the last 5 days of data were loaded with a wrong rule.',
    flow: [
      { n: 'Fix the transformation logic', t: 'code + tests' }, { n: 'Keep bronze untouched', t: 'raw is the truth' }, { n: 'Re-run for the affected dates', t: 'parameterized job' },
      { n: 'Overwrite those partitions or MERGE', t: 'idempotent write' }, { n: 'Reconcile counts vs source', t: 'quality check' },
    ],
    tools: 'Databricks Workflows with date parameters, Delta',
    watch: ['Only idempotent jobs can be safely re-run', 'Tell downstream users a correction is coming', 'Delta time travel can restore a table if you overwrite by mistake'],
    say: 'Because bronze keeps the raw data, I fix the logic and re-run those dates with idempotent writes, then reconcile against the source.' },
  { id: 's8', title: 'First-time move of huge historical data to the cloud',
    situation: 'Ten years of history (several TB) sit on-prem and must be loaded once, then kept in sync.',
    flow: [
      { n: 'Choose transfer method', t: 'ADF, AzCopy, or Azure Data Box for very large' }, { n: 'One-time bulk load in chunks', t: 'partition by date range' },
      { n: 'Validate row counts and checksums', t: 'reconciliation' }, { n: 'Switch on incremental loads', t: 'watermark or CDC' }, { n: 'Go live and decommission old path', t: 'cutover' },
    ],
    tools: 'ADF, AzCopy, Data Box, ADLS',
    watch: ['Bulk loads are limited by network bandwidth, plan the window', 'Run history load and incremental load with a clear overlap point', 'Validate before trusting'],
    say: 'Bulk-load history in date-range chunks, validate counts, then turn on incremental loads from a clear cutover point.' },
  { id: 's9', title: 'A Spark job is slow or the bill is high',
    situation: 'A nightly PySpark job takes 3 hours and the cluster cost keeps rising.',
    flow: [
      { n: 'Open the Spark UI', t: 'find the slow stage' }, { n: 'Check shuffles and skew', t: 'one huge task?' }, { n: 'Fix data layout', t: 'partitioning, OPTIMIZE, Z-order' },
      { n: 'Fix the code', t: 'broadcast small tables, filter early, avoid UDFs' }, { n: 'Right-size compute', t: 'job cluster, autoscale, auto-terminate' },
    ],
    tools: 'Spark UI, Delta OPTIMIZE, broadcast join',
    watch: ['Small files problem: thousands of tiny files slow reads', 'Skew: a few keys hold most rows', 'Use built-in functions instead of Python UDFs'],
    say: 'I would look at the Spark UI for the stage that dominates, then fix skew, small files or joins, and put it on a right-sized job cluster.' },
]

export const SERVICES: Service[] = [
  { need: 'Orchestrate and copy data', azure: 'Azure Data Factory, Databricks Workflows', aws: 'Glue, Step Functions, MWAA (Airflow)', gcp: 'Cloud Composer, Data Fusion', when: 'Schedule pipelines, copy from many sources, set dependencies and retries.' },
  { need: 'Cheap file storage (the lake)', azure: 'ADLS Gen2', aws: 'S3', gcp: 'Cloud Storage (GCS)', when: 'Hold raw, bronze, silver and gold files.' },
  { need: 'Big data processing (Spark)', azure: 'Databricks, Synapse Spark', aws: 'EMR, Glue, Databricks', gcp: 'Dataproc, Dataflow, Databricks', when: 'Transform large data with PySpark or SQL.' },
  { need: 'Data warehouse (fast SQL)', azure: 'Synapse, Fabric Warehouse, Databricks SQL', aws: 'Redshift', gcp: 'BigQuery', when: 'Serve analysts and BI tools.' },
  { need: 'Streaming ingest', azure: 'Event Hubs, Stream Analytics', aws: 'Kinesis, MSK (Kafka)', gcp: 'Pub/Sub', when: 'Millions of events per second, real-time.' },
  { need: 'Catalog, governance, lineage', azure: 'Unity Catalog, Purview', aws: 'Glue Catalog, Lake Formation', gcp: 'Dataplex', when: 'Permissions, discovery and lineage.' },
  { need: 'Secrets and keys', azure: 'Key Vault', aws: 'Secrets Manager', gcp: 'Secret Manager', when: 'Passwords and connection strings, never in code.' },
  { need: 'CI/CD and infrastructure as code', azure: 'Azure DevOps, GitHub Actions, Terraform', aws: 'CodePipeline, Terraform', gcp: 'Cloud Build, Terraform', when: 'Version, test and deploy pipelines and infra.' },
  { need: 'Dashboards (BI)', azure: 'Power BI', aws: 'QuickSight', gcp: 'Looker', when: 'Business users explore gold tables.' },
]

export const CONCEPT_PYSPARK: Concept[] = [
  { id: 'p0', tag: 'PySpark', title: 'How Spark actually works',
    plain: 'Spark splits data into partitions and processes them in parallel on executors, coordinated by a driver. Transformations (select, filter, join, groupBy) are lazy: they only build a plan (a DAG). Nothing runs until an action (show, count, collect, write). Narrow transformations (filter, select) work inside one partition. Wide transformations (join, groupBy, orderBy) need a shuffle, moving data between machines, which is the expensive part.',
    example: 'df.filter(...).select(...) builds a plan. df.count() triggers the run.',
    remember: 'Lazy plan, action runs it, shuffles cost time. Minimize shuffles.' },
]

export const SNIPPETS: Snip[] = [
  { id: 'k1', title: 'Start, read and write', plain: 'On Databricks the session already exists as spark. Always provide or infer a schema on purpose.',
    code: `from pyspark.sql import functions as F

df = (spark.read
      .option("header", True)
      .option("inferSchema", True)
      .csv("/mnt/raw/orders/"))

df.printSchema()
df.show(5)

# write as Delta (recommended)
df.write.format("delta").mode("overwrite").save("/mnt/silver/orders")
# or as a table
df.write.format("delta").mode("append").saveAsTable("silver.orders")` },
  { id: 'k2', title: 'Select, filter, new columns', plain: 'withColumn adds or replaces a column. when/otherwise is your if/else.',
    code: `clean = (df
  .select("order_id", "customer_id", "amount", "order_ts")
  .filter(F.col("amount") > 0)
  .withColumn("order_date", F.to_date("order_ts"))
  .withColumn("size", F.when(F.col("amount") >= 1000, "big")
                       .when(F.col("amount") >= 100, "medium")
                       .otherwise("small"))
  .dropDuplicates(["order_id"]))` },
  { id: 'k3', title: 'Aggregations (groupBy)', plain: 'Group rows, then apply one or many aggregate functions.',
    code: `daily = (clean.groupBy("order_date")
  .agg(F.count("*").alias("orders"),
       F.sum("amount").alias("revenue"),
       F.countDistinct("customer_id").alias("customers"))
  .orderBy("order_date"))` },
  { id: 'k4', title: 'Joins (and broadcast)', plain: 'Join types: inner, left, right, full, left_semi (rows that have a match), left_anti (rows with no match). Broadcast the small table so Spark avoids a big shuffle.',
    code: `from pyspark.sql.functions import broadcast

joined = orders.join(broadcast(customers), on="customer_id", how="left")

# customers with no orders
no_orders = customers.join(orders, "customer_id", "left_anti")` },
  { id: 'k5', title: 'Window functions', plain: 'Calculate across related rows without collapsing them: ranking, running totals, previous row.',
    code: `from pyspark.sql.window import Window

w = Window.partitionBy("customer_id").orderBy(F.col("order_ts").desc())

latest = (orders
  .withColumn("rn", F.row_number().over(w))
  .filter("rn = 1"))                      # latest order per customer

w2 = Window.partitionBy("customer_id").orderBy("order_ts")
orders2 = orders.withColumn("prev_amount", F.lag("amount").over(w2)) \\
                .withColumn("running_total", F.sum("amount").over(w2))` },
  { id: 'k6', title: 'Nulls, dates and strings', plain: 'Clean the everyday mess. Use built-in functions instead of Python UDFs, they are much faster.',
    code: `x = (df
  .na.fill({"amount": 0})
  .withColumn("name", F.initcap(F.trim("name")))
  .withColumn("email", F.lower("email"))
  .withColumn("year", F.year("order_ts"))
  .withColumn("month", F.date_format("order_ts", "yyyy-MM"))
  .withColumn("days_ago", F.datediff(F.current_date(), F.to_date("order_ts")))
  .withColumn("has_email", F.col("email").isNotNull()))` },
  { id: 'k7', title: 'Define a schema explicitly', plain: 'Do not rely on inferSchema in production: it reads the data twice and can guess wrong.',
    code: `from pyspark.sql.types import *

schema = StructType([
  StructField("order_id", StringType(), False),
  StructField("customer_id", StringType(), True),
  StructField("amount", DoubleType(), True),
  StructField("order_ts", TimestampType(), True),
])
df = spark.read.schema(schema).json("/mnt/raw/orders_json/")` },
  { id: 'k8', title: 'Upsert with Delta MERGE', plain: 'Update matching rows, insert new ones. This is how incremental and CDC loads stay idempotent.',
    code: `from delta.tables import DeltaTable

target = DeltaTable.forName(spark, "silver.customers")

(target.alias("t")
  .merge(updates.alias("s"), "t.customer_id = s.customer_id")
  .whenMatchedUpdateAll()
  .whenNotMatchedInsertAll()
  .execute())` },
  { id: 'k9', title: 'Auto Loader (incremental file ingest)', plain: 'Picks up only new files and handles schema drift. The standard way to ingest files into bronze.',
    code: `(spark.readStream
  .format("cloudFiles")
  .option("cloudFiles.format", "csv")
  .option("cloudFiles.schemaLocation", "/mnt/chk/orders_schema")
  .load("/mnt/landing/orders/")
  .writeStream
  .option("checkpointLocation", "/mnt/chk/orders")
  .trigger(availableNow=True)          # process what's there, then stop
  .toTable("bronze.orders"))` },
  { id: 'k10', title: 'Performance toolkit', plain: 'The handful of moves that fix most slow jobs.',
    code: `df.explain()                    # read the plan, look for Exchange (shuffle)
df.cache(); df.count()          # reuse a DataFrame you use many times

df.repartition(200, "date")     # full shuffle, increase/redistribute partitions
df.coalesce(10)                 # reduce partitions without a full shuffle (before writing)

spark.conf.set("spark.sql.shuffle.partitions", "200")

# write partitioned by a column you filter on
df.write.format("delta").partitionBy("order_date").mode("overwrite").save(path)

# Delta table maintenance (SQL)
# OPTIMIZE silver.orders ZORDER BY (customer_id);
# VACUUM silver.orders;` },
  { id: 'k11', title: 'Common mistakes to avoid', plain: 'Habits that make Spark slow or wrong.',
    code: `# 1) collect() / toPandas() on big data crashes the driver
# 2) Python UDFs are slow, prefer pyspark.sql.functions
# 3) Joining two big tables on a skewed key: one task does all the work
# 4) Millions of tiny files: compact with OPTIMIZE
# 5) Appending on retry: use MERGE or overwrite one partition
# 6) Forgetting the join key type: string vs int silently gives no matches
# 7) inferSchema on huge files: define the schema` },
]
