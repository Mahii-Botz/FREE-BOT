module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'users'
  });

  User.associate = (models) => {
    User.hasMany(models.PairCode, { foreignKey: 'user_id' });
    User.hasMany(models.WhatsappBot, { foreignKey: 'user_id' });
  };

  return User;
};
