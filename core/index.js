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
} = require("../db"),
    {
        DEBUG,
        DEBUGARR,
    } = require("../debug"),
    https = require("https"),
    fs = require("fs"),
    { parse } = require("node-html-parser"),
    path = require("path"),
    PATH_OPT = path.join(__dirname, "options.json"),
    OPTIONS = JSON.parse(
        fs.readFileSync(PATH_OPT, "utf8")
    ),
    db = require("../db");
function saveOpt() {
    try {
        fs.writeFileSync(PATH_OPT, JSON.stringify(OPTIONS))
    } catch (error) {
        return DEBUG(error)
    }
}

async function GET(txt, start, end) {
    const client = await pool.connect();
    try {
        const tmpres = await client.query(ISTHEREANYTABLE);
        if (tmpres.rowCount === 0) {
            await client.query(CREATETABLE);
        }
        const res = await db.GET(txt, start, end)
        if (res.rowCount === 0) {
            const start = 0;
            const end = start + OPTIONS.load;
            const codes = await getReq(txt, start, end)
            await db.PUT(txt, start, end, codes);
            return codes
        } else return res.rows
    } catch (error) {
        DEBUG(error)
    } finally {
        client.release();
    }
}

async function getReq(txt, start, end) {
    const addComments = (OPTIONS.comments) ? "" : "/?Q"
    let promises = []
    for (let index = start; index < end; index++) {
        promises.push(new Promise((resolve, reject) => {
            https.get(`https://cht.sh/${OPTIONS.lang}/${txt}/${index}${addComments}`, async res => {
                let data = ""

                res.on("data", chunk => {
                    data += chunk
                })

                res.on("end", () => {
                    // get a single code in a document
                    let lines = []
                    const root = parse(data)
                    // const linesTxt = root.querySelector("pre").childNodes[0].rawText; //same but slower
                    const linesTxt = root.childNodes[0].childNodes[3].childNodes[6].childNodes[0].rawText; //same but faster
                    delete root
                    const newRoot = parse(linesTxt)
                    delete linesTxt
                    const childnodes = newRoot.childNodes
                    delete newRoot
                    for (const childNode of childnodes) {
                        const line = childNode.text;
                        lines.push(line);
                    }
                    resolve(lines)
                })

            }).on("error", (error) => {
                DEBUG(error)
                reject(error)
            }).end()
        }))
    }
    return Promise.all(promises)
}

module.exports = {
    getReq,
    saveOpt,
    PATH_OPT,
    OPTIONS,
    GET,
}