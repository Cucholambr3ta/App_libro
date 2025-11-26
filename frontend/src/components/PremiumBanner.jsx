import React from 'react';
import './PremiumBanner.css';

/**
 * Banner promocional para usuarios gratuitos
 */
const PremiumBanner = () => {
  const handleUpgrade = () => {
    // En producción, esto redirigirá a la página de Stripe o IAP
    alert('Funcionalidad de pago en desarrollo. En producción, esto abrirá el flujo de pago con Stripe.');
  };

  return (
    <div className="premium-banner gradient-primary">
      <div className="container">
        <div className="banner-content">
          <div className="banner-text">
            <h2>✨ Desbloquea Recetas Premium</h2>
            <p>Accede a cientos de recetas exclusivas, trucos de chef, y videos paso a paso</p>
          </div>
          <button onClick={handleUpgrade} className="btn btn-social banner-btn">
            Actualizar a Premium
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumBanner;
