import { createContext, useContext, useState, ReactNode } from 'react';

interface ContextProps {
    tokenAuth?: string;
    setToken(token:string): void;
}

const DefaultValue = {
    tokenAuth: '',
    setToken: (token: string) => null,
};

const TokenContext = createContext<ContextProps>(DefaultValue);

export function TokenProvider({ children }: {children?: ReactNode;}) {
    const [tokenAuth, setTokenAuth] = useState<string>('');
    const setToken = (token: string) => setTokenAuth(token);

    return (<TokenContext.Provider value={{
        setToken,
        tokenAuth,
    }}>
        {children}
    </TokenContext.Provider>)
}

export function useToken() {
    return useContext(TokenContext);
}