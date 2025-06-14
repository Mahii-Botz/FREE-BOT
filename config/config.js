module.exports = {
  dbConfig: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  sessionConfig: {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  },
  whatsappConfig: {
    sessionTimeout: 300000, // 5 minutes
    statusCheckInterval: 30000 // 30 seconds
  }
};
