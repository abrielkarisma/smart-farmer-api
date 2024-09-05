const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Petugas extends Model {
    static associate(models) {
      // Define associations here
      Petugas.belongsTo(models.User, {
        foreignKey: "user_id",
      });

      Petugas.belongsTo(models.Kandang, {
        foreignKey: "id_kandang",
      });
    }
  }

  Petugas.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User", // Make sure this matches the actual table name
          key: "id",
        },
      },
      id_kandang: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Kandang", // Make sure this matches the actual table name
          key: "id",
        },
      },
      kode_pemilik: {
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
      modelName: "Petugas",
      tableName: "petugas",
    }
  );

  paginate(Petugas);

  return Petugas;
};
