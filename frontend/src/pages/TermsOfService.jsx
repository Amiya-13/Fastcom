import './LegalPages.css';

const TermsOfService = () => {
    return (
        <div className="legal-page">
            <div className="container">
                <div className="legal-content glass-card">
                    <h1 className="text-gradient">Terms of Service</h1>
                    <p className="last-updated">Last updated: January 13, 2026</p>

                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using FastCom ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2>2. Description of Service</h2>
                        <p>
                            FastCom is an e-commerce platform that connects customers with local vendors. We facilitate transactions between buyers and sellers but are not directly involved in the actual transaction between users.
                        </p>
                    </section>

                    <section>
                        <h2>3. User Accounts</h2>
                        <h3>Registration</h3>
                        <ul>
                            <li>You must provide accurate and complete information during registration</li>
                            <li>You are responsible for maintaining the confidentiality of your account</li>
                            <li>You must be at least 18 years old to create an account</li>
                            <li>You agree to notify us immediately of any unauthorized use</li>
                        </ul>

                        <h3>Account Types</h3>
                        <ul>
                            <li><strong>Customer Accounts:</strong> For browsing and purchasing products</li>
                            <li><strong>Shopkeeper Accounts:</strong> For listing and selling products (₹299/month after 1-month free trial)</li>
                            <li><strong>Admin Accounts:</strong> For platform management</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Platform Fees and Commissions</h2>
                        <ul>
                            <li><strong>Transaction Fee:</strong> 3% commission on all successful orders</li>
                            <li><strong>Shopkeeper Subscription:</strong> ₹299 per month (1-month free trial for new shopkeepers)</li>
                            <li>All fees are non-refundable unless otherwise stated</li>
                            <li>We reserve the right to change fees with prior notice</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Prohibited Activities</h2>
                        <p>You agree NOT to:</p>
                        <ul>
                            <li>Violate any laws or regulations</li>
                            <li>Infringe on intellectual property rights</li>
                            <li>Post false, misleading, or fraudulent content</li>
                            <li>Sell counterfeit or illegal products</li>
                            <li>Engage in price manipulation or unfair practices</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Interfere with the platform's operation</li>
                            <li>Use automated systems to access the platform</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Product Listings (For Shopkeepers)</h2>
                        <ul>
                            <li>You are responsible for the accuracy of product descriptions</li>
                            <li>All products must comply with applicable laws</li>
                            <li>You must maintain adequate stock levels</li>
                            <li>Product images must accurately represent the item</li>
                            <li>Pricing must be fair and transparent</li>
                        </ul>
                    </section>

                    <section>
                        <h2>7. Orders and Payments</h2>
                        <h3>For Customers</h3>
                        <ul>
                            <li>All orders are subject to acceptance by the seller</li>
                            <li>Prices are as displayed at the time of order</li>
                            <li>Payment must be completed to confirm orders</li>
                            <li>You are responsible for providing accurate delivery information</li>
                        </ul>

                        <h3>For Shopkeepers</h3>
                        <ul>
                            <li>You must fulfill orders in a timely manner</li>
                            <li>You are responsible for product quality and delivery</li>
                            <li>Earnings are subject to platform commission (3%)</li>
                            <li>Refunds and returns are at your discretion per your policies</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Intellectual Property</h2>
                        <p>
                            All content on FastCom, including logos, design, text, and graphics, is the property of FastCom or its licensors and is protected by intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2>9. Disclaimers and Limitations</h2>
                        <ul>
                            <li>The platform is provided "as is" without warranties</li>
                            <li>We do not guarantee uninterrupted or error-free service</li>
                            <li>We are not responsible for the quality of products sold by vendors</li>
                            <li>We are not liable for disputes between buyers and sellers</li>
                            <li>Our liability is limited to the maximum extent permitted by law</li>
                        </ul>
                    </section>

                    <section>
                        <h2>10. Termination</h2>
                        <p>We reserve the right to:</p>
                        <ul>
                            <li>Suspend or terminate accounts that violate these terms</li>
                            <li>Remove content that violates our policies</li>
                            <li>Refuse service to anyone for any reason</li>
                            <li>Modify or discontinue the platform at any time</li>
                        </ul>
                    </section>

                    <section>
                        <h2>11. Governing Law</h2>
                        <p>
                            These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
                        </p>
                    </section>

                    <section>
                        <h2>12. Changes to Terms</h2>
                        <p>
                            We may modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2>13. Contact Information</h2>
                        <p>For questions about these Terms, contact us at:</p>
                        <ul>
                            <li>Email: legal@fastcom.com</li>
                            <li>Phone: +91 1800-FASTCOM</li>
                            <li>Address: FastCom Headquarters, India</li>
                        </ul>
                    </section>

                    <div className="acceptance-notice">
                        <p>
                            <strong>By using FastCom, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
