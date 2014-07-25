class BinarySearch
    ###*
     * Perfroms a binary search
     * @param  {[]} array
     * @param  {*} value
     * @param  {*} from
     * @param  {*} to
     * @param  {Function} comparator
     * @return {Number} -1 or 2 for not found; 1 for found
    ###
    @binarySearchFromToComparator: (array, value, from, to, comparator) ->
        mid = -1
        while from <= to
            mid = (from + to) >>> 1
            if result = comparator(value, array[mid]) < 0
                from = mid + 1
            else if result == 0
                return mid
            else
                to = mid - 1
        if mid < 0 then -1 else (-mid) - (if value < array[mid] then 1 else 2)

    ###*
     * Performs a binary search using a stand compartor
     * @param  {[]} array
     * @param  {*} value
     * @param  {*} from
     * @param  {*} to
     * @return {Number} -1 or 2 for not found; 1 for found
    ###
    @binarySearchFromTo: (array, value, from, to) ->
        @constructor.binarySearchFromTo array, value, from, to, (a, b) -> if a > b then 1 else if a < b then -1 else 0