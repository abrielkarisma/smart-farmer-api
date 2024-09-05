const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class InventoryImage extends Model {
    static associate(models) {
      // Define associations here
      InventoryImage.belongsTo(models.Inventory, {
        foreignKey: "id_inventory",
      });
    }
  }

  InventoryImage.init(
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
          model: "inventory", // Make sure this matches the actual table name
          key: "id",
        },
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "InventoryImage",
      tableName: "inventory_images",
    }
  );

  paginate(InventoryImage);

  return InventoryImage;
};
