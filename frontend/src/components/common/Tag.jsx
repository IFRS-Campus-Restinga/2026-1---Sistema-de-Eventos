export default function Tag({ corFundo, corTexto, texto }) {
    const wrapperClasses =
        'd-inline-flex align-items-center justify-content-center gap-2 rounded-3 px-3 py-2';
    const textClasses = 'fw-bold fs-6 text-break';

    const wrapperStyle = corFundo ? { background: corFundo } : undefined;
    const textStyle = corTexto ? { color: corTexto } : undefined;

    return (
        <div className={wrapperClasses} style={wrapperStyle}>
            <div className={textClasses} style={textStyle}>
                {texto}
            </div>
        </div>
    );
}
