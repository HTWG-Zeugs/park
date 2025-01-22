import  { Garage } from '../src/garages/models/Garage';

describe('Create a Garage', () => {
  it('should create a new garage', () => {
    const garage = new Garage('123', 'My Garage');
    expect(garage).toBeInstanceOf(Garage);
    expect(garage.Name).toBe('My Garage');
    
    const createdAt = garage.CreatedAt;
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    expect(diff).toBeLessThan(1000);
  });
});