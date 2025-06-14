const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whatsapp_bot',
  dialect: 'mysql',
  port: process.env.DB_PORT || 3306,
  pool: {
    max: 5,     // maximum number of connections in pool
    min: 0,     // minimum number of connections in pool
    acquire: 30000, // maximum time (ms) that pool will try to get connection before throwing error
    idle: 10000 // maximum time (ms) that a connection can be idle before being released
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true, // add createdAt and updatedAt fields
    underscored: true, // use snake_case for column names
    freezeTableName: true // prevent Sequelize from pluralizing table names
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: dbConfig.logging,
    define: dbConfig.define,
    dialectOptions: {
      connectTimeout: 60000, // 1 minute timeout
      decimalNumbers: true // return decimals as numbers instead of strings
    },
    retry: {
      max: 3, // maximum retry attempts
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ]
    }
  }
);

// Test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models (optional - remove in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('All models were synchronized successfully.');
    }
    
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit the process with failure
  }
}

// Export the Sequelize instance and connection test function
module.exports = {
  sequelize,
  testConnection,
  dbConfig
};
