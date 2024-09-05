'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("laporan_panen_ayam_pedaging_sampling", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_kandang: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "kandang",
          key: "id",
        },
      },
      id_petugas: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "petugas",
          key: "id",
        },
      },
      tanggal: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      total_berat: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('laporan_panen_ayam_pedaging_sampling');
  }
};
