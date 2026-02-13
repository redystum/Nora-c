import Logo from '../assets/logo.png';

export function LoadingScreen({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-neutral-800/25 text-white z-50 backdrop-blur-sm">
            <div className="text-center">
                <img src={Logo} alt="Logo" className="w-28 h-28 mx-auto mb-4 animate-spin-slow" />
                <h1 className="text-xl mb-4">{text}</h1>
            </div>
        </div>
    );
}