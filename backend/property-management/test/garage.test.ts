import  { Garage } from '../src/garages/models/Garage';
import { Floor } from '../src/garages/models/Floor';

describe('Create a Garage', () => {
  it('should create a new garage', () => {
    const garage = new Garage('My Garage');
    expect(garage).toBeInstanceOf(Garage);
    expect(garage.Name).toBe('My Garage');
    
    const createdAt = garage.CreatedAt;
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    expect(diff).toBeLessThan(1000);
  });
});

describe('Add a Floor to a Garage', () => {
  it('should add a new floor to a garage', () => {
    const garage = new Garage('My Garage');
    garage.addFloor('1', 10);
    expect(garage.Floors.length).toBe(1);
    expect(garage.Floors[0].Id).toBe('1');
    expect(garage.Floors[0].NumberParkingSpots).toBe(10);
    
    const createdAt = garage.Floors[0].CreatedAt;
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
  });
});

describe('Add a Duplicate Floor to a Garage', () => {
  it('should throw an error when adding a duplicate floor to a garage', () => {
    const garage = new Garage('My Garage');
    garage.addFloor('1', 10);
    expect(() => garage.addFloor('1', 10)).toThrow(Error("Floor with id 1 already exists"));
  });
});

describe('Remove a Floor from a Garage', () => {
  it('should remove a floor from a garage', () => {
    const garage = new Garage('My Garage');
    garage.addFloor('1', 10);
    garage.addFloor('2', 20);
    garage.removeFloor('1');
    expect(garage.Floors.length).toBe(1);
    expect(garage.Floors[0].Id).toBe('2');
    expect(garage.Floors[0].NumberParkingSpots).toBe(20);
  });
});

describe('Update a Floor in a Garage', () => {
  it('should update a floor in a garage', () => {
    const garage = new Garage('My Garage');
    garage.addFloor('1', 10);

    let floor = garage.Floors[0];
    floor.updateNumberParkingSpots(20);
    garage.updateFloor(floor);
    expect(garage.Floors.length).toBe(1);
    expect(garage.Floors[0].Id).toBe('1');
    expect(garage.Floors[0].NumberParkingSpots).toBe(20);
  });
});

describe('Update a Non-Existent Floor in a Garage', () => {
  it('should throw an error when updating a non-existent floor in a garage', () => {
    const garage = new Garage('My Garage');
    garage.addFloor('1', 10);

    let floor = new Floor('2', 20);
    expect(() => garage.updateFloor(floor)).toThrow(Error("Floor with id 2 does not exist"));
  });
});