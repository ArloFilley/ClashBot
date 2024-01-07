const fs = require('fs');

module.exports = { addUser, readData }

async function readData() {
    const file = './data/userMap.json';

    try {
        const data = await fs.promises.readFile(file, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData.userData;
    } catch (err) {
        console.error('[Error]: Couldn\'t read or parse userMap.json -> ', err);
        throw err; // Re-throw the error to handle it outside of this function
    }
}

async function addUser(tag, discordId) {
    const file = './data/userMap.json';

    try {
        const data = await fs.promises.readFile(file, 'utf8');
        const jsonData = JSON.parse(data);

        // Add the new user to the data
        jsonData.userData[tag] = discordId;

        // Write the updated data back to the file
        await fs.promises.writeFile(file, JSON.stringify(jsonData, null, 2), 'utf8');

        console.log(`[Success]: User added  ${tag} - ${discordId}`);
    } catch (err) {
        console.error('[Error]: Couldn\'t add user to userMap.json -> ', err);
        throw err; // Re-throw the error to handle it outside of this function
    }
}