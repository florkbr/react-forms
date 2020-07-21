import set from 'lodash/set';
import get from 'lodash/get';
import AnyObject from './any-object';

const getFormValues = (state: AnyObject) =>
  state.registeredFields.reduce((acc: AnyObject, name: string) => {
    return set(acc, name, state.fieldListeners?.[name]?.getFieldState().value || get(state.values, name));
  }, {});

export default getFormValues;
