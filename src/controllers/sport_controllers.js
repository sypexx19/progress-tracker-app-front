import { getDBConnection } from './database';

export const addSport = async (name) => {
    try {
        const db = await getDBConnection();

        // Check if sport already exists
        const [existing] = await db.executeSql(
            `SELECT sport_name FROM sports WHERE sport_name = ?`,
            [name]
        );
        if (existing.rows.length > 0) {
            throw new Error('Sport already exists');
        }

        const [result] = await db.executeSql(
            `INSERT INTO sports (sport_name) VALUES (?)`,
            [name]
        );
        return { message: 'Sport added successfully', sportId: result.insertId };
    } catch (error) {
        console.error('Error adding sport:', error);
        throw error;
    }
};

export const getSports = async () => {
    try {
        const db = await getDBConnection();
        const [results] = await db.executeSql(`SELECT * FROM sports`);
        const sports = [];
        for (let i = 0; i < results.rows.length; i++) {
            sports.push(results.rows.item(i));
        }
        return sports;
    } catch (error) {
        console.error('Error fetching sports:', error);
        throw error;
    }
};

export const getSportsDefault = async () => {
    try {
        const db = await getDBConnection();
        const [results] = await db.executeSql(`SELECT * FROM sports_default`);
        const sports = [];
        for (let i = 0; i < results.rows.length; i++) {
            sports.push(results.rows.item(i));
        }
        return sports;
    } catch (error) {
        console.error('Error fetching default sports:', error);
        throw error;
    }
};
