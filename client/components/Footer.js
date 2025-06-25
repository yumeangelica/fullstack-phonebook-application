import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer">
      <label>© 2023 - {currentYear} yumeangelica.github.io. All Rights Reserved.</label>
    </div>
  )
}

export default Footer
