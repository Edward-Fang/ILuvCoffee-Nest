// 存放 Docker Compose文件使用的端口、密码等配置  额外关键词用于 TypeORM转移
module.exports = {
  type: 'postgres',
  host: 'localhost',
  post: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  cli: {
    migrationsDir: 'src/migrations'
  }
}
