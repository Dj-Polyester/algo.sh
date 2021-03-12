const { DEBUG } = require('../debug');

const { Pool } = require('pg'),
    ISTHEREANYDB = `SELECT FROM pg_database WHERE datname = '${process.env.PGDATABASE}'`,
    CREATEDB = `CREATE DATABASE ${process.env.PGDATABASE}`,
    DROPDB = `DROP DATABASE IF EXISTS ${process.env.PGDATABASE}`,
    ISTHEREANYTABLE = `SELECT FROM information_schema.tables WHERE table_name = '${process.env.PGTABLE}';`,
    CREATETABLE = `
CREATE TABLE IF NOT EXISTS ${process.env.PGTABLE} (
    txt VARCHAR,
    index INT,
    lines VARCHAR[],
    PRIMARY KEY(txt, index)
);`,
    DROPTABLE = `DROP TABLE IF EXISTS ${process.env.PGTABLE};`,
    INSERTINTO = (txt, index, arr) => {
        return {
            text: `INSERT INTO ${process.env.PGTABLE} VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`,
            values: [txt, index, arr]
        }
    },
    GETENTRIES = (txt, start, end) => {
        return {
            text: `
SELECT lines FROM ${process.env.PGTABLE}
WHERE txt = $1 AND index >= $2 AND index < $3`,
            values: [txt, start, end]
        }
    },
    pool = new Pool();

async function PUTpromise(txt, start, end, codes) {
    return new Promise((resolve, reject) => {
        pool.connect((err, client) => {
            if (err) {
                DEBUG(err)
                reject(err)
            }
            for (let index = start, helperindex = 0; index < end; index++, helperindex++) {
                client.query(INSERTINTO(txt, index, codes[helperindex]), (err, res) => {
                    if (err) {
                        DEBUG(err)
                        reject(err)
                    }
                })
            }
            resolve()
        })
    })
}
async function PUT(txt, start, end, codes) {

    const client = await pool.connect()
    try {
        for (let index = start, helperindex = 0; index < end; index++, helperindex++) {
            await client.query(INSERTINTO(txt, index, codes[helperindex]))
        }
    } catch (error) {
        DEBUG(error)
    } finally {
        client.release()
    }
}
async function GET(txt, start, end) {
    const client = await pool.connect()
    try {
        return await client.query(GETENTRIES(txt, start, end))
    } catch (error) {
        DEBUG(error)
    } finally {
        client.release()
    }
}

// create db
// ; (async () => {
//     const client = await pool.connect();
//     try {
//         const res = await client.query(ISTHEREANYDB);
//         if (res.rowCount === 0) {
//             const res = await client.query(CREATEDB);
//             console.log(res.rows);
//             console.log(res.rowCount);
//         }
//     } catch (error) {
//         DEBUG(error)
//     } finally {
//         client.release();
//     }
// })()

module.exports = {
    pool,
    ISTHEREANYDB,
    CREATEDB,
    DROPDB,
    ISTHEREANYTABLE,
    CREATETABLE,
    DROPTABLE,
    INSERTINTO,
    GETENTRIES,
    PUT,
    GET,
};