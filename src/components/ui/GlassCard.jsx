import React from 'react';
import PropTypes from 'prop-types';

/**
 * GlassCard - Reusable glass morphism card component
 *
 * A beautiful frosted glass effect card with backdrop blur and subtle borders.
 * Used throughout the app for consistent visual design.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onClick] - Click handler
 * @param {Object} [props.style] - Inline styles
 */
const GlassCard = React.memo(({
  children,
  className = '',
  onClick,
  style,
  ...rest
}) => {
  return (
    <div
      className={`bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-sm ${className}`}
      onClick={onClick}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.object,
};

GlassCard.defaultProps = {
  className: '',
  onClick: undefined,
  style: undefined,
};

export default GlassCard;
