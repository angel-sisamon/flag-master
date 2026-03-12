'use strict';

// Namespace pattern for global state management
const AppState = (() => {
    let state = {};

    const setState = (key, value) => {
        state[key] = value;
    };

    const getState = (key) => {
        return state[key];
    };

    const getAllState = () => {
        return state;
    };

    return {
        setState,
        getState,
        getAllState
    };
})();

// Example usage:
AppState.setState('user', { name: 'John Doe', age: 30 });
console.log(AppState.getState('user')); // { name: 'John Doe', age: 30 }
