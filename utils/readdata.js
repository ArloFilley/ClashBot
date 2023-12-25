module.exports = { readData }

const fs = require('fs');

async function readData() {
    // Specify the file path
    const filePath = './data/userMap.json';

    try {
        // Read the JSON file
        const data = await fs.promises.readFile(filePath, 'utf8');

        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Access the user data
        const userData = jsonData.user_data;

        // Return the data to be processed
        return userData;
    } catch (error) {
        console.error('Error reading or parsing the file:', error);
        return null;
    }
}