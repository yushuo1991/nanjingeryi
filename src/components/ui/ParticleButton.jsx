import React from 'react';
import PropTypes from 'prop-types';

/**
 * ParticleButton - Animated button with particle effects
 *
 * A visually striking button with animated particle effects on hover.
 * Supports different color variants and maintains consistent styling.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content (text, icons, etc.)
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant] - Color variant: 'default' | 'cyan' | 'emerald' | 'red'
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.type] - Button type attribute
 */
const ParticleButton = React.memo(({
  children,
  onClick,
  className = '',
  variant = 'default',
  disabled = false,
  type = 'button',
  ...rest
}) => {
  const variantClass = variant !== 'default' ? `btn-particle-${variant}` : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-particle ${variantClass} ${className}`}
      {...rest}
    >
      <div className="points_wrapper">
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
      </div>
      <span className="inner">
        {children}
      </span>
    </button>
  );
});

ParticleButton.displayName = 'ParticleButton';

ParticleButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'cyan', 'emerald', 'red']),
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

ParticleButton.defaultProps = {
  onClick: undefined,
  className: '',
  variant: 'default',
  disabled: false,
  type: 'button',
};

export default ParticleButton;
