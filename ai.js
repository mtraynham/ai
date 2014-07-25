(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.neural = require('./neural/index.coffee');

exports.stochastic = require('./stochastic/index.coffee');

exports.swarm = require('./swarm/index.coffee');


},{"./neural/index.coffee":3,"./stochastic/index.coffee":4,"./swarm/index.coffee":7}],2:[function(require,module,exports){
var Neuron, activate, backwardPropagateError, calculateErrorDerivativesForWeights, createNeuron, execute, fillArray, forwardPropagate, initWeights, randomVector, testNetwork, trainNetwork, transfer, transferDerivative, updateWeights;

randomVector = require('../../util/randomVector.coffee');

fillArray = require('../../util/fillArray.coffee');

Neuron = (function() {
  function Neuron(weights, lastDelta, deriv) {
    this.weights = weights;
    this.lastDelta = lastDelta;
    this.deriv = deriv;
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
        return neuron.delta = transferDerivative(neuron.output * network[i + 1].reduce(function(prev, nextNeuron) {
          return prev += nextNeuron.weights[j] * nextNeuron.delta;
        }, 0));
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
      var expected, output;
      expected = pattern[pattern.length(-1)];
      output = forwardPropagate(network, pattern);
      backwardPropagateError(network, expected);
      return calculateErrorDerivativesForWeights(network, pattern);
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
    output = forwardPropagate(network, pattern);
    if (Math.round(output) === pattern[pattern.length - 1]) {
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
  return new Neuron(initWeights(numberOfInputs + 1), fillArray(0, numberOfInputs + 1), fillArray(0, numberOfInputs + 1));
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


},{"../../util/fillArray.coffee":12,"../../util/randomVector.coffee":15}],3:[function(require,module,exports){
exports.backPropagation = require('./backPropagation.coffee');


},{"./backPropagation.coffee":2}],4:[function(require,module,exports){
exports.randomSearch = require('./randomSearch.coffee');


},{"./randomSearch.coffee":5}],5:[function(require,module,exports){

/*
 * http://en.wikipedia.org/wiki/Random_search
 */
var Candidate, objectiveFn, randomVector, search;

randomVector = require('../../util/randomVector.coffee');

objectiveFn = require('../../util/objectiveFn.coffee');

Candidate = (function() {
  function Candidate(searchSpace) {
    this.vector = randomVector(searchSpace);
    this.cost = objectiveFn(this.vector);
  }

  return Candidate;

})();


/**
 * Search for best candidate
 * @param  {[[]]} searchSpace
 * @param  {Integer} maxIterations
 * @return {Candidate}
 */

search = function(searchSpace, maxIterations) {
  var best, candidate;
  best = null;
  candidate = null;
  while (maxIterations--) {
    candidate = new Candidate(searchSpace);
    if (!best || candidate.cost < best.cost) {
      best = candidate;
    }
  }
  return best;
};

module.exports = search;


},{"../../util/objectiveFn.coffee":14,"../../util/randomVector.coffee":15}],6:[function(require,module,exports){

/*
 * http://en.wikipedia.org/wiki/Bees_algorithm
 */
var Bee, createNeighborBee, createRandomBee, createScoutBees, objectiveFn, randomVector, search, searchNeighborBees;

randomVector = require('../../util/randomVector.coffee');

objectiveFn = require('../../util/objectiveFn.coffee');

Bee = (function() {
  function Bee(vector, fitness) {
    this.vector = vector;
    this.fitness = fitness;
  }

  return Bee;

})();


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


},{"../../util/objectiveFn.coffee":14,"../../util/randomVector.coffee":15}],7:[function(require,module,exports){
exports.bees = require('./bees.coffee');


},{"./bees.coffee":6}],8:[function(require,module,exports){
(function (global){
var ai;

ai = {
  version: '0.0.1'
};

ai.bio = require('./bio/index.coffee');

ai.ml = require('./ml/index.coffee');

ai.util = require('./util/index.coffee');

global.ai = ai;


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./bio/index.coffee":1,"./ml/index.coffee":9,"./util/index.coffee":13}],9:[function(require,module,exports){



},{}],10:[function(require,module,exports){
var Arithmetic;

Arithmetic = (function() {
  function Arithmetic() {}

  Arithmetic.STIRLING_CORRECTION = [0.0, 8.106146679532726e-02, 4.134069595540929e-02, 2.767792568499834e-02, 2.079067210376509e-02, 1.664469118982119e-02, 1.387612882307075e-02, 1.189670994589177e-02, 1.041126526197209e-02, 9.255462182712733e-03, 8.330563433362871e-03, 7.573675487951841e-03, 6.942840107209530e-03, 6.408994188004207e-03, 5.951370112758848e-03, 5.554733551962801e-03, 5.207655919609640e-03, 4.901395948434738e-03, 4.629153749334029e-03, 4.385560249232324e-03, 4.166319691996922e-03, 3.967954218640860e-03, 3.787618068444430e-03, 3.622960224683090e-03, 3.472021382978770e-03, 3.333155636728090e-03, 3.204970228055040e-03, 3.086278682608780e-03, 2.976063983550410e-03, 2.873449362352470e-03, 2.777674929752690e-03];

  Arithmetic.LOG_FACTORIALS = [0.00000000000000000, 0.00000000000000000, 0.69314718055994531, 1.79175946922805500, 3.17805383034794562, 4.78749174278204599, 6.57925121201010100, 8.52516136106541430, 10.60460290274525023, 12.80182748008146961, 15.10441257307551530, 17.50230784587388584, 19.98721449566188615, 22.55216385312342289, 25.19122118273868150, 27.89927138384089157, 30.67186010608067280, 33.50507345013688888, 36.39544520803305358, 39.33988418719949404, 42.33561646075348503, 45.38013889847690803, 48.47118135183522388, 51.60667556776437357, 54.78472939811231919, 58.00360522298051994, 61.26170176100200198, 64.55753862700633106, 67.88974313718153498, 71.25703896716800901];

  Arithmetic.FACTORIALS = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 5.109094217170944e19, 1.1240007277776077e21, 2.585201673888498e22, 6.204484017332394e23, 1.5511210043330984e25, 4.032914611266057e26, 1.0888869450418352e28, 3.048883446117138e29, 8.841761993739701e30, 2.652528598121911e32, 8.222838654177924e33, 2.6313083693369355e35, 8.68331761881189e36, 2.952327990396041e38, 1.0333147966386144e40, 3.719933267899013e41, 1.3763753091226346e43, 5.23022617466601e44, 2.0397882081197447e46, 8.15915283247898e47, 3.34525266131638e49, 1.4050061177528801e51, 6.041526306337384e52, 2.6582715747884495e54, 1.196222208654802e56, 5.502622159812089e57, 2.5862324151116827e59, 1.2413915592536068e61, 6.082818640342679e62, 3.0414093201713376e64, 1.5511187532873816e66, 8.06581751709439e67, 4.274883284060024e69, 2.308436973392413e71, 1.2696403353658264e73, 7.109985878048632e74, 4.052691950487723e76, 2.350561331282879e78, 1.386831185456898e80, 8.32098711274139e81, 5.075802138772246e83, 3.146997326038794e85, 1.9826083154044396e87, 1.2688693218588414e89, 8.247650592082472e90, 5.443449390774432e92, 3.6471110918188705e94, 2.48003554243683e96, 1.7112245242814127e98, 1.1978571669969892e100, 8.504785885678624e101, 6.123445837688612e103, 4.470115461512686e105, 3.307885441519387e107, 2.4809140811395404e109, 1.8854947016660506e111, 1.451830920282859e113, 1.1324281178206295e115, 8.94618213078298e116, 7.15694570462638e118, 5.797126020747369e120, 4.7536433370128435e122, 3.94552396972066e124, 3.314240134565354e126, 2.8171041143805494e128, 2.4227095383672744e130, 2.107757298379527e132, 1.854826422573984e134, 1.6507955160908465e136, 1.4857159644817605e138, 1.3520015276784033e140, 1.2438414054641305e142, 1.156772507081641e144, 1.0873661566567426e146, 1.0329978488239061e148, 9.916779348709491e149, 9.619275968248216e151, 9.426890448883248e153, 9.332621544394415e155, 9.332621544394418e157, 9.42594775983836e159, 9.614466715035125e161, 9.902900716486178e163, 1.0299016745145631e166, 1.0813967582402912e168, 1.1462805637347086e170, 1.2265202031961373e172, 1.324641819451829e174, 1.4438595832024942e176, 1.5882455415227423e178, 1.7629525510902457e180, 1.974506857221075e182, 2.2311927486598138e184, 2.543559733472186e186, 2.925093693493014e188, 3.393108684451899e190, 3.96993716080872e192, 4.6845258497542896e194, 5.574585761207606e196, 6.689502913449135e198, 8.094298525273444e200, 9.875044200833601e202, 1.2146304367025332e205, 1.506141741511141e207, 1.882677176888926e209, 2.3721732428800483e211, 3.0126600184576624e213, 3.856204823625808e215, 4.974504222477287e217, 6.466855489220473e219, 8.471580690878813e221, 1.1182486511960037e224, 1.4872707060906847e226, 1.99294274616152e228, 2.690472707318049e230, 3.6590428819525483e232, 5.0128887482749884e234, 6.917786472619482e236, 9.615723196941089e238, 1.3462012475717523e241, 1.8981437590761713e243, 2.6953641378881633e245, 3.8543707171800694e247, 5.550293832739308e249, 8.047926057471989e251, 1.1749972043909107e254, 1.72724589045464e256, 2.5563239178728637e258, 3.8089226376305687e260, 5.7133839564458575e262, 8.627209774233244e264, 1.3113358856834527e267, 2.0063439050956838e269, 3.0897696138473515e271, 4.789142901463393e273, 7.471062926282892e275, 1.1729568794264134e278, 1.8532718694937346e280, 2.946702272495036e282, 4.714723635992061e284, 7.590705053947223e286, 1.2296942187394494e289, 2.0044015765453032e291, 3.287218585534299e293, 5.423910666131583e295, 9.003691705778434e297, 1.5036165148649983e300, 2.5260757449731988e302, 4.2690680090047056e304, 7.257415615308004e306];


  /**
   * Calculate the binomial coefficiant
   * @param  {Number} n
   * @param  {Number} k
   * @return {Number}
   */

  Arithmetic.binomial = function(n, k) {
    var a, b, binomial, i;
    if (k < 0) {
      return 0;
    } else if (k === 0) {
      return 1;
    } else if (k === 1) {
      return n;
    } else {
      a = n - k + 1;
      b = 1;
      binomial = 1;
      i = k;
      while (i--) {
        binomial *= (a++) / (b++);
      }
      return binomial;
    }
  };


  /**
   * Returns the smallest long value greater than a value
   * @param  {Number} value
   * @return {Number}
   */

  Arithmetic.ceil = function(value) {
    return Math.round(Math.ceil(value));
  };


  /**
   * Evaluates the series of the Chebyshhev polynomials Ti at argument x/2
   * @param  {Number} x
   * @param  {Number[]} coef
   * @param  {Number} N
   * @return {Number}      [description]
   */

  Arithmetic.chbevl = function(x, coef, N) {
    var b0, b1, b2, i, p;
    p = 0;
    b0 = coef[p++];
    b1 = 0.0;
    i = N;
    while (i--) {
      b2 = b1;
      b1 = b0;
      b0 = x * b1 - b2 + coef[p++];
    }
    return 0.5 * (b0 - b2);
  };


  /**
   * Returns a precalculated factorial
   * @param  {Number} k
   * @return {Number}
   */

  Arithmetic.factorial = function(k) {
    if (k < 0) {
      throw new Error;
    }
    if (k < this.constructor.FACTORIALS.length) {
      return this.constructor.FACTORIALS[k];
    } else {
      return Number.POSITIVE_INFINITY;
    }
  };


  /**
   * Returns the largest long value less than a value
   * @param  {Number} value
   * @return {Number}
   */

  Arithmetic.floor = function(value) {
    return Math.round(Math.floor(value));
  };


  /**
   * Returns log with base and value
   * @param  {Number} base
   * @param  {Number} value
   * @return {Number}
   */

  Arithmetic.log = function(base, value) {
    return Math.log(value) / Math.log(base);
  };


  /**
   * Returns log base 10 value
   * @param  {Number} value
   * @return {Number}
   */

  Arithmetic.log10 = function(value) {
    return Math.log(value) * 0.43429448190325176;
  };


  /**
   * Returns log base 2 value
   * @param  {Number} value
   * @return {Number}
   */

  Arithmetic.log2 = function(value) {
    return Math.log(value) * 1.4426950408889634;
  };


  /**
   * Returns log factorial of a value
   * @param  {Number} k
   * @return {Number}
   */

  Arithmetic.logFactorial = function(k) {
    var C0, C1, C3, C5, C7, r, rr;
    if (k >= 30) {
      r = 1.0 / k;
      rr = r * r;
      C7 = -5.95238095238095238e-04;
      C5 = 7.93650793650793651e-04;
      C3 = -2.77777777777777778e-03;
      C1 = 8.33333333333333333e-02;
      C0 = 9.18938533204672742e-01;
      return (k + 0.5) * Math.log(k) - k + C0 + r * (C1 + rr * (C3 + rr * (C5 + rr * C7)));
    } else {
      return this.constructor.LOG_FACTORIALS[k];
    }
  };


  /**
   * Returns the StrilingCorrection
   * @param  {Number} k
   * @return {Number}
   */

  Arithmetic.stirlingCorrection = function(k) {
    var C1, C3, C5, C7, r, rr;
    if (k >= 30) {
      r = 1.0 / k;
      rr = r * r;
      C7 = -5.95238095238095238e-04;
      C5 = 7.93650793650793651e-04;
      C3 = -2.77777777777777778e-03;
      C1 = 8.33333333333333333e-02;
      return r * (C1 + rr * (C3 + rr * (C5 + rr * C7)));
    } else {
      return this.constructor.STIRLING_CORRECTION[k];
    }
  };

  return Arithmetic;

})();

module.exports = Arithmetic;


},{}],11:[function(require,module,exports){
var Constants;

Constants = (function() {
  function Constants() {}

  Constants.BIG = 4.503599627370496e15;

  Constants.BIGINV = 2.22044604925031308085e-16;

  Constants.LOG2E = 1.4426950408889634073599;

  Constants.LOGE2 = 6.93147180559945309417e-1;

  Constants.LOGPI = 1.14472988584940017414;

  Constants.LOGSQ2 = 3.46573590279972654709e-1;

  Constants.MACHEP = 1.11022302462515654042e-16;

  Constants.MAXGAM = 171.624376956302725;

  Constants.MAXLOG = 7.09782712893383996843e2;

  Constants.MAXNUM = 1.7976931348623158e308;

  Constants.MINLOG = -7.08396418532264106224e2;

  Constants.PI = 3.14159265358979323846;

  Constants.PIO2 = 1.57079632679489661923;

  Constants.PIO4 = 7.85398163397448309616e-1;

  Constants.SQ2OPI = 7.9788456080286535587989e-1;

  Constants.SQRT2 = 1.41421356237309504880;

  Constants.SQRTH = 7.07106781186547524401e-1;

  Constants.SQRTH = 7.07106781186547524401e-1;

  Constants.SQTPI = 2.50662827463100050242e0;

  Constants.THPIO4 = 2.35619449019234492885;

  Constants.TWOOPI = 6.36619772367581343075535e-1;

  return Constants;

})();

module.exports = Constants;


},{}],12:[function(require,module,exports){

/**
 * Fill an array with a particular value
 * @param {*} fill
 * @param {Integer} length
 * @return {[]}
 */
var fillArray;

fillArray = function(fill, length) {
  var _results;
  _results = [];
  while (length--) {
    _results.push(fill);
  }
  return _results;
};

module.exports = fillArray;


},{}],13:[function(require,module,exports){
exports.arithmetic = require('./arithmetic.coffee');

exports.constants = require('./constants.coffee');

exports.fillArray = require('./fillArray.coffee');

exports.objectiveFn = require('./objectiveFn.coffee');

exports.randomVector = require('./randomVector.coffee');


},{"./arithmetic.coffee":10,"./constants.coffee":11,"./fillArray.coffee":12,"./objectiveFn.coffee":14,"./randomVector.coffee":15}],14:[function(require,module,exports){

/**
 * Objective function
 * @param  {[]} vector
 * @return {Float}
 */
var objectiveFn;

objectiveFn = function(vector) {
  return vector.reduce(function(prev, cur) {
    return prev + Math.pow(cur, 2);
  }, 0);
};

module.exports = objectiveFn;


},{}],15:[function(require,module,exports){

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


},{}]},{},[8])