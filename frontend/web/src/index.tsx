import {render} from 'preact';
import {useState, useEffect} from "preact/hooks";
import './style.css';
import {Home} from './pages/home';
import {OpenProjectModal} from "./components/openProjetcModal";
import {CreateProjectModal} from "./components/createProjectModal";
import type {Project} from "./components/openProjetcModal";
import AppContext from "./AppContext";
import {LoadingScreen} from "./components/LoadingScreen";
import {Toast} from "./components/Toast";
import {CreateFileOrFolder} from "./components/CreateFileOrFolder";



export interface CreateFileOrFolderModalState {
    type: 'file' | 'folder';
    path: string;
    callback: (name: string, lang: string) => void;
}

export function App() {
    const [isOpenProjectModalOpen, setIsOpenProjectModalOpen] = useState<boolean>(true);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState<boolean>(false);

    const [isCreateFileOrFolderModalOpen, setIsCreateFileOrFolderModalOpen] = useState<CreateFileOrFolderModalState | null>(null);

    const [backendURL, setBackendURL] = useState<string | null>(null);
    const [wsURL, setWsURL] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
    const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
    const [retry, setRetry] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [canRunCurrentFile, setCanRunCurrentFile] = useState<boolean>(false);

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const showError = (msg: string) => {
        setError(msg);
        setTimeout(() => setError(null), 5000);
    }

    useEffect(() => {
        if (retry > 10) {
            setLoadingStatus("Failed to load configuration after multiple attempts. Please check your connection configurations on backend and try again.");
            return;
        }

        setLoadingStatus("Loading configuration...");
        fetch('/backend.txt')
            .then(res => res.text())
            .then(url => {
                let [backend, ws] = url.trim().split('\n');

                fetch(`${backend.trim()}/`).then(res => {
                    if (!res.ok) {
                        console.error('Backend response check failed:', res.statusText);
                        setLoadingStatus(`Backend is not responding. Retrying (${retry})...`);
                        setTimeout(() => setRetry(prev => prev + 1), 3000);
                        return;
                    }

                    setBackendURL(backend.trim());
                    setWsURL(ws.trim());
                    setIsLoading(false);
                }).catch(err => {
                    console.error('Backend response check error:', err);
                    setLoadingStatus(`Backend is not responding. Retrying (${retry})...`);
                    setTimeout(() => setRetry(prev => prev + 1), 3000);
                    return;
                });
            })
            .catch(err => {
                console.error('Error loading configuration:', err);
                setLoadingStatus(`Failed to load configuration. Retrying (${retry})...`);
                setTimeout(() => setRetry(prev => prev + 1), 3000);
            });
    }, [retry]);

    const handleProjectSelect = (project: Project) => {
        console.log('Selected project:', project);
        setSelectedProject(project);
        setIsOpenProjectModalOpen(false);
    };

    const handleBackToOpenPrjModal = () => {
        setIsCreateProjectModalOpen(false)
        setIsOpenProjectModalOpen(true);
    }

    const handleNewProject = () => {
        setIsOpenProjectModalOpen(false);
        setIsCreateProjectModalOpen(true);
    }

    const handleCreateProject = (data: { name: string, description: string }) => {
        console.log('Create project:', data);
        setIsCreateProjectModalOpen(false);
    }

    const openOpenProjectModal = () => {
        setIsOpenProjectModalOpen(true);
    }

    const handleOnCreateCreateFileOrFolderModal = (name: string, lang: string) => {
        isCreateFileOrFolderModalOpen.callback(name, lang);
        setIsCreateFileOrFolderModalOpen(null);
    }

    return (
        <AppContext.Provider value={{
            setIsGlobalLoading, backendURL, wsURL, openOpenProjectModal, showError, setIsCreateFileOrFolderModalOpen, setCanRunCurrentFile
        }}>
            {isLoading ? (
                <LoadingScreen text={loadingStatus}/>
            ) : (
                <>
                    {isGlobalLoading && <LoadingScreen/>}
                    <Toast message={error} onClose={() => setError(null)} />
                    <Home project={selectedProject} canRunCurrentFile={canRunCurrentFile}/>
                    <OpenProjectModal
                        isOpen={isOpenProjectModalOpen}
                        onSelect={handleProjectSelect}
                        onNewProject={handleNewProject}
                    />
                    <CreateProjectModal
                        isOpen={isCreateProjectModalOpen}
                        onBack={handleBackToOpenPrjModal}
                        onCreate={handleCreateProject}
                    />
                    <CreateFileOrFolder isOpen={!!isCreateFileOrFolderModalOpen}
                                        item={isCreateFileOrFolderModalOpen ?? null}
                                        onClose={() => setIsCreateFileOrFolderModalOpen(null)}
                                        onCreate={handleOnCreateCreateFileOrFolderModal}
                    />
                </>
            )}
        </AppContext.Provider>
    );
}

render(<App/>, document.getElementById('app')!);