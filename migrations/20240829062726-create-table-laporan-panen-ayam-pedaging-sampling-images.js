'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("laporan_panen_ayam_pedaging_sampling_images", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_laporan_panen_ayam_pedaging_sampling: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "laporan_panen_ayam_pedaging_sampling",
          key: "id",
        },
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable("laporan_panen_ayam_pedaging_sampling_images");
  }
};
