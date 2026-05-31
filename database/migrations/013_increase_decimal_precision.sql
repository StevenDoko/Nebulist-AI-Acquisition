-- Increase DECIMAL precision for financial fields to handle larger values
-- DECIMAL(10,2) max is 99,999,999.99
-- DECIMAL(15,2) max is 9,999,999,999,999.99 (13 digits before decimal)

ALTER TABLE events
ALTER COLUMN estimated_budget TYPE DECIMAL(15, 2),
ALTER COLUMN final_price TYPE DECIMAL(15, 2),
ALTER COLUMN deposit_paid TYPE DECIMAL(15, 2);
