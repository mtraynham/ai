ErrorFunction = require './errorFunction.coffee'

class LinearErrorFunction extends ErrorFunction
    errorFunction = (ideal, actual) -> ideal - actual
    constructor: () ->
        super(errorFunction)

module.exports = LinearErrorFunction