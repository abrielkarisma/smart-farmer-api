const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class LaporanPanenAyamPedagingSamplingImage extends Model {
    static associate(models) {
      // Define associations here
      LaporanPanenAyamPedagingSamplingImage.belongsTo(
        models.LaporanPanenAyamPedagingSampling,
        {
          foreignKey: "id_laporan_panen_ayam_pedaging_sampling",
        }
      );
    }
  }

  LaporanPanenAyamPedagingSamplingImage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_laporan_panen_ayam_pedaging_sampling: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "LaporanPanenAyamPedagingSampling", // Make sure this matches the actual table name
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
      modelName: "LaporanPanenAyamPedagingSamplingImage",
      tableName: "laporan_panen_ayam_pedaging_sampling_images",
    }
  );

  paginate(LaporanPanenAyamPedagingSamplingImage);

  return LaporanPanenAyamPedagingSamplingImage;
};
