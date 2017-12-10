const initState = '';

export default function (state=initState, action) {
    
    switch(action.type){
        case "USER_SELECTED":
        return action.payload;
        break;
    }
    return state;
}