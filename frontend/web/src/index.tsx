import {render} from 'preact';
import './style.css';
import {Home} from './pages/home';
import {OpenProjectModal} from "./components/openProjetcModal";
import {CreateProjectModal} from "./components/createProjectModal";
import {useState} from "preact/hooks";

import type {Project} from "./components/openProjetcModal";

export function App() {
    const [isOpenProjectModalOpen, setIsOpenProjectModalOpen] = useState<boolean>(true);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState<boolean>(false);

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

    const handleCreateProject = (data: {name: string, description: string}) => {
        console.log('Create project:', data);
        setIsCreateProjectModalOpen(false);
    }

    return (
        <>
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
    );
}

render(<App/>, document.getElementById('app')!);
