
import Vehicle from '../src/models/vehicle';
import Review from '../src/models/review';
import User from '../src/models/user';
import { describe, it } from 'mocha';
import last5 from '../src/api/Vehicle/findById';
import findByVehicle from '../src/api/Review/findByVehicle';
import assert from 'assert';
import sinon from 'sinon';

interface ResponseStub {
  status: sinon.SinonStub;
  json: sinon.SinonStub;
}

describe('Vehicle', function() {
  it('should find a vehicle with its last 5 reviews', async function() {
    this.timeout(10000);

    const mockRequest = (body) => ({
      body
    });
    const mockResponse = (): ResponseStub => {
      const res: ResponseStub = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis()
      };
      return res;
    };
    const user = await User.create({
      email: 'test@localhost.com',
      firstName: 'Test',
      lastName: 'Testerson'
    });
    const vehicle = await Vehicle.create(
      {
        make: 'Tesla',
        model: 'Model S',
        year: 2022,
        images: [
          'https://tesla-cdn.thron.com/delivery/public/image/tesla/6139697c-9d6a-4579-837e-a9fc5df4a773/bvlatuR/std/1200x628/Model-3-Homepage-Social-LHD',
          'https://www.tesla.com/sites/default/files/images/blogs/models_blog_post.jpg'
        ],
        numReviews: 0,
        averageReview: 0
      }
    );
    for (let i = 1; i < 7; i++) {
      await Review.create({
        rating: i > 5 ? 5 : i,
        text: 'This is a review that must have length greater than 30. ' + i,
        vehicleId: vehicle._id,
        userId: user._id
      });
    }
    vehicle.numReviews = 5;
    vehicle.averageReview = 3;
    await vehicle.save();
    const req = mockRequest({ vehicleId: vehicle._id, limit: 5 });
    const res = mockResponse();
    await last5(req, res);
    assert(res.json.getCall(0).args[0].vehicle);
    assert.equal(res.json.getCall(0).args[0].reviews.length, 5);
    //Sorting is not supported by the driver at this point
    //console.log(JSON.stringify(res.json.getCall(0).args[0].reviews));
    //assert(res.json.getCall(0).args[0].reviews[0].text.endsWith('6'));
  });

  it('Should find all the reviews for the given vehicleId, adhering to the skip and limit parameters', async function() {
    const mockRequest = (body) => ({
      body
    })
    const mockResponse = (): ResponseStub => {
      const res: ResponseStub = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis()
      };
      return res;
    };
    const user = await User.create({
      email: 'test@localhost.com',
      firstName: 'Test',
      lastName: 'Testerson'
    });
    const vehicle = await Vehicle.create(
      {
        make: 'Tesla',
        model: 'Model S',
        year: 2022,
        images: [
          'https://tesla-cdn.thron.com/delivery/public/image/tesla/6139697c-9d6a-4579-837e-a9fc5df4a773/bvlatuR/std/1200x628/Model-3-Homepage-Social-LHD',
          'https://www.tesla.com/sites/default/files/images/blogs/models_blog_post.jpg'
        ],
        numReviews: 0,
        averageReview: 0
      },
    );
    for (let i = 0; i < 7; i++) {
      await Review.create({
        rating: i > 5 ? 5 : i, 
        text: 'This is a review that must have length greater than 30. ' + i, 
        vehicleId: vehicle._id,
        userId: user._id
      });
    }
    vehicle.numReviews = 6;
    vehicle.averageReview = 3;
    await vehicle.save();
    const req = mockRequest({ vehicleId: vehicle._id, limit: 0, skip: 0 });
    const res = mockResponse();
    await findByVehicle(req, res);
    assert.equal(res.json.getCall(0).args[0].reviews.length, 7);
    assert(res.json.getCall(0).args[0].reviews[0].text.endsWith('6'));
  });
});
