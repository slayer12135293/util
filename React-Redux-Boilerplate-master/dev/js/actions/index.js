export const selectUser = (user) => {
    console.log('fire', user.first);
    return {
        type:"USER_SELECTED",
        payload: user
    }
};