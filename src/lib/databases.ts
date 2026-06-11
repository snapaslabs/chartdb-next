import MysqlLogo from '@/assets/mysql_logo.png';
import MysqlLogoDark from '@/assets/mysql_logo_dark.png';
import PostgresqlLogo from '@/assets/postgresql_logo.png';
import PostgresqlLogoDark from '@/assets/postgresql_logo_dark.png';
import MariaDBLogo from '@/assets/mariadb_logo.png';
import MariaDBLogoDark from '@/assets/mariadb_logo_dark.png';
import SqliteLogo from '@/assets/sqlite_logo.png';
import SqliteLogoDark from '@/assets/sqlite_logo_dark.png';
import SqlServerLogo from '@/assets/sql_server_logo.png';
import SqlServerLogoDark from '@/assets/sql_server_logo_dark.png';
import MysqlLogo2 from '@/assets/mysql_logo_2.png';
import PostgresqlLogo2 from '@/assets/postgresql_logo_2.png';
import MariaDBLogo2 from '@/assets/mariadb_logo_2.png';
import SqliteLogo2 from '@/assets/sqlite_logo_2.png';
import SqlServerLogo2 from '@/assets/sql_server_logo_2.png';
import GeneralDBLogo2 from '@/assets/general_db_logo_2.png';
import ClickhouseLogo from '@/assets/clickhouse_logo.png';
import ClickhouseLogoDark from '@/assets/clickhouse_logo_dark.png';
import ClickhouseLogo2 from '@/assets/clickhouse_logo_2.png';
import CockroachDBLogo from '@/assets/cockroachdb_logo.png';
import CockroachDBLogoDark from '@/assets/cockroachdb_logo_dark.png';
import CockroachDBLogo2 from '@/assets/cockroachdb_logo_2.png';
import OracleLogo from '@/assets/oracle_logo.png';
import OracleLogoDark from '@/assets/oracle_logo_dark.png';
import OracleLogo2 from '@/assets/oracle_logo_2.png';
import { DatabaseType } from './domain/database-type';
import type { EffectiveTheme } from './types';

export const databaseTypeToLabelMap: Record<DatabaseType, string> = {
    [DatabaseType.GENERIC]: 'Generic',
    [DatabaseType.POSTGRESQL]: 'PostgreSQL',
    [DatabaseType.MYSQL]: 'MySQL',
    [DatabaseType.SQL_SERVER]: 'SQL Server',
    [DatabaseType.MARIADB]: 'MariaDB',
    [DatabaseType.SQLITE]: 'SQLite',
    [DatabaseType.CLICKHOUSE]: 'ClickHouse',
    [DatabaseType.COCKROACHDB]: 'CockroachDB',
    [DatabaseType.ORACLE]: 'Oracle',
};

export const databaseLogoMap: Record<DatabaseType, string> = {
    [DatabaseType.MYSQL]: MysqlLogo.src,
    [DatabaseType.POSTGRESQL]: PostgresqlLogo.src,
    [DatabaseType.MARIADB]: MariaDBLogo.src,
    [DatabaseType.SQLITE]: SqliteLogo.src,
    [DatabaseType.SQL_SERVER]: SqlServerLogo.src,
    [DatabaseType.CLICKHOUSE]: ClickhouseLogo.src,
    [DatabaseType.COCKROACHDB]: CockroachDBLogo.src,
    [DatabaseType.ORACLE]: OracleLogo.src,
    [DatabaseType.GENERIC]: '',
};

export const databaseDarkLogoMap: Record<DatabaseType, string> = {
    [DatabaseType.MYSQL]: MysqlLogoDark.src,
    [DatabaseType.POSTGRESQL]: PostgresqlLogoDark.src,
    [DatabaseType.MARIADB]: MariaDBLogoDark.src,
    [DatabaseType.SQLITE]: SqliteLogoDark.src,
    [DatabaseType.SQL_SERVER]: SqlServerLogoDark.src,
    [DatabaseType.CLICKHOUSE]: ClickhouseLogoDark.src,
    [DatabaseType.COCKROACHDB]: CockroachDBLogoDark.src,
    [DatabaseType.ORACLE]: OracleLogoDark.src,
    [DatabaseType.GENERIC]: '',
};

export const getDatabaseLogo = (
    databaseType: DatabaseType,
    theme: EffectiveTheme
) =>
    theme === 'dark'
        ? databaseDarkLogoMap[databaseType]
        : databaseLogoMap[databaseType];

export const databaseSecondaryLogoMap: Record<DatabaseType, string> = {
    [DatabaseType.MYSQL]: MysqlLogo2.src,
    [DatabaseType.POSTGRESQL]: PostgresqlLogo2.src,
    [DatabaseType.MARIADB]: MariaDBLogo2.src,
    [DatabaseType.SQLITE]: SqliteLogo2.src,
    [DatabaseType.SQL_SERVER]: SqlServerLogo2.src,
    [DatabaseType.CLICKHOUSE]: ClickhouseLogo2.src,
    [DatabaseType.COCKROACHDB]: CockroachDBLogo2.src,
    [DatabaseType.ORACLE]: OracleLogo2.src,
    [DatabaseType.GENERIC]: GeneralDBLogo2.src,
};
