
const { MongoClient } = require("mongodb");
require("dotenv").config();
const fs = require("fs");
const csv = require('csv-parser');
const path = require("path");
const loading = require("loading-cli");
const { MONGODB_URI } = process.env;


/**
 * constants
 */
const client = new MongoClient(MONGODB_URI);

// async function importCSV(file, collectionName) {
//     const db = client.db();
//     const collection = db.collection(collectionName);
//
//     const rows = [];
//
//     await fs.createReadStream(file)
//         .pipe(csv())
//         .on('data', (data) => rows.push(data))
//         .on('end', async () => {
//             try {
//                 await collection.insertMany(rows);
//                 console.log(`Imported ${rows.length} records into ${collectionName}`);
//             } catch (error) {
//                 console.error(`Error importing data into ${collectionName}:`, error);
//             }
//         });
// }

async function importCSV(file, collectionName) {
    const db = client.db();
    const collection = db.collection(collectionName);

    const rows = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .pipe(csv())
            .on('data', (data) => rows.push(data))
            .on('end', () => {
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    });

    try {
        await collection.insertMany(rows);
        console.log(`Imported ${rows.length} records into ${collectionName}`);
    } catch (error) {
        console.error(`Error importing data into ${collectionName}:`, error);
    }
}

async function establishRelationships(collectionName, columnName, referencedCollectionName) {
    const db = client.db();
    const collection = db.collection(collectionName);
    const referencedCollection = db.collection(referencedCollectionName);

    // Find documents in collection with foreign key references
    const documents = await collection.find({}).toArray();

    for (const doc of documents) {
        // Get the foreign key value from the document
        const foreignKey = doc[columnName];

        // Find the referenced document in referencedCollection
        const referencedDocument = await referencedCollection.findOne({ _id: foreignKey });

        if (referencedDocument) {
            // Update the document in collection with the referenced document's data
            await collection.updateOne({ _id: doc._id }, { $set: { columnName: referencedDocument._id } });
        }
    }

    console.log(`Foreign key relationships established between ${collectionName} and ${referencedCollectionName}`);
}

async function main() {
    try {
        await client.connect();
        const db = client.db();
        const results = await db.collection("departments").find({}).count();

        /**
         * If existing records then delete the current collections
         */
        if (results) {
            db.dropDatabase();
        }

        /**
         * This is just a fun little loader module that displays a spinner
         * to the command line
         */
        const load = loading("importing your data!!").start();

        /**
         * Import the CSV data into the database
         */

        const departments = await importCSV(path.join(__dirname, "data", "Department_Information.csv"), 'departments');
        const employees = await importCSV(path.join(__dirname, "data", "Employee_Information.csv"), 'employees');
        const counselings = await importCSV(path.join(__dirname, "data", "Student_Counceling_Information.csv"), 'counselings');
        const performances = await importCSV(path.join(__dirname, "data", "Student_Performance_Data.csv"), 'performances');

        load.stop();
        console.info(`University Data set up complete!`);

        process.exit();
    } catch (error) {
        console.error("error:", error);
        process.exit();
    }
}

main();
