ai =
    version: '0.0.1'

ai.util = require './util.coffee'

if typeof define == 'function' and define.amd
    define ai
else if typeof module == 'object' && module.exports
    module.exports = ai
@ai = ai