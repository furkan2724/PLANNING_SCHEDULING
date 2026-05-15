import { faker } from '@faker-js/faker';

export class DataGenerator {

  static getShortId(length: number = 3) {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  // static getCategoryName() {
  //   const word = faker.commerce.department().split(' ')[0]; // take only first word
  //   return `Category-${word}-${this.getShortId()}`;
  // }
  static getCategoryName() {
    const word = faker.commerce.department()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')[0];

    return `Category${word}${this.getShortId()}`;
  }

  // static getProductName() {
  //   const word = faker.commerce.productName().split(' ')[0];
  //   return `Product-${word}-${this.getShortId()}`;
  // }

  static getProductName() {
    const word = faker.commerce.productName()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')[0];

    return `Product${word}${this.getShortId()}`;
  }

  static getDescription() {
    return faker.lorem.words(3); // short description
  }
  // static getResourceName() {
  //   const word = faker.commerce.product().split(' ')[0];
  //   return `Resource-${word}-${this.getShortId()}`;
  // }

  static getResourceName() {
    const word = faker.commerce.product()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')[0];

    return `Resource${word}${this.getShortId()}`;
  }

  // static getWorkstationName() {
  //   const word = faker.company.name().split(' ')[0];
  //   return `Workstation-${word}-${this.getShortId()}`;
  // }

  static getWorkstationName() {
    const word = faker.company.name()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')[0];

    return `Workstation${word}${this.getShortId()}`;
  }

  static getRandomNumber(min: number = 1, max: number = 10): number {
    return faker.number.int({ min, max });
  }

}