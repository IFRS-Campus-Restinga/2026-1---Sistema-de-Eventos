export default function Tag({
    corFundo = '',
    corTexto = '',
    texto = '',
    className = '',
}) {
    const classes =
        'd-inline-flex align-items-center justify-content-center gap-2 rounded-3 px-2 py-1';
    const textClasses = 'fw-bold fs-6 ';

    const estiloFundo = corFundo ? { background: corFundo } : undefined;
    const estiloTexto = corTexto ? { color: corTexto } : undefined;

    return (
        <div className={className || classes} style={estiloFundo}>
            <div className={textClasses} style={estiloTexto}>
                {texto}
            </div>
        </div>
    );
}
