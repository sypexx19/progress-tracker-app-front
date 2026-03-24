import { createContext, useContext, useState, useCallback } from 'react';

const ExerciseQueueContext = createContext();

export const ExerciseQueueProvider = ({ children }) => {
    const [pendingExercises, setPendingExercises] = useState([]);

    const addExercise = useCallback((newExercise) => {
        setPendingExercises(prev => [
            ...prev,
            { ...newExercise, key: `${newExercise.sourceId}_${Date.now()}` }
        ]);
    }, []);

    const removeExercise = useCallback((key) => {
        setPendingExercises(prev => prev.filter(ex => ex.key !== key));
    }, []);

    const clearQueue = useCallback(() => {
        setPendingExercises([]);
    }, []);

    return (
        <ExerciseQueueContext.Provider value={{ pendingExercises, addExercise, removeExercise, clearQueue }}>
            {children}
        </ExerciseQueueContext.Provider>
    );
};

export const useExerciseQueue = () => useContext(ExerciseQueueContext);
