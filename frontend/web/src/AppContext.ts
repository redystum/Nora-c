import {createContext} from 'preact';
import {useContext} from "preact/hooks";
import {CreateFileOrFolderModalState} from "./index";

interface AppContextProps {
    setIsGlobalLoading: (value: (((prevState: boolean) => boolean) | boolean)) => void;
    setCanRunCurrentFile: (value: (((prevState: boolean) => boolean) | boolean)) => void;
    backendURL: string | null;
    wsURL?: string | null;
    openOpenProjectModal?: () => void;
    showError: (error: string) => void;
    setIsCreateFileOrFolderModalOpen: (value: (((prevState: CreateFileOrFolderModalState | null) =>
        CreateFileOrFolderModalState | null) | CreateFileOrFolderModalState | null)) => void;
}


const AppContext = createContext<AppContextProps>({
    setIsGlobalLoading: _ => false,
    setCanRunCurrentFile: _ => false,
    backendURL: null,
    wsURL: null,
    openOpenProjectModal: null,
    showError: (error: string) => alert(error),
    setIsCreateFileOrFolderModalOpen: _ => null,
});
export const useAppContext = () => useContext(AppContext);
export default AppContext;