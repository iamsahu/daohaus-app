import React, { useState } from 'react';
import { Flex, FormControl } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import { useTX } from '../contexts/TXContext';
import { InputFactory } from './inputFactory';
import { FormFooter } from './staticElements';

import { checkFormTypes, validateRequired } from '../utils/validation';

const mapInRequired = (fields, required) => {
  return fields.map(field =>
    required.includes(field.name) ? { ...field, required: true } : field,
  );
};

export const inputDataFromABI = inputs => {
  const getType = type => {
    if (type === 'string' || type === 'address') {
      return type;
    }
    if (type.includes('int')) {
      return 'integer';
    }
    if (type === 'fixed' || type === 'ufixed') {
      return 'number';
    }
    return 'any';
  };

  const labels = {
    string: 'Enter text here',
    number: 'Numbers only',
    integer: 'Whole numbers only',
    address: '0x',
    urlNoHttp: 'www.example.fake',
  };

  return inputs.map(input => {
    const localType = getType(input.type);
    return {
      type: input.type.includes('[]') ? 'multiInput' : 'input',
      label: input.name,
      name: `*abiInput*${input.name}`,
      htmlFor: `*abiInput*${input.name}`,
      placeholder: labels[localType] || input.type,
      expectType: getType(localType),
      required: true,
    };
  });
};

const ProposalForm = props => {
  const { submitTransaction, handleCustomValidation } = useTX();
  const { fields, additionalOptions = null, required = [] } = props;

  const [loading, setLoading] = useState(false);
  const [formFields, setFields] = useState(mapInRequired(fields, required));
  const [abiOptions, setABIOptions] = useState(null);

  const [options, setOptions] = useState(additionalOptions);
  const localForm = useForm();
  const { handleSubmit } = localForm;

  const watching = localForm.watch();
  console.log(watching);

  const addOption = e => {
    const selectedOption = options.find(
      option => option.htmlFor === e.target.value,
    );
    setOptions(options.filter(option => option.htmlFor !== e.target.value));
    setFields([...formFields, selectedOption]);
  };

  const buildABIOptions = abiString => {
    if (!abiString || typeof abiString !== 'string') return;
    if (abiString === 'clear') {
      setFields(mapInRequired(fields, required));
    } else {
      const abiInputs = JSON.parse(abiString)?.inputs;
      setFields(prevState => [...prevState, ...inputDataFromABI(abiInputs)]);
    }
  };

  const updateErrors = errors => {
    setFields(prevFields =>
      prevFields.map(field => {
        const error = errors.find(error => error.name === field.name);
        if (error) {
          return { ...field, error };
        }
        return { ...field, error: false };
      }),
    );
  };
  const clearErrors = () => {
    setFields(prevFields =>
      prevFields.map(field => ({ ...field, error: false })),
    );
  };
  const onSubmit = async values => {
    clearErrors();
    const missingVals = validateRequired(
      values,
      formFields.filter(field => field.required),
    );
    if (missingVals) {
      updateErrors(missingVals);
      return;
    }
    const typeErrors = checkFormTypes(values, formFields);
    if (typeErrors) {
      updateErrors(typeErrors);
      return;
    }
    const customValErrors = handleCustomValidation({ values, formData: props });

    if (customValErrors) {
      updateErrors(customValErrors);
      return;
    }
    try {
      await submitTransaction({
        values,
        proposalLoading: setLoading,
        formData: props,
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex flexDir='column'>
        <FormControl display='flex' mb={5}>
          <Flex w='100%' flexWrap='wrap' justifyContent='space-between'>
            {formFields?.map(field => {
              return (
                <InputFactory
                  key={field?.htmlFor || field?.name}
                  {...field}
                  minionType={props.minionType}
                  localForm={localForm}
                  buildABIOptions={buildABIOptions}
                />
              );
            })}
            {/* {abiOptions?.map(field => {
              return (
                <InputFactory
                  key={field?.htmlFor || field?.name}
                  {...field}
                  minionType={props.minionType}
                  localForm={localForm}
                  buildABIOptions={buildABIOptions}
                />
              );
            })} */}
          </Flex>
        </FormControl>
        <FormFooter options={options} addOption={addOption} loading={loading} />
      </Flex>
    </form>
  );
};

export default ProposalForm;
