/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalculatorView } from './components/calculator/CalculatorView';
import { VaultDashboard } from './components/vault/VaultDashboard';

export default function App() {
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);

  // Desbloqueo encubierto: invocado cuando se ingresa el código secreto en la calculadora y se pulsa '='
  const handleUnlock = () => {
    setIsVaultUnlocked(true);
  };

  // Bloqueo y retorno a la calculadora pública
  const handleLock = () => {
    setIsVaultUnlocked(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0c]">
      {isVaultUnlocked ? (
        <VaultDashboard onLock={handleLock} />
      ) : (
        <CalculatorView onUnlockSecretVault={handleUnlock} />
      )}
    </div>
  );
}
