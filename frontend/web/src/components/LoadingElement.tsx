import Logo from '../assets/logo.png';

export function LoadingElement({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-white">
            <div className="text-center">
                <img src={Logo} alt="Logo" className="w-16 h-16 mx-auto mb-4 animate-spin-slow" />
                <h1 className="mb-4">{text}</h1>
            </div>
        </div>
    );
}