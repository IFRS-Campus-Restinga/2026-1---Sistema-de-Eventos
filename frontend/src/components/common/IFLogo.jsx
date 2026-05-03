export default function IFLogo({
    corCirculo = '#CD191E',
    corRect = '#2F9E41',
    corTexto = '#000',
    estado = '',
    campus = '',
    width = 139,
    height = 47,
    dot = 10,
    fontFamily = 'Open Sans',
    escalaTitulo = 8,
    escalaTexto = 8,
}) {
    const escala = width / 139;
    const s = (n) => Math.round(n * escala);
    const tamaho = s(dot);
    const borda = Math.max(2 * escala, 1);
    const fontSizeMain = Math.max(Math.round(escalaTitulo * escala), 8);
    const fontSizeSub = Math.max(Math.round(escalaTexto * escala), 6);

    const forma = (left, top, background, radius = borda) => (
        <div
            style={{
                width: tamaho,
                height: tamaho,
                left: s(left),
                top: s(top),
                position: 'absolute',
                background,
                borderRadius: radius,
            }}
        />
    );

    return (
        <div
            style={{ width, height, position: 'relative' }}
            className="d-flex flex-column"
        >
            <div className="">
                {forma(12, 24, corRect)}
                {forma(12, 0, corRect)}
                {forma(0, 0, corCirculo, tamaho / 2)}
                {forma(0, 12, corRect)}
                {forma(0, 24, corRect)}
                {forma(0, 36, corRect)}
                {forma(24, 24, corRect)}
                {forma(12, 36, corRect)}
                {forma(24, 0, corRect)}
                {forma(12, 12, corRect)}
            </div>

            <div className="">
                <div
                    style={{
                        left: s(39),
                        top: s(11),
                        position: 'absolute',
                        color: corTexto,
                        fontSize: fontSizeMain,
                        fontFamily,
                        fontWeight: '700',
                    }}
                >
                    INSTITUTO FEDERAL
                </div>
                <div
                    style={{
                        left: s(39),
                        top: s(25),
                        position: 'absolute',
                        color: corTexto,
                        fontSize: fontSizeSub,
                        fontFamily,
                        fontWeight: '400',
                    }}
                >
                    {estado}
                </div>
                <div
                    style={{
                        left: s(39),
                        top: s(36),
                        position: 'absolute',
                        color: corTexto,
                        fontSize: fontSizeSub,
                        fontFamily,
                        fontWeight: '400',
                    }}
                >
                    {campus}
                </div>
            </div>
        </div>
    );
}
