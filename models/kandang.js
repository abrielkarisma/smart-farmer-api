const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Kandang extends Model {
    static associate(models) {
      Kandang.belongsTo(models.User, {
        foreignKey: "id_pemilik",
      });
    }
  }

  Kandang.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lokasi: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jumlah_ayam: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_pemilik: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "user",
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
      modelName: "kandang",
      tableName: "kandang",
    }
  );

  paginate(Kandang);

  return Kandang;
};
