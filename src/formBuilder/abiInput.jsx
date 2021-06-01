import { Spinner } from '@chakra-ui/spinner';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { validate } from '../utils/validation';
import GenericSelect from './genericSelect';
import GenericTextarea from './genericTextArea';
import { ModButton } from './staticElements';
import {
  fetchABI,
  getABIfunctions,
  formatFNsAsSelectOptions,
} from '../utils/abi';

const AbiInput = props => {
  const { localForm } = props;
  const { daochain } = useParams();
  const [isRawHex, setRawHex] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(null);

  const targetContract = localForm.watch('targetContract');
  const abiInput = localForm.watch('abiInput');
  const helperText = isDisabled && 'Please enter a target contract';

  useEffect(() => {
    const getABI = async () => {
      try {
        setLoading(true);
        setIsDisabled(false);
        const abi = await fetchABI(targetContract, daochain);
        const fns = formatFNsAsSelectOptions(getABIfunctions(abi));
        setOptions(fns);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    if (targetContract && validate.address(targetContract)) {
      getABI();
    } else {
      setIsDisabled(true);
    }
  }, [targetContract]);

  useEffect(() => {
    if (abiInput) {
      props.buildABIOptions(abiInput);
    } else {
      props.buildABIOptions('clear');
    }
  }, [abiInput]);

  const switchElement = () => {
    setRawHex(prevState => !prevState);
    props.buildABIOptions('clear');
  };

  return (
    <>
      {isRawHex ? (
        <GenericTextarea
          {...props}
          disabled={isDisabled}
          helperText={helperText}
          btn={<ModButton label='Address' callback={switchElement} />}
          h={40}
        />
      ) : (
        <GenericSelect
          {...props}
          placeholder='Select function'
          options={options}
          disabled={isDisabled}
          helperText={helperText}
          btn={
            <ModButton
              label={loading ? <Spinner size='sm' /> : 'Raw Hex'}
              callback={switchElement}
            />
          }
        />
      )}
    </>
  );
};

export default AbiInput;
