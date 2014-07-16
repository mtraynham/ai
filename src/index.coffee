ai =
    version: '0.0.1'

ai.bio = require './bio/index.coffee'
ai.ml = require './ml/index.coffee'
ai.util = require './util/index.coffee'

if typeof define == 'function' and define.amd
    define ai
else if typeof module == 'object' && module.exports
    module.exports = ai
@ai = ai