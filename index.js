const axios = require('axios').default;
const config = require('./config.json');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const visited = new Set();
let limit = config.limit;
let jumps = 0;

readline.question('\nEnter starting page (the text after the /wiki/ in the url)\n', name => {
    readline.question('Maximum link jumps you want to do?\n', lim => {
        if (isNaN(lim) || parseInt(lim) <= 0) {
            console.log(`Invalid number, using ${limit} as limit`);
        }
        else {
            limit = parseInt(lim);
        }
        readline.close();
        console.log();
        recurse(name);
    })
});

function recurse(name) {
    axios.get(`${config.protocol}${config.domain}${config.path}${name}`).then(res => {
        if (res.status == 200) {
            let dom = new JSDOM(res.data);
            let arr = [];
            [...dom.window.document.links].forEach(l => {
                let good = true;
                config.ignore.forEach(e => {
                    if (l.href.includes(e)) {
                        good = false;
                    }
                })
                if (l.href.startsWith(`${config.path}`) && good) {
                    let val = `${l.href.slice(6).charAt(0).toLowerCase()}${l.href.slice(6).slice(1)}`;
                    if (!visited.has(val)) {
                        arr.push(val);
                    }
                }

            })
            if (arr.length == 0) {
                console.log("\nDead end reached!");
                process.exit(0);
            }
            else {
                let first = arr[Math.floor(Math.random() * arr.length)];
                console.log(first);
                visited.add(first);
                jumps++;
                if (jumps >= limit) {
                    console.log("\nJump limit reached!");
                    process.exit(0);
                }
                else {
                    recurse(first);
                }
            }
        }
        else {
            console.log(`\nNon 200 OK status received`);
            process.exit(0);
        }
    }).catch(err => { console.log(`\nRequest failed. Is the article valid?`); process.exit(0); });
}