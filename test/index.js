var should = require('chai').should(),
    cachemanMulti = require('..')
;

describe('cacheman-multi', function() {
  it('should say hello', function(done) {
    var test = cachemanMulti()
    test.value.should.equal('Hello, world');
    done();
  });
});
