import { DataGenerator } from './dataGenerator';
import { readExcel } from './excelReader';

export class TestDataProvider {

  static getData(
    source: 'faker' | 'excel' = 'faker',
    rowIndex: number = 0
  ) {

    if (source === 'faker') {
      return {
        categoryName: DataGenerator.getCategoryName(),
        categoryDesc: DataGenerator.getDescription(),
        updatedCategoryDesc: DataGenerator.getDescription(),
        productName: DataGenerator.getProductName(),
        resourceName: DataGenerator.getResourceName(),
        workstationName: DataGenerator.getWorkstationName()
      };
    }

    const excelData: any = readExcel(
      'test-data/fullFlowData.xlsx',
      'Sheet1'
    )[rowIndex];

    return excelData;
  }
}