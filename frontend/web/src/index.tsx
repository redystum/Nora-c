import {render} from 'preact';
import {useState, useEffect} from "preact/hooks";
import './style.css';
import {Home} from './pages/home';
import {OpenProjectModal} from "./components/openProjetcModal";
import {CreateProjectModal} from "./components/createProjectModal";
import type {Project} from "./components/openProjetcModal";
import AppContext from "./AppContext";
import {LoadingScreen} from "./components/LoadingScreen";

export function App() {
    const [isOpenProjectModalOpen, setIsOpenProjectModalOpen] = useState<boolean>(true);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState<boolean>(false);

    const [backendURL, setBackendURL] = useState<string | null>(null);
    const [wsURL, setWsURL] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
    const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
    const [retry, setRetry] = useState<number>(1);

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

    return (
        <AppContext.Provider value={{setIsGlobalLoading, backendURL, wsURL}}>
            {isLoading ? (
                <LoadingScreen text={loadingStatus}/>
            ) : (
                <>
                    {isGlobalLoading && <LoadingScreen/>}
                    <Home/>
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
                </>
            )}
        </AppContext.Provider>
    );
}

render(<App/>, document.getElementById('app')!);