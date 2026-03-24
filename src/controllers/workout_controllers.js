import { getDBConnection } from './db';

export const getWorkouts = async (sportID) => {
    try {
        const db = await getDBConnection();
        const [results] = await db.executeSql(
            `SELECT * FROM workouts WHERE sport_id = ? AND is_deleted = 0`,
            [sportID]
        );
        const workouts = [];
        for (let i = 0; i < results.rows.length; i++) {
            workouts.push(results.rows.item(i));
        }
        return workouts;
    } catch (error) {
        console.error('Error fetching workouts:', error);
        throw error;
    }
};

export const saveWorkout = async (workoutName, sportID, days) => {
    const db = await getDBConnection();
    try {
        await db.executeSql('BEGIN TRANSACTION');

        const [workoutResult] = await db.executeSql(
            `INSERT INTO workouts (sport_id, workout_name) VALUES (?, ?)`,
            [parseInt(sportID, 10), workoutName]
        );
        const workoutID = workoutResult.insertId;

        for (const day of days) {
            const [dayResult] = await db.executeSql(
                `INSERT INTO workouts_days (workout_id, day_name) VALUES (?, ?)`,
                [workoutID, day.day_name]
            );
            const newDayID = dayResult.insertId;

            for (const ex of day.exercises) {
                await db.executeSql(
                    `INSERT INTO exercises (ex_name, day_id, sets, reps, weight, rest) VALUES (?, ?, ?, ?, ?, ?)`,
                    [ex.ex_name, newDayID, ex.sets, ex.reps, ex.weight, ex.rest]
                );
            }
        }

        await db.executeSql('COMMIT');
        return { message: 'Workout saved', workoutID };
    } catch (error) {
        await db.executeSql('ROLLBACK');
        console.error('Error saving workout:', error);
        throw error;
    }
};

export const updateWorkoutName = async (workoutID, workoutName) => {
    try {
        const db = await getDBConnection();
        await db.executeSql(
            `UPDATE workouts SET workout_name = ? WHERE workout_id = ?`,
            [workoutName, workoutID]
        );
        return { message: 'Workout updated' };
    } catch (error) {
        console.error('Error updating workout:', error);
        throw error;
    }
};

export const addWorkoutNonDefault = async (sportID, workoutName, workoutDescription) => {
    const db = await getDBConnection();
    try {
        await db.executeSql('BEGIN TRANSACTION');
        const [result] = await db.executeSql(
            `INSERT INTO workouts (sport_id, workout_name, workout_description) VALUES (?, ?, ?)`,
            [sportID, workoutName, workoutDescription]
        );
        const workoutID = result.insertId;
        await db.executeSql('COMMIT');
        return { message: 'Workout saved', workoutID };
    } catch (error) {
        await db.executeSql('ROLLBACK');
        console.error('Error saving workout:', error);
        throw error;
    }
};

export const deleteWorkout = async (workoutID) => {
    try {
        const db = await getDBConnection();
        const [result] = await db.executeSql(
            `UPDATE workouts SET is_deleted = 1 WHERE workout_id = ?`,
            [workoutID]
        );
        if (result.rowsAffected === 0) {
            throw new Error('Workout not found');
        }
        return { message: 'Workout deleted successfully' };
    } catch (error) {
        console.error('Error deleting workout:', error);
        throw error;
    }
};

export const createSession = async (workoutID, startDate, endDate) => {
    const db = await getDBConnection();
    const toSQLiteDate = (isoString) => new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');

    try {
        await db.executeSql('BEGIN TRANSACTION');

        // 1. Get workout name
        const [workoutResult] = await db.executeSql(
            `SELECT workout_name FROM workouts WHERE workout_id = ?`,
            [workoutID]
        );
        const workoutName = workoutResult.rows.item(0).workout_name;

        // 2. Create session (no user_id)
        const [sessionResult] = await db.executeSql(
            `INSERT INTO workout_session (workout_id, started_at, end_at, statue, workout_name) VALUES (?, ?, ?, ?, ?)`,
            [workoutID, toSQLiteDate(startDate), toSQLiteDate(endDate), 'progress', workoutName]
        );
        const sessionID = sessionResult.insertId;

        // 3. Get all days for this workout
        const [daysResult] = await db.executeSql(
            `SELECT * FROM workouts_days WHERE workout_id = ?`,
            [workoutID]
        );

        for (let i = 0; i < daysResult.rows.length; i++) {
            const day = daysResult.rows.item(i);

            // 4. Insert a session-day row
            const [sessionDayResult] = await db.executeSql(
                `INSERT INTO workout_session_days (session_id, day_id, day_name) VALUES (?, ?, ?)`,
                [sessionID, day.day_id, day.day_name]
            );
            const sessionDayID = sessionDayResult.insertId;

            // 5. Get all exercises for this day
            const [exercisesResult] = await db.executeSql(
                `SELECT * FROM exercises WHERE day_id = ?`,
                [day.day_id]
            );

            // 6. Create a blank log entry for each exercise
            for (let j = 0; j < exercisesResult.rows.length; j++) {
                const exercise = exercisesResult.rows.item(j);
                await db.executeSql(
                    `INSERT INTO exercice_logs (day_id, exercise_id, ex_name, sets_completed, reps_completed, weight_kg, rest_sec) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [sessionDayID, exercise.id, exercise.ex_name, exercise.sets, exercise.reps, exercise.weight, exercise.rest]
                );
            }
        }

        await db.executeSql('COMMIT');
        return { message: 'Session created', sessionID, workoutID };
    } catch (error) {
        await db.executeSql('ROLLBACK');
        console.error('Error creating session:', error);
        throw error;
    }
};

export const getSessions = async () => {
    try {
        const db = await getDBConnection();
        // no user_id filter — returns all sessions
        const [results] = await db.executeSql(
            `SELECT ws.*,
                (SELECT COUNT(*) FROM workouts_days WHERE workout_id = ws.workout_id) AS days_per_week
            FROM workout_session ws
            WHERE ws.is_deleted = 0
            ORDER BY ws.started_at DESC`
        );
        const sessions = [];
        for (let i = 0; i < results.rows.length; i++) {
            sessions.push(results.rows.item(i));
        }
        return sessions;
    } catch (error) {
        console.error('Error fetching sessions:', error);
        throw error;
    }
};

export const completeSession = async (sessionID) => {
    try {
        const db = await getDBConnection();
        const [result] = await db.executeSql(
            `UPDATE workout_session SET statue = 'complete' WHERE id = ? AND is_deleted = 0`,
            [sessionID]
        );
        if (result.rowsAffected === 0) {
            throw new Error('Session not found');
        }
        return { message: 'Session completed successfully' };
    } catch (error) {
        console.error('Error completing session:', error);
        throw error;
    }
};
