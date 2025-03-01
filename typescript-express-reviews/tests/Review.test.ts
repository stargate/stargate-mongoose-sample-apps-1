
import { describe, it, before } from 'mocha';
import assert from 'assert';
import sinon from 'sinon';
import create from '../src/api/Review/create';
import Vehicle from '../src/models/vehicle';
import User from '../src/models/user';

interface ResponseStub {
  status: sinon.SinonStub;
  json: sinon.SinonStub;
}

describe('Review', function() {
  it('should create a review', async function() {
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
    const req = mockRequest({ vehicleId: vehicle._id, userId: user._id, rating: 4, text: 'The length of this text must be greater than 30 to pass validation.' });
    const res = mockResponse();
    await create(req, res);
    assert(res.json.getCall(0).args[0].review);
    assert.equal(res.json.getCall(0).args[0].review.rating, 4);
    assert.equal(res.json.getCall(0).args[0].review.text, 'The length of this text must be greater than 30 to pass validation.');
  });
});
