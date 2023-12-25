const fs = require('fs');

module.exports = { readData }

async function readData() {
    const file= './data/userMap.json';

    fs.promises.readFile(file, 'utf8')
        .then(data => {
            const jsonData = JSON.parse(data);
            return jsonData.userData 
        })
        .catch(err => { console.error('[Error]: Couldn\'t read or parse userMap.json -> ', err)})
}