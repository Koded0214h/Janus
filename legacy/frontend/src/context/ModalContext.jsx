import React, { createContext, useContext, useState, useCallback } from "react";
import Modal from "@/components/ui/Modal";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    confirmText: "Acknowledge",
    cancelText: "Cancel",
    isConfirm: false,
    isPrompt: false,
    placeholder: "Enter details..."
  });

  const showModal = useCallback((title, message, type = "info", options = {}) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: options.onConfirm || null,
      confirmText: options.confirmText || "Acknowledge",
      cancelText: options.cancelText || "Cancel",
      isConfirm: options.isConfirm || false,
      isPrompt: options.isPrompt || false,
      placeholder: options.placeholder || "Enter details..."
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        isConfirm={modalState.isConfirm}
        isPrompt={modalState.isPrompt}
        placeholder={modalState.placeholder}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
