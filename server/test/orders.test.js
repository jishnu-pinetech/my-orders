const controller = require('../controllers/orders');

describe('Orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrive orders', async () => {
    const mReq = {
      query: { sort: 0 }
    };
    const mRes = { status: jest.fn().mockReturnThis(), type: jest.fn().mockReturnThis(), send: jest.fn() };
    const mNext = jest.fn();
    await controller.getOrders(mReq, mRes, mNext);
    expect(mRes.type).toBeCalledWith('application/json');
    expect(mRes.status).toBeCalledWith(200);
  });
});
