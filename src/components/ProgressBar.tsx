interface ProgressBarProps {
    current: number;
    total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
    const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                    Kelime {current + 1} / {total}
                </span>
                <span className="text-sm font-medium text-indigo-600">
                    %{Math.round(progress)}
                </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
