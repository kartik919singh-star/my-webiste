export interface ProductConstant {
  id: string;
  name: string;
  type: 'Marble' | 'Granite' | 'Tiles';
  defaultPrice: number;
  defaultLength: number;
  defaultWidth: number;
}

export class ProductConstants {
  static readonly LIST: ProductConstant[] = [
    { id: '1', name: 'Italian Statuario Marble', type: 'Marble', defaultPrice: 650, defaultLength: 9.5, defaultWidth: 5.0 },
    { id: '2', name: 'Italian Carrara Marble', type: 'Marble', defaultPrice: 450, defaultLength: 8.5, defaultWidth: 4.5 },
    { id: '3', name: 'Italian Botticino Marble', type: 'Marble', defaultPrice: 520, defaultLength: 8.0, defaultWidth: 4.0 },
    { id: '4', name: 'Makrana Pure White Marble', type: 'Marble', defaultPrice: 780, defaultLength: 10.0, defaultWidth: 5.5 },
    { id: '5', name: 'Rajasthan Green Marble', type: 'Marble', defaultPrice: 280, defaultLength: 7.5, defaultWidth: 3.5 },
    { id: '6', name: 'Turkish Crema Marfil', type: 'Marble', defaultPrice: 580, defaultLength: 9.0, defaultWidth: 5.0 },
    { id: '7', name: 'Imperial Red Granite', type: 'Granite', defaultPrice: 320, defaultLength: 10.0, defaultWidth: 3.5 },
    { id: '8', name: 'Black Galaxy Granite', type: 'Granite', defaultPrice: 410, defaultLength: 9.0, defaultWidth: 3.5 },
    { id: '9', name: 'Kashmir White Granite', type: 'Granite', defaultPrice: 360, defaultLength: 8.5, defaultWidth: 3.0 },
    { id: '10', name: 'Vitrified Onyx Tiles 2x2', type: 'Tiles', defaultPrice: 95, defaultLength: 2.0, defaultWidth: 2.0 },
    { id: '11', name: 'Glazed Ceramic Floor Tiles 2x4', type: 'Tiles', defaultPrice: 120, defaultLength: 4.0, defaultWidth: 2.0 },
    { id: '12', name: 'Porcelain Wall Tiles 1x2', type: 'Tiles', defaultPrice: 75, defaultLength: 2.0, defaultWidth: 1.0 },
  ];
}

export const MOCK_PRODUCTS = ProductConstants.LIST;
