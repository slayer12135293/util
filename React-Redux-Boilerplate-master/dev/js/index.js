import 'babel-polyfill';
import React from 'react';
import ReactDOM from "react-dom";
import {applyMiddleware, createStore} from "redux";
import {Provider} from "react-redux";
import allReducers from "./reducers";
import App from './components/app';
import { createLogger } from 'redux-logger'

const logger = createLogger({
    predicate: true,
    diff: true,
})


const store = createStore(allReducers,
    applyMiddleware(
        logger,
    ));

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>
    , document.getElementById('root')
);
