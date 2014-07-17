###*
 * Objective function
 * @param  {[]} vector
 * @return {Float}
###
objectiveFn = (vector) ->
    vector.reduce (prev, cur) ->
        prev + Math.pow(cur, 2)
    , 0

module.exports = objectiveFn