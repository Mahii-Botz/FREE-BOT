module.exports = (sequelize, DataTypes) => {
  const WhatsappBot = sequelize.define('WhatsappBot', {
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_seen: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'whatsapp_bots'
  });

  WhatsappBot.associate = (models) => {
    WhatsappBot.belongsTo(models.User, { foreignKey: 'user_id' });
    WhatsappBot.belongsTo(models.PairCode, { foreignKey: 'pair_code_id' });
  };

  return WhatsappBot;
};
