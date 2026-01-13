import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <img src="/logo.jpg" alt="FastCom" className="footer-logo" />
                        <span className="footer-title">FastCom</span>
                    </div>

                    <div className="footer-links">
                        <a href="/about">About</a>
                        <a href="/contact">Contact</a>
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 FastCom.</p>
                    <p className="amiya-watermark">All rights reserved to Amiya</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
