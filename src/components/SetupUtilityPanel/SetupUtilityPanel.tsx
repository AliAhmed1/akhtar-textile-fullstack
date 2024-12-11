"use client";

import { Button, Input } from "antd";

interface SetupUtilityPanelProps {
    placeholder: string;
    setQuery: (query: string) => void;
    showModal: () => void;
    buttonText: string;
}

const SetupUtilityPanel: React.FC<SetupUtilityPanelProps> = ({
    placeholder,
    setQuery,
    showModal,
    buttonText
}) => {
    return (
        <>
        <Input
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm transition-all duration-300 hover:border-blue-500 hover:border-r rounded-2xl"
          />
          
          <Button 
            type="primary"
            onClick={showModal}
            style={{ backgroundColor: '#797FE7' }}
            className="px-4 py-2"
          >
            {buttonText}
          </Button>
          </>
    );
};

export default SetupUtilityPanel;