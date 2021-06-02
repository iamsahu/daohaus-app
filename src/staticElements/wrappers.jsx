import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Tooltip, Link } from '@chakra-ui/react';
import ToolTipLabel from '../components/toolTipLabel';

export const LinkWrapper = ({ children, link }) =>
  link ? (
    <Box as={Link} to={link}>
      {children}
    </Box>
  ) : (
    <Box>{children}</Box>
  );

//  CHAKRA BUG
//  Tooltips and likely other React.portal elements like popover
//  will not be able to nest a component like LinkWrapper
//  This will happen because libs like React-Router or React Icons do not
//  Export forward.refs.

//  As a consequence, many third party deps will not be able to be extracted into
//  wrapper and instead will need to be defined here.

export const ToolTipWrapper = ({
  children,
  tooltipText,
  tooltip,
  bg = 'primary.500',
  placement = 'top',
  link,
  layoutProps,
  href,
}) => {
  const getLinkBox = () => {
    if (href) {
      return (
        <Box as={Link} href={href}>
          {children}
        </Box>
      );
    }
    if (link) {
      return (
        <Box as={RouterLink} to={link}>
          {children}
        </Box>
      );
    }
    return <Box>{children}</Box>;
  };
  if (!tooltip) {
    return getLinkBox();
  }
  return (
    <Tooltip
      hasArrow
      label={tooltipText && <ToolTipLabel text={tooltipText} />}
      bg={bg}
      placement={placement}
      shouldWrapChildren
      {...layoutProps}
    >
      {getLinkBox()}
    </Tooltip>
  );
};
