const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Kandang extends Model {
    static associate(models) {
      Kandang.belongsTo(models.User, {
        foreignKey: "id_pemilik",
      });

      Kandang.hasMany(models.KandangImage, {
        foreignKey: "id_kandang",
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
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DOUBLE,
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
          model: "User",
          key: "id",
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: "Kandang",
      tableName: "kandang",
    }
  );

  paginate(Kandang);

  return Kandang;
};
