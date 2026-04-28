const Footer = () => {
    return (
        <footer className="footer-shell">
            <div className="footer-left">
                <img src="/graphscholar-logo.png" alt="GraphScholar Logo" className="footer-logo" />
                <span className="footer-copyright">© 2026 GraphScholar. Tüm hakları saklıdır.</span>
            </div>
            <div className="footer-right">
                <div className="footer-links">
                    <a href="#">Gizlilik Politikası</a>
                    <a href="#">Kullanım Şartları</a>
                    <a href="#">Yardım</a>
                </div>
                <span className="footer-version">v1.0.0</span>
            </div>
        </footer>
    );
};

export default Footer;
