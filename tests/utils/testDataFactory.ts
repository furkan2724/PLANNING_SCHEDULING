import { DataGenerator } from '../../utils/dataGenerator';

export class TestDataFactory {
  static categoryName = DataGenerator.getCategoryName();

  static productName = DataGenerator.getProductName();

  static resourceName = DataGenerator.getResourceName();

  static workstationName = DataGenerator.getWorkstationName();

  static categoryDescription = DataGenerator.getDescription();

  static updatedCategoryDescription = DataGenerator.getDescription();
}