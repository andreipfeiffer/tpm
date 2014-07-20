jasmine.Matchers.prototype.toEqualDeep = function(expected) {
    return angular.equals(this.actual, expected);
};
