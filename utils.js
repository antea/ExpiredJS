var dateFormat = require("dateformat");

/* Returns a Date from a yyyymmdd string. */

function parseYYYYMMDD(str) {
        var y = str.substr(0, 4),
                m = str.substr(4, 2) - 1,
                d = str.substr(6, 2);
        var D = new Date(y, m, d);
        return(D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
}

// Converts a yyyymmdd date to mmmm dS yyyy
exports.reparse = function(str) {
        return dateFormat(parseYYYYMMDD(str), "mmmm dS yyyy")
}
