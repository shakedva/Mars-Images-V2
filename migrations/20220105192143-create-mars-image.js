'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MarsImages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      imageId: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      sol: {
        type: Sequelize.STRING
      },
      earthDate: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      camera: {
        type: Sequelize.STRING
      },
      mission: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MarsImages');
  }
};