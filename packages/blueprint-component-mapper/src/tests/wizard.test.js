import React from 'react';
import { FormRenderer, componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { componentMapper, FormTemplate } from '../index';
import { CONDITIONAL_SUBMIT_FLAG } from '@data-driven-forms/common/wizard';

describe('wizard', () => {
  let initialProps;
  let schema;
  let onSubmit;
  let onCancel;

  beforeEach(() => {
    schema = {
      fields: [
        {
          component: componentTypes.WIZARD,
          name: 'wizard',
          fields: [
            {
              name: 'first-step',
              nextStep: 'summary',
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'aws',
                  validate: [{ type: validatorTypes.REQUIRED }],
                  'aria-label': 'aws',
                },
              ],
            },
            {
              name: 'summary',
              fields: [
                {
                  component: componentTypes.TEXTAREA,
                  name: 'summary',
                  'aria-label': 'summary',
                },
              ],
            },
          ],
        },
      ],
    };
    onSubmit = jest.fn();
    onCancel = jest.fn();
    initialProps = {
      componentMapper,
      FormTemplate: (props) => <FormTemplate {...props} showFormControls={false} />,
      schema,
      onSubmit: (values) => onSubmit(values),
      onCancel: (values) => onCancel(values),
    };
  });

  it('simple next and back', async () => {
    render(<FormRenderer {...initialProps} />);

    expect(screen.getByLabelText('aws')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Next'));

    expect(screen.getByLabelText('aws')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('aws'), 'something');
    await userEvent.click(screen.getByText('Next'));

    expect(screen.getByLabelText('summary')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Back'));

    expect(screen.getByLabelText('aws')).toBeInTheDocument();
  });

  it('conditional next', async () => {
    schema = {
      fields: [
        {
          component: componentTypes.WIZARD,
          name: 'wizard',
          fields: [
            {
              name: 'first-step',
              nextStep: {
                when: 'aws',
                stepMapper: {
                  aws: 'summary',
                  google: 'google',
                },
              },
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'aws',
                  validate: [{ type: validatorTypes.REQUIRED }],
                  'aria-label': 'aws',
                },
              ],
            },
            {
              name: 'summary',
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'summary',
                  'aria-label': 'summary',
                },
              ],
            },
            {
              name: 'google',
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'googlesummary',
                  'aria-label': 'googlesummary',
                },
              ],
            },
          ],
        },
      ],
    };

    render(<FormRenderer {...initialProps} schema={schema} />);

    await userEvent.type(screen.getByLabelText('aws'), 'aws');
    await userEvent.click(screen.getByText('Next'));

    expect(screen.getByLabelText('summary')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Back'));
    await userEvent.clear(screen.getByLabelText('aws'));
    await userEvent.type(screen.getByLabelText('aws'), 'google');
    await userEvent.click(screen.getByText('Next'));

    expect(screen.getByLabelText('googlesummary')).toBeInTheDocument();
  });

  it('conditional submit', async () => {
    schema = {
      fields: [
        {
          component: componentTypes.WIZARD,
          name: 'wizard',
          fields: [
            {
              name: 'first-step',
              nextStep: {
                when: 'aws',
                stepMapper: {
                  aws: 'summary',
                  google: 'google',
                },
              },
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'aws',
                  validate: [{ type: validatorTypes.REQUIRED }],
                  'aria-label': 'aws',
                },
              ],
            },
            {
              name: 'summary',
              fields: [
                {
                  component: componentTypes.TEXTAREA,
                  name: 'summary',
                  'aria-label': 'summary',
                },
              ],
            },
            {
              name: 'google',
              fields: [
                {
                  component: componentTypes.TEXTAREA,
                  name: 'googlesummary',
                  'aria-label': 'googlesummary',
                },
              ],
            },
          ],
        },
      ],
    };

    render(<FormRenderer {...initialProps} schema={schema} />);

    await userEvent.type(screen.getByLabelText('aws'), 'aws');
    await userEvent.click(screen.getByText('Next'));
    await userEvent.type(screen.getByLabelText('summary'), 'summary');

    await userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      aws: 'aws',
      summary: 'summary',
    });
    onSubmit.mockClear();

    await userEvent.click(screen.getByText('Back'));
    await userEvent.clear(screen.getByLabelText('aws'));
    await userEvent.type(screen.getByLabelText('aws'), 'google');
    await userEvent.click(screen.getByText('Next'));

    await userEvent.type(screen.getByLabelText('googlesummary'), 'google summary');

    await userEvent.click(screen.getByText('Submit'));
    expect(onSubmit).toHaveBeenCalledWith({
      aws: 'google',
      googlesummary: 'google summary',
    });
    onSubmit.mockClear();
  });

  it('sends values to cancel', async () => {
    render(<FormRenderer {...initialProps} />);

    await userEvent.type(screen.getByLabelText('aws'), 'something');

    await userEvent.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledWith({
      aws: 'something',
    });
  });

  it('conditional submit step', async () => {
    const submit = jest.fn();
    schema = {
      fields: [
        {
          component: componentTypes.WIZARD,
          name: 'wizard',
          fields: [
            {
              name: 'first-step',
              nextStep: {
                when: 'name',
                stepMapper: {
                  aws: 'summary',
                  submit: CONDITIONAL_SUBMIT_FLAG,
                },
              },
              fields: [
                {
                  component: componentTypes.TEXT_FIELD,
                  name: 'name',
                  validate: [{ type: validatorTypes.REQUIRED }],
                  'aria-label': 'name',
                },
              ],
            },
          ],
        },
      ],
    };

    render(<FormRenderer {...initialProps} onSubmit={submit} schema={schema} />);

    await userEvent.type(screen.getByLabelText('name'), 'summary');

    expect(screen.getByText('Next')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('name'));
    await userEvent.type(screen.getByLabelText('name'), 'submit');

    expect(screen.getByText('Submit')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Submit'));

    expect(submit).toHaveBeenCalledWith({ name: 'submit' }, expect.any(Object), expect.any(Object));
  });
});
