const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class LogInventory extends Model {
    static associate(models) {
      // Define associations here
      LogInventory.belongsTo(models.Inventory, {
        foreignKey: "id_inventory",
      });
      LogInventory.belongsTo(models.User, {
        foreignKey: "createdBy",
      });
    }
  }

  LogInventory.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_inventory: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Inventory", // Make sure this matches the actual table name
          key: "id",
        },
      },
      keterangan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User", // Make sure this matches the actual table name
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "LogInventory",
      tableName: "log_inventory",
    }
  );

  paginate(LogInventory);

  return LogInventory;
};
