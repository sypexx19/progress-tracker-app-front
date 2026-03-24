import { getDBConnection } from './database';

export const getSessionDays = async (sessionId) => {
    try {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM workout_session_days WHERE session_id = ?`,
            [sessionId]
        );
        const days = [];
        for (let i = 0; i < results.rows.length; i++) {
            days.push(results.rows.item(i));
        }
        return days.length > 0 ? days : { message: 'No days found' };
    } catch (error) {
        console.error('Error fetching session days:', error);
        throw error;
    }
};

export const getSessionExercises = async (dayID) => {
    try {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT
                exercise_id,
                ex_name,
                sets_completed,
                reps_completed,
                weight_kg,
                rest_sec,
                created_at
            FROM exercice_logs
            WHERE day_id = ? AND is_deleted = 0
            ORDER BY exercise_id ASC, created_at DESC, id DESC`,
            [dayID]
        );

        if (results.rows.length === 0) {
            return [];
        }

        const byExercise = new Map();
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            const exKey = String(row.exercise_id);
            if (!byExercise.has(exKey)) {
                byExercise.set(exKey, {
                    exercise_id: row.exercise_id,
                    ex_name: row.ex_name,
                    latest: {
                        sets: row.sets_completed,
                        reps: row.reps_completed,
                        weight: row.weight_kg,
                        rest: row.rest_sec,
                        created_at: row.created_at,
                    },
                    logs: [],
                });
            }
            byExercise.get(exKey).logs.push({
                sets: row.sets_completed,
                reps: row.reps_completed,
                weight: row.weight_kg,
                rest: row.rest_sec,
                created_at: row.created_at,
            });
        }

        return Array.from(byExercise.values());
    } catch (error) {
        console.error('Error fetching session exercises:', error);
        throw error;
    }
};

export const createExerciseLog = async (dayID, { exercise_id, ex_name, sets, reps, weight, rest }) => {
    if (!exercise_id || !ex_name) {
        throw new Error('exercise_id and ex_name are required');
    }

    try {
        const db = await getDBConnection();
        const [result] = await db.executeSql(
            `INSERT INTO exercice_logs (
                day_id,
                exercise_id,
                ex_name,
                sets_completed,
                reps_completed,
                weight_kg,
                rest_sec
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                dayID,
                exercise_id,
                ex_name,
                sets  || 0,
                reps  || 0,
                weight || 0,
                rest  || 0,
            ]
        );
        return { id: result.insertId, message: 'Log saved' };
    } catch (error) {
        console.error('Error creating exercise log:', error);
        throw error;
    }
};
