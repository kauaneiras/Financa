"use client";

import { ReactNode, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import Fab, { FabAction } from "./Fab";
import AddTransactionModal from "./modals/AddTransactionModal";
import AddAccountModal from "./modals/AddAccountModal";
import AddRecurringModal from "./modals/AddRecurringModal";

type TxType = "EXPENSE" | "INCOME" | "SUBSCRIPTION" | "INVESTMENT";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  const hideNav = path === "/auth";

  const [txModal,  setTxModal]  = useState(false);
  const [txType,   setTxType]   = useState<TxType>("EXPENSE");
  const [accModal, setAccModal] = useState(false);
  const [recModal, setRecModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFab = useCallback((action: FabAction) => {
    switch (action) {
      case "expense":      setTxType("EXPENSE");      setTxModal(true); break;
      case "income":       setTxType("INCOME");        setTxModal(true); break;
      case "investment":   setTxType("INVESTMENT");     setTxModal(true); break;
      case "subscription": setTxType("SUBSCRIPTION");   setTxModal(true); break;
      case "account":      setAccModal(true); break;
      case "recurring":    setRecModal(true); break;
    }
  }, []);

  const handleSaved = useCallback(() => {
    setTxModal(false); setAccModal(false); setRecModal(false);
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <>
      <div id="main-content" data-refresh={refreshKey}
        style={{ maxWidth: 480, margin: "0 auto", width: "100%", minHeight: "100vh" }}>
        {children}
      </div>
      {!hideNav && (
        <>
          <BottomNav />
          <Fab onAction={handleFab} />
        </>
      )}
      <AddTransactionModal
        isOpen={txModal}
        defaultType={txType}
        onClose={() => setTxModal(false)}
        onSaved={handleSaved}
      />
      <AddAccountModal
        isOpen={accModal}
        onClose={() => setAccModal(false)}
        onSaved={handleSaved}
      />
      <AddRecurringModal
        isOpen={recModal}
        onClose={() => setRecModal(false)}
        onSaved={handleSaved}
      />
    </>
  );
}
