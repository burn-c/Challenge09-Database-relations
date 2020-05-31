import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IRequest {
  id: string;
}

@injectable()
class FindOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
  ) {}

  public async execute({ id }: IRequest): Promise<Order | undefined> {
    const checkOrderExists = await this.ordersRepository.findById(id);
    if (!checkOrderExists) {
      throw new AppError('Order does not exist!');
    }

    return checkOrderExists;
  }
}

export default FindOrderService;
