const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        © 2023 - {currentYear}{' '}
        <a href="https://yumeangelica.github.io">yumeangelica.github.io</a>. All
        Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
