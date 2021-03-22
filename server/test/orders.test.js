const app = require('../server');
const supertest = require("supertest");

beforeEach(() => {
  jest.clearAllMocks();
});

test("List all the orders", async () => {
  await supertest(app).get("/orders")
    .expect(200)
    .then((response) => {
    });
});

test("Should not get order details for invalid orderID", async () => {
  await supertest(app).get("/order/:orderID")
    .expect(404)
    .then((response) => {
    });
});
