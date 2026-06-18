const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer">
      <p>© 2023 - {currentYear} yumeangelica.github.io. All Rights Reserved.</p>
    </div>
  );
};

export default Footer;
