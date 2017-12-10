import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';


class UserDetail extends Component {
    render(){
        const {user} = this.props;
        return (
            <div>
                <img src={user.thumbnail}/>
                <h2> {user.first}  {user.last}</h2>
            </div>
        )
    }
}

function mapStatetoProps(state){
    return {
        user: state.activeUser
    };
}

export default connect(mapStatetoProps)(UserDetail)