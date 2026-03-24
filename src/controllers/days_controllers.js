import { getDBConnection } from './database';

export const getDays = async (workoutID) => {
    try {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM workouts_days WHERE workout_id = ?`,
            [workoutID]
        );
        const days = [];
        for (let i = 0; i < results.rows.length; i++) {
            days.push(results.rows.item(i));
        }
        return days;
    } catch (error) {
        console.error('Error fetching days:', error);
        throw error;
    }
};

export const addDay = async (workoutID, dayName) => {
    try {
        const db = await getDBConnection();
        const [result] = await db.executeSql(
            `INSERT INTO workouts_days (workout_id, day_name) VALUES (?, ?)`,
            [workoutID, dayName]
        );
        return { dayId: result.insertId };
    } catch (error) {
        console.error('Error adding day:', error);
        throw error;
    }
};

export const deleteDay = async (dayID) => {
    try {
        const db = await getDBConnection();
        await db.executeSql(
            `DELETE FROM exercises WHERE day_id = ?`,
            [dayID]
        );
        const [result] = await db.executeSql(
            `DELETE FROM workouts_days WHERE day_id = ?`,
            [dayID]
        );
        if (result.rowsAffected === 0) {
            throw new Error('Day not found');
        }
        return { message: 'Day deleted successfully' };
    } catch (error) {
        console.error('Error deleting day:', error);
        throw error;
    }
};

export const addDefaultDays = async (workoutID, dayName) => {
    try {
        const db = await getDBConnection();
        const [result] = await db.executeSql(
            `INSERT INTO workouts_days (workout_id, day_name) VALUES (?, ?)`,
            [workoutID, dayName]
        );
        return { dayId: result.insertId };
    } catch (error) {
        console.error('Error adding default day:', error);
        throw error;
    }
};
