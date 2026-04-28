-- Create all service databases on first run
SELECT 'CREATE DATABASE user_db'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'user_db')\gexec

SELECT 'CREATE DATABASE restaurant_db'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'restaurant_db')\gexec

SELECT 'CREATE DATABASE order_db'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'order_db')\gexec

SELECT 'CREATE DATABASE dev_consumer_db'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'dev_consumer_db')\gexec

SELECT 'CREATE DATABASE pharmacy_db'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pharmacy_db')\gexec
