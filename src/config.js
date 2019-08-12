module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: '*',
  DB_URL: process.env.DATABASE_URL || 'postgresql://dunder-mifflin@localhost/minced',
  TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://dunder-mifflin@localhost/minced-test'
}