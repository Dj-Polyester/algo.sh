const {
    pool,
    DBNAME,
    ISTHEREANYDB,
    CREATEDB,
    DROPDB,
    ISTHEREANYTABLE,
    CREATETABLE,
    DROPTABLE,
    INSERTINTO,
    GETENTRIES,
} = require("./db"),
    db = require("./db"),
    { DEBUG } = require("./debug"),
    core = require("./core"),
    { OPTIONS } = require("./core"),
    testdata = require("./testdata");

(async function () {
    try {
        console.time("GET")
        const res = await core.GET("dijkstra", 0, 5)
        console.log(res);
    } catch (error) {
        DEBUG(error)
    } finally {
        console.timeEnd("GET")
        await pool.end()
    }
})();