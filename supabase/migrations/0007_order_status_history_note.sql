-- Optional admin note on each status change (e.g. "courier delayed").
-- Originally added directly in the SQL editor; recorded here so the migrations match the live schema.
alter table order_status_history add column if not exists note text;
