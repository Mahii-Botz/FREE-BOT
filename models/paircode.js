module.exports = (sequelize, DataTypes) => {
  const PairCode = sequelize.define('PairCode', {
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'pair_codes'
  });

  PairCode.associate = (models) => {
    PairCode.belongsTo(models.User, { foreignKey: 'user_id' });
    PairCode.hasOne(models.WhatsappBot, { foreignKey: 'pair_code_id' });
  };

  return PairCode;
};
