//https://stackoverflow.com/a/5803801/10713877
function DEBUG(err) {
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nError: ' + err.message)
        }
        if (err.stack) {
            console.log('\nStacktrace:')
            console.log('====================')
            console.log(err.stack);
        }
    } else {
        console.log('dumpError :: argument is not an object');
    }
}
function DEBUGARR(arr) {
    for (const elem of arr) {
        process.stdout.write(elem)
    }
}
module.exports = {
    DEBUG,
    DEBUGARR,
}
