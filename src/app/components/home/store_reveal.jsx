import { motion, AnimatePresence } from "framer-motion";

export default function StorePortal({ isOpen, onClose }) {
  const address =
    "Domestic murshid bazar dubai uae";

  const googleMapUrl =
    "https://maps.app.goo.gl/CXMJGx7RTyrsXzcm7";

  return (
    <>
      <style>{`
        .portal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1500;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(25px);
          overflow: hidden;
        }

        .gold-burst {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #d4af37 0%, #f6e27a 40%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .door {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(20px);
        }

        .left-door { left: 0; }
        .right-door { right: 0; }

        .store-container {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .luxury-store {
          width: 100%;
          max-width: 1100px;
          background: linear-gradient(145deg, #ffffff, #fdf8ef);
          border-radius: 30px;
          padding: 60px 40px;
          box-shadow: 0 40px 120px rgba(0,0,0,0.25);
          position: relative;
          text-align: center;
        }

        .luxury-store h1 {
          margin: 0 0 20px;
          font-size: clamp(28px, 4vw, 48px);
          background: linear-gradient(90deg, #b9932f, #f6e27a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .address-box {
          margin-bottom: 35px;
          font-size: 16px;
          color: #555;
        }

        .map-link {
          display: inline-block;
          margin-top: 10px;
          font-weight: 600;
          color: #b9932f;
          text-decoration: none;
          position: relative;
          transition: 0.3s ease;
        }

        .map-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0%;
          height: 2px;
          background: #d4af37;
          transition: 0.3s ease;
        }

        .map-link:hover::after {
          width: 100%;
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 25px;
          font-size: 20px;
          border: none;
          background: none;
          cursor: pointer;
        }

        .store-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }

        .product-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          transition: 0.4s ease;
        }

        .product-card img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          border-radius: 15px;
        }

        .product-card p {
          margin-top: 15px;
          font-weight: 600;
        }

        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 70px rgba(212,175,55,0.4);
        }

        @media (max-width: 768px) {
          .luxury-store {
            padding: 40px 20px;
          }
          .product-card img {
            height: 200px;
          }
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="portal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="gold-burst"
              initial={{ scale: 0 }}
              animate={{ scale: 80 }}
              exit={{ scale: 0 }}
              transition={{ duration: 1 }}
            />

            <motion.div
              className="door left-door"
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              exit={{ x: 0 }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="door right-door"
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              exit={{ x: 0 }}
              transition={{ duration: 1 }}
            />

            <motion.div
              className="store-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.8 }}
            >
              <div className="luxury-store">
                <button className="close-btn" onClick={onClose}>
                  ✕
                </button>

                <h1>Visit Our Stores</h1>

                <div className="address-box">
                  <strong>Shop Name:</strong> {address}
                  <br />
                  <a
                    href={googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    📍 View on Google Maps
                  </a>
                </div>

                <div className="store-grid">
                  <div className="product-card">
                    <img src="https://res.cloudinary.com/dvagrhc2w/image/upload/just_gold/products/variants/e96a7jmqxljp3ihdvgw7.jpg" />
                    <p>CHUBBY OIL LIPSPLASH</p>
                  </div>

                  <div className="product-card">
                    <img src="https://res.cloudinary.com/dvagrhc2w/image/upload/just_gold/products/images/ybx6ocbnrp5nvwmftq8k.jpg"/>
                    <p>HD MAKE-UP BASE PRIMER</p>
                  </div>

                  <div className="product-card">
                    <img src="https://res.cloudinary.com/dvagrhc2w/image/upload/just_gold/products/images/m5azurt97bht0w3ymrjq.jpg"/>
                    <p>MATTE MAKEUP SETTING SPRAY</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
