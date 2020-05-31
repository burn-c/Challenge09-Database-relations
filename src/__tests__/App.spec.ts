import request from 'supertest';

import { Connection, getConnection, getRepository } from 'typeorm';
import createConnection from '@shared/infra/typeorm/index';

// import Product from '@modules/products/infra/typeorm/entities/Product';

import app from '@shared/infra/http/app';

let connection: Connection;

describe('App', () => {
  beforeAll(async () => {
    connection = await createConnection('test-connection');

    await connection.query('DROP TABLE IF EXISTS orders_products');
    await connection.query('DROP TABLE IF EXISTS orders');
    await connection.query('DROP TABLE IF EXISTS products');
    await connection.query('DROP TABLE IF EXISTS customers');
    await connection.query('DROP TABLE IF EXISTS migrations');

    await connection.runMigrations();
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM orders_products');
    await connection.query('DELETE FROM orders');
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM customers');
  });

  afterAll(async () => {
    const mainConnection = getConnection();

    await connection.close();
    await mainConnection.close();
  });

  it('should be able to create a new customer', async () => {
    const response = await request(app).post('/customers').send({
      name: 'Rocketseat',
      email: 'oi@rocketseat.com.br',
    });

    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'Rocketseat',
        email: 'oi@rocketseat.com.br',
      }),
    );
  });
});
