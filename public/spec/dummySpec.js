describe("The Client App...", function() {
	var x = 0;

	beforeEach(function(){
		x += 1;
	});

	it("undefined", function() {
		expect(x).not.toBeUndefined();
		expect(x).toBe(1);
	});

	it("undefined", function() {
		expect(x).toBe(2);
	});
});