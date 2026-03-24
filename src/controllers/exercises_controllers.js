import { getDBConnection } from './database';

export const getExercises = async (dayID) => {
    try {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM exercises WHERE day_id = ?`,
            [dayID]
        );

        const exercises = [];
        for (let i = 0; i < results.rows.length; i++) {
            exercises.push(results.rows.item(i));
        }

        if (exercises.length > 0) {
            return exercises;
        }

        // Fallback to all_exercises if no custom exercises found
        const [defaultResults] = await db.executeSql(
            `SELECT * FROM all_exercises WHERE day_id = ?`,
            [dayID]
        );
        const defaultExercises = [];
        for (let i = 0; i < defaultResults.rows.length; i++) {
            defaultExercises.push(defaultResults.rows.item(i));
        }
        return defaultExercises;
    } catch (error) {
        console.error('Error fetching exercises:', error);
        throw error;
    }
};

export const addExercise = async (dayID, exercises) => {
    if (!dayID || !Array.isArray(exercises) || exercises.length === 0) {
        throw new Error('dayID and a non-empty exercises array are required');
    }

    try {
        const db = await getDBConnection();
        for (const ex of exercises) {
            const { ex_name, sets, reps, weight, rest } = ex;
            await db.executeSql(
                `INSERT INTO exercises (day_id, ex_name, sets, reps, weight, rest) VALUES (?, ?, ?, ?, ?, ?)`,
                [dayID, ex_name, sets, reps, weight, rest]
            );
        }
        return { message: 'Exercises added successfully' };
    } catch (error) {
        console.error('Error adding exercises:', error);
        throw error;
    }
};

export const deleteEx = async (id) => {
    try {
        const db = await getDBConnection();
        await db.executeSql(
            `DELETE FROM exercises WHERE id = ?`,
            [id]
        );
        return { message: 'Exercise deleted successfully' };
    } catch (error) {
        console.error('Error deleting exercise:', error);
        throw error;
    }
};

export const getTypes = async () => {
    try {
        const db = await getDBConnection();
        const [results] = await db.executeSql(`SELECT * FROM e_types`);
        const types = [];
        for (let i = 0; i < results.rows.length; i++) {
            types.push(results.rows.item(i));
        }
        return types;
    } catch (error) {
        console.error('Error fetching types:', error);
        throw error;
    }
};

export const getDefaultExercises = async (typeID) => {
    try {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM all_exercises WHERE e_type = ?`,
            [typeID]
        );
        const exercises = [];
        for (let i = 0; i < results.rows.length; i++) {
            exercises.push(results.rows.item(i));
        }
        return exercises;
    } catch (error) {
        console.error('Error fetching default exercises:', error);
        throw error;
    }
};

export const addDefaultExercise = async (typeID, ex_name) => {
    try {
        const db = await getDBConnection();
        const [result] = await db.executeSql(
            `INSERT INTO all_exercises (e_name, e_type) VALUES (?, ?)`,
            [ex_name, typeID]
        );
        return { id: result.insertId, message: 'Exercise added' };
    } catch (error) {
        console.error('Error adding default exercise:', error);
        throw error;
    }
};
