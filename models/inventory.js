const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      // Define associations here
      Inventory.belongsTo(models.Kandang, {
        foreignKey: "id_kandang",
      });
    }
  }

  Inventory.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_kandang: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "kandang", // Make sure this matches the actual table name
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jenis: {
        type: DataTypes.ENUM(
          "pakan pedaging",
          "pakan petelur",
          "vitamin",
          "disinfektan"
        ),
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
      modelName: "Inventory",
      tableName: "inventory",
    }
  );

  paginate(Inventory);

  return Inventory;
};
