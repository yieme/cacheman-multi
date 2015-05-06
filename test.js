var Cacheman      = require('cacheman')
var cache = new Cacheman()

// key doesn't exist yet
cache.get('my key', function (error, value) {

  if (error) throw error;

  console.log(value); //-> {foo:"bar"}
})

// set the value
cache.set('my key', { foo: 'bar' }, function (error) {

  if (error) throw error;

  // get the value
  cache.get('my key', function (error, value) {

    if (error) throw error;

    console.log(value); //-> {foo:"bar"}

    // delete entry
    cache.del('my key', function (error){

      if (error) throw error;

      console.log('value deleted');
    });

  });
});
