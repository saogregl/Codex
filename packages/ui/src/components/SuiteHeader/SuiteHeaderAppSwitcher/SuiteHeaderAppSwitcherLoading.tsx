/* eslint-disable no-script-url */

import React from 'react';
import PropTypes from 'prop-types';
  // @ts-ignore

import { ButtonSkeleton, SkeletonText } from '@carbon/react';

import { settings } from '../../../constants/settings';

const defaultProps = {
  testId: 'suite-header-app-switcher',
};

const propTypes = {
  testId: PropTypes.string,
};

const SuiteHeaderAppSwitcherLoading = ({ testId }) => {
  const baseClassName = `${settings.iotPrefix}--suite-header-app-switcher`;
  return (
    <ul data-testid={`${testId}--loading`} className={baseClassName}>
      <li className={`${baseClassName}--nav-link`}>
        <div className={`${baseClassName}--nav-link--button--loading`}>
          <ButtonSkeleton />
        </div>
      </li>
      <li>
        <div className={`${baseClassName}--nav-link--loading`}>
          <SkeletonText paragraph lineCount={3} />
        </div>
      </li>
    </ul>
  );
};

SuiteHeaderAppSwitcherLoading.defaultProps = defaultProps;
SuiteHeaderAppSwitcherLoading.propTypes = propTypes;

export default SuiteHeaderAppSwitcherLoading;
