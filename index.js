const axios = require('axios').default;
const config = require('./config.json');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const visited = new Set();

readline.question('\nEnter starting page (the text after the /wiki/ in the url)\n', name => {
    readline.close();
    console.log();
    recurse(name);
});

function recurse(name) {
    axios.get(`${config.protocol}${config.domain}${config.path}${name}`).then(res => {
        if (res.status == 200) {
            let dom = new JSDOM(res.data);
            let first = "";
            [...dom.window.document.links].forEach(l => {
                if (first == "") {
                    let good = true;
                    config.ignore.forEach(e => {
                        if (l.href.includes(e)) {
                            good = false;
                        }
                    })
                    if (l.href.startsWith(`${config.path}`) && good) {
                        let val = `${l.href.slice(6).charAt(0).toLowerCase()}${l.href.slice(6).slice(1)}`;
                        if (visited.has(val)) {
                            console.log("\nCycle reached!");
                            process.exit(0);
                        }
                        else {
                            first = val;
                        }
                    }
                }
            })
            if (first == "") {
                console.log("\nDead end reached!");
                process.exit(0);
            }
            else {
                console.log(first);
                visited.add(first);
                recurse(first);
            }
        }
        else {
            console.log(`\nNon 200 OK status received`);
        }
    }).catch(err => { console.log(`\nRequest failed. Is the article valid?`); process.exit(0); });
}