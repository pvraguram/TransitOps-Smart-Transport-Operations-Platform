import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from urllib.parse import urlparse, unquote

from app.core.config import settings

parsed = urlparse(settings.DATABASE_URL)

conn = psycopg2.connect(
    dbname='postgres',
    user=parsed.username,
    password=unquote(parsed.password) if parsed.password else None,
    host=parsed.hostname or 'localhost',
    port=parsed.port or 5432,
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()
dbname = parsed.path.lstrip('/')
cur.execute("SELECT 1 FROM pg_database WHERE datname=%s", (dbname,))
if not cur.fetchone():
    cur.execute(f'CREATE DATABASE "{dbname}"')
    print(f'Created database {dbname}')
else:
    print(f'Database {dbname} already exists')
cur.close()
conn.close()
