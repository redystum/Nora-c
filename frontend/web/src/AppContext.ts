import {createContext} from 'preact';
import {useContext} from "preact/hooks";

interface AppContextProps {
    setIsGlobalLoading: (value: (((prevState: boolean) => boolean) | boolean)) => void;
    backendURL: string | null;
    wsURL?: string | null;
    openOpenProjectModal?: () => void;
}


const AppContext = createContext<AppContextProps>({
    setIsGlobalLoading: _ => false,
    backendURL: null,
    wsURL: null,
    openOpenProjectModal: null
});
export const useAppContext = () => useContext(AppContext);
export default AppContext;