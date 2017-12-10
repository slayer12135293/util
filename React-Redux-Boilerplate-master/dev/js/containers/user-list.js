import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {selectUser} from '../actions/index';

class UserList  extends Component {   
    
    createListItems() {
        const {users, selectUser}= this.props;

        return users.map(user=>{
            return (
                <li key={user.id} onClick={()=>selectUser(user)}>{user.first} {user.last}</li>
            );
        });
    }

    render(){
        return (
            <ul>
                {this.createListItems()}
            </ul>
        )
    }
}

function mapStatetoProps(state){
    return {
        users: state.users
    };
}

function matchDispatchToProps(dispatch){
    return bindActionCreators({
        selectUser: selectUser
    },dispatch)
}



export default connect(mapStatetoProps,matchDispatchToProps)(UserList);
