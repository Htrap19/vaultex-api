const lib = require('../lib')

describe('fizzbuzz', () => {
    it('should throw exception if not number', function () {
        expect(() => { lib.fizzBuzz('not number') }).toThrow();
        expect(() => { lib.fizzBuzz(undefined) }).toThrow();
        expect(() => { lib.fizzBuzz(null) }).toThrow();
        expect(() => { lib.fizzBuzz({}) }).toThrow();
    });

    it('should return "FizzBuzz" on disciples 5 and disciples of 3', function () {
        const result = lib.fizzBuzz(15);
        expect(result).toEqual('FizzBuzz');
    });

    it('should return "Buzz" on disciples of only five', function () {
        const result = lib.fizzBuzz(5);
        expect(result).toEqual('Buzz');
    });

    it('should return "Fizz" on disciples of only three', function () {
        const result = lib.fizzBuzz(3);
        expect(result).toEqual('Fizz');
    });

    it('should return same as input if the input is neither divisible by 3 or 5', function () {
        const result = lib.fizzBuzz(1);
        expect(result).toBe(1);
    });
});