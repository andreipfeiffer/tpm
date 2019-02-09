var customMatchers = {
  toEqualDeep: (/*util, customEqualityTesters*/) => {
    return {
      compare(actual, expected) {
        var result = {};

        result.pass = angular.equals(actual, expected);

        if (result.pass) {
          result.message = actual + " Deep Equals: " + expected;
        } else {
          result.message = "Expected " + actual + " to Equal Deep: " + expected;
        }

        return result;
      }
    };
  }
};

export default customMatchers;
