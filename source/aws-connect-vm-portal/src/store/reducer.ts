import {combineReducers} from "redux";

import authReducer from './reducers/auth.reducer';
import agentsReducer from './reducers/agents.reducer';
import globalSettingsReducer from './reducers/global-settings.reducer';
import contactFlowReducer from './reducers/contact-flow.reducer';

const rootReducer = combineReducers({
    auth: authReducer,
    agents: agentsReducer,
    globalSettings: globalSettingsReducer,
    contactFlow: contactFlowReducer
});

export default rootReducer;