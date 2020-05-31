import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const checkCustomerExists = await this.customersRepository.findById(
      customer_id,
    );

    if (!checkCustomerExists) {
      throw new AppError('Customer does not exist!');
    }

    const productsListIds = products.map(product => ({ id: product.id }));
    const checkProducts = await this.productsRepository.findAllById(
      productsListIds,
    );

    if (checkProducts.length !== productsListIds.length) {
      throw new AppError('One or more products were not found!');
    }

    const updateQuantityProducts = checkProducts.map(product => {
      const productQuantity = products.find(p => p.id === product.id);

      if (
        productQuantity === undefined ||
        product.quantity < productQuantity.quantity
      ) {
        throw new AppError('Product quantity not available!');
      }

      return {
        ...product,
        quantity: product.quantity - productQuantity.quantity,
        order_product_quantity: productQuantity.quantity,
      };
    });

    // Update inventory
    await this.productsRepository.updateQuantity(updateQuantityProducts);

    const order = await this.ordersRepository.create({
      customer: checkCustomerExists,
      products: updateQuantityProducts.map(product => ({
        product_id: product.id,
        price: product.price,
        quantity: product.order_product_quantity,
      })),
    });

    return order;
  }
}

export default CreateOrderService;
