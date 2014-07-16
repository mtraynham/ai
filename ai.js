(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.neural = require('./neural/index.coffee');

exports.swarm = require('./swarm/index.coffee');


},{"./neural/index.coffee":3,"./swarm/index.coffee":5}],2:[function(require,module,exports){
var Neuron, activate, backwardPropagateError, calculateErrorDerivativesForWeights, createNeuron, execute, forwardPropagate, initWeights, randomVector, testNetwork, trainNetwork, transfer, transferDerivative, updateWeights;

randomVector = require('../../util/randomVector.coffee');

Neuron = (function() {
  function Neuron(weights, activation) {
    this.weights = weights;
    this.activation = activation;
  }

  return Neuron;

})();


/**
 * Initialize weights
 * @param  {Integer} numberOfWeights
 * @return {[]}
 */

initWeights = function(numberOfWeights) {
  var i, minmax;
  i = numberOfWeights;
  minmax = [];
  while (i--) {
    minmax.push([-Math.random(), Math.random()]);
  }
  return randomVector(minmax);
};


/**
 * Activate
 * @param  {[]} weights
 * @param  {[]} vector
 * @return {Float}
 */

activate = function(weights, vector) {
  return vector.reduce(function(prev, cur, i) {
    return prev += weights[i] * cur;
  }, 0.0);
};


/**
 * Transfer
 * @param  {Float} activation
 * @return {Float}
 */

transfer = function(activation) {
  return 1.0 / (1.0 + Math.exp(-activation));
};


/**
 * Transfer derivative
 * @param  {Float} output
 * @return {Float}
 */

transferDerivative = function(output) {
  return output * (1.0 - output);
};


/**
 * Forward propagate
 * @param  {[[]]} network
 * @param  {[]} vector
 * @return {Float}
 */

forwardPropagate = function(network, vector) {
  network.forEach(function(layer, i) {
    var input;
    input = i === 0 ? vector : network[i - 1].map(function(neuron) {
      return neuron.output;
    });
    return layer.forEach(function(neuron) {
      neuron.activation = activate(neuron.weights, input);
      return neuron.output = transfer(neuron.activation);
    });
  });
  return network[network.length - 1][0].output;
};


/**
 * Back propapate error
 * @param  {[[]]} network
 * @param  {Float} expectedOutput
 */

backwardPropagateError = function(network, expectedOutput) {
  var error, i, neuron, _results;
  i = network.length;
  _results = [];
  while (i--) {
    if (i === network.length - 1) {
      neuron = network[i][0];
      error = expectedOutput - neuron.output;
      _results.push(neuron.delta = error * transferDerivative(neuron.output));
    } else {
      _results.push(network[i].forEach(function(neuron, j) {
        return neuron.delta = transferDerivative(neuron.output) * network[i + 1].reduce(function(prev, nextNeuron) {
          return p += nextNeuron.weights[j] * nextNeuron.delta;
        }, 0);
      }));
    }
  }
  return _results;
};


/**
 * Calculate error derivatives for weights
 * @param  {[[]]} network
 * @param  {[]} vector
 */

calculateErrorDerivativesForWeights = function(network, vector) {
  return network.forEach(function(layer, i) {
    var input;
    input = i === 0 ? vector : network[i - 1].map(function(neuron, j) {
      return network[i - 1][j].output;
    });
    return layer.forEach(function(neuron) {
      input.forEach(function(signal, j) {
        return neuron.deriv[j] += neuron.delta * signal;
      });
      return neuron.deriv[neuron.deriv.length - 1] += neuron.delta;
    });
  });
};


/**
 * Update the weights
 * @param  {[[]]} network
 * @param  {Float} lrate
 * @param  {Float} momentum
 */

updateWeights = function(network, lrate, momentum) {
  momentum = momentum || 0.8;
  return network.forEach(function(layer) {
    return layer.forEach(function(neuron) {
      return neuron.weights.forEach(function(weight, i) {
        var delta;
        delta = lrate * neuron.deriv[i] + neuron.lastDelta[i] * momentum;
        neuron.weights[i] += delta;
        neuron.lastDelta[i] = delta;
        return neuron.deriv[i] = 0.0;
      });
    });
  });
};


/**
 * Train the network
 * @param  {[[]]} network
 * @param  {[]} domain
 * @param  {Integer} numberOfInputs
 * @param  {Integer} iterations
 * @param  {Float} lrate
 */

trainNetwork = function(network, domain, numberOfInputs, iterations, lrate) {
  var i, _results;
  i = iterations;
  _results = [];
  while (i--) {
    domain.forEach(function(pattern) {
      var output;
      output = forwardPropagate(network, vector);
      backwardPropagateError(network.expected);
      return calculateErrorDerivativesForWeights(network, vector);
    });
    _results.push(updateWeights(network, lrate));
  }
  return _results;
};


/**
 * Test the network
 * @param  {[[]]} network
 * @param  {[]} domain
 * @param  {Integer} numberOfInputs
 * @return {Integer}
 */

testNetwork = function(network, domain, numberOfInputs) {
  var correct;
  correct = 0;
  domain.forEach(function(pattern) {
    var output;
    output = forwardPropagate(network, inputVector);
    if (output.round === pattern[pattern.length - 1]) {
      return correct += 1;
    }
  });
  return correct;
};


/**
 * Create a neuron
 * @param  {Integer} numberOfInputs
 * @return {Neuron}
 */

createNeuron = function(numberOfInputs) {
  return new Neuron(initWeights(numberOfInputs + 1));
};


/**
 * Execute back propagation
 * @param  {[]} domain
 * @param  {Integer} numberOfInputs
 * @param  {Integer} iterations
 * @param  {Integer} numberOfNodes
 * @param  {Float} lrate
 * @return {[[]]}
 */

execute = function(domain, numberOfInputs, iterations, numberOfNodes, lrate) {
  var i, network;
  network = [];
  i = numberOfNodes;
  while (i--) {
    network.push(createNeuron(numberOfInputs));
  }
  network.push(createNeuron(network[network.length - 1].length));
  trainNetwork(network, domain, numberOfInputs, iterations, lrate);
  testNetwork(network, domain, numberOfInputs);
  return network;
};

module.exports = execute;


},{"../../util/randomVector.coffee":9}],3:[function(require,module,exports){
exports.backPropagation = require('./backPropagation.coffee');


},{"./backPropagation.coffee":2}],4:[function(require,module,exports){

/*
 * http://en.wikipedia.org/wiki/Bees_algorithm
 */
var Bee, createNeighborBee, createRandomBee, createScoutBees, objectiveFn, randomVector, search, searchNeighborBees;

randomVector = require('../../util/randomVector.coffee');

Bee = (function() {
  function Bee(vector, fitness) {
    this.vector = vector;
    this.fitness = fitness;
  }

  return Bee;

})();


/**
 * Objective function
 * @param  {[]} vector
 * @return {[]}
 */

objectiveFn = function(vector) {
  return vector.reduce(function(prev, cur) {
    return prev + cur * 2;
  }, 0);
};


/**
 * Create a random bee
 * @param  {[[]]} searchSpace
 * @return {Bee}
 */

createRandomBee = function(searchSpace) {
  return new Bee(randomVector(searchSpace));
};


/**
 * Create a neighbor bee
 * @param  {[]} site
 * @param  {Integer} patchSize
 * @param  {[[]]} searchSpace
 * @return {Bee}
 */

createNeighborBee = function(site, patchSize, searchSpace) {
  return new Bee(site.map(function(cur, i) {
    cur = Math.random() < 0.5 ? cur + Math.random() * patchSize : cur - Math.random() * patchSize;
    if (cur < searchSpace[i][0]) {
      cur = searchSpace[i][0];
    }
    if (cur > searchSpace[i][1]) {
      cur = searchSpace[i][1];
    }
    return cur;
  }));
};


/**
 * Create scout bees
 * @param  {[[]]} searchSpace
 * @param  {Integer} numberOfScouts
 * @return {Bee[]}
 */

createScoutBees = function(searchSpace, numberOfScouts) {
  var i, _results;
  i = numberOfScouts;
  _results = [];
  while (i--) {
    _results.push(createRandomBee(searchSpace));
  }
  return _results;
};


/**
 * Search neighbor bees
 * @param  {Bee} parent
 * @param  {Integer} neighborSize
 * @param  {Integer} patchSize
 * @param  {[[]]} searchSpace
 * @return {Bee}
 */

searchNeighborBees = function(parent, neighborSize, patchSize, searchSpace) {
  var bee, i, neighborBees;
  i = patchSize;
  neighborBees = [];
  while (i--) {
    bee = createNeighborBee(parent.vector, patchSize, searchSpace);
    bee.fitness = objectiveFn(bee.vector);
    neighborBees.push(bee);
  }
  return (neighborBees.sort(function(a, b) {
    return a - b;
  }))[0];
};


/**
 * Search
 * @param  {Integer} maxGens
 * @param  {[[]]} searchSpace
 * @param  {Integer} numberOfBees
 * @param  {Integer} numberOfSites
 * @param  {Integer} eliteSites
 * @param  {Integer} patchSize
 * @param  {Integer} eliteBees
 * @param  {Integer} otherBees
 * @return {Bee}
 */

search = function(maxGens, searchSpace, numberOfBees, numberOfSites, eliteSites, patchSize, eliteBees, otherBees) {
  var best, i, j, k, nextGen, population, scoutBees;
  best = null;
  i = numberOfBees;
  j = maxGens;
  population = [];
  while (i--) {
    population.push(createRandomBee(searchSpace));
  }
  while (j--) {
    population.forEach(function(cur) {
      return cur.fitness = objectiveFn(cur.vector);
    });
    population.sort(function(a, b) {
      return a.fitness - b.fitness;
    });
    if (!best || population[0].fitness < best.fitness) {
      best = population[0];
    }
    nextGen = [];
    k = numberOfSites;
    while (k--) {
      nextGen.push(searchNeighborBees(parent, (i < eliteSites ? eliteBees : otherBees), patchSize, searchSpace));
    }
    scoutBees = createScoutBees(searchSpace, numberOfBees - numberOfSites);
    population = nextGen.concat(scoutBees);
    patchSize = patchSize * 0.95;
  }
  return best;
};

module.exports = search;


},{"../../util/randomVector.coffee":9}],5:[function(require,module,exports){
exports.bees = require('./bees.coffee');


},{"./bees.coffee":4}],6:[function(require,module,exports){
var ai;

ai = {
  version: '0.0.1'
};

ai.bio = require('./bio/index.coffee');

ai.ml = require('./ml/index.coffee');

ai.util = require('./util/index.coffee');

if (typeof define === 'function' && define.amd) {
  define(ai);
} else if (typeof module === 'object' && module.exports) {
  module.exports = ai;
}

this.ai = ai;


},{"./bio/index.coffee":1,"./ml/index.coffee":7,"./util/index.coffee":8}],7:[function(require,module,exports){



},{}],8:[function(require,module,exports){
exports.randVector = require('./randomVector.coffee');


},{"./randomVector.coffee":9}],9:[function(require,module,exports){

/**
 * Create a random vector
 * @param  {[[]]} mm minmax
 * @return {[]}
 */
var randomVector;

randomVector = function(minmax) {
  return minmax.map(function(cur) {
    return cur[0] + ((cur[1] - cur[0]) * Math.random());
  });
};

module.exports = randomVector;


},{}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL210cmF5bmhhbS9Eb2N1bWVudHMvRGlnaXRhbHNtaXRocy9KYXZhL2FpL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9tdHJheW5oYW0vRG9jdW1lbnRzL0RpZ2l0YWxzbWl0aHMvSmF2YS9haS9zcmMvYmlvL2luZGV4LmNvZmZlZSIsIi9ob21lL210cmF5bmhhbS9Eb2N1bWVudHMvRGlnaXRhbHNtaXRocy9KYXZhL2FpL3NyYy9iaW8vbmV1cmFsL2JhY2tQcm9wYWdhdGlvbi5jb2ZmZWUiLCIvaG9tZS9tdHJheW5oYW0vRG9jdW1lbnRzL0RpZ2l0YWxzbWl0aHMvSmF2YS9haS9zcmMvYmlvL25ldXJhbC9pbmRleC5jb2ZmZWUiLCIvaG9tZS9tdHJheW5oYW0vRG9jdW1lbnRzL0RpZ2l0YWxzbWl0aHMvSmF2YS9haS9zcmMvYmlvL3N3YXJtL2JlZXMuY29mZmVlIiwiL2hvbWUvbXRyYXluaGFtL0RvY3VtZW50cy9EaWdpdGFsc21pdGhzL0phdmEvYWkvc3JjL2Jpby9zd2FybS9pbmRleC5jb2ZmZWUiLCIvaG9tZS9tdHJheW5oYW0vRG9jdW1lbnRzL0RpZ2l0YWxzbWl0aHMvSmF2YS9haS9zcmMvaW5kZXguY29mZmVlIiwiL2hvbWUvbXRyYXluaGFtL0RvY3VtZW50cy9EaWdpdGFsc21pdGhzL0phdmEvYWkvc3JjL21sL2luZGV4LmNvZmZlZSIsIi9ob21lL210cmF5bmhhbS9Eb2N1bWVudHMvRGlnaXRhbHNtaXRocy9KYXZhL2FpL3NyYy91dGlsL2luZGV4LmNvZmZlZSIsIi9ob21lL210cmF5bmhhbS9Eb2N1bWVudHMvRGlnaXRhbHNtaXRocy9KYXZhL2FpL3NyYy91dGlsL3JhbmRvbVZlY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxPQUFPLENBQUMsTUFBUixHQUFpQixPQUFBLENBQVEsdUJBQVIsQ0FBakIsQ0FBQTs7QUFBQSxPQUNPLENBQUMsS0FBUixHQUFnQixPQUFBLENBQVEsc0JBQVIsQ0FEaEIsQ0FBQTs7OztBQ0FBLElBQUEseU5BQUE7O0FBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxnQ0FBUixDQUFmLENBQUE7O0FBQUE7QUFHaUIsRUFBQSxnQkFBRSxPQUFGLEVBQVksVUFBWixHQUFBO0FBQXlCLElBQXhCLElBQUMsQ0FBQSxVQUFBLE9BQXVCLENBQUE7QUFBQSxJQUFkLElBQUMsQ0FBQSxhQUFBLFVBQWEsQ0FBekI7RUFBQSxDQUFiOztnQkFBQTs7SUFISixDQUFBOztBQUtBO0FBQUE7Ozs7R0FMQTs7QUFBQSxXQVVBLEdBQWMsU0FBQyxlQUFELEdBQUE7QUFDVixNQUFBLFNBQUE7QUFBQSxFQUFBLENBQUEsR0FBSSxlQUFKLENBQUE7QUFBQSxFQUNBLE1BQUEsR0FBUyxFQURULENBQUE7QUFFQSxTQUFNLENBQUEsRUFBTixHQUFBO0FBQ0ksSUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLENBQUMsQ0FBQSxJQUFLLENBQUMsTUFBTCxDQUFBLENBQUYsRUFBaUIsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFqQixDQUFaLENBQUEsQ0FESjtFQUFBLENBRkE7U0FJQSxZQUFBLENBQWEsTUFBYixFQUxVO0FBQUEsQ0FWZCxDQUFBOztBQWlCQTtBQUFBOzs7OztHQWpCQTs7QUFBQSxRQXVCQSxHQUFXLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtTQUNQLE1BQU0sQ0FBQyxNQUFQLENBQWMsU0FBQyxJQUFELEVBQU8sR0FBUCxFQUFZLENBQVosR0FBQTtXQUNWLElBQUEsSUFBUSxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWEsSUFEWDtFQUFBLENBQWQsRUFFRSxHQUZGLEVBRE87QUFBQSxDQXZCWCxDQUFBOztBQTRCQTtBQUFBOzs7O0dBNUJBOztBQUFBLFFBaUNBLEdBQVcsU0FBQyxVQUFELEdBQUE7U0FBZ0IsR0FBQSxHQUFNLENBQUMsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQSxVQUFULENBQVAsRUFBdEI7QUFBQSxDQWpDWCxDQUFBOztBQW1DQTtBQUFBOzs7O0dBbkNBOztBQUFBLGtCQXdDQSxHQUFxQixTQUFDLE1BQUQsR0FBQTtTQUFZLE1BQUEsR0FBUyxDQUFDLEdBQUEsR0FBTSxNQUFQLEVBQXJCO0FBQUEsQ0F4Q3JCLENBQUE7O0FBMENBO0FBQUE7Ozs7O0dBMUNBOztBQUFBLGdCQWdEQSxHQUFtQixTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDZixFQUFBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFNBQUMsS0FBRCxFQUFRLENBQVIsR0FBQTtBQUNaLFFBQUEsS0FBQTtBQUFBLElBQUEsS0FBQSxHQUFXLENBQUEsS0FBSyxDQUFSLEdBQWUsTUFBZixHQUEyQixPQUFRLENBQUEsQ0FBQSxHQUFJLENBQUosQ0FBTSxDQUFDLEdBQWYsQ0FBbUIsU0FBQyxNQUFELEdBQUE7YUFBWSxNQUFNLENBQUMsT0FBbkI7SUFBQSxDQUFuQixDQUFuQyxDQUFBO1dBQ0EsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLE1BQUQsR0FBQTtBQUNWLE1BQUEsTUFBTSxDQUFDLFVBQVAsR0FBb0IsUUFBQSxDQUFTLE1BQU0sQ0FBQyxPQUFoQixFQUF5QixLQUF6QixDQUFwQixDQUFBO2FBQ0EsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsUUFBQSxDQUFTLE1BQU0sQ0FBQyxVQUFoQixFQUZOO0lBQUEsQ0FBZCxFQUZZO0VBQUEsQ0FBaEIsQ0FBQSxDQUFBO1NBS0EsT0FBUSxDQUFBLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQWpCLENBQW9CLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FOaEI7QUFBQSxDQWhEbkIsQ0FBQTs7QUF3REE7QUFBQTs7OztHQXhEQTs7QUFBQSxzQkE2REEsR0FBeUIsU0FBQyxPQUFELEVBQVUsY0FBVixHQUFBO0FBQ3JCLE1BQUEsMEJBQUE7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFPLENBQUMsTUFBWixDQUFBO0FBQ0E7U0FBTSxDQUFBLEVBQU4sR0FBQTtBQUNJLElBQUEsSUFBRyxDQUFBLEtBQUssT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBekI7QUFDSSxNQUFBLE1BQUEsR0FBUyxPQUFRLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFwQixDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsY0FBQSxHQUFpQixNQUFNLENBQUMsTUFEaEMsQ0FBQTtBQUFBLG9CQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsS0FBQSxHQUFRLGtCQUFBLENBQW1CLE1BQU0sQ0FBQyxNQUExQixFQUZ2QixDQURKO0tBQUEsTUFBQTtvQkFLSSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBWCxDQUFtQixTQUFDLE1BQUQsRUFBUyxDQUFULEdBQUE7ZUFDZixNQUFNLENBQUMsS0FBUCxHQUFlLGtCQUFBLENBQW1CLE1BQU0sQ0FBQyxNQUExQixDQUFBLEdBQ1gsT0FBUSxDQUFBLENBQUEsR0FBSSxDQUFKLENBQU0sQ0FBQyxNQUFmLENBQXNCLFNBQUMsSUFBRCxFQUFPLFVBQVAsR0FBQTtpQkFDbEIsQ0FBQSxJQUFLLFVBQVUsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFuQixHQUF3QixVQUFVLENBQUMsTUFEdEI7UUFBQSxDQUF0QixFQUVFLENBRkYsRUFGVztNQUFBLENBQW5CLEdBTEo7S0FESjtFQUFBLENBQUE7a0JBRnFCO0FBQUEsQ0E3RHpCLENBQUE7O0FBMkVBO0FBQUE7Ozs7R0EzRUE7O0FBQUEsbUNBZ0ZBLEdBQXNDLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtTQUNsQyxPQUFPLENBQUMsT0FBUixDQUFnQixTQUFDLEtBQUQsRUFBUSxDQUFSLEdBQUE7QUFDWixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBVyxDQUFBLEtBQUssQ0FBUixHQUFlLE1BQWYsR0FBMkIsT0FBUSxDQUFBLENBQUEsR0FBSSxDQUFKLENBQU0sQ0FBQyxHQUFmLENBQW1CLFNBQUMsTUFBRCxFQUFTLENBQVQsR0FBQTthQUFlLE9BQVEsQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBakM7SUFBQSxDQUFuQixDQUFuQyxDQUFBO1dBQ0EsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLE1BQUQsR0FBQTtBQUNWLE1BQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLE1BQUQsRUFBUyxDQUFULEdBQUE7ZUFDVixNQUFNLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBYixJQUFtQixNQUFNLENBQUMsS0FBUCxHQUFlLE9BRHhCO01BQUEsQ0FBZCxDQUFBLENBQUE7YUFFQSxNQUFNLENBQUMsS0FBTSxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBYixHQUFzQixDQUF0QixDQUFiLElBQXlDLE1BQU0sQ0FBQyxNQUh0QztJQUFBLENBQWQsRUFGWTtFQUFBLENBQWhCLEVBRGtDO0FBQUEsQ0FoRnRDLENBQUE7O0FBd0ZBO0FBQUE7Ozs7O0dBeEZBOztBQUFBLGFBOEZBLEdBQWdCLFNBQUMsT0FBRCxFQUFVLEtBQVYsRUFBaUIsUUFBakIsR0FBQTtBQUNaLEVBQUEsUUFBQSxHQUFXLFFBQUEsSUFBWSxHQUF2QixDQUFBO1NBQ0EsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBQyxLQUFELEdBQUE7V0FDWixLQUFLLENBQUMsT0FBTixDQUFjLFNBQUMsTUFBRCxHQUFBO2FBQ1YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFmLENBQXVCLFNBQUMsTUFBRCxFQUFTLENBQVQsR0FBQTtBQUNuQixZQUFBLEtBQUE7QUFBQSxRQUFBLEtBQUEsR0FBUSxLQUFBLEdBQVEsTUFBTSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXJCLEdBQTBCLE1BQU0sQ0FBQyxTQUFVLENBQUEsQ0FBQSxDQUFqQixHQUFzQixRQUF4RCxDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBZixJQUFxQixLQURyQixDQUFBO0FBQUEsUUFFQSxNQUFNLENBQUMsU0FBVSxDQUFBLENBQUEsQ0FBakIsR0FBc0IsS0FGdEIsQ0FBQTtlQUdBLE1BQU0sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFiLEdBQWtCLElBSkM7TUFBQSxDQUF2QixFQURVO0lBQUEsQ0FBZCxFQURZO0VBQUEsQ0FBaEIsRUFGWTtBQUFBLENBOUZoQixDQUFBOztBQXdHQTtBQUFBOzs7Ozs7O0dBeEdBOztBQUFBLFlBZ0hBLEdBQWUsU0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixjQUFsQixFQUFrQyxVQUFsQyxFQUE4QyxLQUE5QyxHQUFBO0FBQ1gsTUFBQSxXQUFBO0FBQUEsRUFBQSxDQUFBLEdBQUksVUFBSixDQUFBO0FBQ0E7U0FBTSxDQUFBLEVBQU4sR0FBQTtBQUNJLElBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxTQUFDLE9BQUQsR0FBQTtBQUVYLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLGdCQUFBLENBQWlCLE9BQWpCLEVBQTBCLE1BQTFCLENBQVQsQ0FBQTtBQUFBLE1BQ0Esc0JBQUEsQ0FBdUIsT0FBTyxDQUFFLFFBQWhDLENBREEsQ0FBQTthQUVBLG1DQUFBLENBQW9DLE9BQXBDLEVBQTZDLE1BQTdDLEVBSlc7SUFBQSxDQUFmLENBQUEsQ0FBQTtBQUFBLGtCQUtBLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLEtBQXZCLEVBTEEsQ0FESjtFQUFBLENBQUE7a0JBRlc7QUFBQSxDQWhIZixDQUFBOztBQTBIQTtBQUFBOzs7Ozs7R0ExSEE7O0FBQUEsV0FpSUEsR0FBYyxTQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLGNBQWxCLEdBQUE7QUFDVixNQUFBLE9BQUE7QUFBQSxFQUFBLE9BQUEsR0FBVSxDQUFWLENBQUE7QUFBQSxFQUNBLE1BQU0sQ0FBQyxPQUFQLENBQWUsU0FBQyxPQUFELEdBQUE7QUFFWCxRQUFBLE1BQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxnQkFBQSxDQUFpQixPQUFqQixFQUEwQixXQUExQixDQUFULENBQUE7QUFDQSxJQUFBLElBQWdCLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLE9BQVEsQ0FBQSxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFqQixDQUF4QzthQUFBLE9BQUEsSUFBVyxFQUFYO0tBSFc7RUFBQSxDQUFmLENBREEsQ0FBQTtTQUtBLFFBTlU7QUFBQSxDQWpJZCxDQUFBOztBQXlJQTtBQUFBOzs7O0dBeklBOztBQUFBLFlBOElBLEdBQWUsU0FBQyxjQUFELEdBQUE7U0FDUCxJQUFBLE1BQUEsQ0FBTyxXQUFBLENBQVksY0FBQSxHQUFpQixDQUE3QixDQUFQLEVBRE87QUFBQSxDQTlJZixDQUFBOztBQW9KQTtBQUFBOzs7Ozs7OztHQXBKQTs7QUFBQSxPQTZKQSxHQUFVLFNBQUMsTUFBRCxFQUFTLGNBQVQsRUFBeUIsVUFBekIsRUFBcUMsYUFBckMsRUFBb0QsS0FBcEQsR0FBQTtBQUNOLE1BQUEsVUFBQTtBQUFBLEVBQUEsT0FBQSxHQUFVLEVBQVYsQ0FBQTtBQUFBLEVBQ0EsQ0FBQSxHQUFJLGFBREosQ0FBQTtBQUVBLFNBQU0sQ0FBQSxFQUFOLEdBQUE7QUFDSSxJQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsWUFBQSxDQUFhLGNBQWIsQ0FBYixDQUFBLENBREo7RUFBQSxDQUZBO0FBQUEsRUFJQSxPQUFPLENBQUMsSUFBUixDQUFhLFlBQUEsQ0FBYSxPQUFRLENBQUEsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBakIsQ0FBbUIsQ0FBQyxNQUF6QyxDQUFiLENBSkEsQ0FBQTtBQUFBLEVBS0EsWUFBQSxDQUFhLE9BQWIsRUFBc0IsTUFBdEIsRUFBOEIsY0FBOUIsRUFBOEMsVUFBOUMsRUFBMEQsS0FBMUQsQ0FMQSxDQUFBO0FBQUEsRUFNQSxXQUFBLENBQVksT0FBWixFQUFxQixNQUFyQixFQUE2QixjQUE3QixDQU5BLENBQUE7U0FPQSxRQVJNO0FBQUEsQ0E3SlYsQ0FBQTs7QUFBQSxNQXVLTSxDQUFDLE9BQVAsR0FBaUIsT0F2S2pCLENBQUE7Ozs7QUNBQSxPQUFPLENBQUMsZUFBUixHQUEwQixPQUFBLENBQVEsMEJBQVIsQ0FBMUIsQ0FBQTs7OztBQ0FBO0FBQUE7O0dBQUE7QUFBQSxJQUFBLCtHQUFBOztBQUFBLFlBSUEsR0FBZSxPQUFBLENBQVEsZ0NBQVIsQ0FKZixDQUFBOztBQUFBO0FBT2lCLEVBQUEsYUFBRSxNQUFGLEVBQVcsT0FBWCxHQUFBO0FBQXFCLElBQXBCLElBQUMsQ0FBQSxTQUFBLE1BQW1CLENBQUE7QUFBQSxJQUFYLElBQUMsQ0FBQSxVQUFBLE9BQVUsQ0FBckI7RUFBQSxDQUFiOzthQUFBOztJQVBKLENBQUE7O0FBU0E7QUFBQTs7OztHQVRBOztBQUFBLFdBY0EsR0FBYyxTQUFDLE1BQUQsR0FBQTtTQUNWLE1BQU0sQ0FBQyxNQUFQLENBQWMsU0FBQyxJQUFELEVBQU8sR0FBUCxHQUFBO1dBQ1YsSUFBQSxHQUFPLEdBQUEsR0FBTSxFQURIO0VBQUEsQ0FBZCxFQUVFLENBRkYsRUFEVTtBQUFBLENBZGQsQ0FBQTs7QUFtQkE7QUFBQTs7OztHQW5CQTs7QUFBQSxlQXdCQSxHQUFrQixTQUFDLFdBQUQsR0FBQTtTQUFxQixJQUFBLEdBQUEsQ0FBSSxZQUFBLENBQWEsV0FBYixDQUFKLEVBQXJCO0FBQUEsQ0F4QmxCLENBQUE7O0FBMEJBO0FBQUE7Ozs7OztHQTFCQTs7QUFBQSxpQkFpQ0EsR0FBb0IsU0FBQyxJQUFELEVBQU8sU0FBUCxFQUFrQixXQUFsQixHQUFBO1NBQ1osSUFBQSxHQUFBLENBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFDLEdBQUQsRUFBTSxDQUFOLEdBQUE7QUFDYixJQUFBLEdBQUEsR0FBUyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsR0FBbkIsR0FBNEIsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixTQUFsRCxHQUFpRSxHQUFBLEdBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLFNBQTdGLENBQUE7QUFDQSxJQUFBLElBQTJCLEdBQUEsR0FBTSxXQUFZLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFoRDtBQUFBLE1BQUEsR0FBQSxHQUFNLFdBQVksQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQXJCLENBQUE7S0FEQTtBQUVBLElBQUEsSUFBMkIsR0FBQSxHQUFNLFdBQVksQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWhEO0FBQUEsTUFBQSxHQUFBLEdBQU0sV0FBWSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBckIsQ0FBQTtLQUZBO1dBR0EsSUFKYTtFQUFBLENBQVQsQ0FBSixFQURZO0FBQUEsQ0FqQ3BCLENBQUE7O0FBeUNBO0FBQUE7Ozs7O0dBekNBOztBQUFBLGVBK0NBLEdBQWtCLFNBQUMsV0FBRCxFQUFjLGNBQWQsR0FBQTtBQUNkLE1BQUEsV0FBQTtBQUFBLEVBQUEsQ0FBQSxHQUFJLGNBQUosQ0FBQTtBQUNBO1NBQU0sQ0FBQSxFQUFOLEdBQUE7QUFDSSxrQkFBQSxlQUFBLENBQWdCLFdBQWhCLEVBQUEsQ0FESjtFQUFBLENBQUE7a0JBRmM7QUFBQSxDQS9DbEIsQ0FBQTs7QUFvREE7QUFBQTs7Ozs7OztHQXBEQTs7QUFBQSxrQkE0REEsR0FBcUIsU0FBQyxNQUFELEVBQVMsWUFBVCxFQUF1QixTQUF2QixFQUFrQyxXQUFsQyxHQUFBO0FBQ2pCLE1BQUEsb0JBQUE7QUFBQSxFQUFBLENBQUEsR0FBSSxTQUFKLENBQUE7QUFBQSxFQUNBLFlBQUEsR0FBZSxFQURmLENBQUE7QUFFQSxTQUFNLENBQUEsRUFBTixHQUFBO0FBQ0ksSUFBQSxHQUFBLEdBQU0saUJBQUEsQ0FBa0IsTUFBTSxDQUFDLE1BQXpCLEVBQWlDLFNBQWpDLEVBQTRDLFdBQTVDLENBQU4sQ0FBQTtBQUFBLElBQ0EsR0FBRyxDQUFDLE9BQUosR0FBYyxXQUFBLENBQVksR0FBRyxDQUFDLE1BQWhCLENBRGQsQ0FBQTtBQUFBLElBRUEsWUFBWSxDQUFDLElBQWIsQ0FBa0IsR0FBbEIsQ0FGQSxDQURKO0VBQUEsQ0FGQTtTQU1BLENBQUMsWUFBWSxDQUFDLElBQWIsQ0FBa0IsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO1dBQVUsQ0FBQSxHQUFJLEVBQWQ7RUFBQSxDQUFsQixDQUFELENBQW9DLENBQUEsQ0FBQSxFQVBuQjtBQUFBLENBNURyQixDQUFBOztBQXFFQTtBQUFBOzs7Ozs7Ozs7OztHQXJFQTs7QUFBQSxNQWlGQSxHQUFTLFNBQUMsT0FBRCxFQUFVLFdBQVYsRUFBdUIsWUFBdkIsRUFBcUMsYUFBckMsRUFBb0QsVUFBcEQsRUFBZ0UsU0FBaEUsRUFBMkUsU0FBM0UsRUFBc0YsU0FBdEYsR0FBQTtBQUNMLE1BQUEsNkNBQUE7QUFBQSxFQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxFQUNBLENBQUEsR0FBSSxZQURKLENBQUE7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUZKLENBQUE7QUFBQSxFQUdBLFVBQUEsR0FBYSxFQUhiLENBQUE7QUFJQSxTQUFNLENBQUEsRUFBTixHQUFBO0FBQ0ksSUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixlQUFBLENBQWdCLFdBQWhCLENBQWhCLENBQUEsQ0FESjtFQUFBLENBSkE7QUFNQSxTQUFNLENBQUEsRUFBTixHQUFBO0FBQ0ksSUFBQSxVQUFVLENBQUMsT0FBWCxDQUFtQixTQUFDLEdBQUQsR0FBQTthQUFTLEdBQUcsQ0FBQyxPQUFKLEdBQWMsV0FBQSxDQUFZLEdBQUcsQ0FBQyxNQUFoQixFQUF2QjtJQUFBLENBQW5CLENBQUEsQ0FBQTtBQUFBLElBQ0EsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO2FBQVUsQ0FBQyxDQUFDLE9BQUYsR0FBWSxDQUFDLENBQUMsUUFBeEI7SUFBQSxDQUFoQixDQURBLENBQUE7QUFFQSxJQUFBLElBQXdCLENBQUEsSUFBQSxJQUFTLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFkLEdBQXdCLElBQUksQ0FBQyxPQUE5RDtBQUFBLE1BQUEsSUFBQSxHQUFPLFVBQVcsQ0FBQSxDQUFBLENBQWxCLENBQUE7S0FGQTtBQUFBLElBR0EsT0FBQSxHQUFVLEVBSFYsQ0FBQTtBQUFBLElBSUEsQ0FBQSxHQUFJLGFBSkosQ0FBQTtBQUtBLFdBQU0sQ0FBQSxFQUFOLEdBQUE7QUFDSSxNQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsQ0FBSSxDQUFBLEdBQUksVUFBUCxHQUF1QixTQUF2QixHQUFzQyxTQUF2QyxDQUEzQixFQUNQLFNBRE8sRUFDSSxXQURKLENBQWIsQ0FBQSxDQURKO0lBQUEsQ0FMQTtBQUFBLElBUUEsU0FBQSxHQUFZLGVBQUEsQ0FBZ0IsV0FBaEIsRUFBOEIsWUFBQSxHQUFlLGFBQTdDLENBUlosQ0FBQTtBQUFBLElBU0EsVUFBQSxHQUFhLE9BQU8sQ0FBQyxNQUFSLENBQWUsU0FBZixDQVRiLENBQUE7QUFBQSxJQVVBLFNBQUEsR0FBWSxTQUFBLEdBQVksSUFWeEIsQ0FESjtFQUFBLENBTkE7U0FrQkEsS0FuQks7QUFBQSxDQWpGVCxDQUFBOztBQUFBLE1Bc0dNLENBQUMsT0FBUCxHQUFpQixNQXRHakIsQ0FBQTs7OztBQ0FBLE9BQU8sQ0FBQyxJQUFSLEdBQWUsT0FBQSxDQUFRLGVBQVIsQ0FBZixDQUFBOzs7O0FDQUEsSUFBQSxFQUFBOztBQUFBLEVBQUEsR0FDSTtBQUFBLEVBQUEsT0FBQSxFQUFTLE9BQVQ7Q0FESixDQUFBOztBQUFBLEVBR0UsQ0FBQyxHQUFILEdBQVMsT0FBQSxDQUFRLG9CQUFSLENBSFQsQ0FBQTs7QUFBQSxFQUlFLENBQUMsRUFBSCxHQUFRLE9BQUEsQ0FBUSxtQkFBUixDQUpSLENBQUE7O0FBQUEsRUFLRSxDQUFDLElBQUgsR0FBVSxPQUFBLENBQVEscUJBQVIsQ0FMVixDQUFBOztBQU9BLElBQUcsTUFBQSxDQUFBLE1BQUEsS0FBaUIsVUFBakIsSUFBZ0MsTUFBTSxDQUFDLEdBQTFDO0FBQ0ksRUFBQSxNQUFBLENBQU8sRUFBUCxDQUFBLENBREo7Q0FBQSxNQUVLLElBQUcsTUFBQSxDQUFBLE1BQUEsS0FBaUIsUUFBakIsSUFBNkIsTUFBTSxDQUFDLE9BQXZDO0FBQ0QsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixFQUFqQixDQURDO0NBVEw7O0FBQUEsSUFXQyxDQUFBLEVBQUQsR0FBTSxFQVhOLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7O0FDRkEsT0FBTyxDQUFDLFVBQVIsR0FBcUIsT0FBQSxDQUFRLHVCQUFSLENBQXJCLENBQUE7Ozs7QUNBQTtBQUFBOzs7O0dBQUE7QUFBQSxJQUFBLFlBQUE7O0FBQUEsWUFLQSxHQUFlLFNBQUMsTUFBRCxHQUFBO1NBQVksTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLEdBQUQsR0FBQTtXQUFTLEdBQUksQ0FBQSxDQUFBLENBQUosR0FBUyxDQUFDLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFTLEdBQUksQ0FBQSxDQUFBLENBQWQsQ0FBQSxHQUFvQixJQUFJLENBQUMsTUFBTCxDQUFBLENBQXJCLEVBQWxCO0VBQUEsQ0FBWCxFQUFaO0FBQUEsQ0FMZixDQUFBOztBQUFBLE1BT00sQ0FBQyxPQUFQLEdBQWlCLFlBUGpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0cy5uZXVyYWwgPSByZXF1aXJlICcuL25ldXJhbC9pbmRleC5jb2ZmZWUnXG5leHBvcnRzLnN3YXJtID0gcmVxdWlyZSAnLi9zd2FybS9pbmRleC5jb2ZmZWUnIiwicmFuZG9tVmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9yYW5kb21WZWN0b3IuY29mZmVlJylcblxuY2xhc3MgTmV1cm9uXG4gICAgY29uc3RydWN0b3I6IChAd2VpZ2h0cywgQGFjdGl2YXRpb24pIC0+XG5cbiMjIypcbiAqIEluaXRpYWxpemUgd2VpZ2h0c1xuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZXZWlnaHRzXG4gKiBAcmV0dXJuIHtbXX1cbiMjI1xuaW5pdFdlaWdodHMgPSAobnVtYmVyT2ZXZWlnaHRzKSAtPlxuICAgIGkgPSBudW1iZXJPZldlaWdodHNcbiAgICBtaW5tYXggPSBbXVxuICAgIHdoaWxlIGktLVxuICAgICAgICBtaW5tYXgucHVzaCBbLU1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCldXG4gICAgcmFuZG9tVmVjdG9yKG1pbm1heClcblxuIyMjKlxuICogQWN0aXZhdGVcbiAqIEBwYXJhbSAge1tdfSB3ZWlnaHRzXG4gKiBAcGFyYW0gIHtbXX0gdmVjdG9yXG4gKiBAcmV0dXJuIHtGbG9hdH1cbiMjI1xuYWN0aXZhdGUgPSAod2VpZ2h0cywgdmVjdG9yKSAtPlxuICAgIHZlY3Rvci5yZWR1Y2UgKHByZXYsIGN1ciwgaSkgLT5cbiAgICAgICAgcHJldiArPSB3ZWlnaHRzW2ldICogY3VyXG4gICAgLCAwLjBcblxuIyMjKlxuICogVHJhbnNmZXJcbiAqIEBwYXJhbSAge0Zsb2F0fSBhY3RpdmF0aW9uXG4gKiBAcmV0dXJuIHtGbG9hdH1cbiMjI1xudHJhbnNmZXIgPSAoYWN0aXZhdGlvbikgLT4gMS4wIC8gKDEuMCArIE1hdGguZXhwKC1hY3RpdmF0aW9uKSlcblxuIyMjKlxuICogVHJhbnNmZXIgZGVyaXZhdGl2ZVxuICogQHBhcmFtICB7RmxvYXR9IG91dHB1dFxuICogQHJldHVybiB7RmxvYXR9XG4jIyNcbnRyYW5zZmVyRGVyaXZhdGl2ZSA9IChvdXRwdXQpIC0+IG91dHB1dCAqICgxLjAgLSBvdXRwdXQpXG5cbiMjIypcbiAqIEZvcndhcmQgcHJvcGFnYXRlXG4gKiBAcGFyYW0gIHtbW11dfSBuZXR3b3JrXG4gKiBAcGFyYW0gIHtbXX0gdmVjdG9yXG4gKiBAcmV0dXJuIHtGbG9hdH1cbiMjI1xuZm9yd2FyZFByb3BhZ2F0ZSA9IChuZXR3b3JrLCB2ZWN0b3IpIC0+XG4gICAgbmV0d29yay5mb3JFYWNoIChsYXllciwgaSkgLT5cbiAgICAgICAgaW5wdXQgPSBpZiBpID09IDAgdGhlbiB2ZWN0b3IgZWxzZSBuZXR3b3JrW2kgLSAxXS5tYXAgKG5ldXJvbikgLT4gbmV1cm9uLm91dHB1dFxuICAgICAgICBsYXllci5mb3JFYWNoIChuZXVyb24pIC0+XG4gICAgICAgICAgICBuZXVyb24uYWN0aXZhdGlvbiA9IGFjdGl2YXRlKG5ldXJvbi53ZWlnaHRzLCBpbnB1dClcbiAgICAgICAgICAgIG5ldXJvbi5vdXRwdXQgPSB0cmFuc2ZlcihuZXVyb24uYWN0aXZhdGlvbilcbiAgICBuZXR3b3JrW25ldHdvcmsubGVuZ3RoIC0gMV1bMF0ub3V0cHV0XG5cbiMjIypcbiAqIEJhY2sgcHJvcGFwYXRlIGVycm9yXG4gKiBAcGFyYW0gIHtbW11dfSBuZXR3b3JrXG4gKiBAcGFyYW0gIHtGbG9hdH0gZXhwZWN0ZWRPdXRwdXRcbiMjI1xuYmFja3dhcmRQcm9wYWdhdGVFcnJvciA9IChuZXR3b3JrLCBleHBlY3RlZE91dHB1dCkgLT5cbiAgICBpID0gbmV0d29yay5sZW5ndGhcbiAgICB3aGlsZSBpLS1cbiAgICAgICAgaWYgaSA9PSBuZXR3b3JrLmxlbmd0aCAtIDFcbiAgICAgICAgICAgIG5ldXJvbiA9IG5ldHdvcmtbaV1bMF1cbiAgICAgICAgICAgIGVycm9yID0gZXhwZWN0ZWRPdXRwdXQgLSBuZXVyb24ub3V0cHV0XG4gICAgICAgICAgICBuZXVyb24uZGVsdGEgPSBlcnJvciAqIHRyYW5zZmVyRGVyaXZhdGl2ZShuZXVyb24ub3V0cHV0KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBuZXR3b3JrW2ldLmZvckVhY2ggKG5ldXJvbiwgaikgLT5cbiAgICAgICAgICAgICAgICBuZXVyb24uZGVsdGEgPSB0cmFuc2ZlckRlcml2YXRpdmUobmV1cm9uLm91dHB1dCkgKlxuICAgICAgICAgICAgICAgICAgICBuZXR3b3JrW2kgKyAxXS5yZWR1Y2UgKHByZXYsIG5leHROZXVyb24pIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBwICs9IG5leHROZXVyb24ud2VpZ2h0c1tqXSAqIG5leHROZXVyb24uZGVsdGFcbiAgICAgICAgICAgICAgICAgICAgLCAwXG5cbiMjIypcbiAqIENhbGN1bGF0ZSBlcnJvciBkZXJpdmF0aXZlcyBmb3Igd2VpZ2h0c1xuICogQHBhcmFtICB7W1tdXX0gbmV0d29ya1xuICogQHBhcmFtICB7W119IHZlY3RvclxuIyMjXG5jYWxjdWxhdGVFcnJvckRlcml2YXRpdmVzRm9yV2VpZ2h0cyA9IChuZXR3b3JrLCB2ZWN0b3IpIC0+XG4gICAgbmV0d29yay5mb3JFYWNoIChsYXllciwgaSkgLT5cbiAgICAgICAgaW5wdXQgPSBpZiBpID09IDAgdGhlbiB2ZWN0b3IgZWxzZSBuZXR3b3JrW2kgLSAxXS5tYXAgKG5ldXJvbiwgaikgLT4gbmV0d29ya1tpIC0gMV1bal0ub3V0cHV0XG4gICAgICAgIGxheWVyLmZvckVhY2ggKG5ldXJvbikgLT5cbiAgICAgICAgICAgIGlucHV0LmZvckVhY2ggKHNpZ25hbCwgaikgLT5cbiAgICAgICAgICAgICAgICBuZXVyb24uZGVyaXZbal0gKz0gbmV1cm9uLmRlbHRhICogc2lnbmFsXG4gICAgICAgICAgICBuZXVyb24uZGVyaXZbbmV1cm9uLmRlcml2Lmxlbmd0aCAtIDFdICs9IG5ldXJvbi5kZWx0YVxuXG4jIyMqXG4gKiBVcGRhdGUgdGhlIHdlaWdodHNcbiAqIEBwYXJhbSAge1tbXV19IG5ldHdvcmtcbiAqIEBwYXJhbSAge0Zsb2F0fSBscmF0ZVxuICogQHBhcmFtICB7RmxvYXR9IG1vbWVudHVtXG4jIyNcbnVwZGF0ZVdlaWdodHMgPSAobmV0d29yaywgbHJhdGUsIG1vbWVudHVtKSAtPlxuICAgIG1vbWVudHVtID0gbW9tZW50dW0gfHwgMC44XG4gICAgbmV0d29yay5mb3JFYWNoIChsYXllcikgLT5cbiAgICAgICAgbGF5ZXIuZm9yRWFjaCAobmV1cm9uKSAtPlxuICAgICAgICAgICAgbmV1cm9uLndlaWdodHMuZm9yRWFjaCAod2VpZ2h0LCBpKSAtPlxuICAgICAgICAgICAgICAgIGRlbHRhID0gbHJhdGUgKiBuZXVyb24uZGVyaXZbaV0gKyBuZXVyb24ubGFzdERlbHRhW2ldICogbW9tZW50dW1cbiAgICAgICAgICAgICAgICBuZXVyb24ud2VpZ2h0c1tpXSArPSBkZWx0YVxuICAgICAgICAgICAgICAgIG5ldXJvbi5sYXN0RGVsdGFbaV0gPSBkZWx0YVxuICAgICAgICAgICAgICAgIG5ldXJvbi5kZXJpdltpXSA9IDAuMFxuXG4jIyMqXG4gKiBUcmFpbiB0aGUgbmV0d29ya1xuICogQHBhcmFtICB7W1tdXX0gbmV0d29ya1xuICogQHBhcmFtICB7W119IGRvbWFpblxuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZJbnB1dHNcbiAqIEBwYXJhbSAge0ludGVnZXJ9IGl0ZXJhdGlvbnNcbiAqIEBwYXJhbSAge0Zsb2F0fSBscmF0ZVxuIyMjXG50cmFpbk5ldHdvcmsgPSAobmV0d29yaywgZG9tYWluLCBudW1iZXJPZklucHV0cywgaXRlcmF0aW9ucywgbHJhdGUpIC0+XG4gICAgaSA9IGl0ZXJhdGlvbnNcbiAgICB3aGlsZSBpLS1cbiAgICAgICAgZG9tYWluLmZvckVhY2ggKHBhdHRlcm4pIC0+XG4gICAgICAgICAgICAjIFRPRE8gdmVjdG9yLGV4cGVjdGVkPUFycmF5Lm5ldyhudW1faW5wdXRzKXt8a3xwYXR0ZXJuW2tdLnRvX2Z9LHBhdHRlcm4ubGFzdFxuICAgICAgICAgICAgb3V0cHV0ID0gZm9yd2FyZFByb3BhZ2F0ZSBuZXR3b3JrLCB2ZWN0b3JcbiAgICAgICAgICAgIGJhY2t3YXJkUHJvcGFnYXRlRXJyb3IgbmV0d29yay4gZXhwZWN0ZWRcbiAgICAgICAgICAgIGNhbGN1bGF0ZUVycm9yRGVyaXZhdGl2ZXNGb3JXZWlnaHRzKG5ldHdvcmssIHZlY3RvcilcbiAgICAgICAgdXBkYXRlV2VpZ2h0cyhuZXR3b3JrLCBscmF0ZSlcblxuIyMjKlxuICogVGVzdCB0aGUgbmV0d29ya1xuICogQHBhcmFtICB7W1tdXX0gbmV0d29ya1xuICogQHBhcmFtICB7W119IGRvbWFpblxuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZJbnB1dHNcbiAqIEByZXR1cm4ge0ludGVnZXJ9XG4jIyNcbnRlc3ROZXR3b3JrID0gKG5ldHdvcmssIGRvbWFpbiwgbnVtYmVyT2ZJbnB1dHMpIC0+XG4gICAgY29ycmVjdCA9IDBcbiAgICBkb21haW4uZm9yRWFjaCAocGF0dGVybikgLT5cbiAgICAgICAgIyBUT0RPIGlucHV0X3ZlY3RvciA9IEFycmF5Lm5ldyhudW1faW5wdXRzKSB7fGt8IHBhdHRlcm5ba10udG9fZn1cbiAgICAgICAgb3V0cHV0ID0gZm9yd2FyZFByb3BhZ2F0ZShuZXR3b3JrLCBpbnB1dFZlY3RvcilcbiAgICAgICAgY29ycmVjdCArPSAxIGlmIG91dHB1dC5yb3VuZCA9PSBwYXR0ZXJuW3BhdHRlcm4ubGVuZ3RoIC0gMV1cbiAgICBjb3JyZWN0XG5cbiMjIypcbiAqIENyZWF0ZSBhIG5ldXJvblxuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZJbnB1dHNcbiAqIEByZXR1cm4ge05ldXJvbn1cbiMjI1xuY3JlYXRlTmV1cm9uID0gKG51bWJlck9mSW5wdXRzKSAtPlxuICAgIG5ldyBOZXVyb24oaW5pdFdlaWdodHMobnVtYmVyT2ZJbnB1dHMgKyAxKSlcbiAgICAjICAgcmV0dXJuIHs6d2VpZ2h0cz0+aW5pdGlhbGl6ZV93ZWlnaHRzKG51bV9pbnB1dHMrMSksXG4gICAgIyAgICAgICAgICAgOmxhc3RfZGVsdGE9PkFycmF5Lm5ldyhudW1faW5wdXRzKzEpezAuMH0sXG4gICAgIyAgICAgICAgICAgOmRlcml2PT5BcnJheS5uZXcobnVtX2lucHV0cysxKXswLjB9fVxuXG4jIyMqXG4gKiBFeGVjdXRlIGJhY2sgcHJvcGFnYXRpb25cbiAqIEBwYXJhbSAge1tdfSBkb21haW5cbiAqIEBwYXJhbSAge0ludGVnZXJ9IG51bWJlck9mSW5wdXRzXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBpdGVyYXRpb25zXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBudW1iZXJPZk5vZGVzXG4gKiBAcGFyYW0gIHtGbG9hdH0gbHJhdGVcbiAqIEByZXR1cm4ge1tbXV19XG4jIyNcbmV4ZWN1dGUgPSAoZG9tYWluLCBudW1iZXJPZklucHV0cywgaXRlcmF0aW9ucywgbnVtYmVyT2ZOb2RlcywgbHJhdGUpIC0+XG4gICAgbmV0d29yayA9IFtdXG4gICAgaSA9IG51bWJlck9mTm9kZXNcbiAgICB3aGlsZSBpLS1cbiAgICAgICAgbmV0d29yay5wdXNoIGNyZWF0ZU5ldXJvbihudW1iZXJPZklucHV0cylcbiAgICBuZXR3b3JrLnB1c2ggY3JlYXRlTmV1cm9uKG5ldHdvcmtbbmV0d29yay5sZW5ndGggLSAxXS5sZW5ndGgpXG4gICAgdHJhaW5OZXR3b3JrKG5ldHdvcmssIGRvbWFpbiwgbnVtYmVyT2ZJbnB1dHMsIGl0ZXJhdGlvbnMsIGxyYXRlKVxuICAgIHRlc3ROZXR3b3JrKG5ldHdvcmssIGRvbWFpbiwgbnVtYmVyT2ZJbnB1dHMpXG4gICAgbmV0d29ya1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZWN1dGUiLCJleHBvcnRzLmJhY2tQcm9wYWdhdGlvbiA9IHJlcXVpcmUgJy4vYmFja1Byb3BhZ2F0aW9uLmNvZmZlZSciLCIjIyNcbiMgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CZWVzX2FsZ29yaXRobVxuIyMjXG5cbnJhbmRvbVZlY3RvciA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvcmFuZG9tVmVjdG9yLmNvZmZlZScpXG5cbmNsYXNzIEJlZVxuICAgIGNvbnN0cnVjdG9yOiAoQHZlY3RvciwgQGZpdG5lc3MpIC0+XG5cbiMjIypcbiAqIE9iamVjdGl2ZSBmdW5jdGlvblxuICogQHBhcmFtICB7W119IHZlY3RvclxuICogQHJldHVybiB7W119XG4jIyNcbm9iamVjdGl2ZUZuID0gKHZlY3RvcikgLT5cbiAgICB2ZWN0b3IucmVkdWNlIChwcmV2LCBjdXIpIC0+XG4gICAgICAgIHByZXYgKyBjdXIgKiAyXG4gICAgLCAwXG5cbiMjIypcbiAqIENyZWF0ZSBhIHJhbmRvbSBiZWVcbiAqIEBwYXJhbSAge1tbXV19IHNlYXJjaFNwYWNlXG4gKiBAcmV0dXJuIHtCZWV9XG4jIyNcbmNyZWF0ZVJhbmRvbUJlZSA9IChzZWFyY2hTcGFjZSkgLT4gbmV3IEJlZShyYW5kb21WZWN0b3Ioc2VhcmNoU3BhY2UpKVxuXG4jIyMqXG4gKiBDcmVhdGUgYSBuZWlnaGJvciBiZWVcbiAqIEBwYXJhbSAge1tdfSBzaXRlXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBwYXRjaFNpemVcbiAqIEBwYXJhbSAge1tbXV19IHNlYXJjaFNwYWNlXG4gKiBAcmV0dXJuIHtCZWV9XG4jIyNcbmNyZWF0ZU5laWdoYm9yQmVlID0gKHNpdGUsIHBhdGNoU2l6ZSwgc2VhcmNoU3BhY2UpIC0+XG4gICAgbmV3IEJlZShzaXRlLm1hcCAoY3VyLCBpKSAtPlxuICAgICAgICBjdXIgPSBpZiBNYXRoLnJhbmRvbSgpIDwgMC41IHRoZW4gY3VyICsgTWF0aC5yYW5kb20oKSAqIHBhdGNoU2l6ZSBlbHNlIGN1ciAtIE1hdGgucmFuZG9tKCkgKiBwYXRjaFNpemVcbiAgICAgICAgY3VyID0gc2VhcmNoU3BhY2VbaV1bMF0gaWYgY3VyIDwgc2VhcmNoU3BhY2VbaV1bMF1cbiAgICAgICAgY3VyID0gc2VhcmNoU3BhY2VbaV1bMV0gaWYgY3VyID4gc2VhcmNoU3BhY2VbaV1bMV1cbiAgICAgICAgY3VyXG4gICAgKVxuXG4jIyMqXG4gKiBDcmVhdGUgc2NvdXQgYmVlc1xuICogQHBhcmFtICB7W1tdXX0gc2VhcmNoU3BhY2VcbiAqIEBwYXJhbSAge0ludGVnZXJ9IG51bWJlck9mU2NvdXRzXG4gKiBAcmV0dXJuIHtCZWVbXX1cbiMjI1xuY3JlYXRlU2NvdXRCZWVzID0gKHNlYXJjaFNwYWNlLCBudW1iZXJPZlNjb3V0cykgLT5cbiAgICBpID0gbnVtYmVyT2ZTY291dHNcbiAgICB3aGlsZSBpLS1cbiAgICAgICAgY3JlYXRlUmFuZG9tQmVlKHNlYXJjaFNwYWNlKVxuXG4jIyMqXG4gKiBTZWFyY2ggbmVpZ2hib3IgYmVlc1xuICogQHBhcmFtICB7QmVlfSBwYXJlbnRcbiAqIEBwYXJhbSAge0ludGVnZXJ9IG5laWdoYm9yU2l6ZVxuICogQHBhcmFtICB7SW50ZWdlcn0gcGF0Y2hTaXplXG4gKiBAcGFyYW0gIHtbW11dfSBzZWFyY2hTcGFjZVxuICogQHJldHVybiB7QmVlfVxuIyMjXG5zZWFyY2hOZWlnaGJvckJlZXMgPSAocGFyZW50LCBuZWlnaGJvclNpemUsIHBhdGNoU2l6ZSwgc2VhcmNoU3BhY2UpIC0+XG4gICAgaSA9IHBhdGNoU2l6ZVxuICAgIG5laWdoYm9yQmVlcyA9IFtdXG4gICAgd2hpbGUgaS0tXG4gICAgICAgIGJlZSA9IGNyZWF0ZU5laWdoYm9yQmVlKHBhcmVudC52ZWN0b3IsIHBhdGNoU2l6ZSwgc2VhcmNoU3BhY2UpXG4gICAgICAgIGJlZS5maXRuZXNzID0gb2JqZWN0aXZlRm4oYmVlLnZlY3RvcilcbiAgICAgICAgbmVpZ2hib3JCZWVzLnB1c2ggYmVlXG4gICAgKG5laWdoYm9yQmVlcy5zb3J0IChhLCBiKSAtPiBhIC0gYilbMF1cblxuIyMjKlxuICogU2VhcmNoXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBtYXhHZW5zXG4gKiBAcGFyYW0gIHtbW11dfSBzZWFyY2hTcGFjZVxuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZCZWVzXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBudW1iZXJPZlNpdGVzXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBlbGl0ZVNpdGVzXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBwYXRjaFNpemVcbiAqIEBwYXJhbSAge0ludGVnZXJ9IGVsaXRlQmVlc1xuICogQHBhcmFtICB7SW50ZWdlcn0gb3RoZXJCZWVzXG4gKiBAcmV0dXJuIHtCZWV9XG4jIyNcbnNlYXJjaCA9IChtYXhHZW5zLCBzZWFyY2hTcGFjZSwgbnVtYmVyT2ZCZWVzLCBudW1iZXJPZlNpdGVzLCBlbGl0ZVNpdGVzLCBwYXRjaFNpemUsIGVsaXRlQmVlcywgb3RoZXJCZWVzKSAtPlxuICAgIGJlc3QgPSBudWxsXG4gICAgaSA9IG51bWJlck9mQmVlc1xuICAgIGogPSBtYXhHZW5zXG4gICAgcG9wdWxhdGlvbiA9IFtdXG4gICAgd2hpbGUgaS0tXG4gICAgICAgIHBvcHVsYXRpb24ucHVzaCBjcmVhdGVSYW5kb21CZWUoc2VhcmNoU3BhY2UpXG4gICAgd2hpbGUgai0tXG4gICAgICAgIHBvcHVsYXRpb24uZm9yRWFjaCAoY3VyKSAtPiBjdXIuZml0bmVzcyA9IG9iamVjdGl2ZUZuIGN1ci52ZWN0b3JcbiAgICAgICAgcG9wdWxhdGlvbi5zb3J0IChhLCBiKSAtPiBhLmZpdG5lc3MgLSBiLmZpdG5lc3NcbiAgICAgICAgYmVzdCA9IHBvcHVsYXRpb25bMF0gaWYgIWJlc3Qgb3IgcG9wdWxhdGlvblswXS5maXRuZXNzIDwgYmVzdC5maXRuZXNzXG4gICAgICAgIG5leHRHZW4gPSBbXVxuICAgICAgICBrID0gbnVtYmVyT2ZTaXRlc1xuICAgICAgICB3aGlsZSBrLS1cbiAgICAgICAgICAgIG5leHRHZW4ucHVzaCBzZWFyY2hOZWlnaGJvckJlZXMgcGFyZW50LCAoaWYgaSA8IGVsaXRlU2l0ZXMgdGhlbiBlbGl0ZUJlZXMgZWxzZSBvdGhlckJlZXMpXG4gICAgICAgICAgICAgICAgLCBwYXRjaFNpemUsIHNlYXJjaFNwYWNlXG4gICAgICAgIHNjb3V0QmVlcyA9IGNyZWF0ZVNjb3V0QmVlcyBzZWFyY2hTcGFjZSwgKG51bWJlck9mQmVlcyAtIG51bWJlck9mU2l0ZXMpXG4gICAgICAgIHBvcHVsYXRpb24gPSBuZXh0R2VuLmNvbmNhdCBzY291dEJlZXNcbiAgICAgICAgcGF0Y2hTaXplID0gcGF0Y2hTaXplICogMC45NVxuICAgIGJlc3RcblxubW9kdWxlLmV4cG9ydHMgPSBzZWFyY2giLCJleHBvcnRzLmJlZXMgPSByZXF1aXJlICcuL2JlZXMuY29mZmVlJyIsImFpID1cbiAgICB2ZXJzaW9uOiAnMC4wLjEnXG5cbmFpLmJpbyA9IHJlcXVpcmUgJy4vYmlvL2luZGV4LmNvZmZlZSdcbmFpLm1sID0gcmVxdWlyZSAnLi9tbC9pbmRleC5jb2ZmZWUnXG5haS51dGlsID0gcmVxdWlyZSAnLi91dGlsL2luZGV4LmNvZmZlZSdcblxuaWYgdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nIGFuZCBkZWZpbmUuYW1kXG4gICAgZGVmaW5lIGFpXG5lbHNlIGlmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGFpXG5AYWkgPSBhaSIsIlxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lMMmh2YldVdmJYUnlZWGx1YUdGdEwwUnZZM1Z0Wlc1MGN5OUVhV2RwZEdGc2MyMXBkR2h6TDBwaGRtRXZZV2t2YzNKakwyMXNMMmx1WkdWNExtTnZabVpsWlNJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDIxMGNtRjVibWhoYlM5RWIyTjFiV1Z1ZEhNdlJHbG5hWFJoYkhOdGFYUm9jeTlLWVhaaEwyRnBMM055WXk5dGJDOXBibVJsZUM1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCVjFFaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SWlYWDA9IiwiZXhwb3J0cy5yYW5kVmVjdG9yID0gcmVxdWlyZSAnLi9yYW5kb21WZWN0b3IuY29mZmVlJyIsIiMjIypcbiAqIENyZWF0ZSBhIHJhbmRvbSB2ZWN0b3JcbiAqIEBwYXJhbSAge1tbXV19IG1tIG1pbm1heFxuICogQHJldHVybiB7W119XG4jIyNcbnJhbmRvbVZlY3RvciA9IChtaW5tYXgpIC0+IG1pbm1heC5tYXAgKGN1cikgLT4gY3VyWzBdICsgKChjdXJbMV0gLSBjdXJbMF0pICogTWF0aC5yYW5kb20oKSlcblxubW9kdWxlLmV4cG9ydHMgPSByYW5kb21WZWN0b3IiXX0=
